
from typing import List, Dict
from auth import get_authenticated_spotify_client

"""
Search for artists, albums, and songs using Spotify API
Returns: List[Dict]
"""
def search_music_all(searchQuery: str, limit: int = 20) -> List[Dict]:
    results = []

    # Get authenticated Spotify client
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


        
           

        