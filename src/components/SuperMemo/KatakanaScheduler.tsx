import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { supermemo, SuperMemoGrade } from 'supermemo';
import Flashcard from '../Flashcard/Flashcard';
import { FlashcardItem } from '../Flashcard/FlashcardItem';
import { fetchAvailableKatakana } from '../Fetching/useKatakanaFetch';
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

const KatakanaScheduler = (): JSX.Element => {
  const [katakanaData, setKatakanaData] = useState<FlashcardItem[]>([]);
  const [practicedFlashcards, setPracticedFlashcards] = useState<UpdatedFlashcard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const { userId, isLoading } = useAuth();

  useEffect(() => {
    if (!userId || isLoading) return;

    const fetchFlashcards = async (): Promise<void> => {
      try {
        const data = await fetchAvailableKatakana(userId);
        console.log("Available katakana flashcards:", data);
        setKatakanaData(data);
      } catch (err) {
        console.error("Error fetching flashcards:", err);
      }
    };

    void fetchFlashcards();
  }, [userId, isLoading]);

  const practice = async (grade: SuperMemoGrade) => {
    if (!userId) {
      console.error('User not authenticated');
      return;
    }

    const currentFlashcard = katakanaData[currentCardIndex];
    if (!currentFlashcard) return;

    const updatedFlashcard = practiceFlashcard(currentFlashcard, grade);

    try {
      // Get numeric user ID
      const numericUserId = await getNumericUserId(userId);

      // Only update studied_flashcards table (katakana table columns are generated/read-only)

      // Add or update the flashcard in studiedFlashcard table
      const studiedData: StudiedFlashcardData = {
        user_id: numericUserId,
        front: updatedFlashcard.front,
        back: updatedFlashcard.back || '',
        interval: updatedFlashcard.interval,
        repetition: updatedFlashcard.repetition,
        efactor: updatedFlashcard.efactor,
        due_date: updatedFlashcard.due_date,
        original_deck: 'katakana'
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
    if (currentCardIndex === katakanaData.length - 1) {
      setCurrentCardIndex(0);
      const fetchNewFlashcards = async (): Promise<void> => {
        try {
          const newData = await fetchAvailableKatakana(userId);
          setKatakanaData(newData);
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

  const currentFlashcard: FlashcardItem | undefined = katakanaData[currentCardIndex];

  /**
   * @TODO this needs to be simplified, because it's a timestamp it has to be either on or after tsz
   * @param due_date 
   * @returns 
   */
  const isFlashcardDue = (due_date: string | undefined): boolean => {
    if (!due_date) {
      return false;
    }
    const currentDate = dayjs();
    const flashcardDueDate = dayjs(due_date);
    return flashcardDueDate.isSame(currentDate, 'day');
  };

  const isDue = currentFlashcard && isFlashcardDue(currentFlashcard.due_date);

  useEffect(() => {
    setIsFlipped(false);
  }, [currentFlashcard]);

  return (
    <div>
      <div className="header-navbar">
        <Navbar />
      </div>
      {currentFlashcard && isDue ? (
        <div>
          <Flashcard
            front={currentFlashcard.front}
            back={currentFlashcard.back}
            flipped={isFlipped}
            setIsFlipped={setIsFlipped}
            practice={practice}
          />
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
