import { Link } from "react-router-dom";


function NavbarDesktop() {
  return (
    <nav>
        <Link to="/home">Home</Link>
        <Link to="/ratings">Ratings</Link>
        <Link to="/statistics">Statistics</Link>
        <Link to="/recommendations">Recommendation</Link>
        <Link to="/friends">Friends</Link>
    </nav>
  );
}

export default NavbarDesktop;