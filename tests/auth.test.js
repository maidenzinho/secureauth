const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');

describe('Authentication', () => {
  beforeAll(async () => {
    await User.deleteMany({});
  });

  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });
    
    expect(res.statusCode).toEqual(201);
    expect(res.body.message).toBeDefined();
  });

  it('should not register with duplicate email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });
    
    expect(res.statusCode).toEqual(400);
  });

  it('should login with valid credentials', async () => {
    // Primeiro precisamos verificar o email (simulado)
    const user = await User.findOne({ email: 'test@example.com' });
    user.isVerified = true;
    await user.save();
    
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123',
        location: {
          latitude: -23.5505,
          longitude: -46.6333
        }
      });
    
    expect(res.statusCode).toEqual(200);
    expect(res.body.token).toBeDefined();
  });
});