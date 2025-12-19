import { supaClient } from "../Client/supaClient";
import { FlashcardItem } from "../Flashcard/FlashcardItem";
import dayjs from "dayjs";
import { getNumericUserId } from "../Client/userIdHelper";
import { checkUserHasStudiedRecently, updateUserHasStudied, getUserHasStudied } from "../Client/userStudyHelper";
import { getNewCardsShownToday } from "../Client/sessionHelper";

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
  last_studied?: string; // Timestamp when card was studied
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
): Promise<{ cards: FlashcardItem[]; message?: string }> => {
  if (!userId) {
    return { cards: [] };
  }

  // Check if user has studied recently (within 24 hours)
  const hasStudiedRecently = await checkUserHasStudiedRecently(userId);
  await updateUserHasStudied(userId, hasStudiedRecently);

  // Already studied flashcards
  const studiedFlashcards = await fetchUserHiragana(userId);

  // Fetching all new hiragana
  const hiragana = await fetchHiragana();

  if (!hiragana) {
    console.error("Failed to fetch hiragana data");
    return { cards: [] };
  }

  // Get all studied hiragana characters
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

  // If there are due cards, show all due cards (no limit, they need to be reviewed)
  if (dueFlashcards.length > 0) {
    return { cards: dueFlashcards };
  }

  // Priority 2: No cards are due - check for new cards
  // Filter out studied hiragana to get new ones
  const allNewHiragana = hiragana.filter((h) => !studiedFronts.includes(h.hiragana));
  
  // Check how many new cards have been shown today using session storage
  const newCardsShownToday = getNewCardsShownToday('hiragana');
  
  // If we've already shown 3 new cards today, no more for today
  if (newCardsShownToday.length >= 3) {
    return { 
      cards: [],
      message: "You have finished studying for now! Come back tomorrow for more cards :)"
    };
  }

  // Filter out cards that were already shown today
  const availableNewHiragana = allNewHiragana.filter((h) => !newCardsShownToday.includes(h.hiragana));
  
  // Show up to 3 new cards (or less if we've already shown some today)
  const remainingNewCards = 3 - newCardsShownToday.length;
  const newHiragana = availableNewHiragana.slice(0, remainingNewCards).map((h) => ({
    front: h.hiragana,
    back: h.romaji,
    interval: 1,
    repetition: 0,
    efactor: 2.5,
    due_date: dayjs().toISOString(),
  }));

  if (newHiragana.length === 0) {
    return { 
      cards: [],
      message: "You have finished studying for now! Come back tomorrow for more cards :)"
    };
  }

  return { cards: newHiragana };
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
