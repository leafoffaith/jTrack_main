import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { supermemo, SuperMemoGrade } from 'supermemo'
import Flashcard from '../Flashcard/Flashcard';
import { FlashcardItem } from '../Flashcard/FlashcardItem';
import { useParams } from 'react-router-dom';
import { fetchKanjiByLevel } from '../Kanji/N5KanjiList';
//original flashcard component that has not yet been practiced

//props will include the array of flashcards that will be passed to the scheduler in the form of 'Deck'
//props
// interface SchedulerProps {
//   flashcards: FlashcardItem[];
// }
/**
 * @TODO useParams instead of possing props so that I can directly fetch and render when the scheduler component is rendered
 */
//updated flashcard is a flashcard that has been practiced
interface UpdatedFlashcard extends FlashcardItem {
  dueDate: string;
}
//Start of Scheduler component
const Scheduler = (): JSX.Element => {

  const [kanjiData, setKanjiData] = useState<[]>([]);
  
  //practiced flashcards array
  const [practicedFlashcards, setPracticedFlashcards] = useState<UpdatedFlashcard[]>([]);

  // title state
  const { title } = useParams<{ title: string }>();


  //fetches kanji data
  useEffect(() => {
    const fetchKanjiData = async () => {
      try {
        const data = await fetchKanjiByLevel(title);
        // console.log(data);
        setKanjiData(data);
      } catch (error) {
        console.error('Error fetching kanji data:', error);
      }
    };

    fetchKanjiData();
  }, [title]);




  // create local array of flashcards that will be used in the scheduler
  // this will be the array that will be updated with the updated flashcards

  const [currentCardIndex, setCurrentCardIndex] = useState(0);

  //local array of flashcards that will be used in the scheduler
  // const [flashcardsCopy, setFlashcardsCopy] = useState<FlashcardItem[]>(flashcards);

  //create empty array that will be used to store the updated flashcards
  //The type is set to be an updatedFlashcard to ensure that unpractice flashcards will never be added
  // const practicedFlashcards: UpdatedFlashcard[] = [];

  /** 
   *  Pratice function logic that uses practiceFlashcard function
    @PARAM grade - the grade of the flashcard that is being practiced
  */
  const practice = (grade: SuperMemoGrade): void => {
    const currentFlashcard = kanjiData[currentCardIndex];

    // Update the flashcard with the grade using the practiceFlashcard function
    const updatedFlashcard = practiceFlashcard(currentFlashcard, grade);
    console.log(updatedFlashcard);
    // Update the flashcard in your array or database with the updatedFlashcard data
    const updatedFlashcards = [...kanjiData];
    //replace the current flashcard with the updated flashcard
    updatedFlashcards[currentCardIndex] = updatedFlashcard;

    //set practiced flashcards
    setPracticedFlashcards([...practicedFlashcards, updatedFlashcard]);

    // console.log(practicedFlashcards);
   
    setCurrentCardIndex(currentCardIndex + 1);

    //once all practiced move to practiced flashcards to see if there are any due
    if (currentCardIndex === kanjiData.length - 1) {
      setCurrentCardIndex(0);
      setKanjiData(practicedFlashcards);
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
  const currentFlashcard: FlashcardItem = kanjiData[currentCardIndex];

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
  
   return (
    <div>
      {currentFlashcard && isDue ? (
        <div>
          {/* <h3>Flashcard {currentCardIndex + 1}</h3> */}
          <Flashcard front={currentFlashcard.front} back={currentFlashcard.back}/>
          <button onClick={() => practice(5)}>Easy</button>
          <button onClick={() => practice(3)}>Medium</button>
          <button onClick={() => practice(1)}>Hard</button>
        </div>
      ) : (
        <div>
          <h3>No flashcards due</h3>
        </div>
      )}
    </div>
  );
};

export default Scheduler;
