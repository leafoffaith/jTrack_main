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
    let kunReadings, onReadings, nameReadings = '';
    kanjiBack?.kun_readings[0] ?  kunReadings = kanjiBack?.kun_readings.join(', ') :  kunReadings = 'no readings to remember';
    kanjiBack?.on_readings[0] ?  onReadings = kanjiBack?.on_readings.join(', ') :  onReadings = 'no readings to remember';
    kanjiBack?.name_readings[0] ?  nameReadings = kanjiBack?.name_readings.join(', ') :  nameReadings = 'no readings to remember';

      return (
        <div>
          {/* if kanjiback exists render that if not then just render back as usual */}
          {kanjiBack ?
          <div>
            <p>Meaning: {kanjiBack.meaning}</p>
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
  