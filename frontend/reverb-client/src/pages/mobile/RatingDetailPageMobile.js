import { useEffect, useState } from 'react';
import { Rating } from '@mui/material';
import axios from 'axios';
import config from '../../config';
import { useParams, useNavigate } from 'react-router-dom';
import ProfileButtonMobile from '../../components/mobile/ProfileButtonMobile';
import StarIcon from '../../components/mobile/StarIcon';
import '../../styles/Mobile.css';

function RatingDetailPageMobile() {
    const { type, spotifyId } = useParams();
    const [isRated, setIsRated] = useState(false);
    const [ratingData, setRatingData] = useState(null);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [friendsRatings, setFriendsRatings] = useState([]);
    const [isLoadingFriendsRatings, setIsLoadingFriendsRatings] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
        fetchFriendsRatings();
    }, [type, spotifyId]);

    const fetchData = async () => {
        setIsLoading(true);
        if (type === 'song') {
            try {
                const response = await axios.get(
                    `${config.API_URL}/api/ratings/song/${spotifyId}`,
                    { withCredentials: true }
                );
                console.log('Song found:', response.data);
                if (response.data.userRating) {
                    setIsRated(true);
                }
                setRatingData(response.data.song);
                setRating(response.data.userRating?.rating || 0);
                setComment(response.data.userRating?.comment || '');
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        } else if (type === 'album') {
            try {
                const response = await axios.get(
                    `${config.API_URL}/api/ratings/album/${spotifyId}`,
                    { withCredentials: true }
                );
                console.log('Album found:', response.data);
                if (response.data.userRating) {
                    setIsRated(true);
                }
                setRatingData(response.data.album);
                setRating(response.data.userRating?.rating || 0);
                setComment(response.data.userRating?.comment || '');
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        }
        setIsLoading(false);
    };

    const fetchFriendsRatings = async () => {
        setIsLoadingFriendsRatings(true);
        try {
            const endpoint = type === 'song'
                ? `${config.API_URL}/api/ratings/song/${spotifyId}/friends`
                : `${config.API_URL}/api/ratings/album/${spotifyId}/friends`;

            const response = await axios.get(endpoint, { withCredentials: true });
            console.log('Friends ratings:', response.data);
            setFriendsRatings(response.data || []);
        } catch (error) {
            console.error('Error fetching friends ratings:', error);
            setFriendsRatings([]);
        } finally {
            setIsLoadingFriendsRatings(false);
        }
    };

    const calculateAverageRating = () => {
        if (friendsRatings.length === 0) return 0;
        const sum = friendsRatings.reduce((acc, curr) => acc + curr.rating, 0);
        return (sum / friendsRatings.length).toFixed(1);
    };

    const handleSave = async () => {
        setIsSaving(true);
        if (isRated) {
            if (type === 'song') {
                try {
                    const response = await axios.patch(`${config.API_URL}/api/ratings/song`, {
                        spotifyTrackId: spotifyId,
                        rating: rating,
                        comment: comment
                    }, {
                        withCredentials: true
                    });
                    console.log('Song Rating saved:', response.data);
                    navigate('/ratings');
                } catch (error) {
                    console.error('Error saving rating:', error);
                }
            } else if (type === 'album') {
                try {
                    const response = await axios.patch(`${config.API_URL}/api/ratings/album`, {
                        spotifyAlbumId: spotifyId,
                        rating: rating,
                        comment: comment
                    }, {
                        withCredentials: true
                    });
                    console.log('Album Rating saved:', response.data);
                    navigate('/ratings');
                } catch (error) {
                    console.error('Error saving rating:', error);
                }
            }
        } else {
            if (type === 'song') {
                try {
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
                    navigate('/ratings');
                } catch (error) {
                    console.error('Error saving rating:', error);
                }
            } else if (type === 'album') {
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
                    navigate('/ratings');
                } catch (error) {
                    console.error('Error saving rating:', error);
                }
            }
        }
        setIsSaving(false);
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this rating?')) {
            return;
        }

        if (type === 'song') {
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
        } else if (type === 'album') {
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
    };

    if (isLoading) {
        return (
            <div className="mobile-layout">
                <ProfileButtonMobile />
                <div className="mobile-content">
                    <p className="loading-text">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="mobile-layout">
            <ProfileButtonMobile />
            <div className="mobile-content">
                <div className="rating-detail-page-mobile">

                    {/* Back Button */}
                    <button className="back-button-mobile" onClick={() => navigate('/ratings')}>
                        ← Back
                    </button>

                    {/* Album Art & Info */}
                    <div className="rating-detail-header-mobile">
                        <img
                            src={ratingData?.imageUrl}
                            alt={type === 'song' ? ratingData?.songName : ratingData?.albumName}
                            className="rating-detail-image-mobile"
                        />
                        <div className="rating-detail-text-mobile">
                            <h2 className="rating-detail-title-mobile">
                                {type === 'song' ? ratingData?.songName : ratingData?.albumName}
                            </h2>
                            <p className="rating-detail-artist-mobile">{ratingData?.artistName}</p>
                        </div>
                    </div>

                    {/* Rating Stars */}
                    <div className="rating-detail-rating-mobile">
                        <p className="rating-label-mobile">Your Rating</p>
                        <div className="star-rating-component-mobile">
                            <Rating
                                name="mobile-rating"
                                value={rating}
                                precision={0.5}
                                size="large"
                                onChange={(event, newValue) => setRating(newValue)}
                            />
                            <p className="rating-number-mobile">{rating}</p>
                        </div>
                    </div>

                    {/* Review/Comment */}
                    <div className="rating-detail-comment-mobile">
                        <label className="rating-label-mobile">Your Review</label>
                        <textarea
                            className="rating-textarea-mobile"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Share your thoughts about this song..."
                            rows={6}
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="rating-detail-actions-mobile">
                        <button
                            className="save-button-mobile"
                            onClick={handleSave}
                            disabled={isSaving}
                        >
                            {isSaving ? 'Saving...' : 'Save'}
                        </button>
                        {isRated && (
                            <button
                                className="delete-button-mobile"
                                onClick={handleDelete}
                            >
                                Delete
                            </button>
                        )}
                    </div>

                    {/* Friends Ratings Section */}
                    {friendsRatings.length > 0 && (
                        <div className="friends-ratings-section-mobile">
                            <div className="friends-ratings-header-mobile">
                                <h3>Friends' Ratings</h3>
                                <div className="average-rating-mobile">
                                    <span className="average-label">Average: </span>
                                    <div className="average-stars">
                                        {Array(5).fill(0).map((_, i) => (
                                            <StarIcon
                                                key={i}
                                                filled={i < Math.round(parseFloat(calculateAverageRating()))}
                                                size={16}
                                            />
                                        ))}
                                    </div>
                                    <span className="average-number">{calculateAverageRating()}</span>
                                    <span className="ratings-count">({friendsRatings.length})</span>
                                </div>
                            </div>

                            <div className="friends-ratings-list-mobile">
                                {isLoadingFriendsRatings ? (
                                    <p className="loading-text">Loading friends' ratings...</p>
                                ) : (
                                    friendsRatings.map((friendRating, index) => (
                                        <div key={index} className="friend-rating-item-mobile">
                                            <div className="friend-rating-header-mobile">
                                                <img
                                                    src={friendRating.profilePicture}
                                                    alt={friendRating.displayName}
                                                    className="friend-rating-avatar-mobile"
                                                />
                                                <div className="friend-rating-user-mobile">
                                                    <p className="friend-name-mobile">{friendRating.displayName}</p>
                                                    <div className="friend-rating-stars-mobile">
                                                        {Array(5).fill(0).map((_, i) => (
                                                            <StarIcon
                                                                key={i}
                                                                filled={i < friendRating.rating}
                                                                size={14}
                                                            />
                                                        ))}
                                                        <span className="friend-rating-number-mobile">{friendRating.rating}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            {friendRating.comment && friendRating.comment.trim() !== "" && (
                                                <p className="friend-rating-comment-mobile">{friendRating.comment}</p>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default RatingDetailPageMobile;
