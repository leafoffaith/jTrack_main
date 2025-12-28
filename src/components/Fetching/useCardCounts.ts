import { supaClient } from "../Client/supaClient";
import { getNumericUserId } from "../Client/userIdHelper";
import dayjs from "dayjs";
import { CacheManager } from "../../lib/cacheManager";

export interface CardCounts {
  newCards: number;
  dueCards: number;
}

/**
 * Get card counts for a specific deck
 */
export const getDeckCardCounts = async (
  userId: string,
  deckType: string
): Promise<CardCounts> => {
  if (!userId) {
    return { newCards: 0, dueCards: 0 };
  }

  try {
    const numericUserId = await getNumericUserId(userId);
    
    // Try cache first
    const cached = await CacheManager.getDeckMetadata(numericUserId, deckType);
    if (cached) {
      return { newCards: cached.new_cards, dueCards: cached.due_cards };
    }
    
    const today = dayjs().toISOString();

    // Fetch due cards count for this specific deck
    const { data: dueCards } = await supaClient
      .from('studied_flashcards')
      .select('id')
      .eq('user_id', numericUserId)
      .eq('original_deck', deckType)
      .lte('due_date', today);

    // Fetch studied cards for this user/deck
    const { data: studiedCards } = await supaClient
      .from('studied_flashcards')
      .select('front')
      .eq('user_id', numericUserId)
      .eq('original_deck', deckType);

    // Fetch total cards in this deck
    let totalCards = 0;
    if (deckType === 'hiragana' || deckType === 'katakana') {
      const { data: allCards } = await supaClient
        .from(deckType)
        .select('id');
      totalCards = allCards?.length || 0;
    } else if (deckType === 'kanji') {
      // For kanji, we need to count from the N3/N4/N5 lists
      // For now, use a rough estimate or query from a kanji table
      totalCards = 100; // Placeholder - adjust based on your actual data
    }

    const studiedCount = studiedCards?.length || 0;
    const newCardsCount = Math.max(0, totalCards - studiedCount);

    const counts = {
      newCards: newCardsCount,
      dueCards: dueCards?.length || 0
    };
    
    // Update cache
    await CacheManager.updateDeckMetadata(numericUserId, deckType, counts);

    return counts;
  } catch (error) {
    console.error(`Error fetching card counts for ${deckType}:`, error);
    return { newCards: 0, dueCards: 0 };
  }
};

/**
 * Get total card counts across all decks
 */
export const getTotalCardCounts = async (userId: string): Promise<CardCounts> => {
  if (!userId) {
    return { newCards: 0, dueCards: 0 };
  }

  try {
    const numericUserId = await getNumericUserId(userId);
    const today = dayjs().toISOString();

    // Fetch due cards across all decks
    const { data: dueCards } = await supaClient
      .from('studied_flashcards')
      .select('id')
      .eq('user_id', numericUserId)
      .lte('due_date', today);

    // Fetch total cards available
    const { data: hiragana } = await supaClient.from('hiragana').select('id');
    const { data: katakana } = await supaClient.from('katakana').select('id');
    const totalAvailable = (hiragana?.length || 0) + (katakana?.length || 0);

    // Fetch studied cards
    const { data: studiedCards } = await supaClient
      .from('studied_flashcards')
      .select('id')
      .eq('user_id', numericUserId);

    const studiedCount = studiedCards?.length || 0;
    const newCardsCount = Math.max(0, totalAvailable - studiedCount);

    return {
      newCards: newCardsCount,
      dueCards: dueCards?.length || 0
    };
  } catch (error) {
    console.error('Error fetching card counts:', error);
    return { newCards: 0, dueCards: 0 };
  }
};

