// Utility for storing and retrieving multiple historical winners
// This ensures winner data persists and displays in Hall of Fame

const STORAGE_KEY = 'tvk_winners_history';
const MAX_WINNERS = 12; // Store up to 12 months of winners

export interface StoredWinner {
  name: string;
  month: string;
  year: number;
  points: number;
  country: string;
  avatar_url?: string;
  storedAt: string; // ISO date string when this was stored
}

/**
 * Get all stored historical winners from localStorage
 */
export const getAllWinners = (): StoredWinner[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    const winners: StoredWinner[] = JSON.parse(stored);
    
    // Sort by year and month (most recent first)
    return winners.sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      const monthOrder = ['January', 'February', 'March', 'April', 'May', 'June', 
                          'July', 'August', 'September', 'October', 'November', 'December'];
      return monthOrder.indexOf(b.month) - monthOrder.indexOf(a.month);
    });
  } catch (error) {
    console.error('Failed to parse stored winners:', error);
    return [];
  }
};

/**
 * Get the stored previous month winner from localStorage (for backward compatibility)
 */
export const getPreviousWinner = (): StoredWinner | null => {
  const winners = getAllWinners();
  return winners.length > 0 ? winners[0] : null;
};

/**
 * Save a winner to localStorage
 * Prevents duplicates and maintains a maximum number of winners
 */
export const savePreviousWinner = (winner: Omit<StoredWinner, 'storedAt'>): void => {
  try {
    const existingWinners = getAllWinners();
    
    // Check if this winner already exists (same month and year)
    const isDuplicate = existingWinners.some(
      w => w.month === winner.month && w.year === winner.year
    );
    
    if (!isDuplicate) {
      const dataToStore: StoredWinner = {
        ...winner,
        storedAt: new Date().toISOString()
      };
      
      // Add new winner and limit to MAX_WINNERS
      const updatedWinners = [dataToStore, ...existingWinners].slice(0, MAX_WINNERS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedWinners));
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
