import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ProfileButtonMobile from "../../components/mobile/ProfileButtonMobile";
import { useAuth } from "../../context/AuthContext";

function AboutPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [showDetailedGuide, setShowDetailedGuide] = useState(false);

  return (
    <div className="mobile-layout">
      <ProfileButtonMobile />
      <div className="mobile-content about-mobile-content">
        <div className="about-page page">
          <div className="about-content">
              <button
                onClick={() => navigate(isAuthenticated ? '/home' : '/')}
                className="back-button"
              >
                ← {isAuthenticated ? 'Back to Home' : 'Back to Sign In'}
              </button>

              <div className="about-section">
                  <h1>Reverb - A Social Music Analytics Platform</h1>
                  <p>A social music analytics platform that transforms your Spotify listening data into shareable insights! Share your favorite songs, artists, albums. Review songs and albums as well! Check out our{' '}
                      <a
                          href="https://github.com/21vincentchu/spotify-music-app"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="spotify-link"
                      >
                          GitHub repository
                      </a>!
                  </p>
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

              <div className="about-section fun-info-section">
                  <button
                      className="fun-info-toggle"
                      onClick={() => setShowDetailedGuide(!showDetailedGuide)}
                  >
                      {showDetailedGuide ? '▼' : '▶'} Click here for extra fun info!
                  </button>

                  {showDetailedGuide && (
                      <div className="detailed-guide">
                          <h3>
                              <svg className="guide-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                              </svg>
                              Home Page
                          </h3>
                          <p>Discover your musical journey! View your recently played songs and check out your personalized stats on the right side. Click any song to add it to your featured list and share it with friends. You can also tap directly on a song to rate and review it.</p>

                          <h3>
                              <svg className="guide-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                              </svg>
                              Ratings Page
                          </h3>
                          <p>Search for any song or album you want to rate and review from Spotify's entire catalog. Browse through everything you've reviewed and rated, or check out the Friends tab to see what your friends have been enjoying. Click on any reviewed song for detailed information, including a discussion thread of other users' reviews and the average rating from the community.</p>

                          <h3>
                              <svg className="guide-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <line x1="18" y1="20" x2="18" y2="10"></line>
                                  <line x1="12" y1="20" x2="12" y2="4"></line>
                                  <line x1="6" y1="20" x2="6" y2="14"></line>
                              </svg>
                              Statistics Page
                          </h3>
                          <p>Dive deep into your listening patterns! See your top songs, artists, and albums from the last month, 6 months, or entire year. You can star and review your favorites directly from this page to share them with your network.</p>

                          <h3>
                              <svg className="guide-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M9 18V5l12-2v13"></path>
                                  <circle cx="6" cy="18" r="3"></circle>
                                  <circle cx="18" cy="16" r="3"></circle>
                              </svg>
                              Recommendations Page
                          </h3>
                          <p>Showcase your musical taste! View all the songs, artists, and albums you've starred and featured for your friends to discover. You can unstar items anytime to update your featured collection. Plus, explore what your friends have featured to find new music you might love.</p>

                          <h3>
                              <svg className="guide-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                  <circle cx="9" cy="7" r="4"></circle>
                                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                              </svg>
                              Friends Page
                          </h3>
                          <p>Build your music community! Search and connect with friends to see their musical preferences. Once connected, dive into their recently played tracks and explore all their ratings and reviews.</p>

                          <h3>
                              <svg className="guide-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                  <circle cx="12" cy="7" r="4"></circle>
                              </svg>
                              Profile (Top Right)
                          </h3>
                          <p>Manage your account from the profile menu in the top right corner. Customize your display name, view your account statistics, and access settings. You can also log out or delete your account if needed.</p>
                      </div>
                  )}
              </div>

              <div className="about-section">
                  <h2>Technology Stack</h2>
                  <div className="tech-stack-visual">
                      <div className="stack-layer frontend">
                          <span className="layer-label">Frontend</span>
                          <span className="layer-tech">React • React Router • Material UI • Chart.js • CSS • Axios</span>
                      </div>
                      <div className="stack-layer backend">
                          <span className="layer-label">Backend</span>
                          <span className="layer-tech">Flask (Python) • Flask-CORS • Flask-Session • APScheduler</span>
                      </div>
                      <div className="stack-layer api">
                          <span className="layer-label">APIs & Integration</span>
                          <span className="layer-tech">Spotify Web API • Spotipy</span>
                      </div>
                      <div className="stack-layer auth">
                          <span className="layer-label">Authentication</span>
                          <span className="layer-tech">OAuth 2.0</span>
                      </div>
                      <div className="stack-layer infrastructure">
                          <span className="layer-label">Infrastructure</span>
                          <span className="layer-tech">Digital Ocean (Hosting) • Cloudflare (DNS/CDN) • Squarespace (Domain)</span>
                      </div>
                      <div className="stack-layer database">
                          <span className="layer-label">Database</span>
                          <span className="layer-tech">MySQL (Digital Ocean) • mysql-connector-python</span>
                      </div>
                  </div>
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
                  <h2>Logo Design</h2>
                  <p>Logo commissioned by{' '}
                      <a
                          href="https://www.instagram.com/xuanieha/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="spotify-link"
                      >
                          Mary Ha
                      </a>
                  </p>
              </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default AboutPage;
