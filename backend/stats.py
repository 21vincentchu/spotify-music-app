from flask import Blueprint, session, redirect
import spotipy
from db import get_db
from auth import get_authenticated_spotify_client
from db_insert import *

stats_bp = Blueprint('stats', __name__)

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

def get_cached_stats_id(userName: str, timeframe: str, max_age_hours: int = 24):
    """
    Check if a cached Stats record exists for this user and timeframe combination.

    This function prevents duplicate database inserts by checking if we've already
    fetched and stored this user's stats for the given timeframe within the specified
    time window. If a recent record exists, we can reuse its stats_id instead of
    creating a new Stats record and re-inserting all the data.

    Args:
        userName: The user's Spotify ID (userName)
        timeframe: The Spotify timeframe ('short_term', 'medium_term', 'long_term')
        max_age_hours: Maximum age of cached record in hours (default 24)
                       Records older than this are considered stale

    Returns:
        int: The uniqueID (stats_id) of the cached Stats record if found
        None: If no valid cached record exists within the time window
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

def fetch_all_top_artists(sp: spotipy.Spotify, time_range: str, batch_size: int = 50) -> list:
    """
    Fetch all top artists for a given time range and extract data for TopArtist table.

    Args:
        sp: Authenticated Spotify client instance
        time_range: 'short_term' (4 weeks), 'medium_term' (6 months), or 'long_term' (several years)
        batch_size: Number of items to fetch per request (default 50, max 50)

    Returns:
        List of dictionaries containing song data formatted for database insertion:
        {
            'artistName': str,
            'spotifyTrackId': str,
            'rank': int,
            'imageUrl': str,
            'playCount': int (defaults to 0 as Spotify doesn't provide this)
        }
    """
    artists = []
    offset = 0
    rank = 1

    while True:
        batch = sp.current_user_top_artists(limit=batch_size, offset=offset, time_range=time_range)

        for artist in batch['items']:
            song_data = {
                'artistName': artist['name'],
                'spotifyArtistId': artist['id'],
                'rank': rank,
                'imageUrl': artist['images'][0]['url'] if artist.get('images') else None,
                'playCount': 0  # Spotify API doesn't provide play counts for top tracks
            }
            artists.append(song_data)
            rank += 1

        # Check to see if we got all available tracks
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

    sp, token_info = get_authenticated_spotify_client()
    if not sp:
        return redirect('/')

    user_profile = sp.current_user()
    userName = session.get('userName')

    # ========== TOP ARTISTS AND TRACKS (LAST 4 WEEKS) ==========
    # Fetch top 50 artists from the past ~4 weeks
    top_artists_week = fetch_all_top_artists(sp, 'short_term')
    
    top_songs_week = fetch_all_top_songs(sp, 'short_term')

    # Timeframe display names
    timeframe_names = {
        'short_term': 'Last 4 Weeks',
        'medium_term': 'Last 6 Months',
        'long_term': 'All Time'
    }

    # Fetch top artists for the selected timeframe
    top_artists = sp.current_user_top_artists(limit=50, time_range=timeframe)

    # Check if we have cached stats (within last 24 hours)
    existing_stats_id = get_cached_stats_id(userName, timeframe=timeframe, max_age_hours=24)

    if existing_stats_id:
        print(f"Found recent stats (ID: {existing_stats_id}), skipping fetch and insert", flush=True)
        stats_id = existing_stats_id
        # Fetch fresh data for display
        top_songs_display = fetch_all_top_songs(sp, timeframe)
        top_albums_display = fetch_all_top_albums(sp, timeframe)
    else:
        print(f"No recent stats found, fetching new data from Spotify", flush=True)

        # Fetch formatted song and album data for database
        top_songs = fetch_all_top_songs(sp, timeframe)
        top_albums = fetch_all_top_albums(sp, timeframe)

        # Create a Stats record for this user and timeframe
        try:
            stats_id = insert_stats_record(userName, timeframe=timeframe)
            print(f"Created Stats record with ID: {stats_id}", flush=True)

            # Insert songs and albums into database using the new stats_id
            insert_top_songs_to_db(stats_id=stats_id, songs=top_songs)
            print(f"Successfully inserted {len(top_songs)} songs into database!", flush=True)

            insert_top_albums_to_db(stats_id=stats_id, albums=top_albums)
            print(f"Successfully inserted {len(top_albums)} albums into database!", flush=True)
            
            insert_top_songs_to_db(stats_id=stats_id, songs=top_artists)
            print(f"Successfully inserted {len(top_artists)} albums into database!", flush=True)
            

            # Use for display
            top_songs_display = top_songs
            top_albums_display = top_albums
        except Exception as e:
            print(f"Error creating stats or inserting data: {e}", flush=True)
            # Still fetch for display even if DB insert fails
            top_songs_display = fetch_all_top_songs(sp, timeframe)
            top_albums_display = fetch_all_top_albums(sp, timeframe)
            top_artists_display = fetch_all_top_artists(sp, timeframe)

    # ========== BUILD HTML RESPONSE ==========
    html = f"<h1>Your Spotify Stats - {timeframe_names[timeframe]}</h1>"

    # Display top artists from the past 4 weeks
    html += "<h2>Top Artists (Week)</h2><ul>"
    for artist in top_artists_week:
        html += f"<li>{artist['artistName']}</li>"
    # Timeframe selector buttons
    html += "<div style='margin: 20px 0;'>"
    for tf, name in timeframe_names.items():
        if tf == timeframe:
            html += f"<strong style='margin-right: 10px;'>{name}</strong>"
        else:
            html += f"<a href='/stats/{tf}' style='margin-right: 10px;'>{name}</a>"
    html += "</div>"

    # Display top artists
    html += "<h2>Top Artists</h2><ul>"
    for idx, artist in enumerate(top_artists['items'][:20], start=1):
        html += f"<li><strong>#{idx}</strong> {artist['name']}</li>"
    html += "</ul>"

    # Display top songs
    html += "<h2>Top Songs</h2><ul>"
    for song in top_songs_display[:20]:
        html += f"<li><strong>#{song['rank']}</strong> {song['songName']} - {song['artistName']}</li>"
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
    
    ##albums
    html += "<h2>Top Albums</h2><ul>"
    for album in top_albums_display[:20]:
        html += f"<li><strong>#{album['rank']}</strong> {album['albumName']} - {album['artistName']}</li>"
    html += "</ul>"

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

    ##yo
    try:
        insert_top_songs_to_db(stats_id=4, songs=top_songs_week)
        print(f"Successfully inserted {len(top_songs_week)} songs into database!", flush=True)
    except Exception as e:
        print(f"Error inserting songs: {e}", flush=True)

    try:
        insert_top_artists_to_db(stats_id=4, artists=top_artists_week)
        print(f"Successfully inserted {len(top_artists_week)} songs into database!", flush=True)
    except Exception as e:
        print(f"Error inserting artists: {e}", flush=True)


    # html += "<h2>Top Tracks (Year)</h2><ul>"
    # for track in top_tracks_year:
    #     html += f"<li>{track['name']} by {track['artists'][0]['name']}</li>"
    # html += "</ul>"

    html += "<hr>"
    html += "<p><a href='/stats/recently-played'>View Recently Played Stats (Last ~50 Plays)</a></p>"
    html += "<p><a href='/'>Back to Profile</a></p>"
    return html