import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LangProvider } from './context/LangContext';
import { TokenProvider } from './context/TokenContext';
import { ToastProvider } from './components/ui/Toast';
import { ProtectedRoute } from './components/layout/ProtectedRoute';

// Landing
import { Landing } from './pages/landing/Landing';

// Auth pages
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { VerifyPhone } from './pages/auth/VerifyPhone';

// Public pages
import { PublicProfile } from './pages/artisan/PublicProfile';

// Customer pages
import { CustomerDashboard } from './pages/customer/Dashboard';
import { CustomerJobs } from './pages/customer/Jobs';
import { PostJob } from './pages/customer/PostJob';
import { Messages } from './pages/customer/Messages';
import { BrowseArtisans } from './pages/customer/BrowseArtisans';
import { CustomerProfile } from './pages/customer/Profile';
import { CustomerSettings } from './pages/customer/Settings';

// Worker pages
import { WorkerDashboard } from './pages/worker/Dashboard';
import { WorkerProfile } from './pages/worker/Profile';
import { WorkerServices } from './pages/worker/Services';
import { WorkerReviews } from './pages/worker/Reviews';
import { BrowseJobs } from './pages/worker/BrowseJobs';
import { WorkerMessages } from './pages/worker/WorkerMessages';
import { Credits } from './pages/worker/Credits';
import { Onboarding } from './pages/worker/onboarding/Onboarding';

// Admin pages
import { AdminOverview } from './pages/admin/Overview';
import { AdminUsers } from './pages/admin/Users';
import { AdminVerification } from './pages/admin/Verification';
import { AdminTransactions } from './pages/admin/Transactions';
import { AdminDisputes } from './pages/admin/Disputes';
import { AdminAnalytics } from './pages/admin/Analytics';

function App() {
  return (
    <LangProvider>
      <AuthProvider>
        <TokenProvider>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
              {/* Public artisan profiles */}
              <Route path="/artisans/:id" element={<PublicProfile />} />

              {/* Public */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />

              {/* Phone verification */}
              <Route
                path="/verify-phone"
                element={
                  <ProtectedRoute>
                    <VerifyPhone />
                  </ProtectedRoute>
                }
              />

              {/* Onboarding (artisan only) */}
              <Route
                path="/onboarding"
                element={
                  <ProtectedRoute roles={['artisan']}>
                    <Onboarding />
                  </ProtectedRoute>
                }
              />

              {/* Customer routes */}
              <Route path="/dashboard/customer" element={<ProtectedRoute roles={['client']}><CustomerDashboard /></ProtectedRoute>} />
              <Route path="/dashboard/customer/jobs" element={<ProtectedRoute roles={['client']}><CustomerJobs /></ProtectedRoute>} />
              <Route path="/dashboard/customer/browse" element={<ProtectedRoute roles={['client']}><BrowseArtisans /></ProtectedRoute>} />
              <Route path="/post-job" element={<ProtectedRoute roles={['client']}><PostJob /></ProtectedRoute>} />
              <Route path="/messages" element={<ProtectedRoute roles={['client']}><Messages /></ProtectedRoute>} />
              <Route path="/dashboard/customer/profile" element={<ProtectedRoute roles={['client']}><CustomerProfile /></ProtectedRoute>} />
              <Route path="/dashboard/customer/settings" element={<ProtectedRoute roles={['client']}><CustomerSettings /></ProtectedRoute>} />

              {/* Worker routes */}
              <Route path="/dashboard/worker" element={<ProtectedRoute roles={['artisan']}><WorkerDashboard /></ProtectedRoute>} />
              <Route path="/dashboard/worker/profile" element={<ProtectedRoute roles={['artisan']}><WorkerProfile /></ProtectedRoute>} />
              <Route path="/dashboard/worker/services" element={<ProtectedRoute roles={['artisan']}><WorkerServices /></ProtectedRoute>} />
              <Route path="/dashboard/worker/browse" element={<ProtectedRoute roles={['artisan']}><BrowseJobs /></ProtectedRoute>} />
              <Route path="/dashboard/worker/messages" element={<ProtectedRoute roles={['artisan']}><WorkerMessages /></ProtectedRoute>} />
              <Route path="/dashboard/worker/credits" element={<ProtectedRoute roles={['artisan']}><Credits /></ProtectedRoute>} />
              <Route path="/dashboard/worker/reviews" element={<ProtectedRoute roles={['artisan']}><WorkerReviews /></ProtectedRoute>} />

              {/* Admin routes */}
              <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminOverview /></ProtectedRoute>} />
              <Route path="/admin/users" element={<ProtectedRoute roles={['admin']}><AdminUsers /></ProtectedRoute>} />
              <Route path="/admin/verification" element={<ProtectedRoute roles={['admin']}><AdminVerification /></ProtectedRoute>} />
              <Route path="/admin/transactions" element={<ProtectedRoute roles={['admin']}><AdminTransactions /></ProtectedRoute>} />
              <Route path="/admin/disputes" element={<ProtectedRoute roles={['admin']}><AdminDisputes /></ProtectedRoute>} />
              <Route path="/admin/analytics" element={<ProtectedRoute roles={['admin']}><AdminAnalytics /></ProtectedRoute>} />

              {/* Default */}
              <Route path="/" element={<Landing />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </ToastProvider>
        </TokenProvider>
      </AuthProvider>
    </LangProvider>
  );
}

export default App;
