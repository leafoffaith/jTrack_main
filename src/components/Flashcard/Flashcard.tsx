import React, { useEffect, useMemo, useState } from 'react';
import FlashcardBack from './FlashcardBack/FlashcardBack';
import FlashcardFront from './FlashcardFront/FlashcardFront';
import { SuperMemoGrade } from 'supermemo';

interface FlashcardProps {
  front: string;
  back: string | undefined;
  kanjiBack?: {
    meaning: [];
    kun_readings: [];
    on_readings: [];
    name_readings: [];
    stroke_count: number;
  };
  flipped?: boolean;
  setIsFlipped: React.Dispatch<React.SetStateAction<boolean>>;
  practice?: (grade: SuperMemoGrade) => void;
  options?: string[];
}

const Flashcard: React.FC<FlashcardProps> = ({
  options,
  flipped,
  setIsFlipped,
  practice,
  front,
  back,
  kanjiBack,
}) => {
  const [timer, setTimer] = useState(60);
  const [flip, setFlip] = useState(false);
  const [correct, setCorrect] = useState('');

  useEffect(() => {
    const countdown = setInterval(() => {
      setTimer((prevTimer) => prevTimer - 1);
    }, 1000);

    if (timer === 0) {
      practice!(1);
      clearInterval(countdown);
    }

    return () => clearInterval(countdown);
  }, [timer, practice]);

  useEffect(() => {
    setTimer(60);
  }, [front, back]);

  const handleBothClicks = () => {
    setFlip(!flip);
    setIsFlipped(true);
  };

  const handleButtonClass = (option: string) => {
    if (option === 'correct') {
      setCorrect('correctButton');
    } else if (option === 'incorrect') {
      setCorrect('incorrectButton');
    }
    return 'buttons';
  };

  const handlePractice = (grade: SuperMemoGrade) => {
    handleButtonClass(grade === 5 ? 'correct' : 'incorrect');
    alert(grade === 5 ? 'Correct!' : 'Incorrect!');
    practice!(grade);
  };

  const renderButtons = () => {
    return (
      primaryArray &&
      primaryArray.map((option, index) => (
        <button
          key={index}
          onClick={() => handlePractice(option === back ? 5 : 1)}
          className={correct}
        >
          {option}
        </button>
      ))
    );
  };

  const main = useMemo(() => {
    if (options) {
      return [back, ...options];
    }
    return [];
  }, [back, options]);

  const primaryArray = useMemo(() => {
    if (main.length > 0) {
      return main.sort(() => Math.random() - 0.5);
    }
    return [];
  }, [main]);

  return (
    <div className="flashcard card">
      <div>
        <div>
          <FlashcardFront front={front} flipped={flipped} />
          {options && (
            <div className="buttons">
              {renderButtons()}
            </div>
          )}
          {flipped && (
            <div>
              {kanjiBack ? (
                <FlashcardBack front={front} kanjiBack={kanjiBack} />
              ) : (
                <FlashcardBack back={back} />
              )}
              <button onClick={() => handlePractice(5)}>Easy</button>
              <button onClick={() => handlePractice(3)}>Medium</button>
              <button onClick={() => handlePractice(1)}>Hard</button>
            </div>
          )}
          {!options && !flipped && (
            <button onClick={() => handleBothClicks()}>Show answer</button>
          )}
        </div>
        <div>Time left: {timer} seconds</div>
      </div>
    </div>
  );
};

export default Flashcard;
