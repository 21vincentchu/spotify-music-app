import axios from 'axios';
import { useEffect, useState } from 'react';

function SignInPage() {

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
            <h1>Reverb</h1>
            <button onClick={handleLogin}>Sign In with Spotify</button>
        </div>
    )
}

export default SignInPage;