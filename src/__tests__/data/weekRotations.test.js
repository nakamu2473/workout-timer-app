import { describe, it, expect } from 'vitest';
import { WEEK_ROTATIONS, EASY_DAY, MORNING_DAY, WALK_DAY, EVENING_DAY } from '../../data/weekRotations.js';

// ─── WEEK_ROTATIONS structure ─────────────────────────────────────────────────

describe('WEEK_ROTATIONS', () => {
  it('has exactly 4 weeks', () => {
    expect(WEEK_ROTATIONS).toHaveLength(4);
  });

  it.each([
    [0, 'Week A', '基礎固め', 2],
    [1, 'Week B', '少し強化', 2],
    [2, 'Week C', '本格強化', 2],
    [3, 'Week D', '最高強度🔥', 3],
  ])('Week %i has label, sublabel, and correct sets', (idx, label, sublabel, sets) => {
    expect(WEEK_ROTATIONS[idx].label).toBe(label);
    expect(WEEK_ROTATIONS[idx].sublabel).toBe(sublabel);
    expect(WEEK_ROTATIONS[idx].sets).toBe(sets);
  });

  it.each([0, 1, 2, 3])('Week %i has day1, day2, day3', (idx) => {
    const week = WEEK_ROTATIONS[idx];
    expect(week.day1).toBeDefined();
    expect(week.day2).toBeDefined();
    expect(week.day3).toBeDefined();
  });

  it.each([0, 1, 2, 3])('every day in Week %i has exercises, warmup, cooldown, color, emoji', (idx) => {
    const week = WEEK_ROTATIONS[idx];
    ['day1', 'day2', 'day3'].forEach(dayKey => {
      const day = week[dayKey];
      expect(Array.isArray(day.exercises)).toBe(true);
      expect(day.exercises.length).toBeGreaterThan(0);
      expect(Array.isArray(day.warmup)).toBe(true);
      expect(Array.isArray(day.cooldown)).toBe(true);
      expect(day.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(day.emoji).toBeTruthy();
    });
  });

  it('each exercise has name, reps, duration, and rest', () => {
    WEEK_ROTATIONS.forEach((week, wi) => {
      ['day1', 'day2', 'day3'].forEach(dayKey => {
        week[dayKey].exercises.forEach(ex => {
          expect(ex.name, `Week ${wi} ${dayKey}`).toBeTruthy();
          expect(ex.reps, `Week ${wi} ${dayKey} ${ex.name}`).toBeTruthy();
          expect(typeof ex.duration).toBe('number');
          expect(ex.duration).toBeGreaterThan(0);
          expect(typeof ex.rest).toBe('number');
        });
      });
    });
  });

  it('Week D has 3 sets (highest intensity)', () => {
    expect(WEEK_ROTATIONS[3].sets).toBe(3);
  });

  it('Week D uses longer rest periods than Week A', () => {
    const weekARestTotal = WEEK_ROTATIONS[0].day1.exercises.reduce((s, ex) => s + ex.rest, 0);
    const weekDRestTotal = WEEK_ROTATIONS[3].day1.exercises.reduce((s, ex) => s + ex.rest, 0);
    expect(weekDRestTotal).toBeGreaterThanOrEqual(weekARestTotal);
  });
});

// ─── EASY_DAY ────────────────────────────────────────────────────────────────

describe('EASY_DAY', () => {
  it('has sets = 1', () => {
    expect(EASY_DAY.sets).toBe(1);
  });

  it('has no warmup', () => {
    expect(EASY_DAY.warmup).toEqual([]);
  });

  it('has exercises', () => {
    expect(EASY_DAY.exercises.length).toBeGreaterThan(0);
  });

  it('has a cooldown (腹式呼吸)', () => {
    expect(EASY_DAY.cooldown.length).toBeGreaterThan(0);
    expect(EASY_DAY.cooldown[0].name).toBe('腹式呼吸');
  });

  it('has color and emoji', () => {
    expect(EASY_DAY.color).toMatch(/^#/);
    expect(EASY_DAY.emoji).toBeTruthy();
  });
});

// ─── WALK_DAY ────────────────────────────────────────────────────────────────

describe('WALK_DAY', () => {
  it('has sets = 1', () => {
    expect(WALK_DAY.sets).toBe(1);
  });

  it('has no warmup or cooldown', () => {
    expect(WALK_DAY.warmup).toEqual([]);
    expect(WALK_DAY.cooldown).toEqual([]);
  });

  it('has a single 40-minute walk exercise (2400 seconds)', () => {
    expect(WALK_DAY.exercises).toHaveLength(1);
    expect(WALK_DAY.exercises[0].duration).toBe(2400);
  });

  it('has a mainLabel for the main workout countdown', () => {
    expect(WALK_DAY.mainLabel).toBeTruthy();
  });
});

// ─── EVENING_DAY ─────────────────────────────────────────────────────────────

describe('EVENING_DAY', () => {
  it('has sets = 1', () => {
    expect(EVENING_DAY.sets).toBe(1);
  });

  it('has no warmup or cooldown', () => {
    expect(EVENING_DAY.warmup).toEqual([]);
    expect(EVENING_DAY.cooldown).toEqual([]);
  });

  it('has multiple stretch exercises', () => {
    expect(EVENING_DAY.exercises.length).toBeGreaterThan(3);
  });

  it('ends with 腹式呼吸', () => {
    const last = EVENING_DAY.exercises[EVENING_DAY.exercises.length - 1];
    expect(last.name).toBe('腹式呼吸');
  });

  it('has a mainLabel that includes 夜', () => {
    expect(EVENING_DAY.mainLabel).toContain('夜');
  });

  it('has color and emoji', () => {
    expect(EVENING_DAY.color).toMatch(/^#/);
    expect(EVENING_DAY.emoji).toBeTruthy();
  });
});

// ─── MORNING_DAY ─────────────────────────────────────────────────────────────

describe('MORNING_DAY', () => {
  it('has sets = 1', () => {
    expect(MORNING_DAY.sets).toBe(1);
  });

  it('has no warmup or cooldown', () => {
    expect(MORNING_DAY.warmup).toEqual([]);
    expect(MORNING_DAY.cooldown).toEqual([]);
  });

  it('has multiple stretch exercises', () => {
    expect(MORNING_DAY.exercises.length).toBeGreaterThan(3);
  });

  it('ends with 腹式呼吸', () => {
    const last = MORNING_DAY.exercises[MORNING_DAY.exercises.length - 1];
    expect(last.name).toBe('腹式呼吸');
  });

  it('has a mainLabel that includes 朝', () => {
    expect(MORNING_DAY.mainLabel).toContain('朝');
  });
});
