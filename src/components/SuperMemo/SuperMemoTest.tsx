//import supermemo
import { supermemo, SuperMemoItem, SuperMemoGrade } from 'supermemo'
import dayjs from 'dayjs';

const SuperMemoTest:React.FC = () => {
interface Flashcard extends SuperMemoItem {
  front: string;
  back: string;
  dueDate: string;
}

function practice(flashcard: Flashcard, grade: SuperMemoGrade): Flashcard {
  const { interval, repetition, efactor } = supermemo(flashcard, grade);
  const dueDate = dayjs().add(interval, 'day').toISOString();
  return {
    ...flashcard,
    interval,
    repetition,
    efactor,
    dueDate,
  };
}

//create a flashcard
const flashcard: Flashcard = {
  front: 'What is the capital of France?',
  back: 'Paris',
  interval: 0,
  repetition: 0,
  efactor: 2.5,
  dueDate: dayjs().toISOString(),
};

console.log("Flashcard before practice")
console.log(flashcard);

//practice the flashcard
//grade 5 = perfect response
//in practice, grade will be determined by user input
//we will only consider grade 5 and grade 1 since we are only doing a good and again button to simplify the process
const practicedFlashcard = practice(flashcard, 5);

console.log("Flashcard after practice")
console.log(practicedFlashcard);

//practice the flashcard again
const practicedFlashcardAgain = practice(practicedFlashcard, 1);

console.log("Flashcard after practice again")
console.log(practicedFlashcardAgain);

return (
  <div>
    <h1>SuperMemo Test</h1>
  </div>
)

}

export default SuperMemoTest;