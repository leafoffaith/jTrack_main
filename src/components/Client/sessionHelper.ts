
/**
 * Get the current session date in IST (Indian Standard Time)
 * A session is determined by End of Day (EOD) in IST
 * IST is UTC+5:30
 * Returns a date string in format YYYY-MM-DD
 */
export const getCurrentSessionDate = (): string => {
  // Get current UTC time
  const now = new Date();
  // IST is UTC+5:30 (5.5 hours ahead)
  // Add 5 hours and 30 minutes in milliseconds
  const istOffsetMs = (5 * 60 + 30) * 60 * 1000; // 5.5 hours in milliseconds
  const istTimestamp = now.getTime() + istOffsetMs;
  const istDate = new Date(istTimestamp);
  
  // Get UTC date components (since we've already added the offset)
  const year = istDate.getUTCFullYear();
  const month = String(istDate.getUTCMonth() + 1).padStart(2, '0');
  const day = String(istDate.getUTCDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

/**
 * Check if we're in a new session (new day in IST)
 */
export const isNewSession = (): boolean => {
  const lastSessionDate = localStorage.getItem('lastSessionDate');
  const currentSessionDate = getCurrentSessionDate();
  
  if (lastSessionDate !== currentSessionDate) {
    localStorage.setItem('lastSessionDate', currentSessionDate);
    // Clear new cards shown today
    localStorage.removeItem('hiraganaNewCardsToday');
    localStorage.removeItem('katakanaNewCardsToday');
    return true;
  }
  
  return false;
};

/**
 * Get new cards shown today for a specific deck
 */
export const getNewCardsShownToday = (deckType: string): string[] => {
  const key = `${deckType}NewCardsToday`;
  const stored = localStorage.getItem(key);
  if (!stored) return [];
  
  try {
    const data = JSON.parse(stored);
    // Check if it's from today
    if (data.date === getCurrentSessionDate()) {
      return data.cards || [];
    }
    // If it's from a different day, clear it
    localStorage.removeItem(key);
    return [];
  } catch {
    return [];
  }
};

/**
 * Mark a new card as shown today for a specific deck
 */
export const markNewCardShown = (deckType: string, front: string): void => {
  const key = `${deckType}NewCardsToday`;
  const currentCards = getNewCardsShownToday(deckType);
  
  if (!currentCards.includes(front)) {
    currentCards.push(front);
    localStorage.setItem(key, JSON.stringify({
      date: getCurrentSessionDate(),
      cards: currentCards
    }));
  }
};

/**
 * Initialize session - call this on app load
 */
export const initializeSession = (): void => {
  isNewSession(); // This will update lastSessionDate if needed
};

