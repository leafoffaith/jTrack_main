/**
 * @PARAM back - the back of the flashcard
 * @Author Shaurya Dey
 * @Purpose This component renders the back of the flashcard but it will be hidden until the user clicks on show answer
*/


import React, { useState } from 'react';
interface FlashcardBackProps {
       back: string;
  }   
  
  const FlashcardBack: React.FC<FlashcardBackProps> = ({ back }) => {
      return (
        <div>
          <p>Meaning: {back}</p>
          <p>Flashcard back content</p>
        </div>
      );
  };
  
  export default FlashcardBack;
  
  