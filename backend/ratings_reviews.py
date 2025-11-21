## database calls go here 
from db import get_db
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
     cursor = conn.cursor()
     try: 
         cursor.execute("""
            SELECT uniqueID, songName, artistName, rating, comment, createdAt, updatedAt
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
            SELECT uniqueID, albumName, artistName, rating, comment, createdAt, updatedAt
            FROM RatedSong
            WHERE userName = %s AND spotifyTrackId = %s
        """, (username, SpotifyAlbumID))
         return cursor.fetchone()
     finally:
         cursor.close()
         conn.close()
         

def create_song_rating(userName, spotifyTrackId, songName, artistName, rating, comment=None):
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
            INSERT INTO RatedSong (userName, spotifyTrackId, songName, artistName, rating, comment)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (userName, spotifyTrackId, songName, artistName, rating, comment))
        
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


def create_album_rating(userName, spotifyAlbumId, albumName, artistName, rating, comment=None):
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
            INSERT INTO RatedAlbum (userName, spotifyAlbumId, albumName, artistName, rating, comment)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (userName, spotifyAlbumId, albumName, artistName, rating, comment))
        
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
