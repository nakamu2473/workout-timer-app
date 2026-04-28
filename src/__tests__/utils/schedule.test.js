import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { buildSchedule, getWeekIndex } from '../../utils/schedule.js';
import { STORAGE_KEY } from '../../utils/storage.js';
import { WEEK_ROTATIONS, EASY_DAY, MORNING_DAY, WALK_DAY, EVENING_DAY } from '../../data/weekRotations.js';

beforeEach(() => {
  localStorage.clear();
});

// ─── getWeekIndex ───────────────────────────────────────────────────────────

describe('getWeekIndex', () => {
  it('returns 0 (Week A) when no history exists', () => {
    expect(getWeekIndex()).toBe(0);
  });

  it('returns 0 within the first 7 days of tracking', () => {
    const today = new Date();
    const history = [{ date: today.toISOString() }];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    expect(getWeekIndex()).toBe(0);
  });

  it('returns 1 (Week B) after 7+ days', () => {
    const past = new Date();
    past.setDate(past.getDate() - 7);
    localStorage.setItem(STORAGE_KEY, JSON.stringify([{ date: past.toISOString() }]));
    expect(getWeekIndex()).toBe(1);
  });

  it('returns 2 (Week C) after 14+ days', () => {
    const past = new Date();
    past.setDate(past.getDate() - 14);
    localStorage.setItem(STORAGE_KEY, JSON.stringify([{ date: past.toISOString() }]));
    expect(getWeekIndex()).toBe(2);
  });

  it('returns 3 (Week D) after 21+ days', () => {
    const past = new Date();
    past.setDate(past.getDate() - 21);
    localStorage.setItem(STORAGE_KEY, JSON.stringify([{ date: past.toISOString() }]));
    expect(getWeekIndex()).toBe(3);
  });

  it('wraps back to 0 (Week A) after 28+ days (full cycle)', () => {
    const past = new Date();
    past.setDate(past.getDate() - 28);
    localStorage.setItem(STORAGE_KEY, JSON.stringify([{ date: past.toISOString() }]));
    expect(getWeekIndex()).toBe(0);
  });

  it('returns 0 on invalid JSON in localStorage', () => {
    localStorage.setItem(STORAGE_KEY, 'bad-json');
    expect(getWeekIndex()).toBe(0);
  });

  it('uses the earliest date as the start when multiple history entries exist', () => {
    const recent = new Date();
    const old = new Date();
    old.setDate(old.getDate() - 14);
    const history = [
      { date: recent.toISOString() },
      { date: old.toISOString() },
    ];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    expect(getWeekIndex()).toBe(2);
  });
});

// ─── buildSchedule helpers ───────────────────────────────────────────────────

function countByType(steps, type) {
  return steps.filter(s => s.type === type).length;
}

function getStepsByType(steps, type) {
  return steps.filter(s => s.type === type);
}

// ─── buildSchedule – Week A Day 1 (2 sets) ──────────────────────────────────

describe('buildSchedule – Week A Day 1', () => {
  const steps = buildSchedule('day1', 0);
  const weekData = WEEK_ROTATIONS[0];
  const day = weekData.day1;
  const sets = weekData.sets; // 2

  it('always ends with a done step', () => {
    expect(steps[steps.length - 1].type).toBe('done');
  });

  it('starts with a warmup countdown step', () => {
    expect(steps[0].type).toBe('countdown');
    expect(steps[0].label).toContain('ウォームアップ');
    expect(steps[0].duration).toBe(3);
  });

  it('generates correct number of warmup exercise steps', () => {
    expect(countByType(steps, 'warmup')).toBe(day.warmup.length);
  });

  it('has a main workout countdown step', () => {
    const countdowns = getStepsByType(steps, 'countdown');
    expect(countdowns.length).toBeGreaterThanOrEqual(2); // warmup + main
  });

  it('generates work steps = exercises × sets', () => {
    const workSteps = getStepsByType(steps, 'work');
    expect(workSteps).toHaveLength(day.exercises.length * sets);
  });

  it('work steps have correct set numbers', () => {
    const workSteps = getStepsByType(steps, 'work');
    const set1Steps = workSteps.filter(s => s.set === 1);
    const set2Steps = workSteps.filter(s => s.set === 2);
    expect(set1Steps).toHaveLength(day.exercises.length);
    expect(set2Steps).toHaveLength(day.exercises.length);
  });

  it('work steps carry correct sets total', () => {
    const workSteps = getStepsByType(steps, 'work');
    workSteps.forEach(s => expect(s.sets).toBe(sets));
  });

  it('generates cooldown steps', () => {
    expect(countByType(steps, 'cooldown')).toBe(day.cooldown.length);
  });

  it('inter-set rest has duration 30s', () => {
    const restSteps = getStepsByType(steps, 'rest').filter(s => !s.mini);
    const setBreaks = restSteps.filter(s => s.label && s.label.includes('セット'));
    expect(setBreaks.length).toBeGreaterThan(0);
    setBreaks.forEach(s => expect(s.duration).toBe(30));
  });

  it('does not have rest after last exercise of last set', () => {
    const workSteps = getStepsByType(steps, 'work');
    const lastWork = workSteps[workSteps.length - 1];
    const lastWorkIdx = steps.indexOf(lastWork);
    // next step after last work should be a cooldown countdown, not rest
    const nextStep = steps[lastWorkIdx + 1];
    expect(nextStep.type).toBe('countdown');
    expect(nextStep.label).toContain('クールダウン');
  });
});

// ─── buildSchedule – Week D Day 1 (3 sets) ──────────────────────────────────

describe('buildSchedule – Week D Day 1 (3 sets)', () => {
  const steps = buildSchedule('day1', 3);
  const weekData = WEEK_ROTATIONS[3];
  const day = weekData.day1;
  const sets = weekData.sets; // 3

  it('generates work steps = exercises × 3 sets', () => {
    const workSteps = getStepsByType(steps, 'work');
    expect(workSteps).toHaveLength(day.exercises.length * sets);
  });

  it('has set numbers 1, 2, 3', () => {
    const workSteps = getStepsByType(steps, 'work');
    const setNums = new Set(workSteps.map(s => s.set));
    expect(setNums).toEqual(new Set([1, 2, 3]));
  });

  it('ends with done step', () => {
    expect(steps[steps.length - 1].type).toBe('done');
  });
});

// ─── buildSchedule – EASY_DAY ───────────────────────────────────────────────

describe('buildSchedule – EASY_DAY', () => {
  const steps = buildSchedule('easy', 0);

  it('ends with done step', () => {
    expect(steps[steps.length - 1].type).toBe('done');
  });

  it('has no warmup countdown (EASY_DAY has no warmup)', () => {
    const countdowns = getStepsByType(steps, 'countdown');
    const warmupCountdown = countdowns.find(s => s.label && s.label.includes('ウォームアップ'));
    expect(warmupCountdown).toBeUndefined();
  });

  it('has 1 set of exercises', () => {
    const workSteps = getStepsByType(steps, 'work');
    workSteps.forEach(s => expect(s.set).toBe(1));
  });

  it('generates the correct number of work steps', () => {
    const workSteps = getStepsByType(steps, 'work');
    expect(workSteps).toHaveLength(EASY_DAY.exercises.length);
  });

  it('has cooldown step (腹式呼吸)', () => {
    const cooldownSteps = getStepsByType(steps, 'cooldown');
    expect(cooldownSteps).toHaveLength(1);
    expect(cooldownSteps[0].name).toBe('腹式呼吸');
  });
});

// ─── buildSchedule – WALK_DAY ───────────────────────────────────────────────

describe('buildSchedule – WALK_DAY', () => {
  const steps = buildSchedule('walk', 0);

  it('ends with done step', () => {
    expect(steps[steps.length - 1].type).toBe('done');
  });

  it('has exactly 1 work step (40-minute walk)', () => {
    const workSteps = getStepsByType(steps, 'work');
    expect(workSteps).toHaveLength(1);
    expect(workSteps[0].name).toBe('40分ウォーキング');
    expect(workSteps[0].duration).toBe(2400);
  });

  it('has no warmup or cooldown steps', () => {
    expect(countByType(steps, 'warmup')).toBe(0);
    expect(countByType(steps, 'cooldown')).toBe(0);
  });
});

// ─── buildSchedule – MORNING_DAY ────────────────────────────────────────────

describe('buildSchedule – MORNING_DAY', () => {
  const steps = buildSchedule('morning', 0);

  it('ends with done step', () => {
    expect(steps[steps.length - 1].type).toBe('done');
  });

  it('generates correct number of work steps', () => {
    const workSteps = getStepsByType(steps, 'work');
    expect(workSteps).toHaveLength(MORNING_DAY.exercises.length);
  });

  it('has no warmup or cooldown steps', () => {
    expect(countByType(steps, 'warmup')).toBe(0);
    expect(countByType(steps, 'cooldown')).toBe(0);
  });

  it('has the morning stretch main countdown label', () => {
    const countdowns = getStepsByType(steps, 'countdown');
    expect(countdowns.some(s => s.label && s.label.includes('朝'))).toBe(true);
  });
});

// ─── buildSchedule – EVENING_DAY ────────────────────────────────────────────

describe('buildSchedule – EVENING_DAY', () => {
  const steps = buildSchedule('evening', 0);

  it('ends with done step', () => {
    expect(steps[steps.length - 1].type).toBe('done');
  });

  it('generates correct number of work steps', () => {
    const workSteps = getStepsByType(steps, 'work');
    expect(workSteps).toHaveLength(EVENING_DAY.exercises.length);
  });

  it('has no warmup or cooldown steps', () => {
    expect(countByType(steps, 'warmup')).toBe(0);
    expect(countByType(steps, 'cooldown')).toBe(0);
  });

  it('has the evening stretch main countdown label', () => {
    const countdowns = getStepsByType(steps, 'countdown');
    expect(countdowns.some(s => s.label && s.label.includes('夜'))).toBe(true);
  });
});

// ─── buildSchedule – nextName on rest steps ─────────────────────────────────

describe('buildSchedule – rest step nextName', () => {
  const steps = buildSchedule('day1', 0);
  const weekData = WEEK_ROTATIONS[0];
  const exercises = weekData.day1.exercises;

  it('non-set-break rest steps have nextName pointing to next exercise', () => {
    const restSteps = getStepsByType(steps, 'rest').filter(s => s.mini !== true && !s.label?.includes('セット'));
    restSteps.forEach(s => {
      expect(exercises.some(ex => ex.name === s.nextName)).toBe(true);
    });
  });

  it('set-break rest has nextName pointing to first exercise', () => {
    const setBreaks = getStepsByType(steps, 'rest').filter(s => s.label && s.label.includes('セット'));
    setBreaks.forEach(s => {
      expect(s.nextName).toBe(exercises[0].name);
    });
  });
});
