"""Database functions for featured songs feature"""
from db import get_db
from typing import List, Dict


def add_featured_song(userName: str, song_data: Dict) -> bool:
    """
    Add a song to user's featured songs list.

    Args:
        userName: The user's userName
        song_data: Dictionary with song details:
            - spotifyTrackId: Spotify track ID
            - songName: Name of the song
            - artistName: Artist name
            - albumName: Album name (optional)
            - imageUrl: Album art URL

    Returns:
        bool: True if successful, False if already featured
    """
    conn = get_db()
    cursor = conn.cursor()

    try:
        # Check if user already featured this specific song
        cursor.execute("""
            SELECT id FROM FeaturedSong
            WHERE userName = %s AND spotifyTrackId = %s
        """, (userName, song_data.get('spotifyTrackId')))

        if cursor.fetchone():
            return False  # Already featured this song

        # Insert new featured song
        cursor.execute("""
            INSERT INTO FeaturedSong (userName, songName, artistName, albumName, spotifyTrackId, imageUrl)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (
            userName,
            song_data.get('songName'),
            song_data.get('artistName'),
            song_data.get('albumName'),
            song_data.get('spotifyTrackId'),
            song_data.get('imageUrl')
        ))

        conn.commit()
        return True

    except Exception as e:
        conn.rollback()
        print(f"Error adding featured song: {e}")
        raise e
    finally:
        cursor.close()
        conn.close()


def remove_featured_song(userName: str, spotifyTrackId: str) -> bool:
    """
    Remove a specific song from user's featured songs.

    Args:
        userName: The user's userName
        spotifyTrackId: Spotify track ID of the song to remove

    Returns:
        bool: True if a song was removed, False if not found
    """
    conn = get_db()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            DELETE FROM FeaturedSong
            WHERE userName = %s AND spotifyTrackId = %s
        """, (userName, spotifyTrackId))

        conn.commit()
        return cursor.rowcount > 0

    except Exception as e:
        conn.rollback()
        raise e
    finally:
        cursor.close()
        conn.close()


def get_user_featured_songs(userName: str) -> List[Dict]:
    """
    Get all featured songs for a specific user.

    Args:
        userName: The user's userName

    Returns:
        List of featured songs, sorted by most recent first
    """
    conn = get_db()
    cursor = conn.cursor(dictionary=True)

    try:
        cursor.execute("""
            SELECT
                id,
                userName,
                songName,
                artistName,
                albumName,
                spotifyTrackId,
                imageUrl,
                featuredAt
            FROM FeaturedSong
            WHERE userName = %s
            ORDER BY featuredAt DESC
        """, (userName,))

        return cursor.fetchall()

    finally:
        cursor.close()
        conn.close()


def get_friends_featured_songs(userName: str) -> List[Dict]:
    """
    Get all featured songs from a user's friends (rolling feed).

    Args:
        userName: The user's userName

    Returns:
        List of dictionaries with friend info and their featured songs, sorted by recency
    """
    conn = get_db()
    cursor = conn.cursor(dictionary=True)

    try:
        cursor.execute("""
            SELECT
                u.userName,
                u.displayName,
                u.profilePicture,
                fs.id as featuredSongId,
                fs.songName,
                fs.artistName,
                fs.albumName,
                fs.spotifyTrackId,
                fs.imageUrl,
                fs.featuredAt
            FROM UserFriends uf
            JOIN User u ON uf.friendUserName = u.userName
            JOIN FeaturedSong fs ON u.userName = fs.userName
            WHERE uf.userName = %s
            ORDER BY fs.featuredAt DESC
        """, (userName,))

        return cursor.fetchall()

    finally:
        cursor.close()
        conn.close()
