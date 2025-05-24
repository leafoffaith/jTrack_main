/**
 * @description component for selecting a deck
 * @todo query database for all available decks
 * @todo add decks to db with deckID, deckName, deckDescription, deckCards
 * @author Shaurya Dey 220025500 s.dey2@ncl.ac.uk 
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supaClient } from '../Client/supaClient';
import dayjs from 'dayjs';
interface Deck {
  deck_id: number;
  title: string;
}

interface DeckSelectProps {
  deckList: Deck[];
}

/**
 * 
 * @returns deck selection page
 */
const DeckSelect: React.FC<DeckSelectProps> = ({ deckList }): JSX.Element => {
  const [totalReviewed, setTotalReviewed] = useState(0);

  const fetchTotalReviewed = async () => {
    const { data: reviewed, error } = await supaClient
      .from('hiragana, katakana')
      .select('due_date')
      .where('due_date', 'is', dayjs().toISOString())
      .then()

    if (error) {
      console.log(error)
    } else {
      console.log(reviewed[0].totalReview)
      return reviewed[0].totalReview
    }
  }

  useEffect(() => {
    fetchTotalReviewed().then((data) => {
      setTotalReviewed(data);
    }).catch((err) => {
      console.log(err);
    });
  }, []);

  return (
    <div id='oc' className='buttons-deck'>
      {/* <h2>{totalReviewed} cards are queued for review!</h2> */}
      {deckList.map((deck: Deck) => {
        return (
          <div className='cardDeck' key={deck.deck_id}>
            <h2>{deck.title.toUpperCase()}</h2>
            <Link to={`/learn/${deck.title.split(' ')[0].toLowerCase()}`}>
              <button>START LEARNING</button>
            </Link>
          </div>
        );
      })}
    </div>
  )
}

export default DeckSelect;