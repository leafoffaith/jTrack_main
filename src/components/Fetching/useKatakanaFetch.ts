import { supaClient } from "../Client/supaClient";
import { FlashcardItem } from "../Flashcard/FlashcardItem";
import dayjs from "dayjs";
import { getNumericUserId } from "../Client/userIdHelper";
import { checkUserHasStudiedRecently, updateUserHasStudied } from "../Client/userStudyHelper";
import { getNewCardsShownToday } from "../Client/sessionHelper";

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
  last_studied?: string; // Timestamp when card was studied
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
): Promise<{ cards: FlashcardItem[]; message?: string }> => {
  if (!userId) {
    return { cards: [] };
  }

  // Check if user has studied recently (within 24 hours)
  const hasStudiedRecently = await checkUserHasStudiedRecently(userId);
  await updateUserHasStudied(userId, hasStudiedRecently);

  // Already studied flashcards
  const studiedFlashcards = await fetchUserKatakana(userId);

  // Fetching all new katakana
  const katakana = await fetchKatakana();

  if (!katakana) {
    console.error("Failed to fetch katakana data");
    return { cards: [] };
  }

  // Get all studied katakana characters
  const studiedFronts = studiedFlashcards.map((card) => card.front);

  // Priority 1: Get currently due flashcards (due_date < current time)
  const dueFlashcards = studiedFlashcards
    .filter((card) => {
      if (!card.due_date) return false;
      const dueDate = new Date(card.due_date);
      const now = new Date();
      return dueDate < now; // Past due date
    })
    .map((card) => ({
      front: card.front,
      back: card.back || '',
      interval: card.interval ?? 1,
      repetition: card.repetition ?? 0,
      efactor: card.efactor ?? 2.5,
      due_date: card.due_date,
    }));

  // If there are due cards, show ONLY those (limit to 3 total per session)
  if (dueFlashcards.length > 0) {
    return { cards: dueFlashcards.slice(0, 3) };
  }

  // Priority 2: No cards are due AND user hasn't studied in 24 hours
  if (!hasStudiedRecently) {
    // Filter out studied katakana to get new ones
    const allNewKatakana = katakana.filter((k) => !studiedFronts.includes(k.front));
    
    // Limit to 3 new cards per session
    const newKatakana = allNewKatakana.slice(0, 3).map((k) => ({
      front: k.front,
      back: k.back,
      interval: 1,
      repetition: 0,
      efactor: 2.5,
      due_date: dayjs().toISOString(),
    }));

    return { cards: newKatakana };
  }

  // Priority 3: User has studied within 24 hours AND no cards are due
  return { 
    cards: [],
    message: "You have finished studying for now! Come back later :)"
  };
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
