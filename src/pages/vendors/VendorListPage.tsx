import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setVendors, updateVendor, setLoading } from '../../store/slices/vendorSlice';
import { vendorApi } from '../../services/api/vendorApi';
import { VENDOR_STATUSES } from '../../config/constants';
import DataTable from '../../components/data-display/DataTable';
import type { Column } from '../../components/data-display/DataTable';
import StatusBadge from '../../components/data-display/StatusBadge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Tabs from '../../components/ui/Tabs';
import ConfirmDialog from '../../components/feedback/ConfirmDialog';
import { showToast } from '../../components/feedback/Toast';
import type { Vendor } from '../../types';
import { MdSearch, MdCheckCircle, MdCancel, MdBlock, MdStar } from 'react-icons/md';
import { format } from 'date-fns';

const statusTabs = [
  { key: 'all', label: 'All' },
  { key: VENDOR_STATUSES.PENDING, label: 'Pending' },
  { key: VENDOR_STATUSES.APPROVED, label: 'Approved' },
  { key: VENDOR_STATUSES.REJECTED, label: 'Rejected' },
  { key: VENDOR_STATUSES.SUSPENDED, label: 'Suspended' },
];

const VendorListPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { vendors, loading } = useAppSelector((state) => state.vendor);

  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [confirmAction, setConfirmAction] = useState<{
    type: 'approve' | 'reject' | 'suspend';
    vendor: Vendor;
  } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchVendors = useCallback(async () => {
    dispatch(setLoading(true));
    try {
      const params: Record<string, unknown> = {};
      if (activeTab !== 'all') params.status = activeTab;
      if (search) params.search = search;
      const response = await vendorApi.getAll(params);
      dispatch(setVendors(response.data.data?.vendors || []));
    } catch {
      showToast.error('Failed to load vendors');
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch, activeTab, search]);

  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  const handleAction = async () => {
    if (!confirmAction) return;
    setActionLoading(true);
    try {
      let response;
      switch (confirmAction.type) {
        case 'approve':
          response = await vendorApi.approve(confirmAction.vendor._id);
          break;
        case 'reject':
          response = await vendorApi.reject(confirmAction.vendor._id, 'Rejected by admin');
          break;
        case 'suspend':
          response = await vendorApi.suspend(confirmAction.vendor._id);
          break;
      }
      if (response?.data?.data) {
        dispatch(updateVendor(response.data.data));
      }
      showToast.success(`Vendor ${confirmAction.type}d successfully`);
      setConfirmAction(null);
      fetchVendors();
    } catch {
      showToast.error(`Failed to ${confirmAction.type} vendor`);
    } finally {
      setActionLoading(false);
    }
  };

  const columns: Column<Vendor>[] = [
    {
      key: 'businessName',
      header: 'Business Name',
      sortable: true,
      accessor: (row) => (
        <span className="font-medium text-neutral-600">{row.businessName}</span>
      ),
    },
    {
      key: 'owner',
      header: 'Owner',
      accessor: (row) => (
        <div>
          <p className="text-sm">{row.userId?.firstName} {row.userId?.lastName}</p>
          <p className="text-xs text-neutral-300">{row.userId?.email}</p>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      accessor: (row) =>
        row.categories?.map((c) => c.name).join(', ') || 'N/A',
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      accessor: (row) => <StatusBadge status={row.status} type="vendor" />,
    },
    {
      key: 'rating',
      header: 'Rating',
      sortable: true,
      accessor: (row) => (
        <div className="flex items-center gap-1">
          <MdStar className="w-4 h-4 text-warning-500" />
          <span>{row.averageRating?.toFixed(1) || '0.0'}</span>
          <span className="text-neutral-300">({row.totalReviews || 0})</span>
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
                onClick={() => setConfirmAction({ type: 'approve', vendor: row })}
              />
              <Button
                variant="ghost"
                size="sm"
                icon={<MdCancel className="w-4 h-4 text-error-500" />}
                onClick={() => setConfirmAction({ type: 'reject', vendor: row })}
              />
            </>
          )}
          {row.status === 'approved' && (
            <Button
              variant="ghost"
              size="sm"
              icon={<MdBlock className="w-4 h-4 text-warning-500" />}
              onClick={() => setConfirmAction({ type: 'suspend', vendor: row })}
            />
          )}
        </div>
      ),
    },
  ];

  const filteredVendors = vendors.filter((v) => {
    if (search) {
      const q = search.toLowerCase();
      return (
        v.businessName.toLowerCase().includes(q) ||
        v.userId?.email?.toLowerCase().includes(q) ||
        `${v.userId?.firstName} ${v.userId?.lastName}`.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-600">Vendor Management</h1>
        <p className="text-sm text-neutral-400 mt-0.5">Manage and approve vendor applications</p>
      </div>

      {/* Status Tabs */}
      <Tabs tabs={statusTabs} activeTab={activeTab} onChange={(key) => { setActiveTab(key); setPage(1); }} />

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="w-80">
          <Input
            placeholder="Search vendors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<MdSearch className="w-4 h-4" />}
          />
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={filteredVendors}
        loading={loading}
        emptyMessage="No vendors found"
        onRowClick={(row) => navigate(`/vendors/${row._id}`)}
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
          title={`${confirmAction.type.charAt(0).toUpperCase() + confirmAction.type.slice(1)} Vendor`}
          message={`Are you sure you want to ${confirmAction.type} "${confirmAction.vendor.businessName}"? This action can be changed later.`}
          confirmLabel={confirmAction.type.charAt(0).toUpperCase() + confirmAction.type.slice(1)}
          variant={confirmAction.type === 'approve' ? 'primary' : 'danger'}
          loading={actionLoading}
        />
      )}
    </div>
  );
};

export default VendorListPage;
