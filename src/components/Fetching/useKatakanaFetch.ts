import { supaClient } from "../Client/supaClient";
import { FlashcardItem } from "../Flashcard/FlashcardItem";
import dayjs from "dayjs";
import { checkUserHasStudiedRecently, updateUserHasStudied } from "../Client/userStudyHelper";
import { KatakanaItem, CardFetchResult } from "./types";
import { fetchDueCards, fetchNewCards, fetchUserStudiedCards } from "./sharedCardFetch";

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

//Fetching studied katakana flashcards (using shared utility)
const fetchUserKatakana = async (userId: string) => {
  return fetchUserStudiedCards(userId, 'katakana');
};

/**
 * Fetch only due katakana cards
 */
export const fetchDueKatakana = async (userId: string): Promise<CardFetchResult> => {
  const result = await fetchDueCards(userId, 'katakana');
  // Katakana limits due cards to 3 per session (different from hiragana)
  return {
    ...result,
    cards: result.cards.slice(0, 3)
  };
};

/**
 * Fetch only new katakana cards (respects daily limit and 24-hour study check)
 */
export const fetchNewKatakana = async (userId: string): Promise<CardFetchResult> => {
  if (!userId) {
    return { cards: [] };
  }

  // Check if user has studied recently (within 24 hours)
  const hasStudiedRecently = await checkUserHasStudiedRecently(userId);
  await updateUserHasStudied(userId, hasStudiedRecently);

  // If user has studied within 24 hours, no new cards
  if (hasStudiedRecently) {
    return {
      cards: [],
      message: "You have finished studying for now! Come back later :)"
    };
  }

  // Use shared utility for fetching new cards
  return fetchNewCards(
    userId,
    'katakana',
    fetchKatakana,
    (card) => card.front,
    (card) => card.back,
    (deckType) => [], // Katakana doesn't use session storage for new cards tracking
    3
  );
};

/**
 * Fetch available katakana cards (due cards first, then new cards)
 * This maintains backward compatibility with existing code
 */
export const fetchAvailableKatakana = async (
  userId: string
): Promise<CardFetchResult> => {
  if (!userId) {
    return { cards: [] };
  }

  // Check if user has studied recently (within 24 hours)
  const hasStudiedRecently = await checkUserHasStudiedRecently(userId);
  await updateUserHasStudied(userId, hasStudiedRecently);

  // Priority 1: Check for due cards first
  const dueResult = await fetchDueKatakana(userId);
  if (dueResult.cards.length > 0) {
    return dueResult;
  }

  // Priority 2: No cards are due - check for new cards
  return fetchNewKatakana(userId);
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
