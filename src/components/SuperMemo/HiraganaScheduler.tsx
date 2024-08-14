import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { supermemo, SuperMemoGrade } from 'supermemo';
import Flashcard from '../Flashcard/Flashcard';
import { FlashcardItem } from '../Flashcard/FlashcardItem';
import { createHiraganaFlashcards, updateFlashcard } from '../Fetching/useHiraganaFetch';
import Navbar from '../Navbar/Navbar';

interface UpdatedFlashcard extends FlashcardItem {
  dueDate: string;
}

const HiraganaScheduler = (): JSX.Element => {
  const [hiraganaData, setHiraganaData] = useState<FlashcardItem[]>([]);
  const [practicedFlashcards, setPracticedFlashcards] = useState<UpdatedFlashcard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);


  useEffect(() => {
    createHiraganaFlashcards()
      .then((data) => {
        console.log(data);
        /**
         * @TODO This should be updated to database
         */
        setHiraganaData(data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  const practice = async (grade: SuperMemoGrade): Promise<void> => {
    const currentFlashcard = hiraganaData[currentCardIndex];

    const updatedFlashcard = practiceFlashcard(currentFlashcard, grade);
    console.log(updatedFlashcard);

    try {
      await updateFlashcard(updatedFlashcard);
      console.log('Flashcard updated');
    } catch (error) {
      console.log('Error updating flashcard:', error);
    }

    const updatedFlashcards = [...hiraganaData];
    updatedFlashcards[currentCardIndex] = updatedFlashcard;

    setPracticedFlashcards([...practicedFlashcards, updatedFlashcard]);

    setCurrentCardIndex(currentCardIndex + 1);
    if (currentCardIndex === hiraganaData.length - 1) {
      setCurrentCardIndex(0);
      setHiraganaData(practicedFlashcards);
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
    return flashcardDueDate.isSame(currentDate, 'day');
  };

  const isDue = currentFlashcard && isFlashcardDue(currentFlashcard.dueDate);

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

export default HiraganaScheduler;
