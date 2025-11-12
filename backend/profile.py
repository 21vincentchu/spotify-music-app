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

