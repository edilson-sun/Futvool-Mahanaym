import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function AdminRoute({ children }) {
  const { currentUser } = useAuth();
  
  // Replace this email or use import.meta.env.VITE_ADMIN_EMAIL in production
  const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || 'admin@mahanaym.com';

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (currentUser.email !== adminEmail) {
    // Si esta logueado pero no es administrador, devolverlo al portal
    return <Navigate to="/" replace />;
  }

  return children;
}
