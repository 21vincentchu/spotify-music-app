import axios from 'axios';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import config from '../../config';

import SongComponent from "../../components/shared/SongComponent";
import Footer from "../../components/shared/Footer";
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
    

  return (
    <div className="home-page">
        <div className="home-recommended round-outline blue-box-shadow">
            <h2>Recently Played Songs</h2>
            <div className="home-recommended-songs">
            {isLoadingRecentData ? (
            <LoadingSpinner message="Loading statistics..." />
            ) : (
            recentData.top_songs.slice(0, 50).map((song, index) => (
                <div key={song.id || index}>
                    <SongComponent
                        songData={song}
                        showStar={true}
                        isFeatured={getIsFeatured(song)}
                    />
                </div>
            ))
            )}
            </div>
        </div>
        <div className="home-stats round-outline blue-box-shadow">
            <h2>Recent Statistics</h2>

        {isLoadingRecentData ? (
            <LoadingSpinner message="Loading statistics..." />
            ) : (
                <div className='home-stats-section'>
                    <div>
                        <h3>Average Track Length: </h3>
                        <p>{recentData.listening_stats.avg_track_length_minutes} minutes</p>
                    </div>
                    <div>
                        <h3>Total Hours: </h3>
                        <p>{Math.round(recentData.listening_stats.total_hours)}</p>
                    </div>
                    <div>
                        <h3>Total Minutes: </h3>
                        <p>{Math.round(recentData.listening_stats.total_minutes)}</p>
                    </div>
                    <div>
                        <h3>Total Plays: </h3>
                        <p>{recentData.listening_stats.total_plays}</p>
                    </div>
              </div>
            )}
          
          </div>
        <Footer />
    </div>
    )
}

export default HomeDesktop;