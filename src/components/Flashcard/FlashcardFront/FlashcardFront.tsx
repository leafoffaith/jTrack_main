import React, { useEffect, useState } from 'react';
import * as wanakana from 'wanakana';
import { getHint1 } from '../../Fetching/getHint1';


interface FlashcardFrontProps {
  front: string
  flipped: boolean | undefined;
}

const FlashcardFront: React.FC<FlashcardFrontProps> = ({ front, flipped }) => {

  //state for converted kanji
  const [sent, setSent] = useState('');
  //state for visibility of hint button
  const [hintButton, setHintButton] = useState(true);

  /**
   * Function that gets the hint from the backend
   * @param front the front of the card
   * @returns the hint
   * @throws error if the hint cannot be retrieved
   * @async
   */
  const hint = () => {
    getHint1(front).then((res) => {
      setSent(res);
    }
    ).catch((err) => {
      console.log(err);
    }
    );
  };


  //check if it is a kanji or a sentence
  useEffect(() => {
   //if katakana or hiragana then set hint button to true
    if (wanakana.isKana(front)) {
      setHintButton(true);
    } else {
      setHintButton(false);
    }
  }
    , [front]);

  //reset sent when front changes
  useEffect(() => {
    setSent('');  
  }
  , [front]);

  return (
    <div>
      <h2>{front}</h2>
      {!hintButton && <div>
          <h2>Hint: <span dangerouslySetInnerHTML={{ __html: sent }} /></h2>
          {/* Render the button only if it's visible */}
          {!flipped && <button onClick={hint}>Get hint</button>}
      </div>}
      
      
      
    </div>
  );
};

export default FlashcardFront;