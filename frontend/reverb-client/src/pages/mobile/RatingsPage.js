import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import config from "../../config";
import "../../styles/Mobile.css";
import StarIcon from "../../components/mobile/StarIcon";

function RatingsPage() {
  const [activeTab, setActiveTab] = useState("songs");
  const [songRatings, setSongRatings] = useState([]);
  const [albumRatings, setAlbumRatings] = useState([]);
  const [friendsRatings, setFriendsRatings] = useState([]);
  const [friendsFilter, setFriendsFilter] = useState("all"); // all, songs, albums
  const [friends, setFriends] = useState([]);
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [showFriendFilter, setShowFriendFilter] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [editingRatingId, setEditingRatingId] = useState(null);
  const [editingRatingValue, setEditingRatingValue] = useState(0);
  const [editingComment, setEditingComment] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [dragStartY, setDragStartY] = useState(0);
  const [dragCurrentY, setDragCurrentY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const filterRef = useRef(null);
  const filterModalRef = useRef(null);
  const textareaRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    getSongRatings();
    getAlbumRatings();
    getFriendsRatings();
    getFriends();
  }, []);

  // Close filter dropdown when switching away from Friends tab
  useEffect(() => {
    if (activeTab !== "friends") {
      setShowFriendFilter(false);
    }
  }, [activeTab]);

  // Disable body scroll when search results or filter are showing
  useEffect(() => {
    if (showSearchResults || showFriendFilter) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [showSearchResults, showFriendFilter]);

  // Close filter dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        filterRef.current &&
        !filterRef.current.contains(event.target) &&
        filterModalRef.current &&
        !filterModalRef.current.contains(event.target)
      ) {
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

  // Auto-focus textarea when entering edit mode
  useEffect(() => {
    if (editingRatingId && textareaRef.current) {
      const textarea = textareaRef.current;
      textarea.focus();
      // Move cursor to end of text
      const length = textarea.value.length;
      textarea.setSelectionRange(length, length);
    }
  }, [editingRatingId]);

  // Touch handlers for drag-to-close modal
  const handleTouchStart = (e) => {
    setDragStartY(e.touches[0].clientY);
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    setDragCurrentY(e.touches[0].clientY);
  };

  const handleTouchEnd = () => {
    const dragDistance = dragCurrentY - dragStartY;
    if (dragDistance > 100) {
      setShowFriendFilter(false);
    }
    setIsDragging(false);
    setDragStartY(0);
    setDragCurrentY(0);
  };

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

  const getFriends = async () => {
    try {
      const response = await axios.get(`${config.API_URL}/api/friends/`, {
        withCredentials: true
      });
      setFriends(response.data.friends || []);
    } catch (error) {
      console.error('Error fetching friends:', error);
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

  const handleEditRating = (item, type) => {
    const id = type === 'song' ? item.spotifyTrackId : item.spotifyAlbumId;
    setEditingRatingId(id);
    setEditingRatingValue(item.rating);
    setEditingComment(item.comment || '');
  };

  const handleSaveRating = async (item, type) => {
    setIsSaving(true);
    try {
      if (type === 'song') {
        await axios.patch(`${config.API_URL}/api/ratings/song`, {
          spotifyTrackId: item.spotifyTrackId,
          rating: editingRatingValue,
          comment: editingComment
        }, {
          withCredentials: true
        });
      } else if (type === 'album') {
        await axios.patch(`${config.API_URL}/api/ratings/album`, {
          spotifyAlbumId: item.spotifyAlbumId,
          rating: editingRatingValue,
          comment: editingComment
        }, {
          withCredentials: true
        });
      }

      setEditingRatingId(null);
      setEditingRatingValue(0);
      setEditingComment("");

      // Refresh ratings
      if (type === 'song') {
        getSongRatings();
      } else {
        getAlbumRatings();
      }
      getFriendsRatings();
    } catch (error) {
      console.error('Error saving rating:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingRatingId(null);
    setEditingRatingValue(0);
    setEditingComment("");
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

  const RatingCard = ({ item, type, showTypeBadge = false }) => {
    const hasComment = item.comment && item.comment.trim() !== "";
    const itemId = type === "song" ? item.spotifyTrackId : item.spotifyAlbumId;
    const isEditing = editingRatingId === itemId;
    const isOwnRating = activeTab !== "friends";

    const renderEditableStars = () => (
      <div className="rating-stars editable-stars">
        {Array(5)
          .fill(0)
          .map((_, i) => {
            const starValue = i + 1;
            const isHalf = editingRatingValue === starValue - 0.5;
            const isFilled = editingRatingValue >= starValue;

            return (
              <div
                key={i}
                className="star-container"
                onClick={(e) => {
                  e.stopPropagation();
                  const rect = e.currentTarget.getBoundingClientRect();
                  const clickX = e.clientX - rect.left;
                  const isLeftHalf = clickX < rect.width / 2;
                  setEditingRatingValue(isLeftHalf ? starValue - 0.5 : starValue);
                }}
              >
                <StarIcon filled={isFilled || isHalf} size={20} />
              </div>
            );
          })}
      </div>
    );

    return (
      <div
        className={`rating-card ${isEditing ? 'editing' : ''}`}
        onClick={!isEditing ? () => navigate(`/ratings/${type}/${itemId}`) : undefined}
        style={{ cursor: !isEditing ? 'pointer' : 'default' }}
      >
        {/* Header: User info + Type Badge (only for friends tab) */}
        <div className="rating-card-header">
          <span className="rating-card-username">{item.displayName || "You"}</span>
          <div className="rating-card-header-right">
            {showTypeBadge && (
              <span className={`rating-type-badge ${type === "song" ? "song-badge" : "album-badge"}`}>
                {type === "song" ? "Song" : "Album"}
              </span>
            )}
            {!isEditing && (
              <span className="rating-card-hint">More details →</span>
            )}
          </div>
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
            <div
              className="rating-card-rating"
              onClick={(e) => {
                if (!isEditing && isOwnRating) {
                  e.stopPropagation();
                  handleEditRating(item, type);
                }
              }}
            >
              {isEditing ? (
                <>
                  {renderEditableStars()}
                  <span className="rating-value">{editingRatingValue}</span>
                </>
              ) : (
                <>
                  {renderStars(item.rating)}
                  <span className="rating-value">{item.rating}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Comment/Review */}
        {isEditing ? (
          <div className="rating-card-comment-edit">
            <textarea
              ref={textareaRef}
              className="rating-comment-textarea"
              value={editingComment}
              onChange={(e) => setEditingComment(e.target.value)}
              placeholder="Share your thoughts..."
              onClick={(e) => e.stopPropagation()}
            />
            <div className="rating-edit-actions-mobile">
              <button
                className="save-btn-mobile"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSaveRating(item, type);
                }}
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
              <button
                className="cancel-btn-mobile"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCancelEdit();
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          (hasComment || isOwnRating) && (
            <div
              className="rating-card-comment"
              onClick={(e) => {
                if (isOwnRating) {
                  e.stopPropagation();
                  handleEditRating(item, type);
                }
              }}
              style={{ cursor: isOwnRating ? 'text' : 'default' }}
            >
              <p>{item.comment || (isOwnRating ? 'Add a review...' : '')}</p>
            </div>
          )
        )}
      </div>
    );
  };

  return (
    <>
      <div className="mobile-layout">
        <div className="ratings-page page">

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

              {/* Filter Button (Friends Tab Only) - Always rendered for smooth animation */}
              <div
                className={`filter-by-friend-container-inline ${activeTab === "friends" ? "visible" : "hidden"}`}
                ref={filterRef}
              >
                <button
                  className="filter-button-mobile"
                  onClick={() => setShowFriendFilter(!showFriendFilter)}
                  title="Filter ratings"
                  disabled={activeTab !== "friends"}
                >
                  <svg className="filter-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 4H21V6.5L14 13.5V20L10 22V13.5L3 6.5V4Z" fill="currentColor"/>
                  </svg>
                  {(selectedFriends.length > 0 || friendsFilter !== "all") && (
                    <span className="filter-count">
                      {selectedFriends.length > 0 ? selectedFriends.length : "•"}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Search Input */}
            <div className="ratings-search-inline-wrapper">
              <input
                type="text"
                className="ratings-search-tabs-input"
                placeholder={
                  activeTab === "songs"
                    ? "Search any songs.."
                    : activeTab === "albums"
                    ? "Search any albums.."
                    : "Search..."
                }
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

          {/* Filter Modal */}
          {showFriendFilter && (
            <div
              className="filter-dropdown-mobile"
              ref={filterModalRef}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {/* Type Filter Section */}
              <div className="filter-section">
                <div className="filter-section-header">Type</div>
                <div className="filter-section-options">
                  <label className="filter-option">
                    <input
                      type="radio"
                      name="typeFilter"
                      checked={friendsFilter === "all"}
                      onChange={() => setFriendsFilter("all")}
                    />
                    <span>All</span>
                  </label>
                  <label className="filter-option">
                    <input
                      type="radio"
                      name="typeFilter"
                      checked={friendsFilter === "songs"}
                      onChange={() => setFriendsFilter("songs")}
                    />
                    <span>Songs</span>
                  </label>
                  <label className="filter-option">
                    <input
                      type="radio"
                      name="typeFilter"
                      checked={friendsFilter === "albums"}
                      onChange={() => setFriendsFilter("albums")}
                    />
                    <span>Albums</span>
                  </label>
                </div>
              </div>

              {/* Friends Filter Section */}
              <div className="filter-section">
                <div className="filter-dropdown-header">
                  <span>Friends</span>
                  {selectedFriends.length > 0 && (
                    <button className="clear-filter-btn" onClick={clearFriendFilter}>
                      Clear
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
            </div>
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
                        <div key={rating.spotifyTrackId} className="fade-in-item">
                          <RatingCard
                            item={rating}
                            type="song"
                          />
                        </div>
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
                        <div key={rating.spotifyAlbumId} className="fade-in-item">
                          <RatingCard
                            item={rating}
                            type="album"
                          />
                        </div>
                      ))
                    )}
                  </>
                )}

                {activeTab === "friends" && (
                  <>
                    {friendsRatings.length === 0 ? (
                      <p className="empty-text">No friends have rated anything yet.</p>
                    ) : (
                      friendsRatings
                        .filter(rating => {
                          // Filter by type
                          let typeMatch = true;
                          if (friendsFilter === "songs") typeMatch = rating.type === "song";
                          else if (friendsFilter === "albums") typeMatch = rating.type === "album";

                          // Filter by selected friends
                          const friendMatch = selectedFriends.length === 0 || selectedFriends.includes(rating.userName);

                          return typeMatch && friendMatch;
                        })
                        .map((rating) => (
                          <div key={`${rating.type}-${rating.spotifyTrackId || rating.spotifyAlbumId}-${rating.userName}`} className="fade-in-item">
                            <RatingCard
                              item={rating}
                              type={rating.type}
                              showTypeBadge={true}
                            />
                          </div>
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
