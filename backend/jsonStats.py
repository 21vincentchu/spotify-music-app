from flask import jsonify
import spotipy 

class stat_Conversions:
    def fetch_all_top_songs_Jsonify(sp: spotipy.Spotify, time_range: str, batch_size: int = 50) -> list:
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

        return jsonify(artists)

    def fetch_all_top_albums(sp: spotipy.Spotify, time_range: str, batch_size: int = 50) -> list:
        """
        Derive top albums for a given time range based on user's top tracks.
        Ranks albums by the number of top tracks they contain.

        Args:
            sp: Authenticated Spotify client instance
            time_range: 'short_term' (4 weeks), 'medium_term' (6 months), or 'long_term' (several years)
            batch_size: Number of tracks to fetch per batch (default 50)

        Returns:
            List of Json objects containing album data formatted for frontend interaction, ranked by track count
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

        return jsonify(albums)