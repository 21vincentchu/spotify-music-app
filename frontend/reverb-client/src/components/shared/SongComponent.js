function SongComponent({songData}) {
    // Handle both songs (songName) and albums (albumName)
    const displayName = songData?.songName || songData?.albumName || songData?.artistName;
    const artistName = songData?.artistName;

    return (
        <div className="song-component">
            <div className="song-rank">#{songData?.rank}</div>
            <img className="circle" src={songData?.imageUrl}></img>
            <div className="song-info">
                <p className="song-name">{displayName}</p>
                <p className="artist-name">{artistName}</p>
            </div>
        </div>
      )}

export default SongComponent;
