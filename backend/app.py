# Standard library imports
import os
import tempfile
from threading import Thread

# Third party imports
import spotipy
from spotipy.oauth2 import SpotifyOAuth
from flask import Flask, request, jsonify, session, redirect
from flask_session import Session
from flask_cors import CORS

# Local app imports
from config import Config
from auth import get_authenticated_spotify_client
from db_functions import upsert_user, get_cached_stats_id, fetch_and_insert_all_stats
from stats_json import stat_Conversions
from stats import stats_bp
from stats_recently_played import *
from migrate import run_migrations

app = Flask(__name__)

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
app.config['SESSION_COOKIE_SAMESITE'] = 'None' if is_production else 'Lax'
app.config['SESSION_COOKIE_SECURE'] = is_production  # True in production (HTTPS required)
app.config['SESSION_COOKIE_HTTPONLY'] = False
app.config['SESSION_COOKIE_PATH'] = '/'
app.config['SESSION_COOKIE_DOMAIN'] = None if is_production else 'localhost'

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
app.config["SESSION_PERMANENT"] = False     # Sessions expire when the browser is closed
app.config["SESSION_TYPE"] = "filesystem"     # Store session data in files
Session(app)

### ----- REGISTER BLUEPRINTS ----- ###
app.register_blueprint(stats_bp)
app.register_blueprint(stats_recently_played_bp)

### ----- BACKGROUND TASKS ----- ###
def prefetch_all_stats(access_token: str, user_name: str):
    """
    Background task to prefetch all stats after login.
    Warms the cache for all 3 timeframes so stats load instantly.
    """
    try:
        sp = spotipy.Spotify(auth=access_token)

        for timeframe in ['short_term', 'medium_term', 'long_term']:
            cached = get_cached_stats_id(user_name, timeframe, max_age_hours=24)

            if not cached:
                print(f"Background prefetch: {timeframe}", flush=True)
                fetch_and_insert_all_stats(user_name, timeframe, sp)
            else:
                print(f"Cache hit for {timeframe}, skipping prefetch", flush=True)

    except Exception as e:
        print(f"Prefetch error: {e}", flush=True)

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
@app.route('/')
def index():
    '''
    home endpoint. checks for cached token, which then prompts login or display current users profile

    returns:
        str or dict: login link if not authenicated, or their profile
    '''

    sp_oauth = get_sp_oauth()

    #Checks for users cached tokens
    token_info = sp_oauth.get_cached_token()

    #redirect user to spotify login page if not token exists
    if not token_info:
        auth_url = sp_oauth.get_authorize_url()
        return f'<a href="{auth_url}">Login with Spotify</a>'
    
    session['token_info'] = token_info
    #if token exists, use for authenticated API calls
    access_token = token_info['access_token']
    sp = spotipy.Spotify(auth=access_token)
    results = sp.current_user()

    # Insert/update user in database
    userName = upsert_user(results)
    session['userName'] = userName

    #display the json
    profile_img = results['images'][0]['url'] if results.get('images') else ''
    html = f'''
        <h1>Welcome, {results['display_name']}!</h1>
        <img src="{profile_img}" alt="Profile" width="200">
        <p>Followers: {results['followers']['total']}</p>
        <p><a href="/stats">View Your Spotify Stats</a></p>
        <p><a href="{results['external_urls']['spotify']}">View on Spotify</a></p>
    '''
    return html

@app.route('/api/login')
def api_login():
    """
    Returns Spotify authorization URL for frontend to redirect user to.

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

    # Fetch top songs/artists/albums from recently played tracks
    top_songs_recent = fetch_recently_played_top_songs(sp)
    top_artists_recent = fetch_recently_played_top_artists(sp)
    top_albums_recent = fetch_recently_played_top_albums(sp)

    # Return everything as JSON
    return jsonify({
        'recent_tracks': recent_tracks,
        'listening_stats': listening_stats,
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

    token_info = sp_oauth.get_access_token(code)
    sp = spotipy.Spotify(auth=token_info['access_token'])

    # Store in session
    session['token_info'] = token_info

    # Get user data and insert/update in database
    results = sp.current_user()
    userName = upsert_user(results)
    session['userName'] = userName

    print(f"Session ID: {session.get('session_id')}")
    print(f"Session saved: {userName}")

    # Start background prefetch to warm cache
    Thread(
        target=prefetch_all_stats,
        args=(token_info['access_token'], userName),
        daemon=True
    ).start()

    return redirect(f'{Config.FRONTEND_URL}/callback?auth=success')

if __name__ == '__main__':
    app.run(debug=(Config.FLASK_ENV == 'development'), host='0.0.0.0', port=Config.PORT)
