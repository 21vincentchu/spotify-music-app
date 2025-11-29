from flask import Blueprint, request, jsonify, session
from .search import *

search_bp = Blueprint('search_bp', __name__, url_prefix='/api/search')

@search_bp.route('/search', methods=['GET'])
def search_music_route():
    """
    Search for an artist, album or song
    query parameters:
    q -> search string
    limit -> deaults at 10
    """

    q = request.args.get('q', '').strip()
    limit = int(request.args.get('limit', 20))

    if not q:
        return jsonify({'error': 'Missing query parameter: q'}), 400
    
    try:
        results = search_music_all(q, limit)
        return jsonify(results)
    
    except Exception as e:
        print(f"error searching music: {e}")
        return jsonify({'error': str(e)}), 500
