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
      const searchType = activeTab === "songs" ? "track" : "album";
      const response = await axios.get(
        `${config.API_URL}/api/search`,
        {
          params: {
            q: searchQuery,
            type: searchType,
          },
          withCredentials: true,
        }
      );

      console.log("Search results:", response.data);
      setSearchResults(response.data);
      setShowSearchResults(true);
    } catch (error) {
      console.error("Error searching:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleResultClick = (item) => {
    const type = activeTab === "songs" ? "song" : "album";
    const id = activeTab === "songs" ? item.id : item.id;
    setShowSearchResults(false);
    setSearchQuery("");
    navigate(`/ratings/${type}/${id}`);
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

            {/* Search Input - Only show for Songs/Albums tabs */}
            {activeTab !== "friends" && (
              <div className="ratings-search-inline-wrapper">
                <input
                  type="text"
                  className="ratings-search-tabs-input"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            )}
          </div>

          {/* Search Results Dropdown */}
          {showSearchResults && searchResults.length > 0 && (
            <div className="ratings-search-results-tabs">
              {searchResults.map((item) => (
                <div
                  key={item.id}
                  className="ratings-search-result-item"
                  onClick={() => handleResultClick(item)}
                >
                  <img
                    src={item.album?.images?.[0]?.url || item.images?.[0]?.url}
                    alt={item.name}
                    className="ratings-search-result-image"
                  />
                  <div className="ratings-search-result-info">
                    <p className="ratings-search-result-name">{item.name}</p>
                    <p className="ratings-search-result-artist">
                      {activeTab === "songs"
                        ? item.artists?.[0]?.name
                        : item.artists?.[0]?.name}
                    </p>
                  </div>
                </div>
              ))}
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
    </>
  );
}

export default RatingsPage;
