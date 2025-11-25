import { useEffect, useState } from 'react';
import { Rating } from '@mui/material';
import axios from 'axios';
import config from '../../config';
import { useParams } from 'react-router-dom';


function RatingsDetailPageDesktop() {

    const { spotifyId } = useParams();
    const [isRated, setIsRated] = useState(null); // null = loading, true/false = result
    const [ratingData, setRatingData] = useState(null);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');

    useEffect(() => {   
        fetchData();
    }, [spotifyId]);
 
    const fetchData = async () => {
        try {
            const response = await axios.get(
                `${config.API_URL}/api/ratings/song-rating?spotifyTrackId=${spotifyId}`,
                { withCredentials: true }
            );
            console.log('Rating found:', response.data);
            setRatingData(response.data);
            setRating(response.data.rating || 0);
            setComment(response.data.comment || '');
            setIsRated(true);
        } catch (error) {
            console.error('Error fetching ratings:', error);
            if (error.response?.status === 404) {
                console.log('No rating found');
                setIsRated(false);
                await getUnratedData();
            } else {
                setIsRated(false);
            }
        }
    };

    const getUnratedData = async () => {
        axios.get(`${config.API_URL}/api/ratings/song/${spotifyId}`, {
            withCredentials: true
        })
        .then(response => { 
            console.log('Song found:', response.data);
            setRatingData(response.data);
            setRating(response.data.rating || 0);
            setComment(response.data.comment || '');
        })
        .catch (error => {
            console.error('Error fetching song data:', error);
        } )
    }

    const handleSave = async () => {

        console.log('Saving rating:', { spotifyId, rating, comment });
        try {
            const response = await axios.patch(`${config.API_URL}/api/ratings/song`, {
                spotifyTrackId: spotifyId,
                rating: rating,
                comment: comment
            }, {
                withCredentials: true
            });
            console.log('Rating saved:', response.data);
        } catch (error) {
            console.error('Error saving rating:', error);
        }
    };

  return (
    <div className='ratings-detail-page'>
        <div className='ratings-detail-container round-outline blue-box-shadow'>
            
            <div className='ratings-detail-info'>
                <img className="stats-circle" src={ratingData?.imageUrl} alt={ratingData?.songName} />
                <div>
                    <div>
                        <p className='song-name'>{ratingData?.songName}</p>
                        <p className='artist-name'>{ratingData?.artistName}</p>  
                    </div>  
                    <div className='star-rating-comp'>       
                        <Rating 
                            name="half-rating" 
                            value={rating} 
                            precision={0.5}
                            onChange={(event, newValue) => setRating(newValue)}
                        />  
                        <p>{rating}</p>  
                    </div>
                </div>
            </div>
            
            <div className='ratings-detail-actions'>
                <textarea 
                    className="round-outline" 
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                />
                <button type="submit" onClick={handleSave}>Save</button>
            </div>
        </div>
    </div>

  )

}

export default RatingsDetailPageDesktop;
