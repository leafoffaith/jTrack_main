//create navbar component
import { Link } from "react-router-dom";
import "./Navbar.css";
import { menuItems } from "./menuItems";
import MenuItemsComponent from "./MenuItemsComponent";
import { supaClient } from "../Client/supaClient";
import { slide as Menu } from 'react-burger-menu'

const Navbar = () => {

    const styles = {
        bmBurgerButton: {
          position: 'fixed',
          width: '36px',
          height: '30px',
          left: '36px',
          top: '36px'
        },
        bmBurgerBars: {
          background: '#373a47'
        },
        bmBurgerBarsHover: {
          background: '#a90000'
        },
        bmCrossButton: {
          height: '24px',
          width: '24px'
        },
        bmCross: {
          background: '#bdc3c7'
        },
        bmMenuWrap: {
          position: 'fixed',
          height: '100%'
        },
        bmMenu: {
          background: '#373a47',
          padding: '2.5em 1.5em 0',
          fontSize: '1.15em'
        },
        bmMorphShape: {
          fill: '#373a47'
        },
        bmItemList: {
          color: '#b8b7ad',
          padding: '0.8em'
        },
        bmItem: {
          color: 'white',
          display: 'flex',
          flexDirection: 'row',
          
        },
        bmOverlay: {
          background: 'rgba(0, 0, 0, 0.3)'
        }
      }
          
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

        <>
        <div id="oc" className="navbar">
            <div className="navbar__left">
                <div id="menu">
                    <Menu outerContainerId={'oc'} styles={styles}>
                        <a href="/">Home</a>
                        <a href="/learn">Learn</a>
                        <a href="/leaderboard">Leaderboard</a>
                    </Menu>
                </div>
                {/* <Link to="/" className="link">
                    <span className="logo">JTrack</span>
                </Link> */}
            </div>
            <div id="noDis">
            {menuItems.map((item, index) => {
                return (
                    <MenuItemsComponent title={item.title} url={item.url} key={index} />
                )
            })}
             </div>
            {/* <span className="navbar__right__item input-container">
                <button onClick={signOut}>Sign Out</button>
            </span> */}
             <span className="navbar__right__item input-container">
             {/* <input id="Search" type="text" placeholder="Search for Kanji, Sentences and more" className="input-field" /> */}
                 <button onClick={signOut}>Sign Out</button>
             </span>
        </div>
        </>
    );
};

export default Navbar;