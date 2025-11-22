
// import { Rating } from '@mui/material';

function RatedSongComponentDesktop({songData,rating=3.5}){
    return (
        <div>
            <div className="song-component">
                <img className="circle stats-circle" src={songData?.imageUrl} />
                <div className="song-info">
                    <p className="song-name">{songData?.displayName}</p>
                    <p className="artist-name">{songData?.artistName}</p>
                </div>

                {/* <Rating name="half-rating" defaultValue={rating} precision={0.5} readOnly/>     */}
            </div>

        </div>
    )
}

export default RatedSongComponentDesktop;