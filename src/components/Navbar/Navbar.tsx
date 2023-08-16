//create navbar component
import { Link } from "react-router-dom";
import "./Navbar.css";
import { menuItems } from "./menuItems";
import MenuItemsComponent from "./MenuItemsComponent";
import { supaClient } from "../Client/supaClient";

const Navbar = () => {
    //dropdown state
    //handle logout
    async function signOut() {
        const { error } = await supaClient.auth.signOut()

            if (error) {
                console.log('Error signing out:', error.message)
            } else {
                console.log('Signed out successfully')
            }
            
    }

    return (

        <div className="navbar">
            <div className="navbar__left">
                <Link to="/" className="link">
                    <span className="logo">JTrack</span>
                </Link>
            </div>
            {menuItems.map((item, index) => {
                return (
                    <MenuItemsComponent title={item.title} url={item.url} key={index} />
                )
            })}
            {/* <span className="navbar__right__item input-container">
                <button onClick={signOut}>Sign Out</button>
            </span> */}
             <span className="navbar__right__item input-container">
             {/* <input id="Search" type="text" placeholder="Search for Kanji, Sentences and more" className="input-field" /> */}
                 <button onClick={signOut}>Sign Out</button>
             </span>
        </div>
    );
};

export default Navbar;