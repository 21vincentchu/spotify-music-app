"""
Shared authentication utilities for Spotify API.

This module provides helper functions for routes that need to make authenticated
Spotify API calls. It handles token management and automatic refresh.

Purpose:
    - Provides authenticated Spotify clients for API routes (e.g., /api/top-songs)
    - Automatically refreshes expired tokens without manual intervention
    - Centralizes token validation and refresh logic

Note:
    The initial OAuth login flow (user authorization) is handled in app.py.
    This module is used AFTER the user has already logged in and we have a token.
"""
from flask import session
import spotipy

def get_authenticated_spotify_client():
    """
    Get authenticated Spotify client, refreshing token if needed.

    Flow:
        1. Retrieves token_info from Flask session
        2. Uses the same SpotifyOAuth config as app.py (via get_sp_oauth)
        3. Checks if token is expired
        4. If expired, automatically refreshes it using the refresh_token
        5. Returns authenticated spotipy.Spotify client

    Returns:
        tuple: (spotipy.Spotify client, token_info dict) or (None, None) if not authenticated
    """
    token_info = session.get('token_info')
    if not token_info:
        return None, None

    sp_oauth = SpotifyOAuth(
        client_id=os.getenv("SPOTIFY_CLIENT_ID"),
        client_secret=os.getenv("SPOTIFY_CLIENT_SECRET"),
        redirect_uri="http://localhost:8000/callback",
        scope='user-read-private user-read-email user-top-read user-read-recently-played user-read-playback-state user-read-currently-playing user-read-playback-position user-library-read user-library-modify playlist-read-private playlist-read-collaborative playlist-modify-public playlist-modify-private user-follow-read user-follow-modify user-modify-playback-state streaming app-remote-control ugc-image-upload'
    )

    if sp_oauth.is_token_expired(token_info):
        token_info = sp_oauth.refresh_access_token(token_info['refresh_token'])
        session['token_info'] = token_info

    sp = spotipy.Spotify(auth=token_info['access_token'])
    return sp, token_info
