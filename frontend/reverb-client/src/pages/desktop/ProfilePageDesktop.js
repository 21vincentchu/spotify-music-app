import { useEffect, useState } from 'react';
import axios from 'axios';
import config from '../../config';
import Footer from "../../components/shared/Footer";

function ProfilePageDesktop(){
    const [profile, setProfile] = useState(null);
    const [stats, setStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editedDisplayName, setEditedDisplayName] = useState('');
    const [error, setError] = useState('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        fetchProfile();
        fetchStats();
    }, []);

    const fetchProfile = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(`${config.API_URL}/api/profile/`, {
                withCredentials: true
            });
            setProfile(response.data);
            setEditedDisplayName(response.data.displayName || '');
        } catch (error) {
            console.error('Error fetching profile:', error);
            setError('Failed to load profile');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await axios.get(`${config.API_URL}/api/profile/stats`, {
                withCredentials: true
            });
            setStats(response.data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const handleEditClick = () => {
        setIsEditing(true);
        setEditedDisplayName(profile.displayName || '');
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditedDisplayName(profile.displayName || '');
        setError('');
    };

    const handleSaveDisplayName = async () => {
        if (!editedDisplayName.trim()) {
            setError('Display name cannot be empty');
            return;
        }

        try {
            const response = await axios.put(`${config.API_URL}/api/profile/update-display-name`,
                { displayName: editedDisplayName },
                { withCredentials: true }
            );
            console.log('Display name update response:', response.data);
            setProfile({ ...profile, displayName: editedDisplayName });
            setIsEditing(false);
            setError('');
        } catch (error) {
            console.error('Error updating display name:', error);
            console.error('Error response:', error.response?.data);
            setError(error.response?.data?.error || 'Failed to update display name');
        }
    };

    const handleLogout = async () => {
        try {
            await axios.post(`${config.API_URL}/api/logout`, {}, { withCredentials: true });
            window.location.href = '/';
        } catch (error) {
            console.error('Error during logout:', error);
        }
    };

    const handleDeleteAccount = async () => {
        setIsDeleting(true);
        try {
            await axios.delete(`${config.API_URL}/api/profile/delete-account`, {
                withCredentials: true
            });
            window.location.href = '/';
        } catch (error) {
            console.error('Error deleting account:', error);
            setError('Failed to delete account');
            setIsDeleting(false);
        }
    };

    return (
        <div className="profile-page page">
            <div className="profile-page-container round-outline blue-box-shadow">
                <h2>Profile</h2>
                <div className="profile-content">
                    {isLoading ? (
                        <p>Loading profile...</p>
                    ) : profile ? (
                        <div className="profile-info">
                            {/* Profile Picture */}
                            {profile.profilePicture && (
                                <div className="profile-picture-container">
                                    <img
                                        src={profile.profilePicture}
                                        alt="Profile"
                                        className="profile-picture"
                                    />
                                    <p className="profile-picture-note">
                                        To change your profile picture, update it on{' '}
                                        <a
                                            href={`https://open.spotify.com/user/${profile.spotifyId}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="spotify-link"
                                        >
                                            Spotify
                                        </a>
                                    </p>
                                </div>
                            )}

                            {/* Username (not editable) */}
                            <div className="profile-field">
                                <label>Username:</label>
                                <span className="profile-username">{profile.userName}</span>
                            </div>

                            {/* Display Name (editable) */}
                            <div className="profile-field">
                                <label>Display Name:</label>
                                {isEditing ? (
                                    <div className="edit-display-name">
                                        <input
                                            type="text"
                                            value={editedDisplayName}
                                            onChange={(e) => setEditedDisplayName(e.target.value)}
                                            className="display-name-input"
                                        />
                                        <div className="edit-buttons">
                                            <button onClick={handleSaveDisplayName} className="save-btn">
                                                Save
                                            </button>
                                            <button onClick={handleCancelEdit} className="cancel-btn">
                                                Cancel
                                            </button>
                                        </div>
                                        {error && <p className="error-message">{error}</p>}
                                    </div>
                                ) : (
                                    <div className="display-name-view">
                                        <span className="profile-display-name">{profile.displayName}</span>
                                        <button onClick={handleEditClick} className="edit-btn">
                                            Edit
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Spotify Connection Status */}
                            {/* <div className="profile-field">
                                <label>Spotify Account:</label>
                                <span className="spotify-status">
                                    {profile.spotifyId ? '✓ Connected' : '✗ Not Connected'}
                                </span>
                            </div> */}

                            {/* Profile Stats */}
                            {stats && (
                                <div className="profile-stats">
                                    <h3>Statistics</h3>
                                    <div className="stats-grid">
                                        <div className="stat-item">
                                            <span className="stat-value">{stats.songsRated || 0}</span>
                                            <span className="stat-label">Songs Reviewed</span>
                                        </div>
                                        <div className="stat-item">
                                            <span className="stat-value">{stats.albumsRated || 0}</span>
                                            <span className="stat-label">Albums Reviewed</span>
                                        </div>
                                        <div className="stat-item">
                                            <span className="stat-value">{stats.friendsCount || 0}</span>
                                            <span className="stat-label">Friends</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Account Actions */}
                            <div className="profile-actions">
                                <button onClick={handleLogout} className="logout-btn">
                                    Logout
                                </button>
                                <button
                                    onClick={() => setShowDeleteConfirm(true)}
                                    className="delete-btn"
                                >
                                    Delete Account
                                </button>
                            </div>

                            {/* Delete Confirmation Modal */}
                            {showDeleteConfirm && (
                                <div className="modal-overlay">
                                    <div className="modal-content">
                                        <h3>Delete Account</h3>
                                        <p>Are you sure you want to delete your account? This action is irreversible and will permanently delete all your data.</p>
                                        <div className="modal-buttons">
                                            <button
                                                onClick={handleDeleteAccount}
                                                className="confirm-delete-btn"
                                                disabled={isDeleting}
                                            >
                                                {isDeleting ? 'Deleting...' : 'Yes, Delete My Account'}
                                            </button>
                                            <button
                                                onClick={() => setShowDeleteConfirm(false)}
                                                className="cancel-delete-btn"
                                                disabled={isDeleting}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <p>Failed to load profile</p>
                    )}
                </div>
            </div>
            <Footer />
        </div>
    );
}

export default ProfilePageDesktop;