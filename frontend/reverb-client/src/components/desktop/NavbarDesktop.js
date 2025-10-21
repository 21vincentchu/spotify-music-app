import { Link, NavLink } from "react-router-dom";
import tempLogo from "../../assets/pngegg.png";
import tempProfile from "../../assets/istockphoto-2171382633-612x612.jpg";

function NavbarDesktop() {
  return (
    <nav>
      <img src={tempLogo} className="nav-logo" />
      
      <div className="nav-links">
        <NavLink to="/home" className={({ isActive }) => (isActive ? "active" : "")}>
          Home
        </NavLink>
        <NavLink to="/ratings" className={({ isActive }) => (isActive ? "active" : "")}>
          Ratings
        </NavLink>
        <NavLink to="/statistics" className={({ isActive }) => (isActive ? "active" : "")}>
          Statistics
        </NavLink>
        <NavLink to="/recommendations" className={({ isActive }) => (isActive ? "active" : "")}>
          Recommendation
        </NavLink>
        <NavLink to="/friends" className={({ isActive }) => (isActive ? "active" : "")}>
          Friends
        </NavLink>
      </div>
      
      <img src={tempProfile} className="nav-profile" />
    </nav>
  );
}

export default NavbarDesktop;