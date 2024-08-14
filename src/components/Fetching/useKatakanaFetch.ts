import { supaClient } from "../Client/supaClient";
import { FlashcardItem } from "../Flashcard/FlashcardItem";
import dayjs from "dayjs";

const fetchKatakana = async () => {
  const { data: katakana, error } = await supaClient
    .from("katakana")
    .select("*")
    .then();
  if (error) {
    console.warn(error);
  } else if (katakana) {
    //   console.log('hiragana', hiragana)
    return katakana;
  }
};

//update katakana flashcard
export const updateKatakana = async (flashcard: FlashcardItem) => {
  const { error } = await supaClient
    .from("katakana")
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
export const createKatakanaFlashcards = async () => {
  const flashcardItems: FlashcardItem[] = [];
  console.log("fetching hiragana");
  const katakana = await fetchKatakana();
  katakana.forEach((katakanaItem: any) => {
    console.log(katakanaItem);
    const flashcard: FlashcardItem = {
      front: katakanaItem.front,
      back: katakanaItem.back,
      interval: katakanaItem.interval ? katakanaItem.interval : 1,
      repetition: katakanaItem.repetition ? katakanaItem.repetition : 1,
      efactor: katakanaItem.eFactor ? katakanaItem.eFactor : 2.5,
      dueDate: katakanaItem.due_date
        ? katakanaItem.due_date
        : dayjs().toISOString(),
    };
    flashcardItems.push(flashcard);
  });
  return flashcardItems;
};
