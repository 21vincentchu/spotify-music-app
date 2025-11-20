function FriendComponentDesktop({friendData, onClick, isSelected, onRemoveFriend}) {

    const handleRemoveClick = (e) => {
        e.stopPropagation(); // Prevent triggering the onClick for viewing stats
        if (onRemoveFriend) {
            onRemoveFriend(friendData.userName);
        }
    };

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
            <button
                className="remove-friend-btn"
                onClick={handleRemoveClick}
                title="Remove friend"
            >
                Remove
            </button>
        </div>
      )}

export default FriendComponentDesktop;
