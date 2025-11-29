from db import get_db
from typing import List, Dict

"""
search an artist, album, song in db 
if this is empty, use the spotify API 
Returns: List[Dict]
"""
def search_music_all(searchQuery: str, limit: int = 20):
    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    search_pattern = f"%{searchQuery}%"
    results = []

    try:
        cursor.execute("""
             Select songName AS name, artistName AS artist, spotifyTrackId AS spotifyId, imageUrl, 'song' AS type        

             FROM(
                    SELECT songName, artistName, spotifyTrackId, imageUrl FROM TopSong
                    UNION
                    SELECT songName, artistName, spotifyTrackId, imageUrl FROM RatedSong
                    UNION
                    SELECT songName, artistName, spotifyTrackId, imageUrl FROM FeaturedSong
                    ) AS songs
                    WHERE songName LIKE %s OR artistName LIKE %s 
                    LIMIT %s;
                    """, (search_pattern, search_pattern, limit))
        results.extend(cursor.fetchall())
        
        cursor.execute("""
              Select albumName AS name, artistName AS artist, spotifyAlbumId AS spotifyId, imageUrl, 'album' AS type
             
              FROM(
                     SELECT albumName, artistName, spotifyAlbumId, imageUrl FROM TopAlbum
                     UNION
                     SELECT albumName, artistName, spotifyAlbumId, imageUrl FROM RatedAlbum
                     UNION
                     SELECT albumName, artistName, spotifyAlbumId, imageUrl FROM FeaturedAlbum
                     ) AS albums
                       WHERE albumName LIKE %s OR artistNAME LIKE %s
                       LIMIT %s;
                       """, (search_pattern, search_pattern, limit))
        results.extend(cursor.fetchall())

        cursor.execute("""
                Select artistName as name, spotifyArtistId as spotifyId, imageUrl, 'artist' as type
                       
                FROM(
                       SELECT artistName, spotifyArtistId, imageUrl FROM topArtist
                       UNION
                       SELECT artistName, spotifyArtistId, imageUrl FROM FeaturedArtist
                       ) AS artists   
                       WHERE artistName LIKE %s 
                       LIMIT %s;
                       """, (search_pattern, limit))
        results.extend(cursor.fetchall())
                       
        if not results:
            pass
            ##return the spotify search function

        return results
    
    finally:
            cursor.close()
            conn.close() 

            

        
           

        