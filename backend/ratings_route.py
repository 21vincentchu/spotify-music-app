from flask import Blueprint, request, jsonify, session
from ratings_reviews import (
    create_song_rating,
    create_album_rating,
    delete_song_rating,
    delete_album_rating
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

    

