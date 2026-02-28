export const getToday = () => {
  return new Date();
};

export const isLastWeekOfMonth = (): boolean => {
  const today = getToday();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  // Get the last day of the current month
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  
  // Check if today is the last day of the month (24-hour reveal window)
  return (
    today.getDate() === lastDayOfMonth.getDate() &&
    today.getMonth() === lastDayOfMonth.getMonth() &&
    today.getFullYear() === lastDayOfMonth.getFullYear()
  );
};

export const getTargetRevealDate = (): Date => {
  const today = getToday();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  // Target is the last day of the month at 10:00 AM
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  lastDayOfMonth.setHours(10, 0, 0, 0);

  return lastDayOfMonth;
};

export const getPreviousMonthName = (): string => {
  const today = getToday();
  const previousMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  return previousMonth.toLocaleString('en-US', { month: 'long' });
};

export const getCurrentMonthName = (): string => {
  const today = getToday();
  return today.toLocaleString('en-US', { month: 'long' });
};

export const isNewMonth = (winnerMonthName?: string): boolean => {
  if (!winnerMonthName) return false;
  const today = getToday();
  const currentMonthName = today.toLocaleString('en-US', { month: 'long' });
  return currentMonthName !== winnerMonthName;
};

export const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  
  return date.toLocaleDateString();
};
