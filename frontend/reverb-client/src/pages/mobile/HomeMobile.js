import SongComponent from "../../components/shared/SongComponent";
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import axios from 'axios';
import { useEffect, useState } from 'react';




function HomeMobile() {
  return (
    <div className="home-page">
      {/* FEATURED STATS */}
      <div className="home-featured">
        <h2>Featured Stats</h2>
        <p className="subtext">Top Songs of the Day</p>

        <div className="home-featured-stats">
          <div className="featured-song">
            <SongComponent avatarOnly={true} size={80} />
            <div className="song-info-box">
              <p className="song-title">Song Title</p>
              <p className="song-artist">Artist Name</p>
              <p className="song-genre">Genre</p>
            </div>
          </div>

          <div className="featured-song">
            <SongComponent avatarOnly={true} size={80} />
            <div className="song-info-box">
              <p className="song-title">Another Song</p>
              <p className="song-artist">Another Artist</p>
              <p className="song-genre">Pop</p>
            </div>
          </div>
        </div>
      </div>

      {/* FEATURED RECOMMENDATIONS */}
      <div className="home-featured home-featured-recs">
        <h2>Featured Recs</h2>
        <p className="subtext">Friends say you should listen to...</p>

        <div className="featured-song">
          <SongComponent avatarOnly={true} size={80} />
          <div className="song-info-box shadow-box">
            <p className="song-title">Song Title</p>
            <p className="song-artist">Artist Name</p>
          </div>
        </div>

        <div className="featured-song">
          <SongComponent avatarOnly={true} size={80} />
          <div className="song-info-box shadow-box">
            <p className="song-title">Song Title</p>
            <p className="song-artist">Artist Name</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomeMobile;