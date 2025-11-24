import { useNavigate } from "react-router-dom";
import Footer from "../../components/shared/Footer";

function AboutPage() {
  const navigate = useNavigate();

  return (
    <div className="about-page page">
        <div className="about-content">
            <button onClick={() => navigate('/home')} className="back-button">
              ← Back to Home
            </button>

            <div className="about-section">
                <h1>Reverb - Social Music Analytics Platform</h1>
                <p>A social music analytics platform that transforms your Spotify listening data into shareable insights and community-driven experiences through music ratings and reviews.</p>
            </div>

            <div className="about-section">
                <h2>Key Features</h2>
                <ul>
                    <li><strong>Secure Spotify OAuth Login:</strong> Connect safely with your Spotify account using OAuth 2.0 authentication, the industry standard</li>
                    <li><strong>Music Analytics:</strong> View detailed statistics about your listening habits, top songs, artists, albums, and recent listens</li>
                    <li><strong>Featured Content:</strong> Showcase your favorite music by staring songs and discover what your friends are listenings to on the friends page</li>
                    <li><strong>Social Features:</strong> Connect with friends, share your music taste with rating and reviewing songs</li>
                </ul>
            </div>

            <div className="about-section">
                <h2>Privacy & Security</h2>
                <p>We use Spotify's secure OAuth 2.0 authentication to access your listening data. We never store your Spotify password, and you can revoke access at any time through your Spotify account settings.</p>
                <p>For more information about how Spotify handles your data, please review{' '}
                    <a
                        href="https://www.spotify.com/us/privacy"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="spotify-link"
                    >
                        Spotify's Privacy Policy
                    </a>
                    {' '}and{' '}
                    <a
                        href="https://www.spotify.com/us/legal/privacy-policy/#s3"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="spotify-link"
                    >
                        Third-Party Application Privacy
                    </a>.
                </p>
            </div>

            <div className="about-section">
                <h2>Team: Auralytics</h2>
                <p><strong>Amanda Ngo</strong> - Team Leader, Frontend Desktop Developer</p>
                <p><strong>Julie To</strong> - Frontend Mobile Develop</p>
                <p><strong>Vincent Chu</strong> - Backend Developer</p>
                <p><strong>Esther Brandwein</strong> - Backend Developer</p>
                <p><strong>Kevin Lee</strong> - Backend Developer</p>
            </div>

            <div className="about-section">
                <h2>Project Github link!</h2>
                <p>
                    <a
                        href="https://github.com/21vincentchu/spotify-music-app"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="spotify-link"
                    >
                        GitHub
                    </a>
                </p>
            </div>
        </div>
        <Footer />
    </div>
  );
}

export default AboutPage;
