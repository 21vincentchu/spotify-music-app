"""
Scheduled background jobs for Reverb.
Runs daily stats refresh for all users at 5am.
"""
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
import spotipy
from spotipy.oauth2 import SpotifyOAuth
from db import get_db
from db_functions import fetch_and_insert_all_stats
from config import Config

def get_all_users_with_tokens():
    """Fetch all users who have refresh tokens."""
    conn = get_db()
    cursor = conn.cursor()

    try:
        cursor.execute("SELECT userName, refreshToken FROM User WHERE refreshToken IS NOT NULL")
        users = cursor.fetchall()
        return users
    finally:
        cursor.close()
        conn.close()

def get_spotify_client(refresh_token):
    """Get authenticated Spotify client from refresh token."""
    try:
        sp_oauth = SpotifyOAuth(
            client_id=Config.SPOTIFY_CLIENT_ID,
            client_secret=Config.SPOTIFY_CLIENT_SECRET,
            redirect_uri=Config.SPOTIPY_REDIRECT_URI,
            scope=Config.SPOTIFY_SCOPE
        )
        token_info = sp_oauth.refresh_access_token(refresh_token)
        return spotipy.Spotify(auth=token_info['access_token'])
    except Exception as e:
        print(f"[SCHEDULER] Auth failed: {e}", flush=True)
        return None

def scheduled_stats_refresh():
    """Main scheduled job - updates stats for all users daily at 5am."""
    print("="*60, flush=True)
    print("[SCHEDULER] Starting daily stats refresh", flush=True)
    print("="*60, flush=True)

    users = get_all_users_with_tokens()
    print(f"[SCHEDULER] Found {len(users)} users to update", flush=True)

    for user_name, refresh_token in users:
        print(f"[SCHEDULER] Updating {user_name}...", flush=True)

        sp = get_spotify_client(refresh_token)
        if not sp:
            print(f"[SCHEDULER] Skipping {user_name} - auth failed", flush=True)
            continue

        try:
            for timeframe in ['short_term', 'medium_term', 'long_term']:
                # Uncomment below to enable 7-day cache (only refresh if > 7 days old)
                # from db_functions import get_cached_stats_id
                # cached = get_cached_stats_id(user_name, timeframe, max_age_hours=168)
                # if cached:
                #     print(f"[SCHEDULER] {user_name} - {timeframe}: Still fresh (< 7 days), skipping", flush=True)
                #     continue

                print(f"[SCHEDULER] {user_name} - {timeframe}: Fetching fresh data", flush=True)
                fetch_and_insert_all_stats(user_name, timeframe, sp)
            print(f"[SCHEDULER] ✓ Completed {user_name}", flush=True)
        except Exception as e:
            print(f"[SCHEDULER] Error for {user_name}: {e}", flush=True)

    print("="*60, flush=True)
    print(f"[SCHEDULER] Daily refresh completed", flush=True)
    print("="*60, flush=True)

def init_scheduler():
    """Initialize scheduler - runs daily at 5am."""
    scheduler = BackgroundScheduler()

    scheduler.add_job(
        func=scheduled_stats_refresh,
        trigger=CronTrigger(hour=5, minute=0),
        id='daily_stats_refresh',
        name='Daily stats refresh at 5am',
        replace_existing=True
    )

    scheduler.start()
    print("[SCHEDULER] Initialized - runs daily at 5:00 AM", flush=True)
    return scheduler

if __name__ == "__main__":
    scheduled_stats_refresh()
