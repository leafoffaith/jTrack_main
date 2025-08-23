import { DO_NOT_USE_OR_YOU_WILL_BE_FIRED_EXPERIMENTAL_FORM_ACTIONS, useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { supermemo, SuperMemoGrade } from 'supermemo'
import Flashcard from '../Flashcard/Flashcard';
import { FlashcardItem } from '../Flashcard/FlashcardItem';
import { useParams } from 'react-router-dom';
import { fetchKanjiByLevel } from '../Kanji/N5KanjiList';
import Navbar from '../Navbar/Navbar';

interface UpdatedFlashcard extends FlashcardItem {
  due_date: string;
}
//Start of Scheduler component
const KanjiScheduler = (): JSX.Element => {


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
        //get the first 10 only
        const firstTen = data.slice(0, 10);
        // console.log(data);
        setKanjiData(firstTen);
      } catch (error) {
        console.error('Error fetching kanji data:', error);
      }
    };

    fetchKanjiData();
  }, [title]);


  const [currentCardIndex, setCurrentCardIndex] = useState(0);

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
      //set local storage to true
      setReviewed(true);
    }
  };

  const practiceFlashcard = (flashcard: FlashcardItem, grade: SuperMemoGrade): UpdatedFlashcard => {
    const { interval, repetition, efactor } = supermemo(flashcard, grade);
    const due_date = dayjs().add(interval, 'day').toISOString();
    return {
      ...flashcard,
      interval,
      repetition,
      efactor,
      due_date,
    };
  };

  //removed | undefined from the currentFlashcard type so that undefined types are never pushed
  const currentFlashcard: FlashcardItem = kanjiData[currentCardIndex];

  const isFlashcardDue = (due_date: string | undefined): boolean => {
    if (!due_date) {
      return false;
    }
    const currentDate = dayjs();
    const flashcardDueDate = dayjs(due_date);
    console.log(flashcardDueDate.isSame(currentDate, 'day'))
    return flashcardDueDate.isSame(currentDate, 'day');
  };

  // Check if the current flashcard is due
  //  console.log(currentFlashcard)
  const isDue = currentFlashcard && isFlashcardDue(currentFlashcard.due_date);
  
  //pass down the state of the visiblity of the flashcard back component from here
  const [isFlipped, setIsFlipped] = useState(false);

  //reset isFlipped state to false when the current flashcard changes after a timeout of 3 seconds 
  useEffect(() => {
     setIsFlipped(false);
  }
  , [currentFlashcard]);

   return (
    <div>
      <div className="header-navbar">
        <Navbar />
      </div>
      {currentFlashcard && isDue ? (
        <div>
          {/* if flashcard has Kanjiback pass that instead of back */}
          <Flashcard
            front={currentFlashcard.front}
            back={currentFlashcard.back}
            kanjiBack={currentFlashcard.kanjiBack}
            flipped={isFlipped}
            setIsFlipped={setIsFlipped}
            practice={practice}
          />
          {/* <button onClick={() => setIsFlipped(!isFlipped)}>Show answer</button> */}
        </div>
      ) : (
        <div>
          <h3>No flashcards due</h3>
        </div>
      )}
    </div>
  );
};

export default KanjiScheduler;
