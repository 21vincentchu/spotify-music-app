## database calls go here 
from db import get_db
from typing import Dict
##get + create album review, album rating, song review, song rating

def get_song_rating(username, SpotifyTrackID):
     """
    gets a song rating and review.
    
    Args:
        userName: The userName (Spotify ID)
        spotifyTrackId: Spotify track ID
        songName: Name of the song
        artistName: Name of the artist
        rating: Rating value (0-5, supports 0.5 increments)
        comment: Optional review text
        
    Returns:
        uniqueID: The ID of the created/updated rating record
    """
     conn = get_db()
     cursor = conn.cursor(dictionary=True, buffered=True)
     try: 
         cursor.execute("""
            SELECT uniqueID, songName, artistName, rating, comment, imageUrl, createdAt, updatedAt
            FROM RatedSong
            WHERE userName = %s AND spotifyTrackId = %s
        """, (username, SpotifyTrackID))
         return cursor.fetchone()
     finally:
         cursor.close()
         conn.close()

def get_album_rating(username, SpotifyAlbumID):
     """
    gets an album rating and review.
    
    Args:
        userName: The userName (Spotify ID)
        albumName: the album name
        spotifyTrackId: Spotify track ID
        artistName: Name of the artist
        rating: Rating value (0-5, supports 0.5 increments)
        comment: Optional review text
        
    Returns:
        uniqueID: The ID of the created/updated rating record
    """
     conn = get_db()
     cursor = conn.cursor()
     try: 
         cursor.execute("""
            SELECT uniqueID, albumName, artistName, rating, comment, imageUrl, createdAt, updatedAt
            FROM RatedSong
            WHERE userName = %s AND spotifyTrackId = %s
        """, (username, SpotifyAlbumID))
         return cursor.fetchone()
     finally:
         cursor.close()
         conn.close()
         

def create_song_rating(userName, spotifyTrackId, songName, artistName, rating, imageUrl, comment=None):
    """
    Create or update a song rating and review.
    
    Args:
        userName: The userName (Spotify ID)
        spotifyTrackId: Spotify track ID
        songName: Name of the song
        artistName: Name of the artist
        rating: Rating value (0-5, supports 0.5 increments)
        comment: Optional review text
        
    Returns:
        uniqueID: The ID of the created/updated rating record
    """
    conn = get_db()
    cursor = conn.cursor()
    
    try:
        # Insert or update rating
        cursor.execute("""
            INSERT INTO RatedSong (userName, spotifyTrackId, songName, artistName, rating, comment, imageUrl)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (userName, spotifyTrackId, songName, artistName, rating, comment, imageUrl))
        
        conn.commit()
        # Get the ID of the inserted/updated record
        cursor.execute("""
            SELECT uniqueID FROM RatedSong 
            WHERE userName = %s AND spotifyTrackId = %s
        """, (userName, spotifyTrackId))
        
        result = cursor.fetchone()
        return result[0] if result else None
        
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        cursor.close()
        conn.close()


def create_album_rating(userName, spotifyAlbumId, albumName, artistName, rating, imageUrl, comment=None):
    """
    Create or update an album rating and review.
    
    Args:
        userName: The userName (Spotify ID)
        spotifyAlbumId: Spotify album ID
        albumName: Name of the album
        artistName: Name of the artist
        rating: Rating value (0-5, supports 0.5 increments)
        comment: Optional review text
        
    Returns:
        uniqueID: The ID of the created/updated rating record
    """
    conn = get_db()
    cursor = conn.cursor()
    
    try:
        # Insert or update rating
        cursor.execute("""
            INSERT INTO RatedAlbum (userName, spotifyAlbumId, albumName, artistName, rating, comment, imageUrl)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (userName, spotifyAlbumId, albumName, artistName, rating, comment, imageUrl))
        
        conn.commit()
        
        # Get the ID of the inserted/updated record
        cursor.execute("""
            SELECT uniqueID FROM RatedAlbum 
            WHERE userName = %s AND spotifyAlbumId = %s
        """, (userName, spotifyAlbumId))
        
        result = cursor.fetchone()
        return result[0] if result else None
        
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        cursor.close()
        conn.close()

def delete_song_rating(userName, spotifyTrackId):
    """
    Delete a user's song rating.
    
    Args:
        userName: The userName (Spotify ID)
        spotifyTrackId: Spotify track ID
        
    Returns:
        Boolean indicating if deletion was successful
    """
    conn = get_db()
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            DELETE FROM RatedSong
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


def delete_album_rating(userName, spotifyAlbumId):
    """
    Delete a user's album rating.
    
    Args:
        userName: The userName (Spotify ID)
        spotifyAlbumId: Spotify album ID
        
    Returns:
        Boolean indicating if deletion was successful
    """
    conn = get_db()
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            DELETE FROM RatedAlbum
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

def update_song_rating(UserName, spotifyTrackId, imageUrl, rating=None, comment=None):
    """
    Update a song rating and/or review comment.

    Args:
        userName: Spotify user ID
        spotifyTrackId: Track ID
        rating: New rating (optional)
        comment: New comment (optional)

    Returns:
        Boolean indicating if the update was successful
    """
    conn = get_db()
    cursor = conn.cursor()

    try:
        cursor.execute("""
                       UPDATE RatedSong
            SET rating = COALESCE(%s, rating),
                comment = COALESCE(%s, comment),
                updatedAt = NOW()
            WHERE userName = %s AND spotifyTrackId = %s
        """, (rating, comment, UserName, spotifyTrackId, imageUrl))

        conn.commit()
        return cursor.rowcount > 0
    
    except Exception as e:
        conn.rollback()
        raise e 
    
    finally:
        cursor.close()
        conn.close()


def update_album_rating(UserName, spotifyAlbumId, imageUrl, rating=None, comment=None):
    """
    Update a song rating and/or review comment.

    Args:
        userName: Spotify user ID
        spotifyAlbumId: Track ID
        rating: New rating (optional)
        comment: New comment (optional)

    Returns:
        Boolean indicating if the update was successful
    """
    conn = get_db()
    cursor = conn.cursor()

    try:
        cursor.execute("""
                       UPDATE RatedAlbum
            SET rating = COALESCE(%s, rating),
                comment = COALESCE(%s, comment),
                updatedAt = NOW()
            WHERE userName = %s AND spotifyAlbumId = %s
        """, (rating, comment, UserName, spotifyAlbumId, imageUrl))

        conn.commit()
        return cursor.rowcount > 0
    
    except Exception as e:
        conn.rollback()
        raise e 
    
    finally:
        cursor.close()
        conn.close()

def get_song_by_spotify_id(spotifyTrackId):
    """
    Fetches song information based on spotifyTrackId from multiple tables.
    Returns a dictionary with song details.
    """
    conn = get_db()
    cursor = conn.cursor(dictionary=True)

    try:
        cursor.execute("""
            SELECT songName, artistName, albumName, spotifyTrackId, imageUrl, 'TopSong' AS source
            FROM TopSong
            WHERE spotifyTrackId = %s
            UNION
            SELECT songName, artistName, albumName, spotifyTrackId, imageUrl, 'RecentlyPlayed' AS source
            FROM RecentlyPlayed
            WHERE spotifyTrackId = %s
            UNION
            SELECT songName, artistName, albumName, spotifyTrackId, imageUrl, 'FeaturedSong' AS source
            FROM FeaturedSong
            WHERE spotifyTrackId = %s
            UNION
            SELECT songName, artistName, albumName, spotifyTrackId, imageUrl, 'RatedSong' AS source
            FROM RatedSong
            WHERE spotifyTrackId = %s
            LIMIT 1;
            """), (spotifyTrackId, spotifyTrackId, spotifyTrackId, spotifyTrackId)

        song = cursor.fetchone()
        return song
        
    except Exception as e:
        conn.rollback()
        raise e 
    
    finally:
        cursor.close()
        conn.close()

def get_album_by_spotify_id(spotifyAlbumId):
    """
    Fetches album information based on spotifyAlbumId from multiple tables.
    Returns a dictionary with album details or None if not found.
    """
    conn = get_db()
    cursor = conn.cursor(dictionary=True)

    try:
        cursor.execute("""
            SELECT albumName, artistName, spotifyAlbumId, imageUrl, 'TopAlbum' AS source
            FROM TopAlbum
            WHERE spotifyAlbumId = %s
            UNION
            SELECT albumName, artistName, spotifyAlbumId, imageUrl, 'FeaturedAlbum' AS source
            FROM FeaturedAlbum
            WHERE spotifyAlbumId = %s
            UNION
            SELECT albumName, artistName, spotifyAlbumId, imageUrl, 'RatedAlbum' AS source
            FROM RatedAlbum
            WHERE spotifyAlbumId = %s
            LIMIT 1;
        """, (spotifyAlbumId, spotifyAlbumId, spotifyAlbumId))

        album = cursor.fetchone()
        return album

    finally:
        cursor.close()
        conn.close()




