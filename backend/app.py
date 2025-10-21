from flask import Flask, request, jsonify, session
from flask_session import Session
from flask_cors import CORS
import os
import spotipy
from spotipy.oauth2 import SpotifyOAuth
from db_functions import upsert_user
from stats_json import stat_Conversions
from stats import stats_bp
from stats_recently_played import *
from config import Config
from auth import get_authenticated_spotify_client

app = Flask(__name__)
app.secret_key = Config.SECRET_KEY
### ------ APP CONFIGURATIONS ---- ####
""" 
Session configuration for cross-origin (different ports)
Using 'Lax' instead of None for Safari compatibility in development
Safari blocks SameSite=None cookies without HTTPS
"""
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'    # Lax allows cookies on top-level navigation (like OAuth redirects)
app.config['SESSION_COOKIE_SECURE'] = False      # False for local HTTP development
app.config['SESSION_COOKIE_HTTPONLY'] = False    # False to allow JS access for debugging
app.config['SESSION_COOKIE_PATH'] = '/'
app.config['SESSION_COOKIE_DOMAIN'] = 'localhost' # Share across all localhost ports

### ----- CORS CONFIGURATION ----- ###
""" 
Enable CORS (Cross-Origin Resource Sharing) to allow frontend requests from different origin
Without this, browsers block requests from frontend (e.g., localhost:3000) to backend (localhost:5000)
supports_credentials=True allows cookies/sessions to be sent with cross-origin requests
origins specifies which domains can make requests with credentials
"""
CORS(app, supports_credentials=True, origins=[
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
])

### ----- SESSION CONFIGURATION ----- ###
app.config["SESSION_PERMANENT"] = False     # Sessions expire when the browser is closed
app.config["SESSION_TYPE"] = "filesystem"     # Store session data in files
Session(app)

### ----- REGISTER BLUEPRINTS ----- ###
app.register_blueprint(stats_bp)
app.register_blueprint(stats_recently_played_bp)

### ----- SPOTIFY OAUTH HANDLER ----- ###
def get_sp_oauth():
    """
    Create and return a SpotifyOAuth instance with per-session token caching.

    This function manages Spotify OAuth authentication by creating a unique cache file
    for each user session. This approach prevents token conflicts when multiple users
    access the application simultaneously.

    1. Checks if the current Flask session has a session_id
    2. If no session_id exists, generates a new random 16-byte hex string
    3. Creates a unique cache file path in the system temp directory using the session_id
    4. Returns a configured SpotifyOAuth instance that will store tokens in that cache file

    The cache file stores the OAuth access token, refresh token, and expiry information
    so users don't have to re-authenticate on every request.

    Returns:
        SpotifyOAuth: Configured OAuth handler with session-specific cache file

    Note:
        Uses Flask's session object to persist session_id across requests for the same user
    """
    import tempfile

    # Get or create a unique session identifier for this user's session
    # This ID is stored in Flask's session cookie and persists across requests
    session_id = session.get('session_id')
    if not session_id:
        # Generate a new random session ID (32 character hex string)
        session_id = os.urandom(16).hex()
        # Store it in the Flask session so it persists for this user
        session['session_id'] = session_id

    # Create a unique cache file path for this session's OAuth tokens
    # This prevents different users from overwriting each other's tokens
    cache_path = os.path.join(tempfile.gettempdir(), f'.spotipyoauthcache-{session_id}')

    # Return a configured SpotifyOAuth instance
    return SpotifyOAuth(
        Config.SPOTIFY_CLIENT_ID,      # Spotify app's client ID
        Config.SPOTIFY_CLIENT_SECRET,  # Spotify app's client secret
        Config.SPOTIPY_REDIRECT_URI,   # Spotify redirect after auth
        scope=Config.SPOTIFY_SCOPE,    # Permissions your app requests
        cache_path=cache_path          # Where to cache the OAuth tokens
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

    # Redirect to frontend
    from flask import redirect
    return redirect('http://localhost:3000/callback?auth=success')

if __name__ == '__main__':
    app.run(debug=(Config.FLASK_ENV == 'development'), host='0.0.0.0', port=Config.PORT)
