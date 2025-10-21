"""
Database insertion functions for Spotify stats data.

This module contains all functions related to inserting data into the database,
including stats records, top songs, albums, and artists.
"""
from db import *
import spotipy

### ----- USER FUNCTIONS ----- ###
def upsert_user(spotify_user_data):
    """
    Insert or update user in database from Spotify OAuth data. Checks for duplicates

    Args:
        spotify_user_data: Dictionary from Spotify API current_user() call

    Returns:
        userName: The userName (Spotify ID) of the user
    """
    conn = get_db()
    cursor = conn.cursor()

    try:
        userName = spotify_user_data['id']
        displayName = spotify_user_data.get('display_name', '')
        profilePicture = spotify_user_data['images'][0]['url'] if spotify_user_data.get('images') else None

        # Insert or update user (ON DUPLICATE KEY UPDATE handles existing users)
        cursor.execute("""
            INSERT INTO User (userName, spotifyId, displayName, profilePicture)
            VALUES (%s, %s, %s, %s)
            ON DUPLICATE KEY UPDATE
                displayName = VALUES(displayName),
                profilePicture = VALUES(profilePicture)
        """, (userName, userName, displayName, profilePicture))

        conn.commit()
        return userName
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        cursor.close()
        conn.close()

### ----- INSERT FUNCTIONS ----- ###
def insert_stats_record(userName, timeframe='short_term'):
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

def insert_top_songs_to_db(stats_id: int, songs: list) -> None:
    """
    Insert top songs data into the TopSong table.

    Args:
        stats_id: The statsID foreign key from the Stats table
        songs: List of song dictionaries from fetch_all_top_songs()
    """
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

def insert_top_artists_to_db(stats_id: int, artists: list) -> None:
    """
    Insert top artists data into the TopArtist table.

    Args:
        stats_id: The statsID foreign key from the Stats table
        artists: List of artist dictionaries from fetch_all_top_artists()
    """
    conn = get_db()
    cursor = conn.cursor()

    try:
        for artist in artists:
            cursor.execute("""
                INSERT INTO TopArtist (statsID, artistName, spotifyArtistId, `rank`, playCount, imageUrl)
                VALUES (%s, %s, %s, %s, %s, %s)
            """, (
                stats_id,
                artist['artistName'],
                artist['spotifyArtistId'],
                artist['rank'],
                artist['playCount'],
                artist['imageUrl']
            ))

        conn.commit()
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        cursor.close()
        conn.close()

### ----- GET FUNCTIONS ----- ###
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
        int: The uniqueID (stats_id) of the cached Stats record if found and has data
        None: If no valid cached record exists within the time window or if it's empty
    """
    conn = get_db()
    cursor = conn.cursor()

    try:
        # Check if a recent Stats record exists AND has associated data (at least 1 song)
        cursor.execute("""
            SELECT s.uniqueID
            FROM Stats s
            INNER JOIN TopSong ts ON s.uniqueID = ts.statsID
            WHERE s.userName = %s
            AND s.timeframe = %s
            AND s.createdAt >= NOW() - INTERVAL %s HOUR
            GROUP BY s.uniqueID
            HAVING COUNT(ts.id) > 0
            ORDER BY s.createdAt DESC
            LIMIT 1
        """, (userName, timeframe, max_age_hours))

        result = cursor.fetchone()
        return result[0] if result else None
    finally:
        cursor.close()
        conn.close()

def get_top_songs_from_db(stats_id: int) -> list:
    """
    Retrieve top songs from database for a given stats_id.

    Args:
        stats_id: The statsID from Stats table

    Returns:
        List of song dictionaries
    """
    conn = get_db()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            SELECT songName, artistName, spotifyTrackId, `rank`, playCount, imageUrl
            FROM TopSong
            WHERE statsID = %s
            ORDER BY `rank`
        """, (stats_id,))

        songs = []
        for row in cursor.fetchall():
            songs.append({
                'songName': row[0],
                'artistName': row[1],
                'spotifyTrackId': row[2],
                'rank': row[3],
                'playCount': row[4],
                'imageUrl': row[5]
            })
        return songs
    finally:
        cursor.close()
        conn.close()

def get_top_albums_from_db(stats_id: int) -> list:
    """
    Retrieve top albums from database for a given stats_id.

    Args:
        stats_id: The statsID from Stats table

    Returns:
        List of album dictionaries
    """
    conn = get_db()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            SELECT albumName, artistName, spotifyAlbumId, `rank`, playCount, imageUrl
            FROM TopAlbum
            WHERE statsID = %s
            ORDER BY `rank`
        """, (stats_id,))

        albums = []
        for row in cursor.fetchall():
            albums.append({
                'albumName': row[0],
                'artistName': row[1],
                'spotifyAlbumId': row[2],
                'rank': row[3],
                'playCount': row[4],
                'imageUrl': row[5]
            })
        return albums
    finally:
        cursor.close()
        conn.close()

def get_top_artists_from_db(stats_id: int) -> list:
    """
    Retrieve top artists from database for a given stats_id.

    Args:
        stats_id: The statsID from Stats table

    Returns:
        List of artist dictionaries
    """
    conn = get_db()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            SELECT artistName, spotifyArtistId, `rank`, playCount, imageUrl
            FROM TopArtist
            WHERE statsID = %s
            ORDER BY `rank`
        """, (stats_id,))

        artists = []
        for row in cursor.fetchall():
            artists.append({
                'artistName': row[0],
                'spotifyArtistId': row[1],
                'rank': row[2],
                'playCount': row[3],
                'imageUrl': row[4]
            })
        return artists
    finally:
        cursor.close()
        conn.close()

### ----- HIGH-LEVEL FUNCTIONS ----- ###
def fetch_and_insert_all_stats(userName: str, timeframe: str, sp: spotipy.Spotify):
    """
    Shared helper function to fetch songs, albums, AND artists from Spotify
    and insert all three into ONE stats record.

    This function is used by both stats.py (HTML page) and jsonStats.py (API endpoints)
    to ensure consistent behavior.

    Args:
        userName: The userName (Spotify ID)
        timeframe: 'short_term', 'medium_term', or 'long_term'
        sp: Authenticated Spotify client instance

    Returns:
        stats_id: The uniqueID of the created Stats record
    """
    from stats import fetch_all_top_songs, fetch_all_top_albums, fetch_all_top_artists

    print(f"Fetching complete stats from Spotify for {timeframe}", flush=True)

    # Clean up old data
    try:
        cleanup_old_stats(userName, timeframe, max_age_days=1)
    except Exception as e:
        print(f"Warning: Failed to cleanup old stats: {e}", flush=True)

    # Fetch all three types
    songs = fetch_all_top_songs(sp, timeframe)
    albums = fetch_all_top_albums(sp, timeframe)
    artists = fetch_all_top_artists(sp, timeframe)

    # Create ONE stats record
    stats_id = insert_stats_record(userName, timeframe=timeframe)

    # Insert all three into that ONE record
    insert_top_songs_to_db(stats_id=stats_id, songs=songs)
    insert_top_albums_to_db(stats_id=stats_id, albums=albums)
    insert_top_artists_to_db(stats_id=stats_id, artists=artists)

    print(f"Inserted complete stats (ID: {stats_id}): {len(songs)} songs, {len(albums)} albums, {len(artists)} artists", flush=True)

    return stats_id

def cleanup_old_stats(userName: str, timeframe: str, max_age_days: int = 1) -> None:
    """
    Delete Stats records and their associated data if older than max_age_days.

    Args:
        userName: The userName (Spotify ID)
        timeframe: The timeframe ('short_term', 'medium_term', 'long_term')
        max_age_days: Maximum age in days before deletion (default 1)
    """
    conn = get_db()
    cursor = conn.cursor()

    try:
        # Find old stats IDs
        cursor.execute("""
            SELECT uniqueID
            FROM Stats
            WHERE userName = %s
            AND timeframe = %s
            AND createdAt < NOW() - INTERVAL %s DAY
        """, (userName, timeframe, max_age_days))

        old_stats_ids = [row[0] for row in cursor.fetchall()]

        if old_stats_ids:
            # Delete associated data (foreign keys should handle this with ON DELETE CASCADE if set,
            # but we'll be explicit here)
            for stats_id in old_stats_ids:
                cursor.execute("DELETE FROM TopSong WHERE statsID = %s", (stats_id,))
                cursor.execute("DELETE FROM TopAlbum WHERE statsID = %s", (stats_id,))
                cursor.execute("DELETE FROM TopArtist WHERE statsID = %s", (stats_id,))

            # Delete the Stats records
            cursor.execute("""
                DELETE FROM Stats
                WHERE uniqueID IN (%s)
            """ % ','.join(['%s'] * len(old_stats_ids)), old_stats_ids)

            conn.commit()
            print(f"Deleted {len(old_stats_ids)} old stats records for {userName}/{timeframe}", flush=True)
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        cursor.close()
        conn.close()