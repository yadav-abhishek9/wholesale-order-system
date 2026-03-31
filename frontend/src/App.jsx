import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { AlertContainer } from './components/Alert';

import Login from './pages/Login';

import AdminDashboard from './pages/admin/Dashboard';
import AdminProducts from './pages/admin/Products';
import AdminParties from './pages/admin/Parties';
import AdminPartyPricing from './pages/admin/PartyPricing';
import AdminOrders from './pages/admin/Orders';
import AdminUserManagement from './pages/admin/UserManagement';
import AdminPayments from './pages/admin/Payments';

import SalesmanParties from './pages/salesman/Parties';
import SalesmanTakeOrder from './pages/salesman/TakeOrder';
import SalesmanOrders from './pages/salesman/Orders';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
       <AlertContainer />
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/admin/dashboard" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/products" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminProducts />
            </ProtectedRoute>
          } />
          <Route path="/admin/parties" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminParties />
            </ProtectedRoute>
          } />
          <Route path="/admin/party-pricing" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminPartyPricing />
            </ProtectedRoute>
          } />
          <Route path="/admin/orders" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminOrders />
            </ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminUserManagement />
            </ProtectedRoute>
          } />
          <Route path="/admin/payments" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminPayments />
            </ProtectedRoute>
          } />

          <Route path="/salesman/parties" element={
            <ProtectedRoute allowedRoles={['salesman']}>
              <SalesmanParties />
            </ProtectedRoute>
          } />
          <Route path="/salesman/take-order" element={
            <ProtectedRoute allowedRoles={['salesman']}>
              <SalesmanTakeOrder />
            </ProtectedRoute>
          } />
          <Route path="/salesman/orders" element={
            <ProtectedRoute allowedRoles={['salesman']}>
              <SalesmanOrders />
            </ProtectedRoute>
          } />

          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;