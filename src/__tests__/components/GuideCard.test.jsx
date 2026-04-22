import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import GuideCard from '../../components/GuideCard.jsx';

const COLOR = '#FF6B6B';

describe('GuideCard', () => {
  it('renders nothing when exercise name has no guide entry', () => {
    const { container } = render(<GuideCard name="存在しない種目" color={COLOR} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders guide points for スクワット', () => {
    render(<GuideCard name="スクワット" color={COLOR} />);
    // Header text
    expect(screen.getByText(/やり方だっちゃ/)).toBeInTheDocument();
    // Numbered step circles
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('renders the tip for スクワット', () => {
    render(<GuideCard name="スクワット" color={COLOR} />);
    expect(screen.getByText(/背中を丸めないで/)).toBeInTheDocument();
  });

  it('renders the correct number of step circles', () => {
    render(<GuideCard name="クランチ" color={COLOR} />);
    // クランチ has 5 points in EXERCISE_GUIDE
    const circles = screen.getAllByText(/^\d+$/);
    expect(circles.length).toBe(5);
  });

  it('renders guide for デッドバグ', () => {
    render(<GuideCard name="デッドバグ" color={COLOR} />);
    expect(screen.getByText(/腰を床にしっかり押し付ける/)).toBeInTheDocument();
  });
});
