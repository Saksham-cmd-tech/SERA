/**
 * Date manipulation and formatting utilities for financial periods.
 */

export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getCurrentTimeString(): string {
  const d = new Date();
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  return `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
}

export function formatDateLabel(dateStr: string): string {
  const today = getTodayDateString();
  const d = new Date(dateStr);
  const todayDate = new Date(today);

  // Compare calendar days
  const diffTime = todayDate.getTime() - d.getTime();
  const diffDays = Math.round(diffTime / (1000 * 3600 * 24));

  if (diffDays === 0) {
    return 'TODAY';
  }
  if (diffDays === 1) {
    return 'YESTERDAY';
  }

  const months = [
    'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
    'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC',
  ];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatMonthYear(date: Date = new Date()): string {
  const months = [
    'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
    'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER',
  ];
  return `${months[date.getMonth()]} ${date.getFullYear()}`;
}

export function getDaysRemainingInMonth(): number {
  const now = new Date();
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  return Math.max(1, lastDay - now.getDate());
}

/**
 * Advances a subscription billing date by one month or one year.
 */
export function advanceNextBillingDate(
  currentDateStr: string,
  freq: 'monthly' | 'yearly'
): string {
  if (!currentDateStr || !/^\d{4}-\d{2}-\d{2}$/.test(currentDateStr)) {
    const today = new Date();
    if (freq === 'yearly') today.setFullYear(today.getFullYear() + 1);
    else today.setMonth(today.getMonth() + 1);
    return today.toISOString().split('T')[0];
  }

  const [y, m, d] = currentDateStr.split('-').map(Number);
  const targetDate = new Date(y, m - 1, d);

  if (freq === 'yearly') {
    targetDate.setFullYear(targetDate.getFullYear() + 1);
  } else {
    targetDate.setMonth(targetDate.getMonth() + 1);
  }

  const nextY = targetDate.getFullYear();
  const nextM = String(targetDate.getMonth() + 1).padStart(2, '0');
  const nextD = String(targetDate.getDate()).padStart(2, '0');
  return `${nextY}-${nextM}-${nextD}`;
}

/**
 * Calculates due status badge info based on calendar date difference.
 */
export function getDueStatus(dueDateStr: string): {
  text: string;
  isUrgent: boolean;
  diffDays: number;
} {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDateStr);
  due.setHours(0, 0, 0, 0);
  const diffDays = Math.ceil(
    (due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays === 0) return { text: 'DUE TODAY', isUrgent: true, diffDays };
  if (diffDays === 1) return { text: 'DUE TOMORROW', isUrgent: true, diffDays };
  if (diffDays < 0) return { text: `OVERDUE (${Math.abs(diffDays)}d)`, isUrgent: true, diffDays };
  if (diffDays <= 7) return { text: `IN ${diffDays} DAYS`, isUrgent: false, diffDays };
  return { text: `IN ${diffDays} DAYS`, isUrgent: false, diffDays };
}
