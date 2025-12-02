import { supaClient } from "../Client/supaClient";
import { FlashcardItem } from "../Flashcard/FlashcardItem";
import dayjs from "dayjs";
import { getNumericUserId } from "../Client/userIdHelper";

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
  original_deck?: string;
  due_date?: string;
  back?: string | any; // Can be string or jsonb
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
  
  // Log schema to check actual columns (only on first fetch)
  if (hiragana && hiragana.length > 0 && !(window as any).__hiraganaSchemaLogged) {
    console.log('Hiragana table columns:', Object.keys(hiragana[0]));
    console.log('Sample hiragana row:', hiragana[0]);
    (window as any).__hiraganaSchemaLogged = true;
  }
  
  return hiragana || [];
};


//Fetching studied hiragana flashcards
const fetchUserHiragana = async (
  userId: string
): Promise<StudiedFlashcard[]> => {
  const numericUserId = await getNumericUserId(userId);
  
  const { data: d, error } = await supaClient
    .from("studied_flashcards")
    .select("*")
    .eq("user_id", numericUserId)
    .eq("original_deck", "hiragana");

  if (error) {
    console.error("Error fetching data: ", error);
    return [];
  }

  return d || [];
};

export const fetchAvailableHiragana = async (
  userId: string
): Promise<FlashcardItem[]> => {
  if (!userId) {
    return [];
  }

  //Already studied flashcards
  const studiedFlashcards = await fetchUserHiragana(userId);

  //Fetching all new hiragana
  const hiragana = await fetchHiragana();

  if (!hiragana) {
    console.error("Failed to fetch hiragana data");
    return [];
  }

  // Get all studied hiragana characters
  const studiedFronts = studiedFlashcards.map((card) => card.front);

  // Get currently due flashcards (prioritize these)
  const dueFlashcards = studiedFlashcards
    .filter((card) => {
      if (!card.due_date) return false;
      const dueDate = new Date(card.due_date);
      const now = new Date();
      return dueDate <= now;
    })
    .map((card) => ({
      front: card.front,
      back: card.back || '',
      interval: card.interval ?? 1,
      repetition: card.repetition ?? 0,
      efactor: card.efactor ?? 2.5,
      due_date: card.due_date,
    }));

  // Filter out studied hiragana to get new ones
  const newHiragana = hiragana
    .filter((h) => !studiedFronts.includes(h.hiragana))
    .slice(0, 5); // Get only 5 new hiragana

  // Combine: due flashcards first, then new flashcards
  const availableFlashcards = [
    ...dueFlashcards.map((card) => ({
      front: card.front,
      back: card.back,
      interval: card.interval,
      repetition: card.repetition,
      efactor: card.efactor,
      due_date: card.due_date,
    })),
    ...newHiragana.map((h) => ({
      front: h.hiragana,
      back: h.romaji,
      interval: h.interval ?? 1,
      repetition: h.repetition ?? 0,
      efactor: h.eFactor ?? 2.5,
      due_date: h.due_date || dayjs().toISOString(),
    })),
  ];

  return availableFlashcards;
};

// Removed updateFlashcard - hiragana table columns are read-only/generated
// All updates go to studied_flashcards table only

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
      due_date: hiraganaItem.due_date || dayjs().toISOString(),
    };
    flashcardItems.push(flashcard);
  });
  return flashcardItems;
};
