
from db import get_db
from typing import List, Dict
from ratings.ratings_route import *
from auth import get_authenticated_spotify_client

"""
search an artist, album, song in db 
if this is empty, use the spotify API 
Returns: List[Dict]
"""
def search_music_all(searchQuery: str, limit: int = 20) -> List[Dict]:
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
                       WHERE albumName LIKE %s OR artistName LIKE %s
                       LIMIT %s;
                       """, (search_pattern, search_pattern, limit))
        results.extend(cursor.fetchall())

        cursor.execute("""
                Select artistName as name, spotifyArtistId as spotifyId, imageUrl, 'artist' as type
                       
                FROM(
                       SELECT artistName, spotifyArtistId, imageUrl FROM TopArtist
                       UNION
                       SELECT artistName, spotifyArtistId, imageUrl FROM FeaturedArtist
                       ) AS artists   
                       WHERE artistName LIKE %s 
                       LIMIT %s;
                       """, (search_pattern, limit))
        results.extend(cursor.fetchall())
                       
        if not results:
            sp = get_authenticated_spotify_client()
            spotify_id = searchQuery.strip()
            try:
                 song = fetch_song_from_spotify(sp, spotify_id)
                 results.append({
                      'name': song['songName'],
                      'artist': song['artistName'],
                      'spotifyId': song['spotifyTrackId'],
                      'imageUrl': song['imageUrl'],
                      'type': 'song'
                 })
                 return results
            except Exception as e:
                 print(f"song search failed: {e}")
            
            try:
                 album = fetch_album_from_spotify(sp, spotify_id)
                 results.append({
                      'name': album['albumName'],
                      'artist': album['artistName'],
                      'spotifyId': album['spotifyAlbumId'],
                      'imageUrl': album['imageUrl'],
                      'type': 'album'
                        
                 })
                 return results
            except Exception as e:
                 print(f"album searched failed: {e}")
            try:
                 artist = fetch_artist_from_spotify(sp, spotify_id)
                 results.append({
                      'name': artist['artistName'],
                      'spotifyId': artist['spotifyArtistId'],
                      'imageUrl': artist['imageUrl'],
                      'type': 'artist'
                 })
                 return results
            except Exception as e:
                 print(f"artist searched failed: {e}")
                         
        return results
             
    finally:
            cursor.close()
            conn.close() 


        
           

        