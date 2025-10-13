import SongComponent from "../../components/shared/SongComponent";

function HomeDesktop() {
  return (
    <div>
        <div className="home-recommended">
            <h2>Recommended</h2>
            <SongComponent />
            <SongComponent />
            <SongComponent />
            <SongComponent />
            <SongComponent />
            <SongComponent />
            <SongComponent />
            <SongComponent />

        </div>
        <div>
            <h2>Statistics</h2>

        </div>

    </div>
    )   
}

export default HomeDesktop;