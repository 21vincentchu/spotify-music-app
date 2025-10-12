-- User table
CREATE TABLE IF NOT EXISTS User (
    userName VARCHAR(255) PRIMARY KEY,
    spotifyId VARCHAR(255) UNIQUE NOT NULL,
    displayName VARCHAR(255),
    profilePicture VARCHAR(512)
);

-- UserFriends table (many-to-many friendship)
CREATE TABLE IF NOT EXISTS UserFriends (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userName VARCHAR(255) NOT NULL,
    friendUserName VARCHAR(255) NOT NULL,
    FOREIGN KEY (userName) REFERENCES User(userName) ON DELETE CASCADE,
    FOREIGN KEY (friendUserName) REFERENCES User(userName) ON DELETE CASCADE,
    UNIQUE KEY unique_friendship (userName, friendUserName)
);

-- Stats table
CREATE TABLE IF NOT EXISTS Stats (
    uniqueID INT AUTO_INCREMENT PRIMARY KEY,
    userName VARCHAR(255) NOT NULL,
    timeframe ENUM('short_term', 'medium_term', 'long_term') NOT NULL,
    totalMinutes INT DEFAULT 0,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userName) REFERENCES User(userName) ON DELETE CASCADE
);

-- TopArtist table
CREATE TABLE IF NOT EXISTS TopArtist (
    id INT AUTO_INCREMENT PRIMARY KEY,
    statsID INT NOT NULL,
    artistName VARCHAR(255),
    spotifyArtistId VARCHAR(255),
    `rank` INT,
    playCount INT DEFAULT 0,
    imageUrl VARCHAR(512),
    FOREIGN KEY (statsID) REFERENCES Stats(uniqueID) ON DELETE CASCADE
);

-- TopAlbum table
CREATE TABLE IF NOT EXISTS TopAlbum (
    id INT AUTO_INCREMENT PRIMARY KEY,
    statsID INT NOT NULL,
    albumName VARCHAR(255),
    artistName VARCHAR(255),
    spotifyAlbumId VARCHAR(255),
    `rank` INT,
    playCount INT DEFAULT 0,
    imageUrl VARCHAR(512),
    FOREIGN KEY (statsID) REFERENCES Stats(uniqueID) ON DELETE CASCADE
);

-- TopSong table
CREATE TABLE IF NOT EXISTS TopSong (
    id INT AUTO_INCREMENT PRIMARY KEY,
    statsID INT NOT NULL,
    songName VARCHAR(255),
    artistName VARCHAR(255),
    spotifyTrackId VARCHAR(255),
    `rank` INT,
    playCount INT DEFAULT 0,
    imageUrl VARCHAR(512),
    FOREIGN KEY (statsID) REFERENCES Stats(uniqueID) ON DELETE CASCADE
);

-- RatedAlbum table
CREATE TABLE IF NOT EXISTS RatedAlbum (
    uniqueID INT AUTO_INCREMENT PRIMARY KEY,
    userName VARCHAR(255) NOT NULL,
    albumName VARCHAR(255),
    artistName VARCHAR(255),
    spotifyAlbumId VARCHAR(255),
    rating DECIMAL(3,1),
    comment TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userName) REFERENCES User(userName) ON DELETE CASCADE
);

-- RatedSong table
CREATE TABLE IF NOT EXISTS RatedSong (
    uniqueID INT AUTO_INCREMENT PRIMARY KEY,
    userName VARCHAR(255) NOT NULL,
    songName VARCHAR(255),
    artistName VARCHAR(255),
    spotifyTrackId VARCHAR(255),
    rating DECIMAL(3,1),
    comment TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userName) REFERENCES User(userName) ON DELETE CASCADE
);

-- RecentlyPlayed table
CREATE TABLE IF NOT EXISTS RecentlyPlayed (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userName VARCHAR(255) NOT NULL,
    songName VARCHAR(255),
    artistName VARCHAR(255),
    albumName VARCHAR(255),
    spotifyTrackId VARCHAR(255),
    playedAt TIMESTAMP,
    FOREIGN KEY (userName) REFERENCES User(userName) ON DELETE CASCADE
);

-- FeaturedSong table
CREATE TABLE IF NOT EXISTS FeaturedSong (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userName VARCHAR(255) NOT NULL,
    songName VARCHAR(255),
    artistName VARCHAR(255),
    albumName VARCHAR(255),
    spotifyTrackId VARCHAR(255),
    imageUrl VARCHAR(512),
    FOREIGN KEY (userName) REFERENCES User(userName) ON DELETE CASCADE
);
