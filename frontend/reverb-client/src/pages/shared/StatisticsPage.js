import axios from 'axios';
import { useEffect, useState } from 'react';
import config from '../../config';

import SongComponent from '../../components/shared/SongComponent';
import LoadingSpinner from '../../components/shared/LoadingSpinner';

function StatisticsPage() {
  const [category, setCategory] = useState('songs');
  const [timeframe, setTimeframe] = useState('short_term');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [songs, setSongs] = useState([]);
  const [artists, setArtists] = useState([]);
  const [albums, setAlbums] = useState([]);


  useEffect(() => {
   getSongs();
  }, [category, timeframe]); // Runs whenever category or timeframe changes

  const getSongs = async () => {
    setLoading(true);
    axios.get(`${config.API_URL}/api/top-${category}/${timeframe}`, {
      withCredentials: true
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
}



  return (
    <div className="stats-page">
      <div className="stats-content">
        <div className="stats-categories">
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
        <div className="stats-data round-outline">

            <div>
              {loading ? (
            <LoadingSpinner message="Loading statistics..." />
            ) : songs.length === 0 && category === 'albums' ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
                <p style={{ fontSize: '18px', marginBottom: '10px' }}>⏳ Calculating your top albums...</p>
                <p style={{ fontSize: '14px' }}>This may take 2-3 minutes. Your songs and artists are ready to view!</p>
              </div>
            ) : (
            songs.slice(0, 150).map((song, index) => (
                <SongComponent key={song.id || index} songData={song} />
            ))
            )}
            </div>

        </div>
        <div className="stats-timeframe">
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
            6 months
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