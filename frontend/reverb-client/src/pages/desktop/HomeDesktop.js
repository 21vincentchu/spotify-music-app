import axios from 'axios';
import LoadingSpinner from '../../components/shared/LoadingSpinner';

import SongComponent from "../../components/shared/SongComponent";
import { useAuth } from "../../context/AuthContext";
import { useEffect, useState } from 'react';



function HomeDesktop() {
    const { userName, isAuthenticated, loading } = useAuth();
    const [isLoadingSongs, setIsLoadingSongs] = useState(true);
    const [topSongs, setTopSongs] = useState([]);

    useEffect(() => {   
        getTopSongs();      
    }, []);

    const getTopSongs = async () => {
        setIsLoadingSongs(true);
        axios.get('http://localhost:8000/api/top-songs/short_term', {
          withCredentials: true
        })
        .then((response) => {
        //   console.log('Top Songs:', response.data);
          setTopSongs(response.data);
        })
        .catch((error) => {
          console.error('Error fetching top songs:', error);
        })
        .finally(() => {
          setIsLoadingSongs(false);
        });
    }
    

  return (
    <div className="home-page">
        <div className="home-recommended round-outline blue-box-shadow">
            <h2>Recommended</h2>
            <div className="home-recommended-songs">
          
            </div>
        

        </div>
        <div className="home-stats round-outline blue-box-shadow">
            <h2>Statistics</h2>
            {isLoadingSongs ? (
            <LoadingSpinner message="Loading statistics..." />
            ) : (
            topSongs.slice(0, 3).map((song, index) => (
                <SongComponent key={song.id || index} songData={song} />
            ))
            )}
        </div>

    </div>
    )   
}

export default HomeDesktop;