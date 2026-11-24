const { createAgent, loggedInAgent, daysFromToday, prisma } = require('./helpers');

const DATE = '2026-10-15';
const reading = (overrides = {}) => ({ readingDate: DATE, timeSlot: 'MORNING', glucoseValue: 110, ...overrides });

describe('authorization', () => {
  it('requires authentication for every reading endpoint', async () => {
    const agent = createAgent();
    const id = '00000000-0000-4000-8000-000000000000';
    const responses = await Promise.all([
      agent.get('/api/readings'),
      agent.post('/api/readings').send(reading()),
      agent.get(`/api/readings/${id}`),
      agent.put(`/api/readings/${id}`).send(reading()),
      agent.delete(`/api/readings/${id}`),
    ]);
    responses.forEach((res) => expect(res.status).toBe(401));
  });

  it("does not let a user view, edit or delete another user's reading", async () => {
    const { agent: owner } = await loggedInAgent({ email: 'owner@example.com' });
    const { agent: intruder } = await loggedInAgent({ email: 'intruder@example.com' });
    const created = await owner.post('/api/readings').send(reading());
    const { id } = created.body.data.reading;

    expect((await intruder.get(`/api/readings/${id}`)).status).toBe(404);
    expect((await intruder.put(`/api/readings/${id}`).send(reading({ glucoseValue: 300 }))).status).toBe(404);
    expect((await intruder.delete(`/api/readings/${id}`)).status).toBe(404);
    expect((await intruder.get('/api/readings')).body.data.readings).toHaveLength(0);

    const stillThere = await prisma.reading.findUnique({ where: { id } });
    expect(stillThere.glucoseValue).toBe(110);
  });

  it('ignores a userId supplied in the request body', async () => {
    const { user: victim } = await loggedInAgent({ email: 'victim@example.com' });
    const { agent, user } = await loggedInAgent({ email: 'me@example.com' });
    const res = await agent.post('/api/readings').send({ ...reading(), userId: victim.id });

    expect(res.status).toBe(201);
    const stored = await prisma.reading.findUnique({ where: { id: res.body.data.reading.id } });
    expect(stored.userId).toBe(user.id);
  });
});

describe('POST /api/readings', () => {
  let agent;
  beforeEach(async () => {
    ({ agent } = await loggedInAgent());
  });

  it('creates a reading', async () => {
    const res = await agent.post('/api/readings').send(reading({ timeSlot: 'AFTER_LUNCH', glucoseValue: 145 }));
    expect(res.status).toBe(201);
    expect(res.body.data.reading).toMatchObject({ readingDate: DATE, timeSlot: 'AFTER_LUNCH', glucoseValue: 145 });
    expect(res.body.data.reading.userId).toBeUndefined();
  });

  it('accepts the boundary values 40 and 600', async () => {
    expect((await agent.post('/api/readings').send(reading({ glucoseValue: 40 }))).status).toBe(201);
    expect((await agent.post('/api/readings').send(reading({ timeSlot: 'AFTER_LUNCH', glucoseValue: 600 }))).status).toBe(201);
  });

  it.each([[undefined], [null], ['']])('rejects a missing glucose value (%p)', async (value) => {
    const res = await agent.post('/api/readings').send(reading({ glucoseValue: value }));
    expect(res.status).toBe(400);
    expect(res.body.error.message).toBe('Please enter a glucose value.');
  });

  it.each([
    ['below 40', 39],
    ['above 600', 601],
    ['a decimal', 120.5],
    ['a decimal string', '120.5'],
    ['non-numeric', 'abc'],
    ['negative', -100],
  ])('rejects a glucose value that is %s', async (_label, value) => {
    const res = await agent.post('/api/readings').send(reading({ glucoseValue: value }));
    expect(res.status).toBe(400);
    expect(res.body.error.message).toBe('Value must be between 40 and 600 mg/dl.');
  });

  it('rejects a duplicate time slot on the same date', async () => {
    await agent.post('/api/readings').send(reading({ timeSlot: 'AFTER_LUNCH' }));
    const res = await agent.post('/api/readings').send(reading({ timeSlot: 'AFTER_LUNCH', glucoseValue: 160 }));
    expect(res.status).toBe(409);
    expect(res.body.error.message).toBe('You already have an After lunch reading for this date.');
  });

  it('allows the same slot on a different date', async () => {
    await agent.post('/api/readings').send(reading());
    const res = await agent.post('/api/readings').send(reading({ readingDate: '2026-10-16' }));
    expect(res.status).toBe(201);
  });

  it('allows at most four readings per day', async () => {
    for (const timeSlot of ['MORNING', 'AFTER_BREAKFAST', 'AFTER_LUNCH', 'AFTER_DINNER']) {
      // eslint-disable-next-line no-await-in-loop
      expect((await agent.post('/api/readings').send(reading({ timeSlot }))).status).toBe(201);
    }
    const res = await agent.post('/api/readings').send(reading({ timeSlot: 'AFTER_DINNER', glucoseValue: 150 }));
    expect(res.status).toBe(409);
    expect(res.body.error.message).toBe('You can add only 4 readings per day.');
    expect(await prisma.reading.count()).toBe(4);
  });

  it('stays consistent under concurrent requests for the same slot', async () => {
    const results = await Promise.all(
      Array.from({ length: 5 }, () => agent.post('/api/readings').send(reading())),
    );
    expect(results.filter((r) => r.status === 201)).toHaveLength(1);
    expect(results.filter((r) => r.status === 409)).toHaveLength(4);
    expect(await prisma.reading.count()).toBe(1);
  });

  it('rejects a future date but accepts today', async () => {
    const future = await agent.post('/api/readings').send(reading({ readingDate: daysFromToday(1) }));
    expect(future.status).toBe(400);
    expect(future.body.error.message).toBe('Date cannot be in the future.');

    const today = await agent.post('/api/readings').send(reading({ readingDate: daysFromToday(0) }));
    expect(today.status).toBe(201);
  });

  it('rejects an impossible date and a missing slot', async () => {
    let res = await agent.post('/api/readings').send(reading({ readingDate: '2026-02-30' }));
    expect(res.body.error.message).toBe('Please enter a valid date (YYYY-MM-DD).');
    res = await agent.post('/api/readings').send(reading({ timeSlot: '' }));
    expect(res.body.error.message).toBe('Please select a time slot.');
  });
});

describe('GET /api/readings', () => {
  it('lists readings with date/slot filters and pagination', async () => {
    const { agent } = await loggedInAgent();
    await agent.post('/api/readings').send(reading({ readingDate: '2026-10-14' }));
    await agent.post('/api/readings').send(reading({ readingDate: '2026-10-15' }));
    await agent.post('/api/readings').send(reading({ readingDate: '2026-10-15', timeSlot: 'AFTER_DINNER' }));
    await agent.post('/api/readings').send(reading({ readingDate: '2026-10-16' }));

    let res = await agent.get('/api/readings');
    expect(res.body.data.readings.map((r) => r.readingDate)).toEqual([
      '2026-10-16',
      '2026-10-15',
      '2026-10-15',
      '2026-10-14',
    ]);

    res = await agent.get('/api/readings?startDate=2026-10-15&endDate=2026-10-15');
    expect(res.body.data.readings).toHaveLength(2);

    res = await agent.get('/api/readings?timeSlot=AFTER_DINNER');
    expect(res.body.data.readings).toHaveLength(1);

    res = await agent.get('/api/readings?page=2&limit=3');
    expect(res.body.data.readings).toHaveLength(1);
    expect(res.body.meta).toEqual({ page: 2, limit: 3, total: 4, totalPages: 2 });

    res = await agent.get('/api/readings?limit=1000');
    expect(res.status).toBe(400);
  });

  it('returns one reading by id', async () => {
    const { agent } = await loggedInAgent();
    const { id } = (await agent.post('/api/readings').send(reading())).body.data.reading;
    const res = await agent.get(`/api/readings/${id}`);
    expect(res.status).toBe(200);
    expect(res.body.data.reading.id).toBe(id);
    expect((await agent.get('/api/readings/not-a-uuid')).status).toBe(404);
  });
});

describe('PUT /api/readings/:id', () => {
  let agent;
  let ids;
  beforeEach(async () => {
    ({ agent } = await loggedInAgent());
    ids = {};
    for (const timeSlot of ['MORNING', 'AFTER_BREAKFAST', 'AFTER_LUNCH', 'AFTER_DINNER']) {
      // eslint-disable-next-line no-await-in-loop
      const res = await agent.post('/api/readings').send(reading({ timeSlot }));
      ids[timeSlot] = res.body.data.reading.id;
    }
  });

  it('updates a reading on a full day without counting itself twice', async () => {
    const res = await agent.put(`/api/readings/${ids.MORNING}`).send(reading({ glucoseValue: 132 }));
    expect(res.status).toBe(200);
    expect(res.body.data.reading.glucoseValue).toBe(132);
  });

  it('rejects moving a reading into a slot that is already used', async () => {
    const res = await agent.put(`/api/readings/${ids.MORNING}`).send(reading({ timeSlot: 'AFTER_LUNCH' }));
    expect(res.status).toBe(409);
    expect(res.body.error.message).toBe('You already have an After lunch reading for this date.');
  });

  it('allows moving a reading to another date, but not to a full date', async () => {
    const moved = await agent.put(`/api/readings/${ids.MORNING}`).send(reading({ readingDate: '2026-10-10' }));
    expect(moved.status).toBe(200);
    expect(moved.body.data.reading.readingDate).toBe('2026-10-10');

    // Fill 2026-10-10 back up to four readings, then try to move a fifth one onto it.
    for (const timeSlot of ['AFTER_BREAKFAST', 'AFTER_LUNCH', 'AFTER_DINNER']) {
      // eslint-disable-next-line no-await-in-loop
      await agent.post('/api/readings').send(reading({ readingDate: '2026-10-10', timeSlot }));
    }
    const res = await agent.put(`/api/readings/${ids.AFTER_LUNCH}`).send(reading({ readingDate: '2026-10-10' }));
    expect(res.status).toBe(409);
    expect(res.body.error.message).toBe('You can add only 4 readings per day.');
  });

  it('applies the value and date rules on update', async () => {
    let res = await agent.put(`/api/readings/${ids.MORNING}`).send(reading({ glucoseValue: 700 }));
    expect(res.body.error.message).toBe('Value must be between 40 and 600 mg/dl.');
    res = await agent.put(`/api/readings/${ids.MORNING}`).send(reading({ readingDate: daysFromToday(2) }));
    expect(res.body.error.message).toBe('Date cannot be in the future.');
  });
});

describe('DELETE /api/readings/:id', () => {
  it('deletes a reading and returns 404 afterwards', async () => {
    const { agent } = await loggedInAgent();
    const { id } = (await agent.post('/api/readings').send(reading())).body.data.reading;

    const res = await agent.delete(`/api/readings/${id}`);
    expect(res.status).toBe(200);
    expect(await prisma.reading.count()).toBe(0);
    expect((await agent.delete(`/api/readings/${id}`)).status).toBe(404);
  });

  it("deletes a user's readings when the user is deleted", async () => {
    const { agent, user } = await loggedInAgent();
    await agent.post('/api/readings').send(reading());
    await prisma.user.delete({ where: { id: user.id } });
    expect(await prisma.reading.count()).toBe(0);
  });
});
