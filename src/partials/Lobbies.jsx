import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as signalR from '@microsoft/signalr';
import '../styles/lobbies.css';
import { useAuth } from '../contexts/AuthContext';

const viewsEnum = {
    selectLobby: 0,
    createLobby: 1,
    joinLobby: 2
}

const Lobbies = () => {

    const { userData } = useAuth();
    const { username: playerName } = userData;
    const [isConnected, setIsConnected] = useState(false);
    const [hubConnection, setHubConnection] = useState(null);
    const [lobbies, setLobbies] = useState([]);
    const accessToken = localStorage.getItem('jwtToken');
    const [viewType, setViewType] = useState(viewsEnum.selectLobby);

    const navigate = useNavigate();

    useEffect(() => {
        updateLobbies();
    }, []);

    const updateLobbies = () => {

        console.log("my token: ", accessToken);

        const connection = new signalR.HubConnectionBuilder()
            .withUrl(`https://localhost:7093/lobbyhub?authorization=${accessToken}`, {
                skipNegotiation: true,
                transport: signalR.HttpTransportType.WebSockets,
            })
            .configureLogging(signalR.LogLevel.Information)
            .build();

        connection.on("UpdateLobbies", (updatedLobbies) => {

            console.log(updatedLobbies);
            setLobbies(updatedLobbies);
        });

        connection.on("StartGame", (gameStart) => {
            console.log("gameStart: ", gameStart);
            navigate(`/lobby/${gameStart.gameId}`, { state: { gameStart: gameStart }});
        });
        connection.on("LobbyError", (error) => {
            console.log("Något gick fett snett: ", error);
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
    }

    const createLobby = () => {

        if (!hubConnection && !playerName)
            return;

        hubConnection.invoke("CreateLobby")
            .then(() => {
                setViewType(viewsEnum.createLobby);
            })
            .catch("Error creating lobby: ", console.error);
    };

    const joinLobby = (lobbyId) => {

        if (!hubConnection || !playerName){
            alert("Ajjabajja, du måste logga in");
            return;
        }
        
        hubConnection.invoke("JoinLobby", lobbyId)
            .then(() => {
                console.log("lobbyId: ", lobbyId);
                setViewType(viewsEnum.joinLobby);
            })
            .catch((error) => {
                console.error("Error joining lobby: ", error);
            });
    };

    return(
        <div className='lobbies-wrapper'>
            <h2>Lobbies</h2>
            <div className='lobbies-container'>
                <div className='lobbies-create'>
                    {playerName ? (
                        <button onClick={createLobby} className='lobbies-create-btn'>Create Lobby</button>
                    ) : (
                        <div>You need to log in to create a lobby.</div>
                    )}
                </div>
                {isConnected ? (
                    (() => {
                        switch(viewType) {
                            case viewsEnum.selectLobby:
                                return(
                                    <ul className='lobbies-list'>
                                    {lobbies.map(lobby => (
                                        <div className='lobbies-list-item-container' key={lobby.gameId}>
                                            <button key={lobby.gameId} className='lobbies-list-item-lobby' onClick={() => joinLobby(lobby.gameId)}>
                                                {lobby.creator}'s Lobby
                                            </button>
                                            {/* <div className='lobbies-list-item-pop'>{lobby.playerCount}/2</div> */}
                                        </div>
                                    ))}
                                    </ul>
                                )
                            case viewsEnum.createLobby:
                                return <p>Waiting for player to join</p>
                            case viewsEnum.joinLobby:
                                return <p>Joining...</p>
                        }
                    })()
                ) : (
                    <p>Not Connected</p>
                )}
            </div>
        </div>
    );
};

export default Lobbies;




// const joinLobby = (lobbyId) => {
//     console.log("HEJ");
//     if (!hubConnection || !playerName){
//         return
//     }

//     hubConnection.invoke("JoinLobby", playerName, lobbyId)
//         .then(() => {
//             navigate(`/lobby/${playerName}`);
//         })
//         .catch(error => {
//             console.error("Join lobby error");
//         });
// };