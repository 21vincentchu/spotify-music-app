
import { Rating } from '@mui/material';
import { Link } from 'react-router-dom';

function RatedSongComponentDesktop({songData}){
    return (
        <div className="song-component">
            <img className="circle stats-circle" src={songData?.imageUrl} />
            <div className="song-info">
                <p className="song-name">
                    <Link 
                    to={`/ratings/${songData?.spotifyTrackId}`}
                    >
                        {songData?.songName}
                    </Link>
                </p>
                <p className="song-name">{songData?.displayName}</p>
                <p className="artist-name">{songData?.artistName}</p>
            </div>

            <Rating name="half-rating" defaultValue={songData.rating} precision={0.5} readOnly/>    
        </div>
    )
}

export default RatedSongComponentDesktop;