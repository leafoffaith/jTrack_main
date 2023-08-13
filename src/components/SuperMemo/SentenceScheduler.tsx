import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { supermemo, SuperMemoGrade } from 'supermemo'
import Flashcard from '../Flashcard/Flashcard';
import { FlashcardItem } from '../Flashcard/FlashcardItem';
import { useParams } from 'react-router-dom';
import { fetchKanjiByLevel } from '../Kanji/N5KanjiList';
import { createSentenceFlashcards } from '../JMDict/JMDict';

interface UpdatedFlashcard extends FlashcardItem {
  dueDate: string;
}
//Start of Scheduler component
const SentenceScheduler = (): JSX.Element => {

  const [sentenceData, setSentenceData] = useState<[]>([]);
  
  //practiced flashcards array
  const [practicedFlashcards, setPracticedFlashcards] = useState<UpdatedFlashcard[]>([]);

  // title state
//   const { title } = useParams<{ title: string }>();


  //fetches kanji data
  useEffect(() => {
    console.log("this is running")
    // fetchKanjiData();
    const fetchSentenceData = async () => {
        try {
            console.log("this is running too")
            const data = await createSentenceFlashcards();
            setSentenceData(data);
            console.log(sentenceData)
        } catch (error) {
            console.error('Error fetching sentence data:', error);
        }
        }

        fetchSentenceData();
  }, []);


  const [currentCardIndex, setCurrentCardIndex] = useState(0);

  /** 
   *  Pratice function logic that uses practiceFlashcard function
    @PARAM grade - the grade of the flashcard that is being practiced
  */
  const practice = (grade: SuperMemoGrade): void => {
    const currentFlashcard = sentenceData[currentCardIndex];

    // Update the flashcard with the grade using the practiceFlashcard function
    const updatedFlashcard = practiceFlashcard(currentFlashcard, grade);
    console.log(updatedFlashcard);
    // Update the flashcard in your array or database with the updatedFlashcard data
    const updatedFlashcards = [...sentenceData];
    //replace the current flashcard with the updated flashcard
    updatedFlashcards[currentCardIndex] = updatedFlashcard;

    //set practiced flashcards
    setPracticedFlashcards([...practicedFlashcards, updatedFlashcard]);

    // console.log(practicedFlashcards);
   
    setCurrentCardIndex(currentCardIndex + 1);

    //once all practiced move to practiced flashcards to see if there are any due
    if (currentCardIndex === sentenceData.length - 1) {
      setCurrentCardIndex(0);
      setSentenceData(practicedFlashcards);
    }
  };

  const practiceFlashcard = (flashcard: FlashcardItem, grade: SuperMemoGrade): UpdatedFlashcard => {
    const { interval, repetition, efactor } = supermemo(flashcard, grade);
    const dueDate = dayjs().add(interval, 'day').toISOString();
    return {
      ...flashcard,
      interval,
      repetition,
      efactor,
      dueDate,
    };
  };

  //removed | undefined from the currentFlashcard type so that undefined types are never pushed
  const currentFlashcard: FlashcardItem = sentenceData[currentCardIndex];

  const isFlashcardDue = (dueDate: string | undefined): boolean => {
    if (!dueDate) {
      return false;
    }
    const currentDate = dayjs();
    const flashcardDueDate = dayjs(dueDate);
    console.log(flashcardDueDate.isSame(currentDate, 'day'))
    return flashcardDueDate.isSame(currentDate, 'day');
  };

  // Check if the current flashcard is due
  //  console.log(currentFlashcard)
  const isDue = currentFlashcard && isFlashcardDue(currentFlashcard.dueDate);
  
  //pass down the state of the visiblity of the flashcard back component from here
  const [isFlipped, setIsFlipped] = useState(false);

   return (
    <div>
      {currentFlashcard && isDue ? (
        <div>
          <Flashcard front={currentFlashcard.front} flipped={isFlipped} back={currentFlashcard.back} practice={practice}/> 
          <button onClick={() => setIsFlipped(!isFlipped)}>Show answer</button>
        </div>
      ) : (
        <div>
          <h3>No flashcards due</h3>
        </div>
      )}
    </div>
  );
};

export default SentenceScheduler;
