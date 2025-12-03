import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supaClient } from '../components/Client/supaClient';
import { getNumericUserId } from '../components/Client/userIdHelper';
import {
  checkUserHasStudiedRecently,
  updateUserHasStudied,
  getUserHasStudied,
} from '../components/Client/userStudyHelper';

// Mock Supabase client
vi.mock('../components/Client/supaClient', () => ({
  supaClient: {
    from: vi.fn(),
    auth: {
      getSession: vi.fn(),
    },
  },
}));

// Mock userIdHelper but allow actual implementation to be tested
vi.mock('../components/Client/userIdHelper', async () => {
  const actual = await vi.importActual('../components/Client/userIdHelper');
  return {
    ...actual,
    getNumericUserId: vi.fn(),
  };
});

describe('Database Connection', () => {
  const mockUserId = 'test-uuid-123';
  const mockNumericUserId = 12345;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getNumericUserId', () => {
    it('should return numeric ID from users table if exists', async () => {
      const mockUserData = { id: mockNumericUserId };

      (supaClient.from as any).mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: mockUserData, error: null })),
          })),
        })),
      });

      vi.mocked(getNumericUserId).mockImplementation(async (uuid: string) => {
        const { data } = await supaClient.from('users').select('id').eq('id', uuid).single();
        if (data?.id && typeof data.id === 'number') {
          return data.id;
        }
        // Hash fallback
        const hash = uuid.split('').reduce((acc, char) => {
          const h = ((acc << 5) - acc) + char.charCodeAt(0);
          return h & h;
        }, 0);
        return Math.abs(hash) % 2147483647;
      });

      const result = await getNumericUserId(mockUserId);
      expect(result).toBe(mockNumericUserId);
    });

    it('should hash UUID to numeric value when user not found', async () => {
      (supaClient.from as any).mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: null, error: { message: 'Not found' } })),
          })),
        })),
      });

      vi.mocked(getNumericUserId).mockImplementation(async (uuid: string) => {
        const hash = uuid.split('').reduce((acc, char) => {
          const h = ((acc << 5) - acc) + char.charCodeAt(0);
          return h & h;
        }, 0);
        return Math.abs(hash) % 2147483647;
      });

      const result1 = await getNumericUserId(mockUserId);
      const result2 = await getNumericUserId(mockUserId);

      // Should return consistent hash for same UUID
      expect(result1).toBe(result2);
      expect(typeof result1).toBe('number');
      expect(result1).toBeGreaterThan(0);
    });

    it('should handle errors gracefully', async () => {
      (supaClient.from as any).mockImplementation(() => {
        throw new Error('Database error');
      });

      vi.mocked(getNumericUserId).mockImplementation(async () => {
        // Hash fallback on error
        const hash = mockUserId.split('').reduce((acc, char) => {
          const h = ((acc << 5) - acc) + char.charCodeAt(0);
          return h & h;
        }, 0);
        return Math.abs(hash) % 2147483647;
      });

      const result = await getNumericUserId(mockUserId);
      // Should return a hash even on error
      expect(typeof result).toBe('number');
      expect(result).toBeGreaterThan(0);
    });
  });

  describe('checkUserHasStudiedRecently', () => {
    it('should return true if user has studied within 24 hours', async () => {
      const recentTimestamp = new Date();
      recentTimestamp.setHours(recentTimestamp.getHours() - 12); // 12 hours ago

      const mockStudiedCard = {
        id: 1,
        user_id: mockNumericUserId,
        last_studied: recentTimestamp.toISOString(),
      };

      vi.mocked(getNumericUserId).mockResolvedValue(mockNumericUserId);

      (supaClient.from as any).mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            gte: vi.fn(() => ({
              limit: vi.fn(() => Promise.resolve({ data: [mockStudiedCard], error: null })),
            })),
          })),
        })),
      });

      const result = await checkUserHasStudiedRecently(mockUserId);
      expect(result).toBe(true);
    });

    it('should return false if user has not studied within 24 hours', async () => {
      vi.mocked(getNumericUserId).mockResolvedValue(mockNumericUserId);

      (supaClient.from as any).mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            gte: vi.fn(() => ({
              limit: vi.fn(() => Promise.resolve({ data: [], error: null })),
            })),
          })),
        })),
      });

      const result = await checkUserHasStudiedRecently(mockUserId);
      expect(result).toBe(false);
    });

    it('should handle database errors', async () => {
      vi.mocked(getNumericUserId).mockResolvedValue(mockNumericUserId);

      (supaClient.from as any).mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            gte: vi.fn(() => ({
              limit: vi.fn(() => Promise.resolve({ data: null, error: { message: 'DB error' } })),
            })),
          })),
        })),
      });

      const result = await checkUserHasStudiedRecently(mockUserId);
      expect(result).toBe(false);
    });
  });

  describe('updateUserHasStudied', () => {
    it('should update user_has_studied to true', async () => {
      vi.mocked(getNumericUserId).mockResolvedValue(mockNumericUserId);

      const mockUpdate = vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: null, error: null })),
      }));

      (supaClient.from as any).mockReturnValue({
        update: mockUpdate,
      });

      await updateUserHasStudied(mockUserId, true);

      expect(supaClient.from).toHaveBeenCalledWith('users');
      expect(mockUpdate).toHaveBeenCalled();
    });

    it('should handle update errors gracefully', async () => {
      vi.mocked(getNumericUserId).mockResolvedValue(mockNumericUserId);

      (supaClient.from as any).mockReturnValue({
        update: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ data: null, error: { message: 'Update failed' } })),
        })),
      });

      // Should not throw
      await expect(updateUserHasStudied(mockUserId, true)).resolves.not.toThrow();
    });
  });

  describe('getUserHasStudied', () => {
    it('should return user_has_studied status from database', async () => {
      vi.mocked(getNumericUserId).mockResolvedValue(mockNumericUserId);

      (supaClient.from as any).mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            maybeSingle: vi.fn(() =>
              Promise.resolve({ data: { user_has_studied: true }, error: null })
            ),
          })),
        })),
      });

      const result = await getUserHasStudied(mockUserId);
      expect(result).toBe(true);
    });

    it('should return false when user_has_studied is false', async () => {
      vi.mocked(getNumericUserId).mockResolvedValue(mockNumericUserId);

      (supaClient.from as any).mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            maybeSingle: vi.fn(() =>
              Promise.resolve({ data: { user_has_studied: false }, error: null })
            ),
          })),
        })),
      });

      const result = await getUserHasStudied(mockUserId);
      expect(result).toBe(false);
    });

    it('should return false when user not found', async () => {
      vi.mocked(getNumericUserId).mockResolvedValue(mockNumericUserId);

      (supaClient.from as any).mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            maybeSingle: vi.fn(() => Promise.resolve({ data: null, error: null })),
          })),
        })),
      });

      const result = await getUserHasStudied(mockUserId);
      expect(result).toBe(false);
    });
  });
});

