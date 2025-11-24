import axios from "axios";
import { useEffect, useState } from "react";
import config from "../../config";

import FriendComponentMobile from "../../components/mobile/FriendComponentMobile";
import AddFriendComponentDesktop from "../../components/desktop/AddFriendComponentDesktop";
import ProfileButtonMobile from "../../components/mobile/ProfileButtonMobile";

function FriendsMobilePage() {
  const [isLoadingFriends, setIsLoadingFriends] = useState(true);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);

  const [friends, setFriends] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);

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

  return (
    <div className="mobile-layout">
      <ProfileButtonMobile />
      <div className="mobile-friends">
        <div className="mobile-friends-content">

        {/* ----------------------- */}
        {/* HEADER */}
        {/* ----------------------- */}
        <h2 className="friends-header">Friends</h2>

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
              <FriendComponentMobile key={f.userName || i} friendData={f} />
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
    </div>
  );
}

export default FriendsMobilePage;
