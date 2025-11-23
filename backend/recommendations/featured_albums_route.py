"""API routes for featured albums feature"""
from flask import Blueprint, request, jsonify, session
from .featured_albums import *

featured_albums_bp = Blueprint('featured_albums_bp', __name__, url_prefix='/api/featured-albums')

@featured_albums_bp.route('/', methods=['GET'])
def get_my_featured_albums():
    """Get the current user's featured albums."""
    userName = session.get('userName')
    if not userName:
        return jsonify({'error': 'Not authenticated'}), 401

    try:
        albums = get_user_featured_albums(userName)
        return jsonify(albums)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@featured_albums_bp.route('/', methods=['POST'])
def star_album():
    """Star an album - adds it to the user's featured albums list."""
    userName = session.get('userName')
    if not userName:
        return jsonify({'error': 'Not authenticated'}), 401

    data = request.get_json()

    # Validate required fields
    if not data:
        return jsonify({'error': 'Missing request data'}), 400

    if 'spotifyAlbumId' not in data or 'albumName' not in data:
        return jsonify({'error': 'Missing required fields'}), 400

    try:
        added = add_featured_album(userName, data)
        if added:
            return jsonify({'success': True, 'message': 'Album featured successfully'})
        else:
            return jsonify({'success': False, 'message': 'Album already featured'}), 409
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@featured_albums_bp.route('/<spotifyAlbumId>', methods=['DELETE'])
def unstar_album(spotifyAlbumId):
    """Remove a specific album from the user's featured albums."""
    userName = session.get('userName')
    if not userName:
        return jsonify({'error': 'Not authenticated'}), 401

    try:
        removed = remove_featured_album(userName, spotifyAlbumId)
        if removed:
            return jsonify({'success': True, 'message': 'Album removed from featured'})
        else:
            return jsonify({'success': False, 'message': 'Album not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@featured_albums_bp.route('/friends', methods=['GET'])
def get_friends_featured():
    """Get featured albums from all of the user's friends (rolling feed)."""
    userName = session.get('userName')
    if not userName:
        return jsonify({'error': 'Not authenticated'}), 401

    try:
        featured_albums = get_friends_featured_albums(userName)
        return jsonify(featured_albums)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
