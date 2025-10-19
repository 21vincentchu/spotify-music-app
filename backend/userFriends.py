##insert user friend into database
from db import get_db
from typing import List, Dict


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
    SELECT from userFriends WHERE userFriends = %s AND friendUserName = %s
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
    Delete from userFriends WHERE (userFriends = %s AND friendUserName = %s) OR (userFriends = %s AND friendUserName = %s)
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
                        SELECT u.userName. u.spotifyId, u.profilePic, u.displayName FROM userFriends uf JOIN User u on uf.friendUserName = u.userName
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
##get friend top artists
##get friend top albums
##get friends recently played
##search user friend 

