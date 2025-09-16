from flask import Flask
from dotenv import load_dotenv  # This loads .env files that contain API keys
import requests, base64, os

load_dotenv()

app = Flask(__name__)

CLIENT_ID = os.getenv('SPOTIFY_CLIENT_ID')
CLIENT_SECRET = os.getenv('SPOTIFY_CLIENT_SECRET')

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


if __name__ == '__main__':
    token = get_spotify_token()

    # Get song
    song_response = requests.get('https://api.spotify.com/v1/tracks/0Q9kIg9o8w1XKepXWmDUmT',
        headers={'Authorization': f'Bearer {token}'})
    song = song_response.json()

    print(f"{song['name']} by {song['artists'][0]['name']}")
    
    app.run(debug=True, host='0.0.0.0', port=8000)
