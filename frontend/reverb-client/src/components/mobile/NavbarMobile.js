import { Link, useLocation } from "react-router-dom";

function NavbarMobile() {
  const location = useLocation();

  return (
    <nav className="navbar-mobile">
      <Link to="/recommendations" aria-label="Recommendations" className={location.pathname === "/recommendations" ? "nav-link-active" : ""}>
        <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 18V5l12-2v13"></path>
          <circle cx="6" cy="18" r="3"></circle>
          <circle cx="18" cy="16" r="3"></circle>
        </svg>
      </Link>
      <Link to="/statistics" aria-label="Statistics" className={location.pathname === "/statistics" ? "nav-link-active" : ""}>
        <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="20" x2="18" y2="10"></line>
          <line x1="12" y1="20" x2="12" y2="4"></line>
          <line x1="6" y1="20" x2="6" y2="14"></line>
        </svg>
      </Link>
      <Link to="/home" aria-label="Home" className={location.pathname === "/home" ? "nav-link-active" : ""}>
        <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
      </Link>
      <Link to="/friends" aria-label="Friends" className={location.pathname === "/friends" ? "nav-link-active" : ""}>
        <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
      </Link>
      <Link to="/ratings" aria-label="Ratings" className={location.pathname === "/ratings" ? "nav-link-active" : ""}>
        <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
        </svg>
      </Link>
    </nav>
  );
}

export default NavbarMobile;
