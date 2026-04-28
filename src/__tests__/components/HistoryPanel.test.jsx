import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import HistoryPanel from '../../components/HistoryPanel.jsx';
import { STORAGE_KEY } from '../../utils/storage.js';

beforeEach(() => {
  localStorage.clear();
});

const onClose = vi.fn();
const onDelete = vi.fn();

describe('HistoryPanel – empty history', () => {
  it('shows empty state message when no history', () => {
    render(<HistoryPanel history={[]} onClose={onClose} onDelete={onDelete} />);
    expect(screen.getByText(/まだ記録がないっちゃ/)).toBeInTheDocument();
  });

  it('calls onClose when the close button is clicked', () => {
    render(<HistoryPanel history={[]} onClose={onClose} onDelete={onDelete} />);
    fireEvent.click(screen.getByText('とじる'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when the backdrop is clicked', () => {
    const { container } = render(<HistoryPanel history={[]} onClose={onClose} onDelete={onDelete} />);
    fireEvent.click(container.firstChild); // backdrop div
    expect(onClose).toHaveBeenCalled();
  });
});

describe('HistoryPanel – with history entries', () => {
  const history = [
    { dayKey: 'day1', date: new Date(2024, 0, 5, 10, 0).toISOString(), mins: 30, week: 'Week A' },
    { dayKey: 'easy', date: new Date(2024, 0, 6, 8, 30).toISOString(), mins: 5, week: 'Week A' },
    { dayKey: 'walk', date: new Date(2024, 0, 7, 9, 0).toISOString(), mins: 40, week: 'Week A' },
  ];

  it('renders one entry per history item', () => {
    render(<HistoryPanel history={history} onClose={onClose} onDelete={onDelete} />);
    const deleteButtons = screen.getAllByText('削除');
    expect(deleteButtons).toHaveLength(history.length);
  });

  it('displays workout duration in minutes', () => {
    render(<HistoryPanel history={history} onClose={onClose} onDelete={onDelete} />);
    expect(screen.getByText(/⏱ 30分/)).toBeInTheDocument();
    expect(screen.getByText(/⏱ 5分/)).toBeInTheDocument();
    expect(screen.getByText(/⏱ 40分/)).toBeInTheDocument();
  });

  it('displays week label for each entry', () => {
    render(<HistoryPanel history={history} onClose={onClose} onDelete={onDelete} />);
    const weekLabels = screen.getAllByText(/Week A/);
    expect(weekLabels.length).toBeGreaterThan(0);
  });

  it('calls onDelete with correct reversed index when delete is clicked', () => {
    render(<HistoryPanel history={history} onClose={onClose} onDelete={onDelete} />);
    const deleteButtons = screen.getAllByText('削除');
    // HistoryPanel shows entries in reverse order, first button = last history entry
    fireEvent.click(deleteButtons[0]);
    expect(onDelete).toHaveBeenCalledWith(history.length - 1 - 0);
  });

  it('shows easy day emoji and label', () => {
    render(<HistoryPanel history={history} onClose={onClose} onDelete={onDelete} />);
    // both 'easy' and 'walk' (no explicit walk case) fall back to EASY_DAY display
    const matches = screen.getAllByText(/5分メニュー/);
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });
});
