import axios from 'axios';
import { useEffect, useState, useRef } from 'react';
import SongComponent from '../../components/shared/SongComponent';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import ProfileButtonMobile from '../../components/mobile/ProfileButtonMobile';
import config from '../../config';
import "../../styles/Mobile.css";

function MobileRecommendationsPage() {
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
      setMyFeaturedSongs(prev => prev.filter(song => song.spotifyTrackId !== spotifyTrackId));
    } else {
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
    <div className="mobile-layout">
      <ProfileButtonMobile />
      <div className="mobile-recommendations page">
        <div className="mobile-recommendations-content">

          {/* Your Featured Section */}
          <div className="mobile-recommendations-box round-outline blue-box-shadow">
            <h2>Your Featured</h2>
            <p className="section-hint">
              Your recommended {myFeaturedTab} • Tap {myFeaturedTab === 'songs' ? 'a song' : myFeaturedTab === 'albums' ? 'an album' : 'an artist'} to review them
            </p>

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

            <div className="mobile-recommendations-list">
              {myFeaturedTab === 'songs' && (
                loadingMyFeatured ? (
                  <LoadingSpinner message="Loading..." />
                ) : myFeaturedSongs.length > 0 ? (
                  myFeaturedSongs.map((song, index) => (
                    <div key={song.id || index} className="fade-in-item">
                      <SongComponent
                        songData={song}
                        showStar={true}
                        isFeatured={true}
                        showRank={false}
                        onToggleFeatured={handleToggleFeatured}
                      />
                    </div>
                  ))
                ) : (
                  <p className="empty-message">No featured songs yet. Star songs from the Statistics page!</p>
                )
              )}

              {myFeaturedTab === 'artists' && (
                myFeaturedArtists.length > 0 ? (
                  myFeaturedArtists.map((artist, index) => (
                    <div key={artist.id || index} className="fade-in-item">
                      <SongComponent
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
                    </div>
                  ))
                ) : (
                  <p className="empty-message">No featured artists yet.</p>
                )
              )}

              {myFeaturedTab === 'albums' && (
                myFeaturedAlbums.length > 0 ? (
                  myFeaturedAlbums.map((album, index) => (
                    <div key={album.id || index} className="fade-in-item">
                      <SongComponent
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
                    </div>
                  ))
                ) : (
                  <p className="empty-message">No featured albums yet.</p>
                )
              )}
            </div>
          </div>

          {/* Friends' Featured Section */}
          <div className="mobile-recommendations-box round-outline blue-box-shadow">
            <h2>Friends' Featured</h2>
            <p className="section-hint">Tap to review or press play to listen</p>

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
              <div className="filter-container-mobile" ref={filterRef}>
                <button
                  className="filter-button-mobile"
                  onClick={() => setShowFriendFilter(!showFriendFilter)}
                  title="Filter friends"
                >
                  <svg className="filter-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 4H21V6.5L14 13.5V20L10 22V13.5L3 6.5V4Z" fill="currentColor"/>
                  </svg>
                  {selectedFriends.length > 0 && <span className="filter-count">{selectedFriends.length}</span>}
                </button>
                {showFriendFilter && (
                  <div className="filter-dropdown-mobile">
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

            <div className="mobile-friends-feed">
              {friendsFeaturedTab === 'songs' && (
                loadingFriendsFeatured ? (
                  <LoadingSpinner message="Loading..." />
                ) : friendsFeaturedSongs.length > 0 ? (
                  groupByFriend(friendsFeaturedSongs).map((friendGroup, index) => (
                    <div key={friendGroup.userName || index} className="mobile-friend-group fade-in-item">
                      <div className="mobile-friend-info">
                        {friendGroup.profilePicture && (
                          <img src={friendGroup.profilePicture} alt={friendGroup.displayName} className="mobile-friend-profile-pic" />
                        )}
                        <span className="mobile-friend-name">{friendGroup.displayName || friendGroup.userName}</span>
                      </div>
                      <div className="mobile-friend-items">
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
                    <div key={friendGroup.userName || index} className="mobile-friend-group fade-in-item">
                      <div className="mobile-friend-info">
                        {friendGroup.profilePicture && (
                          <img src={friendGroup.profilePicture} alt={friendGroup.displayName} className="mobile-friend-profile-pic" />
                        )}
                        <span className="mobile-friend-name">{friendGroup.displayName || friendGroup.userName}</span>
                      </div>
                      <div className="mobile-friend-items">
                        {friendGroup.items.map((artist, artistIndex) => (
                          <div key={artist.featuredArtistId || artistIndex} className="mobile-featured-artist-display">
                            <img src={artist.imageUrl} alt={artist.artistName} className="mobile-artist-image circle" />
                            <span className="mobile-artist-name">{artist.artistName}</span>
                            {artist.spotifyArtistId && (
                              <a
                                href={`https://open.spotify.com/artist/${artist.spotifyArtistId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mobile-play-button"
                                title="Open in Spotify"
                              >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M8 5v14l11-7z"/>
                                </svg>
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
                    <div key={friendGroup.userName || index} className="mobile-friend-group fade-in-item">
                      <div className="mobile-friend-info">
                        {friendGroup.profilePicture && (
                          <img src={friendGroup.profilePicture} alt={friendGroup.displayName} className="mobile-friend-profile-pic" />
                        )}
                        <span className="mobile-friend-name">{friendGroup.displayName || friendGroup.userName}</span>
                      </div>
                      <div className="mobile-friend-items">
                        {friendGroup.items.map((album, albumIndex) => (
                          <div key={album.featuredAlbumId || albumIndex} className="mobile-featured-album-display">
                            <img src={album.imageUrl} alt={album.albumName} className="mobile-album-image" />
                            <div className="mobile-album-info">
                              <span className="mobile-album-name">{album.albumName}</span>
                              <span className="mobile-album-artist">{album.artistName}</span>
                            </div>
                            {album.spotifyAlbumId && (
                              <a
                                href={`https://open.spotify.com/album/${album.spotifyAlbumId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mobile-play-button"
                                title="Open in Spotify"
                              >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M8 5v14l11-7z"/>
                                </svg>
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
      </div>
    </div>
  );
}

export default MobileRecommendationsPage;
