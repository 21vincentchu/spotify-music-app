from flask import Blueprint, request, jsonify, session
from userFriends import (insert_friend,
    delete_friend,
    get_friend,
    get_user_friend_count,
    get_top_songs,
    get_friend_top_artists,
    get_friend_top_albums
)

friends_bp = Blueprint('friends_bp', __name__, url_prefix='/api/friends')

@friends_bp.route('/', methods=['GET'])
def list_friends():
    """
    gets a list of friends for the logged-in user
    """
    userName = session.get('userName')
    if not userName:
        return jsonify({'error': 'Not Authenticated'})
    try:
        friends = get_friend(userName)
        return jsonify({'friends': friends})
    except Exception as e:
        return jsonify({'error': str(e)})
