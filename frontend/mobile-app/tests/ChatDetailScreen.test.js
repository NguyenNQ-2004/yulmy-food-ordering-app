import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';

import { AuthContext } from '../src/context/AuthContext';
import api from '../src/services/api';
import ChatDetailScreen from '../src/screens/Chat/ChatDetailScreen';

jest.mock('../src/services/api', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn(), put: jest.fn() },
}));

const renderScreen = () =>
  render(
    <AuthContext.Provider value={{ currentUser: { id: 'me' } }}>
      <ChatDetailScreen
        route={{ params: { chatId: 'c1', name: 'Support' } }}
        navigation={{ goBack: jest.fn() }}
      />
    </AuthContext.Provider>
  );

describe('ChatDetailScreen — optimistic send', () => {
  beforeEach(() => jest.clearAllMocks());

  it('shows the typed message immediately, before the POST resolves', async () => {
    api.get.mockResolvedValueOnce({ data: { data: [] } });
    // POST stays pending — proves the message renders optimistically.
    let resolvePost;
    api.post.mockReturnValueOnce(new Promise((r) => { resolvePost = r; }));

    renderScreen();

    // Initial fetch finished (loader gone, chat body shown).
    await waitFor(() => expect(screen.getByText('TODAY')).toBeTruthy());

    fireEvent.changeText(
      screen.getByPlaceholderText('Type your message...'),
      'Hello there'
    );
    fireEvent.press(screen.getByText('➔'));

    // Message is on screen even though the POST promise has not resolved.
    expect(screen.getByText('Hello there')).toBeTruthy();
    expect(api.post).toHaveBeenCalledWith('/chats/c1/messages', {
      content: 'Hello there',
    });

    // Clean up the pending promise.
    resolvePost({ data: { success: true } });
  });

  it('ignores an empty/whitespace message', async () => {
    api.get.mockResolvedValueOnce({ data: { data: [] } });
    renderScreen();
    await waitFor(() => expect(screen.getByText('TODAY')).toBeTruthy());

    fireEvent.changeText(screen.getByPlaceholderText('Type your message...'), '   ');
    fireEvent.press(screen.getByText('➔'));

    expect(api.post).not.toHaveBeenCalled();
  });
});
