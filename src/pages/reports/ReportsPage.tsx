import { useState } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import Tabs from '../../components/ui/Tabs';
import LineChartComponent from '../../components/charts/LineChart';
import BarChartComponent from '../../components/charts/BarChart';
import AreaChartComponent from '../../components/charts/AreaChart';
import PieChartComponent from '../../components/charts/PieChart';
import { MdDownload, MdTrendingUp, MdStar } from 'react-icons/md';
import { showToast } from '../../components/feedback/Toast';

const revenueData = [
  { month: 'Jul', revenue: 28000, commission: 2800 },
  { month: 'Aug', revenue: 32000, commission: 3200 },
  { month: 'Sep', revenue: 38000, commission: 3800 },
  { month: 'Oct', revenue: 41000, commission: 4100 },
  { month: 'Nov', revenue: 47000, commission: 4700 },
  { month: 'Dec', revenue: 55000, commission: 5500 },
  { month: 'Jan', revenue: 52000, commission: 5200 },
];

const bookingsByStatus = [
  { name: 'Confirmed', value: 320, color: '#10B981' },
  { name: 'Pending', value: 85, color: '#FFB400' },
  { name: 'Completed', value: 480, color: '#8B5CF6' },
  { name: 'Cancelled', value: 45, color: '#B0B0B0' },
  { name: 'Rejected', value: 20, color: '#C13515' },
];

const bookingsByCategory = [
  { category: 'Venues', confirmed: 145, pending: 25 },
  { category: 'Catering', confirmed: 120, pending: 18 },
  { category: 'Photography', confirmed: 95, pending: 12 },
  { category: 'Entertainment', confirmed: 80, pending: 15 },
  { category: 'Decoration', confirmed: 65, pending: 8 },
  { category: 'Planning', confirmed: 55, pending: 7 },
];

const userGrowthData = [
  { month: 'Jul', users: 850, vendors: 45 },
  { month: 'Aug', users: 1020, vendors: 52 },
  { month: 'Sep', users: 1180, vendors: 60 },
  { month: 'Oct', users: 1350, vendors: 68 },
  { month: 'Nov', users: 1520, vendors: 75 },
  { month: 'Dec', users: 1780, vendors: 85 },
  { month: 'Jan', users: 1950, vendors: 92 },
];

const topVendors = [
  { name: 'Elite Venues', bookings: 85, revenue: 125000, rating: 4.9 },
  { name: 'Taste Masters', bookings: 72, revenue: 98000, rating: 4.8 },
  { name: 'Snap Studios', bookings: 65, revenue: 78000, rating: 4.7 },
  { name: 'Melody Makers', bookings: 58, revenue: 92000, rating: 4.6 },
  { name: 'Green Events', bookings: 52, revenue: 68000, rating: 4.5 },
];

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
  const [period, setPeriod] = useState('6m');

  const handleExport = () => {
    showToast.info('Export functionality will be available in a future update.');
  };

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
              onChange={(e) => setPeriod(e.target.value)}
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
      {activeTab === 'revenue' && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <p className="text-sm text-neutral-400">Total Revenue</p>
              <p className="text-2xl font-bold text-neutral-600 mt-1">$293,000</p>
              <div className="flex items-center gap-1 mt-1">
                <MdTrendingUp className="w-4 h-4 text-success-500" />
                <span className="text-xs text-success-500 font-medium">+18.5% vs previous</span>
              </div>
            </Card>
            <Card>
              <p className="text-sm text-neutral-400">Total Commission</p>
              <p className="text-2xl font-bold text-neutral-600 mt-1">$29,300</p>
              <div className="flex items-center gap-1 mt-1">
                <MdTrendingUp className="w-4 h-4 text-success-500" />
                <span className="text-xs text-success-500 font-medium">+18.5% vs previous</span>
              </div>
            </Card>
            <Card>
              <p className="text-sm text-neutral-400">Avg. Booking Value</p>
              <p className="text-2xl font-bold text-neutral-600 mt-1">$1,850</p>
              <div className="flex items-center gap-1 mt-1">
                <MdTrendingUp className="w-4 h-4 text-success-500" />
                <span className="text-xs text-success-500 font-medium">+5.2% vs previous</span>
              </div>
            </Card>
          </div>

          {/* Revenue Chart */}
          <Card>
            <Card.Header title="Revenue Trend" subtitle="Monthly revenue and commission" />
            <Card.Body>
              <AreaChartComponent
                data={revenueData}
                xAxisKey="month"
                areas={[
                  { dataKey: 'revenue', name: 'Revenue', color: '#044A1A' },
                  { dataKey: 'commission', name: 'Commission', color: '#0D7C5F' },
                ]}
                height={350}
              />
            </Card.Body>
          </Card>
        </div>
      )}

      {/* Bookings Report */}
      {activeTab === 'bookings' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bookings by Status */}
            <Card>
              <Card.Header title="Bookings by Status" subtitle="Overall distribution" />
              <Card.Body>
                <PieChartComponent
                  data={bookingsByStatus}
                  height={320}
                  centerText="950"
                  centerSubtext="Total"
                />
              </Card.Body>
            </Card>

            {/* Bookings by Category */}
            <Card>
              <Card.Header title="Bookings by Category" subtitle="Confirmed vs Pending" />
              <Card.Body>
                <BarChartComponent
                  data={bookingsByCategory}
                  xAxisKey="category"
                  bars={[
                    { dataKey: 'confirmed', name: 'Confirmed', color: '#10B981', stackId: 'a' },
                    { dataKey: 'pending', name: 'Pending', color: '#FFB400', stackId: 'a' },
                  ]}
                  height={320}
                  stacked
                />
              </Card.Body>
            </Card>
          </div>
        </div>
      )}

      {/* User Growth */}
      {activeTab === 'growth' && (
        <Card>
          <Card.Header title="User & Vendor Growth" subtitle="Monthly registration trends" />
          <Card.Body>
            <LineChartComponent
              data={userGrowthData}
              xAxisKey="month"
              lines={[
                { dataKey: 'users', name: 'Users', color: '#044A1A', strokeWidth: 2.5 },
                { dataKey: 'vendors', name: 'Vendors', color: '#0D7C5F', strokeWidth: 2.5, dashed: true },
              ]}
              height={400}
            />
          </Card.Body>
        </Card>
      )}

      {/* Top Vendors */}
      {activeTab === 'vendors' && (
        <Card padding={false}>
          <div className="p-6 pb-0">
            <Card.Header title="Top Performing Vendors" subtitle="Based on bookings and revenue" />
          </div>
          <div className="mt-4 overflow-x-auto">
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
                {topVendors.map((vendor, idx) => (
                  <tr key={vendor.name} className="border-b border-neutral-50 last:border-0">
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
                      ${vendor.revenue.toLocaleString()}
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-1">
                        <MdStar className="w-4 h-4 text-warning-500" />
                        <span className="font-medium">{vendor.rating}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ReportsPage;
