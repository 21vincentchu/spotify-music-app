from flask import Flask, request, jsonify, redirect, session
from dotenv import load_dotenv  # This loads .env files that contain API keys
import os
import spotipy
from spotipy.oauth2 import SpotifyOAuth
from db import get_db
from stats import stats_bp
from stats_recently_played import stats_recently_played_bp

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

load_dotenv()

app = Flask(__name__)
app.secret_key = "your-secret-key"
app.register_blueprint(stats_bp)
app.register_blueprint(stats_recently_played_bp)

# Configuration (NOTE: Make a '.env' file in local folder for API keys)
PORT=5000
CLIENT_ID = os.getenv('SPOTIFY_CLIENT_ID')
CLIENT_SECRET = os.getenv('SPOTIFY_CLIENT_SECRET')
SPOTIPY_REDIRECT_URI = 'http://localhost:8000/callback' #spotify redirect after after login
SCOPE = 'user-read-private user-read-email user-top-read user-read-recently-played user-read-playback-state user-read-currently-playing user-read-playback-position user-library-read user-library-modify playlist-read-private playlist-read-collaborative playlist-modify-public playlist-modify-private user-follow-read user-follow-modify user-modify-playback-state streaming app-remote-control ugc-image-upload' #permmissions to read users data
CACHE = '.spotipyoauthcache' #local file to save their auth token

#initialize spotify oAuth handler for spotify login flow
sp_oauth = SpotifyOAuth(
    CLIENT_ID,
    CLIENT_SECRET,
    SPOTIPY_REDIRECT_URI,
    scope=SCOPE,
    cache_path=CACHE
)

# Routes
@app.route('/')
def index():
    '''
    home endpoint. checks for cached token, which then prompts login or display current users profile
    
    returns:
        str or dict: login link if not authenicated, or their profile
    '''
    
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
    app.run(debug=True, host='0.0.0.0', port=PORT)
