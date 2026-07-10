import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

import AuthNavigator from './AuthNavigator';
import CustomerNavigator from './CustomerNavigator';
import AdminNavigator from './AdminNavigator';

export default function AppNavigator() {
  const { currentUser } = useContext(AuthContext);

  if (!currentUser) {
    return <AuthNavigator />;
  }

  if (currentUser.role === 'admin') {
    return <AdminNavigator />;
  }

  return <CustomerNavigator />;
}