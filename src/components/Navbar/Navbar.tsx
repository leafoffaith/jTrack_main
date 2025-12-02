//create navbar component
import { Link } from "react-router-dom";
import "./Navbar.css";
import { menuItems } from "./menuItems";
import MenuItemsComponent from "./MenuItemsComponent";
import { supaClient } from "../Client/supaClient";
import { slide as Menu } from 'react-burger-menu'
import { useEffect, useState } from "react";

const Navbar = () => {
  const [username, setUsername] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { session } } = await supaClient.auth.getSession();
      if (session?.user) {
        setIsAuthenticated(true);
        // Get username from user metadata (stored during registration)
        const usernameFromMetadata = session.user.user_metadata?.username;
        setUsername(usernameFromMetadata || session.user.email || null);
      } else {
        setIsAuthenticated(false);
        setUsername(null);
      }
    };

    fetchUserData();

    // Listen for auth state changes
    const { data: { subscription } } = supaClient.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setIsAuthenticated(true);
        // Get username from user metadata
        const usernameFromMetadata = session.user.user_metadata?.username;
        setUsername(usernameFromMetadata || session.user.email || null);
      } else {
        setIsAuthenticated(false);
        setUsername(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

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
      padding: '2.5em 0 0 0',
      fontSize: '1.15em'
    },
    bmMorphShape: {
      fill: '#373a47'
    },
    bmItemList: {
      color: '#b8b7ad',
      padding: '0',
      display: 'flex',
      flexDirection: 'column',
    },
    bmItem: {
      color: 'white',
      display: 'block',
      textAlign: 'left',
      padding: '1rem 1.5rem',
      textDecoration: 'none',
      fontSize: '1.2rem',
      width: '100%',
      transition: 'background-color 0.2s ease',
      '&:hover': {
        backgroundColor: '#4a4d5c'
      }
    },
    bmOverlay: {
      background: 'rgba(0, 0, 0, 0.3)'
    }
  }

  const signOut = async () => {
    const { error } = await supaClient.auth.signOut();
    if (error) {
      console.error('Error signing out:', error.message);
    }
  };

  return (
    <>
      <div id="oc" className="navbar">
        <div className="navbar__left">
          <div id="menu">
            <Menu outerContainerId={'oc'} styles={styles}>
              <a href="/">Home</a>
              <a href="/learn">Learn</a>
              <a href="/leaderboard">Leaderboard</a>
              <a href="/profile">Profile</a>
              <a href="/awards">Achievements</a>
            </Menu>
          </div>
          {/* <Link to="/" className="link">
                    <span className="logo">JTrack</span>
                </Link> */}
        </div>
        <div id="noDis">
          {menuItems
            .filter(item => {
              // Hide Register option if user is authenticated
              if (item.title === 'Register' && isAuthenticated) {
                return false;
              }
              return true;
            })
            .map((item, index) => {
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
          {isAuthenticated && username && (
            <span style={{ marginRight: '1rem', color: 'white' }}>{username}</span>
          )}
          {isAuthenticated && (
            <button onClick={() => void signOut()}>Sign Out</button>
          )}
        </span>
      </div>
    </>
  );
};

export default Navbar;