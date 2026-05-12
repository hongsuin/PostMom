const request = require('supertest');
const { app } = require('../app');

describe('Server health and middleware', () => {
  it('returns ok on /health', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  it('returns docs UI on /api/docs', async () => {
    const res = await request(app).get('/api/docs');
    expect(res.status).toBe(301);
  });

  it('returns validation error on invalid uuid', async () => {
    const res = await request(app).get('/api/community/posts/not-a-uuid');
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns unauthorized without bearer token', async () => {
    const res = await request(app).post('/api/community/posts').send({
      region: '위례',
      title: 't',
      content: 'c',
    });
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });
});
