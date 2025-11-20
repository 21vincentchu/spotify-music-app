import React from "react";
import "../../styles/Mobile.css";

function RecommendationsPage() {
  return (
    <div className="page" style={{ display: "flex", flexDirection: "column", gap: "16px", padding: "20px", marginTop: "20px" }}>
      
      {/* Header above scrollable section */}
      <h2 style={{ margin: "0 0 10px 0", color: "#034078", padding: "15x 15px", textAlign: "center"}}>
        Recommended Songs
      </h2>

      {/* Scrollable section */}
      <div
        className="scroll-section"
        style={{ maxHeight: "60vh", overflowY: "auto", padding: "15px" }}
      >
        <div
          className="song-list"
          style={{ display: "flex", flexDirection: "column", gap: "15px", margin: "0 0 100px 0"}}
        >
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
              <p className="song-title">Blinding Lights</p>
              <p className="song-artist">The Weeknd</p>
              <p className="song-genre">R&B</p>
            </div>
          </div>

          <div className="song-info-box">
            <div className="circle"></div>
            <div className="song-text">
              <p className="song-title">Levitating</p>
              <p className="song-artist">Dua Lipa</p>
              <p className="song-genre">Pop</p>
            </div>
          </div>

          <div className="song-info-box">
            <div className="circle"></div>
            <div className="song-text">
              <p className="song-title">Levitating</p>
              <p className="song-artist">Dua Lipa</p>
              <p className="song-genre">Pop</p>
            </div>
          </div>

          <div className="song-info-box">
            <div className="circle"></div>
            <div className="song-text">
              <p className="song-title">Levitating</p>
              <p className="song-artist">Dua Lipa</p>
              <p className="song-genre">Pop</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RecommendationsPage;
