import React, { useState } from 'react';
import FlashcardBack from '../FlashcardBack/FlashcardBack';
import FlashcardFront from '../FlashcardFront/FlashcardFront';

interface FlashcardProps {
  // Only using these two as the other things are not required to render the component
    front: string;
    back: string;
  }

const Flashcard: React.FC<FlashcardProps> = (props) => {
  
    return (
      <div className="flashcard">
        <div>
          {/* The front and back come from props used to render the flashcard */}
          <FlashcardFront front={props.front} />
          <FlashcardBack back={props.back} />
        </div>
      </div>
    );
  };
  
  export default Flashcard;