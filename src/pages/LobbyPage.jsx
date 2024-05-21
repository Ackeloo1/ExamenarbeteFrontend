import { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import Shotgun from '../images/shotgunlogo.png';
import { useAuth } from '../contexts/AuthContext';
import * as signalR from '@microsoft/signalr';
import PlayerContainer from '../partials/PlayerContainer'
import ShotgunContainer from "../partials/ShotgunContainer";
import Score from "../partials/Score";
import { useGameContextInfo } from "../contexts/GameInfoContext";
import '../styles/globals.css';

const LobbyPage = () => {

    const apiUrl = 'https://localhost:7093/ShotgunRoulette/Player';
    const { userData } = useAuth();
    const accessToken = userData.jwtToken;

    const { state } = useLocation();
    const { gameStart } = state;
    const { username } = userData;
    const { setGameContextInfo } = useGameContextInfo();

    const [player1Items, setPlayer1Items] = useState([]);
    const [player2Items, setPlayer2Items] = useState([]);
    const [message, setMessage] = useState("");
    const [playerAction, setPlayerAction] = useState(0);
    const [showOptions, setShowOptions] = useState(false);
    const [playerTurn, setPlayerTurn] = useState(gameStart.players[0].name);
    const [gameInfo, setGameInfo] = useState(gameStart);
    const [roundEndMessage, setRoundEndMessage] = useState("");
    const [shuffledBullets, setShuffledBullets] = useState([]);
    const [revealBullet, setRevealBullet] = useState(false);

    const [bulletType, setBulletType] = useState(null);


    const connection = useRef(null);
    const messageTimeoutRef = useRef(null);
    const winnerTimeoutRef = useRef(null);

    //Shufflar array av kulor för förvirrning för spelare.
    const shuffleBullets = (gameInfo) => {
        function shuffleArray(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
            return array;
        }
    
        const combinedItems = [];
        for (const key in gameInfo.bullets) {
            combinedItems.push(...Array.from({ length: gameInfo.bullets[key] }).fill(key));
        }
    
        return shuffleArray(combinedItems);
    }

    useEffect(() => {
        if (gameStart) {
            setGameInfo(gameStart);
        }
    }, [gameStart, setGameInfo]);

    useEffect(() => {

        setGameContextInfo(gameStart);
        setShuffledBullets(shuffleBullets(gameInfo));

        // Tömmer kulor-listan efter 3 sekunder
        const timeout = setTimeout(() => {
            setShuffledBullets([]);
        }, 3000);

        console.log("LobbyPage jwt: ", accessToken);
        //Hub connection
        connection.current = new signalR.HubConnectionBuilder()
            .withUrl(`https://localhost:7093/gamehub?authorization=${accessToken}`, {
                skipNegotiation: true,
                transport: signalR.HttpTransportType.WebSockets,
            })
            .configureLogging(signalR.LogLevel.Information)
            .build();

        connection.current.on("GameStartItems", (playerItems) => {
            console.log("gameStartItems info: ", playerItems);
            setPlayer1Items(playerItems.player1Items);
            setPlayer2Items(playerItems.player2Items);
        });

        connection.current.on("ItemUsed", (data) => {
            setPlayer1Items(data.newItems.player1Items);
            setPlayer2Items(data.newItems.player2Items);
            setMessage(data.message);

            if (data.revealBullet) {
                console.log("Magnifying glass was used by ", username);
            }

            clearTimeout(messageTimeoutRef.current);

            //Tömmer "ItemUsed" meddelandet efter 3 sekunder
            messageTimeoutRef.current = setTimeout(() => {
                setMessage("");
            }, 3000);
        });

        connection.current.on("ShootResult", (data) => {
            console.log("shootResult: ", data);
            setGameInfo(data.gameResult);
            setPlayerTurn(data.turn);

            //Hämta nya items på ny runda
            if (data.newRound) {
                setPlayer1Items(prevPlayer1Items => {
                    setPlayer2Items(prevPlayer2Items => {
                        console.log("New Round: ", prevPlayer1Items, prevPlayer2Items);
                        connection.current.invoke("GetItemsForPlayers", gameInfo.players, gameInfo.gameId, prevPlayer1Items, prevPlayer2Items);
                        return prevPlayer2Items; // Return value to maintain the correct state
                    });
                    return prevPlayer1Items; // Return value to maintain the correct state
                });

                setShuffledBullets(shuffleBullets(data.gameResult));
                // Tömmer kulor-listan efter 3 sekunder
                const timeout = setTimeout(() => {
                    setShuffledBullets([]);
                }, 3000);
            }

            //Hämtar nästa laddade kula, behövs om magnifying glass ska fungera
            connection.current.invoke("GenerateBullet", data.gameResult);
        });

        connection.current.on("GameResult", (result) => {
            
            const url = apiUrl + '/AddScore';
            console.log(result.winnerName);
            setRoundEndMessage(`${result.winnerName} won the round!`);

            clearTimeout(winnerTimeoutRef.current);

            winnerTimeoutRef.current = setTimeout(() => {
                setRoundEndMessage("");
            }, 3000);

            //uppdatera vinnares och förlorares "score"
            return fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    WinnerName: result.winnerName,
                    LoserName: result.loserName
                }),
            });
        });
        
        connection.current.on("bulletType", (data) => {
            setBulletType(data);
        });

        connection.current.on("Error", (errorMessage) => {
            console.log(errorMessage);
            alert(errorMessage);
        });

        connection.current.start()
            .then(() => {
                connection.current.invoke("AddToGroup", gameInfo.gameId);
                connection.current.invoke("GetItemsForPlayers", gameInfo.players, gameInfo.gameId, player1Items, player2Items);
                connection.current.invoke("GenerateBullet", gameInfo);
            })
            .catch(error => console.log("Error in gamehub: ", error));

        return () => {
            clearTimeout(timeout)
            if (connection.current.state === signalR.HubConnectionState.Connected) {
                connection.current.stop()
                    .then(() => console.log("SignalR connection stopped"))
                    .catch(error => console.error("Error stopping SignalR connection: ", error));
            }
        };

    }, []);

    const handleItemUse = (itemId, player) => {

        setRoundEndMessage("");

        var playerItems = {player1Items, player2Items};

        connection.current.invoke("UseConsumable", gameInfo.gameId, playerItems, itemId, player, username );

        console.log("Item used: ", itemId);

        //Sätter useState för "saw" item
        playerAction != null ? setPlayerAction(itemId) : setPlayerAction(0);

        //Sätter useState att visa kula när "Magnifying glass" används
        if (itemId === 2) {
            setRevealBullet(true);
        }
    };

    //välj spelare att skjuta
    const selectPlayer = (player) => {
        handleShotgunShoot(player);
        setShowOptions(false);
    }

    const toggleOptions = () => {
        setShowOptions(!showOptions);
    }

    const handleShotgunShoot = (player) => {
        connection.current.invoke("Shoot", gameInfo, player, username, bulletType, playerAction);
        setPlayerAction(0);
        setRevealBullet(null);
        console.log(player, " shot a ", bulletType === 1 ? "Bullet" : "Blank");
        setMessage(username + ` shot a ${bulletType === 1 ? "Bullet!" : "Blank!"}`);

        messageTimeoutRef.current = setTimeout(() => {
            setMessage("");
        }, 3000);
    }
    
    return(
        <div className="game-container">
            <div className="game-wrapper">

                <PlayerContainer 
                    playerInfo={gameInfo.players[0]} 
                    playerItems={player1Items} 
                    handleItemUse={handleItemUse} 
                    username={username} 
                    gameStart={gameStart}
                    revealBullet={revealBullet}
                    bulletType={bulletType}
                    playerTurn={playerTurn}
                />

                <ShotgunContainer
                    roundEndMessage={roundEndMessage}
                    message={message}
                    showOptions={showOptions}
                    toggleOptions={toggleOptions}
                    shuffledBullets={shuffledBullets}
                    gameInfo={gameInfo}
                    selectPlayer={selectPlayer}
                    username={username}
                    playerTurn={playerTurn}
                    Shotgun={Shotgun}
                />

                <PlayerContainer 
                    playerInfo={gameInfo.players[1]} 
                    playerItems={player2Items} 
                    handleItemUse={handleItemUse} 
                    username={username} 
                    gameStart={gameStart} 
                    revealBullet={revealBullet}
                    bulletType={bulletType}
                    playerTurn={playerTurn}
                />

            </div>
        </div>
    )
}

export default LobbyPage;