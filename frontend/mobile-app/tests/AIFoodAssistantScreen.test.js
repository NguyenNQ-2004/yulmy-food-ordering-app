import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react-native';

import api from '../src/services/api';
import AIFoodAssistantScreen from '../src/screens/AI/AIFoodAssistantScreen';

jest.mock('../src/services/api', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn(), put: jest.fn() },
}));

const renderScreen = () =>
  render(<AIFoodAssistantScreen navigation={{ goBack: jest.fn() }} />);

describe('AIFoodAssistantScreen', () => {
  beforeEach(() => jest.clearAllMocks());

  it('shows a typing indicator while waiting, then renders the AI response', async () => {
    let resolvePost;
    api.post.mockReturnValueOnce(new Promise((r) => { resolvePost = r; }));

    renderScreen();

    fireEvent.changeText(
      screen.getByPlaceholderText('Ask Epicurean for culinary guidance...'),
      'spicy noodles'
    );
    fireEvent.press(screen.getByText('➔'));

    // Loading: typing indicator visible, request sent, response not yet shown.
    expect(screen.getByTestId('ai-typing-indicator')).toBeTruthy();
    expect(api.post).toHaveBeenCalledWith('/ai/recommend', { prompt: 'spicy noodles' });

    await act(async () => {
      resolvePost({ data: { data: { response: 'Try the Sichuan Dan Dan noodles.' } } });
    });

    // Response rendered, typing indicator gone.
    await waitFor(() =>
      expect(screen.getByText('Try the Sichuan Dan Dan noodles.')).toBeTruthy()
    );
    expect(screen.queryByTestId('ai-typing-indicator')).toBeNull();
  });

  it('shows a fallback message when the AI request fails', async () => {
    api.post.mockRejectedValueOnce(new Error('network down'));

    renderScreen();

    fireEvent.changeText(
      screen.getByPlaceholderText('Ask Epicurean for culinary guidance...'),
      'anything'
    );
    await act(async () => {
      fireEvent.press(screen.getByText('➔'));
    });

    await waitFor(() =>
      expect(screen.getByText(/having trouble connecting/i)).toBeTruthy()
    );
    expect(screen.queryByTestId('ai-typing-indicator')).toBeNull();
  });
});
