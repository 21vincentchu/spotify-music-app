import { Link, NavLink } from "react-router-dom";


function NavbarDesktop() {
  return (
    <nav>
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
    </nav>
  );
}

export default NavbarDesktop;