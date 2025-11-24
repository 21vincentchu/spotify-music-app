import axios from 'axios';
import { useEffect, useState, useRef } from 'react';
import SongComponent from '../../components/shared/SongComponent';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import Footer from '../../components/shared/Footer';
import config from '../../config';

function RecommendationsPage() {
  const [myFeaturedSongs, setMyFeaturedSongs] = useState([]);
  const [myFeaturedArtists, setMyFeaturedArtists] = useState([]);
  const [myFeaturedAlbums, setMyFeaturedAlbums] = useState([]);
  const [friendsFeaturedSongs, setFriendsFeaturedSongs] = useState([]);
  const [friendsFeaturedArtists, setFriendsFeaturedArtists] = useState([]);
  const [friendsFeaturedAlbums, setFriendsFeaturedAlbums] = useState([]);
  const [loadingMyFeatured, setLoadingMyFeatured] = useState(true);
  const [loadingFriendsFeatured, setLoadingFriendsFeatured] = useState(true);
  const [myFeaturedTab, setMyFeaturedTab] = useState('songs');
  const [friendsFeaturedTab, setFriendsFeaturedTab] = useState('songs');
  const [friends, setFriends] = useState([]);
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [showFriendFilter, setShowFriendFilter] = useState(false);
  const filterRef = useRef(null);

  useEffect(() => {
    fetchMyFeaturedSongs();
    fetchMyFeaturedArtists();
    fetchMyFeaturedAlbums();
    fetchFriendsFeaturedSongs();
    fetchFriendsFeaturedArtists();
    fetchFriendsFeaturedAlbums();
    fetchFriends();
  }, []);

  // Close filter dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowFriendFilter(false);
      }
    };

    if (showFriendFilter) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showFriendFilter]);

  const fetchFriends = async () => {
    try {
      const response = await axios.get(`${config.API_URL}/api/friends/`, {
        withCredentials: true
      });
      setFriends(response.data.friends || []);
    } catch (error) {
      console.error('Error fetching friends:', error);
    }
  };

  const fetchMyFeaturedSongs = async () => {
    setLoadingMyFeatured(true);
    try {
      const response = await axios.get(`${config.API_URL}/api/featured-songs/`, {
        withCredentials: true
      });
      setMyFeaturedSongs(response.data);
    } catch (error) {
      console.error('Error fetching my featured songs:', error);
    } finally {
      setLoadingMyFeatured(false);
    }
  };

  const fetchMyFeaturedArtists = async () => {
    try {
      const response = await axios.get(`${config.API_URL}/api/featured-artists/`, {
        withCredentials: true
      });
      setMyFeaturedArtists(response.data);
    } catch (error) {
      console.error('Error fetching my featured artists:', error);
    }
  };

  const fetchMyFeaturedAlbums = async () => {
    try {
      const response = await axios.get(`${config.API_URL}/api/featured-albums/`, {
        withCredentials: true
      });
      setMyFeaturedAlbums(response.data);
    } catch (error) {
      console.error('Error fetching my featured albums:', error);
    }
  };

  const fetchFriendsFeaturedSongs = async () => {
    setLoadingFriendsFeatured(true);
    try {
      const response = await axios.get(`${config.API_URL}/api/featured-songs/friends`, {
        withCredentials: true
      });
      setFriendsFeaturedSongs(response.data);
    } catch (error) {
      console.error('Error fetching friends featured songs:', error);
    } finally {
      setLoadingFriendsFeatured(false);
    }
  };

  const fetchFriendsFeaturedArtists = async () => {
    try {
      const response = await axios.get(`${config.API_URL}/api/featured-artists/friends`, {
        withCredentials: true
      });
      setFriendsFeaturedArtists(response.data);
    } catch (error) {
      console.error('Error fetching friends featured artists:', error);
    }
  };

  const fetchFriendsFeaturedAlbums = async () => {
    try {
      const response = await axios.get(`${config.API_URL}/api/featured-albums/friends`, {
        withCredentials: true
      });
      setFriendsFeaturedAlbums(response.data);
    } catch (error) {
      console.error('Error fetching friends featured albums:', error);
    }
  };

  const handleToggleFeatured = (spotifyTrackId, isNowFeatured) => {
    if (!isNowFeatured) {
      // Remove from my featured songs
      setMyFeaturedSongs(prev => prev.filter(song => song.spotifyTrackId !== spotifyTrackId));
    } else {
      // Refresh to get the newly added song
      fetchMyFeaturedSongs();
    }
  };

  const toggleFriendSelection = (userName) => {
    setSelectedFriends(prev => {
      if (prev.includes(userName)) {
        return prev.filter(u => u !== userName);
      } else {
        return [...prev, userName];
      }
    });
  };

  const clearFriendFilter = () => {
    setSelectedFriends([]);
  };

  // Group items by friend
  const groupByFriend = (items) => {
    // Filter items if friends are selected
    const filteredItems = selectedFriends.length > 0
      ? items.filter(item => selectedFriends.includes(item.userName))
      : items;

    const grouped = {};
    filteredItems.forEach(item => {
      const key = item.userName || item.displayName;
      if (!grouped[key]) {
        grouped[key] = {
          userName: item.userName,
          displayName: item.displayName,
          profilePicture: item.profilePicture,
          items: []
        };
      }
      grouped[key].items.push(item);
    });
    return Object.values(grouped);
  };

  return (
    <div className="recommendations-page">
      <div className="recommendations-content">
        {/* Your Featured Section - Tabbed Interface */}
        <div className="featured-section round-outline blue-box-shadow">
          <h2>Your Featured</h2>

          {/* Tab Buttons */}
          <div className="featured-tabs">
            <button
              className={myFeaturedTab === 'songs' ? 'active' : ''}
              onClick={() => setMyFeaturedTab('songs')}
            >
              Songs
            </button>
            <button
              className={myFeaturedTab === 'artists' ? 'active' : ''}
              onClick={() => setMyFeaturedTab('artists')}
            >
              Artists
            </button>
            <button
              className={myFeaturedTab === 'albums' ? 'active' : ''}
              onClick={() => setMyFeaturedTab('albums')}
            >
              Albums
            </button>
          </div>

          {/* Tab Content */}
          <div className="song-list">
            {myFeaturedTab === 'songs' && (
              loadingMyFeatured ? (
                <LoadingSpinner message="Loading..." />
              ) : myFeaturedSongs.length > 0 ? (
                myFeaturedSongs.map((song, index) => (
                  <SongComponent
                    key={song.id || index}
                    songData={song}
                    showStar={true}
                    isFeatured={true}
                    showRank={false}
                    onToggleFeatured={handleToggleFeatured}
                  />
                ))
              ) : (
                <p className="empty-message">No featured songs yet. Star songs from the Statistics page!</p>
              )
            )}

            {myFeaturedTab === 'artists' && (
              myFeaturedArtists.length > 0 ? (
                myFeaturedArtists.map((artist, index) => (
                  <SongComponent
                    key={artist.id || index}
                    songData={artist}
                    showStar={true}
                    isFeatured={true}
                    showRank={false}
                    onToggleFeatured={(spotifyArtistId, isNowFeatured) => {
                      if (!isNowFeatured) {
                        setMyFeaturedArtists(prev => prev.filter(a => a.spotifyArtistId !== spotifyArtistId));
                      } else {
                        fetchMyFeaturedArtists();
                      }
                    }}
                  />
                ))
              ) : (
                <p className="empty-message">No featured artists yet.</p>
              )
            )}

            {myFeaturedTab === 'albums' && (
              myFeaturedAlbums.length > 0 ? (
                myFeaturedAlbums.map((album, index) => (
                  <SongComponent
                    key={album.id || index}
                    songData={album}
                    showStar={true}
                    isFeatured={true}
                    showRank={false}
                    onToggleFeatured={(spotifyAlbumId, isNowFeatured) => {
                      if (!isNowFeatured) {
                        setMyFeaturedAlbums(prev => prev.filter(a => a.spotifyAlbumId !== spotifyAlbumId));
                      } else {
                        fetchMyFeaturedAlbums();
                      }
                    }}
                  />
                ))
              ) : (
                <p className="empty-message">No featured albums yet.</p>
              )
            )}
          </div>
        </div>

        {/* Friends' Featured Feed - Tabbed Interface */}
        <div className="friends-featured-section round-outline blue-box-shadow">
          <h2>Friends' Featured</h2>

          {/* Tab Buttons with Filter */}
          <div className="featured-tabs">
            <button
              className={friendsFeaturedTab === 'songs' ? 'active' : ''}
              onClick={() => setFriendsFeaturedTab('songs')}
            >
              Songs
            </button>
            <button
              className={friendsFeaturedTab === 'artists' ? 'active' : ''}
              onClick={() => setFriendsFeaturedTab('artists')}
            >
              Artists
            </button>
            <button
              className={friendsFeaturedTab === 'albums' ? 'active' : ''}
              onClick={() => setFriendsFeaturedTab('albums')}
            >
              Albums
            </button>
            <div className="filter-container" ref={filterRef}>
              <button
                className="filter-button"
                onClick={() => setShowFriendFilter(!showFriendFilter)}
                title="Filter friends"
              >
                <svg className="filter-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 4H21V6.5L14 13.5V20L10 22V13.5L3 6.5V4Z" fill="currentColor"/>
                </svg>
                {selectedFriends.length > 0 && <span className="filter-count">{selectedFriends.length}</span>}
              </button>
              {showFriendFilter && (
                <div className="filter-dropdown">
                  <div className="filter-dropdown-header">
                    <span>Select Friends</span>
                    {selectedFriends.length > 0 && (
                      <button className="clear-filter-btn" onClick={clearFriendFilter}>
                        Clear All
                      </button>
                    )}
                  </div>
                  <div className="filter-options">
                    {friends.map(friend => (
                      <label key={friend.userName} className="filter-option">
                        <input
                          type="checkbox"
                          checked={selectedFriends.includes(friend.userName)}
                          onChange={() => toggleFriendSelection(friend.userName)}
                        />
                        <span>{friend.displayName || friend.userName}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Tab Content */}
          <div className="friends-feed">
            {friendsFeaturedTab === 'songs' && (
              loadingFriendsFeatured ? (
                <LoadingSpinner message="Loading..." />
              ) : friendsFeaturedSongs.length > 0 ? (
                groupByFriend(friendsFeaturedSongs).map((friendGroup, index) => (
                  <div key={friendGroup.userName || index} className="friend-group">
                    <div className="friend-info">
                      {friendGroup.profilePicture && (
                        <img src={friendGroup.profilePicture} alt={friendGroup.displayName} className="friend-profile-pic" />
                      )}
                      <span className="friend-name">{friendGroup.displayName || friendGroup.userName}</span>
                    </div>
                    <div className="friend-items">
                      {friendGroup.items.map((song, songIndex) => (
                        <SongComponent
                          key={song.featuredSongId || songIndex}
                          songData={song}
                          showStar={false}
                          showRank={false}
                          showPlay={true}
                        />
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <p className="empty-message">No featured songs from friends yet.</p>
              )
            )}

            {friendsFeaturedTab === 'artists' && (
              friendsFeaturedArtists.length > 0 ? (
                groupByFriend(friendsFeaturedArtists).map((friendGroup, index) => (
                  <div key={friendGroup.userName || index} className="friend-group">
                    <div className="friend-info">
                      {friendGroup.profilePicture && (
                        <img src={friendGroup.profilePicture} alt={friendGroup.displayName} className="friend-profile-pic" />
                      )}
                      <span className="friend-name">{friendGroup.displayName || friendGroup.userName}</span>
                    </div>
                    <div className="friend-items">
                      {friendGroup.items.map((artist, artistIndex) => (
                        <div key={artist.featuredArtistId || artistIndex} className="featured-artist-display">
                          <img src={artist.imageUrl} alt={artist.artistName} className="artist-image circle" />
                          <span className="artist-name">{artist.artistName}</span>
                          {artist.spotifyArtistId && (
                            <a
                              href={`https://open.spotify.com/artist/${artist.spotifyArtistId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="play-button"
                              title="Open in Spotify"
                            >
                              ▶
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <p className="empty-message">No featured artists from friends yet.</p>
              )
            )}

            {friendsFeaturedTab === 'albums' && (
              friendsFeaturedAlbums.length > 0 ? (
                groupByFriend(friendsFeaturedAlbums).map((friendGroup, index) => (
                  <div key={friendGroup.userName || index} className="friend-group">
                    <div className="friend-info">
                      {friendGroup.profilePicture && (
                        <img src={friendGroup.profilePicture} alt={friendGroup.displayName} className="friend-profile-pic" />
                      )}
                      <span className="friend-name">{friendGroup.displayName || friendGroup.userName}</span>
                    </div>
                    <div className="friend-items">
                      {friendGroup.items.map((album, albumIndex) => (
                        <div key={album.featuredAlbumId || albumIndex} className="featured-album-display">
                          <img src={album.imageUrl} alt={album.albumName} className="album-image" />
                          <div className="album-info">
                            <span className="album-name">{album.albumName}</span>
                            <span className="album-artist">{album.artistName}</span>
                          </div>
                          {album.spotifyAlbumId && (
                            <a
                              href={`https://open.spotify.com/album/${album.spotifyAlbumId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="play-button"
                              title="Open in Spotify"
                            >
                              ▶
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <p className="empty-message">No featured albums from friends yet.</p>
              )
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default RecommendationsPage;