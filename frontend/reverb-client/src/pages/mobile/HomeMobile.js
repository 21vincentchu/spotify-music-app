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

  // Load data when screen loads
  useEffect(() => {
    getRecentData();
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

  return (
    <div className="mobile-layout">
      <ProfileButtonMobile />
      <div className="mobile-content">
        <div className="home-page">

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
                    <SongComponent
                      key={track.id || index}
                      songData={songData}
                      showStar={true}
                      isFeatured={false}
                      timestamp={getRelativeTime(item.played_at)}
                    />
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
              <>
                <div className="mobile-stats-section">
                  <div className="mobile-stat-box">
                    <h3>Average Track Length</h3>
                    <p className="stat-value">{recentData.listening_stats.avg_track_length_minutes} min</p>
                  </div>
                  <div className="mobile-stat-box">
                    <h3>Total Minutes</h3>
                    <p className="stat-value">{Math.round(recentData.listening_stats.total_minutes)} min</p>
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
              </>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default HomeMobile;
