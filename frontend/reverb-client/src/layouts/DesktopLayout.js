
import { Routes, Route } from "react-router-dom";

import SignInPage from '../pages/shared/SignInPage';
import NavbarDesktop from "../components/desktop/NavbarDesktop";
import HomeDesktop from "../pages/desktop/HomeDesktop";
import RatingsPage from "../pages/shared/RatingsPage";
import StatisticsPage from "../pages/shared/StatisticsPage";
import RecommendationsPage from "../pages/shared/RecommendationsPage";
import FriendsPage from "../pages/shared/FriendsPage";

import '../styles/Desktop.css'

function DesktopLayout(){

    return(
        <div>
            <NavbarDesktop  />
            <div className="desktop-layout">
               <Routes>
                <Route path="/" element={<SignInPage />} />
                <Route path="/home" element={<HomeDesktop />} />
                <Route path="/ratings" element={<RatingsPage />} />
                <Route path="/statistics" element={< StatisticsPage/>} />
                <Route path="/recommendations" element={<RecommendationsPage />} />
                <Route path="/friends" element={<FriendsPage />} />
            </Routes> 
            </div>
            
        </div>
    )
}

export default DesktopLayout;