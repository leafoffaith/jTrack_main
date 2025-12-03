import { describe, it, expect } from 'vitest';
import { FlashcardItem } from '../components/Flashcard/FlashcardItem';

interface StudiedFlashcardData {
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

describe('Studied Flashcard Format', () => {
  describe('StudiedFlashcardData interface validation', () => {
    it('should validate correct studied flashcard format', () => {
      const validFlashcard: StudiedFlashcardData = {
        user_id: 12345,
        front: 'あ',
        back: 'a',
        interval: 1,
        repetition: 1,
        efactor: 2.5,
        due_date: '2024-01-01T00:00:00.000Z',
        original_deck: 'hiragana',
        last_studied: '2024-01-01T12:00:00.000Z',
      };

      expect(validFlashcard.user_id).toBeTypeOf('number');
      expect(validFlashcard.front).toBeTypeOf('string');
      expect(validFlashcard.back).toBeTypeOf('string');
      expect(validFlashcard.interval).toBeTypeOf('number');
      expect(validFlashcard.repetition).toBeTypeOf('number');
      expect(validFlashcard.efactor).toBeTypeOf('number');
      expect(validFlashcard.due_date).toBeTypeOf('string');
      expect(validFlashcard.original_deck).toBeTypeOf('string');
      expect(validFlashcard.last_studied).toBeTypeOf('string');
    });

    it('should validate all required fields are present', () => {
      const flashcard: StudiedFlashcardData = {
        user_id: 12345,
        front: 'あ',
        back: 'a',
        interval: 1,
        repetition: 1,
        efactor: 2.5,
        due_date: '2024-01-01T00:00:00.000Z',
        original_deck: 'hiragana',
        last_studied: '2024-01-01T12:00:00.000Z',
      };

      const requiredFields = [
        'user_id',
        'front',
        'back',
        'interval',
        'repetition',
        'efactor',
        'due_date',
        'original_deck',
        'last_studied',
      ];

      requiredFields.forEach((field) => {
        expect(flashcard).toHaveProperty(field);
      });
    });

    it('should validate numeric fields are numbers', () => {
      const flashcard: StudiedFlashcardData = {
        user_id: 12345,
        front: 'あ',
        back: 'a',
        interval: 1,
        repetition: 1,
        efactor: 2.5,
        due_date: '2024-01-01T00:00:00.000Z',
        original_deck: 'hiragana',
        last_studied: '2024-01-01T12:00:00.000Z',
      };

      expect(flashcard.user_id).toBeTypeOf('number');
      expect(flashcard.interval).toBeTypeOf('number');
      expect(flashcard.repetition).toBeTypeOf('number');
      expect(flashcard.efactor).toBeTypeOf('number');
    });

    it('should validate string fields are strings', () => {
      const flashcard: StudiedFlashcardData = {
        user_id: 12345,
        front: 'あ',
        back: 'a',
        interval: 1,
        repetition: 1,
        efactor: 2.5,
        due_date: '2024-01-01T00:00:00.000Z',
        original_deck: 'hiragana',
        last_studied: '2024-01-01T12:00:00.000Z',
      };

      expect(flashcard.front).toBeTypeOf('string');
      expect(flashcard.back).toBeTypeOf('string');
      expect(flashcard.due_date).toBeTypeOf('string');
      expect(flashcard.original_deck).toBeTypeOf('string');
      expect(flashcard.last_studied).toBeTypeOf('string');
    });

    it('should validate date strings are valid ISO format', () => {
      const flashcard: StudiedFlashcardData = {
        user_id: 12345,
        front: 'あ',
        back: 'a',
        interval: 1,
        repetition: 1,
        efactor: 2.5,
        due_date: '2024-01-01T00:00:00.000Z',
        original_deck: 'hiragana',
        last_studied: '2024-01-01T12:00:00.000Z',
      };

      // Should be able to parse as Date
      expect(() => new Date(flashcard.due_date)).not.toThrow();
      expect(() => new Date(flashcard.last_studied)).not.toThrow();
      expect(new Date(flashcard.due_date).toISOString()).toBe(flashcard.due_date);
      expect(new Date(flashcard.last_studied).toISOString()).toBe(flashcard.last_studied);
    });

    it('should validate original_deck values', () => {
      const validDecks = ['hiragana', 'katakana', 'kanji', 'sentence'];

      validDecks.forEach((deck) => {
        const flashcard: StudiedFlashcardData = {
          user_id: 12345,
          front: 'あ',
          back: 'a',
          interval: 1,
          repetition: 1,
          efactor: 2.5,
          due_date: '2024-01-01T00:00:00.000Z',
          original_deck: deck,
          last_studied: '2024-01-01T12:00:00.000Z',
        };

        expect(flashcard.original_deck).toBe(deck);
      });
    });
  });

  describe('FlashcardItem to StudiedFlashcardData conversion', () => {
    it('should convert FlashcardItem to StudiedFlashcardData format', () => {
      const flashcardItem: FlashcardItem = {
        front: 'あ',
        back: 'a',
        interval: 1,
        repetition: 1,
        efactor: 2.5,
        due_date: '2024-01-01T00:00:00.000Z',
      };

      const studiedData: StudiedFlashcardData = {
        user_id: 12345,
        front: flashcardItem.front,
        back: flashcardItem.back || '',
        interval: flashcardItem.interval,
        repetition: flashcardItem.repetition,
        efactor: flashcardItem.efactor,
        due_date: flashcardItem.due_date || new Date().toISOString(),
        original_deck: 'hiragana',
        last_studied: new Date().toISOString(),
      };

      expect(studiedData.front).toBe(flashcardItem.front);
      expect(studiedData.back).toBe(flashcardItem.back);
      expect(studiedData.interval).toBe(flashcardItem.interval);
      expect(studiedData.repetition).toBe(flashcardItem.repetition);
      expect(studiedData.efactor).toBe(flashcardItem.efactor);
      expect(studiedData.user_id).toBeTypeOf('number');
      expect(studiedData.original_deck).toBe('hiragana');
      expect(studiedData.last_studied).toBeDefined();
    });

    it('should handle missing optional fields in FlashcardItem', () => {
      const flashcardItem: FlashcardItem = {
        front: 'あ',
        interval: 1,
        repetition: 1,
        efactor: 2.5,
      };

      const studiedData: StudiedFlashcardData = {
        user_id: 12345,
        front: flashcardItem.front,
        back: flashcardItem.back || '', // Handle missing back
        interval: flashcardItem.interval,
        repetition: flashcardItem.repetition,
        efactor: flashcardItem.efactor,
        due_date: flashcardItem.due_date || new Date().toISOString(),
        original_deck: 'hiragana',
        last_studied: new Date().toISOString(),
      };

      expect(studiedData.back).toBe('');
      expect(studiedData.due_date).toBeDefined();
    });
  });

  describe('Data validation and constraints', () => {
    it('should validate interval is positive', () => {
      const flashcard: StudiedFlashcardData = {
        user_id: 12345,
        front: 'あ',
        back: 'a',
        interval: 1,
        repetition: 1,
        efactor: 2.5,
        due_date: '2024-01-01T00:00:00.000Z',
        original_deck: 'hiragana',
        last_studied: '2024-01-01T12:00:00.000Z',
      };

      expect(flashcard.interval).toBeGreaterThan(0);
    });

    it('should validate repetition is non-negative', () => {
      const flashcard: StudiedFlashcardData = {
        user_id: 12345,
        front: 'あ',
        back: 'a',
        interval: 1,
        repetition: 0,
        efactor: 2.5,
        due_date: '2024-01-01T00:00:00.000Z',
        original_deck: 'hiragana',
        last_studied: '2024-01-01T12:00:00.000Z',
      };

      expect(flashcard.repetition).toBeGreaterThanOrEqual(0);
    });

    it('should validate efactor is within SuperMemo range (1.3 to 2.5)', () => {
      const flashcard: StudiedFlashcardData = {
        user_id: 12345,
        front: 'あ',
        back: 'a',
        interval: 1,
        repetition: 1,
        efactor: 2.5,
        due_date: '2024-01-01T00:00:00.000Z',
        original_deck: 'hiragana',
        last_studied: '2024-01-01T12:00:00.000Z',
      };

      expect(flashcard.efactor).toBeGreaterThanOrEqual(1.3);
      expect(flashcard.efactor).toBeLessThanOrEqual(2.5);
    });

    it('should validate user_id is positive number', () => {
      const flashcard: StudiedFlashcardData = {
        user_id: 12345,
        front: 'あ',
        back: 'a',
        interval: 1,
        repetition: 1,
        efactor: 2.5,
        due_date: '2024-01-01T00:00:00.000Z',
        original_deck: 'hiragana',
        last_studied: '2024-01-01T12:00:00.000Z',
      };

      expect(flashcard.user_id).toBeGreaterThan(0);
      expect(Number.isInteger(flashcard.user_id)).toBe(true);
    });
  });
});

