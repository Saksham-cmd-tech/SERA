import { advanceNextBillingDate, getDueStatus } from '../src/utils/date';

describe('date utils for subscriptions', () => {
  it('advances monthly subscription date correctly', () => {
    const next = advanceNextBillingDate('2026-10-25', 'monthly');
    expect(next).toBe('2026-11-25');
  });

  it('advances monthly subscription date across year boundary', () => {
    const next = advanceNextBillingDate('2026-12-15', 'monthly');
    expect(next).toBe('2027-01-15');
  });

  it('advances yearly subscription date correctly', () => {
    const next = advanceNextBillingDate('2026-10-25', 'yearly');
    expect(next).toBe('2027-10-25');
  });

  it('calculates due status for today', () => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    const todayStr = `${y}-${m}-${d}`;

    const status = getDueStatus(todayStr);
    expect(status.text).toBe('DUE TODAY');
    expect(status.isUrgent).toBe(true);
    expect(status.diffDays).toBe(0);
  });

  it('calculates due status for overdue date', () => {
    const status = getDueStatus('2020-01-01');
    expect(status.isUrgent).toBe(true);
    expect(status.text).toContain('OVERDUE');
  });
});
