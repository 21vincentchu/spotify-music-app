// src/layouts/MobileLayout.js
import { Routes, Route, useLocation, Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

import SignInPage from "../pages/mobile/SignInPage";
import NavbarMobile from "../components/mobile/NavbarMobile";
import HomeMobile from "../pages/mobile/HomeMobile";
import RatingsPage from "../pages/mobile/RatingsPage";
import StatisticsPage from "../pages/mobile/StatisticsPage";
import RecommendationsPage from "../pages/mobile/RecommendationsPage";
import FriendsPage from "../pages/mobile/FriendsPage";
import UserPage from "../pages/shared/UserPage";

import profileButton from "../assets/istockphoto-2171382633-612x612.jpg";
import logo from "../assets/pngegg.png";

import "../styles/Mobile.css";

function MobileLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const hideNavbar = location.pathname === "/";

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = () => {
    navigate("/");
  };

  return (
    <div className="mobile-layout">
      {/* SCROLL-AWAY TOP BAR */}
      {!hideNavbar && (
        <div className="mobile-topbar">
          <img src={logo} alt="Logo" className="mobile-logo" />

          <div className="profile-menu-wrapper" ref={menuRef}>
            <button
              className="profile-button"
              onClick={() => setMenuOpen((prev) => !prev)}
            >
              <img src={profileButton} alt="Profile" />
            </button>

            {menuOpen && (
              <div className="profile-dropdown">
                <Link
                  to="/profile"
                  className="dropdown-item"
                  onClick={() => setMenuOpen(false)}
                >
                  View Profile
                </Link>

                <button className="dropdown-item signout" onClick={handleSignOut}>
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MAIN CONTENT AREA */}
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

      {/* NAVBAR */}
      {!hideNavbar && <NavbarMobile />}
    </div>
  );
}

export default MobileLayout;
