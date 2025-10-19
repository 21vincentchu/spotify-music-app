import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userName, setUserName] = useState(null);
    const [loading, setLoading] = useState(true);

    const checkAuthStatus = async () => {
        try {
            const res = await axios.get('http://localhost:8000/api/auth/status', {
                withCredentials: true
            });
            
            if (res.data.authenticated) {
                setIsAuthenticated(true);
                setUserName(res.data.userName);
            } else {
                setIsAuthenticated(false);
                setUserName(null);
            }
        } catch(err) {
            console.error('Auth status check failed:', err);
            setIsAuthenticated(false);
            setUserName(null);
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            await axios.post('http://localhost:8000/api/logout', {}, {
                withCredentials: true
            });
            setIsAuthenticated(false);
            setUserName(null);
        } catch(err) {
            console.error('Logout failed:', err);
        }
    };

    useEffect(() => {
        checkAuthStatus();
    }, []);

    return (
        <AuthContext.Provider value={{ 
            isAuthenticated, 
            userName, 
            loading, 
            checkAuthStatus,
            logout 
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}