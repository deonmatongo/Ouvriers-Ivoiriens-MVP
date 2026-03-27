import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LangProvider } from './context/LangContext';
import { ToastProvider } from './components/ui/Toast';
import { ProtectedRoute } from './components/layout/ProtectedRoute';

// Auth pages
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { VerifyPhone } from './pages/auth/VerifyPhone';

// Customer pages
import { CustomerDashboard } from './pages/customer/Dashboard';
import { CustomerJobs } from './pages/customer/Jobs';
import { PostJob } from './pages/customer/PostJob';
import { Messages } from './pages/customer/Messages';

// Worker pages
import { WorkerDashboard } from './pages/worker/Dashboard';
import { WorkerProfile } from './pages/worker/Profile';
import { WorkerServices } from './pages/worker/Services';
import { WorkerReviews } from './pages/worker/Reviews';
import { Onboarding } from './pages/worker/onboarding/Onboarding';

function App() {
  return (
    <LangProvider>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
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
              <Route path="/post-job" element={<ProtectedRoute roles={['client']}><PostJob /></ProtectedRoute>} />
              <Route path="/messages" element={<ProtectedRoute roles={['client']}><Messages /></ProtectedRoute>} />

              {/* Worker routes */}
              <Route path="/dashboard/worker" element={<ProtectedRoute roles={['artisan']}><WorkerDashboard /></ProtectedRoute>} />
              <Route path="/dashboard/worker/profile" element={<ProtectedRoute roles={['artisan']}><WorkerProfile /></ProtectedRoute>} />
              <Route path="/dashboard/worker/services" element={<ProtectedRoute roles={['artisan']}><WorkerServices /></ProtectedRoute>} />
              <Route path="/dashboard/worker/reviews" element={<ProtectedRoute roles={['artisan']}><WorkerReviews /></ProtectedRoute>} />

              {/* Default */}
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </LangProvider>
  );
}

export default App;
