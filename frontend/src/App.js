import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CssBaseline, Box } from '@mui/material';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Stocks from './pages/Stocks';
import Portfolio from './pages/Portfolio';
import Admin from './pages/Admin';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
  const { user, loading, isAdmin } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" />;
  if (!isAdmin) return <Navigate to="/dashboard" />;
  return children;
};

const AppRoutes = () => {
  const { user } = useAuth();
  return (
    <BrowserRouter>
      {user && <Navbar />}
      <Box sx={{ bgcolor: '#f5f7fa', minHeight: '100vh' }}>
        <Routes>
          <Route path="/login" element={
            user ? <Navigate to="/dashboard" /> : <Login />
          } />
          <Route path="/register" element={
            user ? <Navigate to="/dashboard" /> : <Register />
          } />
          <Route path="/dashboard" element={
            <PrivateRoute><Dashboard /></PrivateRoute>
          } />
          <Route path="/stocks" element={
            <PrivateRoute><Stocks /></PrivateRoute>
          } />
          <Route path="/portfolio" element={
            <PrivateRoute><Portfolio /></PrivateRoute>
          } />
          <Route path="/admin" element={
            <AdminRoute><Admin /></AdminRoute>
          } />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Box>
    </BrowserRouter>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <CssBaseline />
      <AppRoutes />
    </AuthProvider>
  );
};

export default App;