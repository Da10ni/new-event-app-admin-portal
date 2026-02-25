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
        dispatch(setStats(response.data.data.stats));
      } catch {
        setError('Failed to load dashboard stats');
        showToast.error('Failed to load dashboard data');
      } finally {
        dispatch(setLoading(false));
      }
    };
    fetchStats();
  }, [dispatch]);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getTrendDirection = (value: number): 'up' | 'down' => {
    return value >= 0 ? 'up' : 'down';
  };

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
          trend={stats?.trends ? {
            value: Math.abs(stats.trends.users),
            direction: getTrendDirection(stats.trends.users),
            label: 'vs last month'
          } : undefined}
        />
        <StatCard
          title="Total Vendors"
          value={stats?.totalVendors ?? 0}
          variant="success"
          icon={<MdStore className="w-6 h-6" />}
          trend={stats?.trends ? {
            value: Math.abs(stats.trends.vendors),
            direction: getTrendDirection(stats.trends.vendors),
            label: 'vs last month'
          } : undefined}
        />
        <StatCard
          title="Total Bookings"
          value={stats?.totalBookings ?? 0}
          variant="primary"
          icon={<MdCalendarMonth className="w-6 h-6" />}
          trend={stats?.trends ? {
            value: Math.abs(stats.trends.bookings),
            direction: getTrendDirection(stats.trends.bookings),
            label: 'vs last month'
          } : undefined}
        />
        <StatCard
          title="Revenue"
          value={formatCurrency(stats?.totalRevenue ?? 0)}
          variant="warning"
          icon={<MdAttachMoney className="w-6 h-6" />}
          trend={stats?.trends ? {
            value: Math.abs(stats.trends.revenue),
            direction: getTrendDirection(stats.trends.revenue),
            label: 'vs last month'
          } : undefined}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card>
          <Card.Header title="Revenue Over Time" subtitle="Last 6 months" />
          <Card.Body>
            {stats?.revenueData && stats.revenueData.length > 0 ? (
              <LineChartComponent
                data={stats.revenueData}
                xAxisKey="month"
                lines={[
                  { dataKey: 'revenue', name: 'Revenue ($)', color: '#044A1A', strokeWidth: 2.5 },
                ]}
                height={280}
              />
            ) : (
              <div className="flex items-center justify-center h-[280px] text-neutral-400">
                No revenue data available
              </div>
            )}
          </Card.Body>
        </Card>

        {/* Bookings by Category */}
        <Card>
          <Card.Header title="Bookings by Category" subtitle="Current distribution" />
          <Card.Body>
            {stats?.bookingsByCategory && stats.bookingsByCategory.length > 0 ? (
              <BarChartComponent
                data={stats.bookingsByCategory}
                xAxisKey="category"
                bars={[
                  { dataKey: 'count', name: 'Bookings', color: '#0D7C5F' },
                ]}
                height={280}
                showLegend={false}
              />
            ) : (
              <div className="flex items-center justify-center h-[280px] text-neutral-400">
                No booking data available
              </div>
            )}
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
          {stats?.recentBookings && stats.recentBookings.length > 0 ? (
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
                {stats.recentBookings.map((booking) => (
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
                      {formatCurrency(booking.pricingSnapshot?.totalAmount || 0)}
                    </td>
                    <td className="table-cell">
                      <StatusBadge status={booking.status || ''} type="booking" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="flex items-center justify-center h-[200px] text-neutral-400">
              No recent bookings
            </div>
          )}
        </div>
      </Card>

      {/* Pending Approvals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Vendors */}
        <Card>
          <Card.Header
            title="Pending Vendor Approvals"
            subtitle={`${stats?.pendingVendors ?? 0} vendors waiting`}
            action={
              <Button variant="ghost" size="sm" onClick={() => navigate('/vendors')}>
                View All
              </Button>
            }
          />
          <Card.Body>
            <div className="space-y-3">
              {stats?.pendingVendorsList && stats.pendingVendorsList.length > 0 ? (
                stats.pendingVendorsList.map((vendor) => (
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
                ))
              ) : (
                <p className="text-sm text-neutral-400 text-center py-4">No pending vendors</p>
              )}
            </div>
          </Card.Body>
        </Card>

        {/* Pending Listings */}
        <Card>
          <Card.Header
            title="Pending Listing Approvals"
            subtitle={`${stats?.pendingListings ?? 0} listings waiting`}
            action={
              <Button variant="ghost" size="sm" onClick={() => navigate('/listings')}>
                View All
              </Button>
            }
          />
          <Card.Body>
            <div className="space-y-3">
              {stats?.pendingListingsList && stats.pendingListingsList.length > 0 ? (
                stats.pendingListingsList.map((listing) => (
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
                ))
              ) : (
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
