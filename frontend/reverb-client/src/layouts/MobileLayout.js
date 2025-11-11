import { useState, useRef, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";

import SignInPage from '../pages/shared/SignInPage';
import NavbarMobile from "../components/mobile/NavbarMobile";
import HomeMobile from "../pages/mobile/HomeMobile";
import RatingsPage from "../pages/shared/RatingsPage";
import StatisticsPage from "../pages/shared/StatisticsPage";
import RecommendationsPage from "../pages/shared/RecommendationsPage";
import FriendsPage from "../pages/shared/FriendsPage";
import UserPage from "../pages/shared/UserPage";

import profileButton from "../icons/UserIcon.png";

import '../styles/Mobile.css';

function MobileLayout() {
  const location = useLocation();
  const hideNavbar = location.pathname === "/"; // hide navbar on login page

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="mobile-layout">
      {!hideNavbar && (
        <div className="profile-container" ref={menuRef}>
          <img
            src={profileButton}
            alt="Profile"
            className="top-right-image"
            onClick={toggleMenu}
          />
          {menuOpen && (
            <div className="profile-menu">
              <button className="profile-option">Profile</button>
              <button className="profile-option">Sign Out</button>
            </div>
          )}
        </div>
      )}

      <div className="mobile-content">
        <Routes>
          <Route path="/" element={<SignInPage />} />
          <Route path="/home" element={<HomeMobile />} />
          <Route path="/ratings" element={<RatingsPage />} />
          <Route path="/statistics" element={<StatisticsPage />} />
          <Route path="/recommendations" element={<RecommendationsPage />} />
          <Route path="/friends" element={<FriendsPage />} />
          <Route path="/profile" element={<UserPage />} />
        </Routes>
      </div>

      {!hideNavbar && <NavbarMobile />}
    </div>
  );
}

export default MobileLayout;
