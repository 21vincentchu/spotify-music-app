"""Database functions for featured artists feature"""
from db import get_db
from typing import List, Dict


def add_featured_artist(userName: str, artist_data: Dict) -> bool:
    """
    Add an artist to user's featured artists list.

    Args:
        userName: The user's userName
        artist_data: Dictionary with artist details:
            - spotifyArtistId: Spotify artist ID
            - artistName: Name of the artist
            - imageUrl: Artist image URL

    Returns:
        bool: True if successful, False if already featured
    """
    conn = get_db()
    cursor = conn.cursor()

    try:
        # Check if user already featured this specific artist
        cursor.execute("""
            SELECT id FROM FeaturedArtist
            WHERE userName = %s AND spotifyArtistId = %s
        """, (userName, artist_data.get('spotifyArtistId')))

        if cursor.fetchone():
            return False  # Already featured this artist

        # Insert new featured artist
        cursor.execute("""
            INSERT INTO FeaturedArtist (userName, artistName, spotifyArtistId, imageUrl)
            VALUES (%s, %s, %s, %s)
        """, (
            userName,
            artist_data.get('artistName'),
            artist_data.get('spotifyArtistId'),
            artist_data.get('imageUrl')
        ))

        conn.commit()
        return True

    except Exception as e:
        conn.rollback()
        print(f"Error adding featured artist: {e}")
        raise e
    finally:
        cursor.close()
        conn.close()


def remove_featured_artist(userName: str, spotifyArtistId: str) -> bool:
    """
    Remove a specific artist from user's featured artists.

    Args:
        userName: The user's userName
        spotifyArtistId: Spotify artist ID of the artist to remove

    Returns:
        bool: True if an artist was removed, False if not found
    """
    conn = get_db()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            DELETE FROM FeaturedArtist
            WHERE userName = %s AND spotifyArtistId = %s
        """, (userName, spotifyArtistId))

        conn.commit()
        return cursor.rowcount > 0

    except Exception as e:
        conn.rollback()
        raise e
    finally:
        cursor.close()
        conn.close()


def get_user_featured_artists(userName: str) -> List[Dict]:
    """
    Get all featured artists for a specific user.

    Args:
        userName: The user's userName

    Returns:
        List of featured artists, sorted by most recent first
    """
    conn = get_db()
    cursor = conn.cursor(dictionary=True)

    try:
        cursor.execute("""
            SELECT
                id,
                userName,
                artistName,
                spotifyArtistId,
                imageUrl,
                featuredAt
            FROM FeaturedArtist
            WHERE userName = %s
            ORDER BY featuredAt DESC
        """, (userName,))

        return cursor.fetchall()

    finally:
        cursor.close()
        conn.close()


def get_friends_featured_artists(userName: str) -> List[Dict]:
    """
    Get all featured artists from a user's friends (rolling feed).

    Args:
        userName: The user's userName

    Returns:
        List of dictionaries with friend info and their featured artists, sorted by recency
    """
    conn = get_db()
    cursor = conn.cursor(dictionary=True)

    try:
        cursor.execute("""
            SELECT
                u.userName,
                u.displayName,
                u.profilePicture,
                fa.id as featuredArtistId,
                fa.artistName,
                fa.spotifyArtistId,
                fa.imageUrl,
                fa.featuredAt
            FROM UserFriends uf
            JOIN User u ON uf.friendUserName = u.userName
            JOIN FeaturedArtist fa ON u.userName = fa.userName
            WHERE uf.userName = %s
            ORDER BY fa.featuredAt DESC
        """, (userName,))

        return cursor.fetchall()

    finally:
        cursor.close()
        conn.close()
