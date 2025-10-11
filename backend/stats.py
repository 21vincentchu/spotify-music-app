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

def fetch_all_top_songs(sp: spotipy.Spotify, time_range: str, batch_size: int = 50) -> list:
    """
    Fetch all top songs for a given time range and extract data for TopSong table.

    Args:
        sp: Authenticated Spotify client instance
        time_range: 'short_term' (4 weeks), 'medium_term' (6 months), or 'long_term' (several years)
        batch_size: Number of items to fetch per request (default 50, max 50)

    Returns:
        List of dictionaries containing song data formatted for database insertion:
        {
            'songName': str,
            'artistName': str,
            'spotifyTrackId': str,
            'rank': int,
            'imageUrl': str,
            'playCount': int (defaults to 0 as Spotify doesn't provide this)
        }
    """
    songs = []
    offset = 0
    rank = 1

    while True:
        batch = sp.current_user_top_tracks(limit=batch_size, offset=offset, time_range=time_range)

        for track in batch['items']:
            song_data = {
                'songName': track['name'],
                'artistName': track['artists'][0]['name'] if track.get('artists') else 'Unknown Artist',
                'spotifyTrackId': track['id'],
                'rank': rank,
                'imageUrl': track['album']['images'][0]['url'] if track.get('album', {}).get('images') else None,
                'playCount': 0  # Spotify API doesn't provide play counts for top tracks
            }
            songs.append(song_data)
            rank += 1

        # Check to see if we got all available tracks
        if len(batch['items']) < batch_size:
            break

        offset += batch_size

    return songs

# def insert_top_songs_to_db(stats_id: int, songs: list) -> None:
#     """
#     Insert top songs data into the TopSong table.

#     Args:
#         stats_id: The statsID foreign key from the Stats table
#         songs: List of song dictionaries from fetch_all_top_songs()
#     """
#     from db import get_db

#     conn = get_db()
#     cursor = conn.cursor()

#     try:
#         for song in songs:
#             cursor.execute("""
#                 INSERT INTO TopSong (statsID, songName, artistName, spotifyTrackId, rank, playCount, imageUrl)
#                 VALUES (%s, %s, %s, %s, %s, %s, %s)
#             """, (
#                 stats_id,
#                 song['songName'],
#                 song['artistName'],
#                 song['spotifyTrackId'],
#                 song['rank'],
#                 song['playCount'],
#                 song['imageUrl']
#             ))

#         conn.commit()
#     except Exception as e:
#         conn.rollback()
#         raise e
#     finally:
#         cursor.close()
#         conn.close()

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

    # TEST: Fetch formatted song data for database
    top_songs_week = fetch_all_top_songs(sp, 'short_term')

    # ========== TOP ARTISTS AND TRACKS (LAST 6 MONTHS) ==========
    # Fetch top 50 artists from the past ~6 months
    # top_artists_month = sp.current_user_top_artists(limit=50, time_range='medium_term')

    # Fetch ALL top tracks from the past ~6 months using pagination
    # top_tracks_month = fetch_all_top_tracks(sp, 'medium_term')

    # ========== TOP ARTISTS AND TRACKS (ALL TIME / SEVERAL YEARS) ==========
    # Fetch top 50 artists from the past several years
    # top_artists_year = sp.current_user_top_artists(limit=50, time_range='long_term')


    # Fetch ALL top tracks from the past several years using pagination
    #top_tracks_year = fetch_all_top_tracks(sp, 'long_term')

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

    # TEST: Display formatted song data
    html += "<h2>TEST: Formatted Top Songs Data (Week)</h2>"
    html += "<table border='1' cellpadding='5' cellspacing='0' style='border-collapse: collapse;'>"
    html += "<tr><th>Rank</th><th>Song Name</th><th>Artist</th><th>Spotify ID</th><th>Image URL</th><th>Play Count</th></tr>"
    for song in top_songs_week[:10]:  # Show first 10 for testing
        img_preview = song['imageUrl'][:50] + "..." if song['imageUrl'] else "None"
        html += f"<tr><td>{song['rank']}</td><td>{song['songName']}</td><td>{song['artistName']}</td><td>{song['spotifyTrackId']}</td><td>{img_preview}</td><td>{song['playCount']}</td></tr>"
    html += "</table>"
    html += f"<p><strong>Total songs fetched:</strong> {len(top_songs_week)}</p>"

    # html += "<h2>Top Artists (Month)</h2><ul>"
    # for artist in top_artists_month['items']:
    #     html += f"<li>{artist['name']}</li>"
    # html += "</ul>"

    # html += "<h2>Top Tracks (Month)</h2><ul>"
    # for track in top_tracks_month:
    #     html += f"<li>{track['name']} by {track['artists'][0]['name']}</li>"
    # html += "</ul>"

    # html += "<h2>Top Artists (Year)</h2><ul>"
    # for artist in top_artists_year['items']:
    #     html += f"<li>{artist['name']}</li>"
    # html += "</ul>"

    # html += "<h2>Top Tracks (Year)</h2><ul>"
    # for track in top_tracks_year:
    #     html += f"<li>{track['name']} by {track['artists'][0]['name']}</li>"
    # html += "</ul>"

    html += "<p><a href='/'>Back to Profile</a></p>"
    return html