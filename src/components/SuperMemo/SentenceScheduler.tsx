import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { supermemo, SuperMemoGrade } from 'supermemo'
import Flashcard from '../Flashcard/Flashcard';
import { FlashcardItem } from '../Flashcard/FlashcardItem';
import { createSentenceFlashcards, createMultipleChoiceOptions } from '../JMDict/JMDict';
import Navbar from '../Navbar/Navbar';

interface UpdatedFlashcard extends FlashcardItem {
  due_date: string;
}
//Start of Scheduler component
const SentenceScheduler = (): JSX.Element => {

  //STATES
  const [sentenceData, setSentenceData] = useState<[]>([]);
  
  //practiced flashcards array
  const [practicedFlashcards, setPracticedFlashcards] = useState<UpdatedFlashcard[]>([]);

  //state for the options that will be generated alongside the flashcard and will be an array of arrays
  const [options, setOptions] = useState<[]>([]);

  //pass down the state of the visiblity of the flashcard back component from here
  const [isFlipped, setIsFlipped] = useState(false);
  
  const [currentCardIndex, setCurrentCardIndex] = useState(0);

  //fetches kanji data
  useEffect(() => {

    // fetchKanjiData();
    const fetchSentenceData = async () => {
        try {
            const data = await createSentenceFlashcards();
            setSentenceData(data);
            console.log(sentenceData)
        } catch (error) {
            console.error('Error fetching sentence data:', error);
        }
        }

        fetchSentenceData()
        .then(() => {
            console.log("Sentence data fetched successfully")
        }
        ).catch((error) => {
            console.log(error)
        }
        )
  }, []);



  /** 
   *@abstract Pratice function logic that uses practiceFlashcard function
    @PARAM grade - the grade of the flashcard that is being practiced
    @RETURN void
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
  const currentFlashcard: FlashcardItem = sentenceData[currentCardIndex];

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
  


    //reset isFlipped state to false when the current flashcard changes after a timeout of 3 seconds 
    useEffect(() => {
        setIsFlipped(false);
    }
    , [currentFlashcard]);

    
    useEffect(() => {
      const fetchOptions = async () => {
        if (currentFlashcard) {
          const options = await createMultipleChoiceOptions(currentFlashcard);
          setOptions(options);
        }
      };
    
      fetchOptions(); // Call the async function
    }, [currentFlashcard])

   return (
    <div>
      <div className="header-navbar">
        <Navbar />
      </div>
      {currentFlashcard && isDue ? (
        <div>
           <Flashcard options={options} front={currentFlashcard.front} flipped={isFlipped} setIsFlipped={setIsFlipped} back={currentFlashcard.back} practice={practice}/> 
            {/* <h1>{options[0]}</h1> */}
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
