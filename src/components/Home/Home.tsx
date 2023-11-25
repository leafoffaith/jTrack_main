
/**
 * @file Home.tsx is the home page for the application. It contains instructions for the user to follow
 * when using the application. It also contains a navbar component that allows the user to navigate to
 * different pages.
 * @author Shaurya Dey s.dey2@ncl.ac.uk
 */
import Navbar from "../Navbar/Navbar";
import "./Home.css";


const Home = () => {
    
    return (

        <div className="home">
         <div className="container" style={{ padding: '50px 0 100px 0' }}>
             <Navbar />
         </div>
         {/* Instructions for flashcard review */}
        <div>
            <h1 className="instructions">Instructions</h1>
            <p className="instructions">1. Click on the "Learn" tab to select a new deck to learn.</p>
            <p>2. Select your deck and which JLPT level you are comfortable with</p>
            <p>3. For the multiple choice flashcards select the option you think is correct</p>
            <p>6. For the flashcards with a kanji on the front, try and see if you can recall what the meaning of the Kanji is</p>
            <p>Complete Hiragana and Katakana first before moving to other decks!</p>
        </div>
           
        </div>
    );
}

export default Home;

