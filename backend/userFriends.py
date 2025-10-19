##insert user friend into database
from db import get_db

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

##get user friend
##check if friends
##get friend top songs
##get friend top artists
##get friend top albums
##get friends recently played
##search user friend 

