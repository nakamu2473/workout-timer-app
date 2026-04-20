import { describe, it, expect, beforeEach } from 'vitest';
import { loadHistory, saveHistory, formatDate, STORAGE_KEY } from '../../utils/storage.js';

beforeEach(() => {
  localStorage.clear();
});

describe('loadHistory', () => {
  it('returns empty array when localStorage is empty', () => {
    expect(loadHistory()).toEqual([]);
  });

  it('returns parsed history from localStorage', () => {
    const data = [{ dayKey: 'day1', date: '2024-01-01T10:00:00Z', mins: 30, week: 'Week A' }];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    expect(loadHistory()).toEqual(data);
  });

  it('returns empty array on invalid JSON', () => {
    localStorage.setItem(STORAGE_KEY, 'not-valid-json');
    expect(loadHistory()).toEqual([]);
  });
});

describe('saveHistory', () => {
  it('saves history to localStorage', () => {
    const data = [{ dayKey: 'day2', date: '2024-02-01T08:00:00Z', mins: 25, week: 'Week B' }];
    saveHistory(data);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY))).toEqual(data);
  });

  it('limits storage to last 60 entries', () => {
    const data = Array.from({ length: 70 }, (_, i) => ({
      dayKey: 'day1',
      date: `2024-01-${String(i + 1).padStart(2, '0')}T00:00:00Z`,
      mins: 20,
      week: 'Week A',
    }));
    saveHistory(data);
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    expect(stored).toHaveLength(60);
    // keeps the last 60 (slices from the end)
    expect(stored[0]).toEqual(data[10]);
    expect(stored[59]).toEqual(data[69]);
  });

  it('saves fewer than 60 entries unchanged', () => {
    const data = [
      { dayKey: 'easy', date: '2024-03-01T00:00:00Z', mins: 5, week: 'Week A' },
      { dayKey: 'walk', date: '2024-03-02T00:00:00Z', mins: 40, week: 'Week A' },
    ];
    saveHistory(data);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY))).toHaveLength(2);
  });
});

describe('formatDate', () => {
  it('formats an ISO timestamp to MM/DD HH:MM', () => {
    // Use a fixed local date by constructing explicitly
    const d = new Date(2024, 0, 5, 9, 3); // Jan 5, 2024 09:03
    const result = formatDate(d.toISOString());
    expect(result).toBe('1/5 09:03');
  });

  it('pads single-digit minutes with zero', () => {
    const d = new Date(2024, 5, 15, 14, 7); // Jun 15, 2024 14:07
    expect(formatDate(d.toISOString())).toBe('6/15 14:07');
  });

  it('pads single-digit hours with zero', () => {
    const d = new Date(2024, 11, 31, 8, 45); // Dec 31, 2024 08:45
    expect(formatDate(d.toISOString())).toBe('12/31 08:45');
  });

  it('handles midnight correctly', () => {
    const d = new Date(2024, 3, 20, 0, 0); // Apr 20, 2024 00:00
    expect(formatDate(d.toISOString())).toBe('4/20 00:00');
  });
});
