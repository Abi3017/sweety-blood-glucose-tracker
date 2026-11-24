const { createAgent, loggedInAgent, insertReadings, daysFromToday } = require('./helpers');

/**
 * Fixture around the assessment example (selected date 15 Oct 2026):
 *  - September 2026 (previous month): 4 readings
 *  - 1–15 Oct 2026 (month-to-date):   6 readings
 *  - 15 Oct 2026 (daily):             3 readings
 *  - Later in October and in November (must be excluded from the reports above)
 */
async function seedFixture(userId) {
  await insertReadings(userId, [
    ['2026-08-31', 'MORNING', 300], // before September – excluded
    ['2026-09-01', 'MORNING', 90],
    ['2026-09-15', 'AFTER_LUNCH', 180],
    ['2026-09-30', 'AFTER_DINNER', 150],
    ['2026-09-30', 'MORNING', 101],
    ['2026-10-01', 'MORNING', 100],
    ['2026-10-07', 'AFTER_BREAKFAST', 200],
    ['2026-10-14', 'AFTER_DINNER', 85],
    ['2026-10-15', 'MORNING', 95],
    ['2026-10-15', 'AFTER_BREAKFAST', 150],
    ['2026-10-15', 'AFTER_LUNCH', 140],
    ['2026-10-16', 'MORNING', 400], // after the selected date – excluded
    ['2026-11-01', 'MORNING', 50], // next month – excluded
  ]);
}

describe('GET /api/reports/daily', () => {
  it('returns stats and each reading with its slot for the selected date only', async () => {
    const { agent, user } = await loggedInAgent();
    await seedFixture(user.id);

    const res = await agent.get('/api/reports/daily?date=2026-10-15');
    expect(res.status).toBe(200);
    const { report } = res.body.data;
    expect(report.range).toEqual({ startDate: '2026-10-15', endDate: '2026-10-15' });
    expect(report.isEmpty).toBe(false);
    // (95 + 150 + 140) / 3 = 128.333… -> 128.3
    expect(report.stats).toEqual({ highest: 150, lowest: 95, average: 128.3, count: 3 });
    expect(report.readings.map((r) => [r.timeSlot, r.glucoseValue])).toEqual([
      ['MORNING', 95],
      ['AFTER_BREAKFAST', 150],
      ['AFTER_LUNCH', 140],
    ]);
  });

  it('rounds the average to one decimal place', async () => {
    const { agent, user } = await loggedInAgent();
    await insertReadings(user.id, [
      ['2026-10-20', 'MORNING', 100],
      ['2026-10-20', 'AFTER_LUNCH', 145],
    ]);
    const res = await agent.get('/api/reports/daily?date=2026-10-20');
    expect(res.body.data.report.stats.average).toBe(122.5);
  });

  it('rejects a future date and an invalid date', async () => {
    const { agent } = await loggedInAgent();
    let res = await agent.get(`/api/reports/daily?date=${daysFromToday(1)}`);
    expect(res.status).toBe(400);
    expect(res.body.error.message).toBe('Date cannot be in the future.');
    res = await agent.get('/api/reports/daily?date=15-10-2026');
    expect(res.status).toBe(400);
  });
});

describe('GET /api/reports/month-to-date', () => {
  it('covers the 1st of the month through the selected date, inclusive', async () => {
    const { agent, user } = await loggedInAgent();
    await seedFixture(user.id);

    const { report } = (await agent.get('/api/reports/month-to-date?date=2026-10-15')).body.data;
    expect(report.range).toEqual({ startDate: '2026-10-01', endDate: '2026-10-15' });
    // 100 + 200 + 85 + 95 + 150 + 140 = 770 / 6 = 128.333… -> 128.3
    expect(report.stats).toEqual({ highest: 200, lowest: 85, average: 128.3, count: 6 });
    expect(report.readings).toHaveLength(6);
  });
});

describe('GET /api/reports/monthly (previous month)', () => {
  it('covers the whole previous calendar month and nothing from the current month', async () => {
    const { agent, user } = await loggedInAgent();
    await seedFixture(user.id);

    const { report } = (await agent.get('/api/reports/monthly?date=2026-10-15')).body.data;
    expect(report.range).toEqual({ startDate: '2026-09-01', endDate: '2026-09-30' });
    // 90 + 180 + 150 + 101 = 521 / 4 = 130.25 -> 130.3
    expect(report.stats).toEqual({ highest: 180, lowest: 90, average: 130.3, count: 4 });
  });

  it('handles the year boundary (January -> previous December)', async () => {
    const { agent } = await loggedInAgent();
    // The reference date itself must not be in the future, so use a past January.
    const { report } = (await agent.get('/api/reports/monthly?date=2026-01-10')).body.data;
    expect(report.range).toEqual({ startDate: '2025-12-01', endDate: '2025-12-31' });
  });

  it('handles February in a leap year', async () => {
    const { agent } = await loggedInAgent();
    const { report } = (await agent.get('/api/reports/monthly?date=2024-03-31')).body.data;
    expect(report.range).toEqual({ startDate: '2024-02-01', endDate: '2024-02-29' });
  });

  it('defaults to the month before the current month', async () => {
    const { agent } = await loggedInAgent();
    const res = await agent.get('/api/reports/monthly');
    expect(res.status).toBe(200);
    const today = daysFromToday(0);
    expect(res.body.data.report.range.endDate < today.slice(0, 7)).toBe(true);
  });
});

describe('empty state and isolation', () => {
  it('returns isEmpty with null stats instead of zeros when there are no readings', async () => {
    const { agent } = await loggedInAgent();
    for (const path of ['daily', 'month-to-date', 'monthly']) {
      // eslint-disable-next-line no-await-in-loop
      const { report } = (await agent.get(`/api/reports/${path}?date=2026-10-15`)).body.data;
      expect(report.isEmpty).toBe(true);
      expect(report.stats).toBeNull();
      expect(report.readings).toEqual([]);
    }
  });

  it("only includes the authenticated user's readings", async () => {
    const { user: other } = await loggedInAgent({ email: 'other@example.com' });
    await seedFixture(other.id);
    const { agent } = await loggedInAgent({ email: 'me@example.com' });

    const { report } = (await agent.get('/api/reports/month-to-date?date=2026-10-15')).body.data;
    expect(report.isEmpty).toBe(true);
  });

  it('requires authentication', async () => {
    expect((await createAgent().get('/api/reports/daily')).status).toBe(401);
  });
});
