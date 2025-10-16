from flask import Flask, request, jsonify, redirect, session
from flask_cors import CORS
import os
import spotipy
from spotipy.oauth2 import SpotifyOAuth
from db import get_db
from jsonStats import stat_Conversions
from stats import stats_bp
from stats_recently_played import stats_recently_played_bp
from config import Config

def upsert_user(spotify_user_data):
    """
    Insert or update user in database from Spotify OAuth data. Checks for duplicates

    Args:
        spotify_user_data: Dictionary from Spotify API current_user() call

    Returns:
        userName: The userName (Spotify ID) of the user
    """
    conn = get_db()
    cursor = conn.cursor()

    try:
        userName = spotify_user_data['id']
        displayName = spotify_user_data.get('display_name', '')
        profilePicture = spotify_user_data['images'][0]['url'] if spotify_user_data.get('images') else None

        # Insert or update user (ON DUPLICATE KEY UPDATE handles existing users)
        cursor.execute("""
            INSERT INTO User (userName, spotifyId, displayName, profilePicture)
            VALUES (%s, %s, %s, %s)
            ON DUPLICATE KEY UPDATE
                displayName = VALUES(displayName),
                profilePicture = VALUES(profilePicture)
        """, (userName, userName, displayName, profilePicture))

        conn.commit()
        return userName
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        cursor.close()
        conn.close()

app = Flask(__name__)
app.secret_key = Config.SECRET_KEY

# Enable CORS (Cross-Origin Resource Sharing) to allow frontend requests from different origin
# Without this, browsers block requests from frontend (e.g., localhost:3000) to backend (localhost:5000)
# supports_credentials=True allows cookies/sessions to be sent with cross-origin requests
CORS(app, supports_credentials=True)

app.register_blueprint(stats_bp)
app.register_blueprint(stats_recently_played_bp)

# Initialize Spotify OAuth handler - use session-based cache instead of file
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

# Routes
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


@app.route('/callback')
def callback():
    '''
    Spotify oAuth callback endpoint, exchanges auth cod from spotify for an access token and return users profile

    Returns:
        redirect: redirect to frontend after authentication
    '''
    sp_oauth = get_sp_oauth()

    code = request.args.get('code')
    token_info = sp_oauth.get_access_token(code)
    sp = spotipy.Spotify(auth=token_info['access_token'])
    session['token_info'] = token_info

    # Get user data and insert/update in database
    results = sp.current_user()
    userName = upsert_user(results)
    session['userName'] = userName

    # Redirect to frontend (adjust URL based on where frontend is running)
    frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:3000')
    return redirect(frontend_url)

if __name__ == '__main__':
    app.run(debug=(Config.FLASK_ENV == 'development'), host='0.0.0.0', port=Config.PORT)
