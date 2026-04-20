import { describe, it, expect } from 'vitest';
import { phaseColor, phaseBadgeLabel } from '../../utils/phase.js';

const DAY_COLOR = '#FF6B6B';

describe('phaseColor', () => {
  it('returns dayColor when step is null/undefined', () => {
    expect(phaseColor(null, DAY_COLOR)).toBe(DAY_COLOR);
    expect(phaseColor(undefined, DAY_COLOR)).toBe(DAY_COLOR);
  });

  it('returns orange for warmup steps', () => {
    expect(phaseColor({ type: 'warmup' }, DAY_COLOR)).toBe('#F0A500');
  });

  it('returns blue for cooldown steps', () => {
    expect(phaseColor({ type: 'cooldown' }, DAY_COLOR)).toBe('#5DADE2');
  });

  it('returns step.color for countdown steps', () => {
    const step = { type: 'countdown', color: '#AABBCC' };
    expect(phaseColor(step, DAY_COLOR)).toBe('#AABBCC');
  });

  it('returns semi-transparent white for mini rest steps', () => {
    const step = { type: 'rest', mini: true };
    expect(phaseColor(step, DAY_COLOR)).toBe('rgba(255,255,255,0.5)');
  });

  it('returns purple for regular rest steps', () => {
    const step = { type: 'rest' };
    expect(phaseColor(step, DAY_COLOR)).toBe('#a29bfe');
  });

  it('returns dayColor for work steps', () => {
    expect(phaseColor({ type: 'work' }, DAY_COLOR)).toBe(DAY_COLOR);
  });

  it('returns dayColor for done step', () => {
    expect(phaseColor({ type: 'done' }, DAY_COLOR)).toBe(DAY_COLOR);
  });
});

describe('phaseBadgeLabel', () => {
  it('returns empty string when step is null/undefined', () => {
    expect(phaseBadgeLabel(null)).toBe('');
    expect(phaseBadgeLabel(undefined)).toBe('');
  });

  it('returns step.label for countdown steps', () => {
    expect(phaseBadgeLabel({ type: 'countdown', label: '🔥 ウォームアップ' })).toBe('🔥 ウォームアップ');
  });

  it('returns warmup label for warmup steps', () => {
    expect(phaseBadgeLabel({ type: 'warmup' })).toBe('🔥 ウォームアップ');
  });

  it('returns cooldown label for cooldown steps', () => {
    expect(phaseBadgeLabel({ type: 'cooldown' })).toBe('🧊 クールダウン');
  });

  it('returns set progress for work steps', () => {
    expect(phaseBadgeLabel({ type: 'work', set: 1, sets: 3 })).toBe('セット1 / 3');
    expect(phaseBadgeLabel({ type: 'work', set: 2, sets: 2 })).toBe('セット2 / 2');
  });

  it('returns arrow for mini rest steps', () => {
    expect(phaseBadgeLabel({ type: 'rest', mini: true })).toBe('→ 次へ');
  });

  it('returns rest label for regular rest steps', () => {
    expect(phaseBadgeLabel({ type: 'rest' })).toBe('💨 休憩');
  });

  it('returns done label for done steps', () => {
    expect(phaseBadgeLabel({ type: 'done' })).toBe('🎉 完了！');
  });
});
