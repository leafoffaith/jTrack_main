import { supaClient } from "../Client/supaClient";
import { FlashcardItem } from "../Flashcard/FlashcardItem";
import dayjs from "dayjs";
import { getNumericUserId } from "../Client/userIdHelper";

interface KatakanaItem {
  front: string;
  back: string;
  interval?: number;
  repetition?: number;
  eFactor?: number;
  due_date?: string;
}

interface StudiedFlashcard extends FlashcardItem {
  user_id: number;
  original_deck?: string;
  due_date?: string;
  back?: string | any;
}

const fetchKatakana = async (): Promise<KatakanaItem[]> => {
  const { data: katakana, error } = await supaClient
    .from("katakana")
    .select("*")
    .then();
  if (error) {
    console.warn(error);
    return [];
  }
  
  // Log schema to check actual columns (only on first fetch)
  if (katakana && katakana.length > 0 && !(window as any).__katakanaSchemaLogged) {
    console.log('Katakana table columns:', Object.keys(katakana[0]));
    console.log('Sample katakana row:', katakana[0]);
    (window as any).__katakanaSchemaLogged = true;
  }
  
  return katakana || [];
};

//Fetching studied katakana flashcards
const fetchUserKatakana = async (
  userId: string
): Promise<StudiedFlashcard[]> => {
  const numericUserId = await getNumericUserId(userId);
  
  const { data: d, error } = await supaClient
    .from("studied_flashcards")
    .select("*")
    .eq("user_id", numericUserId)
    .eq("original_deck", "katakana");

  if (error) {
    console.error("Error fetching data: ", error);
    return [];
  }

  return d || [];
};

export const fetchAvailableKatakana = async (
  userId: string
): Promise<FlashcardItem[]> => {
  if (!userId) {
    return [];
  }

  //Already studied flashcards
  const studiedFlashcards = await fetchUserKatakana(userId);

  //Fetching all new katakana
  const katakana = await fetchKatakana();

  if (!katakana) {
    console.error("Failed to fetch katakana data");
    return [];
  }

  // Get all studied katakana characters
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

  // Filter out studied katakana to get new ones
  const newKatakana = katakana
    .filter((k) => !studiedFronts.includes(k.front))
    .slice(0, 5); // Get only 5 new katakana

  // Combine: due flashcards first, then new flashcards
  const availableFlashcards = [
    ...dueFlashcards,
    ...newKatakana.map((k) => ({
      front: k.front,
      back: k.back,
      interval: k.interval ?? 1,
      repetition: k.repetition ?? 0,
      efactor: k.eFactor ?? 2.5,
      due_date: k.due_date || dayjs().toISOString(),
    })),
  ];

  return availableFlashcards;
};

// Removed updateKatakana - katakana table columns are read-only/generated
// All updates go to studied_flashcards table only

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
      due_date: katakanaItem.due_date
        ? katakanaItem.due_date
        : dayjs().toISOString(),
    };
    flashcardItems.push(flashcard);
  });
  return flashcardItems;
};
