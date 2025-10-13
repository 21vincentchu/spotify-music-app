from flask import Blueprint, session, redirect
import spotipy
from datetime import datetime, timedelta
from collections import Counter
from db import get_db
from auth import get_authenticated_spotify_client

stats_weekly_bp = Blueprint('stats_weekly', __name__)

def fetch_recently_played_tracks(sp: spotipy.Spotify, days_ago: int = 7) -> list:
    """
    Fetch all recently played tracks from the last N days.

    Args:
        sp: Authenticated Spotify client instance
        days_ago: Number of days to look back (default 7 for weekly)

    Returns:
        List of play items with 'track' and 'played_at' timestamp
    """
    all_tracks = []

    # Calculate start time in milliseconds (Unix timestamp)
    start_time = int((datetime.now() - timedelta(days=days_ago)).timestamp() * 1000)
    after_cursor = start_time

    while True:
        try:
            results = sp.current_user_recently_played(limit=50, after=after_cursor)

            if not results or not results.get('items'):
                break

            all_tracks.extend(results['items'])

            # Check if there's more data to fetch
            if results.get('cursors', {}).get('after'):
                after_cursor = results['cursors']['after']
            else:
                break

        except Exception as e:
            print(f"Error fetching recently played: {e}", flush=True)
            break

    return all_tracks

def calculate_listening_minutes(recent_tracks: list) -> dict:
    """
    Calculate total listening minutes from recently played tracks.

    Args:
        recent_tracks: List of recently played items from Spotify API

    Returns:
        Dictionary with listening statistics:
        {
            'total_minutes': float,
            'total_hours': float,
            'total_plays': int,
            'avg_track_length_minutes': float
        }
    """
    total_duration_ms = 0
    track_count = len(recent_tracks)

    for item in recent_tracks:
        track = item['track']
        duration_ms = track.get('duration_ms', 0)
        total_duration_ms += duration_ms

    total_minutes = total_duration_ms / 60000  # Convert milliseconds to minutes
    total_hours = total_minutes / 60
    avg_track_length = total_minutes / track_count if track_count > 0 else 0

    return {
        'total_minutes': round(total_minutes, 2),
        'total_hours': round(total_hours, 2),
        'total_plays': track_count,
        'avg_track_length_minutes': round(avg_track_length, 2)
    }

def fetch_weekly_top_songs(sp: spotipy.Spotify, days_ago: int = 7) -> list:
    """
    Fetch top songs from the last N days based on play count.

    Args:
        sp: Authenticated Spotify client instance
        days_ago: Number of days to look back (default 7 for weekly)

    Returns:
        List of dictionaries containing song data formatted for database insertion:
        {
            'songName': str,
            'artistName': str,
            'spotifyTrackId': str,
            'rank': int,
            'imageUrl': str,
            'playCount': int (actual play count from recently played)
        }
    """
    # Fetch recently played tracks
    recent_tracks = fetch_recently_played_tracks(sp, days_ago)

    # Count plays per track
    track_play_count = Counter()
    track_info = {}

    for item in recent_tracks:
        track = item['track']
        track_id = track['id']

        if not track_id:
            continue

        # Count plays
        track_play_count[track_id] += 1

        # Store track info (only once per track)
        if track_id not in track_info:
            track_info[track_id] = {
                'songName': track['name'],
                'artistName': track['artists'][0]['name'] if track.get('artists') else 'Unknown Artist',
                'spotifyTrackId': track_id,
                'imageUrl': track['album']['images'][0]['url'] if track.get('album', {}).get('images') else None
            }

    # Sort by play count and create ranked list
    sorted_tracks = track_play_count.most_common()

    songs = []
    for rank, (track_id, play_count) in enumerate(sorted_tracks, start=1):
        song_data = track_info[track_id].copy()
        song_data['rank'] = rank
        song_data['playCount'] = play_count
        songs.append(song_data)

    return songs

def fetch_weekly_top_artists(sp: spotipy.Spotify, days_ago: int = 7) -> list:
    """
    Fetch top artists from the last N days based on play count.

    Args:
        sp: Authenticated Spotify client instance
        days_ago: Number of days to look back (default 7 for weekly)

    Returns:
        List of dictionaries containing artist data formatted for database insertion:
        {
            'artistName': str,
            'spotifyArtistId': str,
            'rank': int,
            'playCount': int (number of tracks played by this artist),
            'imageUrl': str (optional)
        }
    """
    # Fetch recently played tracks
    recent_tracks = fetch_recently_played_tracks(sp, days_ago)

    # Count plays per artist
    artist_play_count = Counter()
    artist_info = {}

    for item in recent_tracks:
        track = item['track']

        if not track.get('artists'):
            continue

        # Get primary artist
        artist = track['artists'][0]
        artist_id = artist['id']
        artist_name = artist['name']

        if not artist_id:
            continue

        # Count plays
        artist_play_count[artist_id] += 1

        # Store artist info (only once per artist)
        if artist_id not in artist_info:
            artist_info[artist_id] = {
                'artistName': artist_name,
                'spotifyArtistId': artist_id,
                'imageUrl': None  # Recently played doesn't include artist images
            }

    # Sort by play count and create ranked list
    sorted_artists = artist_play_count.most_common()

    artists = []
    for rank, (artist_id, play_count) in enumerate(sorted_artists, start=1):
        artist_data = artist_info[artist_id].copy()
        artist_data['rank'] = rank
        artist_data['playCount'] = play_count
        artists.append(artist_data)

    return artists

def fetch_weekly_top_albums(sp: spotipy.Spotify, days_ago: int = 7) -> list:
    """
    Fetch top albums from the last N days based on play count.

    Args:
        sp: Authenticated Spotify client instance
        days_ago: Number of days to look back (default 7 for weekly)

    Returns:
        List of dictionaries containing album data formatted for database insertion:
        {
            'albumName': str,
            'artistName': str,
            'spotifyAlbumId': str,
            'rank': int,
            'playCount': int (number of tracks played from this album),
            'imageUrl': str
        }
    """
    # Fetch recently played tracks
    recent_tracks = fetch_recently_played_tracks(sp, days_ago)

    # Count plays per album
    album_play_count = Counter()
    album_info = {}

    for item in recent_tracks:
        track = item['track']
        album = track.get('album')

        if not album:
            continue

        album_id = album.get('id')
        if not album_id:
            continue

        # Count plays
        album_play_count[album_id] += 1

        # Store album info (only once per album)
        if album_id not in album_info:
            album_info[album_id] = {
                'albumName': album.get('name'),
                'artistName': album['artists'][0]['name'] if album.get('artists') else 'Unknown Artist',
                'spotifyAlbumId': album_id,
                'imageUrl': album['images'][0]['url'] if album.get('images') else None
            }

    # Sort by play count and create ranked list
    sorted_albums = album_play_count.most_common()

    albums = []
    for rank, (album_id, play_count) in enumerate(sorted_albums, start=1):
        album_data = album_info[album_id].copy()
        album_data['rank'] = rank
        album_data['playCount'] = play_count
        albums.append(album_data)

    return albums

@stats_weekly_bp.route('/stats/recently-played')
def stats_recently_played():
    """Route to display stats based on recently played tracks (last ~50 plays)."""
    sp, token_info = get_authenticated_spotify_client()
    if not sp:
        return redirect('/')

    user_profile = sp.current_user()
    userName = session.get('userName')

    # Fetch raw recently played data
    recent_tracks = fetch_recently_played_tracks(sp, days_ago=7)

    # Calculate listening statistics
    listening_stats = calculate_listening_minutes(recent_tracks)

    # Fetch weekly data (last 7 days)
    top_songs_weekly = fetch_weekly_top_songs(sp, days_ago=7)
    top_artists_weekly = fetch_weekly_top_artists(sp, days_ago=7)
    top_albums_weekly = fetch_weekly_top_albums(sp, days_ago=7)

    # Build HTML response
    html = "<h1>Your Recently Played Stats</h1>"
    html += "<p><em>Based on last ~50 plays (approximately 1-2 days of listening)</em></p>"

    # Display listening time stats
    html += "<h2>Listening Time</h2>"
    html += f"<p><strong>Total Minutes:</strong> {listening_stats['total_minutes']} minutes</p>"
    html += f"<p><strong>Total Hours:</strong> {listening_stats['total_hours']} hours</p>"
    html += f"<p><strong>Total Plays:</strong> {listening_stats['total_plays']} tracks</p>"
    html += f"<p><strong>Average Track Length:</strong> {listening_stats['avg_track_length_minutes']} minutes</p>"
    html += "<hr>"

    # Display top songs
    html += "<h2>Top Songs</h2><ul>"
    for song in top_songs_weekly[:10]:  # Show top 10
        html += f"<li>{song['rank']}. {song['songName']} by {song['artistName']} ({song['playCount']} plays)</li>"
    html += "</ul>"

    # Display top artists
    html += "<h2>Top Artists</h2><ul>"
    for artist in top_artists_weekly[:10]:  # Show top 10
        html += f"<li>{artist['rank']}. {artist['artistName']} ({artist['playCount']} plays)</li>"
    html += "</ul>"

    # Display top albums
    html += "<h2>Top Albums</h2><ul>"
    for album in top_albums_weekly[:10]:  # Show top 10
        html += f"<li>{album['rank']}. {album['albumName']} by {album['artistName']} ({album['playCount']} plays)</li>"
    html += "</ul>"

    html += "<hr>"
    html += "<p><a href='/stats'>View 4-Week Stats</a></p>"
    html += "<p><a href='/'>Back to Profile</a></p>"
    return html
