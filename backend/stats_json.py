from flask import jsonify, session
import spotipy
from db_functions import *

class stat_Conversions:

    def fetch_all_top_songs_Jsonify(sp: spotipy.Spotify, time_range: str, batch_size: int = 50) -> list:
        """
        Fetch top songs - checks database first, falls back to Spotify API if data is stale.

        Args:
            sp: Authenticated Spotify client instance
            time_range: 'short_term' (4 weeks), 'medium_term' (6 months), or 'long_term' (several years)
            batch_size: Number of items to fetch per request (default 50, max 50)

        Returns:
            JSON response containing song data formatted for frontend interaction
        """
        userName = session.get('userName')

        # Check if we have recent stats in database (< 24 hours)
        existing_stats_id = get_cached_stats_id(userName, timeframe=time_range, max_age_hours=24)

        if not existing_stats_id:
            # Fetch and insert ALL stats (songs, albums, artists) into ONE record
            existing_stats_id = fetch_and_insert_all_stats(userName, time_range, sp)

        # Read songs from database
        print(f"Reading songs from database (stats_id: {existing_stats_id})", flush=True)
        songs = get_top_songs_from_db(existing_stats_id)
        return jsonify(songs)

    def fetch_all_top_artists_Jsonify(sp: spotipy.Spotify, time_range: str, batch_size: int = 50) -> list:
        """
        Fetch top artists - checks database first, falls back to Spotify API if data is stale.

        Args:
            sp: Authenticated Spotify client instance
            time_range: 'short_term' (4 weeks), 'medium_term' (6 months), or 'long_term' (several years)
            batch_size: Number of items to fetch per request (default 50, max 50)

        Returns:
            JSON response containing artist data formatted for frontend interaction
        """
        userName = session.get('userName')

        # Check if we have recent stats in database (< 24 hours)
        existing_stats_id = get_cached_stats_id(userName, timeframe=time_range, max_age_hours=24)

        if not existing_stats_id:
            # Fetch and insert ALL stats (songs, albums, artists) into ONE record
            existing_stats_id = fetch_and_insert_all_stats(userName, time_range, sp)

        # Read artists from database
        print(f"Reading artists from database (stats_id: {existing_stats_id})", flush=True)
        artists = get_top_artists_from_db(existing_stats_id)
        return jsonify(artists)

    def fetch_all_top_albums(sp: spotipy.Spotify, time_range: str, batch_size: int = 50) -> list:
        """
        Fetch top albums - checks database first, falls back to Spotify API if data is stale.
        Derives albums from top tracks and ranks by the number of top tracks they contain.

        Args:
            sp: Authenticated Spotify client instance
            time_range: 'short_term' (4 weeks), 'medium_term' (6 months), or 'long_term' (several years)
            batch_size: Number of tracks to fetch per batch (default 50)

        Returns:
            JSON response containing album data formatted for frontend interaction, ranked by track count
        """
        userName = session.get('userName')

        # Check if we have recent stats in database (< 24 hours)
        existing_stats_id = get_cached_stats_id(userName, timeframe=time_range, max_age_hours=24)

        # If stats exist, check if they have album data
        # Quick pulls create stats with songs/artists but NO albums
        if existing_stats_id:
            albums = get_top_albums_from_db(existing_stats_id)
            if albums:
                print(f"Reading albums from database (stats_id: {existing_stats_id})", flush=True)
                return jsonify(albums)
            else:
                print(f"Stats exist but no albums found - triggering full pull", flush=True)

        # No stats or no albums - run full pull to calculate albums
        print(f"Running full pull to calculate albums for {userName} - {time_range}", flush=True)
        existing_stats_id = fetch_and_insert_all_stats(userName, time_range, sp)

        # Read albums from database after full pull
        print(f"Reading albums from database after full pull (stats_id: {existing_stats_id})", flush=True)
        albums = get_top_albums_from_db(existing_stats_id)
        return jsonify(albums)