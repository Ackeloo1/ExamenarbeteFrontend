import { useNavigate } from "react-router-dom";
import Lobbies from "../partials/Lobbies";
import { useEffect } from "react";
import { useAuth } from '../contexts/AuthContext';

const HomePage = () => {

    const { logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        
        const jwtToken = localStorage.getItem('jwtToken');

        if (jwtToken) {
            console.log("JWT TOKEN: ", jwtToken);
        }
        else{
            console.log("JWT TOKEN NOT FOUND.");
        }
    }, []);


    return( 
        <Lobbies />
    )
}

export default HomePage;