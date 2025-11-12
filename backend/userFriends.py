##insert user friend into database
from db import get_db
from typing import List, Dict
from flask import session

def insert_friend(userName: str, friendUserName: str):
    '''
    Adds a friend relationship

    Params:
    username: user adding friend
    friendusername: user being added

    Args: 
    returns true if accepted, false if not 
    '''

    conn = get_db()
    cursor = conn.cursor()

    try:
        cursor.execute("""
    SELECT * from userFriends WHERE userName = %s AND friendUserName = %s
                """, (userName, friendUserName))

        if cursor.fetchone():
            return False ##if exists, return false'
        
        ##insert relationship
        cursor.execute("""
            INSERT INTO UserFriends (userName, friendUserName)
            VALUES (%s, %s), (%s, %s)
        """, (userName, friendUserName, friendUserName, userName))

        conn.commit()
        return True

    except Exception as e:
        conn.rollback
        raise e 
    finally:
        cursor.close()
        conn.close()

##delete user friend
def delete_friend(userName: str, friendUserName: str):
    '''
    deletes a friend from user

    Params:
    username: user adding friend
    friendusername: user being added

    Args: 
    returns true if accepted, false if not 
    '''
    
    conn = get_db()
    cursor = conn.cursor()

        
    ##delete from a relationship
    try:
        cursor.execute("""
    Delete * from userFriends WHERE (userName = %s AND friendUserName = %s) OR (userName = %s AND friendUserName = %s)
                """, (userName, friendUserName, friendUserName, userName))

        conn.commit()
        return True

    except Exception as e:
        conn.rollback
        raise e 
    finally:
        cursor.close()
        conn.close()

##get user friends
def get_friend(userName: str) -> List[Dict]:
    """
    Get all user friends with their profile info
    Args:
    userName: User's userName 
    """
    conn = get_db()
    cursor = conn.cursor(dictionary=True)

    try:
        cursor.execute("""
                        SELECT u.userName, u.spotifyId, u.profilePicture, u.displayName FROM userFriends uf JOIN User u on uf.friendUserName = u.userName
                        LEFT JOIN RecentlyPlayed rp ON u.userName = rp.userName
                        WHERE uf.userName = %s
                        GROUP BY u.userName, u.displayName, u.profilePicture, u.spotifyId
                        ORDER BY lastActive DESC, u.displayName
                    """, (userName,))
        
        return cursor.fetchall()
    except:
        cursor.close()
        conn.close()

## check friendship 


##gets friend count 
def get_user_friend_count(userName: str) -> int:
    """
    Gets total number of friend for a user:

    Args:
        userName: User's username
    
    Returns:
        int: number of friends
    """
    conn = get_db()
    cursor = conn.cursor()

    try:
        cursor.execute("""
           SELECT COUNT(*) as friendCount
                       From UserFriends
                       Where userName = %s             
                       """,(userName,))
        result = cursor.fetchone()
        return result[0]
    finally:
        cursor.close()
        conn.close()
##get friend top songs
def get_top_songs(friendUserName: str, timeframe: str = 'short_term', limit: int =10) -> List[Dict]:
    """
    Get a friend's top songs for a specific timeframe

    Args:
        friendUserName: The friend's userName
        timeframe: the timeframe of the top songs
        limit: max number of songs that are returned           
    Return: 
        A list of song dictionaries
    """
    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("""
        SELECT
            ts.songName,
            ts.artistName,
            ts.spotifyTrackId,
            ts.rank,
            ts.playCount,
            ts.imageUrl,
            s.timeframe,
        FROM topSong ts
        JOIN Stats s ON ts.statsID = s.uniqueID
        WHERE s.userName = %s AND s.timeframe = %s
        ORDER BY ts.rank
        LIMIT %s
    """, (friendUserName, timeframe, limit))
        
        return cursor.fetchall()
    finally:
        cursor.close()
        conn.close()

def get_friend_top_artists(friendUserName: str, timeframe: str = 'short_term', limit: int = 10) -> list[Dict]:
    """
    Get a friend's top artists for a specific timeframe

    Args:
        friendUserName: The friend's userName
        timeframe: the timeframe of the top songs
        limit: max number of artists that are returned           
    Return: 
        A list of artists dictionaries
    """                      
    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute
        ("""
        SELECT
             ta.artistName,
                ta.spotifyArtistId,
                ta.rank,
                ta.playCount,
                ta.imageUrl,
                s.timeframe
            FROM TopArtist ta
            JOIN Stats s ON ta.statsID = s.uniqueID
            WHERE s.userName = %s AND s.timeframe = %s
            ORDER BY ta.rank
            LIMIT %s
        """, (friendUserName, timeframe, limit))

        
        return cursor.fetchall()
    finally:
        cursor.close()
        conn.close()

def get_friend_top_albums(friendUserName: str, timeframe: str = 'short_term', limit: int=10) -> List[Dict]:
    """
    Get a friend's top albums for a specific timeframe

    Args:
        friendUserName: The friend's userName
        timeframe: the timeframe of the top albums
        limit: max number of albums that are returned           
    Return: 
        A list of albums dictionaries
    """ 
    conn = get_db()
    cursor = conn.cursor(dictionary=True)

    try:
        cursor.execute("""
        SELECT 
        tab.albumName,
        tab.artistName,
        tab.spotifyAlbumId,
        tab.rank,
        tab.playCount,
        tab.imageUrl,
        s.timeframe
    FROM TopAlbum tab
    JOIN Stats s ON tab.statsID = s.uniqueID
    WHERE s.userName = %s AND s.timeframe = %s
    ORDER BY tab.rank
    LIMIT %s
""", (friendUserName, timeframe, limit))
        return cursor.fetchall()
    finally:
        cursor.close()
        conn.close()

def get_friend_recently_played(friendUserName: str, limit: int = 50):
    """
    
    Get a friend's complete profile with stats.

    Args:
        friendUserName: The friend's userName

    Returns:
        Dictionary with profile information or None if not found

    """
    conn = get_db()
    cursor = conn.cursor(dictionary=True)

    try:
        cursor.execute("""
            SELECT
            u.userName,
            u.displayName,
            u.profilePicture,
            fs.songName as featuredSongName,
            fs.artistName as featuredArtistName,
            fs.imageUrl as featuredSongImage,
            (SELECT COUNT(*) FROM RatedAlbum WHERE userName = u.userName) as ratedAlbumsCount,
             (SELECT COUNT(*) FROM RatedSong WHERE userName = u.userName) as ratedSongsCount,
                (SELECT MAX(playedAt) FROM RecentlyPlayed WHERE userName = u.userName) as lastActive
            FROM User u
            LEFT JOIN FeaturedSong fs ON u.userName = fs.userName
            WHERE u.userName = %s
            """, (friendUserName,))
        return cursor.fetchone()
    finally:
            cursor.close()
            conn.close()
def search_users(SearchQuery: str, currentUserName: str, limit: int = 20) -> List[Dict]:
    """
    search for users by username or displayname 
    Args: 
    searchquery: searches 
    currentusername: current users username
    limit: maximum number of results
    returns:
    list of user dictionaries of friendship staus
    """
    conn = get_db()
    cursor = conn.cursor(dictionary=True)

    try:
        currentUserName = session.get('userName')
        if not currentUserName:
            raise ValueError("User not logged in or session expired.")

        search_pattern = f"%{SearchQuery}%"

        cursor.execute("""
            SELECT
            u.userName,
            u.displayName,
            u.profilePicture,
            CASE
                WHEN uf.friendUserName is NOT NULL THEN TRUE
                ELSE FALSE
            END as isFriend
            FROM User u 
            LEFT JOIN UserFriends uf ON u.userName = uf.friendUserName %s
                       WHERE(u.userName LIKE %s OR u.displayName LIKE %s)
                       AND u.userName != %s
                       LIMIT %s
                       """, (currentUserName, search_pattern, search_pattern, currentUserName, limit))
        
        return cursor.fetchall()
    finally:
        cursor.close()
        conn.close()
                    