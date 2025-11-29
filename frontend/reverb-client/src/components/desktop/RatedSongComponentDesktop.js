
import { Rating } from '@mui/material';
import { Link } from 'react-router-dom';

function RatedSongComponentDesktop({songData,type}){


    let url = '';
    if(type === 'song'){
        url = `/ratings/song/${songData?.spotifyTrackId}`;
    }else if(type === 'album'){
        url = `/ratings/album/${songData?.spotifyAlbumId}`;
    }

    return (
        <div className="song-component-container">
            <div className="song-component rated-song-desktop">
                <p className="user-name-header">{songData.userName}</p>
                <div className="song-content-row">
                    <img className="circle stats-circle" src={songData?.imageUrl} />
                    <div className="song-info">
                        <p className="song-name">
                            <Link
                            to={url}
                            >
                                {songData?.songName || songData?.albumName}
                            </Link>
                        </p>
                        <p className="song-name">{songData?.displayName}</p>
                        <p className="artist-name">{songData?.artistName}</p>
                    </div>

                    <Rating name="half-rating" defaultValue={songData.rating} precision={0.5} readOnly/>
                </div>
            </div>
        </div>
    )
}

export default RatedSongComponentDesktop;