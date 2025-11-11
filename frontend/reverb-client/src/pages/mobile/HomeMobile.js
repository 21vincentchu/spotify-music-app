import SongComponent from "../../components/shared/SongComponent";
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import axios from 'axios';
import { useEffect, useState } from 'react';

function HomeMobile() {
  return (
    <div className="home-page">
      {/* FEATURED STATS */}
      <h1>Welcome Back!</h1>
      <div className="home-featured">
        <h2>Featured Stats</h2>
        <p className="subtext">Top Songs of the Day</p>

        <div className="home-featured-stats">
          {[1, 2, 3, 4].map((song, i) => (
            <div key={i} className="song-info-box">
              <div className="circle"></div>
              <div className="song-text">
                <p className="song-title">Song Title {i}</p>
                <p className="song-artist">Artist Name</p>
                <p className="song-genre">Genre</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FEATURED RECOMMENDATIONS */}
      <div className="home-featured home-featured-recs">
        <h2>Featured Recs</h2>
        <p className="subtext">Friends say you should listen to...</p>

        {[1, 2, 3, 4, 5, 6].map((song, i) => (
          <div key={i} className="song-info-box">
            <div className="circle"></div>
            <div className="song-text">
              <p className="song-title">Song Title {i}</p>
              <p className="song-artist">Artist Name</p>
              <p className="song-genre">Pop</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default HomeMobile;
