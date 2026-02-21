import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookingApi } from '../../services/api/bookingApi';
import { BOOKING_STATUSES } from '../../config/constants';
import DataTable from '../../components/data-display/DataTable';
import type { Column } from '../../components/data-display/DataTable';
import StatusBadge from '../../components/data-display/StatusBadge';
import Input from '../../components/ui/Input';
import Tabs from '../../components/ui/Tabs';
import LoadingSpinner from '../../components/feedback/LoadingSpinner';
import { showToast } from '../../components/feedback/Toast';
import type { Booking } from '../../types';
import { MdSearch } from 'react-icons/md';
import { format } from 'date-fns';

const statusTabs = [
  { key: 'all', label: 'All' },
  { key: BOOKING_STATUSES.INQUIRY, label: 'Inquiry' },
  { key: BOOKING_STATUSES.PENDING, label: 'Pending' },
  { key: BOOKING_STATUSES.CONFIRMED, label: 'Confirmed' },
  { key: BOOKING_STATUSES.COMPLETED, label: 'Completed' },
  { key: BOOKING_STATUSES.CANCELLED, label: 'Cancelled' },
];

const BookingListPage = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = {};
      if (activeTab !== 'all') params.status = activeTab;
      if (search) params.search = search;
      const response = await bookingApi.getAll(params);
      setBookings(response.data.data?.bookings || []);
    } catch {
      showToast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  }, [activeTab, search]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const columns: Column<Booking>[] = [
    {
      key: 'bookingNumber',
      header: 'Booking #',
      sortable: true,
      accessor: (row) => (
        <span className="font-medium text-neutral-600">{row.bookingNumber}</span>
      ),
    },
    {
      key: 'client',
      header: 'Client',
      accessor: (row) => (
        <div>
          <p className="text-sm">{row.client?.firstName} {row.client?.lastName}</p>
          <p className="text-xs text-neutral-300">{row.client?.email}</p>
        </div>
      ),
    },
    {
      key: 'vendor',
      header: 'Vendor',
      accessor: (row) => row.vendor?.businessName || 'N/A',
    },
    {
      key: 'listing',
      header: 'Listing',
      accessor: (row) => (
        <span className="truncate max-w-[180px] block">{row.listing?.title || 'N/A'}</span>
      ),
    },
    {
      key: 'eventDate',
      header: 'Event Date',
      sortable: true,
      accessor: (row) =>
        row.eventDate ? format(new Date(row.eventDate), 'MMM d, yyyy') : 'N/A',
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      accessor: (row) => <StatusBadge status={row.status} type="booking" />,
    },
    {
      key: 'amount',
      header: 'Amount',
      sortable: true,
      accessor: (row) => (
        <span className="font-medium">
          ${row.pricingSnapshot?.totalAmount?.toLocaleString() || '0'}
        </span>
      ),
    },
  ];

  const filteredBookings = bookings.filter((b) => {
    if (search) {
      const q = search.toLowerCase();
      return (
        b.bookingNumber?.toLowerCase().includes(q) ||
        `${b.client?.firstName} ${b.client?.lastName}`.toLowerCase().includes(q) ||
        b.vendor?.businessName?.toLowerCase().includes(q) ||
        b.listing?.title?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  if (loading && bookings.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" label="Loading bookings..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-600">Booking Management</h1>
        <p className="text-sm text-neutral-400 mt-0.5">View and manage all platform bookings</p>
      </div>

      {/* Status Tabs */}
      <Tabs tabs={statusTabs} activeTab={activeTab} onChange={(key) => { setActiveTab(key); setPage(1); }} />

      {/* Search & Filters */}
      <div className="flex items-center gap-4">
        <div className="w-80">
          <Input
            placeholder="Search bookings..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<MdSearch className="w-4 h-4" />}
          />
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={filteredBookings}
        loading={loading}
        emptyMessage="No bookings found"
        onRowClick={(row) => navigate(`/bookings/${row._id}`)}
        rowKey={(row) => row._id}
        currentPage={page}
        onPageChange={setPage}
        pageSize={10}
      />
    </div>
  );
};

export default BookingListPage;
