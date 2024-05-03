import { React, createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [userData, setUserData] = useState({ username: '', JwtToken: '' });

    useEffect(() => {
        const storedToken = localStorage.getItem('jwtToken');
        if (storedToken) {
            setUserData({ ...userData, jwtToken: storedToken });
        }
    }, []);

    const login = (username, jwtToken) => {
        localStorage.setItem('jwtToken', jwtToken);
        setUserData({ username, jwtToken });
    };

    const logout = () => {
        localStorage.removeItem('jwtToken');
        setUserData({ username: '', jwtToken: '' });
    }

    return (
        <AuthContext.Provider value={{ userData, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);