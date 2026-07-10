import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react-native';

import { AuthContext } from '../src/context/AuthContext';
import api from '../src/services/api';
import OwnerDashboardScreen from '../src/screens/Owner/OwnerDashboardScreen';

jest.mock('../src/services/api', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn(), put: jest.fn() },
}));

const renderScreen = () =>
  render(
    <AuthContext.Provider value={{ currentUser: { id: 'u1', fullName: 'Owner Sam' } }}>
      <OwnerDashboardScreen navigation={{ navigate: jest.fn() }} />
    </AuthContext.Provider>
  );

const dashboardPayload = {
  data: {
    data: {
      totalOrders: 42,
      totalRevenue: 1500000,
      activeDishes: 8,
      rating: 4.5,
      recentOrders: [],
      chartData: [0, 0, 0, 0, 0, 0, 0],
    },
  },
};

describe('OwnerDashboardScreen', () => {
  beforeEach(() => jest.clearAllMocks());

  it('shows a loading indicator first, then renders the aggregated stats', async () => {
    let resolveGet;
    api.get.mockReturnValueOnce(new Promise((r) => { resolveGet = r; }));

    renderScreen();

    // Loading state while the request is in flight.
    expect(screen.getByText('Loading dashboard...')).toBeTruthy();

    await act(async () => {
      resolveGet(dashboardPayload);
    });

    // Stats rendered from the resolved payload.
    await waitFor(() => expect(screen.getByText('42')).toBeTruthy());
    expect(screen.getByText('1,500,000 VND')).toBeTruthy();
    expect(screen.getByText('8')).toBeTruthy();
    expect(screen.getByText('4.5 ★')).toBeTruthy();
    expect(screen.queryByText('Loading dashboard...')).toBeNull();
  });
});
