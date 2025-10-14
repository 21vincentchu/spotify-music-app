import SongComponent from "../../components/shared/SongComponent";

function MobileDesktop() {
    return (
    <div className="home-page">
        <div className="home-recommended round-outline">
            <h2>Recommended</h2>
            <div className="home-recommended-songs">
                <SongComponent />
                <SongComponent />
                <SongComponent />
                <SongComponent />
                <SongComponent />
                <SongComponent />
                <SongComponent />
                <SongComponent />
            </div>
        

        </div>
        <div className="home-stats round-outline">
            <h2>Statistics</h2>

        </div>

    </div>
    )   
}

export default MobileDesktop;