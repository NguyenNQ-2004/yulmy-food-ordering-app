import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

import AuthNavigator from './AuthNavigator';
import CustomerNavigator from './CustomerNavigator';
import AdminNavigator from './AdminNavigator';
import OwnerNavigator from './OwnerNavigator';

export default function AppNavigator() {
  const { currentUser } = useContext(AuthContext);

  if (!currentUser) {
    return <AuthNavigator />;
  }

  if (currentUser.role === 'admin') {
    return <AdminNavigator />;
  }

  if (currentUser.role === 'restaurant_owner' || currentUser.role === 'owner') {
    return <OwnerNavigator />;
  }

  return <CustomerNavigator />;
}