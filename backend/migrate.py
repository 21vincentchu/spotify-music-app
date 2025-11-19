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

    # Run schema.sql for table creation
    with open(os.path.join(os.path.dirname(__file__), 'schema.sql'), 'r') as f:
        # Execute each statement separately
        for result in cursor.execute(f.read(), multi=True):
            pass  # Consume the results

    # Run additional migrations for schema changes
    run_additional_migrations(cursor, conn)

    conn.commit()
    cursor.close()
    conn.close()
    print(" Database migrations completed")

def run_additional_migrations(cursor, conn):
    """
    Run additional migrations for existing tables.
    Each migration checks if it's needed before running.
    """

    # Migration 1: Add refreshToken column to User table
    try:
        # Check if column exists
        cursor.execute("""
            SELECT COUNT(*)
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = %s
            AND TABLE_NAME = 'User'
            AND COLUMN_NAME = 'refreshToken'
        """, (Config.MYSQL_DATABASE,))

        exists = cursor.fetchone()[0] > 0

        if not exists:
            print("Adding refreshToken column to User table...")
            cursor.execute("ALTER TABLE User ADD COLUMN refreshToken VARCHAR(512)")
            conn.commit()
            print("refreshToken column added")
        else:
            print("refreshToken column already exists")
    except Exception as e:
        print(f"Migration warning (refreshToken): {e}")

    # Migration 2: Add featuredAt timestamp to FeaturedSong table
    try:
        # Check if column exists
        cursor.execute("""
            SELECT COUNT(*)
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = %s
            AND TABLE_NAME = 'FeaturedSong'
            AND COLUMN_NAME = 'featuredAt'
        """, (Config.MYSQL_DATABASE,))

        exists = cursor.fetchone()[0] > 0

        if not exists:
            print("Adding featuredAt column to FeaturedSong table...")
            cursor.execute("ALTER TABLE FeaturedSong ADD COLUMN featuredAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
            conn.commit()
            print("featuredAt column added")
        else:
            print("featuredAt column already exists")
    except Exception as e:
        print(f"Migration warning (featuredAt): {e}")
