import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { supermemo, SuperMemoGrade } from 'supermemo'
import Flashcard from '../Flashcard/Flashcard';
import { FlashcardItem } from '../Flashcard/FlashcardItem';
import { useParams } from 'react-router-dom';
import { fetchKanjiByLevel } from '../Kanji/N5KanjiList';
import Navbar from '../Navbar/Navbar';
import { fetchAvailableKanji } from '../Fetching/useKanjiFetch';
import { supaClient } from '../Client/supaClient';
import { useAuth } from '../Client/useAuth';
import { getNumericUserId } from '../Client/userIdHelper';

interface UpdatedFlashcard extends FlashcardItem {
  due_date: string;
}

interface StudiedFlashcardData {
  user_id: number;
  front: string;
  back?: any; // jsonb
  kanji_meaning?: string;
  on_readings?: string;
  name_readings?: string;
  stroke_count?: string;
  interval: number;
  repetition: number;
  efactor: number;
  due_date: string;
  original_deck: string;
}

//Start of Scheduler component
const KanjiScheduler = (): JSX.Element => {
  const [kanjiData, setKanjiData] = useState<FlashcardItem[]>([]);
  const [practicedFlashcards, setPracticedFlashcards] = useState<UpdatedFlashcard[]>([]);
  const { userId, isLoading } = useAuth();

  // title state
  const { title } = useParams<{ title: string }>();

  //fetches kanji data
  useEffect(() => {
    if (isLoading) return;

    const fetchKanjiData = async () => {
      try {
        const allKanji = await fetchKanjiByLevel(title || 'N5');
        
        if (userId) {
          // Get user-specific available flashcards (pending + new)
          const availableKanji = await fetchAvailableKanji(userId, allKanji);
          setKanjiData(availableKanji);
        } else {
          // If not authenticated, just show first 10
          setKanjiData(allKanji.slice(0, 10));
        }
      } catch (error) {
        console.error('Error fetching kanji data:', error);
      }
    };

    fetchKanjiData();
  }, [title, userId, isLoading]);


  const [currentCardIndex, setCurrentCardIndex] = useState(0);

  /** 
   *  Pratice function logic that uses practiceFlashcard function
    @PARAM grade - the grade of the flashcard that is being practiced
  */
  const practice = async (grade: SuperMemoGrade): Promise<void> => {
    if (!userId) {
      console.error('User not authenticated');
      return;
    }

    const currentFlashcard = kanjiData[currentCardIndex];
    if (!currentFlashcard) return;

    // Update the flashcard with the grade using the practiceFlashcard function
    const updatedFlashcard = practiceFlashcard(currentFlashcard, grade);
    console.log(updatedFlashcard);

    try {
      // Get numeric user ID
      const numericUserId = await getNumericUserId(userId);

      // Extract kanji data for separate columns
      const kanjiBack = updatedFlashcard.kanjiBack;
      const kanjiMeaning = kanjiBack?.meaning?.[0] || '';
      const onReadings = kanjiBack?.on_readings?.join(', ') || '';
      const nameReadings = kanjiBack?.name_readings?.join(', ') || '';
      const strokeCount = kanjiBack?.stroke_count?.toString() || '0';

      // Add or update the flashcard in studiedFlashcard table
      const studiedData: StudiedFlashcardData = {
        user_id: numericUserId,
        front: updatedFlashcard.front,
        back: updatedFlashcard.back || updatedFlashcard.kanjiBack, // Store as jsonb
        kanji_meaning: kanjiMeaning,
        on_readings: onReadings,
        name_readings: nameReadings,
        stroke_count: strokeCount,
        interval: updatedFlashcard.interval,
        repetition: updatedFlashcard.repetition,
        efactor: updatedFlashcard.efactor,
        due_date: updatedFlashcard.due_date,
        original_deck: 'kanji'
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
    if (currentCardIndex === kanjiData.length - 1) {
      setCurrentCardIndex(0);
      const fetchNewFlashcards = async (): Promise<void> => {
        try {
          const allKanji = await fetchKanjiByLevel(title || 'N5');
          const newData = await fetchAvailableKanji(userId, allKanji);
          setKanjiData(newData);
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
