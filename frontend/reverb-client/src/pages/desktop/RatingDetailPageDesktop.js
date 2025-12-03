import { useEffect, useState } from 'react';
import { Rating } from '@mui/material';
import axios from 'axios';
import config from '../../config';
import { useParams } from 'react-router-dom';
import { useNavigate } from "react-router-dom";

function RatingsDetailPageDesktop() {

    const { type, spotifyId } = useParams();
    const [isRated, setIsRated] = useState(false);
    const [ratingData, setRatingData] = useState(null);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [originalRating, setOriginalRating] = useState(0);
    const [originalComment, setOriginalComment] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [justSaved, setJustSaved] = useState(false);
    const [friendsRatings, setFriendsRatings] = useState([]);
    const [isLoadingFriendsRatings, setIsLoadingFriendsRatings] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const navigate = useNavigate();

    // Check if there are unsaved changes
    const hasChanges = rating !== originalRating || comment !== originalComment;


    useEffect(() => {
        fetchData();
        fetchFriendsRatings();
    }, [type, spotifyId]);
 
    const fetchData = async () => {
        setIsLoadingData(true);
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
                const userRating = response.data.userRating?.rating || 0;
                const userComment = response.data.userRating?.comment || '';
                setRating(userRating);
                setComment(userComment);
                setOriginalRating(userRating);
                setOriginalComment(userComment);
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
                const userRating = response.data.userRating?.rating || 0;
                const userComment = response.data.userRating?.comment || '';
                setRating(userRating);
                setComment(userComment);
                setOriginalRating(userRating);
                setOriginalComment(userComment);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        }
        setIsLoadingData(false);
    };

    const fetchFriendsRatings = async () => {
        setIsLoadingFriendsRatings(true);
        try {
            const endpoint = type === 'song'
                ? `${config.API_URL}/api/ratings/song/${spotifyId}/all`
                : `${config.API_URL}/api/ratings/album/${spotifyId}/all`;

            const response = await axios.get(endpoint, { withCredentials: true });
            console.log('All users ratings:', response.data);
            const ratings = Array.isArray(response.data) ? response.data : [];
            setFriendsRatings(ratings);
        } catch (error) {
            console.error('Error fetching all users ratings:', error);
            setFriendsRatings([]);
        } finally {
            setIsLoadingFriendsRatings(false);
        }
    };

    const calculateAverageRating = () => {
        if (!Array.isArray(friendsRatings) || friendsRatings.length === 0) return 0;
        const sum = friendsRatings.reduce((acc, curr) => {
            const rating = parseFloat(curr.rating);
            return acc + (isNaN(rating) ? 0 : rating);
        }, 0);
        return (sum / friendsRatings.length).toFixed(1);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            if(isRated){
                if(type == 'song'){
                    await axios.patch(`${config.API_URL}/api/ratings/song`, {
                        spotifyTrackId: spotifyId,
                        rating: rating,
                        comment: comment
                    }, {
                        withCredentials: true
                    });
                }else if(type == 'album'){
                    await axios.patch(`${config.API_URL}/api/ratings/album`, {
                        spotifyAlbumId: spotifyId,
                        rating: rating,
                        comment: comment
                    }, {
                        withCredentials: true
                    });
                }
            }else{
                if(type == 'song'){
                    await axios.post(`${config.API_URL}/api/ratings/song`, {
                        spotifyTrackId: spotifyId,
                        songName: ratingData.songName,
                        artistName: ratingData.artistName,
                        rating: rating,
                        imageUrl: ratingData.imageUrl,
                        comment: comment
                    }, {
                        withCredentials: true
                    });
                }else if(type == 'album'){
                    await axios.post(`${config.API_URL}/api/ratings/album`, {
                        spotifyAlbumId: spotifyId,
                        albumName: ratingData.albumName,
                        artistName: ratingData.artistName,
                        rating: rating,
                        imageUrl: ratingData.imageUrl,
                        comment: comment
                    }, {
                        withCredentials: true
                    });
                }
                setIsRated(true);
            }

            // Update the original values to match current
            setOriginalRating(rating);
            setOriginalComment(comment);

            // Show "Saved!" message
            setJustSaved(true);
            setTimeout(() => {
                setJustSaved(false);
            }, 2000);

            // Refresh the reviews list
            fetchFriendsRatings();
        } catch (error) {
            console.error('Error saving rating:', error);
        } finally {
            setIsSaving(false);
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
        <div className='ratings-detail-page page'>
            {isLoadingData ? (
                <div className='ratings-detail-container round-outline blue-box-shadow'>
                    <p className="loading-text" style={{ textAlign: 'center', padding: '40px' }}>Loading...</p>
                </div>
            ) : (
            <div className='ratings-detail-container round-outline blue-box-shadow fade-in-item'>
                {/* Header with Back and Delete */}
                <div className="rating-detail-header-nav-desktop">
                    <button className="back-button-desktop" onClick={() => navigate(-1)}>
                        ← Back
                    </button>
                    {isRated && !hasChanges && (
                        <button className="delete-button-header-desktop fade-in-item" onClick={handleDelete}>
                            Delete Review
                        </button>
                    )}
                </div>

                <div className='ratings-detail-info'>
                    <div className="album-art-section">
                        <img
                            className="round-outline"
                            src={ratingData?.imageUrl}
                            alt={ratingData?.songName}
                            loading="eager"
                            decoding="async"
                        />
                        <a
                            href={`https://open.spotify.com/${type === 'song' ? 'track' : 'album'}/${spotifyId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="spotify-button-desktop"
                        >
                            <svg viewBox="0 0 24 24" className="spotify-icon" fill="currentColor">
                                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                            </svg>
                            Open on Spotify
                        </a>
                    </div>
                    <div>
                        <div>
                            <p className='song-name'>{type == 'song'? (ratingData?.songName):(ratingData?.albumName)}</p>
                            <p className='artist-name'>{ratingData?.artistName}</p>
                        </div>
                        <p className="rating-label-desktop">Your Rating</p>
                        <div className='star-rating-comp'>
                            <Rating
                                name="half-rating"
                                value={rating}
                                precision={0.5}
                                onChange={(_, newValue) => setRating(newValue)}
                            />
                            <p>{rating}</p>
                        </div>
                    </div>
                </div>

                <div className='ratings-detail-actions'>
                    <label className="rating-label-desktop">Your Review</label>
                    <textarea
                        className="round-outline"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Share your thoughts..."
                    />

                    {/* Action Buttons - Only show when there are changes */}
                    {hasChanges && (
                        <div className='rating-detail-actions-inline-desktop'>
                            <button
                                className='save-button-desktop'
                                onClick={handleSave}
                                disabled={isSaving}
                            >
                                {isSaving ? 'Saving...' : 'Save Changes'}
                            </button>
                            <button
                                className='cancel-button-desktop'
                                onClick={() => {
                                    setRating(originalRating);
                                    setComment(originalComment);
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    )}

                    {/* Saved Message */}
                    {justSaved && !hasChanges && (
                        <div className="saved-message-desktop">
                            ✓ Saved!
                        </div>
                    )}
                </div>
            </div>
            )}

            {/* Reviews Section */}
            {!isLoadingData && (() => {
                const ratingsWithReviews = friendsRatings.filter(r => r.comment && r.comment.trim() !== "");
                const reviewCount = ratingsWithReviews.length;
                const averageRating = calculateAverageRating();

                return reviewCount > 0 ? (
                    <div className="friends-ratings-section-desktop">
                        <div className="friends-ratings-header-desktop">
                            <h3>Reviews ({reviewCount})</h3>
                            <div className="average-rating-desktop">
                                <span className="average-label">Average from {friendsRatings.length} {friendsRatings.length === 1 ? 'user' : 'users'}: </span>
                                <Rating
                                    value={parseFloat(averageRating)}
                                    precision={0.1}
                                    readOnly
                                    sx={{
                                        '& .MuiRating-iconFilled': {
                                            color: '#ffa726'
                                        }
                                    }}
                                />
                                <span className="average-number">{averageRating}</span>
                            </div>
                        </div>

                        <div className="friends-ratings-list-desktop">
                            {isLoadingFriendsRatings ? (
                                <p className="loading-text">Loading reviews...</p>
                            ) : (
                                ratingsWithReviews.map((userRating, index) => (
                                    <div key={index} className="friend-rating-item-desktop fade-in-item">
                                        <div className="friend-rating-header-desktop">
                                            <img
                                                src={userRating.profilePicture || '/default-avatar.png'}
                                                alt={userRating.displayName}
                                                className="friend-rating-avatar-desktop"
                                            />
                                            <div className="friend-rating-user-desktop">
                                                <p className="friend-name-desktop">{userRating.displayName || userRating.userName}</p>
                                                <div className="friend-rating-stars-desktop">
                                                    <Rating
                                                        value={userRating.rating}
                                                        precision={0.5}
                                                        size="small"
                                                        readOnly
                                                    />
                                                    <span className="friend-rating-number-desktop">{userRating.rating}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <p className="friend-rating-comment-desktop">{userRating.comment}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                ) : null;
            })()}
        </div>

        )
    }

export default RatingsDetailPageDesktop;
