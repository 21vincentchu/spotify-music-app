import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import config from '../../config';
import SongComponent from './SongComponent';
import LoadingSpinner from './LoadingSpinner';

function SearchBar({ featuredSongs, featuredArtists, featuredAlbums, onToggleFeatured }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const resultsRef = useRef(null);

  useEffect(() => {
    // Debounce search
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        handleSearch();
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (resultsRef.current && !resultsRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    if (showResults) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showResults]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setShowResults(true);
    try {
      const response = await axios.get(`${config.API_URL}/api/search`, {
        params: { q: searchQuery, limit: 20 },
        withCredentials: true
      });

      // Map search results and check if they're already featured
      const resultsWithFeaturedStatus = response.data.map(item => {
        let isFeatured = false;

        if (item.type === 'song') {
          isFeatured = featuredSongs.some(song => song.spotifyTrackId === item.spotifyId);
        } else if (item.type === 'artist') {
          isFeatured = featuredArtists.some(artist => artist.spotifyArtistId === item.spotifyId);
        } else if (item.type === 'album') {
          isFeatured = featuredAlbums.some(album => album.spotifyAlbumId === item.spotifyId);
        }

        // Transform search result to match SongComponent format
        return {
          spotifyTrackId: item.type === 'song' ? item.spotifyId : undefined,
          spotifyArtistId: item.type === 'artist' ? item.spotifyId : undefined,
          spotifyAlbumId: item.type === 'album' ? item.spotifyId : undefined,
          songName: item.type === 'song' ? item.name : undefined,
          artistName: item.type === 'artist' ? item.name : item.artist,
          albumName: item.type === 'album' ? item.name : undefined,
          imageUrl: item.imageUrl,
          isFeatured
        };
      });

      setSearchResults(resultsWithFeaturedStatus);
    } catch (error) {
      console.error('Error searching:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleToggle = (itemId, isNowFeatured) => {
    // Update the search results to reflect the new featured status
    setSearchResults(prev => prev.map(item => {
      const currentId = item.spotifyTrackId || item.spotifyArtistId || item.spotifyAlbumId;
      if (currentId === itemId) {
        return { ...item, isFeatured: isNowFeatured };
      }
      return item;
    }));

    // Call parent handler if provided
    if (onToggleFeatured) {
      onToggleFeatured(itemId, isNowFeatured);
    }
  };

  const getFilteredResults = () => {
    if (activeFilter === 'all') {
      return searchResults;
    }
    return searchResults.filter(item => {
      if (activeFilter === 'song') return item.spotifyTrackId;
      if (activeFilter === 'artist') return item.spotifyArtistId;
      if (activeFilter === 'album') return item.spotifyAlbumId;
      return true;
    });
  };

  return (
    <>
      {showResults && <div className="search-backdrop" onClick={() => setShowResults(false)} />}

      <div className="search-bar-wrapper" ref={resultsRef}>
        <div className="search-pill-container">
          <input
            type="text"
            className="search-pill"
            placeholder="search anything to recommend.."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => searchQuery && setShowResults(true)}
          />
          {searchQuery && (
            <button
              className="search-clear-btn"
              onClick={() => {
                setSearchQuery('');
                setSearchResults([]);
                setShowResults(false);
              }}
            >
              ✕
            </button>
          )}
        </div>

        {showResults && (
          <div className="search-results-dropdown">
            {isSearching ? (
              <div className="search-loading">
                <LoadingSpinner message="Searching..." />
              </div>
            ) : searchResults.length > 0 ? (
              <>
                <div className="search-filter-tabs">
                  <button
                    className={`search-filter-tab ${activeFilter === 'all' ? 'active' : ''}`}
                    onClick={() => setActiveFilter('all')}
                  >
                    All
                  </button>
                  <button
                    className={`search-filter-tab ${activeFilter === 'song' ? 'active' : ''}`}
                    onClick={() => setActiveFilter('song')}
                  >
                    Songs
                  </button>
                  <button
                    className={`search-filter-tab ${activeFilter === 'artist' ? 'active' : ''}`}
                    onClick={() => setActiveFilter('artist')}
                  >
                    Artists
                  </button>
                  <button
                    className={`search-filter-tab ${activeFilter === 'album' ? 'active' : ''}`}
                    onClick={() => setActiveFilter('album')}
                  >
                    Albums
                  </button>
                </div>
                <div className="search-dropdown-results">
                  {getFilteredResults().map((result, index) => (
                    <div key={index}>
                      <SongComponent
                        songData={result}
                        showStar={true}
                        isFeatured={result.isFeatured}
                        showRank={false}
                        onToggleFeatured={handleToggle}
                      />
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="empty-message">No results found for "{searchQuery}"</p>
            )}
          </div>
        )}
      </div>
    </>
  );
}

export default SearchBar;
