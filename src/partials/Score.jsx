import { useEffect, useState } from "react";
import '../styles/score.css';



const Score = ({ player1Name, player2Name }) => {

    const [player1Data, setPlayer1Data] = useState(null);
    const [player2Data, setPlayer2Data] = useState(null);
    const [error, setError] = useState(null);
    
    const apiUrl = 'https://localhost:7093/ShotgunRoulette/Player/GetScore';

    const scoreRequest = async () => {

        const url = `${apiUrl}?player1Name=${player1Name}&player2Name=${player2Name}`;

        try {
            console.log(`Requesting URL: ${url}`)
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            console.log('Full response object: ', response);

            if (!response.ok) {
                throw new Error('Network response was not ok: Score.jsx');
            }

            const scoreData = await response.json();
            console.log("scoreData: ", scoreData);

            if (scoreData.success) {
                console.log(`Player 1 (${player1Name}) - Wins: ${scoreData.player1Score.totalWins}, Losses: ${scoreData.player1Score.totalLosses}`);
                console.log(`Player 2 (${player2Name}) - Wins: ${scoreData.player2Score.totalWins}, Losses: ${scoreData.player2Score.totalLosses}`);
                setPlayer1Data(scoreData.player1Score);
                setPlayer2Data(scoreData.player2Score);
            }
            else {
                console.error('Error fetching score:', scoreData.message);
            }
        }
        catch (error) {
            console.error('Error fetching score:', error);
        }
    };

    useEffect(() => {
        scoreRequest();
    }, [player1Name, player2Name]);


    return(
        <div className="score-container">
            <section className="score-section">
                <div className="score-score">
                    <div>Wins:</div>
                    <div>{player1Data ? player1Data.totalWins : 0}</div>
                </div>
                <div className="score-score">
                    <div>Losses:</div>
                    <div>{player1Data ? player1Data.totalLosses : 0}</div>
                </div>
            </section>

            <section className="score-section">
                <div className="score-score">
                    <div>Wins:</div>
                    <div>{player2Data ? player2Data.totalWins : 0}</div>
                </div>
                <div className="score-score">
                    <div>Losses:</div>
                    <div>{player2Data ? player2Data.totalLosses : 0}</div>
                </div>
            </section>
        </div>
    )
}

export default Score;