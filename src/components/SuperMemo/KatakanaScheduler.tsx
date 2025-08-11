import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { supermemo, SuperMemoGrade } from 'supermemo';
import Flashcard from '../Flashcard/Flashcard';
import { FlashcardItem } from '../Flashcard/FlashcardItem';
import { createKatakanaFlashcards, updateKatakana } from '../Fetching/useKatakanaFetch';
import Navbar from '../Navbar/Navbar';

interface UpdatedFlashcard extends FlashcardItem {
  due_date: string;
}

const KatakanaScheduler = (): JSX.Element => {
  const [katakanaData, setKatakanaData] = useState<FlashcardItem[]>([]);
  const [practicedFlashcards, setPracticedFlashcards] = useState<UpdatedFlashcard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    createKatakanaFlashcards()
      .then((data) => {
        setKatakanaData(data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  const practice = async (grade: SuperMemoGrade) => {
    const currentFlashcard = katakanaData[currentCardIndex];
    const updatedFlashcard = practiceFlashcard(currentFlashcard, grade);

    try {
      await updateKatakana(updatedFlashcard);
      console.log('Flashcard updated');
    } catch (error) {
      console.log('Error updating flashcard:', error);
    }

    // const updatedFlashcards = [...katakanaData];
    // updatedFlashcards[currentCardIndex] = updatedFlashcard;

    setPracticedFlashcards([...practicedFlashcards, updatedFlashcard]);
    setCurrentCardIndex(currentCardIndex + 1);

    //if you reach the END then data is set to the practiced 
    //flashcards and no more cards are shown cause none will be due
    //in case any are due to eFactor or rep, they will be
    if (currentCardIndex === katakanaData.length - 1) {
      setCurrentCardIndex(0);
      setKatakanaData(practicedFlashcards);
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
