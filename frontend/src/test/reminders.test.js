import { describe, expect, it } from 'vitest';
import { appointmentReminders, readingReminder } from '../utils/reminders';

const at = (h, m = 0, day = 26) => new Date(2026, 10, day, h, m);
const reading = (timeSlot) => ({ timeSlot });
const appt = (date, time = '16:30', id = 'a1') => ({ id, doctor: 'Dr. Rao', date, time });

describe('readingReminder', () => {
  it('has nothing to say before the first reading is due', () => {
    expect(readingReminder([], at(6, 30))).toBeNull();
  });

  it('asks for the latest due slot that is still empty', () => {
    expect(readingReminder([], at(11, 0)).title).toContain('After Breakfast');
    expect(readingReminder([reading('MORNING')], at(11, 0)).title).toContain('After Breakfast');
    expect(readingReminder([reading('MORNING'), reading('AFTER_BREAKFAST')], at(15, 0)).title).toContain('After Lunch');
  });

  it('is quiet once every due slot has a reading', () => {
    expect(readingReminder([reading('MORNING'), reading('AFTER_BREAKFAST')], at(11, 0))).toBeNull();
  });

  it('links to the add form for that slot and expires with the day', () => {
    const r = readingReminder([], at(22, 0));
    expect(r.to).toBe('/readings/new?slot=AFTER_DINNER');
    expect(r.id).toContain('2026-11-26');
    expect(readingReminder([], at(22, 0, 27)).id).not.toBe(r.id);
  });
});

describe('appointmentReminders', () => {
  it('includes appointments today (still ahead) and tomorrow', () => {
    const list = [appt('2026-11-26', '16:30', 'a'), appt('2026-11-27', '09:00', 'b'), appt('2026-11-29', '09:00', 'c')];
    expect(appointmentReminders(list, at(10, 0)).map((r) => r.id.split('-')[1])).toEqual(['a', 'b']);
  });

  it('skips appointments that already started', () => {
    expect(appointmentReminders([appt('2026-11-26', '09:00')], at(10, 0))).toEqual([]);
  });

  it('describes when', () => {
    expect(appointmentReminders([appt('2026-11-27', '09:00')], at(10, 0))[0].detail).toBe('Tomorrow at 9:00 AM');
  });
});
