import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { supermemo, SuperMemoGrade } from 'supermemo';
import Flashcard from '../Flashcard/Flashcard';
import { FlashcardItem } from '../Flashcard/FlashcardItem';
import { fetchAvailableHiragana, updateFlashcard } from '../Fetching/useHiraganaFetch';
import Navbar from '../Navbar/Navbar';
import { supaClient } from '../Client/supaClient';

interface UpdatedFlashcard extends FlashcardItem {
  dueDate: string;
}

interface StudiedFlashcardData {
  user_id: number;
  front: string;
  back: string;
  interval: number;
  repetition: number;
  efactor: number;
  dueDate: string;
}

const HiraganaScheduler = (): JSX.Element => {
  const [hiraganaData, setHiraganaData] = useState<FlashcardItem[]>([]);
  const [practicedFlashcards, setPracticedFlashcards] = useState<UpdatedFlashcard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [userId, setUserId] = useState<number>(1); // TODO: Get actual user ID from auth

  useEffect(() => {
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
  }, [userId]);

  const practice = async (grade: SuperMemoGrade): Promise<void> => {
    const currentFlashcard = hiraganaData[currentCardIndex];
    if (!currentFlashcard) return;

    const updatedFlashcard = practiceFlashcard(currentFlashcard, grade);
    console.log("Updated flashcard:", updatedFlashcard);

    try {
      // Update the flashcard in the hiragana table
      await updateFlashcard(updatedFlashcard);

      // Add or update the flashcard in studied_flashcards table
      const studiedData: StudiedFlashcardData = {
        user_id: userId,
        front: updatedFlashcard.front,
        back: updatedFlashcard.back || '', // Ensure back is never undefined
        interval: updatedFlashcard.interval,
        repetition: updatedFlashcard.repetition,
        efactor: updatedFlashcard.efactor,
        dueDate: updatedFlashcard.dueDate
      };

      const { error: studiedError } = await supaClient
        .from('studied_flashcards')
        .upsert(studiedData);

      if (studiedError) {
        console.error('Error updating studied flashcard:', studiedError);
      }

      console.log('Flashcard updated successfully');
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
    const dueDate = dayjs().add(interval, 'day').toISOString();
    return {
      ...flashcard,
      interval,
      repetition,
      efactor,
      dueDate,
    };
  };

  const currentFlashcard: FlashcardItem | undefined = hiraganaData[currentCardIndex];

  const isFlashcardDue = (dueDate: string | undefined): boolean => {
    if (!dueDate) {
      return false;
    }
    const currentDate = dayjs();
    const flashcardDueDate = dayjs(dueDate);
    return flashcardDueDate.isSame(currentDate, 'day') || flashcardDueDate.isBefore(currentDate);
  };

  const isDue = currentFlashcard && isFlashcardDue(currentFlashcard.dueDate);

  useEffect(() => {
    setIsFlipped(false);
  }, [currentCardIndex]);

  return (
    <div>
      <div className="header-navbar">
        <Navbar />
      </div>
      <div className="main-content">
        {currentFlashcard && isDue ? (
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
