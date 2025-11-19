import React, { useEffect, useState } from "react";
import "../../styles/Mobile.css";

import axios from "axios";
import LoadingSpinner from "../../components/shared/LoadingSpinner";
import SongComponent from "../../components/shared/SongComponent";
import config from "../../config";

const HomeMobile = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [recentData, setRecentData] = useState(null);
  const [featuredSongs, setFeaturedSongs] = useState([]);
  const [featuredArtists, setFeaturedArtists] = useState([]);
  const [featuredAlbums, setFeaturedAlbums] = useState([]);

  // ===============================
  // Fetch All Mobile Homepage Data
  // ===============================
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      const [recentRes, songsRes, artistsRes, albumsRes] = await Promise.all([
        axios.get(`${config.API_URL}/api/recently-played`, { withCredentials: true }),
        axios.get(`${config.API_URL}/api/featured-songs/`, { withCredentials: true }),
        axios.get(`${config.API_URL}/api/featured-artists/`, { withCredentials: true }),
        axios.get(`${config.API_URL}/api/featured-albums/`, { withCredentials: true }),
      ]);

      setRecentData(recentRes.data);
      setFeaturedSongs(songsRes.data);
      setFeaturedArtists(artistsRes.data);
      setFeaturedAlbums(albumsRes.data);
    } catch (err) {
      console.error("Mobile Home Fetch Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // ===============================
  // Featured Status Helpers
  // ===============================
  const isSongFeatured = (spotifyTrackId) =>
    featuredSongs.some((song) => song.spotifyTrackId === spotifyTrackId);

  const isArtistFeatured = (spotifyArtistId) =>
    featuredArtists.some((artist) => artist.spotifyArtistId === spotifyArtistId);

  const isAlbumFeatured = (spotifyAlbumId) =>
    featuredAlbums.some((album) => album.spotifyAlbumId === spotifyAlbumId);

  const getIsFeatured = (item) => {
    if (item.spotifyTrackId) return isSongFeatured(item.spotifyTrackId);
    if (item.spotifyArtistId) return isArtistFeatured(item.spotifyArtistId);
    if (item.spotifyAlbumId) return isAlbumFeatured(item.spotifyAlbumId);
    return false;
  };

  return (
    <div className="mobile-layout">
      <div className="mobile-content">
      

        {isLoading ? (
          <LoadingSpinner message="Loading your music..." />
        ) : (
          <div className="home-page">

            {/* ================================
                SECTION 1 — Top Songs (Recently Played)
            ================================= */}
            <div className="scroll-section">
              <section className="home-featured">
                <h2>Top Songs</h2>
                <p className="subtext">Songs You've Been Loving</p>

                <div className="grid-wrapper">
                  <div className="responsive-grid">
                    {recentData?.top_songs?.slice(0, 12).map((song, i) => (
                      <SongComponent
                        key={i}
                        songData={song}
                        isFeatured={getIsFeatured(song)}
                        showStar={true}
                      />
                    ))}
                  </div>
                </div>
              </section>
            </div>

            {/* ================================
                SECTION 2 — Featured Recommendations
            ================================= */}
            <div className="scroll-section">
              <section className="home-featured">
                <h2>Featured Recommendations</h2>
                <p className="subtext">Your friends want you to listen to...</p>

                <div className="grid-wrapper">
                  <div className="responsive-grid">
                    {featuredSongs.slice(0, 12).map((song, i) => (
                      <SongComponent
                        key={i}
                        songData={song}
                        isFeatured={true}
                        showStar={true}
                      />
                    ))}
                  </div>
                </div>
              </section>
            </div>

            {/* ================================
                SECTION 3 — Stats
            ================================= */}
            <div className="scroll-section">
              <section className="home-featured">
                <h2>Recent Statistics</h2>

                <p className="featured-stat-heading">
                  Average Track Length:{" "}
                  <strong>{recentData?.listening_stats?.avg_track_length_minutes} min</strong>
                </p>

                <p className="featured-stat-heading">
                  Total Hours:{" "}
                  <strong>{Math.round(recentData?.listening_stats?.total_hours)}</strong>
                </p>

                <p className="featured-stat-heading">
                  Total Minutes:{" "}
                  <strong>{Math.round(recentData?.listening_stats?.total_minutes)}</strong>
                </p>

                <p className="featured-stat-heading">
                  Total Plays:{" "}
                  <strong>{recentData?.listening_stats?.total_plays}</strong>
                </p>
              </section>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default HomeMobile;
