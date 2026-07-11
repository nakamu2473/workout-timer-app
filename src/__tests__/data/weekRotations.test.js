import { describe, it, expect } from 'vitest';
import { WEEK_ROTATIONS, EASY_DAY, DUMBBELL_DAY, MORNING_DAY, EVENING_DAY, YOGA_DAY } from '../../data/weekRotations.js';

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

// ─── DUMBBELL_DAY ────────────────────────────────────────────────────────────

describe('DUMBBELL_DAY', () => {
  it('has sets = 1', () => {
    expect(DUMBBELL_DAY.sets).toBe(1);
  });

  it('has no warmup', () => {
    expect(DUMBBELL_DAY.warmup).toEqual([]);
  });

  it('has the 4 dumbbell exercises in order', () => {
    expect(DUMBBELL_DAY.exercises.map(ex => ex.name)).toEqual([
      'ダンベルスクワット',
      'ダンベルショルダープレス',
      'ダンベルロー',
      'ダンベルカール',
    ]);
  });

  it('every exercise states its weight in reps', () => {
    DUMBBELL_DAY.exercises.forEach(ex => {
      expect(ex.reps).toMatch(/kg/);
    });
  });

  it('ダンベルロー reps includes 左右 (triggers mid-point switch announcement)', () => {
    const row = DUMBBELL_DAY.exercises.find(ex => ex.name === 'ダンベルロー');
    expect(row.reps).toContain('左右');
  });

  it('has a cooldown (腹式呼吸)', () => {
    expect(DUMBBELL_DAY.cooldown.length).toBeGreaterThan(0);
    expect(DUMBBELL_DAY.cooldown[0].name).toBe('腹式呼吸');
  });

  it('has a mainLabel that includes ダンベル', () => {
    expect(DUMBBELL_DAY.mainLabel).toContain('ダンベル');
  });

  it('has color and emoji', () => {
    expect(DUMBBELL_DAY.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    expect(DUMBBELL_DAY.emoji).toBeTruthy();
  });

  it('fits the 5-7 minute target', () => {
    const mainSecs = DUMBBELL_DAY.exercises.reduce((s, ex, i) =>
      s + ex.duration + (i < DUMBBELL_DAY.exercises.length - 1 ? ex.rest : 0), 0);
    const cooldownSecs = DUMBBELL_DAY.cooldown.reduce((s, ex) => s + ex.duration, 0);
    const total = mainSecs + cooldownSecs;
    expect(total).toBeGreaterThanOrEqual(4.5 * 60);
    expect(total).toBeLessThanOrEqual(7 * 60);
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

// ─── YOGA_DAY（cueベース誘導ナレーション）───────────────────────────────────

describe('YOGA_DAY narration cues', () => {
  // 「5」の1秒後に「4」が来るcueを持つ種目 = 力を入れる系
  // （呼吸誘導のカウントアップにも「5」が含まれるため降順で判定する）
  const countdownStart = (ex) =>
    ex.cues.find(c => c.text === '5' && ex.cues.some(d => d.at === c.at + 1 && d.text === '4'));
  const tensionExercises = YOGA_DAY.exercises.filter(ex => countdownStart(ex));

  it('is silent with sets = 1', () => {
    expect(YOGA_DAY.silent).toBe(true);
    expect(YOGA_DAY.sets).toBe(1);
  });

  it('every exercise has cues starting at 0, in ascending order, within duration', () => {
    YOGA_DAY.exercises.forEach(ex => {
      expect(Array.isArray(ex.cues), ex.name).toBe(true);
      expect(ex.cues[0].at, ex.name).toBe(0);
      for (let i = 1; i < ex.cues.length; i++) {
        expect(ex.cues[i].at, `${ex.name} cue #${i}`).toBeGreaterThan(ex.cues[i - 1].at);
      }
      ex.cues.forEach(c => expect(c.at, `${ex.name} "${c.text}"`).toBeLessThan(ex.duration));
    });
  });

  it('the 6 tension exercises count down 5→1 at real 1-second intervals', () => {
    expect(tensionExercises).toHaveLength(6);
    tensionExercises.forEach(ex => {
      const start = countdownStart(ex).at;
      ['5', '4', '3', '2', '1'].forEach((n, i) => {
        expect(ex.cues.find(c => c.at === start + i)?.text, `${ex.name} +${i}s`).toBe(n);
      });
    });
  });

  it('leaves at least 15 seconds to savor the release after each countdown', () => {
    tensionExercises.forEach(ex => {
      const lastCount = countdownStart(ex).at + 4; // 「1」の時点
      expect(ex.duration - lastCount, ex.name).toBeGreaterThanOrEqual(15);
    });
  });

  it('breathing guidance counts up at real 1-second intervals (4 in / 6 out)', () => {
    const intro = YOGA_DAY.exercises[0];
    // カウントアップ（「1」の1秒後に「2」）が吸う4拍×2回・吐く6拍×2回ぶんある
    const upStarts = intro.cues.filter(c =>
      c.text === '1' && intro.cues.some(d => d.at === c.at + 1 && d.text === '2'));
    expect(upStarts).toHaveLength(4);
    upStarts.forEach(startCue => {
      const run = [];
      for (let n = 1; ; n++) {
        const cue = intro.cues.find(c => c.at === startCue.at + n - 1);
        if (!cue || cue.text !== String(n)) break;
        run.push(cue.text);
      }
      expect([4, 6]).toContain(run.length);
    });
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
