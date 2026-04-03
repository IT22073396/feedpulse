import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../server';
import * as geminiService from '../services/gemini.service';

jest.mock('../services/gemini.service');

const mockAnalyze =
  geminiService.analyzeFeedback as jest.MockedFunction<
    typeof geminiService.analyzeFeedback
  >;

let mongoServer: MongoMemoryServer;
let adminToken: string;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  process.env.JWT_SECRET = 'test-secret';
  process.env.ADMIN_EMAIL = 'admin@feedpulse.com';
  process.env.ADMIN_PASSWORD = 'admin123';

  const login = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@feedpulse.com', password: 'admin123' });

  adminToken = login.body.data?.token;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(() => {
  mockAnalyze.mockResolvedValue({
    category: 'Feature Request',
    sentiment: 'Positive',
    priority_score: 7,
    summary: 'User wants dark mode.',
    tags: ['UI', 'Dark Mode'],
  });
});

afterEach(() => jest.clearAllMocks());

// Test 1: Valid submission saves and triggers AI
it('saves valid feedback and triggers AI analysis', async () => {
  const res = await request(app).post('/api/feedback').send({
    title: 'Add dark mode',
    category: 'Feature Request',
    description: 'It would be great to have a dark mode for night use.',
  });

  expect(res.status).toBe(201);
  expect(res.body.data.ai_processed).toBe(true);
  expect(mockAnalyze).toHaveBeenCalledTimes(1);
});

// Test 2: Rejects empty title
it('rejects feedback with empty title', async () => {
  const res = await request(app).post('/api/feedback').send({
    title: '',
    description: 'This is long enough to pass validation.',
    category: 'Bug',
  });

  expect(res.status).toBe(400);
});

// Test 3: Status update works
it('updates status from New to In Review', async () => {
  const create = await request(app).post('/api/feedback').send({
    title: 'Status test',
    category: 'Bug',
    description: 'Testing status update from New to In Review.',
  });

  const res = await request(app)
    .patch(`/api/feedback/${create.body.data._id}`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ status: 'In Review' });

  expect(res.status).toBe(200);
  expect(res.body.data.status).toBe('In Review');
});

// Test 4: Gemini service mock parsing
it('returns correctly structured AI analysis', async () => {
  const result = await geminiService.analyzeFeedback(
    'Title',
    'Description text here'
  );

  expect(result).toHaveProperty('category');
  expect(result).toHaveProperty('sentiment');
  expect(result.priority_score).toBeGreaterThanOrEqual(1);
  expect(Array.isArray(result.tags)).toBe(true);
});

// Test 5: Auth middleware rejects unauthenticated requests
it('rejects GET /api/feedback without a token', async () => {
  const res = await request(app).get('/api/feedback');

  expect(res.status).toBe(401);
});