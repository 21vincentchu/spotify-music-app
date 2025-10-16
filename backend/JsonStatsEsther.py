import  jsonify
import spotipy 

def fetch_all_top_songs_Josnify(sp: spotipy.Spotify, time_range: str, batch_size: int = 50) -> list:
    """
    Fetch all top songs for a given time range and extract data for TopSong table.

    Args:
        sp: Authenticated Spotify client instance
        time_range: 'short_term' (4 weeks), 'medium_term' (6 months), or 'long_term' (several years)
        batch_size: Number of items to fetch per request (default 50, max 50)

    Returns:
        List of json objects containing song data formatted for frontend interaction:
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

def fetch_all_top_artists_Jsonify(sp: spotipy.Spotify, time_range: str, batch_size: int = 50) -> list:
    """
    Fetch all top artists for a given time range and extract data for TopArtist table.

    Args:
        sp: Authenticated Spotify client instance
        time_range: 'short_term' (4 weeks), 'medium_term' (6 months), or 'long_term' (several years)
        batch_size: Number of items to fetch per request (default 50, max 50)

    Returns:
        List of Json objects containing song data formatted for frontend interaction:
        {
            'artistName': str,
            'spotifyTrackId': str,
            'rank': int,
            'imageUrl': str,
            'playCount': int (defaults to 0 as Spotify doesn't provide this)
        }
    """
    artists = []
    offset = 0
    rank = 1

    while True:
        batch = sp.current_user_top_artists(limit=batch_size, offset=offset, time_range=time_range)

        for artist in batch['items']:
            song_data = {
                'artistName': artist['name'],
                'spotifyArtistId': artist['id'],
                'rank': rank,
                'imageUrl': artist['images'][0]['url'] if artist.get('images') else None,
                'playCount': 0  # Spotify API doesn't provide play counts for top tracks
            }
            artists.append(song_data)
            rank += 1

        # Check to see if we got all available tracks
        if len(batch['items']) < batch_size:
            break

        offset += batch_size

    return artists

def insert_top_artists_to_db(stats_id: int, artists: list) -> None:
    """
    Insert top artists data into the TopSong table.

    Args:
        stats_id: The statsID foreign key from the Stats table
        Artists: List of artist dictionaries from fetch_all_top_artists()
    """
    from db import get_db

    conn = get_db()
    cursor = conn.cursor()

    try:
        for artist in artists:
                cursor.execute("""
                    INSERT INTO TopArtist (statsID, artistName, spotifyArtistId, `rank`, playCount, imageUrl)
                VALUES (%s, %s, %s, %s, %s, %s)
            """, (
                    stats_id,
                    artist['artistName'],
                    artist['spotifyArtistId'],
                    artist['rank'],
                    artist['playCount'],
                    artist['imageUrl']
                ))

        conn.commit()
    except Exception as e:
            conn.rollback()
            raise e
    finally:
        cursor.close()
        conn.close()

    return jsonify(artists)
