import { useState } from 'react';
import { Rating } from '@mui/material';
import axios from 'axios';

export default function EstherTest() {
  const [trackId, setTrackId] = useState('');
  const [albumId, setAlbumId] = useState('');
  const [songData, setSongData] = useState(null);
  const [albumData, setAlbumData] = useState(null);
  const [error, setError] = useState('');

  const fetchSong = async () => {
  setError('');
  try {
    const res = await axios.get(`/song/${trackId}`, { withCredentials: true });
    setSongData(res.data.song);
  } catch (err) {
    setError(err.response?.data?.error || 'Song not found');
    setSongData(null);
  }
};

const fetchAlbum = async () => {
  setError('');
  try {
    const res = await axios.get(`/album/${albumId}`, { withCredentials: true });
    setAlbumData(res.data.album);
  } catch (err) {
    setError(err.response?.data?.error || 'Album not found');
    setAlbumData(null);
  }
};


  return (
    <div className="ratings-detail-page" style={{ padding: '20px' }}>
      <h2>Test Song & Album API</h2>

      {/* Song Section */}
      <div className="ratings-detail-container round-outline blue-box-shadow" style={{ marginBottom: '20px', padding: '10px' }}>
        <h3>Fetch Song</h3>
        <input
          type="text"
          value={trackId}
          onChange={(e) => setTrackId(e.target.value)}
          placeholder="Spotify Track ID"
          style={{ width: '300px' }}
        />
        <button onClick={fetchSong} style={{ marginLeft: '10px' }}>Fetch Song</button>

        {songData && (
          <div className="ratings-detail-info" style={{ display: 'flex', alignItems: 'center', marginTop: '10px' }}>
            <img src={songData.imageUrl} alt="song cover" style={{ width: '80px', height: '80px', borderRadius: '8px' }} />
            <div style={{ marginLeft: '15px' }}>
              <p><strong>{songData.songName}</strong></p>
              <p>{songData.artistName}</p>
              <Rating value={songData.rating || 0} precision={0.5} readOnly />
            </div>
          </div>
        )}
      </div>

      {/* Album Section */}
      <div className="ratings-detail-container round-outline blue-box-shadow" style={{ marginBottom: '20px', padding: '10px' }}>
        <h3>Fetch Album</h3>
        <input
          type="text"
          value={albumId}
          onChange={(e) => setAlbumId(e.target.value)}
          placeholder="Spotify Album ID"
          style={{ width: '300px' }}
        />
        <button onClick={fetchAlbum} style={{ marginLeft: '10px' }}>Fetch Album</button>

        {albumData && (
          <div className="ratings-detail-info" style={{ display: 'flex', alignItems: 'center', marginTop: '10px' }}>
            <img src={albumData.imageUrl} alt="album cover" style={{ width: '80px', height: '80px', borderRadius: '8px' }} />
            <div style={{ marginLeft: '15px' }}>
              <p><strong>{albumData.albumName}</strong></p>
              <p>{albumData.artistName}</p>
            </div>
          </div>
        )}
      </div>

      {error && <div style={{ color: 'red', marginTop: '20px' }}>{error}</div>}
    </div>
  );
}
