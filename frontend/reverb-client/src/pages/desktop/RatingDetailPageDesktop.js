import { useParams } from 'react-router-dom';
import axios from 'axios';
import config from '../../config';
import { useEffect, useState } from 'react';
import { Rating } from '@mui/material';

function RatingDetailPageDesktop() {
    const { spotifyId } = useParams();
    const [isRated, setIsRated] = useState(null); // null = loading, true/false = result
    const [ratingData, setRatingData] = useState(null);

    useEffect(() => {
        checkIfRated();  
    }, [spotifyId]);

    const checkIfRated = async () => {
        try {
            const response = await axios.get(`${config.API_URL}/api/ratings/song-rating?spotifyTrackId=${spotifyId}`, {
                withCredentials: true
            });
            console.log('Rating found:', response.data);
            setRatingData(response.data);
            setIsRated(true);
        } catch (error) {
            console.error('Error fetching ratings:', error);
            if (error.response?.status === 404) {
                console.log('No rating found');
                setIsRated(false);
            } else {
                setIsRated(false);
            }
        }
    };

    const handleSave = async () =>{
        axios.post(`${config.API_URL}/api/ratings/song`, {
            spotifyTrackId: spotifyId,
            songName: ratingData?.songName,
            artistName: ratingData?.artistName,
            rating: ratingData?.rating,
            comment: ratingData?.comment
        }, {
            withCredentials: true
        })
        .then((response) => {
            console.log('Rating saved:', response.data);
        })
        .catch((error) => {
            console.error('Error saving rating:', error);
        });
    }

    // Show loading state while checking
    if (isRated === null) {
        return <div className='page'><p>Loading...</p></div>;
    }

    return (
        <div className='ratings-detail-page'>
            {isRated ? (
                    <div className='ratings-detail-container round-outline blue-box-shadow'>
                        
                        <div className='ratings-detail-info'>
                            <img className="stats-circle" src={ratingData?.imageUrl} />
                            <div>
                                <div>
                                    <p className='song-name'>{ratingData?.songName}</p>
                                    <p className='artist-name'>{ratingData?.artistName}</p>  
                                </div>  
                                <div className='star-rating-comp'>       
                                    <Rating name="half-rating" defaultValue={ratingData?.rating} precision={0.5}/>  
                                    <p>{ratingData?.rating} </p>  
                                </div>
                            </div>
                        </div>
                        
                        <div className='ratings-detail-actions'>
                            <textarea className="round-outline" defaultValue={ratingData?.comment}></textarea>
                            <button type="submit">Save</button>
                        </div>
                    </div>
            ) : (
                <div className='ratings-detail-container round-outline blue-box-shadow'>
                    
                    <div className='ratings-detail-info'>
                        <img className="stats-circle" src={ratingData?.imageUrl} />
                        <div>
                            <div>
                                <p className='song-name'>{ratingData?.songName}</p>
                                <p className='artist-name'>{ratingData?.artistName}</p>  
                            </div>  
                            <div className='star-rating-comp'>       
                                <Rating name="half-rating" defaultValue={ratingData?.rating} precision={0.5}/>  
                                <p>{ratingData?.rating} </p>  
                            </div>
                        </div>
                    </div>
                    
                    <div className='ratings-detail-actions'>
                        <textarea className="round-outline" defaultValue={ratingData?.comment}></textarea>
                        <button type="submit">Save</button>
                    </div>
                </div>
            )}
        </div>
    );  
}

export default RatingDetailPageDesktop;