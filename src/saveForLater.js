import { useEffect, useState } from "react";
import { json, useParams } from "react-router-dom";
import Shotgun from '../images/shotgunlogo.png';
import { useAuth } from '../contexts/AuthContext';

const LobbyPage = () => {
    const apiUrl = "https://localhost:7093/ShotgunRoulette/Item/GetItems";

    const { userData } = useAuth();
    const { username } = userData;

    const { player1 } = useParams();

    console.log("Player 1:", player1);
    // console.log("Player 2:", player2);

    const [player1Items, setPlayer1Items] = useState([]);
    const [player2Items, setPlayer2Items] = useState([]);
    const [player2Name, setPlayer2Name] = useState("");

    useEffect(() => {

        const fetchItems = async () => {
            try {
                const response = await fetch(apiUrl);
                if (!response.ok) {
                    throw new Error("Error fetching items");
                }
                const data = await response.json();
                return data;
            } catch (error) {
                console.error("Error fetching items: ", error);
                return [];
            }
        };

        const fetchDataForPlayers = async () => {

            let player1Data = JSON.parse(localStorage.getItem('player1Items'));
            let player2Data = JSON.parse(localStorage.getItem('player2Items'));

            player1Data = await fetchItems();
            localStorage.setItem('player1Items', JSON.stringify(player1Data))
        
            player2Data = await fetchItems();
            localStorage.setItem('player2Items', JSON.stringify(player2Data))
            
            console.log("player1: ", player1Data, ". player2: ", player2Data);
            
            setPlayer1Items(player1Data);
            setPlayer2Items(player2Data);
        };

        fetchDataForPlayers();

        if (player2) {
            fetchPlayer2Name();
        }
    }, [player2]);

    const emptyItems = new Array(5).fill(null);

    return(
        <div className="game-container">
            <div className="game-wrapper">

                <div className="player-container">
                    <h3>{username}</h3>
                    <ul className="item-list">
                    {player1Items.map((item, index) => (
                            Array.from({ length: item.quantity }).map((_, i) => (
                                <li className="item" key={`${item.id}_${i}`}>
                                    <img className="item-img" src={require(`../images/item_${item.id}.png`)} alt={item.name} />
                                </li>
                            ))
                        ))}
                        {emptyItems.slice(player1Items.length).map((_, index) => (
                            <li className="item" key={index}></li>
                        ))}
                    </ul>
                </div>

                <div className="shotgun-container">
                    <img src={Shotgun} alt="hemligt" />
                </div>

                <div className="player-container">
                <h3>{ /*{player2} */ }</h3>
                    <ul className="item-list">
                    {player2Items.map((item, index) => (
                            Array.from({ length: item.quantity }).map((_, i) => (
                                <li className="item" key={`${item.id}_${i}`}>
                                    <img className="item-img" src={require(`../images/item_${item.id}.png`)} alt={item.name} />
                                </li>
                            ))
                        ))}
                        {emptyItems.slice(player2Items.length).map((_, index) => (
                            <li className="item" key={index + player2Items.length}></li>
                        ))}
                    </ul>
                </div>

            </div>
        </div>
    )
}

export default LobbyPage;