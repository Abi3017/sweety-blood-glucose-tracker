import { describe, expect, it } from 'vitest';
import { daysUntil, describeWhen, formatTime, splitAppointments, validateAppointment } from '../utils/appointments';

const now = new Date(2026, 10, 24, 10, 0); // 24 Nov 2026, 10:00 local
const appt = (date, time = '16:30') => ({ id: date + time, doctor: 'Dr. A', date, time });

describe('appointment helpers', () => {
  it('formats 24-hour times', () => {
    expect(formatTime('16:30')).toBe('4:30 PM');
    expect(formatTime('00:05')).toBe('12:05 AM');
    expect(formatTime('12:00')).toBe('12:00 PM');
  });

  it('describes when an appointment is', () => {
    expect(describeWhen(appt('2026-11-24'), now)).toBe('Today at 4:30 PM');
    expect(describeWhen(appt('2026-11-25', '09:00'), now)).toBe('Tomorrow at 9:00 AM');
    expect(describeWhen(appt('2026-11-29'), now)).toBe('In 5 days · 4:30 PM');
    expect(describeWhen(appt('2026-11-23'), now)).toBe('Yesterday at 4:30 PM');
    expect(daysUntil(appt('2026-12-01'), now)).toBe(7);
  });

  it('splits into upcoming (soonest first) and past (latest first)', () => {
    const { upcoming, past } = splitAppointments([appt('2026-12-05'), appt('2026-11-20'), appt('2026-11-26'), appt('2026-11-10')], now);
    expect(upcoming.map((a) => a.date)).toEqual(['2026-11-26', '2026-12-05']);
    expect(past.map((a) => a.date)).toEqual(['2026-11-20', '2026-11-10']);
  });

  it('treats an earlier time today as past', () => {
    const { upcoming, past } = splitAppointments([appt('2026-11-24', '09:00'), appt('2026-11-24', '15:00')], now);
    expect(upcoming).toHaveLength(1);
    expect(past).toHaveLength(1);
  });

  it('validates required fields', () => {
    const empty = { doctor: ' ', specialty: '', date: '', time: '', location: '', notes: '' };
    expect(Object.keys(validateAppointment(empty)).sort()).toEqual(['date', 'doctor', 'time']);
    expect(validateAppointment({ ...empty, doctor: 'Dr. Rao', date: '2026-12-01', time: '10:15' })).toEqual({});
  });
});
