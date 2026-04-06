import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem('lumina_token'));
    const [user, setUser] = useState(() => {
        try {
            const stored = localStorage.getItem('lumina_user');
            return stored ? JSON.parse(stored) : null;
        } catch { return null; }
    });

    useEffect(() => {
        if (token) {
            localStorage.setItem('lumina_token', token);
        } else {
            localStorage.removeItem('lumina_token');
            localStorage.removeItem('lumina_user');
        }
    }, [token]);

    useEffect(() => {
        if (user) {
            localStorage.setItem('lumina_user', JSON.stringify(user));
        }
    }, [user]);

    const login = (newToken, userData) => {
        setToken(newToken);
        setUser(userData);
        localStorage.setItem('lumina_user', JSON.stringify(userData));
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('lumina_token');
        localStorage.removeItem('lumina_user');
    };

    const updateUserLocal = (updates) => {
        if (user) {
            const updated = { ...user, ...updates };
            setUser(updated);
            localStorage.setItem('lumina_user', JSON.stringify(updated));
        }
    };

    return (
        <AuthContext.Provider value={{ token, user, login, logout, updateUserLocal }}>
            {children}
        </AuthContext.Provider>
    );
};
