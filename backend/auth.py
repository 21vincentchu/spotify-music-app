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

    from app import get_sp_oauth
    sp_oauth = get_sp_oauth()

    if sp_oauth.is_token_expired(token_info):
        token_info = sp_oauth.refresh_access_token(token_info['refresh_token'])
        session['token_info'] = token_info

    sp = spotipy.Spotify(auth=token_info['access_token'])
    return sp, token_info
