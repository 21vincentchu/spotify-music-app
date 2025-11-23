from flask import Blueprint, request, jsonify, session
from .userFriends import *

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

    print("ADD DATA:",data)
    friendUserName = data.get('friendUserName')
   
    if not userName or not friendUserName:
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

    if not userName or not friendUserName:
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
    userName = session.get('userName')
    if not userName:
        return jsonify({'error': 'Not authenticated'}), 401

    # Check if the logged-in user has added this person as a friend
    if not is_friend(userName, friendUserName):
        return jsonify({'error': 'You must add this user as a friend to view their stats'}), 403

    timeframe = request.args.get('timeframe', 'short_term')
    song_limit = int(request.args.get('limit', 10))

    try:
        friend_profile = get_friend_recently_played(friendUserName, song_limit)

        if not friend_profile:
            return jsonify({'error': 'Friend not found'})

        # Try to get top songs/artists/albums, but don't fail if tables don't exist
        try:
            friend_songs = get_top_songs(friendUserName, timeframe, song_limit)
        except Exception as e:
            print(f"Error fetching top songs: {e}")
            friend_songs = []

        try:
            friend_albums = get_friend_top_albums(friendUserName, timeframe, song_limit)
        except Exception as e:
            print(f"Error fetching top albums: {e}")
            friend_albums = []

        try:
            friend_artists = get_friend_top_artists(friendUserName, timeframe, song_limit)
        except Exception as e:
            print(f"Error fetching top artists: {e}")
            friend_artists = []

        # Get recent songs from Spotify API
        recent_songs = get_friend_recent_songs(friendUserName, song_limit)

        friend_profile.update({
            'timeframe': timeframe,
            'topSongs': friend_songs,
            'topArtists': friend_artists,
            'topAlbums': friend_albums,
            'recentSongs': recent_songs
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
    current_user = session.get('userName')

    if not search_query or not current_user: 
        return jsonify({'error': 'Missing required query parameters(q, currentUser)'}),

    try:
        results = search_users(search_query, current_user, limit)
        return jsonify(results)
    except Exception as e:
        print(f"error searching userrs: {e}")
        return jsonify({'error': str(e)})
    

