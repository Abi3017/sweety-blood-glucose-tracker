import { describe, expect, it } from 'vitest';
import { mealForTime } from '../utils/foodPlan';

const at = (h, m = 0) => new Date(2026, 10, 26, h, m);

describe('mealForTime', () => {
  it('suggests dinner at 5:41 PM', () => {
    expect(mealForTime(at(17, 41)).key).toBe('dinner');
  });

  it('follows the day', () => {
    expect(mealForTime(at(7, 30)).key).toBe('breakfast');
    expect(mealForTime(at(11, 0)).key).toBe('snack');
    expect(mealForTime(at(13, 15)).key).toBe('lunch');
    expect(mealForTime(at(16, 30)).key).toBe('snack');
    expect(mealForTime(at(20, 0)).key).toBe('dinner');
  });

  it('keeps it light late at night and early in the morning', () => {
    expect(mealForTime(at(22, 30)).key).toBe('night');
    expect(mealForTime(at(1, 0)).key).toBe('night');
    expect(mealForTime(at(4, 59)).key).toBe('night');
  });

  it('switches exactly at the boundaries', () => {
    expect(mealForTime(at(16, 59)).key).toBe('snack');
    expect(mealForTime(at(17, 0)).key).toBe('dinner');
    expect(mealForTime(at(21, 29)).key).toBe('dinner');
    expect(mealForTime(at(21, 30)).key).toBe('night');
  });
});
