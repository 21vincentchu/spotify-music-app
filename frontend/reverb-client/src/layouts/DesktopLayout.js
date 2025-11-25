import { Routes, Route } from "react-router-dom";
import SignInPageDesktop from '../pages/desktop/SignInPageDesktop';
import CallbackPageDesktop from '../pages/desktop/CallbackPageDesktop';
import NavbarDesktop from "../components/desktop/NavbarDesktop";
import HomeDesktop from "../pages/desktop/HomeDesktop";
import RatingsPageDesktop from "../pages/desktop/RatingsPageDesktop";
import StatisticsPageDesktop from "../pages/desktop/StatisticsPageDesktop";
import RecommendationsPageDesktop from "../pages/desktop/RecommendationsPageDesktop";
import FriendsPageDesktop from "../pages/desktop/FriendsPageDesktop";
import ProtectedRoute from "../components/shared/ProtectedRoute";
import { useAuth } from "../context/AuthContext";
import { useLocation } from "react-router-dom";
import '../styles/Desktop.css';
import ProfilePageDesktop from "../pages/desktop/ProfilePageDesktop";
import AboutPageDesktop from "../pages/desktop/AboutPageDesktop";
import RatingDetailPageDesktop from "../pages/desktop/RatingDetailPageDesktop";


function DesktopLayout() {
    const { isAuthenticated, userName } = useAuth();
    const location = useLocation();
    const showNavbar = isAuthenticated && location.pathname !== '/' && location.pathname !== '/callback'  && location.pathname !== '/about';

    return (
        <div className="desktop-layout">
            {showNavbar && <NavbarDesktop />}
                <Routes>
                    <Route path="/" element={<SignInPageDesktop />} />
                    <Route path="/about" element={<AboutPageDesktop />} />
                    <Route path="/callback" element={<CallbackPageDesktop />} />
                    
                    {/* Protected Routes */}
                    <Route path="/home" element={
                        <ProtectedRoute>
                            <HomeDesktop />
                        </ProtectedRoute>
                    } />
                    <Route path="/profile" element={
                        <ProtectedRoute>
                            < ProfilePageDesktop/>
                        </ProtectedRoute>
                    } />
                    <Route path="/ratings" element={
                        <ProtectedRoute>
                            <RatingsPageDesktop />
                        </ProtectedRoute>
                    } />
                    <Route path="/ratings/:spotifyId" element={
                        <ProtectedRoute>
                            <RatingDetailPageDesktop />
                        </ProtectedRoute>
                    } />
                    <Route path="/statistics" element={
                        <ProtectedRoute>
                            <StatisticsPageDesktop />
                        </ProtectedRoute>
                    } />
                    <Route path="/recommendations" element={
                        <ProtectedRoute>
                            <RecommendationsPageDesktop />
                        </ProtectedRoute>
                    } />
                    <Route path="/friends" element={
                        <ProtectedRoute>
                            <FriendsPageDesktop />
                        </ProtectedRoute>
                    } />
                  
                    
                </Routes>
            {/* </div> */}
        </div>
    );
}

export default DesktopLayout;