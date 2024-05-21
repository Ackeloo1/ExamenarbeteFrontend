import React, { createContext, useContext, useState } from 'react';

const GameInfoContext = createContext();

export const useGameContextInfo = () => useContext(GameInfoContext);

export const GameInfoProvider = ({ children }) => {
    const [gameContextInfo, setGameContextInfo] = useState(null);

    return (
        <GameInfoContext.Provider value={{ gameContextInfo, setGameContextInfo }}>
            {children}
        </GameInfoContext.Provider>
    );
};