from flask import Blueprint, session, redirect
import spotipy
from spotipy.oauth2 import SpotifyOAuth
import os
from db import get_db

stats_bp = Blueprint('stats', __name__)

def create_stats_record(userName, timeframe='short_term'):
    """
    Create a new Stats record for a user.

    Args:
        userName: The userName (Spotify ID)
        timeframe: 'short_term', 'medium_term', or 'long_term'

    Returns:
        stats_id: The uniqueID of the created Stats record
    """
    conn = get_db()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            INSERT INTO Stats (userName, timeframe, totalMinutes)
            VALUES (%s, %s, 0)
        """, (userName, timeframe))

        conn.commit()
        stats_id = cursor.lastrowid
        return stats_id
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        cursor.close()
        conn.close()

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

def insert_top_songs_to_db(stats_id: int, songs: list) -> None:
    """
    Insert top songs data into the TopSong table.

    Args:
        stats_id: The statsID foreign key from the Stats table
        songs: List of song dictionaries from fetch_all_top_songs()
    """
    from db import get_db

    conn = get_db()
    cursor = conn.cursor()

    try:
        for song in songs:
            cursor.execute("""
                INSERT INTO TopSong (statsID, songName, artistName, spotifyTrackId, `rank`, playCount, imageUrl)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            """, (
                stats_id,
                song['songName'],
                song['artistName'],
                song['spotifyTrackId'],
                song['rank'],
                song['playCount'],
                song['imageUrl']
            ))

        conn.commit()
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        cursor.close()
        conn.close()

def insert_top_albums_to_db(stats_id: int, albums: list) -> None:
    """
    Insert top albums data into the TopAlbum table.

    Args:
        stats_id: The statsID foreign key from the Stats table
        albums: List of album dictionaries from fetch_all_top_albums()
    """
    from db import get_db

    conn = get_db()
    cursor = conn.cursor()

    try:
        for album in albums:
            cursor.execute("""
                INSERT INTO TopAlbum (statsID, albumName, artistName, spotifyAlbumId, `rank`, playCount, imageUrl)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            """, (
                stats_id,
                album['albumName'],
                album['artistName'],
                album['spotifyAlbumId'],
                album['rank'],
                album['playCount'],
                album['imageUrl']
            ))

        conn.commit()
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        cursor.close()
        conn.close()

def fetch_all_top_albums(sp: spotipy.Spotify, time_range: str, batch_size: int = 50) -> list:
    """
    Derive top albums for a given time range based on user's top tracks.
    Ranks albums by the number of top tracks they contain.

    Args:
        sp: Authenticated Spotify client instance
        time_range: 'short_term' (4 weeks), 'medium_term' (6 months), or 'long_term' (several years)
        batch_size: Number of tracks to fetch per batch (default 50)

    Returns:
       List of album dictionaries formatted for database insertion, ranked by track count
    """
    # Fetch all top tracks using pagination
    tracks = []
    offset = 0

    while True:
        batch = sp.current_user_top_tracks(limit=batch_size, offset=offset, time_range=time_range)
        tracks.extend(batch['items'])

        if len(batch['items']) < batch_size:
            break

        offset += batch_size

    # Count how many tracks come from each album
    album_track_count = {}
    album_info = {}

    for track in tracks:
        album = track.get('album')
        if not album:
            continue  # Skip tracks without album data

        album_id = album.get('id')
        if not album_id:
            continue

        # Count tracks per album
        album_track_count[album_id] = album_track_count.get(album_id, 0) + 1

        # Store album info (only once per album)
        if album_id not in album_info:
            album_info[album_id] = {
                'albumName': album.get('name'),
                'artistName': album['artists'][0]['name'] if album.get('artists') else 'Unknown Artist',
                'spotifyAlbumId': album_id,
                'imageUrl': album['images'][0]['url'] if album.get('images') else None,
                'playCount': 0  # Spotify doesn't provide play counts
            }

    # Sort albums by track count (descending) and create ranked list
    sorted_album_ids = sorted(album_track_count.keys(), key=lambda aid: album_track_count[aid], reverse=True)

    albums = []
    for rank, album_id in enumerate(sorted_album_ids, start=1):
        album_data = album_info[album_id].copy()
        album_data['rank'] = rank
        albums.append(album_data)

    return albums

def get_recent_stats(userName: str, timeframe: str, max_age_hours: int = 24):
    """
    Check if there's a recent Stats record for this user and timeframe.

    Args:
        userName: The userName to check
        timeframe: The timeframe to check ('short_term', 'medium_term', 'long_term')
        max_age_hours: Maximum age in hours (default 24)

    Returns:
        stats_id if recent record exists, None otherwise
    """
    conn = get_db()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            SELECT uniqueID
            FROM Stats
            WHERE userName = %s
            AND timeframe = %s
            AND createdAt >= NOW() - INTERVAL %s HOUR
            ORDER BY createdAt DESC
            LIMIT 1
        """, (userName, timeframe, max_age_hours))

        result = cursor.fetchone()
        return result[0] if result else None
    finally:
        cursor.close()
        conn.close()

@stats_bp.route('/stats')
def stats():
    sp, token_info = get_authenticated_spotify_client()
    if not sp:
        return redirect('/')

    user_profile = sp.current_user()
    userName = session.get('userName')

    # ========== TOP ARTISTS AND TRACKS (LAST 4 WEEKS) ==========
    # Fetch top 50 artists from the past ~4 weeks
    top_artists_week = sp.current_user_top_artists(limit=50, time_range='short_term')

    # Check if we have recent stats (within last 24 hours)
    existing_stats_id = get_recent_stats(userName, timeframe='short_term', max_age_hours=24)

    if existing_stats_id:
        print(f"Found recent stats (ID: {existing_stats_id}), skipping fetch and insert", flush=True)
        stats_id = existing_stats_id
    else:
        print(f"No recent stats found, fetching new data from Spotify", flush=True)

        # Fetch formatted song and album data for database
        top_songs_week = fetch_all_top_songs(sp, 'short_term')
        top_albums_week = fetch_all_top_albums(sp, 'short_term')

        # Create a Stats record for this user and timeframe
        try:
            stats_id = create_stats_record(userName, timeframe='short_term')
            print(f"Created Stats record with ID: {stats_id}", flush=True)

            # Insert songs and albums into database using the new stats_id
            insert_top_songs_to_db(stats_id=stats_id, songs=top_songs_week)
            print(f"Successfully inserted {len(top_songs_week)} songs into database!", flush=True)

            insert_top_albums_to_db(stats_id=stats_id, albums=top_albums_week)
            print(f"Successfully inserted {len(top_albums_week)} albums into database!", flush=True)
        except Exception as e:
            print(f"Error creating stats or inserting data: {e}", flush=True)

    # ========== TOP ARTISTS AND TRACKS (LAST 6 MONTHS) ==========
    # Fetch top 50 artists from the past ~6 months
    # top_artists_month = sp.current_user_top_artists(limit=50, time_range='medium_term')

    # Fetch ALL top tracks from the past ~6 months using pagination
    # top_tracks_month = fetch_all_top_tracks(sp, 'medium_term')

    # ========== TOP ARTISTS AND TRACKS (ALL TIME / SEVERAL YEARS) ==========
    # Fetch top 50 artists from the past several years
    # top_artists_year = sp.current_user_top_artists(limit=50, time_range='long_term')

    # ========== BUILD HTML RESPONSE ==========
    html = "<h1>Your Spotify Stats</h1>"

    # Display top artists from the past 4 weeks
    html += "<h2>Top Artists (Week)</h2><ul>"
    for artist in top_artists_week['items']:
        html += f"<li>{artist['name']}</li>"
    html += "</ul>"

    html += "<p><a href='/'>Back to Profile</a></p>"
    return html