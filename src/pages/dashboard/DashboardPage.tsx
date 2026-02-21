import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setStats, setLoading } from '../../store/slices/dashboardSlice';
import { dashboardApi } from '../../services/api/dashboardApi';
import { MdPeople, MdStore, MdCalendarMonth, MdAttachMoney, MdArrowForward } from 'react-icons/md';
import StatCard from '../../components/data-display/StatCard';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/data-display/StatusBadge';
import LineChartComponent from '../../components/charts/LineChart';
import BarChartComponent from '../../components/charts/BarChart';
import LoadingSpinner from '../../components/feedback/LoadingSpinner';
import { showToast } from '../../components/feedback/Toast';
import type { Booking, Vendor, Listing } from '../../types';

// Mock data for charts and tables (in production these come from API)
const revenueData = [
  { month: 'Aug', revenue: 32000, bookings: 120 },
  { month: 'Sep', revenue: 38000, bookings: 145 },
  { month: 'Oct', revenue: 41000, bookings: 160 },
  { month: 'Nov', revenue: 47000, bookings: 185 },
  { month: 'Dec', revenue: 55000, bookings: 210 },
  { month: 'Jan', revenue: 52000, bookings: 195 },
];

const bookingsByCategory = [
  { category: 'Venues', count: 245 },
  { category: 'Catering', count: 180 },
  { category: 'Photography', count: 156 },
  { category: 'Entertainment', count: 120 },
  { category: 'Decoration', count: 95 },
  { category: 'Planning', count: 78 },
];

const mockRecentBookings: Partial<Booking>[] = [
  { _id: '1', bookingNumber: 'BK-2024-001', client: { _id: 'c1', firstName: 'Sarah', lastName: 'Johnson', email: 'sarah@mail.com' }, listing: { _id: 'l1', title: 'Grand Ballroom', slug: 'grand-ballroom' }, vendor: { _id: 'v1', businessName: 'Elite Venues' }, status: 'confirmed', pricingSnapshot: { totalAmount: 2500, currency: 'USD' }, createdAt: '2024-01-15T10:30:00Z' },
  { _id: '2', bookingNumber: 'BK-2024-002', client: { _id: 'c2', firstName: 'Michael', lastName: 'Chen', email: 'michael@mail.com' }, listing: { _id: 'l2', title: 'Garden Party Setup', slug: 'garden-party' }, vendor: { _id: 'v2', businessName: 'Green Events' }, status: 'pending', pricingSnapshot: { totalAmount: 1800, currency: 'USD' }, createdAt: '2024-01-14T15:00:00Z' },
  { _id: '3', bookingNumber: 'BK-2024-003', client: { _id: 'c3', firstName: 'Emily', lastName: 'Davis', email: 'emily@mail.com' }, listing: { _id: 'l3', title: 'Premium Photography', slug: 'premium-photo' }, vendor: { _id: 'v3', businessName: 'Snap Studios' }, status: 'completed', pricingSnapshot: { totalAmount: 950, currency: 'USD' }, createdAt: '2024-01-13T09:45:00Z' },
  { _id: '4', bookingNumber: 'BK-2024-004', client: { _id: 'c4', firstName: 'James', lastName: 'Wilson', email: 'james@mail.com' }, listing: { _id: 'l4', title: 'Live Band Performance', slug: 'live-band' }, vendor: { _id: 'v4', businessName: 'Melody Makers' }, status: 'inquiry', pricingSnapshot: { totalAmount: 3200, currency: 'USD' }, createdAt: '2024-01-12T14:20:00Z' },
  { _id: '5', bookingNumber: 'BK-2024-005', client: { _id: 'c5', firstName: 'Lisa', lastName: 'Brown', email: 'lisa@mail.com' }, listing: { _id: 'l5', title: 'Elegant Catering', slug: 'elegant-catering' }, vendor: { _id: 'v5', businessName: 'Taste Masters' }, status: 'cancelled', pricingSnapshot: { totalAmount: 1500, currency: 'USD' }, createdAt: '2024-01-11T11:10:00Z' },
];

const mockPendingVendors: Partial<Vendor>[] = [
  { _id: 'v10', businessName: 'Sunshine Decor', userId: { _id: 'u10', firstName: 'Anna', lastName: 'Martinez', email: 'anna@mail.com', phone: '+1234567890' }, status: 'pending', createdAt: '2024-01-15T08:00:00Z' },
  { _id: 'v11', businessName: 'Royal Events Co', userId: { _id: 'u11', firstName: 'David', lastName: 'Lee', email: 'david@mail.com', phone: '+1234567891' }, status: 'pending', createdAt: '2024-01-14T12:00:00Z' },
];

const mockPendingListings: Partial<Listing>[] = [
  { _id: 'l10', title: 'Rooftop Sunset Venue', vendor: { _id: 'v2', businessName: 'Green Events', businessSlug: 'green-events' }, status: 'pending', category: { _id: 'c1', name: 'Venues', slug: 'venues' }, createdAt: '2024-01-15T09:00:00Z' },
  { _id: 'l11', title: 'DJ & Sound Package', vendor: { _id: 'v4', businessName: 'Melody Makers', businessSlug: 'melody-makers' }, status: 'pending', category: { _id: 'c4', name: 'Entertainment', slug: 'entertainment' }, createdAt: '2024-01-14T16:00:00Z' },
];

const DashboardPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { stats, loading } = useAppSelector((state) => state.dashboard);
  const [, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      dispatch(setLoading(true));
      try {
        const response = await dashboardApi.getStats();
        dispatch(setStats(response.data.data));
      } catch {
        setError('Failed to load dashboard stats');
        showToast.error('Failed to load dashboard data');
      } finally {
        dispatch(setLoading(false));
      }
    };
    fetchStats();
  }, [dispatch]);

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" label="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-600">Dashboard</h1>
          <p className="text-sm text-neutral-400 mt-0.5">Welcome back. Here is your platform overview.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate('/reports')}>
            View Reports
          </Button>
          <Button variant="primary" size="sm" onClick={() => navigate('/vendors')}>
            Manage Vendors
          </Button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value={stats?.totalUsers ?? 0}
          variant="info"
          icon={<MdPeople className="w-6 h-6" />}
          trend={{ value: 12.5, direction: 'up', label: 'vs last month' }}
        />
        <StatCard
          title="Total Vendors"
          value={stats?.totalVendors ?? 0}
          variant="success"
          icon={<MdStore className="w-6 h-6" />}
          trend={{ value: 8.2, direction: 'up', label: 'vs last month' }}
        />
        <StatCard
          title="Total Bookings"
          value={stats?.totalBookings ?? 0}
          variant="primary"
          icon={<MdCalendarMonth className="w-6 h-6" />}
          trend={{ value: 15.3, direction: 'up', label: 'vs last month' }}
        />
        <StatCard
          title="Revenue"
          value="$52,000"
          variant="warning"
          icon={<MdAttachMoney className="w-6 h-6" />}
          trend={{ value: 5.4, direction: 'down', label: 'vs last month' }}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card>
          <Card.Header title="Revenue Over Time" subtitle="Last 6 months" />
          <Card.Body>
            <LineChartComponent
              data={revenueData}
              xAxisKey="month"
              lines={[
                { dataKey: 'revenue', name: 'Revenue ($)', color: '#044A1A', strokeWidth: 2.5 },
              ]}
              height={280}
            />
          </Card.Body>
        </Card>

        {/* Bookings by Category */}
        <Card>
          <Card.Header title="Bookings by Category" subtitle="Current distribution" />
          <Card.Body>
            <BarChartComponent
              data={bookingsByCategory}
              xAxisKey="category"
              bars={[
                { dataKey: 'count', name: 'Bookings', color: '#0D7C5F' },
              ]}
              height={280}
              showLegend={false}
            />
          </Card.Body>
        </Card>
      </div>

      {/* Recent Bookings */}
      <Card padding={false}>
        <div className="p-6 pb-0">
          <Card.Header
            title="Recent Bookings"
            subtitle="Latest 5 bookings"
            action={
              <Button variant="ghost" size="sm" icon={<MdArrowForward className="w-4 h-4" />} iconPosition="right" onClick={() => navigate('/bookings')}>
                View All
              </Button>
            }
          />
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-100">
                <th className="table-header">Booking #</th>
                <th className="table-header">Client</th>
                <th className="table-header">Listing</th>
                <th className="table-header">Vendor</th>
                <th className="table-header">Amount</th>
                <th className="table-header">Status</th>
              </tr>
            </thead>
            <tbody>
              {mockRecentBookings.map((booking) => (
                <tr
                  key={booking._id}
                  onClick={() => navigate(`/bookings/${booking._id}`)}
                  className="border-b border-neutral-50 last:border-0 cursor-pointer hover:bg-neutral-50 transition-colors"
                >
                  <td className="table-cell font-medium text-neutral-600">
                    {booking.bookingNumber}
                  </td>
                  <td className="table-cell">
                    {booking.client?.firstName} {booking.client?.lastName}
                  </td>
                  <td className="table-cell">{booking.listing?.title}</td>
                  <td className="table-cell">{booking.vendor?.businessName}</td>
                  <td className="table-cell font-medium">
                    ${booking.pricingSnapshot?.totalAmount?.toLocaleString()}
                  </td>
                  <td className="table-cell">
                    <StatusBadge status={booking.status || ''} type="booking" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Pending Approvals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Vendors */}
        <Card>
          <Card.Header
            title="Pending Vendor Approvals"
            subtitle={`${stats?.pendingVendors ?? mockPendingVendors.length} vendors waiting`}
            action={
              <Button variant="ghost" size="sm" onClick={() => navigate('/vendors')}>
                View All
              </Button>
            }
          />
          <Card.Body>
            <div className="space-y-3">
              {mockPendingVendors.map((vendor) => (
                <div
                  key={vendor._id}
                  className="flex items-center justify-between p-3 rounded-lg bg-neutral-50 hover:bg-neutral-100 transition-colors cursor-pointer"
                  onClick={() => navigate(`/vendors/${vendor._id}`)}
                >
                  <div>
                    <p className="text-sm font-medium text-neutral-600">{vendor.businessName}</p>
                    <p className="text-xs text-neutral-400">
                      {vendor.userId?.firstName} {vendor.userId?.lastName}
                    </p>
                  </div>
                  <StatusBadge status="pending" type="vendor" />
                </div>
              ))}
              {mockPendingVendors.length === 0 && (
                <p className="text-sm text-neutral-400 text-center py-4">No pending vendors</p>
              )}
            </div>
          </Card.Body>
        </Card>

        {/* Pending Listings */}
        <Card>
          <Card.Header
            title="Pending Listing Approvals"
            subtitle={`${stats?.pendingListings ?? mockPendingListings.length} listings waiting`}
            action={
              <Button variant="ghost" size="sm" onClick={() => navigate('/listings')}>
                View All
              </Button>
            }
          />
          <Card.Body>
            <div className="space-y-3">
              {mockPendingListings.map((listing) => (
                <div
                  key={listing._id}
                  className="flex items-center justify-between p-3 rounded-lg bg-neutral-50 hover:bg-neutral-100 transition-colors cursor-pointer"
                  onClick={() => navigate(`/listings/${listing._id}`)}
                >
                  <div>
                    <p className="text-sm font-medium text-neutral-600">{listing.title}</p>
                    <p className="text-xs text-neutral-400">
                      {listing.vendor?.businessName} - {listing.category?.name}
                    </p>
                  </div>
                  <StatusBadge status="pending" type="listing" />
                </div>
              ))}
              {mockPendingListings.length === 0 && (
                <p className="text-sm text-neutral-400 text-center py-4">No pending listings</p>
              )}
            </div>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
