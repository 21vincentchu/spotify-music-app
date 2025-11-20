function FriendComponentDesktop({friendData, onClick, isSelected}) {
    return (
        <div
            className={`friend-component ${isSelected ? 'selected' : ''}`}
            onClick={onClick}
            style={{ cursor: 'pointer' }}
        >
            <img
                className="circle"
                src={friendData?.profilePicture}
                alt={friendData?.displayName || friendData?.userName}
            />
            <div className="friend-info">
                <p className="friend-name">{friendData?.displayName || friendData?.userName}</p>
                <p className="friend-user">@{friendData?.userName}</p>
            </div>
        </div>
      )}

export default FriendComponentDesktop;
