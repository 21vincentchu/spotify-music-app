import React from "react";
import "../../styles/Mobile.css";

const HomeMobile = () => {
  return (
    <div className="mobile-content">
      {/* ===== Main Page Header ===== */}
      <h1 className="home-header">Welcome to Reverb</h1>

      <div className="home-page">
        {/* ===== Featured Recommendations ===== */}
        <section className="home-featured">
          <h2>Featured Stats</h2>
          <p className="subtext">Songs You've Been Loving</p>

          <div className="grid-wrapper">
            <div className="responsive-grid">
              <div className="song-info-box">
                <div className="circle"></div>
                <div className="song-text">
                  <p className="song-title">Lost in Japan</p>
                  <p className="song-artist">Shawn Mendes</p>
                  <p className="song-genre">Pop</p>
                </div>
              </div>

              <div className="song-info-box">
                <div className="circle"></div>
                <div className="song-text">
                  <p className="song-title">Levitating</p>
                  <p className="song-artist">Dua Lipa</p>
                  <p className="song-genre">Dance</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== Friends Say Section ===== */}
        <section className="home-featured">
          <h2>Featured Recommendations</h2>
          <p className="subtext">Friends Say You Should Listen to...</p>

          <div className="grid-wrapper">
            <div className="responsive-grid">
              <div className="song-info-box">
                <div className="circle"></div>
                <div className="song-text">
                  <p className="song-title">Midnight City</p>
                  <p className="song-artist">M83</p>
                  <p className="song-genre">Alternative</p>
                </div>
              </div>

              <div className="song-info-box">
                <div className="circle"></div>
                <div className="song-text">
                  <p className="song-title">Heat Waves</p>
                  <p className="song-artist">Glass Animals</p>
                  <p className="song-genre">Indie Pop</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default HomeMobile;
