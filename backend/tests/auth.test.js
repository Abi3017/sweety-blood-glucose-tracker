const jwt = require('jsonwebtoken');
const { createAgent, registerPayload, loggedInAgent, PASSWORD, prisma } = require('./helpers');

describe('POST /api/auth/register', () => {
  it('creates a user, hashes the password and never returns it', async () => {
    const res = await createAgent().post('/api/auth/register').send(registerPayload());

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user).toMatchObject({ name: 'Asha Patient', email: 'asha@example.com' });
    expect(res.body.data.user.password).toBeUndefined();
    expect(JSON.stringify(res.body)).not.toContain(PASSWORD);

    const stored = await prisma.user.findUnique({ where: { email: 'asha@example.com' } });
    expect(stored.password).not.toBe(PASSWORD);
    expect(stored.password).toMatch(/^\$2[aby]\$12\$/); // bcrypt, cost 12
  });

  it('sets an HttpOnly, SameSite=Strict auth cookie', async () => {
    const res = await createAgent().post('/api/auth/register').send(registerPayload());
    const cookie = res.headers['set-cookie'].join(';');
    expect(cookie).toMatch(/sweety_token=/);
    expect(cookie).toMatch(/HttpOnly/i);
    expect(cookie).toMatch(/SameSite=Strict/i);
  });

  it('rejects a duplicate email (case-insensitive) with 409', async () => {
    await createAgent().post('/api/auth/register').send(registerPayload());
    const res = await createAgent()
      .post('/api/auth/register')
      .send(registerPayload({ email: 'ASHA@example.com' }));

    expect(res.status).toBe(409);
    expect(res.body.error.message).toBe('An account with this email already exists.');
  });

  it('validates required fields, email format, password strength and confirmation', async () => {
    const agent = createAgent();

    let res = await agent.post('/api/auth/register').send({});
    expect(res.status).toBe(400);
    const fields = res.body.error.details.map((d) => d.field);
    expect(fields).toEqual(expect.arrayContaining(['name', 'email', 'password', 'confirmPassword']));

    res = await agent.post('/api/auth/register').send(registerPayload({ email: 'not-an-email' }));
    expect(res.body.error.message).toBe('Please enter a valid email address.');

    res = await agent
      .post('/api/auth/register')
      .send(registerPayload({ password: 'weakpass', confirmPassword: 'weakpass' }));
    expect(res.status).toBe(400);
    expect(res.body.error.message).toMatch(/uppercase/);

    res = await agent.post('/api/auth/register').send(registerPayload({ confirmPassword: 'Different1!' }));
    expect(res.body.error.message).toBe('Passwords do not match.');
  });
});

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await createAgent().post('/api/auth/register').send(registerPayload());
  });

  it('logs in with correct credentials and returns the user without a password', async () => {
    const agent = createAgent();
    const res = await agent.post('/api/auth/login').send({ email: 'asha@example.com', password: PASSWORD });

    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe('asha@example.com');
    expect(res.body.data.user.password).toBeUndefined();
    expect(res.headers['set-cookie'].join(';')).toMatch(/sweety_token=/);

    const me = await agent.get('/api/auth/me');
    expect(me.status).toBe(200);
    expect(me.body.data.user).toMatchObject({ email: 'asha@example.com', totalReadings: 0 });
  });

  it('rejects an incorrect password with 401 and a generic message', async () => {
    const res = await createAgent().post('/api/auth/login').send({ email: 'asha@example.com', password: 'Wrong123!' });
    expect(res.status).toBe(401);
    expect(res.body.error.message).toBe('Invalid email or password.');
    expect(res.headers['set-cookie']).toBeUndefined();
  });

  it('gives the same response for an unknown email', async () => {
    const res = await createAgent().post('/api/auth/login').send({ email: 'nobody@example.com', password: PASSWORD });
    expect(res.status).toBe(401);
    expect(res.body.error.message).toBe('Invalid email or password.');
  });

  it('persists the cookie only when "remember me" is checked', async () => {
    const session = await createAgent().post('/api/auth/login').send({ email: 'asha@example.com', password: PASSWORD });
    expect(session.headers['set-cookie'].join(';')).not.toMatch(/Expires=/i);

    const remembered = await createAgent()
      .post('/api/auth/login')
      .send({ email: 'asha@example.com', password: PASSWORD, rememberMe: true });
    expect(remembered.headers['set-cookie'].join(';')).toMatch(/Expires=/i);
  });
});

describe('session handling', () => {
  it('logout clears the cookie so private routes return 401', async () => {
    const { agent } = await loggedInAgent();
    const res = await agent.post('/api/auth/logout');
    expect(res.status).toBe(200);
    expect((await agent.get('/api/auth/me')).status).toBe(401);
  });

  it('rejects requests without a token', async () => {
    const res = await createAgent().get('/api/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('rejects an expired token with a clear message', async () => {
    const { user } = await loggedInAgent();
    const expired = jwt.sign({}, process.env.JWT_SECRET, { subject: user.id, expiresIn: -10 });
    const res = await createAgent().get('/api/auth/me').set('Authorization', `Bearer ${expired}`);
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('TOKEN_EXPIRED');
    expect(res.body.error.message).toBe('Your session has expired. Please log in again.');
  });

  it('rejects a token signed with a different secret', async () => {
    const { user } = await loggedInAgent();
    const forged = jwt.sign({}, 'some-other-secret', { subject: user.id });
    const res = await createAgent().get('/api/auth/me').set('Authorization', `Bearer ${forged}`);
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_TOKEN');
  });

  it('rejects state-changing requests without the CSRF header', async () => {
    const request = require('supertest');
    const app = require('../src/app');
    const res = await request(app).post('/api/auth/register').send(registerPayload());
    expect(res.status).toBe(403);
  });
});
