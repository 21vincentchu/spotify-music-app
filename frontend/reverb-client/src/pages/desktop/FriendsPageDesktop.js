import axios from 'axios';
import { useEffect, useState } from 'react';

import FriendComponentDesktop from "../../components/desktop/FriendComponentDesktop";

function FriendsPage() {

  const [isLoadingData, setIsLoadingRecentData] = useState(true);
  const [friends, setFriends] = useState([]);

  useEffect(() => {   
    getFriendsList();
}, []);


  const getFriendsList = async () => {
    setIsLoadingRecentData(true);
    axios.get('http://localhost:8000/api/friends', {
        withCredentials: true
      })
      .then((response) => {
        console.log('Friends:', response.data);
        setFriends(response.data);
      })
      .catch((error) => {
        console.error('Error fetching recent data:', error);
      })
      .finally(() => {
        setIsLoadingRecentData(false);
      });
}




  return (
    <div className="page">
      <div className="data-container round-outline blue-box-shadow">
        <h2>Friends</h2>
        <div className="data-container-list">
          <FriendComponentDesktop />
          <FriendComponentDesktop />
          <FriendComponentDesktop />
          <FriendComponentDesktop />
          <FriendComponentDesktop />
          <FriendComponentDesktop />
          <FriendComponentDesktop />

        </div>
      </div>
      <div className="data-container round-outline blue-box-shadow">
        <div className="search-bar">
          <div className="search-input-container round-outline">
            <input 
            type="text" 
            placeholder="Search username..." 
            className="search-input round-outline" 
            />
          </div>
          
          <button className="search-button round-outline">Search</button>
        </div>
      </div>
    </div>
  );
}

export default FriendsPage;