import { useState } from 'react';
import axios from 'axios';
import config from '../../config';

function SongComponent({songData, showStar, isFeatured, onToggleFeatured}) {
    // Handle both songs (songName) and albums (albumName)
    const displayName = songData?.songName || songData?.albumName || songData?.artistName;
    const artistName = songData?.artistName;
    const [isStarred, setIsStarred] = useState(isFeatured || false);
    const [isLoading, setIsLoading] = useState(false);

    const handleStarToggle = async (e) => {
        e.stopPropagation();
        setIsLoading(true);
        try {
            if (isStarred) {
                // Unstar the song
                await axios.delete(
                    `${config.API_URL}/api/featured-songs/${songData.spotifyTrackId}`,
                    { withCredentials: true }
                );
                setIsStarred(false);
                if (onToggleFeatured) {
                    onToggleFeatured(songData.spotifyTrackId, false);
                }
            } else {
                // Star the song
                await axios.post(
                    `${config.API_URL}/api/featured-songs/`,
                    {
                        spotifyTrackId: songData.spotifyTrackId,
                        songName: songData.songName || songData.name,
                        artistName: songData.artistName || songData.artist,
                        albumName: songData.albumName || songData.album,
                        imageUrl: songData.imageUrl || songData.image
                    },
                    { withCredentials: true }
                );
                setIsStarred(true);
                if (onToggleFeatured) {
                    onToggleFeatured(songData.spotifyTrackId, true);
                }
            }
        } catch (error) {
            console.error('Error toggling featured song:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="song-component">
            <div className="song-rank">#{songData?.rank}</div>
            <img className="circle" src={songData?.imageUrl}></img>
            <div className="song-info">
                <p className="song-name">{displayName}</p>
                <p className="artist-name">{artistName}</p>
            </div>
            {showStar && (
                <button
                    className={`star-button ${isStarred ? 'starred' : ''}`}
                    onClick={handleStarToggle}
                    disabled={isLoading}
                    title={isStarred ? 'Remove from featured' : 'Add to featured'}
                >
                    {isStarred ? '★' : '☆'}
                </button>
            )}
        </div>
      )}

export default SongComponent;
