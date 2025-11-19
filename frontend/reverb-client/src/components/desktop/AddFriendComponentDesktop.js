import { useEffect } from "react";

import axios from 'axios';
import config from '../../config';



function FriendComponentDesktop({friendData}) {

    useEffect(() => {
        console.log("Friend Data:", friendData);
    },[friendData]);

    function handleAddFriend() {
        console.log(`Sending friend request to ${friendData.userName}`);

        axios.post(`${config.API_URL}/api/friends/add`,{
            friendUserName: friendData.userName
        },{
            withCredentials: true
        })
        .then((response) => {
            console.log('Friend request sent:', response.data);
        })
        .catch((error) => {
            console.error('Error sending friend request:', error);
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
                {friendData?.isFriend == 0 && (
                    <div>
                        <button onClick={handleAddFriend}>Add</button>
                    </div>
                )}
                
            </div>
        </div>
      )}

export default FriendComponentDesktop;
