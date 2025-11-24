import React, { useEffect, useState } from "react";
import "../../styles/Mobile.css";

import axios from "axios";
import LoadingSpinner from "../../components/shared/LoadingSpinner";
import SongComponent from "../../components/shared/SongComponent";
import config from "../../config";

const HomeMobile = () => {
  const [isLoadingRecentData, setIsLoadingRecentData] = useState(true);
  const [recentData, setRecentData] = useState([]);

  // Load data when screen loads
  useEffect(() => {
    getRecentData();
  }, []);

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
      <div className="mobile-content">
        <div className="home-page">

          {/* ================================
              RECENTLY PLAYED SONGS
          ================================= */}
          <div className="home-featured">
            <h2>Recently Played Songs</h2>

            {isLoadingRecentData ? (
              <LoadingSpinner message="Loading your music..." />
            ) : (
              <div className="grid-wrapper">
                <div className="responsive-grid">
                  {recentData.top_songs.slice(0, 50).map((song, index) => (
                    <SongComponent
                      key={song.id || index}
                      songData={song}
                      showStar={true}
                      isFeatured={false} // Mobile identical to desktop
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ================================
              RECENT STATISTICS
          ================================= */}
          <div className="home-featured stats-box">
            <h2>Recent Statistics</h2>

            {isLoadingRecentData ? (
              <LoadingSpinner message="Loading statistics..." />
            ) : (
              <div className="stats-grid">
                <p>
                  <strong>Avg Track Length:</strong>{" "}
                  {recentData.listening_stats.avg_track_length_minutes} minutes
                </p>

                <p>
                  <strong>Total Hours:</strong>{" "}
                  {Math.round(recentData.listening_stats.total_hours)}
                </p>

                <p>
                  <strong>Total Minutes:</strong>{" "}
                  {Math.round(recentData.listening_stats.total_minutes)}
                </p>

                <p>
                  <strong>Total Plays:</strong>{" "}
                  {recentData.listening_stats.total_plays}
                </p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default HomeMobile;
