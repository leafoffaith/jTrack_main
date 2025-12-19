/**
 * @PARAM back - the back of the flashcard
 * @Author Shaurya Dey
 * @Purpose This component renders the back of the flashcard but it will be hidden until the user clicks on show answer
*/

import React from 'react';

interface FlashcardBackProps {
       back?: string;
       kanjiBack?: {
        meaning: string[];
        kun_readings: string[];
        on_readings: string[];
        name_readings: string[];
        stroke_count: number
       }
       options?: string[];
       front?: string;
  }   
  
  const FlashcardBack: React.FC<FlashcardBackProps> = ({ back, kanjiBack, front }) => {
    //split and join readings with commas and give each a different color
    let kunReadings = '';
    let onReadings = '';
    let nameReadings = '';
    if (kanjiBack?.kun_readings && kanjiBack.kun_readings.length > 0) {
      kunReadings = kanjiBack.kun_readings.join(', ');
    } else {
      kunReadings = 'no readings to remember';
    }
    if (kanjiBack?.on_readings && kanjiBack.on_readings.length > 0) {
      onReadings = kanjiBack.on_readings.join(', ');
    } else {
      onReadings = 'no readings to remember';
    }
    if (kanjiBack?.name_readings && kanjiBack.name_readings.length > 0) {
      nameReadings = kanjiBack.name_readings.join(', ');
    } else {
      nameReadings = 'no readings to remember';
    }

      return (
        <div>
          {/* if kanjiback exists render that if not then just render back as usual */}
          {kanjiBack ?
          <div>
            <p>Meaning: {kanjiBack.meaning.join(', ')}</p>
            <p>Kun readings: {kunReadings}</p>
            <p>On readings: {onReadings}</p>
            <p>Name readings: {nameReadings}</p>
            <p>Stroke count: {kanjiBack.stroke_count}</p>
            <p className='stroke-order'>{front}</p>
          </div>  
          :
          <div>
            <h3>Answer: {back}</h3>
          </div>
          }
          {/* <p>Flashcard back content</p> */}
        </div>
      );
  };
  
  export default FlashcardBack;
  