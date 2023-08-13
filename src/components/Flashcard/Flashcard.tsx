import React, { useState } from 'react';
import FlashcardBack from '../FlashcardBack/FlashcardBack';
import FlashcardFront from '../FlashcardFront/FlashcardFront';
import { FlashcardItem } from './FlashcardItem';
import { SuperMemoGrade } from 'supermemo';

interface FlashcardProps {
  // Only using these two as the other things are not required to render the component
    front: string;
    back: string;
    flipped?: boolean;
    practice?: (grade: SuperMemoGrade) => void;
    // easyPractice: (grade: SuperMemoGrade) => void;
    // mediumPractice: (grade: SuperMemoGrade) => void;
    // hardPractice: (grade: SuperMemoGrade) => void;
  }

const Flashcard: React.FC<FlashcardProps> = (props) => {
  
  //state to manage visibility of flashcard back
  const [visible, setVisible] = useState(false);

    return (
      <div className="flashcard">
        <div>
          {/* The front and back come from props used to render the flashcard */}
          <FlashcardFront front={props.front} />
          {/* button that controls visiblity of the back  */}
          {/* <button onClick={() => setVisible(!visible)}>Show Answer</button> */}
          {/* conditionally render back of the flashcard if user has clicked on button to show answer*/}
          {props.flipped && 
            <div>
              <FlashcardBack back={props.back} />
              {/* Practice buttons */}
              <button onClick={() => props.practice!(5)}>Easy</button>
              <button onClick={() => props.practice!(3)}>Medium</button>
              <button onClick={() => props.practice!(1)}>Hard</button>
            </div>
          }
        </div>
      </div>
    );
  };
  
  export default Flashcard;