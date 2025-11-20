import { useEffect, useState } from "react";

import axios from 'axios';
import config from '../../config';



function FriendComponentDesktop({friendData, onFriendAdded}) {

    const [isAdded, setIsAdded] = useState(false);

    useEffect(() => {
        console.log("Friend Data:", friendData);
        // Reset isAdded when friendData changes (e.g., search results refresh)
        setIsAdded(friendData?.isFriend !== 0);
    },[friendData]);

    function handleAddFriend() {
        console.log(`Sending friend request to ${friendData.userName}`);
        setIsAdded(true);

        axios.post(`${config.API_URL}/api/friends/add`,{
            friendUserName: friendData.userName
        },{
            withCredentials: true
        })
        .then((response) => {
            console.log('Friend request sent:', response.data);
            // Refresh the friends list after successfully adding a friend
            if (response.data.success && onFriendAdded) {
                onFriendAdded();
            }
        })
        .catch((error) => {
            console.error('Error sending friend request:', error);
            setIsAdded(false); // Reset on error
        });
    }
    if (!friendData) return null;

    return (
        <div className="friend-component">
            <img
                className="circle"
                src={friendData?.profilePicture}
                alt={friendData?.displayName || friendData?.userName}
            />
            <div className="friend-info">
                <p className="friend-name">{friendData?.displayName || friendData?.userName}</p>
                <p className="friend-user">@{friendData?.userName}</p>
            </div>
            <div>
                {!isAdded ? (
                    <button onClick={handleAddFriend}>Add</button>
                ) : (
                    <button disabled className="added-btn">Added!</button>
                )}
            </div>
        </div>
      )}

export default FriendComponentDesktop;
