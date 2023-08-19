import React, { useEffect, useState } from 'react';
import * as wanakana from 'wanakana';
import { getHint1 } from '../../Fetching/getHint1';


interface FlashcardFrontProps {
  front: string
}

const FlashcardFront: React.FC<FlashcardFrontProps> = ({ front }) => {

  //state for converted kanji
  const [sent, setSent] = useState('');
  //state for button visibility
  const [buttonVis, setButtonVis] = useState(true);
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
      setButtonVis(false);
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

  //reset button visibility when front changes
  useEffect(() => {
    setButtonVis(true);
    setSent('');  
  }
  , [front]);

  return (
    <div>
      <h2>{front}</h2>
      {!hintButton && <div>
          <h2>Hint: <span dangerouslySetInnerHTML={{ __html: sent }} /></h2>
          {/* Render the button only if it's visible */}
          <button onClick={hint}>Get hint</button>
      </div>}
      
      
      
    </div>
  );
};

export default FlashcardFront;