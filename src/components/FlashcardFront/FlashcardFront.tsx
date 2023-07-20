import React, { useState } from 'react';

interface FlashcardFrontProps {
  front: string
}

const FlashcardFront: React.FC<FlashcardFrontProps> = ({ front }) => {
  return (
    <div>
      <h1>{front}</h1>
    </div>
  );
};

export default FlashcardFront;