import { useParams } from 'react-router-dom';
import axios from 'axios';
import config from '../../config';
import { useEffect, useState } from 'react';

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

    // Show loading state while checking
    if (isRated === null) {
        return <div className='page'><p>Loading...</p></div>;
    }

    return (
        <div className='ratings-detail-page'>
            {isRated ? (
                <div>
                    {/* <p>Displaying detailed rating information for the item with Spotify ID: {spotifyId}</p> */}
                    <div className='round-outline blue-box-shadow'>
                        <form>
                            <h3>Edit Your Rating</h3>
                            <label>
                                Rating (1-5):
                                <input type="number" min="1" max="5" defaultValue={ratingData?.rating} />
                            </label>
                            <br />
                            <label>
                                Comment:
                                <textarea defaultValue={ratingData?.comment}></textarea>
                            </label>
                            <br />
                            <button type="submit">Update Rating</button>
                        </form>
                    </div>
                </div>
            ) : (
                <div>
                    <p>You have not rated {spotifyId} yet. Please submit your rating!</p>
                </div>
            )}
        </div>
    );  
}

export default RatingDetailPageDesktop;