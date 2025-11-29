import { useState } from 'react';
import axios from 'axios';

export default function SearchTest() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const runSearch = async () => {
    setError('');
    setResults([]);
    setLoading(true);

    if (!query.trim()) {
      setLoading(false);
      return setError('Enter a song, album, or artist');
    }

    try {
      const res = await axios.get(`/api/search?q=${encodeURIComponent(query)}`, {
        withCredentials: true
      });

      setResults(res.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Test Music Search</h2>

      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Song, Album, Artist..."
        style={{ width: '250px' }}
      />
      <button onClick={runSearch} style={{ marginLeft: '10px' }}>
        Search
      </button>

      {loading && <p>Searching...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div style={{ marginTop: '20px' }}>
        {results.map((item, index) => (
          <div
            key={index}
            style={{
              border: '1px solid #ccc',
              borderRadius: '8px',
              padding: '10px',
              marginBottom: '10px',
              maxWidth: '350px'
            }}
          >
            {item.imageUrl && (
              <img
                src={item.imageUrl}
                alt={item.name}
                style={{ width: '80px', height: '80px', objectFit: 'cover' }}
              />
            )}
            <p><strong>{item.name}</strong></p>
            {item.artist && <p>{item.artist}</p>}
            <small>Type: {item.type}</small>
          </div>
        ))}
      </div>
    </div>
  );
}
