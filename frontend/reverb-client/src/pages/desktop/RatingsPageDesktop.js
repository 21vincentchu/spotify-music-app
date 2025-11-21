import Footer from "../../components/shared/Footer";
import { useState } from "react";
import { Rating } from '@mui/material';
import RatedSongComponentDesktop from "../../components/desktop/RatedSongComponentDesktop";

function RatingsPage() {

  const [myFeaturedTab, setMyFeaturedTab] = useState('songs');
  const [typeTab, setTypeTab] = useState('ratings');

  return (
    <div className="recommendations-page">
          <div className="type-tabs">
            <button className={typeTab === 'ratings' ? 'active' : ''}
             onClick={() => setTypeTab('ratings')}
            >Ratings
            </button>

            <button className={typeTab === 'reviews' ? 'active' : ''}
             onClick={() => setTypeTab('reviews')}
            >Reviews
            </button>
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

            <div>
              <RatedSongComponentDesktop />
            </div>


        </div>
        <Footer />
    </div>
  )
}

export default RatingsPage;