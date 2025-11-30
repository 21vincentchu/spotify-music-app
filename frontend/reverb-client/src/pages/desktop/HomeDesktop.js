import axios from 'axios';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import config from '../../config';

import SongComponent from "../../components/shared/SongComponent";
import Footer from "../../components/shared/Footer";
import StatsDashboard from "../../components/shared/StatsDashboard";
import { useEffect, useState } from 'react';

function HomeDesktop() {
    const [isLoadingRecentData, setIsLoadingRecentData] = useState(true);
    const [recentData, setRecentData] = useState([]);
    const [featuredSongs, setFeaturedSongs] = useState([]);
    const [featuredArtists, setFeaturedArtists] = useState([]);
    const [featuredAlbums, setFeaturedAlbums] = useState([]);

    useEffect(() => {
        getRecentData();
        getFeaturedSongs();
        getFeaturedArtists();
        getFeaturedAlbums();
    }, []);

    // Disable body scroll on home page
    useEffect(() => {
        document.body.style.overflow = 'hidden';

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    const getFeaturedSongs = async () => {
        try {
            const response = await axios.get(`${config.API_URL}/api/featured-songs/`, {
                withCredentials: true
            });
            setFeaturedSongs(response.data);
        } catch (error) {
            console.error('Error fetching featured songs:', error);
        }
    };

    const getFeaturedArtists = async () => {
        try {
            const response = await axios.get(`${config.API_URL}/api/featured-artists/`, {
                withCredentials: true
            });
            setFeaturedArtists(response.data);
        } catch (error) {
            console.error('Error fetching featured artists:', error);
        }
    };

    const getFeaturedAlbums = async () => {
        try {
            const response = await axios.get(`${config.API_URL}/api/featured-albums/`, {
                withCredentials: true
            });
            setFeaturedAlbums(response.data);
        } catch (error) {
            console.error('Error fetching featured albums:', error);
        }
    };

    const getRecentData = async () => {
        setIsLoadingRecentData(true);
        axios.get(`${config.API_URL}/api/recently-played`, {
            withCredentials: true
          })
          .then((response) => {
            console.log('Recent Songs:', response.data);
            setRecentData(response.data);
          })
          .catch((error) => {
            console.error('Error fetching recent data:', error);
          })
          .finally(() => {
            setIsLoadingRecentData(false);
          });
    }

    const isSongFeatured = (spotifyTrackId) => {
        return featuredSongs.some(song => song.spotifyTrackId === spotifyTrackId);
    };

    const isArtistFeatured = (spotifyArtistId) => {
        return featuredArtists.some(artist => artist.spotifyArtistId === spotifyArtistId);
    };

    const isAlbumFeatured = (spotifyAlbumId) => {
        return featuredAlbums.some(album => album.spotifyAlbumId === spotifyAlbumId);
    };

    const getIsFeatured = (item) => {
        if (item.spotifyTrackId) return isSongFeatured(item.spotifyTrackId);
        if (item.spotifyArtistId) return isArtistFeatured(item.spotifyArtistId);
        if (item.spotifyAlbumId) return isAlbumFeatured(item.spotifyAlbumId);
        return false;
    };

    const getRelativeTime = (playedAt) => {
        const now = new Date();
        const played = new Date(playedAt);
        const diffInMs = now - played;
        const diffInMinutes = Math.floor(diffInMs / 60000);
        const diffInHours = Math.floor(diffInMs / 3600000);
        const diffInDays = Math.floor(diffInMs / 86400000);

        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
        if (diffInHours < 24) return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
        return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
    };


  return (
    <div className="home-page page">
        <div className="home-recommended round-outline blue-box-shadow">
            <h2>Recently Played Songs</h2>
            <div className="home-recommended-songs">
            {isLoadingRecentData ? (
            <LoadingSpinner message="Loading statistics..." />
            ) : (
            recentData.recent_tracks.map((item, index) => {
                const track = item.track;
                const songData = {
                    songName: track.name,
                    artistName: track.artists?.[0]?.name || 'Unknown Artist',
                    spotifyTrackId: track.id,
                    imageUrl: track.album?.images?.[0]?.url,
                    playedAt: item.played_at,
                    rank: index + 1
                };
                return (
                    <div key={`${track.id}-${index}`} className="fade-in-item">
                        <SongComponent
                            songData={songData}
                            showStar={true}
                            isFeatured={getIsFeatured(songData)}
                            timestamp={getRelativeTime(item.played_at)}
                        />
                    </div>
                );
            })
            )}
            </div>
        </div>
        <div className="home-stats round-outline blue-box-shadow">
            <h2>Recent Statistics</h2>

        {isLoadingRecentData ? (
            <LoadingSpinner message="Loading statistics..." />
            ) : (
              <>
                <div className='home-stats-section'>
                    <div className='stat-box'>
                        <h3>Average Track Length</h3>
                        <p className='stat-value'>{recentData.listening_stats?.avg_track_length_minutes || 0} min</p>
                    </div>
                    <div className='stat-box'>
                        <h3>Total Minutes</h3>
                        <p className='stat-value'>{Math.round(recentData.listening_stats?.total_minutes || 0)} min</p>
                    </div>
                </div>
                <div className='genre-section'>
                    <h3>Top Genres</h3>
                    <ol className='genre-list'>
                        {recentData.genre_stats?.top_genres?.map((item, index) => (
                            <li key={index} className="fade-in-item">
                                <span className='genre-name'>{item.genre}</span>
                                <span className='genre-count'>{item.count} song{item.count !== 1 ? 's' : ''}</span>
                            </li>
                        )) || <li>No genres found</li>}
                    </ol>
                </div>
                <StatsDashboard recentTracks={recentData.recent_tracks} />
              </>
            )}
          </div>

        <Footer />
    </div>
    )
}

export default HomeDesktop;