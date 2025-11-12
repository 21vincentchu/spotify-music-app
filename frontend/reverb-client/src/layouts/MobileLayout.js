// src/layouts/MobileLayout.js
import { Routes, Route, useLocation, Link } from "react-router-dom";

import SignInPage from "../pages/shared/SignInPage";
import NavbarMobile from "../components/mobile/NavbarMobile";
import HomeMobile from "../pages/mobile/HomeMobile";
import RatingsPage from "../pages/shared/RatingsPage";
import StatisticsPage from "../pages/shared/StatisticsPage";
import RecommendationsPage from "../pages/shared/RecommendationsPage";
import FriendsPage from "../pages/shared/FriendsPage";
import UserPage from "../pages/shared/UserPage";
import profileButton from "../icons/UserIcon.png";

import "../styles/Mobile.css";

function MobileLayout() {
  const location = useLocation();
  const hideNavbar = location.pathname === "/";

  return (
    <div className="mobile-layout">
      {/* ✅ top-right profile icon */}
      {!hideNavbar && (
        <Link to="/profile" className="profile-button-link">
          <img
            src={profileButton}
            alt="Profile"
            className="profile-button"
          />
        </Link>
      )}

      {/* ✅ main content area */}
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

      {/* ✅ bottom navbar */}
      {!hideNavbar && <NavbarMobile />}
    </div>
  );
}

export default MobileLayout;
