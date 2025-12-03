import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchAvailableHiragana } from '../components/Fetching/useHiraganaFetch';
import { fetchAvailableKatakana } from '../components/Fetching/useKatakanaFetch';
import { supaClient } from '../components/Client/supaClient';
import * as userIdHelper from '../components/Client/userIdHelper';
import * as userStudyHelper from '../components/Client/userStudyHelper';

// Mock dependencies
vi.mock('../components/Client/supaClient', () => ({
  supaClient: {
    from: vi.fn(),
  },
}));

vi.mock('../components/Client/userIdHelper', () => ({
  getNumericUserId: vi.fn(),
}));

vi.mock('../components/Client/userStudyHelper', () => ({
  checkUserHasStudiedRecently: vi.fn(),
  updateUserHasStudied: vi.fn(),
}));

describe('Available Flashcards', () => {
  const mockUserId = 'test-uuid-123';
  const mockNumericUserId = 12345;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(userIdHelper.getNumericUserId).mockResolvedValue(mockNumericUserId);
    vi.mocked(userStudyHelper.checkUserHasStudiedRecently).mockResolvedValue(false);
    vi.mocked(userStudyHelper.updateUserHasStudied).mockResolvedValue(undefined);
  });

  describe('fetchAvailableHiragana', () => {
    it('should return due cards when they exist (Priority 1)', async () => {
      const mockStudiedFlashcards = [
        {
          user_id: mockNumericUserId,
          front: 'あ',
          back: 'a',
          interval: 1,
          repetition: 1,
          efactor: 2.5,
          due_date: '2020-01-01T00:00:00.000Z', // Past due
          original_deck: 'hiragana',
        },
        {
          user_id: mockNumericUserId,
          front: 'い',
          back: 'i',
          interval: 2,
          repetition: 2,
          efactor: 2.6,
          due_date: '2020-01-02T00:00:00.000Z', // Past due
          original_deck: 'hiragana',
        },
      ];

      const mockHiraganaData = [
        { id: 1, hiragana: 'あ', romaji: 'a' },
        { id: 2, hiragana: 'い', romaji: 'i' },
        { id: 3, hiragana: 'う', romaji: 'u' },
      ];

      // Mock studied flashcards query
      (supaClient.from as any).mockImplementation((table: string) => {
        if (table === 'studied_flashcards') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                eq: vi.fn(() => Promise.resolve({ data: mockStudiedFlashcards, error: null })),
              })),
            })),
          };
        }
        if (table === 'hiragana') {
          return {
            select: vi.fn(() => ({
              then: vi.fn(() => Promise.resolve({ data: mockHiraganaData, error: null })),
            })),
          };
        }
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              gte: vi.fn(() => ({
                limit: vi.fn(() => Promise.resolve({ data: [], error: null })),
              })),
            })),
          })),
        };
      });

      const result = await fetchAvailableHiragana(mockUserId);

      expect(result.cards).toHaveLength(2);
      expect(result.cards[0].front).toBe('あ');
      expect(result.cards[1].front).toBe('い');
      expect(result.message).toBeUndefined();
    });

    it('should limit due cards to 3 maximum', async () => {
      const mockStudiedFlashcards = Array.from({ length: 5 }, (_, i) => ({
        user_id: mockNumericUserId,
        front: `card${i}`,
        back: `back${i}`,
        interval: 1,
        repetition: 1,
        efactor: 2.5,
        due_date: '2020-01-01T00:00:00.000Z',
        original_deck: 'hiragana',
      }));

      (supaClient.from as any).mockImplementation((table: string) => {
        if (table === 'studied_flashcards') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                eq: vi.fn(() => Promise.resolve({ data: mockStudiedFlashcards, error: null })),
              })),
            })),
          };
        }
        return {
          select: vi.fn(() => ({
            then: vi.fn(() => Promise.resolve({ data: [], error: null })),
          })),
        };
      });

      const result = await fetchAvailableHiragana(mockUserId);
      expect(result.cards).toHaveLength(3);
    });

    it('should return new cards when no cards are due and user has not studied recently (Priority 2)', async () => {
      const mockHiraganaData = [
        { id: 1, hiragana: 'あ', romaji: 'a' },
        { id: 2, hiragana: 'い', romaji: 'i' },
        { id: 3, hiragana: 'う', romaji: 'u' },
        { id: 4, hiragana: 'え', romaji: 'e' },
      ];

      vi.mocked(userStudyHelper.checkUserHasStudiedRecently).mockResolvedValue(false);

      (supaClient.from as any).mockImplementation((table: string) => {
        if (table === 'studied_flashcards') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                eq: vi.fn(() => Promise.resolve({ data: [], error: null })), // No studied cards
              })),
            })),
          };
        }
        if (table === 'hiragana') {
          return {
            select: vi.fn(() => ({
              then: vi.fn(() => Promise.resolve({ data: mockHiraganaData, error: null })),
            })),
          };
        }
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              gte: vi.fn(() => ({
                limit: vi.fn(() => Promise.resolve({ data: [], error: null })),
              })),
            })),
          })),
        };
      });

      const result = await fetchAvailableHiragana(mockUserId);

      expect(result.cards).toHaveLength(3); // Limited to 3 new cards
      expect(result.cards[0].front).toBe('あ');
      expect(result.message).toBeUndefined();
    });

    it('should return message when user has studied recently and no cards are due (Priority 3)', async () => {
      vi.mocked(userStudyHelper.checkUserHasStudiedRecently).mockResolvedValue(true);

      (supaClient.from as any).mockImplementation((table: string) => {
        if (table === 'studied_flashcards') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                eq: vi.fn(() => Promise.resolve({ data: [], error: null })),
              })),
            })),
          };
        }
        return {
          select: vi.fn(() => ({
            then: vi.fn(() => Promise.resolve({ data: [], error: null })),
          })),
        };
      });

      const result = await fetchAvailableHiragana(mockUserId);

      expect(result.cards).toHaveLength(0);
      expect(result.message).toBe('You have finished studying for now! Come back later :)');
    });

    it('should return empty array when userId is not provided', async () => {
      const result = await fetchAvailableHiragana('');
      expect(result.cards).toHaveLength(0);
    });
  });

  describe('fetchAvailableKatakana', () => {
    it('should return due cards when they exist', async () => {
      const mockStudiedFlashcards = [
        {
          user_id: mockNumericUserId,
          front: 'ア',
          back: 'a',
          interval: 1,
          repetition: 1,
          efactor: 2.5,
          due_date: '2020-01-01T00:00:00.000Z',
          original_deck: 'katakana',
        },
      ];

      (supaClient.from as any).mockImplementation((table: string) => {
        if (table === 'studied_flashcards') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                eq: vi.fn(() => Promise.resolve({ data: mockStudiedFlashcards, error: null })),
              })),
            })),
          };
        }
        return {
          select: vi.fn(() => ({
            then: vi.fn(() => Promise.resolve({ data: [], error: null })),
          })),
        };
      });

      const result = await fetchAvailableKatakana(mockUserId);
      expect(result.cards).toHaveLength(1);
      expect(result.cards[0].front).toBe('ア');
    });
  });
});

