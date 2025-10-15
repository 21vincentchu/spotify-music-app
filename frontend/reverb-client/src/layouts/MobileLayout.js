import { Routes, Route, useLocation } from "react-router-dom";

import SignInPage from '../pages/shared/SignInPage';
import NavbarMobile from "../components/mobile/NavbarMobile";
import HomeMobile from "../pages/mobile/HomeMobile";
import RatingsPage from "../pages/shared/RatingsPage";
import StatisticsPage from "../pages/shared/StatisticsPage";
import RecommendationsPage from "../pages/shared/RecommendationsPage";
import FriendsPage from "../pages/shared/FriendsPage";

import '../styles/Mobile.css';

function MobileLayout() {
    const location = useLocation();
    const hideNavbar = location.pathname === "/"; // hide navbar on login page

    return (
        <div className="mobile-layout">
            {/* optional header can go here */}

            {/* main content container */}
            <div className="mobile-content">
                <Routes>
                    <Route path="/" element={<SignInPage />} />
                    <Route path="/home" element={<HomeMobile />} />
                    <Route path="/ratings" element={<RatingsPage />} />
                    <Route path="/statistics" element={<StatisticsPage />} />
                    <Route path="/recommendations" element={<RecommendationsPage />} />
                    <Route path="/friends" element={<FriendsPage />} />
                </Routes>
            </div>

            {/* only show navbar if NOT on login page */}
            {!hideNavbar && <NavbarMobile />}
        </div>
    );
}

export default MobileLayout;
