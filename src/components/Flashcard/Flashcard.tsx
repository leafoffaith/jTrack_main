import React, { useEffect, useState } from 'react';
import FlashcardBack from './FlashcardBack/FlashcardBack';
import FlashcardFront from './FlashcardFront/FlashcardFront';
import { SuperMemoGrade } from 'supermemo';

interface FlashcardProps {
  // Only using these two as the other things are not required to render the component
    front: string;
    back: string;
    kanjiBack?: {
      meaning: [],
      kun_readings: [],
      on_readings: [],
      name_readings: [],
      stroke_count: number
    }
    flipped?: boolean;
    setIsFlipped: React.Dispatch<React.SetStateAction<boolean>>;
    practice?: (grade: SuperMemoGrade) => void;
    options?: string[];
  }


const Flashcard: React.FC<FlashcardProps> = ({options, flipped, setIsFlipped, practice, front, back, kanjiBack}) => {


  //timer state for the flashcard
  const [timer, setTimer] = useState(60);

  const [flip, setFlip] = useState(false)

  //auto fail after a timout of 60 seconds
  useEffect(() => {
    const countdown = setInterval(() => {
      setTimer(prevTimer => prevTimer - 1);
    }, 1000);
  
    if (timer === 0) {
      practice!(1); // Call the practice function with a predefined grade
      clearInterval(countdown); // Clear the countdown interval
    }
  
    return () => clearInterval(countdown);
  }, [timer, practice]);

  //reset timer to 60 seconds when the flashcard changes
  useEffect(() => {
    setTimer(60);
  }
  , [front, back]);

  const handleBothClicks = () => {
    setFlip(!flip);
    setIsFlipped(true);
  }

    return (
      <div className="flashcard card">
        {/* check if options array exists in the flashcard object */}
        <div>
          {/* The front and back come from props used to render the flashcard */}
          <div>
              <FlashcardFront front={front} flipped={flipped} />
              {options &&
                <div className='buttons'>
                  <button onClick={() => practice!(1)}>{options[0]}</button>
                  <button onClick={() => practice!(1)}>{options[1]}</button>
                  <button onClick={() => practice!(1)}>{options[2]}</button>
                  <button onClick={() => practice!(5)}>{back}</button>
                </div>
              }
              {flipped && 
                <div>
                  {/* If kanjiBack exists pass that instead of normal back */}
                  {kanjiBack ? <FlashcardBack front={front} kanjiBack={kanjiBack}/> : <FlashcardBack back={back} />}
                  {/* Practice buttons */}
                  <button onClick={() => practice!(5)}>Easy</button>
                  <button onClick={() => practice!(3)}>Medium</button>
                  <button onClick={() => practice!(1)}>Hard</button>
                </div>
              }
              {!options && !flipped && <button onClick={() => handleBothClicks()}>Show answer</button>}
            </div>
            {/* Timer display */}
            <div>Time left: {timer} seconds</div>
          </div>
      </div>
    );
  };
  
  export default Flashcard;