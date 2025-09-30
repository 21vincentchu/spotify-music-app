from flask import Flask, request, jsonify, redirect
from dotenv import load_dotenv  # This loads .env files that contain API keys
import os
import spotipy
from spotipy.oauth2 import SpotifyOAuth
from db import get_db 

load_dotenv()

app = Flask(__name__)

# Configuration (NOTE: Make a '.env' file in local folder for API keys)
PORT=8080
CLIENT_ID = os.getenv('SPOTIFY_CLIENT_ID')
CLIENT_SECRET = os.getenv('SPOTIFY_CLIENT_SECRET')
SPOTIPY_REDIRECT_URI = 'http://localhost:8080/callback' #spotify redirect after after login
SCOPE = 'user-library-read' #permmissions to read users data
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
    
    #if token exists, use for authenticated API calls
    access_token = token_info['access_token']
    sp = spotipy.Spotify(auth=access_token)
    results = sp.current_user()

    #display the json
    profile_img = results['images'][0]['url'] if results.get('images') else ''
    html = f'''
        <h1>Welcome, {results['display_name']}!</h1>
        <img src="{profile_img}" alt="Profile" width="200">
        <p>Followers: {results['followers']['total']}</p>
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
    results = sp.current_user()
    return redirect('/')

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=PORT)
