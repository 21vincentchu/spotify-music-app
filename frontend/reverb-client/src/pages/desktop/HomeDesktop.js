import axios from 'axios';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import config from '../../config';

import SongComponent from "../../components/shared/SongComponent";
import { useEffect, useState } from 'react';

function HomeDesktop() {
    const [isLoadingRecentData, setIsLoadingRecentData] = useState(true);
    const [recentData, setRecentData] = useState([]);

    useEffect(() => {   
        getRecentData();
    }, []);

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
    

  return (
    <div className="home-page">
        <div className="home-recommended round-outline blue-box-shadow">
            <h2>Recently Played Songs</h2>
            <div className="home-recommended-songs">
            {isLoadingRecentData ? (
            <LoadingSpinner message="Loading statistics..." />
            ) : (
            recentData.top_songs.map((song, index) => (
                <div>
                <SongComponent key={song.id || index} songData={song} />
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

    </div>
    )   
}

export default HomeDesktop;