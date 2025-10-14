"""
Database insertion functions for Spotify stats data.

This module contains all functions related to inserting data into the database,
including stats records, top songs, albums, and artists.
"""
from db import get_db


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
