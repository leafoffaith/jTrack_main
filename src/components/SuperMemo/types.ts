import { SuperMemoGrade } from 'supermemo';
import { FlashcardItem } from '../Flashcard/FlashcardItem';

/**
 * Result structure for card fetching functions
 */
export interface CardFetchResult {
  cards: FlashcardItem[];
  message?: string;
}

/**
 * Fetch functions interface for a deck
 */
export interface DeckFetchFunctions {
  fetchAvailable: (userId: string) => Promise<CardFetchResult>;
  fetchDue: (userId: string) => Promise<CardFetchResult>;
  fetchNew: (userId: string) => Promise<CardFetchResult>;
}

/**
 * Card component props - standardized for all decks
 */
export interface CardComponentProps {
  character: string;
  romaji: string;
}

/**
 * Configuration for a specific deck type
 */
export interface DeckConfig {
  // Deck identification
  deckType: 'hiragana' | 'katakana' | 'kanji' | 'sentence';
  deckName: string;

  // UI configuration
  modeLabel: {
    default: string;
    new: string;
    due: string;
  };

  // Fetch functions
  fetchFunctions: DeckFetchFunctions;

  // Card component (React component for rendering cards)
  CardComponent: React.ComponentType<CardComponentProps>;

  // Colors (optional - defaults to standard colors)
  colors?: {
    newCard?: string;
    dueCard?: string;
  };

  // Limits (optional - defaults to 3 new cards/day)
  limits?: {
    dailyNewCards?: number;
    dailyDueCards?: number;
  };
}

/**
 * Props for GenericScheduler component
 */
export interface GenericSchedulerProps {
  config: DeckConfig;
}

/**
 * UpdatedFlashcard - extends FlashcardItem with guaranteed due_date
 */
export interface UpdatedFlashcard extends FlashcardItem {
  due_date: string;
}

/**
 * StudiedFlashcardData - format for database upsert
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
  last_studied: string;
}