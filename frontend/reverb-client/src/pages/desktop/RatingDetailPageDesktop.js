import { useEffect, useState } from 'react';
import { Rating } from '@mui/material';
import axios from 'axios';
import config from '../../config';
import { redirect, useParams } from 'react-router-dom';
import { useLocation } from 'react-router-dom';



function RatingsDetailPageDesktop() {

    const { spotifyId } = useParams();
    const [isRated, setIsRated] = useState(false); // null = loading, true/false = result
    const [ratingData, setRatingData] = useState(null);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    
    useEffect(() => {   
        fetchData();
        fetchRating();
    }, [spotifyId]);
 
    const fetchData = async () => {
        try {
            const response = await axios.get(
                `${config.API_URL}/api/ratings/song/${spotifyId}`,
                { withCredentials: true }
            );
            console.log('Rating found:', response.data);
            setRatingData(response.data.song);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
        
    };

    const fetchRating = async () => {
        axios.get(`${config.API_URL}/api/ratings/rated-song/${spotifyId}`, {
            withCredentials: true
        })
        .then(response => { 
            console.log('Rating found:', response.data);
            setRating(response.data.rating || 0);
            setComment(response.data.comment || '');
            setIsRated(true);
        })
        .catch (error => {
            console.error('No rating found', error);
        } )
    }

    const handleSave = async () => {

        if(isRated){
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
                // redirect('/ratings');
            } catch (error) {
                console.error('Error saving rating:', error);
            }
        }else{
            try {
                console.log("POST payload:", {
                    spotifyTrackId: spotifyId,
                    songName: ratingData?.songName,
                    artistName: ratingData?.artistName,
                    rating,
                    imageUrl: ratingData?.imageUrl,
                    comment
                });
                const response = await axios.post(`${config.API_URL}/api/ratings/song`, {
                    spotifyTrackId: spotifyId,
                    songName: ratingData.songName,
                    artistName: ratingData.artistName,
                    rating: rating,
                    imageUrl: ratingData.imageUrl,
                    comment: comment
                }, {
                    withCredentials: true
                });
                console.log('Rating Created:', response.data);
                // redirect('/ratings');
            } catch (error) {
                console.error('Error saving rating:', error);
            }
        }
    };

  return (
    <div className='ratings-detail-page'>
        <div className='ratings-detail-container round-outline blue-box-shadow'>
            
            <div className='ratings-detail-info'>
                <img className="round-outline" src={ratingData?.imageUrl} alt={ratingData?.songName} />
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
