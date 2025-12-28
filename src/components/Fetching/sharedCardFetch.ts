/**
 * Shared card fetching utilities
 * Reduces redundancy across useHiraganaFetch, useKatakanaFetch, etc.
 */

import { supaClient } from '../Client/supaClient';
import { FlashcardItem } from '../Flashcard/FlashcardItem';
import { StudiedFlashcard, CardFetchResult } from './types';
import { getNumericUserId } from '../Client/userIdHelper';
import dayjs from 'dayjs';
import { CacheManager } from '../../lib/cacheManager';

/**
 * Fetch all studied flashcards for a user and deck type
 */
export const fetchUserStudiedCards = async (
  userId: string,
  deckType: string
): Promise<StudiedFlashcard[]> => {
  if (!userId) {
    return [];
  }

  try {
    const numericUserId = await getNumericUserId(userId);
    
    // Try cache first
    const cached = await CacheManager.getStudiedFlashcards(numericUserId, deckType);
    if (cached) {
      return cached as StudiedFlashcard[];
    }
    
    const { data, error} = await supaClient
      .from('studied_flashcards')
      .select('*')
      .eq('user_id', numericUserId)
      .eq('original_deck', deckType);

    if (error) {
      console.error(`Error fetching studied ${deckType} cards:`, error);
      return [];
    }

    // Update cache
    await CacheManager.updateStudiedFlashcards(numericUserId, deckType, data || []);

    return (data || []) as StudiedFlashcard[];
  } catch (error) {
    console.error(`Error fetching studied ${deckType} cards:`, error);
    return [];
  }
};

/**
 * Filter due cards from studied flashcards
 * A card is due if its due_date is <= current time
 */
export const filterDueCards = (
  studiedCards: StudiedFlashcard[]
): FlashcardItem[] => {
  const now = new Date();
  
  return studiedCards
    .filter((card) => {
      if (!card.due_date) return false;
      const dueDate = new Date(card.due_date);
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
};

/**
 * Filter new cards (not yet studied) from all available cards
 */
export const filterNewCards = <T extends { front?: string; hiragana?: string }>(
  allCards: T[],
  studiedFronts: string[],
  getFront: (card: T) => string
): T[] => {
  return allCards.filter((card) => {
    const front = getFront(card);
    return !studiedFronts.includes(front);
  });
};

/**
 * Convert a deck item to FlashcardItem format
 */
export const convertToFlashcardItem = <T extends { front?: string; hiragana?: string; back?: string; romaji?: string }>(
  item: T,
  getFront: (item: T) => string,
  getBack: (item: T) => string
): FlashcardItem => {
  return {
    front: getFront(item),
    back: getBack(item),
    interval: 1,
    repetition: 0,
    efactor: 2.5,
    due_date: dayjs().toISOString(),
  };
};

/**
 * Fetch due cards for a specific deck
 */
export const fetchDueCards = async (
  userId: string,
  deckType: string
): Promise<CardFetchResult> => {
  if (!userId) {
    return { cards: [] };
  }

  const studiedCards = await fetchUserStudiedCards(userId, deckType);
  const dueCards = filterDueCards(studiedCards);

  return { cards: dueCards };
};

/**
 * Generic function to fetch new cards with daily limit
 */
export const fetchNewCards = async <T extends { front?: string; hiragana?: string; back?: string; romaji?: string }>(
  userId: string,
  deckType: string,
  fetchAllCards: () => Promise<T[]>,
  getFront: (card: T) => string,
  getBack: (card: T) => string,
  getNewCardsShownToday: (deckType: string) => string[],
  dailyLimit: number = 3
): Promise<CardFetchResult> => {
  if (!userId) {
    return { cards: [] };
  }

  // Fetch studied cards to know what's already been studied
  const studiedCards = await fetchUserStudiedCards(userId, deckType);
  const studiedFronts = studiedCards.map((card) => card.front);

  // Fetch all available cards for this deck
  const allCards = await fetchAllCards();
  if (!allCards || allCards.length === 0) {
    return { cards: [] };
  }

  // Filter to get new cards (not yet studied)
  const allNewCards = filterNewCards(allCards, studiedFronts, getFront);

  // Check how many new cards have been shown today
  const newCardsShownToday = getNewCardsShownToday(deckType);

  // If we've already shown the daily limit, no more for today
  if (newCardsShownToday.length >= dailyLimit) {
    return {
      cards: [],
      message: "You have finished studying for now! Come back tomorrow for more cards :)"
    };
  }

  // Filter out cards that were already shown today
  const availableNewCards = allNewCards.filter((card) => {
    const front = getFront(card);
    return !newCardsShownToday.includes(front);
  });

  // Show up to daily limit (or less if we've already shown some today)
  const remainingNewCards = dailyLimit - newCardsShownToday.length;
  const newCards = availableNewCards
    .slice(0, remainingNewCards)
    .map((item) => convertToFlashcardItem(item, getFront, getBack));

  if (newCards.length === 0) {
    return {
      cards: [],
      message: "You have finished studying for now! Come back tomorrow for more cards :)"
    };
  }

  return { cards: newCards };
};

