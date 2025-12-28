/**
 * IndexedDB Database Schema using Dexie.js
 * Provides local caching for flashcard progress and deck metadata
 */

import Dexie, { Table } from 'dexie';

export interface CachedStudiedFlashcard {
  id?: number;
  user_id: number;
  front: string;
  back: string;
  interval: number;
  repetition: number;
  efactor: number;
  due_date: string;
  original_deck: string;
  last_studied: string;
  cached_at: number; // Timestamp
}

export interface CachedDeckMetadata {
  id?: number;
  user_id: number;
  deck_type: string;
  new_cards: number;
  due_cards: number;
  cached_at: number;
}

export interface CachedUserProfile {
  id?: number;
  user_id: number;
  username: string;
  email: string;
  avatar_url?: string;
  cached_at: number;
}

class JTrackDatabase extends Dexie {
  studiedFlashcards!: Table<CachedStudiedFlashcard>;
  deckMetadata!: Table<CachedDeckMetadata>;
  userProfiles!: Table<CachedUserProfile>;

  constructor() {
    super('JTrackDB');
    this.version(1).stores({
      studiedFlashcards: '++id, user_id, original_deck, front, due_date, cached_at, [user_id+original_deck]',
      deckMetadata: '++id, [user_id+deck_type], user_id, deck_type, cached_at',
      userProfiles: '++id, user_id, cached_at'
    });
  }
}

export const db = new JTrackDatabase();

