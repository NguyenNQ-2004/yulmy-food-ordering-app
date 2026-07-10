const request = require('supertest');
const app = require('../src/app');
const Chat = require('../src/models/Chat');
const Message = require('../src/models/Message');
const { createUser } = require('./helpers');

// Build a customer<->owner chat plus tokens for both, and an outsider.
const setupChat = async () => {
  const { user: customer, token: customerToken } = await createUser('customer');
  const { user: owner, token: ownerToken } = await createUser('restaurant_owner');
  const chat = await Chat.create({ customer: customer._id, owner: owner._id });
  return { customer, customerToken, owner, ownerToken, chat };
};

describe('GET /api/chats', () => {
  test('401 without a token', async () => {
    const res = await request(app).get('/api/chats');
    expect(res.status).toBe(401);
  });

  test('customer sees only their own chats', async () => {
    const { customerToken, chat } = await setupChat();
    // An unrelated chat that must not show up.
    const stranger = await setupChat();
    void stranger;

    const res = await request(app)
      .get('/api/chats')
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0]._id).toBe(chat._id.toString());
  });
});

describe('POST /api/chats/:chatId/messages', () => {
  test('participant can send a message (201) and lastMessage is updated', async () => {
    const { customerToken, chat } = await setupChat();

    const res = await request(app)
      .post(`/api/chats/${chat._id}/messages`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ content: 'Hello, is this open?' });

    expect(res.status).toBe(201);
    expect(res.body.data.content).toBe('Hello, is this open?');
    expect(res.body.data.messageType).toBe('text');

    const reloaded = await Chat.findById(chat._id);
    expect(reloaded.lastMessage).toBe('Hello, is this open?');
    expect(await Message.countDocuments({ chat: chat._id })).toBe(1);
  });

  test('400 when content is empty/whitespace', async () => {
    const { customerToken, chat } = await setupChat();
    const res = await request(app)
      .post(`/api/chats/${chat._id}/messages`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ content: '   ' });
    expect(res.status).toBe(400);
  });

  test('403 when a non-participant tries to post', async () => {
    const { chat } = await setupChat();
    const { token: outsiderToken } = await createUser('customer');

    const res = await request(app)
      .post(`/api/chats/${chat._id}/messages`)
      .set('Authorization', `Bearer ${outsiderToken}`)
      .send({ content: 'let me in' });

    expect(res.status).toBe(403);
  });

  test('404 when the chat does not exist', async () => {
    const { customerToken } = await setupChat();
    const res = await request(app)
      .post('/api/chats/5f9f1b9b9b9b9b9b9b9b9b9b/messages')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ content: 'hi' });
    expect(res.status).toBe(404);
  });
});

describe('GET /api/chats/:chatId/messages', () => {
  test('participant reads messages in order', async () => {
    const { customer, customerToken, chat } = await setupChat();
    await Message.create({ chat: chat._id, sender: customer._id, content: 'first' });
    await Message.create({ chat: chat._id, sender: customer._id, content: 'second' });

    const res = await request(app)
      .get(`/api/chats/${chat._id}/messages`)
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.map((m) => m.content)).toEqual(['first', 'second']);
  });

  test('403 for a non-participant reader', async () => {
    const { chat } = await setupChat();
    const { token: outsiderToken } = await createUser('customer');
    const res = await request(app)
      .get(`/api/chats/${chat._id}/messages`)
      .set('Authorization', `Bearer ${outsiderToken}`);
    expect(res.status).toBe(403);
  });
});
