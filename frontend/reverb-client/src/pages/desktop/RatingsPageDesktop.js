import Footer from "../../components/shared/Footer";
import { useState } from "react";

function RatingsPage() {

  const [myFeaturedTab, setMyFeaturedTab] = useState('songs');

  return (
    <div className="recommendations-page">
          <div className="type-tabs">
            <button className="type-button">Ratings</button>
            <button className="type-button">Reviews</button>
          </div>
        <div className="ratings-container round-outline blue-box-shadow">
          <div className="featured-tabs">
              <button
                className={myFeaturedTab === 'songs' ? 'active' : ''}
                onClick={() => setMyFeaturedTab('songs')}
              >
                Songs
              </button>
              <button
                className={myFeaturedTab === 'albums' ? 'active' : ''}
                onClick={() => setMyFeaturedTab('albums')}
              >
                Albums
              </button>
            </div>
        </div>
        <Footer />
    </div>
  )
}

export default RatingsPage;