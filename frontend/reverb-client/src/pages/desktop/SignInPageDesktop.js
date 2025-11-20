import axios from 'axios';
import { useEffect, useState } from 'react';
import config from '../../config';

import tempLogo from "../../assets/pngegg.png";
import Footer from "../../components/shared/Footer";

function SignInPage() {

    const [isLoading, setIsLoading] = useState(false);


    const handleLogin = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get(`${config.API_URL}/api/login`, {
                withCredentials: true
            });
            
            // Redirect user to Spotify's authorization page
            window.location.href = res.data.auth_url;
            setIsLoading(false);
        } catch(err) {
            console.error('Login initiation failed:', err);
        }
    }

    
  return(
    <div className="signin-page">
        <nav className="splash-nav">
            <a href="/">
            <img src={tempLogo} className="nav-logo" alt="Logo" />
            </a>
        </nav>
      <div className="signin-container round-outline blue-box-shadow">
        <div className="signin-content">
          <h1 className="signin-title">Reverb</h1>
          <p className="signin-subtitle">Discover, Rate, and Share Your Music Journey</p>
          
          <div className="signin-features">
            <div className="feature-item">
              <p>View detailed statistics about your listening habits</p>
            </div>
            <div className="feature-item">
              <p>Rate and review your favorite songs</p>
            </div>
            <div className="feature-item">
              <p>Connect with friends and share music tastes</p>
            </div>
          </div>

          <button 
            className="signin-button" 
            onClick={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? 'Connecting...' : 'Sign In with Spotify'}
          </button>
          
          <p className="signin-footer">
            Powered by Spotify • Secure OAuth Authentication
          </p>
        </div>
      </div>
      <Footer />
    </div>
    )
}

export default SignInPage;