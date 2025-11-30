import Footer from "../../components/shared/Footer";
import { useState } from "react";
import { useEffect } from "react";
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
    <div className="recommendations-page">
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
                placeholder={myFeaturedTab === 'friends' ? "Search friends' ratings..." : `Search for ${myFeaturedTab}...`}
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
            </div>

            <div className="ratings-list">
            
            {myFeaturedTab === 'songs' && typeTab === 'ratings' && (
              songRatings.map((rating) => (
                <RatedSongComponentDesktop
                  key={rating.spotifyTrackId}
                  songData={rating}
                  type={"song"}
                />
              ))
            )}

            {myFeaturedTab === 'albums' && typeTab === 'ratings' && (
              albumRatings.map((rating) => (
                <RatedSongComponentDesktop
                  key={rating.spotifyAlbumId}
                  songData={rating}
                  type={"album"}
                />
              ))
            )}

            {myFeaturedTab === 'songs' && typeTab === 'reviews' && (
              songRatings
                .filter(rating => rating.comment && rating.comment.trim() !== "")
                .map((rating) => (
                  <div className="song-component" key={rating.spotifyTrackId}>
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
                  <div className="song-component" key={rating.spotifyTrackId}>
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
              friendsRatings.length > 0 ? (
                friendsRatings.map((rating) => (
                  <RatedSongComponentDesktop
                    key={`${rating.type}-${rating.spotifyTrackId || rating.spotifyAlbumId}-${rating.userName}`}
                    songData={rating}
                    type={rating.type}
                  />
                ))
              ) : (
                <p className="empty-message">No friends have rated anything yet.</p>
              )
            )}

            {myFeaturedTab === 'friends' && typeTab === 'reviews' && (
              friendsRatings.filter(rating => rating.comment && rating.comment.trim() !== "").length > 0 ? (
                friendsRatings
                  .filter(rating => rating.comment && rating.comment.trim() !== "")
                  .map((rating) => (
                    <div className="song-component rated-song-desktop" key={`${rating.type}-${rating.spotifyTrackId || rating.spotifyAlbumId}-${rating.userName}`}>
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