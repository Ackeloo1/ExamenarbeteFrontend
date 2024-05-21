import React from 'react';
import Score from './Score';

const ShotgunContainer = ({ roundEndMessage, message, showOptions, toggleOptions, shuffledBullets, gameInfo, selectPlayer, username, playerTurn, Shotgun }) => {
    return (
        <div className="shotgun-container">

            <Score 
                player1Name={gameInfo.players[0].name}
                player2Name={gameInfo.players[1].name}
            />

            <div className="round-end-message">{roundEndMessage}</div>
            <div className="action-message">{message}</div>
            <div className="shotgun-button-container">
                <button onClick={toggleOptions} className="shotgun-button" disabled={playerTurn !== username}>
                    <img src={Shotgun} alt="hemligt" className="shotgun-image"/>
                </button>

                {showOptions && (
                    <div className="shoot-options-container">
                        {gameInfo.players.map(player => (
                            <button className="shoot-options-button" key={player.name} onClick={() => selectPlayer(player.name)}>Shoot {player.name}?</button>
                        ))}
                    </div>
                )}
            </div>
            <div className="bullets-message">
                {shuffledBullets.map((key, index) => (
                    <img key={index} src={require(`/src/images/${key}.png`)} alt={`${key}`} className="bullet-img" />
                ))}
            </div>
        </div>
    );
};

export default ShotgunContainer;