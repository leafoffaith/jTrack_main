import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createHiraganaFlashcards } from '../components/Fetching/useHiraganaFetch';
import { createKatakanaFlashcards } from '../components/Fetching/useKatakanaFetch';
import { FlashcardItem } from '../components/Flashcard/FlashcardItem';
import { supaClient } from '../components/Client/supaClient';

// Mock Supabase client
vi.mock('../components/Client/supaClient', () => ({
  supaClient: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        then: vi.fn(() => Promise.resolve({ data: [], error: null })),
      })),
    })),
  },
}));

describe('Flashcard Creation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createHiraganaFlashcards', () => {
    it('should create flashcards from hiragana data', async () => {
      // Mock hiragana data
      const mockHiraganaData = [
        { id: 1, hiragana: 'あ', romaji: 'a' },
        { id: 2, hiragana: 'い', romaji: 'i' },
        { id: 3, hiragana: 'う', romaji: 'u' },
      ];

      // Mock the fetch function
      (supaClient.from as any).mockReturnValue({
        select: vi.fn(() => ({
          then: vi.fn(() => Promise.resolve({ data: mockHiraganaData, error: null })),
        })),
      });

      const flashcards = await createHiraganaFlashcards();

      // Verify flashcards are created correctly
      expect(flashcards).toHaveLength(3);
      expect(flashcards[0]).toMatchObject({
        front: 'あ',
        back: 'a',
        interval: 1,
        repetition: 1,
        efactor: 2.5,
      });
      expect(flashcards[0].due_date).toBeDefined();
      expect(flashcards[1].front).toBe('い');
      expect(flashcards[2].front).toBe('う');
    });

    it('should handle empty hiragana data', async () => {
      (supaClient.from as any).mockReturnValue({
        select: vi.fn(() => ({
          then: vi.fn(() => Promise.resolve({ data: [], error: null })),
        })),
      });

      const flashcards = await createHiraganaFlashcards();
      expect(flashcards).toHaveLength(0);
    });

    it('should use default values for missing properties', async () => {
      const mockHiraganaData = [
        { id: 1, hiragana: 'あ', romaji: 'a' }, // No interval, repetition, eFactor
      ];

      (supaClient.from as any).mockReturnValue({
        select: vi.fn(() => ({
          then: vi.fn(() => Promise.resolve({ data: mockHiraganaData, error: null })),
        })),
      });

      const flashcards = await createHiraganaFlashcards();
      expect(flashcards[0].interval).toBe(1);
      expect(flashcards[0].repetition).toBe(1);
      expect(flashcards[0].efactor).toBe(2.5);
    });

    it('should create flashcards with correct FlashcardItem structure', async () => {
      const mockHiraganaData = [
        { id: 1, hiragana: 'あ', romaji: 'a', interval: 2, repetition: 3, eFactor: 2.6 },
      ];

      (supaClient.from as any).mockReturnValue({
        select: vi.fn(() => ({
          then: vi.fn(() => Promise.resolve({ data: mockHiraganaData, error: null })),
        })),
      });

      const flashcards = await createHiraganaFlashcards();
      const flashcard = flashcards[0];

      // Verify all required properties exist
      expect(flashcard).toHaveProperty('front');
      expect(flashcard).toHaveProperty('back');
      expect(flashcard).toHaveProperty('interval');
      expect(flashcard).toHaveProperty('repetition');
      expect(flashcard).toHaveProperty('efactor');
      expect(flashcard).toHaveProperty('due_date');

      // Verify types
      expect(typeof flashcard.front).toBe('string');
      expect(typeof flashcard.back).toBe('string');
      expect(typeof flashcard.interval).toBe('number');
      expect(typeof flashcard.repetition).toBe('number');
      expect(typeof flashcard.efactor).toBe('number');
      expect(typeof flashcard.due_date).toBe('string');
    });
  });

  describe('createKatakanaFlashcards', () => {
    it('should create flashcards from katakana data', async () => {
      const mockKatakanaData = [
        { id: 1, front: 'ア', back: 'a' },
        { id: 2, front: 'イ', back: 'i' },
      ];

      (supaClient.from as any).mockReturnValue({
        select: vi.fn(() => ({
          then: vi.fn(() => Promise.resolve({ data: mockKatakanaData, error: null })),
        })),
      });

      const flashcards = await createKatakanaFlashcards();

      expect(flashcards).toHaveLength(2);
      expect(flashcards[0]).toMatchObject({
        front: 'ア',
        back: 'a',
      });
      expect(flashcards[0].due_date).toBeDefined();
    });

    it('should handle katakana data with custom properties', async () => {
      const mockKatakanaData = [
        {
          id: 1,
          front: 'ア',
          back: 'a',
          interval: 5,
          repetition: 2,
          eFactor: 2.8,
          due_date: '2024-01-01T00:00:00.000Z',
        },
      ];

      (supaClient.from as any).mockReturnValue({
        select: vi.fn(() => ({
          then: vi.fn(() => Promise.resolve({ data: mockKatakanaData, error: null })),
        })),
      });

      const flashcards = await createKatakanaFlashcards();
      expect(flashcards[0].interval).toBe(5);
      expect(flashcards[0].repetition).toBe(2);
      expect(flashcards[0].efactor).toBe(2.8);
    });
  });
});

