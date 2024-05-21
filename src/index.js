import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import reportWebVitals from './reportWebVitals';
import './styles/index.css';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import { AuthProvider } from './contexts/AuthContext';
import './styles/index.css';
import { GameInfoProvider } from './contexts/GameInfoContext';
import { LobbyHubProvider } from './contexts/LobbyHubContext';


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <AuthProvider>
        <GameInfoProvider>
            <LobbyHubProvider>
                <App />
            </LobbyHubProvider>
        </GameInfoProvider>
    </AuthProvider>
);






reportWebVitals();
