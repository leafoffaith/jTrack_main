/**
 * @file Home.tsx is the home page for the application. It contains instructions for the user to follow
 * when using the application. It also contains a navbar component that allows the user to navigate to
 * different pages.
 * @author Shaurya Dey s.dey2@ncl.ac.uk
 */
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../Navbar/Navbar";
import "./Home.css";

const Home = () => {
    const location = useLocation();
    const isHomePage = location.pathname === '/';

    return (
        <div className="home">
            <div className="container" style={{ padding: '50px 0 100px 0' }}>
                <Navbar />
            </div>
            {isHomePage && (
                <div className="instructions-container">
                    <h1>Instructions</h1>
                    <ul className="instructions-list">
                        <li>Click on the "Learn" tab to select a new deck to learn.</li>
                        <li>Select your deck and which JLPT level you are comfortable with.</li>
                        <li>For the multiple choice flashcards, select the option you think is correct.</li>
                        <li>For the flashcards with a kanji on the front, try to recall what the meaning of the Kanji is.</li>
                        <li>Complete Hiragana and Katakana first before moving to other decks!</li>
                    </ul>
                </div>
            )}
            {/* Outlet for children to be rendered */}
            <Outlet />
        </div>
    );
}

export default Home;

