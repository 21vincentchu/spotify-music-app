import { Link, NavLink } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import axios from 'axios';
import config from '../../config';

import tempLogo from "../../assets/pngegg.png";
import tempProfile from "../../assets/istockphoto-2171382633-612x612.jpg";

function NavbarDesktop() {
  const [showMenu, setShowMenu] = useState(false);
  const [profilePicture, setProfilePicture] = useState(tempProfile);
  const menuRef = useRef(null);

  // Fetch user profile data
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
        // Keep using tempProfile as fallback
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
      {}, // no request body
      { withCredentials: true } // config object
    )
    .then(() => {
      // Redirect to sign-in page after logout
      window.location.href = '/';
    })
    .catch((error) => { 
      console.error('Error during logout:', error);
    });
  }

  return (
    <nav>
      <a href="/home">
        <img src={tempLogo} className="nav-logo" />
      </a>
      
      <div className="nav-links">
        <NavLink to="/home" className={({ isActive }) => (isActive ? "active" : "")}>
          Home
        </NavLink>
        <NavLink to="/ratings" className={({ isActive }) => (isActive ? "active" : "")}>
          Ratings
        </NavLink>
        <NavLink to="/statistics" className={({ isActive }) => (isActive ? "active" : "")}>
          Statistics
        </NavLink>
        <NavLink to="/recommendations" className={({ isActive }) => (isActive ? "active" : "")}>
          Recommendation
        </NavLink>
        <NavLink to="/friends" className={({ isActive }) => (isActive ? "active" : "")}>
          Friends
        </NavLink>
      </div>
      
      <div className="profile-container" ref={menuRef}>
        <img
          src={profilePicture}
          className="nav-profile"
          onClick={() => setShowMenu(!showMenu)}
        />
        
        {showMenu && (
          <div className="profile-menu">
            <Link to="/profile" onClick={() => setShowMenu(false)}>
              Profile
            </Link>
            <Link onClick={handleSignOut}>
              Sign Out
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}

export default NavbarDesktop;