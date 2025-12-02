import Footer from "../../components/shared/Footer";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import config from "../../config";
import { Link, useNavigate } from "react-router-dom";
import RatedSongComponentDesktop from "../../components/desktop/RatedSongComponentDesktop";

function RatingsPage() {

  const [myFeaturedTab, setMyFeaturedTab] = useState('songs');
  const [typeTab, setTypeTab] = useState('ratings');
  const [songRatings, setSongRatings] = useState([]);
  const [albumRatings, setAlbumRatings] = useState([]);
  const [friendsRatings, setFriendsRatings] = useState([]);
  const [friendsFilter, setFriendsFilter] = useState("all"); // all, songs, albums
  const [friends, setFriends] = useState([]);
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [showFriendFilter, setShowFriendFilter] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const filterRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    getSongRatings();
    getAlbumRatings();
    getFriendsRatings();
    getFriends();
  }, []);

  // Disable body scroll on ratings page
  useEffect(() => {
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = 'unset';
    };
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

  // Search handler with debounce
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    const timeoutId = setTimeout(() => {
      handleSearch();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, myFeaturedTab]);

  const getSongRatings = async () => {

     //get all song ratings for user
     try {
      const response = await axios.get(
          `${config.API_URL}/api/ratings/all-songs`,
          { withCredentials: true }
      );
        console.log('Songs found:', response.data);
        setSongRatings(response.data);
      } catch (error) {
          console.error('Error fetching data:', error);
      }
  };

  const getAlbumRatings = async () => {
    try {
      const response = await axios.get(
          `${config.API_URL}/api/ratings/all-albums`,
          { withCredentials: true }
      );
        console.log('Albums found:', response.data);
        setAlbumRatings(response.data);
      } catch (error) {
          console.error('Error fetching data:', error);
      }
  };

  const getFriendsRatings = async () => {
    try {
      const response = await axios.get(
        `${config.API_URL}/api/ratings/friends`,
        { withCredentials: true }
      );
      console.log('Friends ratings found:', response.data);
      setFriendsRatings(response.data);
    } catch (error) {
      console.error('Error fetching friends ratings:', error);
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
      if (myFeaturedTab === "friends") {
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
        if (myFeaturedTab === "songs") return item.type === "song";
        if (myFeaturedTab === "albums") return item.type === "album";
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
    if (myFeaturedTab === "friends") {
      const type = item.type;
      const id = type === "song" ? item.spotifyTrackId : item.spotifyAlbumId;
      navigate(`/ratings/${type}/${id}`);
    } else {
      // For songs/albums tabs, use the tab to determine type
      const type = myFeaturedTab === "songs" ? "song" : "album";
      navigate(`/ratings/${type}/${item.spotifyId}`);
    }
  };


  return (
    <div className="recommendations-page ratings-page page">
          <div className="type-tabs">
            <button className={typeTab === 'ratings' ? 'active' : ''}
             onClick={() => setTypeTab('ratings')}
            >Ratings
            </button>

            <button className={typeTab === 'reviews' ? 'active' : ''}
             onClick={() => setTypeTab('reviews')}
            >Reviews
            </button>
          </div>

          {/* Search Bar - Outside container, above it */}
          <div className="ratings-search-container">
              <input
                type="text"
                className="ratings-search-input round-outline"
                placeholder={
                  myFeaturedTab === 'friends'
                    ? "Search friends' ratings..."
                    : `Search any ${myFeaturedTab}..`
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

              {/* Search Results Dropdown */}
              {showSearchResults && searchResults.length > 0 && (
                <div className="ratings-search-results-dropdown round-outline">
                  {searchResults.map((item) => {
                    // Handle different data structures for Friends vs Songs/Albums
                    const isFriendsTab = myFeaturedTab === "friends";
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
                          className="search-result-image"
                        />
                        <div className="search-result-info">
                          <p className="search-result-name">{itemName}</p>
                          <p className="search-result-artist">{itemArtist}</p>
                          {isFriendsTab && (
                            <p className="search-result-user">by {item.userName}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {showSearchResults && searchResults.length === 0 && !isSearching && (
                <div className="ratings-search-results-dropdown round-outline">
                  <p className="search-no-results">No results found</p>
                </div>
              )}
            </div>

          {/* Backdrop to close search */}
          {showSearchResults && (
            <div
              className="ratings-search-backdrop"
              onClick={() => {
                setShowSearchResults(false);
                setSearchQuery("");
              }}
            />
          )}

        <div className="ratings-container round-outline blue-box-shadow">
          <div className="featured-tabs">
              <button
                className={myFeaturedTab === 'songs' ? 'active' : ''}
                onClick={() => setMyFeaturedTab('songs')}
              >
                Songs
              </button>
              <button
                className={myFeaturedTab === 'albums' ? 'active' : ''}
                onClick={() => setMyFeaturedTab('albums')}
              >
                Albums
              </button>
              <button
                className={myFeaturedTab === 'friends' ? 'active' : ''}
                onClick={() => setMyFeaturedTab('friends')}
              >
                Friends
              </button>

              {/* Filter Button (Friends Tab Only) */}
              {myFeaturedTab === 'friends' && (
                <div className="filter-container" ref={filterRef}>
                  <button
                    className="filter-button"
                    onClick={() => setShowFriendFilter(!showFriendFilter)}
                    title="Filter ratings"
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
                  {showFriendFilter && (
                    <div className="filter-dropdown">
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
                </div>
              )}
            </div>

            <div className="ratings-list">
            
            {myFeaturedTab === 'songs' && typeTab === 'ratings' && (
              songRatings.map((rating) => (
                <div key={rating.spotifyTrackId} className="fade-in-item">
                  <RatedSongComponentDesktop
                    songData={rating}
                    type={"song"}
                  />
                </div>
              ))
            )}

            {myFeaturedTab === 'albums' && typeTab === 'ratings' && (
              albumRatings.map((rating) => (
                <div key={rating.spotifyAlbumId} className="fade-in-item">
                  <RatedSongComponentDesktop
                    songData={rating}
                    type={"album"}
                  />
                </div>
              ))
            )}

            {myFeaturedTab === 'songs' && typeTab === 'reviews' && (
              songRatings
                .filter(rating => rating.comment && rating.comment.trim() !== "")
                .map((rating) => (
                  <div className="song-component fade-in-item" key={rating.spotifyTrackId}>
                    <img className="circle stats-circle" src={rating?.imageUrl} alt="{rating.spotifyTrackId}" />
                    <div className="song-info">
                        <p className="song-name">
                            <Link to={`/ratings/song/${rating?.spotifyTrackId}`}>
                                {rating?.songName}
                            </Link>
                        </p>
                        <p className="song-name">{rating?.displayName}</p>
                        <p className="artist-name">{rating?.artistName}</p>
                        <p className="round-outline ratings-comment">{rating?.comment}</p>
                    </div>
                  </div>
                ))
            )}

            {myFeaturedTab === 'albums' && typeTab === 'reviews' && (
              albumRatings
                .filter(rating => rating.comment && rating.comment.trim() !== "")
                .map((rating) => (
                  <div className="song-component fade-in-item" key={rating.spotifyTrackId}>
                    <img className="circle stats-circle" src={rating?.imageUrl} alt="{rating.spotifyAlbumId}" />
                    <div className="song-info">
                        <p className="song-name">
                            <Link to={`/ratings/album/${rating?.spotifyAlbumId}`}>
                                {rating?.albumName}
                            </Link>
                        </p>
                        <p className="song-name">{rating?.displayName}</p>
                        <p className="artist-name">{rating?.artistName}</p>
                        <p className="round-outline ratings-comment">{rating?.comment}</p>
                    </div>
                  </div>
                ))
            )}

            {myFeaturedTab === 'friends' && typeTab === 'ratings' && (
              <>
                {friendsRatings.length > 0 ? (
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
                        <RatedSongComponentDesktop
                          songData={rating}
                          type={rating.type}
                          showTypeBadge={true}
                        />
                      </div>
                    ))
                ) : (
                  <p className="empty-message">No friends have rated anything yet.</p>
                )}
              </>
            )}

            {myFeaturedTab === 'friends' && typeTab === 'reviews' && (
              friendsRatings.filter(rating => rating.comment && rating.comment.trim() !== "").length > 0 ? (
                friendsRatings
                  .filter(rating => rating.comment && rating.comment.trim() !== "")
                  .map((rating) => (
                    <div className="song-component rated-song-desktop fade-in-item" key={`${rating.type}-${rating.spotifyTrackId || rating.spotifyAlbumId}-${rating.userName}`}>
                      <p className="user-name-header">{rating.displayName}</p>
                      <div className="song-content-row">
                        <img className="circle stats-circle" src={rating?.imageUrl} alt={rating.type} />
                        <div className="song-info">
                            <p className="song-name">
                                <Link to={`/ratings/${rating.type}/${rating.type === 'song' ? rating.spotifyTrackId : rating.spotifyAlbumId}`}>
                                    {rating.type === 'song' ? rating.songName : rating.albumName}
                                </Link>
                            </p>
                            <p className="artist-name">{rating?.artistName}</p>
                            <p className="round-outline ratings-comment">{rating?.comment}</p>
                        </div>
                      </div>
                    </div>
                  ))
              ) : (
                <p className="empty-message">No friends have written reviews yet.</p>
              )
            )}

            </div>

        </div>
        <Footer />
    </div>
  )
}

export default RatingsPage;