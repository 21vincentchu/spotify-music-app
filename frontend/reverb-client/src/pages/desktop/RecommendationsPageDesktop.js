import axios from 'axios';
import { useEffect, useState } from 'react';
import SongComponent from '../../components/shared/SongComponent';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import config from '../../config';

function RecommendationsPage() {
  const [myFeaturedSongs, setMyFeaturedSongs] = useState([]);
  const [friendsFeaturedSongs, setFriendsFeaturedSongs] = useState([]);
  const [loadingMyFeatured, setLoadingMyFeatured] = useState(true);
  const [loadingFriendsFeatured, setLoadingFriendsFeatured] = useState(true);

  useEffect(() => {
    fetchMyFeaturedSongs();
    fetchFriendsFeaturedSongs();
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
        {/* Your Featured Songs Section */}
        <div className="featured-section round-outline blue-box-shadow">
          <h2>Your Featured Songs</h2>
          <div className="song-list">
            {loadingMyFeatured ? (
              <LoadingSpinner message="Loading your featured songs..." />
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
            )}
          </div>
        </div>

        {/* Friends' Featured Songs Feed */}
        <div className="friends-featured-section round-outline blue-box-shadow">
          <h2>Friends' Featured Songs</h2>
          <div className="friends-feed">
            {loadingFriendsFeatured ? (
              <LoadingSpinner message="Loading friends' featured songs..." />
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
              <p className="empty-message">No featured songs from friends yet. Add more friends!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default RecommendationsPage;