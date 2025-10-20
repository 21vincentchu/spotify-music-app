function SongComponent({songData}) {
    return (
        <div className="song-component">
            <img className="circle" src={songData?.imageUrl}></img>
            <div className="song-info">
                 <p className="song-name">{songData?.songName}</p>
                <p className="artist-name">{songData?.artistName}</p>
            </div>
           
        </div>
    )
}

export default SongComponent;