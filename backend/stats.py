from flask import Blueprint, session, redirect
import spotipy
from auth import get_authenticated_spotify_client
from db_functions import *

stats_bp = Blueprint('stats', __name__)

def fetch_all_top_songs(sp: spotipy.Spotify, time_range: str, batch_size: int = 50, max_items: int = 150) -> list:
    """
    Fetch all top songs for a given time range and extract data for TopSong table.

    Args:
        sp: Authenticated Spotify client instance
        time_range: 'short_term' (4 weeks), 'medium_term' (6 months), or 'long_term' (several years)
        batch_size: Number of items to fetch per request (default 50, max 50)
        max_items: Maximum total items to fetch (default 150)

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

    while len(songs) < max_items:
        batch = sp.current_user_top_tracks(limit=batch_size, offset=offset, time_range=time_range)
        for track in batch['items']:
            if len(songs) >= max_items:
                break
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

def fetch_all_top_albums(sp: spotipy.Spotify, time_range: str, batch_size: int = 50, max_items: int = 150) -> list:
    """
    Derive top albums for a given time range based on user's top tracks AND artists.
    Ranks albums by combining track ranking scores with artist popularity scores.
    Implemented an algorithm to rank songs with weights and then to put that into the album calculation.

    Args:
        sp: Authenticated Spotify client instance
        time_range: 'short_term' (4 weeks), 'medium_term' (6 months), or 'long_term' (several years)
        batch_size: Number of tracks to fetch per batch (default 50)
        max_items: Maximum number of albums to return (default 150)

    Returns:
       List of album dictionaries formatted for database insertion, ranked by combined score
    """
    # Fetch top tracks using pagination (limited to max_items)
    tracks = []
    offset = 0

    while len(tracks) < max_items:
        batch = sp.current_user_top_tracks(limit=batch_size, offset=offset, time_range=time_range)
        tracks.extend(batch['items'])

        if len(batch['items']) < batch_size or len(tracks) >= max_items:
            break

        offset += batch_size

    # Fetch top artists to get artist rankings (also limited)
    artists_list = fetch_all_top_artists(sp, time_range, max_items=max_items)

    # Create artist rank lookup (artistId -> rank)
    # Lower rank number = higher popularity
    artist_ranks = {artist['spotifyArtistId']: artist['rank'] for artist in artists_list}
    total_artists = len(artists_list)

    # Calculate hybrid score for each album based on:
    # 1. Track rankings (sum of individual track scores)
    # 2. Artist popularity (bonus based on artist rank)
    album_scores = {}
    album_info = {}
    album_track_counts = {}  # Track how many tracks per album
    total_tracks = len(tracks)

    for idx, track in enumerate(tracks):
        album = track.get('album')
        if not album:
            continue  # Skip tracks without album data

        album_id = album.get('id')
        if not album_id:
            continue

        # Get the artist ID for this track
        artist_id = track['artists'][0]['id'] if track.get('artists') else None

        # Track score: higher ranked tracks = more points
        # Track #1 gets 'total_tracks' points, track #last gets 1 point
        track_score = total_tracks - idx

        # Artist multiplier based on rank with EXPONENTIAL penalty for lower-ranked artists
        # This heavily punishes artists outside top 20, even if they have many tracks
        artist_multiplier = 1.0
        if artist_id and artist_id in artist_ranks:
            artist_rank = artist_ranks[artist_id]
            # Exponential decay: artist #1 gets 100x, artist #20 gets ~1x, artist #34 gets ~0.001x
            # Using exponential function to create steep drop-off
            normalized_rank = artist_rank / total_artists  # 0 to 1
            artist_multiplier = 100 * (0.01 ** normalized_rank)  # Exponential decay

        # Apply artist multiplier to track score
        # This means tracks from low-ranked artists contribute almost nothing
        combined_score = track_score * artist_multiplier

        # Add score to album's total
        album_scores[album_id] = album_scores.get(album_id, 0) + combined_score
        album_track_counts[album_id] = album_track_counts.get(album_id, 0) + 1

        # Store album info (only once per album)
        if album_id not in album_info:
            album_info[album_id] = {
                'albumName': album.get('name'),
                'artistName': album['artists'][0]['name'] if album.get('artists') else 'Unknown Artist',
                'spotifyAlbumId': album_id,
                'imageUrl': album['images'][0]['url'] if album.get('images') else None,
                'playCount': 0  # Spotify doesn't provide play counts
            }

    # Sort albums by combined score (descending) and create ranked list
    sorted_album_ids = sorted(album_scores.keys(), key=lambda aid: album_scores[aid], reverse=True)

    albums = []
    for rank, album_id in enumerate(sorted_album_ids, start=1):
        if len(albums) >= max_items:
            break
        album_data = album_info[album_id].copy()
        album_data['rank'] = rank
        albums.append(album_data)

    return albums

def fetch_all_top_artists(sp: spotipy.Spotify, time_range: str, batch_size: int = 50, max_items: int = 150) -> list:
    """
    Fetch all top artists for a given time range and extract data for TopArtist table.

    Args:
        sp: Authenticated Spotify client instance
        time_range: 'short_term' (4 weeks), 'medium_term' (6 months), or 'long_term' (several years)
        batch_size: Number of items to fetch per request (default 50, max 50)
        max_items: Maximum total items to fetch (default 150)

    Returns:
        List of dictionaries containing artist data formatted for database insertion
    """
    artists = []
    offset = 0
    rank = 1

    while len(artists) < max_items:
        batch = sp.current_user_top_artists(limit=batch_size, offset=offset, time_range=time_range)

        for artist in batch['items']:
            if len(artists) >= max_items:
                break
            artist_data = {
                'artistName': artist['name'],
                'spotifyArtistId': artist['id'],
                'rank': rank,
                'imageUrl': artist['images'][0]['url'] if artist.get('images') else None,
                'playCount': 0  # Spotify API doesn't provide play counts for top artists
            }
            artists.append(artist_data)
            rank += 1

        # Check to see if we got all available artists
        if len(batch['items']) < batch_size:
            break

        offset += batch_size

    return artists


@stats_bp.route('/stats')
@stats_bp.route('/stats/<timeframe>')
def stats(timeframe='short_term'):
    """
    Display stats for a given timeframe.

    Args:
        timeframe: 'short_term' (4 weeks), 'medium_term' (6 months), or 'long_term' (all time)
    """
    # Validate timeframe
    valid_timeframes = ['short_term', 'medium_term', 'long_term']
    if timeframe not in valid_timeframes:
        timeframe = 'short_term'

    sp, _ = get_authenticated_spotify_client()
    if not sp:
        return redirect('/')

    userName = session.get('userName')

    # Timeframe display names
    timeframe_names = {
        'short_term': 'Last 4 Weeks',
        'medium_term': 'Last 6 Months',
        'long_term': 'All Time'
    }

    # Check if we have cached stats (within last 24 hours)
    from db_functions import get_cached_stats_id, fetch_and_insert_all_stats
    existing_stats_id = get_cached_stats_id(userName, timeframe=timeframe, max_age_hours=24)

    if not existing_stats_id:
        # Fetch and insert ALL stats (songs, albums, artists) into ONE record
        existing_stats_id = fetch_and_insert_all_stats(userName, timeframe, sp)

    # Read from database for display
    print(f"Reading stats from database (ID: {existing_stats_id})", flush=True)
    top_songs_display = get_top_songs_from_db(existing_stats_id)
    top_albums_display = get_top_albums_from_db(existing_stats_id)
    top_artists_display = get_top_artists_from_db(existing_stats_id)

    # ========== BUILD HTML RESPONSE ==========
    html = f"<h1>Your Spotify Stats - {timeframe_names[timeframe]}</h1>"

    # Timeframe selector buttons
    html += "<div style='margin: 20px 0;'>"
    for tf, name in timeframe_names.items():
        if tf == timeframe:
            html += f"<strong style='margin-right: 10px;'>{name}</strong>"
        else:
            html += f"<a href='/stats/{tf}' style='margin-right: 10px;'>{name}</a>"
    html += "</div>"

    # Display top songs (all 150)
    html += f"<h2>Top Songs ({len(top_songs_display)} total)</h2><ul>"
    for song in top_songs_display:
        html += f"<li><strong>#{song['rank']}</strong> {song['songName']} - {song['artistName']}</li>"
    html += "</ul>"

    # Display top artists (all 150)
    html += f"<h2>Top Artists ({len(top_artists_display)} total)</h2><ul>"
    for artist in top_artists_display:
        html += f"<li><strong>#{artist['rank']}</strong> {artist['artistName']}</li>"
    html += "</ul>"

    # Display top albums (all)
    html += f"<h2>Top Albums ({len(top_albums_display)} total)</h2><ul>"
    for album in top_albums_display:
        html += f"<li><strong>#{album['rank']}</strong> {album['albumName']} - {album['artistName']}</li>"
    html += "</ul>"

    html += "<hr>"
    html += "<p><a href='/stats/recently-played'>View Recently Played Stats (Last ~50 Plays)</a></p>"
    html += "<p><a href='/'>Back to Profile</a></p>"
    return html