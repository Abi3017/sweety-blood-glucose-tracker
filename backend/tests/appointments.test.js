const { createAgent, loggedInAgent, prisma } = require('./helpers');

const valid = (overrides = {}) => ({
  doctor: 'Dr. Meera Rao',
  specialty: 'Endocrinologist',
  date: '2026-12-05',
  time: '16:30',
  location: 'City Care Hospital',
  notes: 'Bring readings',
  ...overrides,
});

describe('appointments API', () => {
  it('requires a logged-in user', async () => {
    const res = await createAgent().get('/api/appointments');
    expect(res.status).toBe(401);
  });

  it('creates, lists, updates and deletes an appointment', async () => {
    const { agent } = await loggedInAgent();

    const created = await agent.post('/api/appointments').send(valid());
    expect(created.status).toBe(201);
    const { id } = created.body.data.appointment;
    expect(created.body.data.appointment).toMatchObject({ doctor: 'Dr. Meera Rao', date: '2026-12-05', time: '16:30' });
    expect(created.body.data.appointment.userId).toBeUndefined();

    const list = await agent.get('/api/appointments');
    expect(list.body.data.appointments).toHaveLength(1);

    const updated = await agent.put(`/api/appointments/${id}`).send(valid({ time: '09:00', notes: '' }));
    expect(updated.status).toBe(200);
    expect(updated.body.data.appointment).toMatchObject({ time: '09:00', notes: '' });

    const removed = await agent.delete(`/api/appointments/${id}`);
    expect(removed.status).toBe(200);
    expect((await agent.get('/api/appointments')).body.data.appointments).toHaveLength(0);
  });

  it('lists appointments soonest first', async () => {
    const { agent } = await loggedInAgent();
    await agent.post('/api/appointments').send(valid({ doctor: 'B', date: '2026-12-20', time: '10:00' }));
    await agent.post('/api/appointments').send(valid({ doctor: 'A', date: '2026-12-05', time: '16:30' }));
    await agent.post('/api/appointments').send(valid({ doctor: 'C', date: '2026-12-05', time: '09:00' }));
    const names = (await agent.get('/api/appointments')).body.data.appointments.map((a) => a.doctor);
    expect(names).toEqual(['C', 'A', 'B']);
  });

  it('validates the fields', async () => {
    const { agent } = await loggedInAgent();
    expect((await agent.post('/api/appointments').send(valid({ doctor: '  ' }))).status).toBe(400);
    expect((await agent.post('/api/appointments').send(valid({ date: '2026-13-40' }))).status).toBe(400);
    expect((await agent.post('/api/appointments').send(valid({ time: '25:00' }))).status).toBe(400);
    expect((await agent.post('/api/appointments').send(valid({ notes: 'x'.repeat(501) }))).status).toBe(400);
  });

  it("never exposes or changes another user's appointment", async () => {
    const { agent: asha } = await loggedInAgent();
    const { agent: ravi } = await loggedInAgent({ email: 'ravi@example.com', name: 'Ravi' });
    const { body } = await asha.post('/api/appointments').send(valid());
    const { id } = body.data.appointment;

    expect((await ravi.get('/api/appointments')).body.data.appointments).toHaveLength(0);
    expect((await ravi.put(`/api/appointments/${id}`).send(valid({ doctor: 'Hacker' }))).status).toBe(404);
    expect((await ravi.delete(`/api/appointments/${id}`)).status).toBe(404);
    expect((await asha.get('/api/appointments')).body.data.appointments[0].doctor).toBe('Dr. Meera Rao');
  });

  it('treats a malformed id as not found', async () => {
    const { agent } = await loggedInAgent();
    expect((await agent.delete('/api/appointments/not-a-uuid')).status).toBe(404);
  });

  it('deletes appointments with their user', async () => {
    const { agent, user } = await loggedInAgent();
    await agent.post('/api/appointments').send(valid());
    await prisma.user.delete({ where: { id: user.id } });
    expect(await prisma.appointment.count()).toBe(0);
  });
});
