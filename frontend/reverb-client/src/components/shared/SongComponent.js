import React from "react";

function SongComponent({ avatarOnly = false, size = 70 }) {
  return (
    <div className={`song-component ${avatarOnly ? "avatar-only" : ""}`}>
      <div
        className="circle"
        style={{
          width: size + "px",
          height: size + "px",
          minWidth: size + "px",
        }}
      />
      {/* original text area — keep it but can be hidden by prop */}
      {!avatarOnly && (
        <div className="song-info">
          <p className="song-name">Song Name</p>
          <p className="artist-name">Artist Name</p>
        </div>
      )}
    </div>
  );
}

export default SongComponent;
