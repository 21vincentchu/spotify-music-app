import Footer from "../../components/shared/Footer";
import { use, useState } from "react";
import { useEffect } from "react";
import axios from "axios";
import config from "../../config";
import { Link } from "react-router-dom";
import RatedSongComponentDesktop from "../../components/desktop/RatedSongComponentDesktop";

function RatingsPage() {

  const [myFeaturedTab, setMyFeaturedTab] = useState('songs');
  const [typeTab, setTypeTab] = useState('ratings');
  const [songRatings, setSongRatings] = useState([]);

  useEffect(() => {  
    getSongRatings();
  }, []);

  const getSongRatings = async () => {

     //get all song ratings for user
     try {
      const response = await axios.get(
          `${config.API_URL}/api/ratings/all-songs`,
          { withCredentials: true }
      );
        console.log('Songs found:', response.data);
        setSongRatings(response.data);
      } catch (error) {
          console.error('Error fetching data:', error);
      }
  };


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

            
            {myFeaturedTab === 'songs' && typeTab == 'ratings' && (
              songRatings.map((rating) => (
                <RatedSongComponentDesktop
                  key={rating.spotifyTrackId}
                  songData={rating}
                />
              ))
            )}

            {myFeaturedTab === 'songs' && typeTab == 'reviews' && (
              songRatings.map((rating) => (
                <div className="song-component">
                  <img className="circle stats-circle" src={rating?.imageUrl} />
                  <div className="song-info">
                      <p className="song-name">
                          <Link 
                          to={`/ratings/${rating?.spotifyTrackId}`}
                          >
                              {rating?.songName}
                          </Link>
                      </p>
                      <p className="song-name">{rating?.displayName}</p>
                      <p className="artist-name">{rating?.artistName}</p>
                      <p className="round-outline">{rating?.comment}</p>

                  </div>
              </div>
              ))
            )}

        </div>
        <Footer />
    </div>
  )
}

export default RatingsPage;