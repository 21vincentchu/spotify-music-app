import axios from 'axios';
import { useEffect, useState, useRef } from 'react';

import SongComponent from '../../components/shared/SongComponent';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import ProfileButtonMobile from '../../components/mobile/ProfileButtonMobile';
import config from '../../config';

function StatisticsPage() {
  const [category, setCategory] = useState('songs');
  const [timeframe, setTimeframe] = useState('short_term');
  const [loading, setLoading] = useState(false);
  const [songs, setSongs] = useState([]);
  const [featuredSongs, setFeaturedSongs] = useState([]);
  const [featuredArtists, setFeaturedArtists] = useState([]);
  const [featuredAlbums, setFeaturedAlbums] = useState([]);
  const [showTimeframeFilter, setShowTimeframeFilter] = useState(false);
  const filterRef = useRef(null);

  useEffect(() => {
    getSongs();
    getFeaturedSongs();
    getFeaturedArtists();
    getFeaturedAlbums();
  }, [category, timeframe]);

  // Close filter dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowTimeframeFilter(false);
      }
    };

    if (showTimeframeFilter) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showTimeframeFilter]);

  const getFeaturedSongs = async () => {
    try {
      const response = await axios.get(`${config.API_URL}/api/featured-songs/`, {
        withCredentials: true
      });
      setFeaturedSongs(response.data);
    } catch (error) {
      console.error('Error fetching featured songs:', error);
    }
  };

  const getFeaturedArtists = async () => {
    try {
      const response = await axios.get(`${config.API_URL}/api/featured-artists/`, {
        withCredentials: true
      });
      setFeaturedArtists(response.data);
    } catch (error) {
      console.error('Error fetching featured artists:', error);
    }
  };

  const getFeaturedAlbums = async () => {
    try {
      const response = await axios.get(`${config.API_URL}/api/featured-albums/`, {
        withCredentials: true
      });
      setFeaturedAlbums(response.data);
    } catch (error) {
      console.error('Error fetching featured albums:', error);
    }
  };

  const getSongs = async () => {
    setLoading(true);

    axios
      .get(`${config.API_URL}/api/top-${category}/${timeframe}`, {
        withCredentials: true,
      })
      .then((response) => {
        setSongs(response.data);
      })
      .catch((error) => {
        console.error('Error fetching top songs:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const isSongFeatured = (spotifyTrackId) => {
    return featuredSongs.some(song => song.spotifyTrackId === spotifyTrackId);
  };

  const isArtistFeatured = (spotifyArtistId) => {
    return featuredArtists.some(artist => artist.spotifyArtistId === spotifyArtistId);
  };

  const isAlbumFeatured = (spotifyAlbumId) => {
    return featuredAlbums.some(album => album.spotifyAlbumId === spotifyAlbumId);
  };

  const getIsFeatured = (item) => {
    if (item.spotifyTrackId) return isSongFeatured(item.spotifyTrackId);
    if (item.spotifyArtistId) return isArtistFeatured(item.spotifyArtistId);
    if (item.spotifyAlbumId) return isAlbumFeatured(item.spotifyAlbumId);
    return false;
  };

  return (
    <div className="mobile-layout">
      <ProfileButtonMobile />
      <div className="stats-page-single page">
        <div className="stats-single-box round-outline blue-box-shadow">
          <h2 key={category} className="stats-title-animated">Top {category.charAt(0).toUpperCase() + category.slice(1)}</h2>
          <p className="stats-hint-text">
            Tap {category === 'songs' ? 'a song' : category === 'albums' ? 'an album' : 'an artist'} to review • Star to recommend to friends
          </p>

          <div className="featured-tabs">
            <button
              className={category === 'songs' ? 'active' : ''}
              onClick={() => setCategory('songs')}
            >
              Songs
            </button>
            <button
              className={category === 'artists' ? 'active' : ''}
              onClick={() => setCategory('artists')}
            >
              Artists
            </button>
            <button
              className={category === 'albums' ? 'active' : ''}
              onClick={() => setCategory('albums')}
            >
              Albums
            </button>
            <div className="filter-container-mobile" ref={filterRef}>
              <button
                className="filter-button-mobile"
                onClick={() => setShowTimeframeFilter(!showTimeframeFilter)}
                title="Filter timeframe"
              >
                <svg className="filter-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 4H21V6.5L14 13.5V20L10 22V13.5L3 6.5V4Z" fill="currentColor"/>
                </svg>
              </button>
              {showTimeframeFilter && (
                <div className="filter-dropdown-mobile">
                  <div className="filter-dropdown-header">
                    <span>Timeframe</span>
                  </div>
                  <div className="filter-options">
                    <label className="filter-option">
                      <input
                        type="radio"
                        name="timeframe"
                        checked={timeframe === 'short_term'}
                        onChange={() => {
                          setTimeframe('short_term');
                          setShowTimeframeFilter(false);
                        }}
                      />
                      <span>4 Weeks</span>
                    </label>
                    <label className="filter-option">
                      <input
                        type="radio"
                        name="timeframe"
                        checked={timeframe === 'medium_term'}
                        onChange={() => {
                          setTimeframe('medium_term');
                          setShowTimeframeFilter(false);
                        }}
                      />
                      <span>6 Months</span>
                    </label>
                    <label className="filter-option">
                      <input
                        type="radio"
                        name="timeframe"
                        checked={timeframe === 'long_term'}
                        onChange={() => {
                          setTimeframe('long_term');
                          setShowTimeframeFilter(false);
                        }}
                      />
                      <span>1 Year</span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="stats-single-list">
            {loading ? (
              <LoadingSpinner message="Loading statistics..." />
            ) : songs.length === 0 && category === 'albums' ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
                <p style={{ fontSize: '18px', marginBottom: '10px' }}>⏳ Calculating your top albums...</p>
                <p style={{ fontSize: '14px' }}>This may take 2-3 minutes. Your songs and artists are ready to view!</p>
              </div>
            ) : (
              songs.slice(0, 150).map((song, index) => (
                <div key={song.id || index} className="fade-in-item">
                  <SongComponent
                    songData={song}
                    showStar={true}
                    isFeatured={getIsFeatured(song)}
                  />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default StatisticsPage;
