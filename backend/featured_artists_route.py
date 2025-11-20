"""API routes for featured artists feature"""
from flask import Blueprint, request, jsonify, session
from featured_artists import (
    add_featured_artist,
    remove_featured_artist,
    get_user_featured_artists,
    get_friends_featured_artists
)

featured_artists_bp = Blueprint('featured_artists_bp', __name__, url_prefix='/api/featured-artists')

@featured_artists_bp.route('/', methods=['GET'])
def get_my_featured_artists():
    """Get the current user's featured artists."""
    userName = session.get('userName')
    if not userName:
        return jsonify({'error': 'Not authenticated'}), 401

    try:
        artists = get_user_featured_artists(userName)
        return jsonify(artists)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@featured_artists_bp.route('/', methods=['POST'])
def star_artist():
    """Star an artist - adds it to the user's featured artists list."""
    userName = session.get('userName')
    if not userName:
        return jsonify({'error': 'Not authenticated'}), 401

    data = request.get_json()

    # Validate required fields
    if not data:
        return jsonify({'error': 'Missing request data'}), 400

    if 'spotifyArtistId' not in data or 'artistName' not in data:
        return jsonify({'error': 'Missing required fields'}), 400

    try:
        added = add_featured_artist(userName, data)
        if added:
            return jsonify({'success': True, 'message': 'Artist featured successfully'})
        else:
            return jsonify({'success': False, 'message': 'Artist already featured'}), 409
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@featured_artists_bp.route('/<spotifyArtistId>', methods=['DELETE'])
def unstar_artist(spotifyArtistId):
    """Remove a specific artist from the user's featured artists."""
    userName = session.get('userName')
    if not userName:
        return jsonify({'error': 'Not authenticated'}), 401

    try:
        removed = remove_featured_artist(userName, spotifyArtistId)
        if removed:
            return jsonify({'success': True, 'message': 'Artist removed from featured'})
        else:
            return jsonify({'success': False, 'message': 'Artist not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@featured_artists_bp.route('/friends', methods=['GET'])
def get_friends_featured():
    """Get featured artists from all of the user's friends (rolling feed)."""
    userName = session.get('userName')
    if not userName:
        return jsonify({'error': 'Not authenticated'}), 401

    try:
        featured_artists = get_friends_featured_artists(userName)
        return jsonify(featured_artists)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
