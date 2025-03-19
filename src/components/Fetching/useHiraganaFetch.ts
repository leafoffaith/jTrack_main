import { supaClient } from "../Client/supaClient";
import { FlashcardItem } from "../Flashcard/FlashcardItem";
import dayjs from "dayjs";

//Fetching new Hiragana
const fetchHiragana = async () => {
  const { data: hiragana, error } = await supaClient
    .from("hiragana")
    .select("*")
    .then();
  if (error) {
    console.warn(error);
  } else if (hiragana) {
    console.log("hiragana", hiragana);
    return hiragana;
  }
};

//Fetching studied hiragana flashcards
const fetchUserHiragana = async (userId: number) => {
  const { data: d, error } = await supaClient
    .from("studied_flashcards")
    .select("*")
    .eq("user_id", userId);

  if (error) {
    console.error("Error fetching data: ", error);
  }

  return d;
};

const fetchAvailableHiragana = async (userId: number) => {
  const studiedFlashcards = await fetchUserHiragana(userId);
  const hiragana = await fetchHiragana();

  const studiedFronts = studiedFlashcards?.map(card =>)
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
      front: hiraganaItem.hiragana,
      back: hiraganaItem.romaji,
      interval: hiraganaItem.interval ? hiraganaItem.interval : 1,
      repetition: hiraganaItem.repetition ? hiraganaItem.repetition : 1,
      efactor: hiraganaItem.eFactor ? hiraganaItem.eFactor : 2.5,
      dueDate: hiraganaItem.due_date
        ? hiraganaItem.due_date
        : dayjs().toISOString(),
    };
    flashcardItems.push(flashcard);
  });
  return flashcardItems;
};
