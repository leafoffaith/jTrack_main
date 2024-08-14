import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { supermemo, SuperMemoGrade } from 'supermemo'
import Flashcard from '../Flashcard/Flashcard';
import { FlashcardItem } from '../Flashcard/FlashcardItem';
import { createKatakanaFlashcards, updateKatakana } from '../Fetching/useKatakanaFetch';
import Navbar from '../Navbar/Navbar';
interface UpdatedFlashcard extends FlashcardItem {
  dueDate: string;
}
//Start of Scheduler component
const KatakanaScheduler = (): JSX.Element => {

  const [katakanaData, setKatakanaData] = useState<[]>([]);

  //practiced flashcards array
  const [practicedFlashcards, setPracticedFlashcards] = useState<UpdatedFlashcard[]>([]);

  //useEffect to get hiragana data from imported function
  useEffect(() => {
    createKatakanaFlashcards().then((data) => {
      console.log(data)
      setKatakanaData(data);
    }).catch((err) => {
      console.log(err);
    }
    );
  }
    , []);


  const [currentCardIndex, setCurrentCardIndex] = useState(0);

  /** 
   *  Pratice function logic that uses practiceFlashcard function
    @PARAM grade - the grade of the flashcard that is being practiced
  */
  const practice = async (grade: SuperMemoGrade) => {
    const currentFlashcard = katakanaData[currentCardIndex];

    // Update the flashcard with the grade using the practiceFlashcard function
    const updatedFlashcard = practiceFlashcard(currentFlashcard, grade);

    try {
      await updateKatakana(updatedFlashcard);
      console.log('Flashcard updated');
    } catch (error) {
      console.log('Error updating flashcard:', error);
    }


    // Update the flashcard in your array or database with the updatedFlashcard data
    const updatedFlashcards = [...katakanaData];
    //replace the current flashcard with the updated flashcard
    updatedFlashcards[currentCardIndex] = updatedFlashcard;

    //set practiced flashcards
    setPracticedFlashcards([...practicedFlashcards, updatedFlashcard]);

    // console.log(practicedFlashcards);

    setCurrentCardIndex(currentCardIndex + 1);

    //once all practiced move to practiced flashcards to see if there are any due
    if (currentCardIndex === katakanaData.length - 1) {
      setCurrentCardIndex(0);
      setKatakanaData(practicedFlashcards);
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
  const currentFlashcard: FlashcardItem = katakanaData[currentCardIndex];

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

export default KatakanaScheduler;
