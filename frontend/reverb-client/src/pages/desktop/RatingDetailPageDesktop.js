import { useEffect, useState } from 'react';
import { Rating } from '@mui/material';
import axios from 'axios';
import config from '../../config';
import { useParams } from 'react-router-dom';
import { useNavigate } from "react-router-dom";

function RatingsDetailPageDesktop() {

    const { type, spotifyId } = useParams();
    const [isRated, setIsRated] = useState(false); // null = loading, true/false = result
    const [ratingData, setRatingData] = useState(null);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const navigate = useNavigate();


    useEffect(() => {   
        fetchData();
    }, []);
 
    const fetchData = async () => {
        if(type == 'song'){
            try {
                const response = await axios.get(
                    `${config.API_URL}/api/ratings/song/${spotifyId}`,
                    { withCredentials: true }
                );
                console.log('Song found:', response.data);
                if(response.data.userRating){
                    setIsRated(true);
                }
                setRatingData(response.data.song);
                setRating(response.data.userRating.rating || 0);
                setComment(response.data.userRating.comment || '');
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        }else if(type == 'album'){
            try {
                const response = await axios.get(
                    `${config.API_URL}/api/ratings/album/${spotifyId}`,
                    { withCredentials: true }
                );
                console.log('Album found:', response.data);
                if(response.data.userRating){
                    setIsRated(true);
                }
                setRatingData(response.data.album);
                setRating(response.data.userRating.rating || 0);
                setComment(response.data.userRating.comment || '');
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        }
        
    };

    const handleSave = async () => {

        if(isRated){
            if(type == 'song'){
                console.log('Saving song rating:', { spotifyId, rating, comment });
                try {
                    const response = await axios.patch(`${config.API_URL}/api/ratings/song`, {
                        spotifyTrackId: spotifyId,
                        rating: rating,
                        comment: comment
                    }, {
                        withCredentials: true
                    });
                    console.log('Song Rating saved:', response.data);
                    // redirect('/ratings');
                } catch (error) {
                    console.error('Error saving rating:', error);
                }
            }else if(type == 'album'){
                console.log('Saving album rating:', { spotifyId, rating, comment });
                try {
                    const response = await axios.patch(`${config.API_URL}/api/ratings/album`, {
                        spotifyAlbumId: spotifyId,
                        rating: rating,
                        comment: comment
                    }, {
                        withCredentials: true
                    });
                    console.log('Album Rating saved:', response.data);
                } catch (error) {
                    console.error('Error saving rating:', error);
                }
            }
        }else{
            if(type == 'song'){
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
                    console.log('Song Rating Created:', response.data);
                    // redirect('/ratings');
                } catch (error) {
                    console.error('Error saving rating:', error);
                }
            }else if(type == 'album'){
                try {
                    const response = await axios.post(`${config.API_URL}/api/ratings/album`, {
                        spotifyAlbumId: spotifyId,
                        albumName: ratingData.albumName,
                        artistName: ratingData.artistName,
                        rating: rating,
                        imageUrl: ratingData.imageUrl,
                        comment: comment
                    }, {
                        withCredentials: true
                    });
                    console.log('Album Rating Created:', response.data);
                } catch (error) {
                    console.error('Error saving rating:', error);
                }
            }
        }
    };

    const handleDelete = async () => { 
        if(type == 'song'){
            try {
                const response = await axios.delete(
                    `${config.API_URL}/api/ratings/song/${spotifyId}`,
                    { withCredentials: true }
                );
                console.log('Song deleted:', response.data);
                navigate('/ratings');

            } catch (error) {
                console.error('Error deleting data:', error);
            }
        }else if(type == 'album'){
            try {
                const response = await axios.delete(
                    `${config.API_URL}/api/ratings/album/${spotifyId}`,
                    { withCredentials: true }
                );
                console.log('Album deleted:', response.data);
                navigate('/ratings');

            } catch (error) {
                console.error('Error deleting data:', error);
            }
        }
        
    }

    return (
        <div className='ratings-detail-page'>
            <div className='ratings-detail-container round-outline blue-box-shadow'>
                
                <div className='ratings-detail-info'>
                    <img className="round-outline" src={ratingData?.imageUrl} alt={ratingData?.songName} />
                    <div>
                        <div>
                            <p className='song-name'>{type == 'song'? (ratingData?.songName):(ratingData?.albumName)}</p>
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
                    <div className=''>
                        <button type="submit" onClick={handleDelete}>Delete</button>
                        <button type="submit" onClick={handleSave}>Save</button>
                    </div>
                
                </div>
            </div>
        </div>

        )
    }

export default RatingsDetailPageDesktop;
