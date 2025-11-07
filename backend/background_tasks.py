"""
Background tasks for user stats prefetching.
Handles quick pulls (limited data) and full pulls (all data + albums).
"""
import spotipy
from db_functions import get_cached_stats_id, fetch_and_insert_all_stats, insert_stats_record, insert_top_songs_to_db, insert_top_artists_to_db
from stats import fetch_all_top_songs, fetch_all_top_artists


def quick_prefetch_on_login(access_token: str, user_name: str):
    """
    Quick prefetch on login - pulls limited data (150 max) so user sees results fast.
    Only fetches songs and artists, no albums yet.
    Checks 24-hour cache before pulling.
    """
    try:
        sp = spotipy.Spotify(auth=access_token)

        print(f"[QUICK] Starting quick pull for {user_name}", flush=True)

        for timeframe in ['short_term', 'medium_term', 'long_term']:
            # Check if already exists (< 24 hours)
            if get_cached_stats_id(user_name, timeframe, max_age_hours=24):
                print(f"[QUICK] {timeframe}: Already cached (< 24hrs), skipping", flush=True)
                continue

            # Fetch limited data (max 150)
            songs = fetch_all_top_songs(sp, timeframe, max_items=150)
            artists = fetch_all_top_artists(sp, timeframe, max_items=150)

            # Insert into database
            stats_id = insert_stats_record(user_name, timeframe=timeframe)
            insert_top_songs_to_db(stats_id=stats_id, songs=songs)
            insert_top_artists_to_db(stats_id=stats_id, artists=artists)

            print(f"[QUICK] {timeframe}: {len(songs)} songs, {len(artists)} artists (no albums yet)", flush=True)

        print(f"[QUICK] Quick pull completed for {user_name}", flush=True)

    except Exception as e:
        print(f"[QUICK] Error: {e}", flush=True)


def prefetch_all_stats(access_token: str, user_name: str):
    """
    Background task to prefetch ALL stats after login.
    Pulls ALL songs (6-8k), runs album algorithm. Takes 2-3 minutes.
    Only runs if data is > 7 days old (weekly refresh).
    """
    try:
        sp = spotipy.Spotify(auth=access_token)

        print(f"[FULL] Starting full background pull for {user_name}", flush=True)

        for timeframe in ['short_term', 'medium_term', 'long_term']:
            # Check if we have recent full stats (< 7 days)
            cached = get_cached_stats_id(user_name, timeframe, max_age_hours=168)  # 7 days = 168 hours

            if cached:
                print(f"[FULL] {timeframe}: Cache still fresh (< 7 days), skipping", flush=True)
                continue

            # Do full pull to get albums
            print(f"[FULL] {timeframe}: Fetching ALL data (> 7 days old)...", flush=True)
            fetch_and_insert_all_stats(user_name, timeframe, sp)

        print(f"[FULL]  Full pull completed for {user_name}", flush=True)

    except Exception as e:
        print(f"[FULL] Error: {e}", flush=True)
