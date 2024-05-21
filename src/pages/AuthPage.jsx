import { React, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../partials/Header";
import { useAuth } from '../contexts/AuthContext';
import '../styles/authPage.css';

const AuthPage = ({ mode }) => {
    const apiUrl = 'https://localhost:7093/ShotgunRoulette/Player';
    const navigate = useNavigate();
    const { login } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const authRequest = async (mode, password) => {
        const url = mode === 'login' ? apiUrl + '/LoginPlayer' : apiUrl + '/RegisterPlayer';

        return fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: username,
                password: password
            }),
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await authRequest(mode, password);
            const data = await response.json();
    
            if (data.success) {
                if (mode === 'register') {
                    console.log("Register data: ", data.message);
                    navigate('/login');
                } else if (mode === 'login') {
                    login(username, data.jwtToken);
                    console.log("Login data: ", username, data.jwtToken);
                    navigate('/home');
                }
            }
        } catch (error) {
            console.log("Auth error: ", error);
        }
        setUsername('');
        setPassword('');
    };

    return(
        <div className="auth-container">
            <form onSubmit={handleSubmit} className="auth-wrapper">
                <div className="auth-mode-label">{mode === 'login' ? 'Login' : 'Register'}</div>

                <div className="auth-inputs">
                    <div className="input-container">
                        <label className="auth-info-label">Username:</label>
                        <input
                            className="auth-input"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                    <div className="input-container">
                        <label className="auth-info-label">Password:</label>
                        <input
                            className="auth-input"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                </div>
                <button type="submit" className="auth-submit-button">{mode === 'login' ? 'Login' : 'Register'}</button>
            </form>
        </div>
    );
};

export default AuthPage;