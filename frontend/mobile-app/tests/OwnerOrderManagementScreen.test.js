import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';

import api from '../src/services/api';
// The list screen only navigates; the Action Sheet + status PUT live on the
// detail screen, so that is where this interaction is actually tested.
import OwnerOrderDetailScreen from '../src/screens/Owner/OwnerOrderDetailScreen';

jest.mock('../src/services/api', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn(), put: jest.fn() },
}));

const ORDER = {
  _id: 'order123456',
  orderStatus: 'Pending',
  createdAt: '2026-07-10T10:00:00.000Z',
  totalAmount: 100000,
  phone: '0900000000',
  deliveryAddress: '123 Test St',
  paymentMethod: 'COD',
  paymentStatus: 'unpaid',
  note: '',
  user: { fullName: 'Jane Customer' },
  items: [{ quantity: 2, price: 50000, food: { name: 'Pho' } }],
};

const renderScreen = () =>
  render(
    <OwnerOrderDetailScreen
      route={{ params: { orderId: 'order123456' } }}
      navigation={{ goBack: jest.fn(), navigate: jest.fn() }}
    />
  );

describe('Owner order status update (Action Sheet)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  });

  it('opens the sheet and PUTs the new status with the correct params', async () => {
    api.get.mockResolvedValueOnce({ data: { data: [ORDER] } });
    api.put.mockResolvedValueOnce({ data: { success: true } });

    renderScreen();

    // Wait for the order to load — the update trigger reflects current status.
    await waitFor(() => expect(screen.getByText('Update Status (Pending)')).toBeTruthy());

    // Open the Action Sheet.
    fireEvent.press(screen.getByText('Update Status (Pending)'));

    // 'Confirmed' also appears in the timeline; the sheet item is the last one.
    const confirmOptions = screen.getAllByText('Confirmed');
    fireEvent.press(confirmOptions[confirmOptions.length - 1]);

    await waitFor(() =>
      expect(api.put).toHaveBeenCalledWith('/owner/orders/order123456/status', {
        status: 'Confirmed',
      })
    );
    expect(Alert.alert).toHaveBeenCalled();
  });

  it('does not offer forward transitions for a terminal (Completed) order', async () => {
    api.get.mockResolvedValueOnce({
      data: { data: [{ ...ORDER, orderStatus: 'Completed' }] },
    });

    renderScreen();

    await waitFor(() => expect(screen.getByText('Ordered Items')).toBeTruthy());
    // No update button rendered when there are no allowed transitions.
    expect(screen.queryByText(/Update Status/)).toBeNull();
  });
});
