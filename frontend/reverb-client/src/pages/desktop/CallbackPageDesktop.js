import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function CallbackPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { checkAuthStatus } = useAuth();

    useEffect(() => {
        const handleCallback = async () => {
            const error = searchParams.get('error');
            const success = searchParams.get('auth');

            if (error) {
                console.error('Authentication error:', error);
                alert('Authentication failed. Please try again.');
                navigate('/');
                return;
            }

            if (success === 'success') {
                // Re-check auth status to update context
                await checkAuthStatus();
                navigate('/home');
            } else {
                navigate('/');
            }
        };

        handleCallback();
    }, [searchParams, navigate, checkAuthStatus]);

    return (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <h2>Completing authentication...</h2>
            <p>Please wait while we redirect you.</p>
        </div>
    );
}

export default CallbackPage;