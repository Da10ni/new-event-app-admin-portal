import { createBrowserRouter } from 'react-router-dom';
import { ADMIN_ROUTES } from '../config';
import { ProtectedRoute } from './ProtectedRoute';
import AuthLayout from '../layouts/AuthLayout';
import AdminLoginPage from '../pages/auth/AdminLoginPage';
import DashboardPage from '../pages/dashboard/DashboardPage';
import VendorListPage from '../pages/vendors/VendorListPage';
import VendorDetailPage from '../pages/vendors/VendorDetailPage';
import UserListPage from '../pages/users/UserListPage';
import UserDetailPage from '../pages/users/UserDetailPage';
import ListingListPage from '../pages/listings/ListingListPage';
import ListingDetailPage from '../pages/listings/ListingDetailPage';
import BookingListPage from '../pages/bookings/BookingListPage';
import BookingDetailPage from '../pages/bookings/BookingDetailPage';
import CategoryListPage from '../pages/categories/CategoryListPage';
import ReviewListPage from '../pages/reviews/ReviewListPage';
import ReportsPage from '../pages/reports/ReportsPage';
import SettingsPage from '../pages/settings/SettingsPage';

export const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [
      { path: ADMIN_ROUTES.LOGIN, element: <AdminLoginPage /> },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      { path: ADMIN_ROUTES.DASHBOARD, element: <DashboardPage /> },
      { path: ADMIN_ROUTES.VENDORS, element: <VendorListPage /> },
      { path: ADMIN_ROUTES.VENDOR_DETAIL, element: <VendorDetailPage /> },
      { path: ADMIN_ROUTES.USERS, element: <UserListPage /> },
      { path: ADMIN_ROUTES.USER_DETAIL, element: <UserDetailPage /> },
      { path: ADMIN_ROUTES.LISTINGS, element: <ListingListPage /> },
      { path: ADMIN_ROUTES.LISTING_DETAIL, element: <ListingDetailPage /> },
      { path: ADMIN_ROUTES.BOOKINGS, element: <BookingListPage /> },
      { path: ADMIN_ROUTES.BOOKING_DETAIL, element: <BookingDetailPage /> },
      { path: ADMIN_ROUTES.CATEGORIES, element: <CategoryListPage /> },
      { path: ADMIN_ROUTES.REVIEWS, element: <ReviewListPage /> },
      { path: ADMIN_ROUTES.REPORTS, element: <ReportsPage /> },
      { path: ADMIN_ROUTES.SETTINGS, element: <SettingsPage /> },
    ],
  },
]);
