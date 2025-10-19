import axios from 'axios';
import { useEffect, useState } from 'react';

function SignInPage() {

    const [loggedIn, setLoggedIn] = useState(false);

    useEffect(() => {   
        checkStatus();
    }, [loggedIn]);


    const checkStatus = async () => {       
        try{
            const res = await axios.get('http://localhost:8000/api/auth/status', { 
                withCredentials: true 
            });
        }catch (err){
            console.error('Error checking login status:', err);
        }
    }

    const handleLogin = async () => {
        try {
            const res = await axios.get('http://localhost:8000/api/login', { 
                withCredentials: true 
            });
            
            // Redirect user to Spotify's authorization page
            window.location.href = res.data.auth_url;
        } catch(err) {
            console.error('Login initiation failed:', err);
        }
    }

    return(
        <div>
            <h1>Sign In</h1>
            <button onClick={handleLogin}>Sign In with Spotify</button>
            <button onClick={checkStatus}>Check Login Status</button>
            {loggedIn ? <p>Logged In </p> : <p>NOT Logged In </p>}
        </div>
    )
}

export default SignInPage;