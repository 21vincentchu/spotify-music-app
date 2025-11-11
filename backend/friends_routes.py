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

@friends_bp.route('/add', methods=['POST'])
def add_friend():
    userName = session.get('userName')
    data = request.get_json()
    friendUserName = data.get('friendUserName')
   
    if not userName or friendUserName:
        return jsonify({'error': 'Missing username or friendUserName'})
    try:
        successful_insert = insert_friend(userName, friendUserName)
        return jsonify({
            'success': successful_insert,
            'message': 'Friend added successfully' if successful_insert else 'Already friends'
        })
    except Exception as e:
        return jsonify({'error': str(e)})

@friends_bp.route('/remove', methods=['POST'])
def remove_friend():
    """
    Remove a friend for the logged-in user
    """
    userName = session.get('userName')
    data = request.get_json()
    friendUserName = data.get('friendUserName')

    if not userName or friendUserName:
        return jsonify({'error': 'Missing username or friendUserName'})
    try:
        successful_deletion = delete_friend(userName, friendUserName)
        return jsonify({
            'success': successful_deletion,
            'message': 'Friend removed successfully' if successful_deletion else 'Already friends'
        })
    except Exception as e:
        return jsonify({'error': str(e)})
        
@friends_bp.route('/count', methods=['GET'])
def friend_count():
    """
    get the total number of friends the user has
    """
    userName = session.get('userName')
    if not userName:
        return jsonify({'error': 'not authenticated'})
    
    try:
        count = get_user_friend_count(userName)
        return jsonify({'friendCount': count})
    except Exception as e:
        return jsonify({'error': str(e)})