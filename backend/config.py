import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # Flask
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
    FLASK_ENV = os.getenv('FLASK_ENV', 'development')

    # Spotify
    SPOTIFY_CLIENT_ID = os.getenv('SPOTIFY_CLIENT_ID')
    SPOTIFY_CLIENT_SECRET = os.getenv('SPOTIFY_CLIENT_SECRET')
    SPOTIPY_REDIRECT_URI = os.getenv('SPOTIPY_REDIRECT_URI', 'http://127.0.0.1:8000/callback')
    SPOTIFY_SCOPE = 'user-read-private user-read-email user-top-read user-read-recently-played user-read-playback-state user-read-currently-playing user-read-playback-position user-library-read user-library-modify playlist-read-private playlist-read-collaborative playlist-modify-public playlist-modify-private user-follow-read user-follow-modify user-modify-playback-state streaming app-remote-control ugc-image-upload'

    # Database
    MYSQL_HOST = os.getenv('MYSQL_HOST', 'db')
    MYSQL_PORT = int(os.getenv('MYSQL_PORT', '3306'))
    MYSQL_USER = os.getenv('MYSQL_USER', 'root')
    MYSQL_PASSWORD = os.getenv('MYSQL_PASSWORD', os.getenv('MYSQL_ROOT_PASSWORD', 'root'))
    MYSQL_DATABASE = os.getenv('MYSQL_DATABASE', 'spotify_app')

    # Cache
    CACHE_PATH = '.spotipyoauthcache'

    # Server
    PORT = int(os.getenv('PORT', '5000'))
