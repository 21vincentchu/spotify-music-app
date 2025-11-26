import axios from "axios";
import { useEffect, useState } from "react";
import config from "../../config";

import FriendComponentMobile from "../../components/mobile/FriendComponentMobile";
import AddFriendComponentDesktop from "../../components/desktop/AddFriendComponentDesktop";
import ProfileButtonMobile from "../../components/mobile/ProfileButtonMobile";
import SongComponent from "../../components/shared/SongComponent";

function FriendsMobilePage() {
  const [isLoadingFriends, setIsLoadingFriends] = useState(true);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  const [friends, setFriends] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [friendStats, setFriendStats] = useState(null);
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

  // -------------------------------
  // Load Friends on Page Open
  // -------------------------------
  useEffect(() => {
    getFriendsList();
  }, []);

  // -------------------------------
  // Debounce Search Input
  // -------------------------------
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setSearchResults([]);
      return;
    }

    const delay = setTimeout(() => {
      getSearchResults(searchTerm);
    }, 300);

    return () => clearTimeout(delay);
  }, [searchTerm]);

  // -------------------------------
  // GET Friends List
  // -------------------------------
  const getFriendsList = async () => {
    setIsLoadingFriends(true);

    axios
      .get(`${config.API_URL}/api/friends/`, { withCredentials: true })
      .then((res) => {
        setFriends(res.data.friends || []);
      })
      .catch((err) => console.error("Error fetching friends:", err))
      .finally(() => setIsLoadingFriends(false));
  };

  // -------------------------------
  // GET Search Results
  // -------------------------------
  const getSearchResults = async (query) => {
    setIsLoadingSearch(true);

    axios
      .get(`${config.API_URL}/api/friends/search?q=${query}`, {
        withCredentials: true,
      })
      .then((res) => {
        setSearchResults(res.data || []);
      })
      .catch((err) => console.error("Error searching friends:", err))
      .finally(() => setIsLoadingSearch(false));
  };

  // -------------------------------
  // GET Friend Stats
  // -------------------------------
  const getFriendStats = async (friendUserName) => {
    setIsLoadingStats(true);
    axios
      .get(`${config.API_URL}/api/friends/${friendUserName}/stats?limit=50`, {
        withCredentials: true,
      })
      .then((response) => {
        console.log("Friend Stats:", response.data);
        setFriendStats(response.data);
      })
      .catch((error) => {
        console.error("Error fetching friend stats:", error);
      })
      .finally(() => {
        setIsLoadingStats(false);
      });
  };

  // -------------------------------
  // Handle Friend Click
  // -------------------------------
  const handleFriendClick = (friend) => {
    setSelectedFriend(friend);
    setActiveTab('recents');
    getFriendStats(friend.userName);
  };

  // -------------------------------
  // Handle Remove Friend
  // -------------------------------
  const handleRemoveFriend = async (friendUserName) => {
    try {
      const response = await axios.post(
        `${config.API_URL}/api/friends/remove`,
        { friendUserName: friendUserName },
        { withCredentials: true }
      );

      if (response.data.success) {
        // If we removed the currently selected friend, clear the selection
        if (selectedFriend?.userName === friendUserName) {
          setSelectedFriend(null);
          setFriendStats(null);
        }
        // Refresh the friends list
        getFriendsList();
      }
    } catch (error) {
      console.error("Error removing friend:", error);
    }
  };

  // -------------------------------
  // Handle Close Stats Modal
  // -------------------------------
  const handleCloseStats = () => {
    setSelectedFriend(null);
    setFriendStats(null);
  };

  return (
    <div className="mobile-layout">
      <ProfileButtonMobile />
      <div className="mobile-friends">
        <div className="mobile-friends-content">

        {/* ----------------------- */}
        {/* HEADER */}
        {/* ----------------------- */}
        <div className="friends-header-container">
          <h2 className="friends-header">Friends</h2>
          <p className="friends-hint">Click a friend to view their stats</p>
        </div>

        {/* ----------------------- */}
        {/* SEARCH BAR */}
        {/* ----------------------- */}
        <div className="search-bar" style={{ marginBottom: "15px" }}>
          <div className="search-input-container">
            <input
              type="text"
              placeholder="Search username..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <button
            className="search-button"
            onClick={() => getSearchResults(searchTerm)}
          >
            Search
          </button>
        </div>

        {/* ----------------------- */}
        {/* FRIEND LIST */}
        {/* ----------------------- */}
        <div className="mobile-friend-list">
          {isLoadingFriends ? (
            <p>Loading friends...</p>
          ) : friends.length > 0 ? (
            friends.map((f, i) => (
              <FriendComponentMobile
                key={f.userName || i}
                friendData={f}
                onClick={() => handleFriendClick(f)}
                onRemove={handleRemoveFriend}
              />
            ))
          ) : (
            <p>No friends yet. Add some friends!</p>
          )}
        </div>

        {/* ----------------------- */}
        {/* SEARCH RESULTS */}
        {/* ----------------------- */}
        {searchTerm.trim() && (
          <div className="mobile-search-results" style={{ marginTop: "20px" }}>
            <h3>Search Results</h3>

            {isLoadingSearch ? (
              <p>Searching...</p>
            ) : searchResults.length > 0 ? (
              searchResults.map((result, i) => (
                <AddFriendComponentDesktop
                  key={result.userName || i}
                  friendData={result}
                  onFriendAdded={getFriendsList}
                />
              ))
            ) : (
              <p>No search results found.</p>
            )}
          </div>
        )}
        </div>
      </div>

      {/* ----------------------- */}
      {/* FRIEND STATS MODAL */}
      {/* ----------------------- */}
      {selectedFriend && (
        <div className="mobile-friend-stats-modal" onClick={handleCloseStats}>
          <div className="mobile-friend-stats-content" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-stats-header">
              <h2>{selectedFriend.displayName || selectedFriend.userName}'s Stats</h2>
              <button className="close-stats-btn" onClick={handleCloseStats}>
                ✕
              </button>
            </div>

            {isLoadingStats ? (
              <div className="mobile-stats-loading">
                <p>Loading stats...</p>
              </div>
            ) : friendStats ? (
              <>
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

                <div className="mobile-stats-songs-container">
                  {activeTab === 'recents' ? (
                    <div className="mobile-recent-songs-list">
                      {friendStats.recentSongs && friendStats.recentSongs.length > 0 ? (
                        friendStats.recentSongs.map((song, index) => (
                          <SongComponent
                            key={index}
                            songData={{ ...song, rank: index + 1 }}
                            showStar={false}
                            showRank={true}
                            showPlay={true}
                            timestamp={getRelativeTime(song.playedAt)}
                          />
                        ))
                      ) : (
                        <p>No recent songs found</p>
                      )}
                    </div>
                  ) : (
                    <div className="mobile-ratings-placeholder">
                      <p>TBD</p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="mobile-stats-error">
                <p>Error loading stats</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default FriendsMobilePage;
