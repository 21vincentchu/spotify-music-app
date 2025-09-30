from flask import Flask, request
from dotenv import load_dotenv  # This loads .env files that contain API keys
import requests, base64, os
import sys
import spotipy
from spotipy.oauth2 import SpotifyOAuth 

load_dotenv()

app = Flask(__name__)

port=8080
CLIENT_ID = os.getenv('SPOTIFY_CLIENT_ID')
CLIENT_SECRET = os.getenv('SPOTIFY_CLIENT_SECRET')
SPOTIPY_REDIRECT_URI = 'http://localhost:8080/callback'
SCOPE = 'user-library-read'
CACHE = '.spotipyoauthcache'

sp_oauth = SpotifyOAuth(CLIENT_ID, CLIENT_SECRET, SPOTIPY_REDIRECT_URI, scope=SCOPE, cache_path=CACHE)

@app.route('/')
def index():
    token_info = sp_oauth.get_cached_token()

    if not token_info:
        auth_url = sp_oauth.get_authorize_url()
        return f'<a href="{auth_url}">Login with Spotify</a>'
    
    access_token = token_info['access_token']
    sp = spotipy.Spotify(auth=access_token)
    results = sp.current_user()
    return results


@app.route('/callback')
def callback():
    code = request.args.get('code')
    token_info = sp_oauth.get_access_token(code)
    sp = spotipy.Spotify(auth=token_info['access_token'])
    results = sp.current_user()
    return results
   


def get_spotify_token():
    '''
    https://developer.spotify.com/documentation/web-api/tutorials/client-credentials-flow
    Get Spotify API access token using Client Credentials flow.
    
    Returns:
        str: Access token
        
    Raises:
        Exception: If authentication fails
    '''
    credentials = base64.b64encode(f"{CLIENT_ID}:{CLIENT_SECRET}".encode()).decode() # - encodes CLIENT_ID:CLIENT_SECRET as base64 for http basic auth format

    response = requests.post('https://accounts.spotify.com/api/token', #post request to spotify token endpoint
        headers= #sending over form data
        {
            'Authorization': f'Basic {credentials}',
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        data='grant_type=client_credentials') #type of token from spotify
        
    if response.status_code != 200: #if request did not work
        raise Exception(f"Failed to get token: {response.status_code} - {response.text}")
    
    return response.json()['access_token']

    # Get song
    song_response = requests.get('https://api.spotify.com/v1/tracks/0Q9kIg9o8w1XKepXWmDUmT',
        headers={'Authorization': f'Bearer {token}'})
    song = song_response.json()

    print(f"{song['name']} by {song['artists'][0]['name']}")


app.run(debug=True, host='0.0.0.0', port=port)


