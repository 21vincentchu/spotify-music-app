import { useParams } from 'react-router-dom';


function RatingDetailPageDesktop() {

    const { spotifyId } = useParams();
    
    function isRated(){
        //call get rating route, if there arent results return false

        //if result is found return true
        return false;
    }





    return (
        <div className='page'>
            {isRated() ? (
                <div>
                    <p>Displaying detailed rating information for the item with Spotify ID: {spotifyId}</p>
                </div>
            ) : (
                <div>
                    <p>You have not rated {spotifyId} yet. Please submit your rating!</p>

                </div>
            )}
        </div>
    );  
}

export default RatingDetailPageDesktop;