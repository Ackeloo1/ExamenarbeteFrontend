import React, { useEffect } from 'react';
import HeartImg from '../images/heart.png';
import '../styles/player.css';
import { useAuth } from '../contexts/AuthContext';

const PlayerContainer = ({ playerInfo, playerItems, handleItemUse, gameStart, revealBullet, bulletType, playerTurn }) => {

    const { userData } = useAuth();
    const { username } = userData;
    
    const itemsToDisplay = (items) => [...items, ...Array(5 - items.length).fill(null)];

    const healthPoints = Array.from({ length: playerInfo.health }, (_, index) => index);

    return (
        <div className="player-container">
            <h3 className='player-name-label'>{playerInfo.name}</h3>
            <div className="health-container">
                {healthPoints.map((_, index) => (
                    <img key={index} src={HeartImg} alt="Health Icon" className="health-icon" />
                ))}
            </div>
            {revealBullet && playerInfo.name === username && (
                <div className="bullet-reveal">
                    {bulletType === 1 ? 'Bullet' : 'Blank'}
                </div>
            )}
            <ul className="item-list">
                {itemsToDisplay(playerItems).map((item, index) => (
                    <li key={index} className="item">
                        {item ? (
                            <button onClick={() => handleItemUse(item.id, playerInfo.name === gameStart.players[0].name ? 1 : 2)} className="item-button" disabled={playerTurn !== username}>
                                <img src={require(`/src/images/item_${item.id}.png`)} alt={item.name} className="item-img"/>
                            </button>
                        ) : (
                            <div className="empty-item"></div>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default PlayerContainer;