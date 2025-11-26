import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

import Login from './pages/Login';
import Layout from './components/Layout';

// Manager pages
import Dashboard from './pages/manager/Dashboard';
import Products from './pages/manager/Products';
import Sales from './pages/manager/Sales';
import Reports from './pages/manager/Reports';

// Cashier pages
import POS from './pages/cashier/POS';
import History from './pages/cashier/History';

function App() {
  const [auth, setAuth] = useState({
    token: localStorage.getItem('token'),
    user: JSON.parse(localStorage.getItem('user') || 'null')
  });

  const ProtectedRoute = ({ children, allowedRoles }) => {
    if (!auth.token || !auth.user) {
      return <Navigate to="/" />;
    }

    if (allowedRoles && !allowedRoles.includes(auth.user.role)) {
      return <Navigate to="/" />;
    }

    return <Layout user={auth.user}>{children}</Layout>;
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          auth.token ? (
            auth.user?.role === 'manager' ? (
              <Navigate to="/manager/dashboard" />
            ) : (
              <Navigate to="/cashier/pos" />
            )
          ) : (
            <Login setAuth={setAuth} />
          )
        } />

        {/* Manager Routes */}
        <Route path="/manager/dashboard" element={
          <ProtectedRoute allowedRoles={['manager']}>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/manager/products" element={
          <ProtectedRoute allowedRoles={['manager']}>
            <Products />
          </ProtectedRoute>
        } />
        <Route path="/manager/sales" element={
          <ProtectedRoute allowedRoles={['manager']}>
            <Sales />
          </ProtectedRoute>
        } />
        <Route path="/manager/reports" element={
          <ProtectedRoute allowedRoles={['manager']}>
            <Reports />
          </ProtectedRoute>
        } />

        {/* Cashier Routes */}
        <Route path="/cashier/pos" element={
          <ProtectedRoute allowedRoles={['cashier']}>
            <POS />
          </ProtectedRoute>
        } />
        <Route path="/cashier/history" element={
          <ProtectedRoute allowedRoles={['cashier']}>
            <History />
          </ProtectedRoute>
        } />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;