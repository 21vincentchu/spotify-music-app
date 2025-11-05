"""Database migration - runs schema.sql on startup"""
import mysql.connector
from config import Config
import os

def run_migrations():
    conn = mysql.connector.connect(
        host=Config.MYSQL_HOST,
        port=Config.MYSQL_PORT,
        user=Config.MYSQL_USER,
        password=Config.MYSQL_PASSWORD,
        database=Config.MYSQL_DATABASE
    )
    cursor = conn.cursor()

    with open(os.path.join(os.path.dirname(__file__), 'schema.sql'), 'r') as f:
        cursor.execute(f.read(), multi=True)

    conn.commit()
    cursor.close()
    conn.close()
    print("✓ Database migrations completed")
