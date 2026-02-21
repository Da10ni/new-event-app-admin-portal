import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setListings, updateListing, setLoading } from '../../store/slices/listingSlice';
import { listingApi } from '../../services/api/listingApi';
import { LISTING_STATUSES } from '../../config/constants';
import DataTable from '../../components/data-display/DataTable';
import type { Column } from '../../components/data-display/DataTable';
import StatusBadge from '../../components/data-display/StatusBadge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Tabs from '../../components/ui/Tabs';
import ConfirmDialog from '../../components/feedback/ConfirmDialog';
import { showToast } from '../../components/feedback/Toast';
import type { Listing } from '../../types';
import { MdSearch, MdCheckCircle, MdCancel, MdStar, MdStarBorder } from 'react-icons/md';
import { format } from 'date-fns';

const statusTabs = [
  { key: 'all', label: 'All' },
  { key: LISTING_STATUSES.PENDING, label: 'Pending' },
  { key: LISTING_STATUSES.APPROVED, label: 'Approved' },
  { key: LISTING_STATUSES.REJECTED, label: 'Rejected' },
  { key: LISTING_STATUSES.DRAFT, label: 'Draft' },
  { key: LISTING_STATUSES.SUSPENDED, label: 'Suspended' },
];

const ListingListPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { listings, loading } = useAppSelector((state) => state.listing);

  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [confirmAction, setConfirmAction] = useState<{
    type: 'approve' | 'reject';
    listing: Listing;
  } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchListings = useCallback(async () => {
    dispatch(setLoading(true));
    try {
      const params: Record<string, unknown> = {};
      if (activeTab !== 'all') params.status = activeTab;
      if (search) params.search = search;
      const response = await listingApi.getAll(params);
      dispatch(setListings(response.data.data?.listings || []));
    } catch {
      showToast.error('Failed to load listings');
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch, activeTab, search]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const handleAction = async () => {
    if (!confirmAction) return;
    setActionLoading(true);
    try {
      let response;
      if (confirmAction.type === 'approve') {
        response = await listingApi.approve(confirmAction.listing._id);
      } else {
        response = await listingApi.reject(confirmAction.listing._id, 'Rejected by admin');
      }
      if (response?.data?.data) {
        dispatch(updateListing(response.data.data));
      }
      showToast.success(`Listing ${confirmAction.type}d successfully`);
      setConfirmAction(null);
      fetchListings();
    } catch {
      showToast.error(`Failed to ${confirmAction.type} listing`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleFeatured = async (listing: Listing) => {
    try {
      const response = await listingApi.toggleFeatured(listing._id);
      if (response?.data?.data) {
        dispatch(updateListing(response.data.data));
      }
      showToast.success(
        listing.isFeatured ? 'Listing unfeatured' : 'Listing featured'
      );
      fetchListings();
    } catch {
      showToast.error('Failed to update featured status');
    }
  };

  const columns: Column<Listing>[] = [
    {
      key: 'title',
      header: 'Title',
      sortable: true,
      accessor: (row) => (
        <div className="flex items-center gap-3">
          {row.images?.[0]?.url ? (
            <img
              src={row.images[0].url}
              alt={row.title}
              className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center flex-shrink-0">
              <span className="text-2xs text-neutral-300">IMG</span>
            </div>
          )}
          <span className="font-medium text-neutral-600 truncate max-w-[200px]">
            {row.title}
          </span>
        </div>
      ),
    },
    {
      key: 'vendor',
      header: 'Vendor',
      accessor: (row) => row.vendor?.businessName || 'N/A',
    },
    {
      key: 'category',
      header: 'Category',
      sortable: true,
      accessor: (row) => row.category?.name || 'N/A',
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      accessor: (row) => <StatusBadge status={row.status} type="listing" />,
    },
    {
      key: 'price',
      header: 'Price',
      sortable: true,
      accessor: (row) => (
        <span className="font-medium">
          {row.pricing?.currency || '$'}
          {row.pricing?.basePrice?.toLocaleString() || '0'}
          <span className="text-neutral-300 font-normal">/{row.pricing?.priceUnit || 'unit'}</span>
        </span>
      ),
    },
    {
      key: 'rating',
      header: 'Rating',
      sortable: true,
      accessor: (row) => (
        <div className="flex items-center gap-1">
          <MdStar className="w-4 h-4 text-warning-500" />
          <span>{row.averageRating?.toFixed(1) || '0.0'}</span>
        </div>
      ),
    },
    {
      key: 'featured',
      header: 'Featured',
      accessor: (row) => (
        <div onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => handleToggleFeatured(row)}
            className="p-1 rounded hover:bg-neutral-50 transition-colors"
          >
            {row.isFeatured ? (
              <MdStar className="w-5 h-5 text-warning-500" />
            ) : (
              <MdStarBorder className="w-5 h-5 text-neutral-300" />
            )}
          </button>
        </div>
      ),
    },
    {
      key: 'createdAt',
      header: 'Created',
      sortable: true,
      accessor: (row) => format(new Date(row.createdAt), 'MMM d, yyyy'),
    },
    {
      key: 'actions',
      header: 'Actions',
      accessor: (row) => (
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          {row.status === 'pending' && (
            <>
              <Button
                variant="ghost"
                size="sm"
                icon={<MdCheckCircle className="w-4 h-4 text-success-500" />}
                onClick={() => setConfirmAction({ type: 'approve', listing: row })}
              />
              <Button
                variant="ghost"
                size="sm"
                icon={<MdCancel className="w-4 h-4 text-error-500" />}
                onClick={() => setConfirmAction({ type: 'reject', listing: row })}
              />
            </>
          )}
        </div>
      ),
    },
  ];

  const filteredListings = listings.filter((l) => {
    if (search) {
      const q = search.toLowerCase();
      return (
        l.title.toLowerCase().includes(q) ||
        l.vendor?.businessName?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-600">Listing Management</h1>
        <p className="text-sm text-neutral-400 mt-0.5">Review and manage all listings</p>
      </div>

      {/* Status Tabs */}
      <Tabs tabs={statusTabs} activeTab={activeTab} onChange={(key) => { setActiveTab(key); setPage(1); }} />

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="w-80">
          <Input
            placeholder="Search listings..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<MdSearch className="w-4 h-4" />}
          />
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={filteredListings}
        loading={loading}
        emptyMessage="No listings found"
        onRowClick={(row) => navigate(`/listings/${row._id}`)}
        rowKey={(row) => row._id}
        currentPage={page}
        onPageChange={setPage}
        pageSize={10}
      />

      {/* Confirm Dialog */}
      {confirmAction && (
        <ConfirmDialog
          isOpen={!!confirmAction}
          onClose={() => setConfirmAction(null)}
          onConfirm={handleAction}
          title={`${confirmAction.type.charAt(0).toUpperCase() + confirmAction.type.slice(1)} Listing`}
          message={`Are you sure you want to ${confirmAction.type} "${confirmAction.listing.title}"?`}
          confirmLabel={confirmAction.type.charAt(0).toUpperCase() + confirmAction.type.slice(1)}
          variant={confirmAction.type === 'approve' ? 'primary' : 'danger'}
          loading={actionLoading}
        />
      )}
    </div>
  );
};

export default ListingListPage;
