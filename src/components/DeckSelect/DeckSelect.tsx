/**
 * @description component for selecting a deck
 * @todo query database for all available decks
 * @todo add decks to db with deckID, deckName, deckDescription, deckCards
 */

import React from 'react';

interface Deck {
    deck_id: number;
    title: string;
}

//define props for DeckSelect
interface DeckSelectProps {
    deckList: Deck[];
}
    
const DeckSelect: React.FC<DeckSelectProps> = ({ deckList }): JSX.Element => {

    return (
        <div>
            {deckList.map((deck: Deck) => {
        return (
          <div key={deck.deck_id}> {/* Added key prop with a unique identifier */}
            <h1>{deck.title}</h1>
            <button>Start Learning!</button>
          </div>
        );
      })}
        </div>
    )
}

export default DeckSelect;