import { supaClient } from "../Client/supaClient";
import { FlashcardItem } from "../Flashcard/FlashcardItem";
import dayjs from "dayjs";
import { checkUserHasStudiedRecently, updateUserHasStudied } from "../Client/userStudyHelper";
import { getNewCardsShownToday } from "../Client/sessionHelper";
import { HiraganaItem, CardFetchResult } from "./types";
import { fetchDueCards, fetchNewCards, fetchUserStudiedCards } from "./sharedCardFetch";

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


//Fetching studied hiragana flashcards (using shared utility)
const fetchUserHiragana = async (userId: string) => {
  return fetchUserStudiedCards(userId, 'hiragana');
};

/**
 * Fetch only due hiragana cards
 */
export const fetchDueHiragana = async (userId: string): Promise<CardFetchResult> => {
  return fetchDueCards(userId, 'hiragana');
};

/**
 * Fetch only new hiragana cards (respects daily limit of 3)
 */
export const fetchNewHiragana = async (userId: string): Promise<CardFetchResult> => {
  return fetchNewCards(
    userId,
    'hiragana',
    fetchHiragana,
    (card) => card.hiragana,
    (card) => card.romaji,
    (deckType) => getNewCardsShownToday(deckType as 'hiragana'),
    3
  );
};

/**
 * Fetch available hiragana cards (due cards first, then new cards)
 * This maintains backward compatibility with existing code
 */
export const fetchAvailableHiragana = async (
  userId: string
): Promise<CardFetchResult> => {
  if (!userId) {
    return { cards: [] };
  }

  // Check if user has studied recently (within 24 hours)
  const hasStudiedRecently = await checkUserHasStudiedRecently(userId);
  await updateUserHasStudied(userId, hasStudiedRecently);

  // Priority 1: Check for due cards first
  const dueResult = await fetchDueHiragana(userId);
  if (dueResult.cards.length > 0) {
    return dueResult;
  }

  // Priority 2: No cards are due - check for new cards
  return fetchNewHiragana(userId);
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
