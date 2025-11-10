import { Routes, Route } from "react-router-dom";
import SignInPage from '../pages/shared/SignInPage';
import CallbackPage from '../pages/shared/CallbackPage';
import NavbarDesktop from "../components/desktop/NavbarDesktop";
import HomeDesktop from "../pages/desktop/HomeDesktop";
import RatingsPage from "../pages/shared/RatingsPage";
import StatisticsPage from "../pages/shared/StatisticsPage";
import RecommendationsPage from "../pages/shared/RecommendationsPage";
import FriendsPage from "../pages/shared/FriendsPage";
import ProtectedRoute from "../components/shared/ProtectedRoute";
import { useAuth } from "../context/AuthContext";
import { useLocation } from "react-router-dom";
import '../styles/Desktop.css';

function DesktopLayout() {
    const { isAuthenticated, userName } = useAuth();
    const location = useLocation();
    const showNavbar = isAuthenticated && location.pathname !== '/' && location.pathname !== '/callback';

    return (
        <div className="desktop-layout">
            {showNavbar && <NavbarDesktop />}
                <Routes>
                    <Route path="/" element={<SignInPage />} />
                    <Route path="/callback" element={<CallbackPage />} />
                    
                    {/* Protected Routes */}
                    <Route path="/home" element={
                        <ProtectedRoute>
                            <HomeDesktop />
                        </ProtectedRoute>
                    } />
                    <Route path="/ratings" element={
                        <ProtectedRoute>
                            <RatingsPage />
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
                </Routes>
            {/* </div> */}
        </div>
    );
}

export default DesktopLayout;