import { useState } from 'react';
import axios from 'axios';
import config from '../../config';

function SongComponent({ songData, showStar, isFeatured, onToggleFeatured }) {
  const displayName =
    songData?.songName || songData?.albumName || songData?.artistName;
  const artistName = songData?.artistName;

  const [isStarred, setIsStarred] = useState(isFeatured || false);
  const [isLoading, setIsLoading] = useState(false);

  // Determine item type
  const getItemType = () => {
    if (songData.spotifyTrackId) return 'song';
    if (songData.spotifyArtistId) return 'artist';
    if (songData.spotifyAlbumId) return 'album';
    return 'song';
  };

  const itemType = getItemType();

  const handleStarToggle = async (e) => {
    e.stopPropagation();
    setIsLoading(true);

    try {
      if (isStarred) {
        // UNSTAR
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

        await axios.delete(`${config.API_URL}/api/${endpoint}/${itemId}`, {
          withCredentials: true,
        });

        setIsStarred(false);
        onToggleFeatured?.(itemId, false);
      } else {
        // STAR
        let endpoint, payload;

        if (itemType === 'song') {
          endpoint = 'featured-songs';
          payload = {
            spotifyTrackId: songData.spotifyTrackId,
            songName: songData.songName || songData.name,
            artistName: songData.artistName,
            albumName: songData.albumName,
            imageUrl: songData.imageUrl,
          };
        } else if (itemType === 'artist') {
          endpoint = 'featured-artists';
          payload = {
            spotifyArtistId: songData.spotifyArtistId,
            artistName: songData.artistName,
            imageUrl: songData.imageUrl,
          };
        } else if (itemType === 'album') {
          endpoint = 'featured-albums';
          payload = {
            spotifyAlbumId: songData.spotifyAlbumId,
            albumName: songData.albumName,
            artistName: songData.artistName,
            imageUrl: songData.imageUrl,
          };
        }

        await axios.post(`${config.API_URL}/api/${endpoint}/`, payload, {
          withCredentials: true,
        });

        setIsStarred(true);
        onToggleFeatured?.(
          songData.spotifyTrackId ||
            songData.spotifyArtistId ||
            songData.spotifyAlbumId,
          true
        );
      }
    } catch (error) {
      console.error(`Error toggling featured ${itemType}:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="song-component">
      {songData?.rank && <div className="song-rank">#{songData.rank}</div>}

      <img className="song-image" src={songData?.imageUrl} alt={displayName} />

      <div className="song-info">
        <p className="song-title">{displayName}</p>
        <p className="song-artist">{artistName}</p>
      </div>

      {showStar && (
        <button
          className={`star-button ${isStarred ? 'starred' : ''}`}
          onClick={handleStarToggle}
          disabled={isLoading}
        >
          {isStarred ? '★' : '☆'}
        </button>
      )}
    </div>
  );
}

export default SongComponent;
