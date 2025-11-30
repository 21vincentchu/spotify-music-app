import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import config from "../../config";
import "../../styles/Mobile.css";
import StarIcon from "../../components/mobile/StarIcon";
import ProfileButtonMobile from "../../components/mobile/ProfileButtonMobile";

function RatingsPage() {
  const [activeTab, setActiveTab] = useState("songs");
  const [songRatings, setSongRatings] = useState([]);
  const [albumRatings, setAlbumRatings] = useState([]);
  const [friendsRatings, setFriendsRatings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    getSongRatings();
    getAlbumRatings();
    getFriendsRatings();
  }, []);

  // Disable body scroll when search results are showing
  useEffect(() => {
    if (showSearchResults) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showSearchResults]);

  // Search handler with debounce
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    const timeoutId = setTimeout(() => {
      handleSearch();
    }, 500); // Debounce 500ms

    return () => clearTimeout(timeoutId);
  }, [searchQuery, activeTab]);

  const getSongRatings = async () => {
    try {
      const response = await axios.get(
        `${config.API_URL}/api/ratings/all-songs`,
        { withCredentials: true }
      );
      console.log("Songs found:", response.data);
      setSongRatings(response.data);
    } catch (error) {
      console.error("Error fetching songs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getAlbumRatings = async () => {
    try {
      const response = await axios.get(
        `${config.API_URL}/api/ratings/all-albums`,
        { withCredentials: true }
      );
      console.log("Albums found:", response.data);
      setAlbumRatings(response.data);
    } catch (error) {
      console.error("Error fetching albums:", error);
    }
  };

  const getFriendsRatings = async () => {
    try {
      const response = await axios.get(
        `${config.API_URL}/api/ratings/friends`,
        { withCredentials: true }
      );
      console.log("Friends ratings found:", response.data);
      setFriendsRatings(response.data);
    } catch (error) {
      console.error("Error fetching friends ratings:", error);
    }
  };

  const handleSearch = async () => {
    if (searchQuery.trim() === "") return;

    setIsSearching(true);
    try {
      // If on Friends tab, search through local friendsRatings
      if (activeTab === "friends") {
        const query = searchQuery.toLowerCase();
        const filteredFriends = friendsRatings.filter(rating => {
          const songName = (rating.songName || "").toLowerCase();
          const albumName = (rating.albumName || "").toLowerCase();
          const artistName = (rating.artistName || "").toLowerCase();
          const userName = (rating.userName || "").toLowerCase();

          return songName.includes(query) ||
                 albumName.includes(query) ||
                 artistName.includes(query) ||
                 userName.includes(query);
        });

        setSearchResults(filteredFriends);
        setShowSearchResults(true);
        setIsSearching(false);
        return;
      }

      // For songs/albums tabs, use API search
      const response = await axios.get(
        `${config.API_URL}/api/search`,
        {
          params: {
            q: searchQuery,
            limit: 20,
          },
          withCredentials: true,
        }
      );

      console.log("Search results:", response.data);

      // Filter results based on active tab
      const filteredResults = response.data.filter(item => {
        if (activeTab === "songs") return item.type === "song";
        if (activeTab === "albums") return item.type === "album";
        return false;
      });

      setSearchResults(filteredResults);
      setShowSearchResults(true);
    } catch (error) {
      console.error("Error searching:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleResultClick = (item) => {
    setShowSearchResults(false);
    setSearchQuery("");

    // For Friends tab, use the item's type and appropriate ID
    if (activeTab === "friends") {
      const type = item.type;
      const id = type === "song" ? item.spotifyTrackId : item.spotifyAlbumId;
      navigate(`/ratings/${type}/${id}`);
    } else {
      // For songs/albums tabs, use the tab to determine type
      const type = activeTab === "songs" ? "song" : "album";
      navigate(`/ratings/${type}/${item.spotifyId}`);
    }
  };

  const renderStars = (rating) => (
    <div className="rating-stars">
      {Array(5)
        .fill(0)
        .map((_, i) => (
          <StarIcon key={i} filled={i < rating} size={18} />
        ))}
    </div>
  );

  const RatingCard = ({ item, type }) => {
    const hasComment = item.comment && item.comment.trim() !== "";

    return (
      <Link
        to={`/ratings/${type}/${type === "song" ? item.spotifyTrackId : item.spotifyAlbumId}`}
        className="rating-card-link"
      >
        <div className="rating-card">
          {/* Header: User info */}
          <div className="rating-card-header">
            <span className="rating-card-username">{item.displayName || "You"}</span>
          </div>

          {/* Body: Song/Album info + Rating */}
          <div className="rating-card-body">
            <img
              src={item.imageUrl}
              alt={type === "song" ? item.songName : item.albumName}
              className="rating-card-image"
            />
            <div className="rating-card-info">
              <p className="rating-card-title">
                {type === "song" ? item.songName : item.albumName}
              </p>
              <p className="rating-card-artist">{item.artistName}</p>
              <div className="rating-card-rating">
                {renderStars(item.rating)}
                <span className="rating-value">{item.rating}</span>
              </div>
            </div>
          </div>

          {/* Comment/Review */}
          {hasComment && (
            <div className="rating-card-comment">
              <p>{item.comment}</p>
            </div>
          )}
        </div>
      </Link>
    );
  };

  return (
    <>
      <ProfileButtonMobile />
      <div className="mobile-layout">
        <div className="ratings-page">

        {/* Tabs + Search Bar */}
        <div className="ratings-tabs-with-search">
            <div className="ratings-tabs-buttons">
              <button
                className={`ratings-tab ${activeTab === "songs" ? "active" : ""}`}
                onClick={() => setActiveTab("songs")}
              >
                Songs
              </button>
              <button
                className={`ratings-tab ${activeTab === "albums" ? "active" : ""}`}
                onClick={() => setActiveTab("albums")}
              >
                Albums
              </button>
              <button
                className={`ratings-tab ${activeTab === "friends" ? "active" : ""}`}
                onClick={() => setActiveTab("friends")}
              >
                Friends
              </button>
            </div>

            {/* Search Input */}
            <div className="ratings-search-inline-wrapper">
              <input
                type="text"
                className="ratings-search-tabs-input"
                placeholder={activeTab === "friends" ? "Search..." : "Search..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {/* Clear search button */}
              {(searchQuery || showSearchResults) && (
                <button
                  className="ratings-search-clear"
                  onClick={() => {
                    setSearchQuery("");
                    setShowSearchResults(false);
                  }}
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Search Backdrop */}
          {showSearchResults && (
            <div
              className="ratings-search-backdrop"
              onClick={() => {
                setShowSearchResults(false);
                setSearchQuery("");
              }}
            />
          )}

          {/* Search Results Dropdown */}
          {showSearchResults && searchResults.length > 0 && (
            <div className="ratings-search-results-tabs">
              {searchResults.map((item) => {
                // Handle different data structures for Friends vs Songs/Albums
                const isFriendsTab = activeTab === "friends";
                const itemKey = isFriendsTab
                  ? `${item.type}-${item.spotifyTrackId || item.spotifyAlbumId}-${item.userName}`
                  : item.spotifyId;
                const itemName = isFriendsTab
                  ? (item.type === "song" ? item.songName : item.albumName)
                  : item.name;
                const itemArtist = isFriendsTab ? item.artistName : item.artist;

                return (
                  <div
                    key={itemKey}
                    className="ratings-search-result-item"
                    onClick={() => handleResultClick(item)}
                  >
                    <img
                      src={item.imageUrl}
                      alt={itemName}
                      className="ratings-search-result-image"
                    />
                    <div className="ratings-search-result-info">
                      <p className="ratings-search-result-name">{itemName}</p>
                      <p className="ratings-search-result-artist">
                        {itemArtist}
                      </p>
                      {isFriendsTab && (
                        <p className="ratings-search-result-user">by {item.userName}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {showSearchResults && searchResults.length === 0 && !isSearching && (
            <div className="ratings-search-results-tabs">
              <p className="ratings-search-no-results">No results found</p>
            </div>
          )}

          {/* Feed */}
          <div className="ratings-feed">
            {isLoading ? (
              <p className="loading-text">Loading...</p>
            ) : (
              <>
                {activeTab === "songs" && (
                  <>
                    {songRatings.length === 0 ? (
                      <p className="empty-text">No rated songs yet</p>
                    ) : (
                      songRatings.map((rating) => (
                        <RatingCard
                          key={rating.spotifyTrackId}
                          item={rating}
                          type="song"
                        />
                      ))
                    )}
                  </>
                )}

                {activeTab === "albums" && (
                  <>
                    {albumRatings.length === 0 ? (
                      <p className="empty-text">No rated albums yet</p>
                    ) : (
                      albumRatings.map((rating) => (
                        <RatingCard
                          key={rating.spotifyAlbumId}
                          item={rating}
                          type="album"
                        />
                      ))
                    )}
                  </>
                )}

                {activeTab === "friends" && (
                  <>
                    {friendsRatings.length === 0 ? (
                      <p className="empty-text">No friends have rated anything yet.</p>
                    ) : (
                      friendsRatings.map((rating) => (
                        <RatingCard
                          key={`${rating.type}-${rating.spotifyTrackId || rating.spotifyAlbumId}-${rating.userName}`}
                          item={rating}
                          type={rating.type}
                        />
                      ))
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default RatingsPage;
