import React, { createContext, useState, useEffect, useContext } from 'react';
import * as signalR from '@microsoft/signalr';
import { useAuth } from './AuthContext';

export const LobbyHubContext = createContext();

export const LobbyHubProvider = ({ children }) => {
    const { userData } = useAuth();
    const accessToken = userData.jwtToken;
    const [isConnected, setIsConnected] = useState(false);
    const [hubConnection, setHubConnection] = useState(null);
    const [lobbies, setLobbies] = useState([]);
    const [gameInfo, setGameInfo] = useState(null);

    useEffect(() => {
        const connection = new signalR.HubConnectionBuilder()
            .withUrl(`https://localhost:7093/lobbyhub?authorization=${accessToken}`, {
                skipNegotiation: true,
                transport: signalR.HttpTransportType.WebSockets,
            })
            .configureLogging(signalR.LogLevel.Information)
            .build();

        connection.on("UpdateLobbies", (updatedLobbies) => {
            setLobbies(updatedLobbies);
        });

        connection.on("StartGame", (gameStart) => {
            console.log("gameStart: ", gameStart);
            setGameInfo(gameStart);
        });

        connection.on("LobbyError", (error) => {
            console.error("Lobby Error: ", error);
        });

        connection.start()
            .then(() => {
                setHubConnection(connection);
                setIsConnected(true);

                connection.invoke("GetLobbies")
                    .catch(error => console.error("Error invoking GetLobbies: ", error));
            })
            .catch(error => console.error("Error starting connection: ", error));

        return () => {
            if (connection.state === signalR.HubConnectionState.Connected) {
                connection.stop()
                    .then(() => console.log("SignalR connection stopped"))
                    .catch(error => console.error("Error stopping SignalR connection: ", error));
            }
        };
    }, [accessToken]);

    return (
        <LobbyHubContext.Provider value={{ isConnected, hubConnection, lobbies, gameInfo }}>
            {children}
        </LobbyHubContext.Provider>
    );
};