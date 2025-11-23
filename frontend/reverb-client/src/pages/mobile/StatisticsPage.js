import axios from 'axios';
import { useEffect, useState } from 'react';

import SongComponent from '../../components/shared/SongComponent';
import LoadingSpinner from '../../components/shared/LoadingSpinner';

function StatisticsPage() {
  const [category, setCategory] = useState('songs');
  const [timeframe, setTimeframe] = useState('short_term');
  const [loading, setLoading] = useState(false);
  const [songs, setSongs] = useState([]);

  useEffect(() => {
    getSongs();
  }, [category, timeframe]);

  const getSongs = async () => {
    setLoading(true);

    axios
      .get(`http://localhost:8000/api/top-${category}/${timeframe}`, {
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

  return (
    <div className="mobile-stats">
      <div className="mobile-stats-content">

        {/* Category Tabs */}
        <div className="mobile-stats-categories">
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

        {/* Song List */}
        <div className="mobile-stats-data round-outline blue-box-shadow">
          <div className="mobile-song-list">
            {loading ? (
              <LoadingSpinner message="Loading statistics..." />
            ) : (
              songs.slice(0, 10).map((song, index) => (
                <SongComponent
                  key={song.id || index}
                  songData={song}
                  showStar={true}      // ⭐ makes star visible + clickable
                  isFeatured={false}   // ⭐ prevents auto-detection from homepage
                />
              ))
              
            )}
          </div>
        </div>

        {/* Timeframe Buttons */}
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
  );
}

export default StatisticsPage;

