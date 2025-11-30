import React, { useEffect, useState } from "react";
import "../../styles/Mobile.css";

import axios from "axios";
import LoadingSpinner from "../../components/shared/LoadingSpinner";
import SongComponent from "../../components/shared/SongComponent";
import StatsDashboard from "../../components/shared/StatsDashboard";
import ProfileButtonMobile from "../../components/mobile/ProfileButtonMobile";
import config from "../../config";

const HomeMobile = () => {
  const [isLoadingRecentData, setIsLoadingRecentData] = useState(true);
  const [recentData, setRecentData] = useState([]);
  const [featuredSongs, setFeaturedSongs] = useState([]);

  // Load data when screen loads
  useEffect(() => {
    getRecentData();
    getFeaturedSongs();
  }, []);

  // Convert timestamp to relative time (e.g., "2 hours ago")
  const getRelativeTime = (timestamp) => {
    if (!timestamp) return 'Unknown time';

    const now = new Date();
    const playedDate = new Date(timestamp);
    const diffMs = now - playedDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
    if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
  };

  // ===============================
  // Fetch Recently Played Songs & Stats
  // ===============================
  const getRecentData = async () => {
    setIsLoadingRecentData(true);

    try {
      const response = await axios.get(`${config.API_URL}/api/recently-played`, {
        withCredentials: true,
      });

      setRecentData(response.data);
    } catch (error) {
      console.error("Error fetching recent data:", error);
    } finally {
      setIsLoadingRecentData(false);
    }
  };

  // ===============================
  // Fetch Featured Songs
  // ===============================
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

  // ===============================
  // Check if Song is Featured
  // ===============================
  const isSongFeatured = (spotifyTrackId) => {
    return featuredSongs.some(song => song.spotifyTrackId === spotifyTrackId);
  };

  return (
    <div className="mobile-layout">
      <ProfileButtonMobile />
      <div className="mobile-content">
        <div className="home-page page">

          {/* ================================
              RECENTLY PLAYED SONGS
          ================================= */}
          <div className="home-featured-box round-outline blue-box-shadow">
            <h2>Recently Played Songs</h2>

            {isLoadingRecentData ? (
              <LoadingSpinner message="Loading your music..." />
            ) : (
              <div className="song-list">
                {recentData.recent_tracks && recentData.recent_tracks.slice(0, 50).map((item, index) => {
                  const track = item.track;
                  const songData = {
                    songName: track.name,
                    artistName: track.artists?.[0]?.name || 'Unknown Artist',
                    albumName: track.album?.name,
                    spotifyTrackId: track.id,
                    imageUrl: track.album?.images?.[0]?.url,
                    rank: index + 1
                  };
                  return (
                    <div key={`${track.id}-${item.played_at}-${index}`} className="fade-in-item">
                      <SongComponent
                        songData={songData}
                        showStar={true}
                        isFeatured={isSongFeatured(track.id)}
                        timestamp={getRelativeTime(item.played_at)}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ================================
              RECENT STATISTICS
          ================================= */}
          <div className="home-stats-box round-outline blue-box-shadow">
            <h2>Recent Statistics</h2>

            {isLoadingRecentData ? (
              <LoadingSpinner message="Loading statistics..." />
            ) : (
              <div className="home-stats-scrollable">
                {/* NEW STAT BOXES */}
                <div className="stat-boxes-row">
                  <div className="stat-box-new">
                    <div className="stat-label-new">AVERAGE TRACK LENGTH</div>
                    <div className="stat-number-new">{recentData.listening_stats?.avg_track_length_minutes || 0} min</div>
                  </div>
                  <div className="stat-box-new">
                    <div className="stat-label-new">TOTAL MINUTES</div>
                    <div className="stat-number-new">{Math.round(recentData.listening_stats?.total_minutes || 0)} min</div>
                  </div>
                </div>

                <div className="mobile-genre-section">
                  <h3>Top Genres</h3>
                  <ol className="mobile-genre-list">
                    {recentData.genre_stats?.top_genres?.map((item, index) => (
                      <li key={index}>
                        <span className="genre-name">{item.genre}</span>
                        <span className="genre-count">{item.count} song{item.count !== 1 ? 's' : ''}</span>
                      </li>
                    )) || <li>No genres found</li>}
                  </ol>
                </div>
                <StatsDashboard recentTracks={recentData.recent_tracks} />
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default HomeMobile;
