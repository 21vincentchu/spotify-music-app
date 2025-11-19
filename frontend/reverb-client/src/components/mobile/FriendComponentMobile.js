function FriendComponentMobile({ friendData }) {
    return (
      <div className="friend-component">
        <img className="circle" src={friendData.avatar || ''} alt={friendData.name} />
        <div className="friend-info">
          <p className="friend-name">{friendData.name}</p>
          <p className="friend-user">{friendData.username}</p>
        </div>
      </div>
    );
  }
  
  export default FriendComponentMobile;
  