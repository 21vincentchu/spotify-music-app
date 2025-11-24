"""API routes for featured songs feature"""
from flask import Blueprint, request, jsonify, session
from .featured_songs import *

featured_songs_bp = Blueprint('featured_songs_bp', __name__, url_prefix='/api/featured-songs')

@featured_songs_bp.route('', methods=['GET'])
@featured_songs_bp.route('/', methods=['GET'])
def get_my_featured_songs():
    """Get the current user's featured songs."""
    userName = session.get('userName')
    if not userName:
        return jsonify({'error': 'Not authenticated'}), 401

    try:
        songs = get_user_featured_songs(userName)
        return jsonify(songs)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@featured_songs_bp.route('/', methods=['POST'])
def star_song():
    """Star a song - adds it to the user's featured songs list."""
    userName = session.get('userName')
    if not userName:
        return jsonify({'error': 'Not authenticated'}), 401

    data = request.get_json()

    # Validate required fields
    if not data:
        return jsonify({'error': 'Missing request data'}), 400

    if 'spotifyTrackId' not in data or 'songName' not in data or 'artistName' not in data:
        return jsonify({'error': 'Missing required fields'}), 400

    try:
        added = add_featured_song(userName, data)
        if added:
            return jsonify({'success': True, 'message': 'Song featured successfully'})
        else:
            return jsonify({'success': False, 'message': 'Song already featured'}), 409
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@featured_songs_bp.route('/<spotifyTrackId>', methods=['DELETE'])
def unstar_song(spotifyTrackId):
    """Remove a specific song from the user's featured songs."""
    userName = session.get('userName')
    if not userName:
        return jsonify({'error': 'Not authenticated'}), 401

    try:
        removed = remove_featured_song(userName, spotifyTrackId)
        if removed:
            return jsonify({'success': True, 'message': 'Song removed from featured'})
        else:
            return jsonify({'success': False, 'message': 'Song not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@featured_songs_bp.route('/friends', methods=['GET'])
def get_friends_featured():
    """Get featured songs from all of the user's friends (rolling feed)."""
    userName = session.get('userName')
    if not userName:
        return jsonify({'error': 'Not authenticated'}), 401

    try:
        featured_songs = get_friends_featured_songs(userName)
        return jsonify(featured_songs)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
