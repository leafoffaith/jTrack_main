import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { supermemo, SuperMemoGrade } from 'supermemo';
import Flashcard from '../Flashcard/Flashcard';
import { FlashcardItem } from '../Flashcard/FlashcardItem';
import { fetchAvailableHiragana } from '../Fetching/useHiraganaFetch';
import Navbar from '../Navbar/Navbar';
import { supaClient } from '../Client/supaClient';
import { useAuth } from '../Client/useAuth';
import { getNumericUserId } from '../Client/userIdHelper';

interface UpdatedFlashcard extends FlashcardItem {
  due_date: string;
}

interface StudiedFlashcardData {
  user_id: number;
  front: string;
  back: string;
  interval: number;
  repetition: number;
  efactor: number;
  due_date: string;
  original_deck: string;
}


const HiraganaScheduler = (): JSX.Element => {
  const [hiraganaData, setHiraganaData] = useState<FlashcardItem[]>([]);
  const [practicedFlashcards, setPracticedFlashcards] = useState<UpdatedFlashcard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const { userId, isLoading } = useAuth();

  useEffect(() => {
    if (!userId || isLoading) return;

    // Fetch available flashcards (both studied and new)
    const fetchFlashcards = async (): Promise<void> => {
      try {
        const data = await fetchAvailableHiragana(userId);
        console.log("Available flashcards:", data);
        setHiraganaData(data);
      } catch (err) {
        console.error("Error fetching flashcards:", err);
      }
    };

    void fetchFlashcards();
  }, [userId, isLoading]);

  const practice = async (grade: SuperMemoGrade): Promise<void> => {
    if (!userId) {
      console.error('User not authenticated');
      return;
    }

    const currentFlashcard = hiraganaData[currentCardIndex];
    if (!currentFlashcard) return;

    const updatedFlashcard = practiceFlashcard(currentFlashcard, grade);
    console.log("Updated flashcard:", updatedFlashcard);

    try {
      // Get numeric user ID
      const numericUserId = await getNumericUserId(userId);
      if (!numericUserId) {
        console.error('Could not get numeric user ID');
        return;
      }

      // Only update studied_flashcards table (hiragana table columns are generated/read-only)

      // Add or update the flashcard in studiedFlashcard table
      const studiedData: StudiedFlashcardData = {
        user_id: numericUserId,
        front: updatedFlashcard.front,
        back: updatedFlashcard.back || '', // Ensure back is never undefined
        interval: updatedFlashcard.interval,
        repetition: updatedFlashcard.repetition,
        efactor: updatedFlashcard.efactor,
        due_date: updatedFlashcard.due_date,
        original_deck: 'hiragana'
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

    setPracticedFlashcards([...practicedFlashcards, updatedFlashcard]);
    setCurrentCardIndex(currentCardIndex + 1);

    // If we've gone through all cards, fetch new ones
    if (currentCardIndex === hiraganaData.length - 1) {
      setCurrentCardIndex(0);
      const fetchNewFlashcards = async (): Promise<void> => {
        try {
          const newData = await fetchAvailableHiragana(userId);
          setHiraganaData(newData);
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

  const currentFlashcard: FlashcardItem | undefined = hiraganaData[currentCardIndex];

  const isFlashcardDue = (due_date: string | undefined): boolean => {
    if (!due_date) {
      return false;
    }
    const currentDate = dayjs();
    const flashcardDueDate = dayjs(due_date);
    return flashcardDueDate.isSame(currentDate, 'day') || flashcardDueDate.isBefore(currentDate);
  };

  const isDue = currentFlashcard && isFlashcardDue(currentFlashcard.due_date);

  useEffect(() => {
    setIsFlipped(false);
  }, [currentCardIndex]);

  return (
    <div>
      <div className="header-navbar">
        <Navbar />
      </div>
      <div className="main-content">
        {currentFlashcard || isDue ? (
          <div>
            <Flashcard
              front={currentFlashcard.front}
              back={currentFlashcard.back}
              flipped={isFlipped}
              setIsFlipped={setIsFlipped}
              practice={(grade: SuperMemoGrade) => {
                void practice(grade);
              }}
            />
          </div>
        ) : (
          <div>
            <h3>No flashcards due</h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default HiraganaScheduler;
