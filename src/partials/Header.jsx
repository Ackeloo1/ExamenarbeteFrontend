import '../styles/header.css';
import '../styles/globals.css';
import React, { useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import HomeLogo from '../images/shotgunlogo.png';
import { useGameContextInfo } from '../contexts/GameInfoContext';
import * as signalR from '@microsoft/signalr';

const Header = () => {

    const { userData, logout } = useAuth();
    //const accessToken = userData.jwtToken;

    const { username } = userData;
    //const { gameContextInfo, setGameContextInfo } = useGameContextInfo();
    //console.log("gameContextInfo in header: ", gameContextInfo);

    // const connection = useRef(null);

    // useEffect(() => {
    //     connection.current = new signalR.HubConnectionBuilder()
    //         .withUrl(`https://localhost:7093/lobbyhub?authorization=${accessToken}`, {
    //             skipNegotiation: true,
    //             transport: signalR.HttpTransportType.WebSockets,
    //         })
    //         .configureLogging(signalR.LogLevel.Information)
    //         .build();

    //     connection.current.start();

    //     return () => {
    //         if (connection.current.state === signalR.HubConnectionState.Connected) {
    //             connection.current.stop()
    //                 .then(() => console.log("SignalR connection stopped"))
    //                 .catch(error => console.error("Error stopping SignalR connection: ", error));
    //         }
    //     };
    // }, []);

    // const LeaveLobby = () => {
    //     if (connection.current && gameContextInfo) {

    //         connection.current.invoke("LeaveLobby", gameContextInfo != null ? gameContextInfo.gameId : "")
    //             .then(() => {
    //                 setGameContextInfo(null);
    //             })
    //             .catch (error => {
    //                 console.error("Error leaving lobby: ", error);
    //             }); 
    //     }
    // }

    return(
        <div className="header">
                <div className='header-logo-wrapper'>
                    <NavLink to="/home" className='header-logo-container'>
                        <img className="home-logo" src={HomeLogo} alt="hemligt" />
                    </NavLink>

                    <div className='header-title'>Shotgun Roulette</div>
                </div>
                {username ? (
                    <div className='header-welcome-container'>
                        <div className='header-welcome-message'>Welcome, {username}</div>
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



