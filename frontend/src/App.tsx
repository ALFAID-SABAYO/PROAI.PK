import { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { GuestRoute } from './components/GuestRoute';
import { RouteGuard } from './components/RouteGuard';
import {
  AdminDashboard,
  AdminDatasetPage,
  AdminUsersPage,
} from './pages/AdminDashboard';
import { AgentDashboard } from './pages/AgentDashboard';
import { AgentListingFormPage } from './pages/AgentListingForm';
import { AuthPage } from './pages/AuthPage';
import { InvestorDashboard, InvestorFavoritesPage } from './pages/InvestorDashboard';
import { InvestorAnalyticsPage } from './pages/InvestorAnalyticsPage';
import { LandingPage } from './pages/LandingPage';
import { PropertyDetailPage } from './pages/PropertyDetailPage';
import { useAuthStore } from './store/authStore';

function App() {
  const { token, fetchUser } = useAuthStore();

  useEffect(() => {
    if (token) fetchUser();
  }, [token, fetchUser]);

  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ duration: 3500 }} />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<GuestRoute><AuthPage mode="login" /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><AuthPage mode="register" /></GuestRoute>} />

        <Route
          path="/investor"
          element={
            <RouteGuard allowedRoles={['investor']}>
              <InvestorDashboard />
            </RouteGuard>
          }
        />
        <Route
          path="/investor/analytics"
          element={
            <RouteGuard allowedRoles={['investor']}>
              <InvestorAnalyticsPage />
            </RouteGuard>
          }
        />
        <Route
          path="/investor/favorites"
          element={
            <RouteGuard allowedRoles={['investor']}>
              <InvestorFavoritesPage />
            </RouteGuard>
          }
        />
        <Route
          path="/properties/:id"
          element={
            <RouteGuard allowedRoles={['investor', 'agent', 'admin']}>
              <PropertyDetailPage />
            </RouteGuard>
          }
        />

        <Route
          path="/agent"
          element={
            <RouteGuard allowedRoles={['agent']}>
              <AgentDashboard />
            </RouteGuard>
          }
        />
        <Route
          path="/agent/new"
          element={
            <RouteGuard allowedRoles={['agent']}>
              <AgentListingFormPage />
            </RouteGuard>
          }
        />
        <Route
          path="/agent/edit/:id"
          element={
            <RouteGuard allowedRoles={['agent']}>
              <AgentListingFormPage />
            </RouteGuard>
          }
        />

        <Route
          path="/admin"
          element={
            <RouteGuard allowedRoles={['admin']}>
              <AdminDashboard />
            </RouteGuard>
          }
        />
        <Route
          path="/admin/users"
          element={
            <RouteGuard allowedRoles={['admin']}>
              <AdminUsersPage />
            </RouteGuard>
          }
        />
        <Route
          path="/admin/dataset"
          element={
            <RouteGuard allowedRoles={['admin']}>
              <AdminDatasetPage />
            </RouteGuard>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
