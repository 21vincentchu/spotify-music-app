
import { Routes, Route } from "react-router-dom";

import SignInPage from '../pages/shared/SignInPage';
import NavbarMobile from "../components/mobile/NavbarMobile";
import HomeMobile from "../pages/mobile/HomeMobile";
import RatingsPage from "../pages/shared/RatingsPage";
import StatisticsPage from "../pages/shared/StatisticsPage";
import RecommendationsPage from "../pages/shared/RecommendationsPage";
import FriendsPage from "../pages/shared/FriendsPage";

import '../styles/Mobile.css'

function MobileLayout(){

    return(
        <div className="mobile-layout">
            <h1>Mobile</h1>
            <NavbarMobile  />
            <Routes>
                <Route path="/" element={<SignInPage />} />
                <Route path="/home" element={<HomeMobile />} />
                <Route path="/ratings" element={<RatingsPage />} />
                <Route path="/statistics" element={< StatisticsPage/>} />
                <Route path="/recommendations" element={<RecommendationsPage />} />
                <Route path="/friends" element={<FriendsPage />} />
            </Routes>
        </div>
    )
}

export default MobileLayout;