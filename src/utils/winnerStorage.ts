// Utility for storing and retrieving the previous month's winner
// This ensures the winner name stays consistent and doesn't change

const STORAGE_KEY = 'tvk_previous_winner';

export interface StoredWinner {
  name: string;
  month: string;
  year: number;
  points: number;
  country: string;
  storedAt: string; // ISO date string when this was stored
}

/**
 * Get the stored previous month winner from localStorage
 */
export const getPreviousWinner = (): StoredWinner | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    
    const winner: StoredWinner = JSON.parse(stored);
    
    // Validate the stored data has all required fields
    if (!winner.name || !winner.month) {
      return null;
    }
    
    return winner;
  } catch (error) {
    console.error('Failed to parse stored winner:', error);
    return null;
  }
};

/**
 * Save the previous month winner to localStorage
 * Only saves if this is a new winner (different month/year or first time)
 */
export const savePreviousWinner = (winner: Omit<StoredWinner, 'storedAt'>): void => {
  try {
    const existing = getPreviousWinner();
    
    // Only update if it's a different month/year or if we don't have data yet
    if (!existing || existing.month !== winner.month || existing.year !== winner.year) {
      const dataToStore: StoredWinner = {
        ...winner,
        storedAt: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToStore));
    }
  } catch (error) {
    console.error('Failed to save winner:', error);
  }
};

/**
 * Clear the stored winner (use with caution, mainly for testing)
 */
export const clearStoredWinner = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear stored winner:', error);
  }
};

/**
 * Check if the stored winner is from the expected previous month
 */
export const isWinnerFromPreviousMonth = (previousMonthName: string): boolean => {
  const winner = getPreviousWinner();
  if (!winner) return false;
  return winner.month.toLowerCase() === previousMonthName.toLowerCase();
};
