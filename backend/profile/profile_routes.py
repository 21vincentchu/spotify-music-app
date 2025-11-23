from flask import Blueprint, request, jsonify, session, redirect
from .profile import *

profile_bp = Blueprint('profile_bp', __name__, url_prefix='/api/profile')

@profile_bp.route('/', methods=['GET'])
def get_profile():
    """Get current user's profile"""
    userName = session.get('userName')
    if not userName:
        return jsonify({'error': 'Not authenticated'}), 401

    try:
        user = get_user_profile(userName)
        if not user:
            return jsonify({'error': 'User not found'}), 404

        return jsonify({
            'userName': user[0],
            'spotifyId': user[1],
            'displayName': user[2],
            'profilePicture': user[3]
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@profile_bp.route('/update-display-name', methods=['PUT'])
def update_display_name_route():
    """Update displayName"""
    userName = session.get('userName')
    if not userName:
        return jsonify({'error': 'Not authenticated'}), 401

    data = request.get_json()
    displayName = data.get('displayName')

    if not displayName:
        return jsonify({'error': 'displayName is required'}), 400

    try:
        update_display_name(userName, displayName)
        return jsonify({'success': True, 'message': 'Display name updated successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@profile_bp.route('/stats', methods=['GET'])
def get_stats():
    """Get user profile statistics"""
    userName = session.get('userName')
    if not userName:
        return jsonify({'error': 'Not authenticated'}), 401

    try:
        stats = get_profile_stats(userName)
        return jsonify(stats)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@profile_bp.route('/delete-account', methods=['DELETE'])
def delete_account():
    """Delete user account"""
    userName = session.get('userName')
    if not userName:
        return jsonify({'error': 'Not authenticated'}), 401

    try:
        delete_user_account(userName)
        # Clear session after deleting account
        session.clear()
        return jsonify({'success': True, 'message': 'Account deleted successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# backend testing purposes
@profile_bp.route('/test')
def test_profile():
    """Simple HTML test page for profile routes"""
    userName = session.get('userName')
    if not userName:
        return redirect('/')

    user = get_user_profile(userName)
    if not user:
        return '<h1>User not found</h1>'

    html = f'''
        <h1>Profile Test Page</h1>
        <h2>Current Profile:</h2>
        <p><strong>Username:</strong> {user[0]}</p>
        <p><strong>Spotify ID:</strong> {user[1]}</p>
        <p><strong>Display Name:</strong> {user[2]}</p>
        <p><strong>Profile Picture:</strong> {user[3]}</p>
        {f'<img src="{user[3]}" width="200">' if user[3] else ''}

        <hr>
        <h2>Update Display Name:</h2>
        <form action="/api/profile/update-display-name" method="POST" onsubmit="updateDisplayName(event)">
            <input type="text" id="displayName" placeholder="New display name" required>
            <button type="submit">Update</button>
        </form>
        <div id="displayname-result"></div>

        <hr>
        <p><a href="/">Back to Home</a></p>

        <script>
        async function updateDisplayName(e) {{
            e.preventDefault();
            const displayName = document.getElementById('displayName').value;
            const response = await fetch('/api/profile/update-display-name', {{
                method: 'PUT',
                headers: {{'Content-Type': 'application/json'}},
                body: JSON.stringify({{displayName}})
            }});
            const data = await response.json();
            document.getElementById('displayname-result').textContent = JSON.stringify(data);
            if (response.ok) setTimeout(() => location.reload(), 1000);
        }}
        </script>
    '''
    return html
