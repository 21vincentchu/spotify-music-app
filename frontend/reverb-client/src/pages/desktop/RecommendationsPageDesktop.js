import axios from 'axios';
import { useEffect, useState } from 'react';
import SongComponent from '../../components/shared/SongComponent';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import config from '../../config';

function RecommendationsPage() {
  const [myFeaturedSongs, setMyFeaturedSongs] = useState([]);
  const [myFeaturedArtists, setMyFeaturedArtists] = useState([]);
  const [myFeaturedAlbums, setMyFeaturedAlbums] = useState([]);
  const [friendsFeaturedSongs, setFriendsFeaturedSongs] = useState([]);
  const [friendsFeaturedArtists, setFriendsFeaturedArtists] = useState([]);
  const [friendsFeaturedAlbums, setFriendsFeaturedAlbums] = useState([]);
  const [loadingMyFeatured, setLoadingMyFeatured] = useState(true);
  const [loadingFriendsFeatured, setLoadingFriendsFeatured] = useState(true);
  const [myFeaturedTab, setMyFeaturedTab] = useState('songs');
  const [friendsFeaturedTab, setFriendsFeaturedTab] = useState('songs');

  useEffect(() => {
    fetchMyFeaturedSongs();
    fetchMyFeaturedArtists();
    fetchMyFeaturedAlbums();
    fetchFriendsFeaturedSongs();
    fetchFriendsFeaturedArtists();
    fetchFriendsFeaturedAlbums();
  }, []);

  const fetchMyFeaturedSongs = async () => {
    setLoadingMyFeatured(true);
    try {
      const response = await axios.get(`${config.API_URL}/api/featured-songs/`, {
        withCredentials: true
      });
      setMyFeaturedSongs(response.data);
    } catch (error) {
      console.error('Error fetching my featured songs:', error);
    } finally {
      setLoadingMyFeatured(false);
    }
  };

  const fetchMyFeaturedArtists = async () => {
    try {
      const response = await axios.get(`${config.API_URL}/api/featured-artists/`, {
        withCredentials: true
      });
      setMyFeaturedArtists(response.data);
    } catch (error) {
      console.error('Error fetching my featured artists:', error);
    }
  };

  const fetchMyFeaturedAlbums = async () => {
    try {
      const response = await axios.get(`${config.API_URL}/api/featured-albums/`, {
        withCredentials: true
      });
      setMyFeaturedAlbums(response.data);
    } catch (error) {
      console.error('Error fetching my featured albums:', error);
    }
  };

  const fetchFriendsFeaturedSongs = async () => {
    setLoadingFriendsFeatured(true);
    try {
      const response = await axios.get(`${config.API_URL}/api/featured-songs/friends`, {
        withCredentials: true
      });
      setFriendsFeaturedSongs(response.data);
    } catch (error) {
      console.error('Error fetching friends featured songs:', error);
    } finally {
      setLoadingFriendsFeatured(false);
    }
  };

  const fetchFriendsFeaturedArtists = async () => {
    try {
      const response = await axios.get(`${config.API_URL}/api/featured-artists/friends`, {
        withCredentials: true
      });
      setFriendsFeaturedArtists(response.data);
    } catch (error) {
      console.error('Error fetching friends featured artists:', error);
    }
  };

  const fetchFriendsFeaturedAlbums = async () => {
    try {
      const response = await axios.get(`${config.API_URL}/api/featured-albums/friends`, {
        withCredentials: true
      });
      setFriendsFeaturedAlbums(response.data);
    } catch (error) {
      console.error('Error fetching friends featured albums:', error);
    }
  };

  const handleToggleFeatured = (spotifyTrackId, isNowFeatured) => {
    if (!isNowFeatured) {
      // Remove from my featured songs
      setMyFeaturedSongs(prev => prev.filter(song => song.spotifyTrackId !== spotifyTrackId));
    } else {
      // Refresh to get the newly added song
      fetchMyFeaturedSongs();
    }
  };

  return (
    <div className="recommendations-page">
      <div className="recommendations-content">
        {/* Your Featured Section - Tabbed Interface */}
        <div className="featured-section round-outline blue-box-shadow">
          <h2>Your Featured</h2>

          {/* Tab Buttons */}
          <div className="featured-tabs">
            <button
              className={myFeaturedTab === 'songs' ? 'active' : ''}
              onClick={() => setMyFeaturedTab('songs')}
            >
              Songs
            </button>
            <button
              className={myFeaturedTab === 'artists' ? 'active' : ''}
              onClick={() => setMyFeaturedTab('artists')}
            >
              Artists
            </button>
            <button
              className={myFeaturedTab === 'albums' ? 'active' : ''}
              onClick={() => setMyFeaturedTab('albums')}
            >
              Albums
            </button>
          </div>

          {/* Tab Content */}
          <div className="song-list">
            {myFeaturedTab === 'songs' && (
              loadingMyFeatured ? (
                <LoadingSpinner message="Loading..." />
              ) : myFeaturedSongs.length > 0 ? (
                myFeaturedSongs.map((song, index) => (
                  <SongComponent
                    key={song.id || index}
                    songData={song}
                    showStar={true}
                    isFeatured={true}
                    onToggleFeatured={handleToggleFeatured}
                  />
                ))
              ) : (
                <p className="empty-message">No featured songs yet. Star songs from the Statistics page!</p>
              )
            )}

            {myFeaturedTab === 'artists' && (
              myFeaturedArtists.length > 0 ? (
                myFeaturedArtists.map((artist, index) => (
                  <SongComponent
                    key={artist.id || index}
                    songData={artist}
                    showStar={true}
                    isFeatured={true}
                    onToggleFeatured={(spotifyArtistId, isNowFeatured) => {
                      if (!isNowFeatured) {
                        setMyFeaturedArtists(prev => prev.filter(a => a.spotifyArtistId !== spotifyArtistId));
                      } else {
                        fetchMyFeaturedArtists();
                      }
                    }}
                  />
                ))
              ) : (
                <p className="empty-message">No featured artists yet.</p>
              )
            )}

            {myFeaturedTab === 'albums' && (
              myFeaturedAlbums.length > 0 ? (
                myFeaturedAlbums.map((album, index) => (
                  <SongComponent
                    key={album.id || index}
                    songData={album}
                    showStar={true}
                    isFeatured={true}
                    onToggleFeatured={(spotifyAlbumId, isNowFeatured) => {
                      if (!isNowFeatured) {
                        setMyFeaturedAlbums(prev => prev.filter(a => a.spotifyAlbumId !== spotifyAlbumId));
                      } else {
                        fetchMyFeaturedAlbums();
                      }
                    }}
                  />
                ))
              ) : (
                <p className="empty-message">No featured albums yet.</p>
              )
            )}
          </div>
        </div>

        {/* Friends' Featured Feed - Tabbed Interface */}
        <div className="friends-featured-section round-outline blue-box-shadow">
          <h2>Friends' Featured</h2>

          {/* Tab Buttons */}
          <div className="featured-tabs">
            <button
              className={friendsFeaturedTab === 'songs' ? 'active' : ''}
              onClick={() => setFriendsFeaturedTab('songs')}
            >
              Songs
            </button>
            <button
              className={friendsFeaturedTab === 'artists' ? 'active' : ''}
              onClick={() => setFriendsFeaturedTab('artists')}
            >
              Artists
            </button>
            <button
              className={friendsFeaturedTab === 'albums' ? 'active' : ''}
              onClick={() => setFriendsFeaturedTab('albums')}
            >
              Albums
            </button>
          </div>

          {/* Tab Content */}
          <div className="friends-feed">
            {friendsFeaturedTab === 'songs' && (
              loadingFriendsFeatured ? (
                <LoadingSpinner message="Loading..." />
              ) : friendsFeaturedSongs.length > 0 ? (
                friendsFeaturedSongs.map((song, index) => (
                  <div key={song.featuredSongId || index} className="friend-featured-item">
                    <div className="friend-info">
                      {song.profilePicture && (
                        <img src={song.profilePicture} alt={song.displayName} className="friend-profile-pic" />
                      )}
                      <div className="friend-details">
                        <span className="friend-name">{song.displayName || song.userName}</span>
                        <span className="featured-time">
                          {song.featuredAt ? new Date(song.featuredAt).toLocaleDateString() : ''}
                        </span>
                      </div>
                    </div>
                    <SongComponent
                      songData={song}
                      showStar={false}
                    />
                  </div>
                ))
              ) : (
                <p className="empty-message">No featured songs from friends yet.</p>
              )
            )}

            {friendsFeaturedTab === 'artists' && (
              friendsFeaturedArtists.length > 0 ? (
                friendsFeaturedArtists.map((artist, index) => (
                  <div key={artist.featuredArtistId || index} className="friend-featured-item">
                    <div className="friend-info">
                      {artist.profilePicture && (
                        <img src={artist.profilePicture} alt={artist.displayName} className="friend-profile-pic" />
                      )}
                      <div className="friend-details">
                        <span className="friend-name">{artist.displayName || artist.userName}</span>
                        <span className="featured-time">
                          {artist.featuredAt ? new Date(artist.featuredAt).toLocaleDateString() : ''}
                        </span>
                      </div>
                    </div>
                    <div className="featured-artist-display">
                      <img src={artist.imageUrl} alt={artist.artistName} className="artist-image circle" />
                      <span className="artist-name">{artist.artistName}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="empty-message">No featured artists from friends yet.</p>
              )
            )}

            {friendsFeaturedTab === 'albums' && (
              friendsFeaturedAlbums.length > 0 ? (
                friendsFeaturedAlbums.map((album, index) => (
                  <div key={album.featuredAlbumId || index} className="friend-featured-item">
                    <div className="friend-info">
                      {album.profilePicture && (
                        <img src={album.profilePicture} alt={album.displayName} className="friend-profile-pic" />
                      )}
                      <div className="friend-details">
                        <span className="friend-name">{album.displayName || album.userName}</span>
                        <span className="featured-time">
                          {album.featuredAt ? new Date(album.featuredAt).toLocaleDateString() : ''}
                        </span>
                      </div>
                    </div>
                    <div className="featured-album-display">
                      <img src={album.imageUrl} alt={album.albumName} className="album-image" />
                      <div className="album-info">
                        <span className="album-name">{album.albumName}</span>
                        <span className="album-artist">{album.artistName}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="empty-message">No featured albums from friends yet.</p>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default RecommendationsPage;