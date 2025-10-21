import axios from 'axios';
import LoadingSpinner from '../../components/shared/LoadingSpinner';

import SongComponent from "../../components/shared/SongComponent";
import { useAuth } from "../../context/AuthContext";
import { useEffect, useState } from 'react';



function HomeDesktop() {
    const { userName, isAuthenticated, loading } = useAuth();
    const [isLoadingTopSongs, setIsLoadingTopSongs] = useState(true);
    const [isLoadingRecentSongs, setIsLoadingRecentSongs] = useState(true);
    const [topSongs, setTopSongs] = useState([]);
    const [recentSongs, setRecentSongs] = useState([]);

    useEffect(() => {   
        getTopSongs();      
        getRecentSongs();
    }, []);

    const getTopSongs = async () => {
        setIsLoadingTopSongs(true);
        axios.get('http://localhost:8000/api/top-songs/short_term', {
          withCredentials: true
        })
        .then((response) => {
          console.log('Top Songs:', response.data);
          setTopSongs(response.data);
        })
        .catch((error) => {
          console.error('Error fetching top songs:', error);
        })
        .finally(() => {
          setIsLoadingTopSongs(false);
        });
    }

    const getRecentSongs = async () => {
        setIsLoadingRecentSongs(true);
        axios.get('http://localhost:8000/api/recently-played', {
            withCredentials: true
          })
          .then((response) => {
            console.log('Recent Songs:', response.data);
            setRecentSongs(response.data.top_songs);
          })
          .catch((error) => {
            console.error('Error fetching recent songs:', error);
          })
          .finally(() => {
            setIsLoadingRecentSongs(false);
          });
    }
    

  return (
    <div className="home-page">
        <div className="home-recommended round-outline blue-box-shadow">
            <h2>Recently Played Songs</h2>
            <div className="home-recommended-songs">
            {isLoadingRecentSongs ? (
            <LoadingSpinner message="Loading statistics..." />
            ) : (
            recentSongs.map((song, index) => (
                <div>
                <SongComponent key={song.id || index} songData={song} />
                </div>
            ))
            )}
            </div>
        </div>
        <div className="home-stats round-outline blue-box-shadow">
            <h2>Statistics</h2>
            {isLoadingTopSongs ? (
            <LoadingSpinner message="Loading statistics..." />
            ) : (
            topSongs.slice(0, 3).map((song, index) => (
                <div>
                {/* <p>{song.rank}</p> */}
                <SongComponent key={song.id || index} songData={song} />
                </div>
            ))
            )}
        </div>

    </div>
    )   
}

export default HomeDesktop;