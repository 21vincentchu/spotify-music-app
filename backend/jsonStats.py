import json
import spotipy

def fetch_all_top_albums(sp: spotipy.Spotify, time_range: str, batch_size: int = 50) -> str:
    """
    Derive top albums for a given time range based on user's top tracks.
    Ranks albums by the number of top tracks they contain.

    Args:
        sp: Authenticated Spotify client instance
        time_range: 'short_term' (4 weeks), 'medium_term' (6 months), or 'long_term' (several years)
        batch_size: Number of tracks to fetch per batch (default 50)

    Returns:
       JSON string of album dictionaries formatted for React frontend, ranked by track count
    """
    # Fetch all top tracks using pagination
    tracks = []
    offset = 0

    while True:
        batch = sp.current_user_top_tracks(limit=batch_size, offset=offset, time_range=time_range)
        tracks.extend(batch['items'])

        if len(batch['items']) < batch_size:
            break

        offset += batch_size

    # Count how many tracks come from each album
    album_track_count = {}
    album_info = {}

    for track in tracks:
        album = track.get('album')
        if not album:
            continue  # Skip tracks without album data

        album_id = album.get('id')
        if not album_id:
            continue

        # Count tracks per album
        album_track_count[album_id] = album_track_count.get(album_id, 0) + 1

        # Store album info (only once per album)
        if album_id not in album_info:
            album_info[album_id] = {
                'albumName': album.get('name'),
                'artistName': album['artists'][0]['name'] if album.get('artists') else 'Unknown Artist',
                'spotifyAlbumId': album_id,
                'imageUrl': album['images'][0]['url'] if album.get('images') else None,
                'playCount': 0  # Spotify doesn't provide play counts
            }

    # Sort albums by track count (descending) and create ranked list
    sorted_album_ids = sorted(album_track_count.keys(), key=lambda aid: album_track_count[aid], reverse=True)

    albums = []
    for rank, album_id in enumerate(sorted_album_ids, start=1):
        album_data = album_info[album_id].copy()
        album_data['rank'] = rank
        albums.append(album_data)

    # Convert to JSON string for React frontend
    json_string = json.dumps(albums)

    return json_string


