from db import get_db

def get_user_profile(userName):
    """Get user profile data"""
    conn = get_db()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT userName, spotifyId, displayName, profilePicture
            FROM User WHERE userName = %s
        """, (userName,))
        return cursor.fetchone()
    finally:
        cursor.close()
        conn.close()

def update_display_name(userName, displayName):
    """Update user's displayName"""
    conn = get_db()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            UPDATE User
            SET displayName = %s
            WHERE userName = %s
        """, (displayName, userName))
        conn.commit()
        return True
    except Exception:
        conn.rollback()
        raise
    finally:
        cursor.close()
        conn.close()

def get_profile_stats(userName):
    """Get user profile statistics"""
    conn = get_db()
    cursor = conn.cursor()
    try:
        # Get total songs rated
        cursor.execute("""
            SELECT COUNT(*) FROM RatedSong WHERE userName = %s
        """, (userName,))
        songs_rated = cursor.fetchone()[0]

        # Get total albums rated
        cursor.execute("""
            SELECT COUNT(*) FROM RatedAlbum WHERE userName = %s
        """, (userName,))
        albums_rated = cursor.fetchone()[0]

        # Get number of friends
        cursor.execute("""
            SELECT COUNT(*) FROM UserFriends WHERE userName = %s
        """, (userName,))
        friends_count = cursor.fetchone()[0]

        return {
            'songsRated': songs_rated,
            'albumsRated': albums_rated,
            'friendsCount': friends_count
        }
    finally:
        cursor.close()
        conn.close()

def delete_user_account(userName):
    """Delete user account and all associated data"""
    conn = get_db()
    cursor = conn.cursor()
    try:
        # Delete user (CASCADE will delete all related data)
        cursor.execute("""
            DELETE FROM User WHERE userName = %s
        """, (userName,))
        conn.commit()
        return True
    except Exception:
        conn.rollback()
        raise
    finally:
        cursor.close()
        conn.close()
