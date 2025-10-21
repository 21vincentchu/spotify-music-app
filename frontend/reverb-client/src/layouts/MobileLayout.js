import { Routes, Route, useLocation, Link } from "react-router-dom";


import SignInPage from '../pages/shared/SignInPage';
import NavbarMobile from "../components/mobile/NavbarMobile";
import HomeMobile from "../pages/mobile/HomeMobile";
import RatingsPage from "../pages/shared/RatingsPage";
import StatisticsPage from "../pages/shared/StatisticsPage";
import RecommendationsPage from "../pages/shared/RecommendationsPage";
import FriendsPage from "../pages/shared/FriendsPage";
import profileButton from "../icons/UserIcon.png";


import '../styles/Mobile.css';
import UserPage from "../pages/shared/UserPage";

function MobileLayout() {
    const location = useLocation();
    const hideNavbar = location.pathname === "/"; // hide navbar on login page


      return (
        <div className="mobile-layout">
          {/* ✅ clickable top-right image */}
          {!hideNavbar && (
            <Link to="/profile">
              <img
                src={profileButton}
                alt="Profile"
                className="top-right-image"
              />
            </Link>
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

            {/* only show navbar if NOT on login page */}
            {!hideNavbar && <NavbarMobile />}
        </div>
    );
}

export default MobileLayout;
