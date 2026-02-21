import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';
import AdminLayout from '../layouts/AdminLayout';

export const ProtectedRoute = () => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <AdminLayout />;
};
