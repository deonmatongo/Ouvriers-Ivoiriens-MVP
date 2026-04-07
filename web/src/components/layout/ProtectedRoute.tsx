import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface Props {
  children: React.ReactNode;
  roles?: ('client' | 'artisan' | 'admin')[];
}

export function ProtectedRoute({ children, roles }: Props) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (roles && !roles.includes(user.role as 'client' | 'artisan' | 'admin')) {
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    if (user.role === 'artisan') return <Navigate to="/dashboard/worker" replace />;
    return <Navigate to="/dashboard/customer" replace />;
  }

  return <>{children}</>;
}
