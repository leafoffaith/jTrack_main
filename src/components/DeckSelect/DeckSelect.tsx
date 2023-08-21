/**
 * @description component for selecting a deck
 * @todo query database for all available decks
 * @todo add decks to db with deckID, deckName, deckDescription, deckCards
 */

import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';
// import Navbar from '../Navbar/NavbarNew';

interface Deck {  
    deck_id: number;
    title: string;
}

/**
 */
//define props for DeckSelect
interface DeckSelectProps {
    deckList: Deck[];
}
    
const DeckSelect: React.FC<DeckSelectProps> = ({ deckList }): JSX.Element => {
    return (
        <div id='oc' className='buttons-deck'>
            {deckList.map((deck: Deck) => {
        return (
              <div className='cardDeck' key={deck.deck_id}> {/* Added key prop with a unique identifier */} 
                <h2>{deck.title}</h2>
                <img src="/src/assets/1-2-kanji-tattoos-png-picture.png"/>
                <Link to={`/learn/${deck.title.split(' ')[0].toLowerCase()}`}>
                  <button>Start Learning</button>
                </Link>
              </div>
        );
      })}
        </div>
    )
}

export default DeckSelect;