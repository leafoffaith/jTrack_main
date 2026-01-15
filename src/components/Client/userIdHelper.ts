/**
 * Converts Supabase auth UUID to numeric user ID for studied_flashcards table
 * The studied_flashcards table uses bigint for user_id, so we hash the UUID
 * to create a consistent numeric ID for each user.
 */
export const getNumericUserId = async (uuid: string): Promise<number> => {
  // Hash UUID to a numeric value (consistent for same UUID)
  const hash = uuid.split('').reduce((acc, char) => {
    const hash = ((acc << 5) - acc) + char.charCodeAt(0);
    return hash & hash; // Convert to 32bit integer
  }, 0);
  
  // Convert to positive number and limit to reasonable range
  const numericId = Math.abs(hash) % 2147483647; // Max safe integer for bigint
  
  return numericId;
};

