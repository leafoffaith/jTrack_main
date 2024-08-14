import { supaClient } from "../Client/supaClient";
import { FlashcardItem } from "../Flashcard/FlashcardItem";
import dayjs from "dayjs";

const fetchHiragana = async () => {
  const { data: hiragana, error } = await supaClient
    .from("hiragana")
    .select("*")
    .then();
  if (error) {
    console.warn(error);
  } else if (hiragana) {
    //   console.log('hiragana', hiragana)
    return hiragana;
  }
};

export const updateFlashcard = async (flashcard: FlashcardItem) => {
  const { error } = await supaClient
    .from("hiragana")
    .update({
      interval: flashcard.interval,
      repetition: flashcard.repetition,
      eFactor: flashcard.efactor,
      due_date: flashcard.dueDate,
    })
    .eq("front", flashcard.front)
    .then();
  if (error) {
    console.log(error);
  }
};

//create flashcard items from hiragana data with front as the hiragana and back as the romaji that uses the fetch hiragana async function
export const createHiraganaFlashcards = async () => {
  /**
   * @TODO check if the user already has hiragana flashcards in the database
   * if so, return the flashcards.
   * alternatively, if this is the mandatory test then create flashcards from the hiragana data
   */
  const flashcardItems: FlashcardItem[] = [];
  console.log("fetching hiragana");
  const hiragana = await fetchHiragana();
  hiragana.forEach((hiraganaItem: any) => {
    console.log(hiraganaItem);
    const flashcard: FlashcardItem = {
      front: hiraganaItem.front,
      back: hiraganaItem.back,
      interval: hiraganaItem.interval ? hiraganaItem.interval : 0,
      repetition: hiraganaItem.repetition ? hiraganaItem.repetition : 0,
      efactor: hiraganaItem.eFactor ? hiraganaItem.eFactor : 0,
      dueDate: hiraganaItem.due_date
        ? hiraganaItem.due_date
        : dayjs().toISOString(),
    };
    flashcardItems.push(flashcard);
  });
  return flashcardItems;
};
