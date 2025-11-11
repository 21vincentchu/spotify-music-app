from flask import Blueprint, request, jsonify, session
from userFriends import (insert_friend,
    delete_friend,
    get_friend,
    get_user_friend_count,
    get_top_songs,
    get_friend_top_artists,
    get_friend_top_albums,
    get_friend_recently_played,
    search_users
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
    
@friends_bp.route('/<friendUserName>/stats', methods=['GET'])
def friend_stats(friendUserName):
    """
    Gets a friend's stats including top songs, artists, albums as well as recently played
    params include timeframe and limit
    """

    timeframe = request.args.get('timeframe', 'short_term')
    song_limit = int(request.args.get('limit', 10))

    try:
        friend_profile = get_friend_recently_played(friendUserName, song_limit)

        if not friend_profile:
            return jsonify({'error': 'Friend not found'})
        
        friend_songs = get_top_songs(friendUserName, timeframe, song_limit)
        friend_albums = get_friend_top_albums(friendUserName, timeframe, song_limit)
        friend_artists = get_friend_top_artists(friendUserName, timeframe, song_limit)

        friend_profile.update({
            'timeframe': timeframe,
            'topSongs': friend_songs,
            'topArtists': friend_artists,
            'topAlbums': friend_albums
        })

        return jsonify(friend_profile)
    
    except Exception as e:
        print(f"Error fetching friend profile: {e}")
        return jsonify({'error': str(e)})
    
@friends_bp.route('/search', methods=['GET'])
def search_for_users():
    """
    search for users by username or display name
    Query Params:
    limit
    """

    search_query = request.args.get('q', '').strip()
    current_user = request.args.get('currentUser', '').strip()
    limit = int(request.args.get('limit', 20))

    if not search_query or not current_user: 
        return jsonify({'error': 'Missing required query parameters(q, currentUser)'}),

    try:
        results = search_users(search_query, current_user, limit)
        return jsonify(results)
    except Exception as e:
        print(f"error searching userrs: {e}")
        return jsonify({'error': str(e)})
    

