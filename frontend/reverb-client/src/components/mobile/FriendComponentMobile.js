function FriendComponentMobile({ friendData, onClick, onRemove }) {
  const handleRemoveClick = (e) => {
    e.stopPropagation();
    if (onRemove) {
      onRemove(friendData.userName);
    }
  };

  return (
    <div
      className="friend-component-mobile"
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <img
        className="friend-circle-mobile"
        src={friendData?.profilePicture || ''}
        alt={friendData?.displayName || friendData?.userName}
      />
      <div className="friend-info-mobile">
        <p className="friend-name-mobile">{friendData?.displayName || friendData?.userName}</p>
        <p className="friend-username-mobile">@{friendData?.userName}</p>
      </div>
      {onRemove && (
        <button
          className="remove-friend-btn-mobile"
          onClick={handleRemoveClick}
          title="Remove friend"
        >
          Remove
        </button>
      )}
    </div>
  );
}

export default FriendComponentMobile;
  