# Standard library imports
import os
import tempfile
from threading import Thread

# Third party imports
import spotipy
from spotipy.oauth2 import SpotifyOAuth
from flask import Flask, request, jsonify, session, redirect, send_from_directory
from flask_cors import CORS

# Local app imports
from config import Config
from auth import get_authenticated_spotify_client
from db_functions import upsert_user, get_cached_stats_id
from stats_json import stat_Conversions
from stats import stats_bp
from stats_recently_played import *
from migrate import run_migrations
from scheduler import init_scheduler
from background_tasks import quick_prefetch_on_login, prefetch_all_stats
from friends_routes import friends_bp
from profile_routes import profile_bp
from featured_songs_route import featured_songs_bp
from featured_artists_route import featured_artists_bp
from featured_albums_route import featured_albums_bp

# Configure Flask to serve React's static files
app = Flask(__name__, static_folder='frontend_build/static', static_url_path='/static')

# Run database migrations on startup
try:
    run_migrations()
except Exception as e:
    print(f"Warning: Migration failed - {e}")
app.secret_key = Config.SECRET_KEY

### ------ APP CONFIGURATIONS ---- ####
"""
Session configuration for cross-origin (different ports)
Using 'Lax' instead of None for Safari compatibility in development
"""
# Set session cookie configuration based on environment
is_production = Config.FLASK_ENV == 'production'
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'  # Same domain, use Lax
app.config['SESSION_COOKIE_SECURE'] = is_production  # True in production (HTTPS required)
app.config['SESSION_COOKIE_HTTPONLY'] = False
app.config['SESSION_COOKIE_PATH'] = '/'
app.config['SESSION_COOKIE_DOMAIN'] = None  # Let browser handle it

### ----- CORS CONFIGURATION ----- ###
"""
Enable CORS (Cross-Origin Resource Sharing) to allow frontend requests from different origin
Without this, browsers block requests from frontend (e.g., localhost:3000) to backend (localhost:5000)
supports_credentials=True allows cookies/sessions to be sent with cross-origin requests
origins specifies which domains can make requests with credentials
"""
# Build allowed origins list (always include local for development)
allowed_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
]

# Add production frontend URL if configured
if Config.FRONTEND_URL and Config.FRONTEND_URL not in allowed_origins:
    allowed_origins.append(Config.FRONTEND_URL)

CORS(app, supports_credentials=True, origins=allowed_origins)

### ----- SESSION CONFIGURATION ----- ###
# Use Flask's built-in sessions (signed cookies) - works across multiple containers
app.config["SESSION_PERMANENT"] = False

### ----- REGISTER BLUEPRINTS ----- ###
app.register_blueprint(stats_bp)
app.register_blueprint(stats_recently_played_bp)
app.register_blueprint(friends_bp)
app.register_blueprint(profile_bp)
app.register_blueprint(featured_songs_bp)
app.register_blueprint(featured_artists_bp)
app.register_blueprint(featured_albums_bp)

### ----- INITIALIZE SCHEDULER ----- ###
# Start background scheduler for weekly stats refresh
init_scheduler()

### ----- SPOTIFY OAUTH HANDLER ----- ###
def get_sp_oauth():
    """
    Creates SpotifyOAuth instance with per-session token caching.
    Prevents token conflicts when multiple users access simultaneously.
    """
    session_id = session.get('session_id')
    if not session_id:
        session_id = os.urandom(16).hex()
        session['session_id'] = session_id

    cache_path = os.path.join(tempfile.gettempdir(), f'.spotipyoauthcache-{session_id}')

    return SpotifyOAuth(
        Config.SPOTIFY_CLIENT_ID,
        Config.SPOTIFY_CLIENT_SECRET,
        Config.SPOTIPY_REDIRECT_URI,
        scope=Config.SPOTIFY_SCOPE,
        cache_path=cache_path
    )

### ----- FLASK ROUTES ----- ###
@app.route('/api/login')
def api_login():
    """
    Returns Spotify authorization URL for frontend to redirect user to.

    This is the ENTRY POINT for the OAuth login flow.
    Frontend calls this endpoint to get the Spotify authorization URL,
    then redirects the user to that URL to authorize the app.

    Flow:
        1. Frontend calls GET /api/login
        2. Backend generates Spotify auth URL with required scopes
        3. Backend returns {'auth_url': 'https://accounts.spotify.com/authorize?...'}
        4. Frontend redirects user to that URL
        5. User authorizes on Spotify
        6. Spotify redirects back to /callback

    Returns:
        JSON: {'auth_url': 'https://accounts.spotify.com/authorize?...'}
    """
    sp_oauth = get_sp_oauth()
    auth_url = sp_oauth.get_authorize_url()
    return jsonify({'auth_url': auth_url})

@app.route('/api/logout', methods=['POST'])
def api_logout():
    '''
    1. retrieves current session id from Flask session
    2. removes corresponding cache
    3. clears all keys in flask session
    4. return JSON response confirming login
    '''
    session_id = session.get('session_id')
    if session_id:
        cache_path = os.path.join(tempfile.gettempdir(), f'.spotipyoauthcache-{session_id}')
        if os.path.exists(cache_path):
            try:
                os.remove(cache_path)
                print(f"Removed Spotify cache file: {cache_path}")
            except Exception as e:
                print(f"Could not remove cache file: {e}")

        session_keys = list(session.keys())
        for key in session_keys:
            session.pop(key, None)

        print("successful clearing of session")
        return jsonify({'message': 'logged out sucessfully', 'authenticated': False})
    else:
        return jsonify({'message': 'log out failed', 'authenticated': True}), 400


@app.route('/api/auth/status')
def auth_status():
    """Check if user is authenticated"""
    print(f"=== AUTH STATUS CHECK ===")
    print(f"Request from: {request.remote_addr}")
    print(f"Session ID: {session.get('session_id')}")
    print(f"Session contents: {dict(session)}")

    token_info = session.get('token_info')

    if token_info:
        print(f"✓ Authenticated as: {session.get('userName')}")
        return jsonify({
            'authenticated': True,
            'userName': session.get('userName')
        })

    print("✗ Not authenticated - no token_info in session")
    return jsonify({'authenticated': False})

@app.route('/api/scheduler/test')
def test_scheduler():
    """Manually trigger the scheduler for testing purposes."""
    try:
        from scheduler import scheduled_stats_refresh
        # Run in a background thread to avoid blocking the request
        thread = Thread(target=scheduled_stats_refresh)
        thread.daemon = True
        thread.start()
        return jsonify({
            'message': 'Scheduler job triggered manually',
            'status': 'running'
        })
    except Exception as e:
        return jsonify({
            'message': 'Failed to trigger scheduler',
            'error': str(e)
        }), 500

@app.route('/api/top-songs/<time_range>')
def top_songs(time_range):
    token_info = session.get('token_info')
    if not token_info:
        return jsonify({'error': 'Not authenticated'}), 401

    sp = spotipy.Spotify(auth=token_info['access_token'])
    return stat_Conversions.fetch_all_top_songs_Jsonify(sp, time_range)

@app.route('/api/top-artists/<time_range>')
def top_artists(time_range):
    token_info = session.get('token_info')
    if not token_info:
        return jsonify({'error': 'Not authenticated'}), 401

    sp = spotipy.Spotify(auth=token_info['access_token'])
    return stat_Conversions.fetch_all_top_artists_Jsonify(sp, time_range)

@app.route('/api/top-albums/<time_range>')
def top_albums(time_range):
    token_info = session.get('token_info')
    if not token_info:
        return jsonify({'error': 'Not authenticated'}), 401

    sp = spotipy.Spotify(auth=token_info['access_token'])
    return stat_Conversions.fetch_all_top_albums(sp, time_range)

@app.route('/api/recently-played')
def api_recently_played():
    """API route to return all recently played stats as JSON."""
    sp, token_info = get_authenticated_spotify_client()
    if not sp:
        return jsonify({'error': 'Not authenticated'}), 401

    # Fetch raw recently played data (max 50 tracks)
    recent_tracks = fetch_recently_played_tracks(sp)

    # Calculate listening statistics
    listening_stats = calculate_listening_minutes(recent_tracks)

    # Fetch top genre from recent tracks
    genre_stats = fetch_top_genres_from_recent(sp, recent_tracks)

    # Fetch top songs/artists/albums from recently played tracks
    top_songs_recent = fetch_recently_played_top_songs(sp)
    top_artists_recent = fetch_recently_played_top_artists(sp)
    top_albums_recent = fetch_recently_played_top_albums(sp)

    # Return everything as JSON
    return jsonify({
        'recent_tracks': recent_tracks,
        'listening_stats': listening_stats,
        'genre_stats': genre_stats,
        'top_songs': top_songs_recent,
        'top_artists': top_artists_recent,
        'top_albums': top_albums_recent
    })

@app.route('/callback')
def callback():
    '''
    Spotify oAuth callback endpoint - saves auth and redirects with session established
    '''
    print("=== CALLBACK ROUTE HIT ===")
    print(f"Request from: {request.remote_addr}")

    sp_oauth = get_sp_oauth()
    code = request.args.get('code')

    # If no code, this is not from Spotify - let React handle it
    if not code:
        print("No code parameter - serving React app")
        frontend_folder = os.path.join(os.path.dirname(__file__), 'frontend_build')
        return send_from_directory(frontend_folder, 'index.html')

    token_info = sp_oauth.get_access_token(code)
    sp = spotipy.Spotify(auth=token_info['access_token'])

    # Store in session
    session['token_info'] = token_info

    # Get user data and insert/update in database (including refresh token)
    results = sp.current_user()
    refresh_token = token_info.get('refresh_token')
    userName = upsert_user(results, refresh_token=refresh_token)
    session['userName'] = userName

    print(f"Session ID: {session.get('session_id')}")
    print(f"Session saved: {userName}")

    # Check if user has ANY stats in database BEFORE running quick pull
    # This determines if they're a brand new user
    has_existing_stats = any([
        get_cached_stats_id(userName, 'short_term', max_age_hours=999999),
        get_cached_stats_id(userName, 'medium_term', max_age_hours=999999),
        get_cached_stats_id(userName, 'long_term', max_age_hours=999999)
    ])

    # Quick pull (foreground) - limited to 150, fast
    # Runs for ALL users so they see results immediately
    quick_prefetch_on_login(token_info['access_token'], userName)

    # Full pull (background thread) - ONLY for brand new users
    # Runs comprehensive pull including albums (takes 2-3 minutes)
    if not has_existing_stats:
        print(f"[NEW USER] Starting full pull for brand new user: {userName}", flush=True)
        Thread(
            target=prefetch_all_stats,
            args=(token_info['access_token'], userName),
            daemon=True
        ).start()
    else:
        print(f"[EXISTING USER] Skipping full pull, weekly scheduler will handle it", flush=True)

    frontend_url = Config.FRONTEND_URL.rstrip('/')
    return redirect(f'{frontend_url}/callback?auth=success')

### ----- SERVE REACT FRONTEND ----- ###
# This must be LAST so /api routes are matched first
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_react(path):
    '''Serve React frontend for all non-API routes'''
    frontend_folder = os.path.join(os.path.dirname(__file__), 'frontend_build')

    print(f"Requested path: {path}")
    print(f"Frontend folder: {frontend_folder}")

    # If path is provided and file exists, serve it
    if path:
        file_path = os.path.join(frontend_folder, path)
        print(f"Looking for file: {file_path}")
        print(f"File exists: {os.path.exists(file_path)}")
        if os.path.exists(file_path):
            return send_from_directory(frontend_folder, path)

    # Otherwise serve index.html (for React Router)
    return send_from_directory(frontend_folder, 'index.html')

if __name__ == '__main__':
    app.run(debug=(Config.FLASK_ENV == 'development'), host='0.0.0.0', port=Config.PORT)
