import axios from 'axios';
import { useEffect, useState } from 'react';
import config from '../../config';

import FriendComponentDesktop from "../../components/desktop/FriendComponentDesktop";
import AddFriendComponentDesktop from '../../components/desktop/AddFriendComponentDesktop';
import Footer from '../../components/shared/Footer';

function FriendsPage() {

  const [isLoadingFriends, setIsLoadingFriends] = useState(true);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);
  const [friends, setFriends] = useState([]);
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [friendStats, setFriendStats] = useState(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [activeTab, setActiveTab] = useState('recents');

  const getRelativeTime = (timestamp) => {
    if (!timestamp) return 'Unknown time';

    const now = new Date();
    const playedDate = new Date(timestamp);
    const diffMs = now - playedDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
    if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
  };


  useEffect(() => {
    getFriendsList();
  }, []);

  useEffect(() => {
    if (query.trim() === "") {
      setSearchResults([]);   // clear results when field is empty
      return;
    }
  
    const delayDebounce = setTimeout(() => {
      getSearchResults(query);
    }, 300); // <— debounce so you don't spam the API
  
    return () => clearTimeout(delayDebounce);
  }, [query]);
  


  const getFriendsList = async () => {
    setIsLoadingFriends(true);
    axios.get(`${config.API_URL}/api/friends/`, {
        withCredentials: true
      })
      .then((response) => {
        console.log('Friends:', response.data);
        setFriends(response.data.friends || []);
      })
      .catch((error) => {
        console.error('Error fetching friends:', error);
      })
      .finally(() => {
        setIsLoadingFriends(false);
      });
  }

  const getSearchResults = async (query) => {
    // if (!query.trim()) return; // optional guard
    setIsLoadingSearch(true);
    axios.get(`${config.API_URL}/api/friends/search?q=${query}`, {
        withCredentials: true
      })
      .then((response) => {
        console.log('Search Results:', response.data);
        setSearchResults(response.data);
      })
      .catch((error) => {
        console.error('Error fetching search results:', error);
      })
      .finally(() => {
        setIsLoadingSearch(false);
      });
  }

  const getFriendStats = async (friendUserName) => {
    setIsLoadingStats(true);
    axios.get(`${config.API_URL}/api/friends/${friendUserName}/stats?limit=50`, {
        withCredentials: true
      })
      .then((response) => {
        console.log('Friend Stats:', response.data);
        console.log('Recent Songs:', response.data.recentSongs);
        setFriendStats(response.data);
      })
      .catch((error) => {
        console.error('Error fetching friend stats:', error);
      })
      .finally(() => {
        setIsLoadingStats(false);
      });
  }

  const handleFriendClick = (friend) => {
    setSelectedFriend(friend);
    setActiveTab('recents');
    getFriendStats(friend.userName);
  }
  
  return (
    <div className="friends-page">
      <div className="friends-list-container round-outline blue-box-shadow">
        <div className="friends-header">
          <h2>Friends</h2>
          <span className="friend-count">{friends.length} {friends.length === 1 ? 'friend' : 'friends'}</span>
        </div>

        <div className="search-bar">
          <div className="search-input-container round-outline">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              type="text"
              placeholder="Search username..."
              className="search-input round-outline"
            />
          </div>
          <button className="search-button round-outline"
            onClick={() => getSearchResults(query)}>
              Search
          </button>
        </div>

        {query.trim() ? (
          searchResults.length > 0 ? (
            <div className="data-container-list">
              {searchResults.map((result, index) => (
                <AddFriendComponentDesktop
                  key={result.userName || index}
                  friendData={result}
                  onFriendAdded={getFriendsList}
                />
              ))}
            </div>
          ) : (
            <div className="data-container-list">
              <p>No search results</p>
            </div>
          )
        ) : (
          <div className="data-container-list">
            {isLoadingFriends ? (
              <p>Loading friends...</p>
            ) : friends.length > 0 ? (
              friends.map((friend, index) => (
                <FriendComponentDesktop
                  key={friend.userName || index}
                  friendData={friend}
                  onClick={() => handleFriendClick(friend)}
                  isSelected={selectedFriend?.userName === friend.userName}
                />
              ))
            ) : (
              <p>No friends yet. Add some friends!</p>
            )}
          </div>
        )}
      </div>

      <div className="friends-stats-container round-outline blue-box-shadow">
        {!selectedFriend ? (
          <div className="stats-placeholder">
            <p>Click a friend to see their stats</p>
          </div>
        ) : isLoadingStats ? (
          <div className="stats-loading">
            <p>Loading stats...</p>
          </div>
        ) : friendStats ? (
          <>
            <div className="stats-header">
              <h2>{selectedFriend.displayName || selectedFriend.userName}'s Stats</h2>
            </div>
            <div className="featured-tabs">
              <button
                className={activeTab === 'recents' ? 'active' : ''}
                onClick={() => setActiveTab('recents')}
              >
                Recents
              </button>
              <button
                className={activeTab === 'ratings' ? 'active' : ''}
                onClick={() => setActiveTab('ratings')}
              >
                Ratings
              </button>
            </div>
            <div className="stats-content">
              {activeTab === 'recents' ? (
                <div className="recent-songs-list">
                  {friendStats.recentSongs && friendStats.recentSongs.length > 0 ? (
                    friendStats.recentSongs.map((song, index) => (
                      <div key={index} className="recent-song-item">
                        <span className="song-rank">#{index + 1}</span>
                        {song.imageUrl && (
                          <img
                            src={song.imageUrl}
                            alt={song.albumName}
                            className="song-album-cover"
                          />
                        )}
                        <div className="song-info">
                          <p className="song-name">{song.songName}</p>
                          <p className="song-artist">{song.artistName}</p>
                          <p className="song-time">{getRelativeTime(song.playedAt)}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p>No recent songs found</p>
                  )}
                </div>
              ) : (
                <div className="ratings-placeholder">
                  <p>TBD</p>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="stats-error">
            <p>Error loading stats</p>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

export default FriendsPage;