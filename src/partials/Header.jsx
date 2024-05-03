import '../styles/header.css';
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import HomeLogo from '../images/shotgunlogo.png';

const Header = () => {
    const { userData, logout } = useAuth();
    const { username } = userData;
    return(
        <div className="header">
                <NavLink to="/home" className='header-logo-container'>
                    <img className="home-logo" src={HomeLogo} alt="hemligt" />
                </NavLink>

                {username ? (
                    <div className='header-welcome-container'>
                        <div>Welcome, {username}</div>
                        <button className='account-button' onClick={logout}>Logout</button>
                    </div>
                ) : (
                    <div className='header-login-container'>
                        <NavLink to="/login" ><button className='account-button'>Login</button></NavLink>
                        <NavLink to="/register" ><button className='account-button'>Register</button></NavLink>
                    </div>
            )}
        </div>
    );
};

export default Header;