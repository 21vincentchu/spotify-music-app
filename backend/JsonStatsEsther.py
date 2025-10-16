import  jsonify
import spotipy 

def fetch_all_top_songs(sp: spotipy.Spotify, time_range: str, batch_size: int = 50) -> list:
    """
    Fetch all top songs for a given time range and extract data for TopSong table.

    Args:
        sp: Authenticated Spotify client instance
        time_range: 'short_term' (4 weeks), 'medium_term' (6 months), or 'long_term' (several years)
        batch_size: Number of items to fetch per request (default 50, max 50)

    Returns:
        List of json objects containing song data formatted for database insertion:
        {
            'songName': str,
            'artistName': str,
            'spotifyTrackId': str,
            'rank': int,
            'imageUrl': str,
            'playCount': int (defaults to 0 as Spotify doesn't provide this)
        }
    """
    songs = []
    offset = 0
    rank = 1

    while True:
        batch = sp.current_user_top_tracks(limit=batch_size, offset=offset, time_range=time_range)

        for track in batch['items']:
            song_data = {
                'songName': track['name'],
                'artistName': track['artists'][0]['name'] if track.get('artists') else 'Unknown Artist',
                'spotifyTrackId': track['id'],
                'rank': rank,
                'imageUrl': track['album']['images'][0]['url'] if track.get('album', {}).get('images') else None,
                'playCount': 0  # Spotify API doesn't provide play counts for top tracks
            }
            songs.append(song_data)
            rank += 1

        # Check to see if we got all available tracks
        if len(batch['items']) < batch_size:
            break

        offset += batch_size

    return jsonify(songs)