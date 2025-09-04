from dotenv import load_dotenv  # This loads .env files
load_dotenv()


import requests,base64, os


CLIENT_ID = os.getenv('SPOTIFY_CLIENT_ID')
CLIENT_SECRET = os.getenv('SPOTIFY_CLIENT_SECRET')

def get_token():
    '''
    https://developer.spotify.com/documentation/web-api/tutorials/client-credentials-flow
    Get access token from Spotify using Client Credentials flow.
    - encodes CLIENT_ID:CLIENT_SECRET as base64 for http basic auth format
    - posts to the api with encoded credentials
   
   Returns:
       str: Access token for making authenticated API requests
       
   Raises:
       KeyError: If API response doesn't contain 'access_token'
       requests.RequestException: If HTTP request fails
    
    '''
    credentials = base64.b64encode(f"{CLIENT_ID}:{CLIENT_SECRET}".encode()).decode()
    response = requests.post('https://accounts.spotify.com/api/token', 
        headers={
            'Authorization': f'Basic {credentials}',
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        data='grant_type=client_credentials')
    
    print(f"Status code: {response.status_code}")
    print(f"Response text: {response.text}")
    
    if response.status_code != 200:
        raise Exception(f"Failed to get token: {response.status_code} - {response.text}")
    
    return response.json()['access_token']

token = get_token()

# Get song
song_response = requests.get('https://api.spotify.com/v1/tracks/0Q9kIg9o8w1XKepXWmDUmT',
    headers={'Authorization': f'Bearer {token}'})
song = song_response.json()

print(f"{song['name']} by {song['artists'][0]['name']}")
