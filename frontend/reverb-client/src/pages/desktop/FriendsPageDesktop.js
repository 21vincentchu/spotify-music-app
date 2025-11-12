import axios from 'axios';
import { useEffect, useState } from 'react';

import FriendComponentDesktop from "../../components/desktop/FriendComponentDesktop";

function FriendsPage() {

  const [isLoadingData, setIsLoadingRecentData] = useState(true);
  const [friends, setFriends] = useState([]);
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);


  useEffect(() => {   
    getFriendsList();
    getSearchResults();
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

  const getSearchResults = async (query) => {
    // if (!query.trim()) return; // optional guard
    setIsLoadingRecentData(true);
    axios.get(`http://localhost:8000/api/friends/search?q=${query}`, {
        withCredentials: true
      })
      .then((response) => {
        console.log('Search Results:', response.data);
        setSearchResults(response.data);
      })
      .catch((error) => {
        console.error('Error fetching search results:', error);
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
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              type="text" 
              placeholder="Search username..." 
              className="search-input round-outline" 
            />
          </div>
          
          <button className="search-button round-outline" 
            onClick={() => getSearchResults(query)}>
              Search
          </button>
        </div>
      </div>
      {/* {(searchResults.result.friends).map((friend, index) => (
        <FriendComponentDesktop key={index} friend={friend} />
      ))} */}
    </div>
  );
}

export default FriendsPage;