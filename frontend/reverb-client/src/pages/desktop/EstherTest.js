import { useState } from 'react';
import axios from 'axios';
import { Rating } from '@mui/material';

export default function TestSongAlbum() {
  const [trackId, setTrackId] = useState('');
  const [albumId, setAlbumId] = useState('');
  const [songData, setSongData] = useState(null);
  const [albumData, setAlbumData] = useState(null);
  const [error, setError] = useState('');

  const fetchSong = async () => {
    setError('');
    setSongData(null);

    if (!trackId) return setError('Please enter a Spotify Track ID');

    try {
      const res = await axios.get(`/api/ratings/song/${trackId}`, {
        withCredentials: true
      });
      setSongData(res.data.song);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Song not found');
    }
  };

  const fetchAlbum = async () => {
    setError('');
    setAlbumData(null);

    if (!albumId) return setError('Please enter a Spotify Album ID');

    try {
      const res = await axios.get(`/api/ratings/album/${albumId}`, {
        withCredentials: true
      });
      setAlbumData(res.data.album);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Album not found');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Test Song & Album</h2>

      {/* Song */}
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          value={trackId}
          onChange={(e) => setTrackId(e.target.value)}
          placeholder="Spotify Track ID"
        />
        <button onClick={fetchSong} style={{ marginLeft: '10px' }}>Fetch Song</button>

        {songData && (
          <div style={{ marginTop: '10px', padding: '10px', border: '1px solid #ccc' }}>
            <img src={songData.imageUrl} alt="song" style={{ width: '80px', height: '80px' }} />
            <p>{songData.songName}</p>
            <p>{songData.artistName}</p>
            <Rating value={songData.rating || 0} precision={0.5} readOnly />
          </div>
        )}
      </div>

      {/* Album */}
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          value={albumId}
          onChange={(e) => setAlbumId(e.target.value)}
          placeholder="Spotify Album ID"
        />
        <button onClick={fetchAlbum} style={{ marginLeft: '10px' }}>Fetch Album</button>

        {albumData && (
          <div style={{ marginTop: '10px', padding: '10px', border: '1px solid #ccc' }}>
            <img src={albumData.imageUrl} alt="album" style={{ width: '80px', height: '80px' }} />
            <p>{albumData.albumName}</p>
            <p>{albumData.artistName}</p>
          </div>
        )}
      </div>

      {error && <div style={{ color: 'red' }}>{error}</div>}
    </div>
  );
}
