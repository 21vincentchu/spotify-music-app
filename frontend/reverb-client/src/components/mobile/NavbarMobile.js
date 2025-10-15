import { Link } from "react-router-dom";

// import icons
import recSongs from "../../icons/MusicIcon.png"
import graphStats from "../../icons/StatsIcon.png"
import houseButton from "../../icons/HomeIcon.png"
import friendButton from "../../icons/FriendsIcon.png"
import ratingsButton from "../../icons/RatingsIcon.png"


function NavbarMobile() {
    return (
    <nav>
        <Link to="/recommendations">
            <img src={recSongs} alt="Recommended Songs" className="nav-icon"/>
        </Link>
        <Link to="/statistics">
            <img src={graphStats} alt="Statistics" className="nav-icon"/>
        </Link>
        <Link to="/home">
            <img src={houseButton} alt="Home" className="nav-icon"/>
        </Link>
        <Link to="/friends">
            <img src={friendButton} alt="Friends" className="nav-icon"/>
        </Link>
        <Link to="/ratings">
            <img src={ratingsButton} alt="Ratings" className="nav-icon"/>
        </Link>

    </nav>
    );
}


export default NavbarMobile;