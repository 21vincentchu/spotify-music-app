
import { Rating } from '@mui/material';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import axios from 'axios';
import config from '../../config';

function RatedSongComponentDesktop({songData, type, showTypeBadge = false, onRatingUpdated}){

    const [isEditing, setIsEditing] = useState(false);
    const [currentRating, setCurrentRating] = useState(songData.rating);
    const [originalRating, setOriginalRating] = useState(songData.rating);
    const [isSaving, setIsSaving] = useState(false);

    let url = '';
    if(type === 'song'){
        url = `/ratings/song/${songData?.spotifyTrackId}`;
    }else if(type === 'album'){
        url = `/ratings/album/${songData?.spotifyAlbumId}`;
    }

    const hasChanges = currentRating !== originalRating;

    const handleRatingChange = (_, newValue) => {
        setCurrentRating(newValue);
        if (!isEditing) {
            setIsEditing(true);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsSaving(true);

        try {
            if (type === 'song') {
                await axios.patch(`${config.API_URL}/api/ratings/song`, {
                    spotifyTrackId: songData.spotifyTrackId,
                    rating: currentRating,
                    comment: songData.comment || ''
                }, {
                    withCredentials: true
                });
            } else if (type === 'album') {
                await axios.patch(`${config.API_URL}/api/ratings/album`, {
                    spotifyAlbumId: songData.spotifyAlbumId,
                    rating: currentRating,
                    comment: songData.comment || ''
                }, {
                    withCredentials: true
                });
            }

            setOriginalRating(currentRating);
            setIsEditing(false);

            if (onRatingUpdated) {
                onRatingUpdated();
            }
        } catch (error) {
            console.error('Error saving rating:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setCurrentRating(originalRating);
        setIsEditing(false);
    };

    const content = (
        <div className="song-component rated-song-desktop">
            <div className="user-name-header-row">
                <p className="user-name-header">{songData.displayName}</p>
                <div className="header-row-right">
                    {showTypeBadge && (
                        <span className={`rating-type-badge ${type === "song" ? "song-badge" : "album-badge"}`}>
                            {type === "song" ? "Song" : "Album"}
                        </span>
                    )}
                    {!isEditing && (
                        <span className="more-details-hint">More details →</span>
                    )}
                </div>
            </div>
            <div className="song-content-row">
                <img className="circle stats-circle" src={songData?.imageUrl} />
                <div className="song-info">
                    <p className="song-name">
                        {songData?.songName || songData?.albumName}
                    </p>
                    <p className="artist-name">{songData?.artistName}</p>
                </div>

                <div className="rating-edit-container">
                    <div className="rating-stars-wrapper" onClick={(e) => e.stopPropagation()}>
                        <Rating
                            name="half-rating"
                            value={currentRating}
                            precision={0.5}
                            readOnly={false}
                            onChange={handleRatingChange}
                        />
                        <span className="rating-number">{currentRating}</span>
                    </div>
                    {hasChanges && isEditing && (
                        <div className="rating-edit-actions">
                            <button
                                className="save-rating-btn"
                                onClick={handleSave}
                                disabled={isSaving}
                            >
                                {isSaving ? '...' : '✓'}
                            </button>
                            <button
                                className="cancel-rating-btn"
                                onClick={handleCancel}
                            >
                                ✕
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <div className="song-component-container">
            {isEditing ? (
                <div className="song-component-link no-link">
                    {content}
                </div>
            ) : (
                <Link to={url} className="song-component-link">
                    {content}
                </Link>
            )}
        </div>
    )
}

export default RatedSongComponentDesktop;