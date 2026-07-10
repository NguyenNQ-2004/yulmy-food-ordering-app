// Mock the Gemini SDK BEFORE requiring the app, so aiController picks up the mock.
const mockGenerateContent = jest.fn();
const mockGetGenerativeModel = jest.fn(() => ({ generateContent: mockGenerateContent }));

jest.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: mockGetGenerativeModel,
  })),
}));

const request = require('supertest');
const app = require('../src/app');
const AIPromptLog = require('../src/models/AIPromptLog');
const { createUser } = require('./helpers');

beforeEach(() => {
  mockGenerateContent.mockReset();
  mockGetGenerativeModel.mockClear();
  // Default happy response: result.response.text() === 'mocked recommendation'
  mockGenerateContent.mockResolvedValue({
    response: { text: () => 'mocked recommendation' },
  });
});

describe('POST /api/ai/recommend', () => {
  test('401 without a token', async () => {
    const res = await request(app).post('/api/ai/recommend').send({ prompt: 'spicy noodles' });
    expect(res.status).toBe(401);
  });

  test('400 when prompt is missing', async () => {
    const { token } = await createUser('customer');
    const res = await request(app)
      .post('/api/ai/recommend')
      .set('Authorization', `Bearer ${token}`)
      .send({});
    expect(res.status).toBe(400);
    expect(mockGenerateContent).not.toHaveBeenCalled();
  });

  test('200 returns the mocked AI text and logs the prompt (no real Google call)', async () => {
    const { user, token } = await createUser('customer');

    const res = await request(app)
      .post('/api/ai/recommend')
      .set('Authorization', `Bearer ${token}`)
      .send({ prompt: 'something spicy under 50k' });

    expect(res.status).toBe(200);
    expect(res.body.data.response).toBe('mocked recommendation');

    // The Gemini client was invoked exactly once, and the user prompt reached it.
    expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    const sentArg = JSON.stringify(mockGenerateContent.mock.calls[0][0]);
    expect(sentArg).toContain('something spicy under 50k');

    // Controller persists an AIPromptLog row.
    const log = await AIPromptLog.findOne({ user: user._id });
    expect(log).not.toBeNull();
    expect(log.response).toBe('mocked recommendation');
  });

  test('500 with a graceful message when the AI client throws', async () => {
    mockGenerateContent.mockRejectedValueOnce(new Error('API_KEY invalid'));
    const { token } = await createUser('customer');

    const res = await request(app)
      .post('/api/ai/recommend')
      .set('Authorization', `Bearer ${token}`)
      .send({ prompt: 'hello' });

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/authentication failed/i);
  });
});
