import { supaClient } from './supaClient';

/**
 * Converts Supabase auth UUID to numeric user ID for studied_flashcards table
 * The studied_flashcards table uses bigint for user_id, so we need to convert
 * the UUID string to a number. This function tries to get it from the users
 * table first, then falls back to a hash of the UUID.
 */
export const getNumericUserId = async (uuid: string): Promise<number> => {
  try {
    // Try to get numeric ID from users table if it exists
    const { data, error } = await supaClient
      .from('users')
      .select('id')
      .eq('id', uuid) // Assuming users.id might be the UUID
      .single();
    
    // If users table has a separate numeric_id column, query that instead
    // For now, we'll use a hash of the UUID as fallback
    if (error || !data) {
      // Hash UUID to a numeric value (consistent for same UUID)
      const hash = uuid.split('').reduce((acc, char) => {
        const hash = ((acc << 5) - acc) + char.charCodeAt(0);
        return hash & hash; // Convert to 32bit integer
      }, 0);
      // Convert to positive number and limit to reasonable range
      return Math.abs(hash) % 2147483647; // Max safe integer for bigint
    }
    
    // If data.id is already a number, return it
    if (typeof data.id === 'number') {
      return data.id;
    }
    
    // Otherwise hash the UUID
    const hash = uuid.split('').reduce((acc, char) => {
      const hash = ((acc << 5) - acc) + char.charCodeAt(0);
      return hash & hash;
    }, 0);
    return Math.abs(hash) % 2147483647;
  } catch (error) {
    console.error('Error getting numeric user ID:', error);
    // Fallback: hash UUID to number
    const hash = uuid.split('').reduce((acc, char) => {
      const hash = ((acc << 5) - acc) + char.charCodeAt(0);
      return hash & hash;
    }, 0);
    return Math.abs(hash) % 2147483647;
  }
};

