"""Database functions for featured albums feature"""
from db import get_db
from typing import List, Dict


def add_featured_album(userName: str, album_data: Dict) -> bool:
    """
    Add an album to user's featured albums list.

    Args:
        userName: The user's userName
        album_data: Dictionary with album details:
            - spotifyAlbumId: Spotify album ID
            - albumName: Name of the album
            - artistName: Artist name
            - imageUrl: Album art URL

    Returns:
        bool: True if successful, False if already featured
    """
    conn = get_db()
    cursor = conn.cursor()

    try:
        # Check if user already featured this specific album
        cursor.execute("""
            SELECT id FROM FeaturedAlbum
            WHERE userName = %s AND spotifyAlbumId = %s
        """, (userName, album_data.get('spotifyAlbumId')))

        if cursor.fetchone():
            return False  # Already featured this album

        # Insert new featured album
        cursor.execute("""
            INSERT INTO FeaturedAlbum (userName, albumName, artistName, spotifyAlbumId, imageUrl)
            VALUES (%s, %s, %s, %s, %s)
        """, (
            userName,
            album_data.get('albumName'),
            album_data.get('artistName'),
            album_data.get('spotifyAlbumId'),
            album_data.get('imageUrl')
        ))

        conn.commit()
        return True

    except Exception as e:
        conn.rollback()
        print(f"Error adding featured album: {e}")
        raise e
    finally:
        cursor.close()
        conn.close()


def remove_featured_album(userName: str, spotifyAlbumId: str) -> bool:
    """
    Remove a specific album from user's featured albums.

    Args:
        userName: The user's userName
        spotifyAlbumId: Spotify album ID of the album to remove

    Returns:
        bool: True if an album was removed, False if not found
    """
    conn = get_db()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            DELETE FROM FeaturedAlbum
            WHERE userName = %s AND spotifyAlbumId = %s
        """, (userName, spotifyAlbumId))

        conn.commit()
        return cursor.rowcount > 0

    except Exception as e:
        conn.rollback()
        raise e
    finally:
        cursor.close()
        conn.close()


def get_user_featured_albums(userName: str) -> List[Dict]:
    """
    Get all featured albums for a specific user.

    Args:
        userName: The user's userName

    Returns:
        List of featured albums, sorted by most recent first
    """
    conn = get_db()
    cursor = conn.cursor(dictionary=True)

    try:
        cursor.execute("""
            SELECT
                id,
                userName,
                albumName,
                artistName,
                spotifyAlbumId,
                imageUrl,
                featuredAt
            FROM FeaturedAlbum
            WHERE userName = %s
            ORDER BY featuredAt DESC
        """, (userName,))

        return cursor.fetchall()

    finally:
        cursor.close()
        conn.close()


def get_friends_featured_albums(userName: str) -> List[Dict]:
    """
    Get all featured albums from a user's friends (rolling feed).

    Args:
        userName: The user's userName

    Returns:
        List of dictionaries with friend info and their featured albums, sorted by recency
    """
    conn = get_db()
    cursor = conn.cursor(dictionary=True)

    try:
        cursor.execute("""
            SELECT
                u.userName,
                u.displayName,
                u.profilePicture,
                fa.id as featuredAlbumId,
                fa.albumName,
                fa.artistName,
                fa.spotifyAlbumId,
                fa.imageUrl,
                fa.featuredAt
            FROM UserFriends uf
            JOIN User u ON uf.friendUserName = u.userName
            JOIN FeaturedAlbum fa ON u.userName = fa.userName
            WHERE uf.userName = %s
            ORDER BY fa.featuredAt DESC
        """, (userName,))

        return cursor.fetchall()

    finally:
        cursor.close()
        conn.close()
