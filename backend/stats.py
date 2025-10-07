from flask import Blueprint, session, redirect
import spotipy
from spotipy.oauth2 import SpotifyOAuth
import os

stats_bp = Blueprint('stats', __name__)

def get_authenticated_spotify_client():
    """Get authenticated Spotify client, refreshing token if needed."""
    token_info = session.get('token_info')
    if not token_info:
        return None, None

    sp_oauth = SpotifyOAuth(
        client_id=os.getenv("SPOTIFY_CLIENT_ID"),
        client_secret=os.getenv("SPOTIFY_CLIENT_SECRET"),
        redirect_uri="http://localhost:8080/callback",
        scope='user-read-private user-read-email user-top-read user-read-recently-played user-read-playback-state user-read-currently-playing user-read-playback-position user-library-read user-library-modify playlist-read-private playlist-read-collaborative playlist-modify-public playlist-modify-private user-follow-read user-follow-modify user-modify-playback-state streaming app-remote-control ugc-image-upload'
    )

    if sp_oauth.is_token_expired(token_info):
        token_info = sp_oauth.refresh_access_token(token_info['refresh_token'])
        session['token_info'] = token_info

    sp = spotipy.Spotify(auth=token_info['access_token'])
    return sp, token_info

def fetch_all_top_tracks(sp: spotipy.Spotify, time_range: str, batch_size: int = 50) -> list:
    """
    Fetch all top tracks for a given time range using pagination.

    Args:
        sp: Authenticated Spotify client instance
        time_range: 'short_term' (4 weeks), 'medium_term' (6 months), or 'long_term' (several years)
        batch_size: Number of items to fetch per request (default 50, max 50)

    Returns:
        List of track objects from Spotify API
    """
    tracks = []
    offset = 0

    while True:
        batch = sp.current_user_top_tracks(limit=batch_size, offset=offset, time_range=time_range)
        tracks.extend(batch['items'])

        if len(batch['items']) < batch_size:
            break

        offset += batch_size

    return tracks

@stats_bp.route('/stats')
def stats():
    sp, token_info = get_authenticated_spotify_client()
    if not sp:
        return redirect('/')

    user_profile = sp.current_user()

    # ========== TOP ARTISTS AND TRACKS (LAST 4 WEEKS) ==========
    # Fetch top 50 artists from the past ~4 weeks
    top_artists_week = sp.current_user_top_artists(limit=50, time_range='short_term')

    # Fetch ALL top tracks from the past ~4 weeks using pagination
    top_tracks_week = fetch_all_top_tracks(sp, 'short_term')

    # ========== TOP ARTISTS AND TRACKS (LAST 6 MONTHS) ==========
    # Fetch top 50 artists from the past ~6 months
    top_artists_month = sp.current_user_top_artists(limit=50, time_range='medium_term')

    # Fetch ALL top tracks from the past ~6 months using pagination
    top_tracks_month = fetch_all_top_tracks(sp, 'medium_term')

    # ========== TOP ARTISTS AND TRACKS (ALL TIME / SEVERAL YEARS) ==========
    # Fetch top 50 artists from the past several years
    top_artists_year = sp.current_user_top_artists(limit=50, time_range='long_term')

    # Fetch ALL top tracks from the past several years using pagination
    top_tracks_year = fetch_all_top_tracks(sp, 'long_term')

    # ========== BUILD HTML RESPONSE ==========
    html = "<h1>Your Spotify Stats</h1>"

    # Display top artists from the past 4 weeks
    html += "<h2>Top Artists (Week)</h2><ul>"
    for artist in top_artists_week['items']:
        html += f"<li>{artist['name']}</li>"
    html += "</ul>"

    html += "<h2>Top Tracks (Week)</h2><ul>"
    for track in top_tracks_week:
        html += f"<li>{track['name']} by {track['artists'][0]['name']}</li>"
    html += "</ul>"

    html += "<h2>Top Artists (Month)</h2><ul>"
    for artist in top_artists_month['items']:
        html += f"<li>{artist['name']}</li>"
    html += "</ul>"

    html += "<h2>Top Tracks (Month)</h2><ul>"
    for track in top_tracks_month:
        html += f"<li>{track['name']} by {track['artists'][0]['name']}</li>"
    html += "</ul>"

    html += "<h2>Top Artists (Year)</h2><ul>"
    for artist in top_artists_year['items']:
        html += f"<li>{artist['name']}</li>"
    html += "</ul>"

    html += "<h2>Top Tracks (Year)</h2><ul>"
    for track in top_tracks_year:
        html += f"<li>{track['name']} by {track['artists'][0]['name']}</li>"
    html += "</ul>"

    html += "<p><a href='/'>Back to Profile</a></p>"
    return html