from flask import Blueprint, request, jsonify, session
from ratings_reviews import (
    create_song_rating,
    create_album_rating,
    delete_song_rating,
    delete_album_rating
)

ratings_bp = Blueprint('ratings_bp', __name__, url_prefix='/api/ratings')

### ----- SONG RATING ROUTES ----- ###

@ratings_bp.route('/song', methods=['POST'])
def rate_song():
    """
    Create or update a song rating and review.
    
    Expected JSON body:
    {
        "spotifyTrackId": "string",
        "songName": "string",
        "artistName": "string",
        "rating": float (0-5),
        "comment": "string" (optional)
    }
    """
    userName = session.get('userName')
    if not userName:
        return jsonify({'error': 'Not authenticated'}), 401
    
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['spotifyTrackId', 'songName', 'artistName', 'rating']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400
    
    try:
        # Validate rating range
        rating = float(data['rating'])
        if not (0 <= rating <= 5):
            return jsonify({'error': 'Rating must be between 0 and 5'}), 400
        
        unique_id = create_song_rating(
            userName=userName,
            spotifyTrackId=data['spotifyTrackId'],
            songName=data['songName'],
            artistName=data['artistName'],
            rating=rating,
            comment=data.get('comment')
        )
        
        return jsonify({
            'success': True,
            'message': 'Song rating created/updated successfully',
            'uniqueID': unique_id
        }), 201
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': f'Failed to create song rating: {str(e)}'}), 500


@ratings_bp.route('/song/<spotify_track_id>', methods=['GET'])
def get_song_rating_route(spotify_track_id):
    """
    Get the current user's rating for a specific song.
    """
    userName = session.get('userName')
    if not userName:
        return jsonify({'error': 'Not authenticated'}), 401
    
    try:
        # TODO: Import and use get_song_rating function when implemented
        # rating = get_song_rating(userName, spotify_track_id)
        # if rating:
        #     return jsonify(rating), 200
        # return jsonify({'message': 'No rating found for this song'}), 404
        
        return jsonify({'message': 'Get song rating not yet implemented'}), 501
        
    except Exception as e:
        return jsonify({'error': f'Failed to retrieve song rating: {str(e)}'}), 500


@ratings_bp.route('/song/<spotify_track_id>', methods=['DELETE'])
def delete_song_rating_route(spotify_track_id):
    """
    Delete the current user's rating for a specific song.
    """
    userName = session.get('userName')
    if not userName:
        return jsonify({'error': 'Not authenticated'}), 401
    
    try:
        success = delete_song_rating(userName, spotify_track_id)
        
        if success:
            return jsonify({
                'success': True,
                'message': 'Song rating deleted successfully'
            }), 200
        else:
            return jsonify({'error': 'Rating not found'}), 404
            
    except Exception as e:
        return jsonify({'error': f'Failed to delete song rating: {str(e)}'}), 500


@ratings_bp.route('/songs', methods=['GET'])
def get_all_song_ratings_route():
    """
    Get all song ratings for the current user.
    
    Query parameters:
    - limit: int (optional) - Maximum number of results
    - order_by: string (optional) - Column to sort by (updatedAt, rating, songName)
    - order_dir: string (optional) - Sort direction (ASC, DESC)
    """
    userName = session.get('userName')
    if not userName:
        return jsonify({'error': 'Not authenticated'}), 401
    
    try:
        # Get query parameters
        limit = request.args.get('limit', type=int)
        order_by = request.args.get('order_by', 'updatedAt')
        order_dir = request.args.get('order_dir', 'DESC')
        
        # TODO: Import and use get_all_song_ratings function when implemented
        # ratings = get_all_song_ratings(userName, limit, order_by, order_dir)
        # return jsonify({'ratings': ratings}), 200
        
        return jsonify({'message': 'Get all song ratings not yet implemented'}), 501
        
    except Exception as e:
        return jsonify({'error': f'Failed to retrieve song ratings: {str(e)}'}), 500


### ----- ALBUM RATING ROUTES ----- ###

@ratings_bp.route('/album', methods=['POST'])
def rate_album():
    """
    Create or update an album rating and review.
    
    Expected JSON body:
    {
        "spotifyAlbumId": "string",
        "albumName": "string",
        "artistName": "string",
        "rating": float (0-5),
        "comment": "string" (optional)
    }
    """
    userName = session.get('userName')
    if not userName:
        return jsonify({'error': 'Not authenticated'}), 401
    
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['spotifyAlbumId', 'albumName', 'artistName', 'rating']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400
    
    try:
        # Validate rating range
        rating = float(data['rating'])
        if not (0 <= rating <= 5):
            return jsonify({'error': 'Rating must be between 0 and 5'}), 400
        
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
            'message': 'Album rating created/updated successfully',
            'uniqueID': unique_id
        }), 201
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': f'Failed to create album rating: {str(e)}'}), 500


@ratings_bp.route('/album/<spotify_album_id>', methods=['GET'])
def get_album_rating_route(spotify_album_id):
    """
    Get the current user's rating for a specific album.
    """
    userName = session.get('userName')
    if not userName:
        return jsonify({'error': 'Not authenticated'}), 401
    
    try:
        # TODO: Import and use get_album_rating function when implemented
        # rating = get_album_rating(userName, spotify_album_id)
        # if rating:
        #     return jsonify(rating), 200
        # return jsonify({'message': 'No rating found for this album'}), 404
        
        return jsonify({'message': 'Get album rating not yet implemented'}), 501
        
    except Exception as e:
        return jsonify({'error': f'Failed to retrieve album rating: {str(e)}'}), 500


@ratings_bp.route('/album/<spotify_album_id>', methods=['DELETE'])
def delete_album_rating_route(spotify_album_id):
    """
    Delete the current user's rating for a specific album.
    """
    userName = session.get('userName')
    if not userName:
        return jsonify({'error': 'Not authenticated'}), 401
    
    try:
        success = delete_album_rating(userName, spotify_album_id)
        
        if success:
            return jsonify({
                'success': True,
                'message': 'Album rating deleted successfully'
            }), 200
        else:
            return jsonify({'error': 'Rating not found'}), 404
            
    except Exception as e:
        return jsonify({'error': f'Failed to delete album rating: {str(e)}'}), 500


@ratings_bp.route('/albums', methods=['GET'])
def get_all_album_ratings_route():
    """
    Get all album ratings for the current user.
    
    Query parameters:
    - limit: int (optional) - Maximum number of results
    - order_by: string (optional) - Column to sort by (updatedAt, rating, albumName)
    - order_dir: string (optional) - Sort direction (ASC, DESC)
    """
    userName = session.get('userName')
    if not userName:
        return jsonify({'error': 'Not authenticated'}), 401
    
    try:
        # Get query parameters
        limit = request.args.get('limit', type=int)
        order_by = request.args.get('order_by', 'updatedAt')
        order_dir = request.args.get('order_dir', 'DESC')
        
        # TODO: Import and use get_all_album_ratings function when implemented
        # ratings = get_all_album_ratings(userName, limit, order_by, order_dir)
        # return jsonify({'ratings': ratings}), 200
        
        return jsonify({'message': 'Get all album ratings not yet implemented'}), 501
        
    except Exception as e:
        return jsonify({'error': f'Failed to retrieve album ratings: {str(e)}'}), 500


### ----- TESTING ROUTE ----- ###

@ratings_bp.route('/test', methods=['GET'])
def test_ratings():
    """Simple test endpoint to verify ratings routes are working"""
    return jsonify({
        'message': 'Ratings API is working',
        'endpoints': {
            'POST /api/ratings/song': 'Create/update song rating',
            'GET /api/ratings/song/<id>': 'Get song rating',
            'DELETE /api/ratings/song/<id>': 'Delete song rating',
            'GET /api/ratings/songs': 'Get all song ratings',
            'POST /api/ratings/album': 'Create/update album rating',
            'GET /api/ratings/album/<id>': 'Get album rating',
            'DELETE /api/ratings/album/<id>': 'Delete album rating',
            'GET /api/ratings/albums': 'Get all album ratings'
        }
    }), 200
