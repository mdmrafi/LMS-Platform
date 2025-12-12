import { createContext, useState, useEffect } from 'react';
import { authService } from '../services';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Initialize - check if user is logged in
    useEffect(() => {
        const initAuth = async () => {
            try {
                const token = localStorage.getItem('token');
                const userData = localStorage.getItem('user');

                if (token) {
                    // Set initial user from local storage (fast load)
                    if (userData) {
                        setUser(JSON.parse(userData));
                    }

                    // Fetch fresh user data from server (validate token & get latest state)
                    try {
                        const response = await authService.getCurrentUser();
                        const freshUser = response.data.data;
                        setUser(freshUser);
                        localStorage.setItem('user', JSON.stringify(freshUser));
                    } catch (apiError) {
                        console.error('Failed to fetch fresh user data:', apiError);
                        // If header is 401, logout
                        if (apiError.response && apiError.response.status === 401) {
                            logout();
                        }
                    }
                }
            } catch (err) {
                console.error('Auth initialization error:', err);
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            } finally {
                setLoading(false);
            }
        };

        initAuth();
    }, []);

    // Login
    const login = async (credentials) => {
        try {
            setError(null);
            const response = await authService.login(credentials);
            const { token, user: userData } = response.data.data;

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);

            return { success: true, data: userData };
        } catch (err) {
            const message = err.response?.data?.message || 'Login failed';
            setError(message);
            return { success: false, message };
        }
    };

    // Register
    const register = async (userData) => {
        try {
            setError(null);
            const response = await authService.register(userData);
            const { token, user: newUser } = response.data.data;

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(newUser));
            setUser(newUser);

            return { success: true, data: newUser };
        } catch (err) {
            const message = err.response?.data?.message || 'Registration failed';
            setError(message);
            return { success: false, message };
        }
    };

    // Logout
    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    // Update user data
    const updateUser = (userData) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const value = {
        user,
        loading,
        error,
        login,
        register,
        logout,
        updateUser,
        isAuthenticated: !!user,
        isLearner: user?.role === 'learner',
        isInstructor: user?.role === 'instructor',
        isAdmin: user?.role === 'admin'
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
