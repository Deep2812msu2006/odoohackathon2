import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext.jsx';
import { ErrorBoundary } from './components/ErrorBoundary.jsx';

import { AppLayout } from './layouts/AppLayout.jsx';
import { AuthLayout } from './layouts/AuthLayout.jsx';
import { PublicLayout } from './layouts/PublicLayout.jsx';

import { LoginPage } from './pages/LoginPage.jsx';
import { SignupPage } from './pages/SignupPage.jsx';
import { DashboardPage } from './pages/DashboardPage.jsx';
import { MyTripsPage } from './pages/MyTripsPage.jsx';
import { CreateTripPage } from './pages/CreateTripPage.jsx';
import { ItineraryBuilderPage } from './pages/ItineraryBuilderPage.jsx';
import { ItineraryViewPage } from './pages/ItineraryViewPage.jsx';
import { BudgetDashboardPage } from './pages/BudgetDashboardPage.jsx';
import { CitySearchPage } from './pages/CitySearchPage.jsx';
import { ActivitySearchPage } from './pages/ActivitySearchPage.jsx';
import { PublicTripPage } from './pages/PublicTripPage.jsx';
import { ProfilePage } from './pages/ProfilePage.jsx';
import { AdminDashboardPage } from './pages/AdminDashboardPage.jsx';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <BrowserRouter>
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  background: '#0f172a',
                  color: '#f8fafc',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '0.75rem',
                },
              }}
            />
            <Routes>
              {/* Auth Routes */}
              <Route element={<AuthLayout />}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
              </Route>

              {/* Public Share Route */}
              <Route element={<PublicLayout />}>
                <Route path="/share/:slug" element={<PublicTripPage />} />
              </Route>

              {/* Protected App Routes */}
              <Route element={<AppLayout />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/trips" element={<MyTripsPage />} />
                <Route path="/trips/new" element={<CreateTripPage />} />
                <Route path="/trips/:id" element={<ItineraryViewPage />} />
                <Route path="/trips/:id/builder" element={<ItineraryBuilderPage />} />
                <Route path="/trips/:id/budget" element={<BudgetDashboardPage />} />
                <Route path="/cities" element={<CitySearchPage />} />
                <Route path="/activities" element={<ActivitySearchPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/admin" element={<AdminDashboardPage />} />
              </Route>

              {/* Default Catch-all */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
