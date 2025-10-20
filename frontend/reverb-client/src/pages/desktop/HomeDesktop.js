import axios from 'axios';

import SongComponent from "../../components/shared/SongComponent";
import { useAuth } from "../../context/AuthContext";
import { useEffect, useState } from 'react';



function HomeDesktop() {
    const { userName, isAuthenticated, loading } = useAuth();

    const [topSongs, setTopSongs] = useState([]);

    useEffect(() => {   
        getTopSongs();      
    }, []);

    const getTopSongs = async () => { 
        axios.get('http://localhost:8000/api/top-songs/short_term',{
            withCredentials: true
        })
        .then((response) => {
            console.log('Top Songs:', response.data);
            setTopSongs(response.data);
        })
        .catch((error) => {
            console.error('Error fetching top songs:', error);
        }); 
    }

  return (
    <div className="home-page">
        <div className="home-recommended round-outline">
            <p>{userName}</p>
            <h2>Recommended</h2>
            <div className="home-recommended-songs">
                <SongComponent />
                <SongComponent />
                <SongComponent />
                <SongComponent />
                <SongComponent />
                <SongComponent />
                <SongComponent />
                <SongComponent />
            </div>
        

        </div>
        <div className="home-stats round-outline">
            <h2>Statistics</h2>
            {topSongs.slice(0, 3).map((song) => (
            <div key={song.songId} className="song-item">
                <span className="rank">#{song.rank}</span>
                <div className="song-info">
                <h3>{song.songName}</h3>
                <p>{song.artistName}</p>
                </div>
            </div>
            ))}
            

        </div>

    </div>
    )   
}

export default HomeDesktop;