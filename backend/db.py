import mysql.connector
from mysql.connector import errorcode
from config import Config

def get_db():
    """
    Get database connection using configuration.
    Supports both local Docker setup and DigitalOcean managed database.
    """
    try:
        mydb = mysql.connector.connect(
            host=Config.MYSQL_HOST,
            port=Config.MYSQL_PORT,
            user=Config.MYSQL_USER,
            password=Config.MYSQL_PASSWORD,
            database=Config.MYSQL_DATABASE
        )
    except mysql.connector.Error as err:
        if err.errno == errorcode.ER_ACCESS_DENIED_ERROR:
            print("ERROR: Database access denied - check credentials")
        elif err.errno == errorcode.ER_BAD_DB_ERROR:
            print(f"ERROR: Database '{Config.MYSQL_DATABASE}' does not exist")
            exit()
        else:
            print(f"ERROR: Database connection failed: {err}")
            print("ERROR: Service not available")
            exit()
    return mydb