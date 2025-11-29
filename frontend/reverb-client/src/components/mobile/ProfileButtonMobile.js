import { Link } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import axios from 'axios';
import config from '../../config';
import tempProfile from "../../assets/istockphoto-2171382633-612x612.jpg";


function ProfileButtonMobile() {
  const [profilePicture, setProfilePicture] = useState(tempProfile);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  // Fetch user profile picture
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axios.get(`${config.API_URL}/api/profile/`, {
          withCredentials: true
        });
        if (response.data.profilePicture) {
          setProfilePicture(response.data.profilePicture);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    fetchUserProfile();
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSignOut = () => {
    axios.post(
      `${config.API_URL}/api/logout`,
      {},
      { withCredentials: true }
    )
    .then(() => {
      window.location.href = '/';
    })
    .catch((error) => {
      console.error('Error during logout:', error);
    });
  };

  return (
    <div className="profile-menu-wrapper" ref={menuRef}>
      <button
        className="profile-button"
        onClick={() => setShowMenu(!showMenu)}
      >
        <img src={profilePicture} alt="Profile" />
      </button>

      {showMenu && (
        <div className="profile-dropdown">
          <Link
            to="/profile"
            className="dropdown-item"
            onClick={() => setShowMenu(false)}
          >
            Profile
          </Link>
          <Link
            to="/about"
            className="dropdown-item"
            onClick={() => setShowMenu(false)}
          >
            About
          </Link>
          <button
            className="dropdown-item signout"
            onClick={handleSignOut}
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}

export default ProfileButtonMobile;
