// src/layouts/MobileLayout.js
import { Routes, Route, useLocation, Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

import SignInPage from "../pages/mobile/SignInPage";
import CallbackPage from "../pages/mobile/CallbackPage";
import NavbarMobile from "../components/mobile/NavbarMobile";
import HomeMobile from "../pages/mobile/HomeMobile";
import RatingsPage from "../pages/mobile/RatingsPage";
import RatingDetailPageMobile from "../pages/mobile/RatingDetailPageMobile";
import StatisticsPage from "../pages/mobile/StatisticsPage";
import RecommendationsPage from "../pages/mobile/RecommendationsPage";
import FriendsPage from "../pages/mobile/FriendsPage";
import ProfilePage from "../pages/mobile/ProfilePage";
import AboutPage from "../pages/mobile/AboutPage";
import ProtectedRoute from "../components/shared/ProtectedRoute";



import profileButton from "../assets/istockphoto-2171382633-612x612.jpg";
import logo from "../assets/reverb-logo.svg";

import "../styles/Mobile.css";

function MobileLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const hideNavbar = location.pathname === "/";

  const [menuOpen, setMenuOpen] = useState(false);
  const [showPageTitle, setShowPageTitle] = useState(false);
  const menuRef = useRef(null);

  // Show page title when location changes
  useEffect(() => {
    if (!hideNavbar) {
      setShowPageTitle(true);
      const timer = setTimeout(() => {
        setShowPageTitle(false);
      }, 2100); // 
      return () => clearTimeout(timer);
    }
  }, [location.pathname, hideNavbar]);

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

  // Get current page name
  const getPageName = () => {
    switch (location.pathname) {
      case "/recommendations":
        return "Recommended";
      case "/statistics":
        return "Statistics";
      case "/home":
        return "Home";
      case "/friends":
        return "Friends";
      case "/ratings":
        return "Ratings";
      case "/profile":
        return "Profile";
      case "/about":
        return "About";
      default:
        return "";
    }
  };

  return (
    <div className="mobile-layout">
      {/* SCROLL-AWAY TOP BAR */}
      {!hideNavbar && (
        <div className="mobile-topbar">
          <Link to="/home">
            <img src={logo} alt="Logo" className="mobile-logo" />
          </Link>

          <div className={`mobile-topbar-title ${showPageTitle ? 'show' : ''}`}>
            <div>{getPageName()}</div>
            <div className="page-subtitle">page</div>
          </div>

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
                <Link
                    to="/about"
                    className="dropdown-item"
                    onClick={() => setMenuOpen(false)}
                  >
                    About
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
          <Route path="/callback" element={<CallbackPage />} />
          <Route path="/about" element={<AboutPage />} />

          {/* Protected Routes */}
          <Route path="/home" element={
            <ProtectedRoute>
              <HomeMobile />
            </ProtectedRoute>
          } />
          <Route path="/ratings" element={
            <ProtectedRoute>
              <RatingsPage />
            </ProtectedRoute>
          } />
          <Route path="/ratings/:type/:spotifyId" element={
            <ProtectedRoute>
              <RatingDetailPageMobile />
            </ProtectedRoute>
          } />
          <Route path="/statistics" element={
            <ProtectedRoute>
              <StatisticsPage />
            </ProtectedRoute>
          } />
          <Route path="/recommendations" element={
            <ProtectedRoute>
              <RecommendationsPage />
            </ProtectedRoute>
          } />
          <Route path="/friends" element={
            <ProtectedRoute>
              <FriendsPage />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />
        </Routes>
      </div>

      {/* NAVBAR */}
      {!hideNavbar && <NavbarMobile />}
    </div>
  );
}

export default MobileLayout;
