function SongComponent({songData}) {
    return (
        <div className="song-component">
            <div className="song-rank">#{songData?.rank}</div>
            <img className="circle stats-circle" src={songData?.imageUrl} />
            <div className="song-info">
                <p className="song-name">{songData?.songName}</p>
                <p className="artist-name">{songData?.artistName}</p>
            </div>
        </div>
      )}

export default SongComponent;
