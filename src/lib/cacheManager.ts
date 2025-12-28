/**
 * Cache Manager
 * Handles caching logic for flashcards, deck metadata, and user profiles
 */

import { db, CachedStudiedFlashcard, CachedDeckMetadata } from './db';
import { supaClient } from '../components/Client/supaClient';
import { getNumericUserId } from '../components/Client/userIdHelper';

const CACHE_DURATION = {
  STUDIED_FLASHCARDS: 5 * 60 * 1000, // 5 minutes
  DECK_METADATA: 2 * 60 * 1000, // 2 minutes
  USER_PROFILE: 30 * 60 * 1000, // 30 minutes
};

export class CacheManager {
  /**
   * Check if cached data is still valid
   */
  static isCacheValid(cachedAt: number, duration: number): boolean {
    return Date.now() - cachedAt < duration;
  }

  /**
   * Get studied flashcards from cache or database
   */
  static async getStudiedFlashcards(
    userId: number,
    deckType: string,
    forceRefresh = false
  ): Promise<CachedStudiedFlashcard[] | null> {
    if (!forceRefresh) {
      // Try to get from cache first
      const cached = await db.studiedFlashcards
        .where({ user_id: userId, original_deck: deckType })
        .toArray();

      if (cached.length > 0 && this.isCacheValid(cached[0].cached_at, CACHE_DURATION.STUDIED_FLASHCARDS)) {
        console.log('📦 Using cached studied flashcards for', deckType);
        return cached;
      }
    }

    // Cache miss or expired
    return null;
  }

  /**
   * Update studied flashcards cache
   */
  static async updateStudiedFlashcards(
    userId: number,
    deckType: string,
    flashcards: any[]
  ): Promise<void> {
    const cachedFlashcards = flashcards.map(card => ({
      user_id: userId,
      front: card.front,
      back: card.back || '',
      interval: card.interval ?? 1,
      repetition: card.repetition ?? 0,
      efactor: card.efactor ?? 2.5,
      due_date: card.due_date || new Date().toISOString(),
      original_deck: deckType,
      last_studied: card.last_studied || new Date().toISOString(),
      cached_at: Date.now()
    }));

    // Clear old cache for this user/deck
    await db.studiedFlashcards
      .where({ user_id: userId, original_deck: deckType })
      .delete();

    // Add new cache
    if (cachedFlashcards.length > 0) {
      await db.studiedFlashcards.bulkAdd(cachedFlashcards);
      console.log('💾 Cached', cachedFlashcards.length, 'studied flashcards for', deckType);
    }
  }

  /**
   * Update a single flashcard in cache
   */
  static async updateSingleFlashcard(
    userId: number,
    deckType: string,
    flashcard: any
  ): Promise<void> {
    const cached = await db.studiedFlashcards
      .where({ user_id: userId, original_deck: deckType, front: flashcard.front })
      .first();

    const updatedCard: CachedStudiedFlashcard = {
      user_id: userId,
      front: flashcard.front,
      back: flashcard.back || '',
      interval: flashcard.interval ?? 1,
      repetition: flashcard.repetition ?? 0,
      efactor: flashcard.efactor ?? 2.5,
      due_date: flashcard.due_date || new Date().toISOString(),
      original_deck: deckType,
      last_studied: new Date().toISOString(),
      cached_at: Date.now()
    };

    if (cached?.id) {
      await db.studiedFlashcards.update(cached.id, updatedCard);
    } else {
      await db.studiedFlashcards.add(updatedCard);
    }
  }

  /**
   * Get deck metadata from cache or database
   */
  static async getDeckMetadata(
    userId: number,
    deckType: string,
    forceRefresh = false
  ): Promise<CachedDeckMetadata | null> {
    if (!forceRefresh) {
      const cached = await db.deckMetadata
        .where({ user_id: userId, deck_type: deckType })
        .first();

      if (cached && this.isCacheValid(cached.cached_at, CACHE_DURATION.DECK_METADATA)) {
        console.log('📦 Using cached deck metadata for', deckType);
        return cached;
      }
    }

    return null;
  }

  /**
   * Update deck metadata cache
   */
  static async updateDeckMetadata(
    userId: number,
    deckType: string,
    metadata: { newCards: number; dueCards: number }
  ): Promise<void> {
    const existing = await db.deckMetadata
      .where({ user_id: userId, deck_type: deckType })
      .first();

    const cachedMetadata: CachedDeckMetadata = {
      user_id: userId,
      deck_type: deckType,
      new_cards: metadata.newCards,
      due_cards: metadata.dueCards,
      cached_at: Date.now()
    };

    if (existing?.id) {
      await db.deckMetadata.update(existing.id, cachedMetadata);
    } else {
      await db.deckMetadata.add(cachedMetadata);
    }
    
    console.log('💾 Cached deck metadata for', deckType);
  }

  /**
   * Clear all cache for a user (on logout)
   */
  static async clearUserCache(userId: number): Promise<void> {
    await db.studiedFlashcards.where({ user_id: userId }).delete();
    await db.deckMetadata.where({ user_id: userId }).delete();
    await db.userProfiles.where({ user_id: userId }).delete();
    console.log('🗑️ Cleared cache for user', userId);
  }

  /**
   * Clear expired cache entries
   */
  static async clearExpiredCache(): Promise<void> {
    const now = Date.now();
    
    const expiredFlashcards = await db.studiedFlashcards
      .where('cached_at')
      .below(now - CACHE_DURATION.STUDIED_FLASHCARDS)
      .delete();
    
    const expiredMetadata = await db.deckMetadata
      .where('cached_at')
      .below(now - CACHE_DURATION.DECK_METADATA)
      .delete();
    
    const expiredProfiles = await db.userProfiles
      .where('cached_at')
      .below(now - CACHE_DURATION.USER_PROFILE)
      .delete();
    
    if (expiredFlashcards || expiredMetadata || expiredProfiles) {
      console.log('🧹 Cleared expired cache entries');
    }
  }

  /**
   * Get cache statistics
   */
  static async getCacheStats(): Promise<{
    flashcards: number;
    metadata: number;
    profiles: number;
  }> {
    const flashcards = await db.studiedFlashcards.count();
    const metadata = await db.deckMetadata.count();
    const profiles = await db.userProfiles.count();
    
    return { flashcards, metadata, profiles };
  }
}

