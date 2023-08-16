import React, { useState } from 'react';
import * as wanakana from 'wanakana';

interface FlashcardFrontProps {
  front: string
}

const FlashcardFront: React.FC<FlashcardFrontProps> = ({ front }) => {
  return (
    // console.log(wanakana.tokenize(front)),
    <div>
      <h2>{wanakana.tokenize(front)}</h2>
      <h2>Hint: {wanakana.toRomaji(wanakana.tokenize(front)[3])}</h2>
    </div>
  );
};

export default FlashcardFront;