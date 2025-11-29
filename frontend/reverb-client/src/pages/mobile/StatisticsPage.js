import axios from 'axios';
import { useEffect, useState } from 'react';

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

  useEffect(() => {
    getSongs();
    getFeaturedSongs();
    getFeaturedArtists();
    getFeaturedAlbums();
  }, [category, timeframe]);

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
      <div className="mobile-stats">
        <div className="mobile-stats-content">
          <div className="mobile-stats-data round-outline blue-box-shadow">
            <h2>Top {category.charAt(0).toUpperCase() + category.slice(1)}</h2>
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
            </div>
            <div className="mobile-song-list">
              {loading ? (
                <LoadingSpinner message="Loading statistics..." />
              ) : songs.length === 0 && category === 'albums' ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
                  <p style={{ fontSize: '18px', marginBottom: '10px' }}>⏳ Calculating your top albums...</p>
                  <p style={{ fontSize: '14px' }}>This may take 2-3 minutes. Your songs and artists are ready to view!</p>
                </div>
              ) : (
                songs.slice(0, 150).map((song, index) => (
                  <SongComponent
                    key={song.id || index}
                    songData={song}
                    showStar={true}
                    isFeatured={getIsFeatured(song)}
                  />
                ))
              )}
            </div>
          </div>

          <div className="mobile-stats-timeframe">
            <button
              className={timeframe === 'short_term' ? 'active' : ''}
              onClick={() => setTimeframe('short_term')}
            >
              4 Weeks
            </button>
            <button
              className={timeframe === 'medium_term' ? 'active' : ''}
              onClick={() => setTimeframe('medium_term')}
            >
              6 Months
            </button>
            <button
              className={timeframe === 'long_term' ? 'active' : ''}
              onClick={() => setTimeframe('long_term')}
            >
              1 Year
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StatisticsPage;

