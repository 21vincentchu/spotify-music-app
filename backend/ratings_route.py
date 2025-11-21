from flask import Blueprint, request, jsonify, session
from ratings_reviews import (
    create_song_rating,
    create_album_rating,
    delete_song_rating,
    delete_album_rating,
    get_song_rating,
    get_album_rating
)

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
            songName=data['artistName'],
            artistName=data['artistName'],
            rating=rating,
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
            comment=data.get('comment')
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
    


