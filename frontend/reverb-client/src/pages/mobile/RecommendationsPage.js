import React, { useState } from "react";
import "../../styles/Mobile.css";

function MobileRecommendationsPage() {
  const [myTab, setMyTab] = useState("songs");
  const [friendsTab, setFriendsTab] = useState("songs");

  return (
    <div className="mobile-layout">
      <div className="mobile-content">

        {/* ===== My Featured Section ===== */}
        <h2>Your Featured</h2>

        {/* Tabs */}
        <div className="featured-tabs" style={{ display: "flex", gap: "8px" }}>
          <button
            className={myTab === "songs" ? "active" : ""}
            onClick={() => setMyTab("songs")}
          >
            Songs
          </button>
          <button
            className={myTab === "artists" ? "active" : ""}
            onClick={() => setMyTab("artists")}
          >
            Artists
          </button>
          <button
            className={myTab === "albums" ? "active" : ""}
            onClick={() => setMyTab("albums")}
          >
            Albums
          </button>
        </div>

        <div className="scroll-section">
          <div className="song-list">

            {/* EXAMPLE STATIC ITEMS — replace with real data later */}
            {myTab === "songs" && (
              <>
                <div className="song-info-box">
                  <div className="circle"></div>
                  <div className="song-text">
                    <p className="song-title">Lost in Japan</p>
                    <p className="song-artist">Shawn Mendes</p>
                  </div>
                </div>

                <div className="song-info-box">
                  <div className="circle"></div>
                  <div className="song-text">
                    <p className="song-title">Blinding Lights</p>
                    <p className="song-artist">The Weeknd</p>
                  </div>
                </div>
              </>
            )}

            {myTab === "artists" && (
              <p style={{ textAlign: "center" }}>No featured artists yet.</p>
            )}

            {myTab === "albums" && (
              <p style={{ textAlign: "center" }}>No featured albums yet.</p>
            )}
          </div>
        </div>

        {/* ===== Friends Featured Section ===== */}
        <h2 className="friends-heading">Friends' Featured</h2>


        <div className="featured-tabs" style={{ display: "flex", gap: "8px" }}>
          <button
            className={friendsTab === "songs" ? "active" : ""}
            onClick={() => setFriendsTab("songs")}
          >
            Songs
          </button>
          <button
            className={friendsTab === "artists" ? "active" : ""}
            onClick={() => setFriendsTab("artists")}
          >
            Artists
          </button>
          <button
            className={friendsTab === "albums" ? "active" : ""}
            onClick={() => setFriendsTab("albums")}
          >
            Albums
          </button>
        </div>

        <div className="scroll-section">
          <div className="song-list">

            {friendsTab === "songs" && (
              <p className="empty-message">No friends’ songs yet.</p>
            )}

            {friendsTab === "artists" && (
              <p className="empty-message">No friends’ artists yet.</p>
            )}

            {friendsTab === "albums" && (
              <p className="empty-message">No friends’ albums yet.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default MobileRecommendationsPage;
