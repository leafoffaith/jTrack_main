import { supaClient } from './supaClient';
import { getNumericUserId } from './userIdHelper';

/**
 * Check if user has studied within the last 24 hours
 * If deckType is provided, only checks cards from that specific deck
 * Otherwise checks ANY card in studied_flashcards
 */
export const checkUserHasStudiedRecently = async (userId: string, deckType?: string): Promise<boolean> => {
  try {
    const numericUserId = await getNumericUserId(userId);

    // Get current time minus 24 hours
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    // Build query - filter by deck type if provided
    let query = supaClient
      .from('studied_flashcards')
      .select('id')
      .eq('user_id', numericUserId)
      .gte('last_studied', twentyFourHoursAgo.toISOString());

    if (deckType) {
      query = query.eq('original_deck', deckType);
    }

    const { data, error } = await query.limit(1);

    if (error) {
      console.error('Error checking user study status:', error);
      return false;
    }

    return (data?.length ?? 0) > 0;
  } catch (error) {
    console.error('Error checking user study status:', error);
    return false;
  }
};

/**
 * Update user_has_studied in users table
 * Uses numeric user_id to match studied_flashcards table
 */
export const updateUserHasStudied = async (userId: string, hasStudied: boolean): Promise<void> => {
  try {
    const numericUserId = await getNumericUserId(userId);
    
    // Try to update by numeric ID (assuming users table has numeric id matching user_id in studied_flashcards)
    const { error } = await supaClient
      .from('users')
      .update({ user_has_studied: hasStudied })
      .eq('id', numericUserId);
    
    if (error) {
      // If that fails, try with UUID (in case users table uses UUID)
      const { error: uuidError } = await supaClient
        .from('users')
        .update({ user_has_studied: hasStudied })
        .eq('id', userId);
      
      if (uuidError) {
        console.error('Error updating user_has_studied:', uuidError);
      }
    }
  } catch (error) {
    console.error('Error updating user_has_studied:', error);
  }
};

/**
 * Get user_has_studied status from users table
 * Uses numeric user_id to match studied_flashcards table
 */
export const getUserHasStudied = async (userId: string): Promise<boolean> => {
  try {
    const numericUserId = await getNumericUserId(userId);
    
    // Try to get by numeric ID first
    const { data, error } = await supaClient
      .from('users')
      .select('user_has_studied')
      .eq('id', numericUserId)
      .maybeSingle();
    
    if (error || !data) {
      // If that fails, try with UUID
      const { data: uuidData, error: uuidError } = await supaClient
        .from('users')
        .select('user_has_studied')
        .eq('id', userId)
        .maybeSingle();
      
      if (uuidError) {
        console.error('Error getting user_has_studied:', uuidError);
        return false;
      }
      
      return uuidData?.user_has_studied ?? false;
    }
    
    return data?.user_has_studied ?? false;
  } catch (error) {
    console.error('Error getting user_has_studied:', error);
    return false;
  }
};

