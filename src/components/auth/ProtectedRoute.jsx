import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { currentUser } = useAuth();

  // If there's no user, redirect to login page but remember where they were trying to go
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
