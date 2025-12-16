import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { supermemo, SuperMemoGrade } from 'supermemo'
import Flashcard from '../Flashcard/Flashcard';
import { FlashcardItem } from '../Flashcard/FlashcardItem';
import { createSentenceFlashcards, createMultipleChoiceOptions } from '../JMDict/JMDict';
import Navbar from '../Navbar/Navbar';
import { fetchAvailableSentences } from '../Fetching/useSentenceFetch';
import { supaClient } from '../Client/supaClient';
import { useAuth } from '../Client/useAuth';
import { getNumericUserId } from '../Client/userIdHelper';

interface UpdatedFlashcard extends FlashcardItem {
  due_date: string;
}

interface StudiedFlashcardData {
  user_id: number;
  front: string;
  back?: string;
  interval: number;
  repetition: number;
  efactor: number;
  due_date: string;
  original_deck: string;
}

//Start of Scheduler component
const SentenceScheduler = (): JSX.Element => {
  //STATES
  const [sentenceData, setSentenceData] = useState<FlashcardItem[]>([]);
  
  //practiced flashcards array
  const [practicedFlashcards, setPracticedFlashcards] = useState<UpdatedFlashcard[]>([]);

  //state for the options that will be generated alongside the flashcard and will be an array of arrays
  const [options, setOptions] = useState<string[]>([]);

  //pass down the state of the visiblity of the flashcard back component from here
  const [isFlipped, setIsFlipped] = useState(false);
  
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const { userId, isLoading } = useAuth();

  //fetches sentence data
  useEffect(() => {
    if (isLoading) return;

    const fetchSentenceData = async () => {
      try {
        const allSentences = await createSentenceFlashcards();
        
        if (userId) {
          // Get user-specific available flashcards (pending + new)
          const availableSentences = await fetchAvailableSentences(userId, allSentences);
          setSentenceData(availableSentences);
        } else {
          // If not authenticated, just show first 10
          setSentenceData(allSentences.slice(0, 10));
        }
        console.log("Sentence data fetched successfully");
      } catch (error) {
        console.error('Error fetching sentence data:', error);
      }
    };

    void fetchSentenceData();
  }, [userId, isLoading]);



  /** 
   *@abstract Pratice function logic that uses practiceFlashcard function
    @PARAM grade - the grade of the flashcard that is being practiced
    @RETURN void
  */
  const practice = async (grade: SuperMemoGrade): Promise<void> => {
    if (!userId) {
      console.error('User not authenticated');
      return;
    }

    const currentFlashcard = sentenceData[currentCardIndex];
    if (!currentFlashcard) return;

    // Update the flashcard with the grade using the practiceFlashcard function
    const updatedFlashcard = practiceFlashcard(currentFlashcard, grade);
    console.log(updatedFlashcard);

    try {
      // Get numeric user ID
      const numericUserId = await getNumericUserId(userId);

      // Add or update the flashcard in studiedFlashcard table
      const studiedData: StudiedFlashcardData = {
        user_id: numericUserId,
        front: updatedFlashcard.front,
        back: updatedFlashcard.back,
        interval: updatedFlashcard.interval,
        repetition: updatedFlashcard.repetition,
        efactor: updatedFlashcard.efactor,
        due_date: updatedFlashcard.due_date,
        original_deck: 'sentence'
      };

      const { error: studiedError } = await supaClient
        .from('studied_flashcards')
        .upsert(studiedData, {
          onConflict: 'user_id,front,original_deck'
        });

      if (studiedError) {
        console.error('Error updating studied flashcard:', studiedError);
      } else {
        console.log('Flashcard updated successfully in studiedFlashcard table');
      }
    } catch (error) {
      console.error('Error updating flashcard:', error);
    }

    //set practiced flashcards
    setPracticedFlashcards([...practicedFlashcards, updatedFlashcard]);
   
    setCurrentCardIndex(currentCardIndex + 1);

    // If we've gone through all cards, fetch new ones
    if (currentCardIndex === sentenceData.length - 1) {
      setCurrentCardIndex(0);
      const fetchNewFlashcards = async (): Promise<void> => {
        try {
          const allSentences = await createSentenceFlashcards();
          const newData = await fetchAvailableSentences(userId, allSentences);
          setSentenceData(newData);
        } catch (err) {
          console.error("Error fetching new flashcards:", err);
        }
      };

      void fetchNewFlashcards();
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
           <Flashcard options={options} front={currentFlashcard.front} flipped={isFlipped} setIsFlipped={setIsFlipped} back={currentFlashcard.back} practice={practice} isDue={isDue}/> 
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
