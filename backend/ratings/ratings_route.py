from flask import Blueprint, request, jsonify, session
from .ratings_reviews import *
from auth import get_authenticated_spotify_client

ratings_bp = Blueprint('ratings_bp', __name__, url_prefix='/api/ratings')

def fetch_song_from_spotify(sp, spotifyTrackId):
    """
    Fetch song data from Spotify API.

    Args:
        sp: Authenticated Spotify client
        spotifyTrackId: Spotify track ID

    Returns:
        Dictionary with song data
    """
    track_data = sp.track(spotifyTrackId)

    artists = track_data.get('artists', [])
    album = track_data.get('album', {})
    images = album.get('images', [])

    return {
        'spotifyTrackId': spotifyTrackId,
        'songName': track_data.get('name'),
        'artistName': artists[0]['name'] if artists else 'Unknown Artist',
        'albumName': album.get('name'),
        'imageUrl': images[0]['url'] if images else None
    }

def fetch_album_from_spotify(sp, spotifyAlbumId):
    """
    Fetch album data from Spotify API.

    Args:
        sp: Authenticated Spotify client
        spotifyAlbumId: Spotify album ID

    Returns:
        Dictionary with album data
    """
    album_data = sp.album(spotifyAlbumId)

    artists = album_data.get('artists', [])
    images = album_data.get('images', [])

    return {
        'spotifyAlbumId': spotifyAlbumId,
        'albumName': album_data.get('name'),
        'artistName': artists[0]['name'] if artists else 'Unknown Artist',
        'imageUrl': images[0]['url'] if images else None
    }

def fetch_artist_from_spotify(sp, spotifyArtistId):
    """
    Fetch artist data from Spotify API.

    Args:
        sp: Authenticated Spotify client
        spotifyArtistId: Spotify artist ID

    Returns:
        Dictionary with artist data
    """
    artist_data = sp.artist(spotifyArtistId)

    images = artist_data.get('images', [])

    return {
        'spotifyArtistId': spotifyArtistId,
        'artistName': artist_data.get('name'),
        'imageUrl': images[0]['url'] if images else None
    }

@ratings_bp.route('/song', methods=['POST'])
def rate_song():
    """
    create song rating and review 
    """
    userName = session.get('userName')
    if not userName:
        return jsonify({'error': 'Not Authenticated'})
    
    data = request.get_json()

    try:
        rating = float(data['rating'])
        unique_id = create_song_rating(
            userName = userName,
            spotifyTrackId=data['spotifyTrackId'],
            songName=data['songName'],
            artistName=data['artistName'],
            rating=rating,
            imageUrl = data.get("imageUrl"),
            comment=data.get('comment')
        )
        return jsonify({
            'success': True,
            'message': 'Song rating submitted successfully!',
            'uniqueID': unique_id
        })
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': str(e)})
    
@ratings_bp.route('/album', methods=['POST'])
def rate_album():
    """
    create album rating and review
    """
    userName = session.get('userName')
    if not userName:
        return jsonify({'error': 'Not Authenticated'})
    data = request.get_json()
    try:
        rating = float(float(data['rating']))
        unique_id = create_album_rating(
            userName=userName,
            spotifyAlbumId=data['spotifyAlbumId'],
            albumName=data['albumName'],
            artistName=data['artistName'],
            rating=rating,
            comment=data.get('comment'),
            imageUrl =data.get("imageUrl")
        )
        return jsonify({
            'success': True,
            'message': 'Album rating submitted successfully!',
            'uniqueID': unique_id
        })
    except ValueError as e:
        return jsonify({'error': str(e)})
    except Exception as e:
        return jsonify({'error': str(e)})

    
@ratings_bp.route('/song/<spotify_track_id>', methods=['DELETE'])
def delete_song_rating_route(spotify_track_id):
    """
    delete song rating and review 
    """
    userName = session.get('userName')
    if not userName:
        return jsonify({'error': 'Not Authenticated'})
    try:
        success = delete_song_rating(userName, spotify_track_id)
        if success:
            return jsonify({
                'success': True,
                'message': 'Song rating deleted successfully!'
            })
        else:
            return jsonify({'error': 'Rating not found'})
        
    except Exception as e:
        return jsonify({'error': str(e)})

@ratings_bp.route('/album/<spotify_album_id>', methods=['DELETE'])
def delete_album_rating_route(spotify_album_id):
    """
    delete album rating and review 
    """
    userName = session.get('userName')
    if not userName:
        return jsonify({'error': 'Not Authenticated'})
    try:
        success = delete_album_rating(userName, spotify_album_id)
        if success:
            return jsonify({
                'success': True,
                'message': 'Album rating deleted successfully!'
            })
        else:
            return jsonify({'error': 'Rating not found'})
        
    except Exception as e:
        return jsonify({'error': str(e)}) 

@ratings_bp.route("/song-rating", methods=["GET"])
def get_song_route():
    userName = session.get('userName')
    spotifyTrackId = request.args.get("spotifyTrackId")
    if not userName or not spotifyTrackId:
        return jsonify({"error": "Missing username or track ID"})

    rating = get_song_rating(userName, spotifyTrackId)
    
    if rating:
        return jsonify(rating)

    return jsonify({"message": "rating not found"}), 404
    
@ratings_bp.route("/album-rating", methods=["GET"])
def get_album_route():
    userName = request.args.get("userName")
    spotifyAlbumId = request.args.get("spotifyAlbumId")
    if not userName or not spotifyAlbumId:
        return jsonify({"error": "Missing username or album ID"})

    rating = get_album_rating(userName, spotifyAlbumId)
    if rating:
        return jsonify(rating)
    return jsonify({"message": "rating not found"}), 404

@ratings_bp.route("/song", methods=["PATCH"])
def update_song_rating_route():
    userName = session.get('userName')
    data = request.get_json()  # Get data from request body
    
    spotifyTrackId = data.get("spotifyTrackId")
    rating = data.get("rating")
    comment = data.get("comment")

    if not userName or not spotifyTrackId:
        return jsonify({"error": "Missing required fields"}), 400
    
    updated = update_song_rating(userName=userName, spotifyTrackId=spotifyTrackId, rating=rating, comment=comment)

    if not updated:
        return jsonify({"error": "Rating not found or no changes made"}), 404
    
    return jsonify({"message": "Song rating updated successfully"}), 200

@ratings_bp.route("/album", methods=["PATCH"])
def update_album_rating_route():
    userName = session.get('userName')
    if not userName:
        return jsonify({'error': 'Not Authenticated'}), 401

    data = request.get_json()  # Get data from request body

    spotifyAlbumId = data.get("spotifyAlbumId")
    rating = data.get("rating")
    comment = data.get("comment")
    imageUrl = data.get("imageUrl")

    if not spotifyAlbumId:
        return jsonify({"error": "Missing required fields"}), 400

    updated = update_album_rating(userName=userName, spotifyAlbumId=spotifyAlbumId, rating=rating, comment=comment, imageUrl=imageUrl)

    if not updated:
        return jsonify({"error": "Rating not found or no changes made"}), 404
    
    return jsonify({"message": "Song rating updated successfully"}), 200

@ratings_bp.route('/song/<spotifyTrackId>', methods=['GET'])
def fetch_song(spotifyTrackId):
    userName = session.get('userName')
    if not userName:
        return jsonify({'error': 'Not Authenticated'}), 401

    # Try to get song from database first
    song = get_song_by_spotify_id(spotifyTrackId)

    # If not in database, fetch from Spotify
    if not song:
        sp, token_info = get_authenticated_spotify_client()
        if not sp:
            return jsonify({"error": "Spotify authentication required"}), 401

        try:
            song = fetch_song_from_spotify(sp, spotifyTrackId)
        except Exception as e:
            return jsonify({"error": f"Error fetching from Spotify: {str(e)}"}), 500

    # Get user's existing rating if they have one
    user_rating = get_song_rating(userName, spotifyTrackId)

    return jsonify({
        "song": song,
        "userRating": user_rating
    }), 200


@ratings_bp.route('/album/<spotifyAlbumId>', methods=['GET'])
def fetch_album(spotifyAlbumId):
    userName = session.get('userName')
    if not userName:
        return jsonify({'error': 'Not Authenticated'}), 401

    # Try to get album from database first
    album = get_album_by_spotify_id(spotifyAlbumId)

    # If not in database, fetch from Spotify
    if not album:
        sp, token_info = get_authenticated_spotify_client()
        if not sp:
            return jsonify({"error": "Spotify authentication required"}), 401

        try:
            album = fetch_album_from_spotify(sp, spotifyAlbumId)
        except Exception as e:
            return jsonify({"error": f"Error fetching from Spotify: {str(e)}"}), 500

    # Get user's existing rating if they have one
    user_rating = get_album_rating(userName, spotifyAlbumId)

    return jsonify({
        "album": album,
        "userRating": user_rating
    }), 200

@ratings_bp.route('/all-songs', methods=['GET'])
def fetch_all_songs():
    userName = session.get('userName')

    if not userName:
        return jsonify({'error': 'Not Authenticated'}), 401

    songs = get_all_song_ratings_for_user(userName)

    if not songs:
        return jsonify({"message": "No songs found"}), 404

    return jsonify(songs), 200

@ratings_bp.route('/all-albums', methods=['GET'])
def fetch_all_albums():
    userName = session.get('userName')

    if not userName:
        return jsonify({'error': 'Not Authenticated'}), 401

    albums = get_all_album_ratings_for_user(userName)

    if not albums:
        return jsonify({"message": "No albums found"}), 404

    return jsonify(albums), 200

@ratings_bp.route('/friends', methods=['GET'])
def fetch_friends_ratings():
    """
    Get all ratings (songs and albums) from the user's friends.
    Returns a combined feed sorted by most recent.
    """
    userName = session.get('userName')

    if not userName:
        return jsonify({'error': 'Not Authenticated'}), 401

    try:
        friends_ratings = get_friends_ratings(userName)

        if not friends_ratings:
            return jsonify([]), 200

        return jsonify(friends_ratings), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@ratings_bp.route('/song/<spotifyTrackId>/friends', methods=['GET'])
def fetch_friends_song_ratings(spotifyTrackId):
    """
    Get all friends' ratings for a specific song.
    """
    userName = session.get('userName')

    if not userName:
        return jsonify({'error': 'Not Authenticated'}), 401

    try:
        friends_ratings = get_friends_song_ratings(userName, spotifyTrackId)
        return jsonify(friends_ratings if friends_ratings else []), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@ratings_bp.route('/album/<spotifyAlbumId>/friends', methods=['GET'])
def fetch_friends_album_ratings(spotifyAlbumId):
    """
    Get all friends' ratings for a specific album.
    """
    userName = session.get('userName')

    if not userName:
        return jsonify({'error': 'Not Authenticated'}), 401

    try:
        friends_ratings = get_friends_album_ratings(userName, spotifyAlbumId)
        return jsonify(friends_ratings if friends_ratings else []), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@ratings_bp.route('/song/<spotifyTrackId>/all', methods=['GET'])
def fetch_all_users_song_ratings(spotifyTrackId):
    """
    Get ALL users' ratings for a specific song (public/global).
    """
    try:
        all_ratings = get_all_users_song_ratings(spotifyTrackId)
        return jsonify(all_ratings if all_ratings else []), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@ratings_bp.route('/album/<spotifyAlbumId>/all', methods=['GET'])
def fetch_all_users_album_ratings(spotifyAlbumId):
    """
    Get ALL users' ratings for a specific album (public/global).
    """
    try:
        all_ratings = get_all_users_album_ratings(spotifyAlbumId)
        return jsonify(all_ratings if all_ratings else []), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@ratings_bp.route('/user/<targetUserName>', methods=['GET'])
def fetch_user_ratings(targetUserName):
    """
    Get all ratings (songs and albums) for a specific user.
    Used for viewing a friend's ratings.
    """
    userName = session.get('userName')
    if not userName:
        return jsonify({'error': 'Not Authenticated'}), 401

    try:
        # Get both song and album ratings for the target user
        song_ratings = get_all_song_ratings_for_user(targetUserName)
        album_ratings = get_all_album_ratings_for_user(targetUserName)

        # Add type field to distinguish between songs and albums
        songs_with_type = [{'type': 'song', **rating} for rating in (song_ratings or [])]
        albums_with_type = [{'type': 'album', **rating} for rating in (album_ratings or [])]

        # Combine and sort by updatedAt
        combined_ratings = songs_with_type + albums_with_type
        combined_ratings.sort(key=lambda x: x.get('updatedAt', ''), reverse=True)

        return jsonify(combined_ratings), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500