import Footer from "../../components/shared/Footer";
import { useState } from "react";
import { useEffect } from "react";
import axios from "axios";
import config from "../../config";
import { Link } from "react-router-dom";
import RatedSongComponentDesktop from "../../components/desktop/RatedSongComponentDesktop";

function RatingsPage() {

  const [myFeaturedTab, setMyFeaturedTab] = useState('songs');
  const [typeTab, setTypeTab] = useState('ratings');
  const [songRatings, setSongRatings] = useState([]);
  const [albumRatings, setAlbumRatings] = useState([]);
  const [friendsRatings, setFriendsRatings] = useState([]);

  useEffect(() => {
    getSongRatings();
    getAlbumRatings();
    getFriendsRatings();
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

  const getAlbumRatings = async () => {
    try {
      const response = await axios.get(
          `${config.API_URL}/api/ratings/all-albums`,
          { withCredentials: true }
      );
        console.log('Albums found:', response.data);
        setAlbumRatings(response.data);
      } catch (error) {
          console.error('Error fetching data:', error);
      }
  };

  const getFriendsRatings = async () => {
    try {
      const response = await axios.get(
        `${config.API_URL}/api/ratings/friends`,
        { withCredentials: true }
      );
      console.log('Friends ratings found:', response.data);
      setFriendsRatings(response.data);
    } catch (error) {
      console.error('Error fetching friends ratings:', error);
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
              <button
                className={myFeaturedTab === 'friends' ? 'active' : ''}
                onClick={() => setMyFeaturedTab('friends')}
              >
                Friends
              </button>
            </div>


            <div className="ratings-list">
            
            {myFeaturedTab === 'songs' && typeTab === 'ratings' && (
              songRatings.map((rating) => (
                <RatedSongComponentDesktop
                  key={rating.spotifyTrackId}
                  songData={rating}
                  type={"song"}
                />
              ))
            )}

            {myFeaturedTab === 'albums' && typeTab === 'ratings' && (
              albumRatings.map((rating) => (
                <RatedSongComponentDesktop
                  key={rating.spotifyAlbumId}
                  songData={rating}
                  type={"album"}
                />
              ))
            )}

            {myFeaturedTab === 'songs' && typeTab === 'reviews' && (
              songRatings
                .filter(rating => rating.comment && rating.comment.trim() !== "")
                .map((rating) => (
                  <div className="song-component" key={rating.spotifyTrackId}>
                    <img className="circle stats-circle" src={rating?.imageUrl} alt="{rating.spotifyTrackId}" />
                    <div className="song-info">
                        <p className="song-name">
                            <Link to={`/ratings/song/${rating?.spotifyTrackId}`}>
                                {rating?.songName}
                            </Link>
                        </p>
                        <p className="song-name">{rating?.displayName}</p>
                        <p className="artist-name">{rating?.artistName}</p>
                        <p className="round-outline ratings-comment">{rating?.comment}</p>
                    </div>
                  </div>
                ))
            )}

            {myFeaturedTab === 'albums' && typeTab === 'reviews' && (
              albumRatings
                .filter(rating => rating.comment && rating.comment.trim() !== "")
                .map((rating) => (
                  <div className="song-component" key={rating.spotifyTrackId}>
                    <img className="circle stats-circle" src={rating?.imageUrl} alt="{rating.spotifyAlbumId}" />
                    <div className="song-info">
                        <p className="song-name">
                            <Link to={`/ratings/album/${rating?.spotifyAlbumId}`}>
                                {rating?.albumName}
                            </Link>
                        </p>
                        <p className="song-name">{rating?.displayName}</p>
                        <p className="artist-name">{rating?.artistName}</p>
                        <p className="round-outline ratings-comment">{rating?.comment}</p>
                    </div>
                  </div>
                ))
            )}

            {myFeaturedTab === 'friends' && typeTab === 'ratings' && (
              friendsRatings.length > 0 ? (
                friendsRatings.map((rating) => (
                  <RatedSongComponentDesktop
                    key={`${rating.type}-${rating.spotifyTrackId || rating.spotifyAlbumId}-${rating.userName}`}
                    songData={rating}
                    type={rating.type}
                  />
                ))
              ) : (
                <p className="empty-message">No friends have rated anything yet.</p>
              )
            )}

            {myFeaturedTab === 'friends' && typeTab === 'reviews' && (
              friendsRatings.filter(rating => rating.comment && rating.comment.trim() !== "").length > 0 ? (
                friendsRatings
                  .filter(rating => rating.comment && rating.comment.trim() !== "")
                  .map((rating) => (
                    <div className="song-component" key={`${rating.type}-${rating.spotifyTrackId || rating.spotifyAlbumId}-${rating.userName}`}>
                      <img className="circle stats-circle" src={rating?.imageUrl} alt={rating.type} />
                      <div className="song-info">
                          <p className="song-name">
                              <Link to={`/ratings/${rating.type}/${rating.type === 'song' ? rating.spotifyTrackId : rating.spotifyAlbumId}`}>
                                  {rating.type === 'song' ? rating.songName : rating.albumName}
                              </Link>
                          </p>
                          {/* <p className="song-name">{rating?.displayName || rating?.userName}</p> */}
                          <p className="artist-name">{rating?.artistName}</p>
                          <p className="round-outline ratings-comment">{rating?.comment}</p>
                      </div>
                    </div>
                  ))
              ) : (
                <p className="empty-message">No friends have written reviews yet.</p>
              )
            )}

            </div>

        </div>
        <Footer />
    </div>
  )
}

export default RatingsPage;