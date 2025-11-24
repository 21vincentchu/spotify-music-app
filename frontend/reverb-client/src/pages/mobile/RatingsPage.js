import React, { useState } from "react";
import "../../styles/Mobile.css";
import StarIcon from "../../components/mobile/StarIcon";
import ProfileButtonMobile from "../../components/mobile/ProfileButtonMobile";

function RatingsPage() {
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data (replace later with backend data)
  const ratedSongs = [
    { title: "Lost in Japan", artist: "Shawn Mendes", rating: 4 },
    { title: "Blinding Lights", artist: "The Weeknd", rating: 5 },
    { title: "Levitating", artist: "Dua Lipa", rating: 3 },
  ];

  const ratedAlbums = [
    { title: "After Hours", artist: "The Weeknd", rating: 5 },
    { title: "Future Nostalgia", artist: "Dua Lipa", rating: 4 },
    { title: "Wonder", artist: "Shawn Mendes", rating: 3 },
  ];

  const renderStars = (rating) => (
    <div className="rating-stars">
      {Array(5)
        .fill(0)
        .map((_, i) => (
          <StarIcon key={i} filled={i < rating} size={22} />
        ))}
    </div>
  );

  return (
    <div className="mobile-layout ratings-fullscreen">
      <ProfileButtonMobile />
      <div className="ratings-page-wrapper">

      {/* ⭐ Fixed Search Bar */}
      <div className="search-bar-wrapper">
        <div className="search-bar">
          <div className="search-input-container">
            <input
              type="text"
              placeholder="Search song or album..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="search-button">Search</button>
        </div>
      </div>

      {/* ⭐ Scrollable Content */}
      <div className="ratings-page-content">

        {/* Rated Songs */}
        <h2 className="section-title">Rated Songs</h2>
        <div className="scroll-section">
          <div className="song-list">
            {ratedSongs.map((item, i) => (
              <div className="song-info-box" key={i}>
                <div className="circle"></div>
                <div className="song-text">
                  <p className="song-title">{item.title}</p>
                  <p className="song-artist">{item.artist}</p>
                </div>
                {renderStars(item.rating)}
              </div>
            ))}
          </div>
        </div>

        {/* Rated Albums */}
        <h2 className="section-title">Rated Albums</h2>
        <div className="scroll-section">
          <div className="song-list">
            {ratedAlbums.map((item, i) => (
              <div className="song-info-box" key={i}>
                <div className="circle"></div>
                <div className="song-text">
                  <p className="song-title">{item.title}</p>
                  <p className="song-artist">{item.artist}</p>
                </div>
                {renderStars(item.rating)}
              </div>
            ))}
          </div>
        </div>

        </div>
      </div>
    </div>
  );
}

export default RatingsPage;
