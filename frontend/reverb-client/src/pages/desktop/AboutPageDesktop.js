import { NavLink } from "react-router-dom";
import tempLogo from "../../assets/pngegg.png";

function AboutPage() {
  return (
    <div className="about-page page">
      {/* Navigation */}
        <nav className="splash-nav">
            <a href="/">
            <img src={tempLogo} className="nav-logo" alt="Logo" />
            </a>
            <div className="nav-links">
            <NavLink
                to="/about"
                className={({ isActive }) => (isActive ? "active" : "")}
            >
                About
            </NavLink>
            </div>
        </nav>
        <div>
            <div className="">
                <h1>Spotify Login</h1>
                <p>This is how Login works.</p>
            </div>
            <div>
                <h1>Security</h1>
                <p>This is how your data is protected.</p>

            </div>
            <div>
                <h1>Developers</h1>
                <p>Amanda Ngo - Frontend</p>
                <p>Vinny Chu - Backend</p>
                <p>Esther Brandwein - Backend</p>
                <p>Julie To- Frontend</p>
                <p>Kevin Lee - Backend</p>

            </div>
        </div>
    </div>
  );
}

export default AboutPage;
