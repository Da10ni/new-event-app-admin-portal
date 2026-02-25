const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
export const API_CONFIG = {
  BASE_URL: API_BASE_URL, TIMEOUT: 30000,
  ENDPOINTS: {
    AUTH: { LOGIN: '/auth/login', REFRESH: '/auth/refresh-token', LOGOUT: '/auth/logout' },
    ADMIN: {
      DASHBOARD: '/admin/dashboard/stats',
      USERS: '/admin/users',
      VENDORS: '/admin/vendors',
      LISTINGS: '/admin/listings',
      BOOKINGS: '/admin/bookings',
      CATEGORIES: '/admin/categories',
      REPORTS: {
        BASE: '/admin/reports',
        REVENUE: '/admin/reports/revenue',
        BOOKINGS: '/admin/reports/bookings',
        USER_GROWTH: '/admin/reports/user-growth',
        TOP_VENDORS: '/admin/reports/top-vendors',
      },
    },
    CATEGORIES: { BASE: '/categories' },
    UPLOAD: { IMAGE: '/upload/image', IMAGES: '/upload/images' },
  },
};
