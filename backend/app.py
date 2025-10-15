from flask import Flask, request, jsonify, redirect, session, send_from_directory
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

app = Flask(__name__, static_folder='../frontend/reverb-client/build', static_url_path='')
app.secret_key = Config.SECRET_KEY

# No CORS needed when serving frontend from same origin
# CORS only needed in development when React runs on localhost:3000
if Config.FLASK_ENV == 'development':
    CORS(app, origins=['http://localhost:3000'], supports_credentials=True)

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

# API Routes (prefixed to avoid conflicts with React routes)
@app.route('/api/auth')
def auth_check():
    '''
    Check if user is authenticated
    '''
    sp_oauth = get_sp_oauth()
    token_info = sp_oauth.get_cached_token()

    if not token_info:
        auth_url = sp_oauth.get_authorize_url()
        return jsonify({'authenticated': False, 'auth_url': auth_url})

    session['token_info'] = token_info
    access_token = token_info['access_token']
    sp = spotipy.Spotify(auth=access_token)
    results = sp.current_user()

    # Insert/update user in database
    userName = upsert_user(results)
    session['userName'] = userName

    return jsonify({'authenticated': True, 'user': results})

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

# Serve React App - catch-all route (must be last)
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_react(path):
    '''
    Serve React app for all non-API routes
    '''
    if path != "" and os.path.exists(app.static_folder + '/' + path):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    app.run(debug=(Config.FLASK_ENV == 'development'), host='0.0.0.0', port=Config.PORT)
