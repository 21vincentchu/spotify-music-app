from flask import Flask, request, jsonify, redirect, session
from flask_cors import CORS
import os
import spotipy
from spotipy.oauth2 import SpotifyOAuth
from db import get_db
from stats import stats_bp
from stats_recently_played import stats_recently_played_bp
from config import Config

def upsert_user(spotify_user_data):
    """
    Insert or update user in database from Spotify OAuth data.

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

# Enable CORS for frontend - restrict to frontend domain only
frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:3000')
CORS(app,
     origins=[frontend_url],
     supports_credentials=True)

app.register_blueprint(stats_bp)
app.register_blueprint(stats_recently_played_bp)

# Initialize Spotify OAuth handler - use session-based cache instead of file
def get_sp_oauth():
    """Get SpotifyOAuth instance with session-based cache"""
    from spotipy.cache_handler import CacheFileHandler
    import tempfile
    import hashlib

    # Create a unique cache file per session
    session_id = session.get('session_id')
    if not session_id:
        session_id = os.urandom(16).hex()
        session['session_id'] = session_id

    # Use a unique cache file for each session
    cache_path = os.path.join(tempfile.gettempdir(), f'.spotipyoauthcache-{session_id}')

    return SpotifyOAuth(
        Config.SPOTIFY_CLIENT_ID,
        Config.SPOTIFY_CLIENT_SECRET,
        Config.SPOTIPY_REDIRECT_URI,
        scope=Config.SPOTIFY_SCOPE,
        cache_path=cache_path
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

@app.route('/callback')
def callback():
    '''
    Spotify oAuth callback endpoint, exchanges auth cod from spotify for an access token and return users profile

    Returns:
        redirect: redirect to home page after authentication
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

    return redirect('/')

if __name__ == '__main__':
    app.run(debug=(Config.FLASK_ENV == 'development'), host='0.0.0.0', port=Config.PORT)
