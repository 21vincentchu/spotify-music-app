import { useState } from 'react';
import axios from 'axios';
import config from '../../config';

function SongComponent({songData, showStar, isFeatured, onToggleFeatured, showRank = true, showPlay = false}) {
    // Handle both songs (songName) and albums (albumName)
    const displayName = songData?.songName || songData?.albumName || songData?.artistName;
    const artistName = songData?.artistName;
    const [isStarred, setIsStarred] = useState(isFeatured || false);
    const [isLoading, setIsLoading] = useState(false);

    // Determine item type based on available IDs
    const getItemType = () => {
        if (songData.spotifyTrackId) return 'song';
        if (songData.spotifyArtistId) return 'artist';
        if (songData.spotifyAlbumId) return 'album';
        return 'song'; // default
    };

    const itemType = getItemType();

    // Get Spotify URL for opening in Spotify
    const getSpotifyUrl = () => {
        if (songData?.spotifyUrl) return songData.spotifyUrl;

        // Construct URL from ID based on type
        if (itemType === 'song' && songData?.spotifyTrackId) {
            return `https://open.spotify.com/track/${songData.spotifyTrackId}`;
        } else if (itemType === 'artist' && songData?.spotifyArtistId) {
            return `https://open.spotify.com/artist/${songData.spotifyArtistId}`;
        } else if (itemType === 'album' && songData?.spotifyAlbumId) {
            return `https://open.spotify.com/album/${songData.spotifyAlbumId}`;
        }
        return null;
    };

    const handleStarToggle = async (e) => {
        e.stopPropagation();
        setIsLoading(true);
        try {
            if (isStarred) {
                // Unstar the item based on type
                let endpoint, itemId;
                if (itemType === 'song') {
                    endpoint = 'featured-songs';
                    itemId = songData.spotifyTrackId;
                } else if (itemType === 'artist') {
                    endpoint = 'featured-artists';
                    itemId = songData.spotifyArtistId;
                } else if (itemType === 'album') {
                    endpoint = 'featured-albums';
                    itemId = songData.spotifyAlbumId;
                }

                await axios.delete(
                    `${config.API_URL}/api/${endpoint}/${itemId}`,
                    { withCredentials: true }
                );
                setIsStarred(false);
                if (onToggleFeatured) {
                    onToggleFeatured(itemId, false);
                }
            } else {
                // Star the item based on type
                let endpoint, payload;
                if (itemType === 'song') {
                    endpoint = 'featured-songs';
                    payload = {
                        spotifyTrackId: songData.spotifyTrackId,
                        songName: songData.songName || songData.name,
                        artistName: songData.artistName || songData.artist,
                        albumName: songData.albumName || songData.album,
                        imageUrl: songData.imageUrl || songData.image
                    };
                } else if (itemType === 'artist') {
                    endpoint = 'featured-artists';
                    payload = {
                        spotifyArtistId: songData.spotifyArtistId,
                        artistName: songData.artistName,
                        imageUrl: songData.imageUrl
                    };
                } else if (itemType === 'album') {
                    endpoint = 'featured-albums';
                    payload = {
                        spotifyAlbumId: songData.spotifyAlbumId,
                        albumName: songData.albumName,
                        artistName: songData.artistName,
                        imageUrl: songData.imageUrl
                    };
                }

                await axios.post(
                    `${config.API_URL}/api/${endpoint}/`,
                    payload,
                    { withCredentials: true }
                );
                setIsStarred(true);
                if (onToggleFeatured) {
                    onToggleFeatured(songData.spotifyTrackId || songData.spotifyArtistId || songData.spotifyAlbumId, true);
                }
            }
        } catch (error) {
            console.error(`Error toggling featured ${itemType}:`, error);
        } finally {
            setIsLoading(false);
        }
    };

    const spotifyUrl = getSpotifyUrl();

    return (
        <div className="song-component">
            {showRank && <div className="song-rank">#{songData?.rank}</div>}
            <img className="circle stats-circle" src={songData?.imageUrl} />
            <div className="song-info">
                <p className="song-name">{displayName}</p>
                <p className="artist-name">{artistName}</p>
            </div>
            {showPlay && spotifyUrl && (
                <a
                    href={spotifyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="play-button"
                    title="Open in Spotify"
                >
                    ▶
                </a>
            )}
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
