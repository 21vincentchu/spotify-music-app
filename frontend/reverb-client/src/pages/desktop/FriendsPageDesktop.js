import axios from 'axios';
import { useEffect, useState } from 'react';
import config from '../../config';

import FriendComponentDesktop from "../../components/desktop/FriendComponentDesktop";

function FriendsPage() {

  const [isLoadingData, setIsLoadingRecentData] = useState(true);
  const [friends, setFriends] = useState([]);
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);


  useEffect(() => {
    getFriendsList();
  }, []);

  useEffect(() => {
    if (query.trim() === "") {
      setSearchResults([]);   // clear results when field is empty
      return;
    }
  
    const delayDebounce = setTimeout(() => {
      getSearchResults(query);
    }, 300); // <— debounce so you don't spam the API
  
    return () => clearTimeout(delayDebounce);
  }, [query]);
  


  const getFriendsList = async () => {
    setIsLoadingRecentData(true);
    axios.get(`${config.API_URL}/api/friends`, {
        withCredentials: true
      })
      .then((response) => {
        console.log('Friends:', response.data);
        setFriends(response.data.friends || []);
      })
      .catch((error) => {
        console.error('Error fetching friends:', error);
      })
      .finally(() => {
        setIsLoadingRecentData(false);
      });
  }

  const getSearchResults = async (query) => {
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
          {isLoadingData ? (
            <p>Loading friends...</p>
          ) : friends.length > 0 ? (
            friends.map((friend, index) => (
              <FriendComponentDesktop key={friend.userName || index} friendData={friend} />
            ))
          ) : (
            <p>No friends yet. Add some friends!</p>
          )}
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
      {searchResults ? (
        <div>

        </div>
      ):(
        <div>
          <p>No search results.</p>
        </div>
      )}
    </div>
  );
}

export default FriendsPage;