/**
 * Shared TypeScript interfaces for flashcard fetching
 * Reduces redundancy across useHiraganaFetch, useKatakanaFetch, etc.
 */

import { FlashcardItem } from '../Flashcard/FlashcardItem';

/**
 * StudiedFlashcard - Represents a flashcard that has been studied by a user
 * This is the format returned from the studied_flashcards table
 */
export interface StudiedFlashcard extends FlashcardItem {
  user_id: number;
  original_deck?: string;
  due_date?: string;
  back?: string | any; // Can be string or jsonb
  last_studied?: string; // Timestamp when card was studied
}

/**
 * StudiedFlashcardData - Format for saving/updating flashcards in the database
 * Used in scheduler components when upserting to studied_flashcards table
 */
export interface StudiedFlashcardData {
  user_id: number;
  front: string;
  back: string;
  interval: number;
  repetition: number;
  efactor: number;
  due_date: string;
  original_deck: string;
  last_studied: string; // Timestamp when card was studied
}

/**
 * Base interface for deck items (hiragana, katakana, etc.)
 * Different decks may have slightly different structures
 */
export interface BaseDeckItem {
  interval?: number;
  repetition?: number;
  eFactor?: number;
  due_date?: string;
}

/**
 * HiraganaItem - Structure of items from the hiragana table
 */
export interface HiraganaItem extends BaseDeckItem {
  hiragana: string;
  romaji: string;
}

/**
 * KatakanaItem - Structure of items from the katakana table
 */
export interface KatakanaItem extends BaseDeckItem {
  front: string;
  back: string;
}

/**
 * CardFetchResult - Result structure for card fetching functions
 */
export interface CardFetchResult {
  cards: FlashcardItem[];
  message?: string;
}

