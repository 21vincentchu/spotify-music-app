from flask import Blueprint, request, jsonify, session
from .ratings_reviews import *

ratings_bp = Blueprint('ratings_bp', __name__, url_prefix='/api/ratings')

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

    song = get_song_by_spotify_id(spotifyTrackId)
    if not song:
        return jsonify({"error": "Song not found"}), 404

    # Get user's existing rating if they have one
    user_rating = get_song_rating(userName, spotifyTrackId)

    return jsonify({
        "song": song,
        "userRating": user_rating  # None if not rated yet
    }), 200


@ratings_bp.route('/album/<spotifyAlbumId>', methods=['GET'])
def fetch_album(spotifyAlbumId):
    userName = session.get('userName')
    if not userName:
        return jsonify({'error': 'Not Authenticated'}), 401

    album = get_album_by_spotify_id(spotifyAlbumId)
    if not album:
        return jsonify({"error": "Album not found"}), 404

    # Get user's existing rating if they have one
    user_rating = get_album_rating(userName, spotifyAlbumId)

    return jsonify({
        "album": album,
        "userRating": user_rating  # None if not rated yet
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