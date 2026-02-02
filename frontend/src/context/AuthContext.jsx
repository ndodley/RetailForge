import { createContext, useContext, useState, useEffect } from 'react';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); // <-- Add loading state

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/auth/me', {
                    method: 'GET',
                    credentials: 'include' // ✅ Ensures session cookies are sent
                });

                if (!res.ok) {
                    // If 401 Unauthorized, do not log error (user is simply not logged in)
                    if (res.status !== 401) {
                        throw new Error(`Error: ${res.status} ${res.statusText}`);
                    }
                    setUser(null);
                    setLoading(false); // <-- Set loading false even if not logged in
                    return;
                }

                const data = await res.json();
                if (data.user) setUser(data.user);
            } 
            catch (error) {
                // Only log errors that are not 401 Unauthorized
                if (!error.message.includes('401')) {
                    console.error("Session retrieval failed:", error);
                }
            } finally {
                setLoading(false); // <-- Always set loading false
            }
        };

        fetchUser();
    }, []);

    const login = async (email, password) => {
        try {
            const res = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
                credentials: 'include', // Ensure session cookies are sent
            });

            // Backend returns 200 with { user: null, error: 'Invalid credentials' } for wrong logins.
            // Avoid throwing/logging for this expected case.
            if (!res.ok) {
                return null;
            }

            const data = await res.json();
            if (data?.user) {
                setUser(data.user);
                return data.user;
            }

            return null;
        } catch (error) {
            // Only unexpected failures (network/server down) should be logged.
            console.error('Login request failed:', error);
            return null;
        }
    };

    const register = async (formData) => {
        try {
            const res = await fetch('http://localhost:5000/api/users/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, role: formData.role || 'customer' }),
                credentials: 'include' // ✅ Ensures session cookies are stored
            });

            if (!res.ok) throw new Error(`Registration failed: ${res.status} ${res.statusText}`);

            const data = await res.json();
            if (data.user) {
                setUser(data.user); // ✅ Set the user state to mark them as logged in

                // Fetch session user explicitly to ensure they're authenticated
                const sessionRes = await fetch('http://localhost:5000/api/auth/me', {
                    method: 'GET',
                    credentials: 'include',
                });

                if (sessionRes.ok) {
                    const sessionData = await sessionRes.json();
                    if (sessionData.user) setUser(sessionData.user);
                }
            }
        } catch (error) {
            console.error("Registration failed:", error);
        }
    };

    const logout = async () => {
        await fetch('http://localhost:5000/api/auth/logout', { method: 'POST', credentials: 'include' }); // <-- Ensure credentials are included
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
