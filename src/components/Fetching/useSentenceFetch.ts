import { FlashcardItem } from "../Flashcard/FlashcardItem";
import { fetchDueCards } from "./sharedCardFetch";
import { getNewCardsShownToday, markNewCardShown } from "../Client/sessionHelper";
import data from "../../assets/jmdict/tatoeba.json";

export interface CardFetchResult {
  cards: FlashcardItem[];
}

/**
 * Load all sentences from tatoeba.json
 * Format: [id, japanese, id2, english]
 */
const loadSentencesFromTatoeba = (): FlashcardItem[] => {
  const sentences = data as Array<[number, string, number, string]>;

  // Convert to FlashcardItem format
  // Use first 1000 sentences to keep it manageable
  return sentences.slice(0, 1000).map(([_id, japanese, _id2, english]) => ({
    front: japanese,
    back: english,
    interval: 0,
    repetition: 0,
    efactor: 2.5,
    due_date: new Date().toISOString(),
  }));
};

/**
 * Fetch available sentence cards (combines due + new)
 * Matches GenericScheduler pattern
 */
export const fetchAvailableSentenceCards = async (userId: string): Promise<CardFetchResult> => {
  // Load sentences from tatoeba.json
  const allSentences = loadSentencesFromTatoeba();

  // Get due cards from database
  const { cards: dueCards } = await fetchDueCards(userId, 'sentence');

  // Get new cards
  const { cards: newCards } = await fetchNewSentenceCards(userId);

  // Combine: due cards first, then new cards
  const availableCards = [...dueCards, ...newCards];

  return { cards: availableCards };
};

/**
 * Fetch only due sentence cards
 * Matches GenericScheduler pattern
 */
export const fetchDueSentenceCards = async (userId: string): Promise<CardFetchResult> => {
  return await fetchDueCards(userId, 'sentence');
};

/**
 * Fetch only new sentence cards (not yet studied)
 * Respects daily limit of 3 new cards
 * Matches GenericScheduler pattern
 */
export const fetchNewSentenceCards = async (userId: string): Promise<CardFetchResult> => {
  const DAILY_NEW_CARD_LIMIT = 3;
  const allSentences = loadSentencesFromTatoeba();

  // Get due cards to filter them out
  const { cards: dueCards } = await fetchDueCards(userId, 'sentence');
  const dueFronts = dueCards.map(card => card.front);

  // Filter out already studied sentences
  const unstudiedSentences = allSentences.filter(
    sentence => !dueFronts.includes(sentence.front)
  );

  // Check daily limit
  const shownToday = getNewCardsShownToday('sentence');
  const remaining = Math.max(0, DAILY_NEW_CARD_LIMIT - shownToday);

  if (remaining === 0) {
    return { cards: [] };
  }

  // Return limited number of new cards
  const cardsToShow = unstudiedSentences.slice(0, remaining);

  // Mark cards as shown today
  cardsToShow.forEach(() => {
    markNewCardShown('sentence');
  });

  return { cards: cardsToShow };
};
