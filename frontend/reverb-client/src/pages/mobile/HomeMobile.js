import SongComponent from "../../components/shared/SongComponent";

function HomeMobile() {
  return (
    <div className="home-page">
      <div className="home-featured">
        <h2>Featured Stats</h2>
        <p className="subtext">Top Songs of the Day</p>

        <div className="home-featured-stats">
          {/* Each song row */}
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

      <div className="home-featured">
        <h2>Featured Recs</h2>
        <div className="home-featured-recs">
          <SongComponent />
        </div>
      </div>
    </div>
  );
}

export default HomeMobile;
