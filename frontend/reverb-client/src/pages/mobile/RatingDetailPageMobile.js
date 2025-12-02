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
    const [originalRating, setOriginalRating] = useState(0);
    const [originalComment, setOriginalComment] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [justSaved, setJustSaved] = useState(false);
    const [friendsRatings, setFriendsRatings] = useState([]);
    const [isLoadingFriendsRatings, setIsLoadingFriendsRatings] = useState(false);
    const navigate = useNavigate();

    // Check if there are unsaved changes
    const hasChanges = rating !== originalRating || comment !== originalComment;

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
                const userRating = response.data.userRating?.rating || 0;
                const userComment = response.data.userRating?.comment || '';
                setRating(userRating);
                setComment(userComment);
                setOriginalRating(userRating);
                setOriginalComment(userComment);
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
        setIsLoading(false);
    };

    const fetchFriendsRatings = async () => {
        setIsLoadingFriendsRatings(true);
        try {
            const endpoint = type === 'song'
                ? `${config.API_URL}/api/ratings/song/${spotifyId}/all`
                : `${config.API_URL}/api/ratings/album/${spotifyId}/all`;

            const response = await axios.get(endpoint, { withCredentials: true });
            console.log('All users ratings:', response.data);
            // Ensure we always set an array
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
        // Safety check: ensure friendsRatings is an array and not empty
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
            if (isRated) {
                // Update existing rating
                if (type === 'song') {
                    await axios.patch(`${config.API_URL}/api/ratings/song`, {
                        spotifyTrackId: spotifyId,
                        rating: rating,
                        comment: comment
                    }, {
                        withCredentials: true
                    });
                } else if (type === 'album') {
                    await axios.patch(`${config.API_URL}/api/ratings/album`, {
                        spotifyAlbumId: spotifyId,
                        rating: rating,
                        comment: comment
                    }, {
                        withCredentials: true
                    });
                }
            } else {
                // Create new rating
                if (type === 'song') {
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
                } else if (type === 'album') {
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

            // Update the original values to match current (so hasChanges becomes false)
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

    // Calculate average rating once
    const averageRating = calculateAverageRating();

    // Filter to only show ratings with reviews (comments)
    const ratingsWithReviews = friendsRatings.filter(r => r.comment && r.comment.trim() !== "");
    const reviewCount = ratingsWithReviews.length;

    return (
        <div className="mobile-layout">
            <ProfileButtonMobile />
            <div className="mobile-content">
                <div className="rating-detail-page-mobile">

                    {/* Header with Back and Delete */}
                    <div className="rating-detail-header-nav">
                        <button className="back-button-mobile" onClick={() => navigate(-1)}>
                            ← Back
                        </button>
                        {isRated && !hasChanges && (
                            <button className="delete-button-header" onClick={handleDelete}>
                                Delete
                            </button>
                        )}
                    </div>

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

                    {/* Action Buttons - Only show when there are changes */}
                    {hasChanges && (
                        <div className="rating-detail-actions-inline">
                            <button
                                className="save-button-inline"
                                onClick={handleSave}
                                disabled={isSaving}
                            >
                                {isSaving ? 'Saving...' : 'Save Changes'}
                            </button>
                            <button
                                className="cancel-button-inline"
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
                        <div className="saved-message-mobile">
                            ✓ Saved!
                        </div>
                    )}

                    {/* Reviews Section */}
                    {reviewCount > 0 && (
                        <div className="friends-ratings-section-mobile">
                            <div className="friends-ratings-header-mobile">
                                <h3>Reviews ({reviewCount})</h3>
                                <div className="average-rating-mobile">
                                    <span className="average-label">Average from {friendsRatings.length} {friendsRatings.length === 1 ? 'user' : 'users'}: </span>
                                    <div className="average-stars">
                                        <Rating
                                            value={parseFloat(averageRating)}
                                            precision={0.1}
                                            size="large"
                                            readOnly
                                            sx={{
                                                '& .MuiRating-iconFilled': {
                                                    color: '#ffa726'
                                                },
                                                '& .MuiRating-iconHover': {
                                                    color: '#ffa726'
                                                }
                                            }}
                                        />
                                    </div>
                                    <span className="average-number">{averageRating}</span>
                                </div>
                            </div>

                            <div className="friends-ratings-list-mobile">
                                {isLoadingFriendsRatings ? (
                                    <p className="loading-text">Loading reviews...</p>
                                ) : (
                                    ratingsWithReviews.map((userRating, index) => (
                                        <div key={index} className="friend-rating-item-mobile">
                                            <div className="friend-rating-header-mobile">
                                                <img
                                                    src={userRating.profilePicture || '/default-avatar.png'}
                                                    alt={userRating.displayName}
                                                    className="friend-rating-avatar-mobile"
                                                />
                                                <div className="friend-rating-user-mobile">
                                                    <p className="friend-name-mobile">{userRating.displayName || userRating.userName}</p>
                                                    <div className="friend-rating-stars-mobile">
                                                        {Array(5).fill(0).map((_, i) => (
                                                            <StarIcon
                                                                key={i}
                                                                filled={i < userRating.rating}
                                                                size={14}
                                                            />
                                                        ))}
                                                        <span className="friend-rating-number-mobile">{userRating.rating}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <p className="friend-rating-comment-mobile">{userRating.comment}</p>
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
