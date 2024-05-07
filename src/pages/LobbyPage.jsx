import { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import Shotgun from '../images/shotgunlogo.png';
import { useAuth } from '../contexts/AuthContext';
import * as signalR from '@microsoft/signalr';

const LobbyPage = () => {

    const { state } = useLocation();
    const { gameStart } = state;
    const { userData } = useAuth();
    const { username } = userData;

    const [player1Items, setPlayer1Items] = useState([]);
    const [player2Items, setPlayer2Items] = useState([]);
    const [message, setMessage] = useState("");
    const [player1Action, setPlayer1Action] = useState(0);
    const [player2Action, setPlayer2Action] = useState(0);
    const [showOptions, setShowOptions] = useState(false);
    const [selectedPlayer, setSelectedPlayer] = useState(null);
    const [playerTurn, setPlayerTurn] = useState(gameStart.players[0].name);
    const [gameInfo, setGameInfo] = useState(gameStart);

    const connection = useRef(null);
    const messageTimeoutRef = useRef(null);

    useEffect(() => {

        connection.current = new signalR.HubConnectionBuilder()
            .withUrl(`https://localhost:7093/gamehub`, {
                skipNegotiation: true,
                transport: signalR.HttpTransportType.WebSockets,
            })
            .configureLogging(signalR.LogLevel.Information)
            .build();

        connection.current.on("GameStartItems", (playerItems) => {
            console.log("Items received: ", playerItems);
            setPlayer1Items(playerItems.player1Items);
            setPlayer2Items(playerItems.player2Items);
        });

        connection.current.on("ItemUsed", (newItems) => {
            setPlayer1Items(newItems.player1Items);
            setPlayer2Items(newItems.player2Items);
            console.log("newItems: ", newItems);
        });

        connection.current.on("ItemUsedMessage", (message) => {
            console.log("message", message);
            setMessage(message);

            clearTimeout(messageTimeoutRef.current);

            messageTimeoutRef.current = setTimeout(() => {
                setMessage("");
            }, 3000);
        }); 

        connection.current.on("ShootResult", (shootResult) => {
            console.log("shootResult: ", shootResult);
            setGameInfo(shootResult);
        });

        connection.current.on("PlayerTurn", (playerTurn) => {
            console.log(playerTurn);
            setPlayerTurn(playerTurn);
        })

        connection.current.on("Error", (errorMessage) => {
            console.log(errorMessage);
            alert(errorMessage);
        })

        connection.current.start()
            .then(() => {
                connection.current.invoke("AddToGroup", gameInfo.gameId);
                connection.current.invoke("GetItemsForPlayers", gameInfo.players, gameInfo.gameId);
            })
            .catch(error => console.log("Error in gamehub: ", error));

        return () => {
            if (connection.current.state === signalR.HubConnectionState.Connected) {
                connection.current.stop()
                    .then(() => console.log("SignalR connection stopped"))
                    .catch(error => console.error("Error stopping SignalR connection: ", error));
            }
        };

    }, []);

    const itemsToDisplay = (items) => [...items, ...Array(5 - items.length).fill(null)];

    const handleItemUse = (itemId, player) => {

        var playerItems = {player1Items, player2Items};

        console.log(playerItems);

        connection.current.invoke("UseConsumable", gameInfo.gameId, playerItems, itemId, player, username );

        if(player === 1){
            player1Action != null ? setPlayer1Action(itemId) : setPlayer1Action(0);
        }
        else if(player === 2){
            player2Action != null ? setPlayer2Action(itemId) : setPlayer2Action(0);
        }
    };

    const selectPlayer = (player) => {
        setSelectedPlayer(player);
        handleShotgunShoot(player);
        setShowOptions(false);
    }

    const toggleOptions = () => {
        setShowOptions(!showOptions);
    }

    const handleShotgunShoot = (player) => {

        let bulletsCount = gameInfo.bullets.bullets;
        let blanksCount = gameInfo.bullets.blanks;
        let total = bulletsCount + blanksCount;
        
        const randomNumber = Math.floor(Math.random() * total) + 1;

        let randomBullet;
        if (randomNumber <= bulletsCount)
            randomBullet = 1;
        else
            randomBullet = 0;

        connection.current.invoke("Shoot", gameInfo, player, randomBullet, username, player1Action);

        setSelectedPlayer(null);
    }
    
    return(
        <div className="game-container">
            <div className="game-wrapper">

                <div className="player-container">
                    <h3>{gameStart.players[0].name}</h3>
                        <ul className="item-list">
                            {itemsToDisplay(player1Items).map((item, index) => (
                                <li key={index} className="item">
                                    {item ? (
                                        <button onClick={() => handleItemUse(item.id, 1)} className="item-button" disabled={username !== gameStart.players[0].name}>
                                            <img src={require(`/src/images/item_${item.id}.png`)} alt={item.name} className="item-img"/>
                                        </button>
                                    ) : (
                                        <div className="empty-item"></div>
                                    )}
                                </li>
                            ))}
                        </ul>
                    
                </div>

                <div className="shotgun-container">
                    <div className="action-message">{message}</div>
                    <div className="shotgun-button-container">
                        <button onClick={() => toggleOptions()} className="shotgun-button" disabled={playerTurn !== username}>
                            <img src={Shotgun} alt="hemligt" className="shotgun-image"/>
                        </button>

                        {showOptions && (
                            <div>
                                <button onClick={() => selectPlayer(gameInfo.players[0].name)}>Shoot Player1?</button>
                                <button onClick={() => selectPlayer(gameInfo.players[1].name)}>Shoot Player2?</button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="player-container">
                    <h3>{gameInfo.players[1].name}</h3>
                        <ul className="item-list">
                            {itemsToDisplay(player2Items).map((item, index) => (
                                <li key={index} className="item">
                                    {item ? (
                                        <button onClick={() => handleItemUse(item.id, 2)} className="item-button" disabled={username !== gameStart.players[1].name}>
                                            <img src={require(`/src/images/item_${item.id}.png`)} alt={item.name} className="item-img"/>
                                        </button>
                                    ) : (
                                        <div className="empty-item"></div>
                                    )}
                                </li>
                            ))}
                        </ul>
                </div>

            </div>
        </div>
    )
}

export default LobbyPage;

// const consumeItem = (itemId, player) => {
//     connection.current.invoke("UseConsumable", itemId, gameStart.gameId)
//         .then(() => {
//             removeItem(itemId, player);
//         })
//         .catch(error => console.error("Error invoking UseConsumable method: ", error));
// };

// if (gameStart) {
    
    //     const playerItems = gameStart.playerItems;
    
    //     const keys = Object.keys(playerItems);
    
    //     if (keys.length >= 2 && Array.isArray(playerItems[keys[0]]) && Array.isArray(playerItems[keys[1]])) {
        
        //         const player1 = {
            //             name: keys[0],
            //             items: playerItems[keys[0]] || []
            //         };
            
            //         const player2 = {
                //             name: keys[1],
                //             items: playerItems[keys[1]] || []
        //         };

        //         setPlayer1Info(player1);
        //         setPlayer2Info(player2);

        //     } else {
        //         console.log("player error");
        //     }
        // }

        // const fetchItems = async () => {
        //     try {
        //         const response = await fetch(apiUrl);
        //         if (!response.ok) {
        //             throw new Error("Error fetching items");
        //         }
        //         const data = await response.json();
        //         return data;
        //     } catch (error) {
        //         console.error("Error fetching items: ", error);
        //         return [];
        //     }
        // };

        // const fetchDataForPlayers = async () => {

        //     let player1Data = JSON.parse(localStorage.getItem('player1Items'));
        //     let player2Data = JSON.parse(localStorage.getItem('player2Items'));

        //     player1Data = await fetchItems();
        //     localStorage.setItem('player1Items', JSON.stringify(player1Data))
        
        //     player2Data = await fetchItems();
        //     localStorage.setItem('player2Items', JSON.stringify(player2Data))
            
        //     setPlayer1Items(player1Data);
        //     setPlayer2Items(player2Data);
        // };

        // fetchDataForPlayers();