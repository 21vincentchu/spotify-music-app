import { useState } from 'react';
import FriendComponentMobile from '../../components/mobile/FriendComponentMobile';

function FriendsMobilePage() {

  // dummy placeholder friends
  const [friends] = useState([
    { id: 1, name: 'Alice', username: 'alice123' },
    { id: 2, name: 'Bob', username: 'bob456' },
    { id: 3, name: 'Charlie', username: 'charlie789' },
  ]);

  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="mobile-friends">
      <div className="mobile-friends-content">

        {/* Header */}
        <h2 className="friends-header">Friends</h2>

        {/* Search Bar */}
        <div className="search-bar" style={{ marginBottom: "15px" }}>
          <div className="search-input-container">
            <input
              type="text"
              placeholder="Search username..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="search-button">Search</button>
        </div>

        {/* Friend List */}
        <div className="mobile-friend-list">
          {friends.map((friend) => (
            <FriendComponentMobile key={friend.id} friendData={friend} />
          ))}
        </div>

      </div>
    </div>
  );
}

export default FriendsMobilePage;
