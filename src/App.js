import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import './styles/index.css';
import Header from './partials/Header';
import AuthPage from './pages/AuthPage';
import Lobbies from './partials/Lobbies';
import HomePage from './pages/HomePage';
import LobbyPage from './pages/LobbyPage';

function App() {

  return (
    <Router>
        <Header />
        <div className='content'>
          <Routes>
            
            <Route path="/" element={<Navigate to="/home" />} />
            <Route path="/home" element={<HomePage />} />

            <Route path="/login" element={<AuthPage mode="login" />} />
            <Route path="/register" element={<AuthPage mode="register" />} />

            <Route path="/lobby/:player1/:player2" element={<LobbyPage />} /> 
            <Route path="/lobby/:player1" element={<LobbyPage />} /> 

          </Routes>
        </div>
    </Router>
  );
};

export default App;
