import SongComponent from "../../components/shared/SongComponent";

function MobileDesktop() {
    return (
    <div className="home-page">
        <div className="home-featured">
            <h2>Featured Stats</h2>
            <p className="subtext">Top Song of the Day</p>
            <div className="home-featured-stats">
                <SongComponent />

            
                
            </div>
        

        </div>
        <div className="home-featured">
            <h2>Featured Recs</h2>
            <div className="home-featured-recs">
                <SongComponent />
            </div>

        </div>

    </div>
    )   
}

export default MobileDesktop;