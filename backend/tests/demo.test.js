const { createAgent, loggedInAgent, daysFromToday } = require('./helpers');

describe('sample data API', () => {
  it('requires a logged-in user', async () => {
    expect((await createAgent().post('/api/demo/sample-data')).status).toBe(401);
  });

  it('fills an empty account with readings and two appointments', async () => {
    const { agent } = await loggedInAgent();
    const res = await agent.post('/api/demo/sample-data');
    expect(res.status).toBe(201);
    expect(res.body.data.readings).toBeGreaterThan(50);
    expect(res.body.data.appointments).toBe(2);

    const readings = await agent.get('/api/readings').query({ limit: 100 });
    const dates = readings.body.data.readings.map((r) => r.readingDate);
    expect(dates.every((d) => d <= daysFromToday(0))).toBe(true); // never in the future
    expect((await agent.get('/api/appointments')).body.data.appointments).toHaveLength(2);
  });

  it('refuses when the account already has readings', async () => {
    const { agent } = await loggedInAgent();
    await agent.post('/api/readings').send({ readingDate: daysFromToday(0), timeSlot: 'MORNING', glucoseValue: 110 });
    const res = await agent.post('/api/demo/sample-data');
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('SAMPLE_DATA_EXISTS');
  });

  it('cannot be run twice', async () => {
    const { agent } = await loggedInAgent();
    expect((await agent.post('/api/demo/sample-data')).status).toBe(201);
    expect((await agent.post('/api/demo/sample-data')).status).toBe(409);
  });
});
