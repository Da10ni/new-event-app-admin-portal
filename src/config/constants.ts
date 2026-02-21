export const APP_NAME = 'Events Platform Admin';
export const VENDOR_STATUSES = { PENDING: 'pending', APPROVED: 'approved', REJECTED: 'rejected', SUSPENDED: 'suspended' } as const;
export const LISTING_STATUSES = { DRAFT: 'draft', PENDING: 'pending', APPROVED: 'approved', REJECTED: 'rejected', SUSPENDED: 'suspended', ARCHIVED: 'archived' } as const;
export const BOOKING_STATUSES = { INQUIRY: 'inquiry', PENDING: 'pending', CONFIRMED: 'confirmed', REJECTED: 'rejected', CANCELLED: 'cancelled', COMPLETED: 'completed' } as const;

export const SIDEBAR_ITEMS = [
  { label: 'Dashboard', path: '/', icon: 'MdDashboard' },
  { label: 'Vendors', path: '/vendors', icon: 'MdStore' },
  { label: 'Users', path: '/users', icon: 'MdPeople' },
  { label: 'Listings', path: '/listings', icon: 'MdGridView' },
  { label: 'Bookings', path: '/bookings', icon: 'MdCalendarMonth' },
  { label: 'Categories', path: '/categories', icon: 'MdCategory' },
  { label: 'Reviews', path: '/reviews', icon: 'MdStar' },
  { label: 'Reports', path: '/reports', icon: 'MdBarChart' },
  { label: 'Settings', path: '/settings', icon: 'MdSettings' },
];
