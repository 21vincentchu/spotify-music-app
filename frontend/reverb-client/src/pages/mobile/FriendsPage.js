import { useState } from 'react';
import FriendComponentMobile from '../../components/mobile/FriendComponentMobile';

function FriendsMobilePage() {

  // dummy placeholder friends
  const [friends] = useState([
    { id: 1, name: 'Alice', username: 'alice123' },
    { id: 2, name: 'Bob', username: 'bob456' },
    { id: 3, name: 'Charlie', username: 'charlie789' },
  ]);

  return (
    <div className="mobile-friends">
      <div className="mobile-friends-content">

        {/* HERE → Add header before the list */}
        <h2 className="friends-header">Friends</h2>

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
