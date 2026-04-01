import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminRoute from './components/auth/AdminRoute';
import Login from './pages/Login';

import PublicLayout from './layouts/PublicLayout';
import AdminLayout from './layouts/AdminLayout';

import PublicDashboard from './pages/PublicDashboard';
import TeamRegistration from './pages/TeamRegistration';
import MyTeam from './pages/MyTeam';

import AdminDashboard from './pages/AdminDashboard';
import AdminMatches from './pages/AdminMatches';
import AdminTeams from './pages/AdminTeams';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          {/* Public Routes Wrapped in PublicLayout */}
          <Route element={<PublicLayout><Outlet /></PublicLayout>}>
            <Route path="/" element={<PublicDashboard />} />
            <Route path="/posiciones" element={<PublicDashboard />} />
            
            {/* Protected Public Routes */}
            <Route path="/registro" element={
              <ProtectedRoute>
                <TeamRegistration />
              </ProtectedRoute>
            } />
            <Route path="/mi-equipo" element={
              <ProtectedRoute>
                <MyTeam />
              </ProtectedRoute>
            } />
          </Route>

          {/* Admin Routes Wrapped in AdminLayout Protected by AdminRoute */}
          <Route element={
            <AdminRoute>
              <AdminLayout><Outlet /></AdminLayout>
            </AdminRoute>
          }>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/fixture" element={<AdminMatches />} />
            <Route path="/admin/equipos" element={<AdminTeams />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
