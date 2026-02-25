import { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import Tabs from '../../components/ui/Tabs';
import LineChartComponent from '../../components/charts/LineChart';
import BarChartComponent from '../../components/charts/BarChart';
import AreaChartComponent from '../../components/charts/AreaChart';
import PieChartComponent from '../../components/charts/PieChart';
import { MdDownload, MdTrendingUp, MdTrendingDown, MdStar } from 'react-icons/md';
import { showToast } from '../../components/feedback/Toast';
import { reportsApi } from '../../services/api/reportsApi';
import type {
  ReportPeriod,
  RevenueStats,
  BookingStats,
  UserGrowthStats,
  TopVendorsStats,
} from '../../services/api/reportsApi';
import LoadingSpinner from '../../components/feedback/LoadingSpinner';

const reportTabs = [
  { key: 'revenue', label: 'Revenue' },
  { key: 'bookings', label: 'Bookings' },
  { key: 'growth', label: 'User Growth' },
  { key: 'vendors', label: 'Top Vendors' },
];

const periodOptions = [
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: '90d', label: 'Last 90 Days' },
  { value: '6m', label: 'Last 6 Months' },
  { value: '1y', label: 'Last Year' },
];

const ReportsPage = () => {
  const [activeTab, setActiveTab] = useState('revenue');
  const [period, setPeriod] = useState<ReportPeriod>('6m');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [revenueStats, setRevenueStats] = useState<RevenueStats | null>(null);
  const [bookingStats, setBookingStats] = useState<BookingStats | null>(null);
  const [userGrowthStats, setUserGrowthStats] = useState<UserGrowthStats | null>(null);
  const [topVendorsStats, setTopVendorsStats] = useState<TopVendorsStats | null>(null);

  useEffect(() => {
    const fetchReportsData = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await reportsApi.getAll(period);
        const { revenue, bookings, userGrowth, topVendors } = response.data.data;

        setRevenueStats(revenue);
        setBookingStats(bookings);
        setUserGrowthStats(userGrowth);
        setTopVendorsStats(topVendors);
      } catch (err) {
        console.error('Failed to fetch reports:', err);
        setError('Failed to load reports data. Please try again.');
        showToast.error('Failed to load reports data');
      } finally {
        setLoading(false);
      }
    };

    fetchReportsData();
  }, [period]);

  const handleExport = () => {
    showToast.info('Export functionality will be available in a future update.');
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const renderChangeIndicator = (change: number) => {
    const isPositive = change >= 0;
    const Icon = isPositive ? MdTrendingUp : MdTrendingDown;
    const colorClass = isPositive ? 'text-success-500' : 'text-error-500';

    return (
      <div className="flex items-center gap-1 mt-1">
        <Icon className={`w-4 h-4 ${colorClass}`} />
        <span className={`text-xs font-medium ${colorClass}`}>
          {isPositive ? '+' : ''}{change}% vs previous
        </span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <p className="text-error-500 mb-4">{error}</p>
        <Button variant="primary" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-600">Reports & Analytics</h1>
          <p className="text-sm text-neutral-400 mt-0.5">Platform performance insights and analytics</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-44">
            <Select
              options={periodOptions}
              value={period}
              onChange={(e) => setPeriod(e.target.value as ReportPeriod)}
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            icon={<MdDownload className="w-4 h-4" />}
            onClick={handleExport}
          >
            Export
          </Button>
        </div>
      </div>

      {/* Report Tabs */}
      <Tabs tabs={reportTabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Revenue Report */}
      {activeTab === 'revenue' && revenueStats && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <p className="text-sm text-neutral-400">Total Revenue</p>
              <p className="text-2xl font-bold text-neutral-600 mt-1">
                {formatCurrency(revenueStats.summary.totalRevenue)}
              </p>
              {renderChangeIndicator(revenueStats.summary.revenueChange)}
            </Card>
            <Card>
              <p className="text-sm text-neutral-400">Total Commission</p>
              <p className="text-2xl font-bold text-neutral-600 mt-1">
                {formatCurrency(revenueStats.summary.totalCommission)}
              </p>
              {renderChangeIndicator(revenueStats.summary.revenueChange)}
            </Card>
            <Card>
              <p className="text-sm text-neutral-400">Avg. Booking Value</p>
              <p className="text-2xl font-bold text-neutral-600 mt-1">
                {formatCurrency(revenueStats.summary.avgBookingValue)}
              </p>
              {renderChangeIndicator(revenueStats.summary.avgChange)}
            </Card>
          </div>

          {/* Revenue Chart */}
          <Card>
            <Card.Header title="Revenue Trend" subtitle="Monthly revenue and commission" />
            <Card.Body>
              {revenueStats.revenueData.length > 0 ? (
                <AreaChartComponent
                  data={revenueStats.revenueData}
                  xAxisKey="month"
                  areas={[
                    { dataKey: 'revenue', name: 'Revenue', color: '#044A1A' },
                    { dataKey: 'commission', name: 'Commission', color: '#0D7C5F' },
                  ]}
                  height={350}
                />
              ) : (
                <div className="flex items-center justify-center h-[350px] text-neutral-400">
                  No revenue data available for this period
                </div>
              )}
            </Card.Body>
          </Card>
        </div>
      )}

      {/* Bookings Report */}
      {activeTab === 'bookings' && bookingStats && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bookings by Status */}
            <Card>
              <Card.Header title="Bookings by Status" subtitle="Overall distribution" />
              <Card.Body>
                {bookingStats.byStatus.length > 0 ? (
                  <PieChartComponent
                    data={bookingStats.byStatus}
                    height={320}
                    centerText={String(bookingStats.totalBookings)}
                    centerSubtext="Total"
                  />
                ) : (
                  <div className="flex items-center justify-center h-[320px] text-neutral-400">
                    No booking data available
                  </div>
                )}
              </Card.Body>
            </Card>

            {/* Bookings by Category */}
            <Card>
              <Card.Header title="Bookings by Category" subtitle="Confirmed vs Pending" />
              <Card.Body>
                {bookingStats.byCategory.length > 0 ? (
                  <BarChartComponent
                    data={bookingStats.byCategory}
                    xAxisKey="category"
                    bars={[
                      { dataKey: 'confirmed', name: 'Confirmed', color: '#10B981', stackId: 'a' },
                      { dataKey: 'pending', name: 'Pending', color: '#FFB400', stackId: 'a' },
                    ]}
                    height={320}
                    stacked
                  />
                ) : (
                  <div className="flex items-center justify-center h-[320px] text-neutral-400">
                    No category data available
                  </div>
                )}
              </Card.Body>
            </Card>
          </div>
        </div>
      )}

      {/* User Growth */}
      {activeTab === 'growth' && userGrowthStats && (
        <Card>
          <Card.Header title="User & Vendor Growth" subtitle="Monthly registration trends" />
          <Card.Body>
            {userGrowthStats.growthData.length > 0 ? (
              <LineChartComponent
                data={userGrowthStats.growthData}
                xAxisKey="month"
                lines={[
                  { dataKey: 'users', name: 'Users', color: '#044A1A', strokeWidth: 2.5 },
                  { dataKey: 'vendors', name: 'Vendors', color: '#0D7C5F', strokeWidth: 2.5, dashed: true },
                ]}
                height={400}
              />
            ) : (
              <div className="flex items-center justify-center h-[400px] text-neutral-400">
                No user growth data available
              </div>
            )}
          </Card.Body>
        </Card>
      )}

      {/* Top Vendors */}
      {activeTab === 'vendors' && topVendorsStats && (
        <Card padding={false}>
          <div className="p-6 pb-0">
            <Card.Header title="Top Performing Vendors" subtitle="Based on bookings and revenue" />
          </div>
          <div className="mt-4 overflow-x-auto">
            {topVendorsStats.vendors.length > 0 ? (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-100">
                    <th className="table-header">Rank</th>
                    <th className="table-header">Vendor</th>
                    <th className="table-header">Bookings</th>
                    <th className="table-header">Revenue</th>
                    <th className="table-header">Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {topVendorsStats.vendors.map((vendor, idx) => (
                    <tr key={vendor._id} className="border-b border-neutral-50 last:border-0">
                      <td className="table-cell">
                        <span
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                            idx === 0
                              ? 'bg-warning-100 text-warning-600'
                              : idx === 1
                              ? 'bg-neutral-200 text-neutral-500'
                              : idx === 2
                              ? 'bg-orange-100 text-orange-600'
                              : 'bg-neutral-50 text-neutral-400'
                          }`}
                        >
                          {idx + 1}
                        </span>
                      </td>
                      <td className="table-cell font-medium text-neutral-600">
                        {vendor.name}
                      </td>
                      <td className="table-cell">{vendor.bookings}</td>
                      <td className="table-cell font-medium">
                        {formatCurrency(vendor.revenue)}
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center gap-1">
                          <MdStar className="w-4 h-4 text-warning-500" />
                          <span className="font-medium">{vendor.rating.toFixed(1)}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="flex items-center justify-center h-[200px] text-neutral-400">
                No vendor data available for this period
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

export default ReportsPage;
