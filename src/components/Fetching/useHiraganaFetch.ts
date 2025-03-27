import { supaClient } from "../Client/supaClient";
import { FlashcardItem } from "../Flashcard/FlashcardItem";
import dayjs from "dayjs";

interface HiraganaItem {
  hiragana: string;
  romaji: string;
  interval?: number;
  repetition?: number;
  eFactor?: number;
  due_date?: string;
}

interface StudiedFlashcard extends FlashcardItem {
  user_id: number;
}

//Fetching new Hiragana
const fetchHiragana = async (): Promise<HiraganaItem[]> => {
  const { data: hiragana, error } = await supaClient
    .from("hiragana")
    .select("*")
    .then();
  if (error) {
    console.warn(error);
    return [];
  }
  return hiragana || [];
};

//Fetching studied hiragana flashcards
const fetchUserHiragana = async (
  userId: number
): Promise<StudiedFlashcard[]> => {
  const { data: d, error } = await supaClient
    .from("studied_flashcards")
    .select("*")
    .eq("user_id", userId);

  if (error) {
    console.error("Error fetching data: ", error);
    return [];
  }

  return d || [];
};

export const fetchAvailableHiragana = async (
  userId: number
): Promise<FlashcardItem[]> => {
  //Already studied flashcards
  const studiedFlashcards = await fetchUserHiragana(userId);

  //Fetching all new hiragana
  const hiragana = await fetchHiragana();

  if (!hiragana || !studiedFlashcards) {
    console.error("Failed to fetch data");
    return [];
  }

  // Get all studied hiragana characters
  const studiedFronts = studiedFlashcards.map((card) => card.front);

  // Filter out studied hiragana to get new ones
  const newHiragana = hiragana
    .filter((h) => !studiedFronts.includes(h.hiragana))
    .slice(0, 5); // Get only 5 new hiragana

  // Get currently due flashcards
  const dueFlashcards = studiedFlashcards.filter((card) => {
    const dueDate = card.dueDate ? new Date(card.dueDate) : new Date();
    return dueDate <= new Date();
  });

  // Combine new and due flashcards
  const availableFlashcards = [
    ...newHiragana.map((h) => ({
      front: h.hiragana,
      back: h.romaji,
      interval: h.interval ?? 1,
      repetition: h.repetition ?? 1,
      efactor: h.eFactor ?? 2.5,
      dueDate: h.due_date || dayjs().toISOString(),
    })),
    ...dueFlashcards,
  ];

  return availableFlashcards;
};

export const updateFlashcard = async (
  flashcard: FlashcardItem
): Promise<void> => {
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
export const createHiraganaFlashcards = async (): Promise<FlashcardItem[]> => {
  /**
   * @TODO check if the user already has hiragana flashcards in the database
   * if so, return the flashcards.
   * alternatively, if this is the mandatory test then create flashcards from the hiragana data
   */
  const flashcardItems: FlashcardItem[] = [];
  console.log("fetching hiragana");
  const hiragana = await fetchHiragana();
  hiragana.forEach((hiraganaItem: HiraganaItem) => {
    console.log(hiraganaItem);
    const flashcard: FlashcardItem = {
      front: hiraganaItem.hiragana,
      back: hiraganaItem.romaji,
      interval: hiraganaItem.interval ?? 1,
      repetition: hiraganaItem.repetition ?? 1,
      efactor: hiraganaItem.eFactor ?? 2.5,
      dueDate: hiraganaItem.due_date || dayjs().toISOString(),
    };
    flashcardItems.push(flashcard);
  });
  return flashcardItems;
};
