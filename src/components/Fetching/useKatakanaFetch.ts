import { supaClient } from "../Client/supaClient";
import { FlashcardItem } from "../Flashcard/FlashcardItem";
import dayjs from "dayjs";
import {
  checkUserHasStudiedRecently,
  updateUserHasStudied,
} from "../Client/userStudyHelper";
import { KatakanaItem, CardFetchResult } from "./types";
import { fetchDueCards, fetchNewCards } from "./sharedCardFetch";

const fetchKatakana = async (): Promise<KatakanaItem[]> => {
  const { data: katakana, error } = await supaClient
    .from("katakana")
    .select("*")
    .then();
  if (error) {
    console.warn(error);
    return [];
  }

  return katakana || [];
};

// Removed unused function - using fetchUserStudiedCards directly

/**
 * Fetch only due katakana cards
 */
export const fetchDueKatakana = async (
  userId: string
): Promise<CardFetchResult> => {
  const result = await fetchDueCards(userId, "katakana");
  // Katakana limits due cards to 3 per session (different from hiragana)
  return {
    ...result,
    cards: result.cards.slice(0, 3),
  };
};

/**
 * Fetch only new katakana cards (respects daily limit and 24-hour study check)
 */
export const fetchNewKatakana = async (
  userId: string
): Promise<CardFetchResult> => {
  if (!userId) {
    return { cards: [] };
  }

  // Check if user has studied katakana recently (within 24 hours) - deck-specific check
  const hasStudiedRecently = await checkUserHasStudiedRecently(
    userId,
    "katakana"
  );
  await updateUserHasStudied(userId, hasStudiedRecently);

  // If user has studied within 24 hours, no new cards
  if (hasStudiedRecently) {
    return {
      cards: [],
      message: "You have finished studying for now! Come back later :)",
    };
  }

  // Fetch directly from katakana table - simpler approach

  // Fetch all katakana cards
  const allKatakana = await fetchKatakana();

  if (!allKatakana || allKatakana.length === 0) {
    return { cards: [] };
  }

  // Fetch studied katakana cards
  const { fetchUserStudiedCards } = await import("./sharedCardFetch");
  const studiedCards = await fetchUserStudiedCards(userId, "katakana");
  const studiedFronts = studiedCards.map((card) => card.front);

  // Filter out already studied cards - katakana table uses 'katakana' column, not 'front'
  const newKatakana = allKatakana.filter((card) => {
    const katakanaChar = (card as any).katakana || card.front;
    return katakanaChar && !studiedFronts.includes(katakanaChar);
  });

  // Take first 3 new cards and convert to FlashcardItem format
  // Katakana table has 'katakana' and 'romaji' columns, not 'front' and 'back'
  const newCards = newKatakana.slice(0, 3).map((card) => {
    // Katakana table structure: { id, katakana, romaji }
    const front = (card as any).katakana || card.front || "";
    const back = (card as any).romaji || card.back || "";
    return {
      front,
      back,
      interval: 1,
      repetition: 0,
      efactor: 2.5,
      due_date: dayjs().toISOString(),
    };
  });

  return { cards: newCards };
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

  // Check if user has studied katakana recently (within 24 hours) - deck-specific check
  const hasStudiedRecently = await checkUserHasStudiedRecently(
    userId,
    "katakana"
  );
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
