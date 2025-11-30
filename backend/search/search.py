
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
                       
        # If no DB results, fallback to Spotify Search API
        if not results:
            sp, _ = get_authenticated_spotify_client()
            if not sp:
                return results

            try:
                # Use Spotify's search API for tracks, albums, and artists
                search_results = sp.search(q=searchQuery, type='track,album,artist', limit=limit)

                # Parse track results
                if 'tracks' in search_results and search_results['tracks']['items']:
                    for track in search_results['tracks']['items']:
                        artists = track.get('artists', [])
                        album = track.get('album', {})
                        images = album.get('images', [])
                        results.append({
                            'name': track.get('name'),
                            'artist': artists[0]['name'] if artists else 'Unknown Artist',
                            'spotifyId': track.get('id'),
                            'imageUrl': images[0]['url'] if images else None,
                            'type': 'song'
                        })

                # Parse album results
                if 'albums' in search_results and search_results['albums']['items']:
                    for album in search_results['albums']['items']:
                        artists = album.get('artists', [])
                        images = album.get('images', [])
                        results.append({
                            'name': album.get('name'),
                            'artist': artists[0]['name'] if artists else 'Unknown Artist',
                            'spotifyId': album.get('id'),
                            'imageUrl': images[0]['url'] if images else None,
                            'type': 'album'
                        })

                # Parse artist results
                if 'artists' in search_results and search_results['artists']['items']:
                    for artist in search_results['artists']['items']:
                        images = artist.get('images', [])
                        results.append({
                            'name': artist.get('name'),
                            'artist': None,
                            'spotifyId': artist.get('id'),
                            'imageUrl': images[0]['url'] if images else None,
                            'type': 'artist'
                        })

            except Exception as e:
                print(f"Spotify search failed: {e}")
                         
        return results
             
    finally:
            cursor.close()
            conn.close() 


        
           

        