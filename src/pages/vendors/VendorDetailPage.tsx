import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setSelectedVendor, updateVendor, setLoading } from '../../store/slices/vendorSlice';
import { vendorApi } from '../../services/api/vendorApi';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Tabs from '../../components/ui/Tabs';
import Avatar from '../../components/ui/Avatar';
import StatusBadge from '../../components/data-display/StatusBadge';
import Timeline from '../../components/data-display/Timeline';
import EmptyState from '../../components/data-display/EmptyState';
import ConfirmDialog from '../../components/feedback/ConfirmDialog';
import LoadingSpinner from '../../components/feedback/LoadingSpinner';
import { showToast } from '../../components/feedback/Toast';
import {
  MdArrowBack,
  MdCheckCircle,
  MdCancel,
  MdBlock,
  MdEmail,
  MdPhone,
  MdLocationOn,
  MdStar,
  MdStore,
  MdCalendarMonth,
  MdGridView,
} from 'react-icons/md';

const mockActivity = [
  { id: '1', title: 'Vendor account created', description: 'Registration submitted for review', timestamp: '2024-01-10T08:00:00Z', type: 'info' as const },
  { id: '2', title: 'Documents uploaded', description: 'Business license and ID verified', timestamp: '2024-01-11T10:30:00Z', type: 'info' as const },
  { id: '3', title: 'Account approved', description: 'Approved by Admin', timestamp: '2024-01-12T14:00:00Z', type: 'success' as const },
  { id: '4', title: 'First listing published', description: 'Grand Ballroom listing went live', timestamp: '2024-01-13T09:00:00Z', type: 'success' as const },
];

const VendorDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { selectedVendor: vendor, loading } = useAppSelector((state) => state.vendor);

  const [activeTab, setActiveTab] = useState('overview');
  const [confirmAction, setConfirmAction] = useState<'approve' | 'reject' | 'suspend' | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchVendor = async () => {
      if (!id) return;
      dispatch(setLoading(true));
      try {
        const response = await vendorApi.getAll({ _id: id });
        const vendorData = Array.isArray(response.data.data)
          ? response.data.data[0]
          : response.data.data;
        dispatch(setSelectedVendor(vendorData || null));
      } catch {
        showToast.error('Failed to load vendor details');
      } finally {
        dispatch(setLoading(false));
      }
    };
    fetchVendor();

    return () => {
      dispatch(setSelectedVendor(null));
    };
  }, [id, dispatch]);

  const handleAction = async () => {
    if (!confirmAction || !vendor) return;
    setActionLoading(true);
    try {
      let response;
      switch (confirmAction) {
        case 'approve':
          response = await vendorApi.approve(vendor._id);
          break;
        case 'reject':
          response = await vendorApi.reject(vendor._id, 'Rejected by admin');
          break;
        case 'suspend':
          response = await vendorApi.suspend(vendor._id);
          break;
      }
      if (response?.data?.data) {
        dispatch(setSelectedVendor(response.data.data));
        dispatch(updateVendor(response.data.data));
      }
      showToast.success(`Vendor ${confirmAction}d successfully`);
      setConfirmAction(null);
    } catch {
      showToast.error(`Failed to ${confirmAction} vendor`);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading || !vendor) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" label="Loading vendor details..." />
      </div>
    );
  }

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'listings', label: 'Listings', count: vendor.totalListings || 0 },
    { key: 'bookings', label: 'Bookings', count: vendor.totalBookings || 0 },
    { key: 'reviews', label: 'Reviews', count: vendor.totalReviews || 0 },
    { key: 'activity', label: 'Activity' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/vendors')} className="p-2 rounded-lg hover:bg-neutral-100 transition-colors">
          <MdArrowBack className="w-5 h-5 text-neutral-400" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-neutral-600">{vendor.businessName}</h1>
          <p className="text-sm text-neutral-400 mt-0.5">Vendor Details</p>
        </div>
      </div>

      {/* Vendor Info Card */}
      <Card>
        <div className="flex flex-col md:flex-row gap-6">
          <Avatar name={vendor.businessName} size="xl" />
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <h2 className="text-xl font-bold text-neutral-600">{vendor.businessName}</h2>
              <StatusBadge status={vendor.status} type="vendor" />
            </div>
            {vendor.description && (
              <p className="text-sm text-neutral-400 mb-4 max-w-2xl">{vendor.description}</p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="flex items-center gap-2 text-sm text-neutral-400">
                <MdEmail className="w-4 h-4" />
                <span>{vendor.userId?.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-neutral-400">
                <MdPhone className="w-4 h-4" />
                <span>{vendor.userId?.phone || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-neutral-400">
                <MdLocationOn className="w-4 h-4" />
                <span>{vendor.address?.city ? `${vendor.address.city}, ${vendor.address.country}` : 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-neutral-400">
                <MdStar className="w-4 h-4 text-warning-500" />
                <span>{vendor.averageRating?.toFixed(1) || '0.0'} ({vendor.totalReviews || 0} reviews)</span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 self-start">
            {vendor.status === 'pending' && (
              <>
                <Button
                  variant="primary"
                  size="sm"
                  icon={<MdCheckCircle className="w-4 h-4" />}
                  onClick={() => setConfirmAction('approve')}
                >
                  Approve
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  icon={<MdCancel className="w-4 h-4" />}
                  onClick={() => setConfirmAction('reject')}
                >
                  Reject
                </Button>
              </>
            )}
            {vendor.status === 'approved' && (
              <Button
                variant="outline"
                size="sm"
                icon={<MdBlock className="w-4 h-4" />}
                onClick={() => setConfirmAction('suspend')}
              >
                Suspend
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
            <MdGridView className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <p className="text-xs text-neutral-400">Listings</p>
            <p className="text-lg font-bold text-neutral-600">{vendor.totalListings || 0}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-success-50 flex items-center justify-center">
            <MdCalendarMonth className="w-5 h-5 text-success-500" />
          </div>
          <div>
            <p className="text-xs text-neutral-400">Bookings</p>
            <p className="text-lg font-bold text-neutral-600">{vendor.totalBookings || 0}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-warning-50 flex items-center justify-center">
            <MdStar className="w-5 h-5 text-warning-500" />
          </div>
          <div>
            <p className="text-xs text-neutral-400">Avg Rating</p>
            <p className="text-lg font-bold text-neutral-600">{vendor.averageRating?.toFixed(1) || '0.0'}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
            <MdStore className="w-5 h-5 text-purple-500" />
          </div>
          <div>
            <p className="text-xs text-neutral-400">Categories</p>
            <p className="text-lg font-bold text-neutral-600">{vendor.categories?.length || 0}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab Content */}
      <div>
        {activeTab === 'overview' && (
          <Card>
            <Card.Header title="Business Information" />
            <Card.Body>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-neutral-400 mb-1">Business Name</p>
                  <p className="text-sm text-neutral-600 font-medium">{vendor.businessName}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-400 mb-1">Owner</p>
                  <p className="text-sm text-neutral-600 font-medium">
                    {vendor.userId?.firstName} {vendor.userId?.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-neutral-400 mb-1">Categories</p>
                  <p className="text-sm text-neutral-600">
                    {vendor.categories?.map((c) => c.name).join(', ') || 'None'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-neutral-400 mb-1">Availability</p>
                  <p className="text-sm text-neutral-600">
                    {vendor.isAvailable ? 'Available' : 'Unavailable'}
                  </p>
                </div>
              </div>
            </Card.Body>
          </Card>
        )}

        {activeTab === 'listings' && (
          <EmptyState
            icon={<MdGridView />}
            title="Vendor Listings"
            description="View and manage this vendor's listings from the Listings page"
            actionLabel="View Listings"
            onAction={() => navigate('/listings')}
          />
        )}

        {activeTab === 'bookings' && (
          <EmptyState
            icon={<MdCalendarMonth />}
            title="Vendor Bookings"
            description="View this vendor's booking history from the Bookings page"
            actionLabel="View Bookings"
            onAction={() => navigate('/bookings')}
          />
        )}

        {activeTab === 'reviews' && (
          <EmptyState
            icon={<MdStar />}
            title="Vendor Reviews"
            description="View reviews for this vendor's listings"
            actionLabel="View Reviews"
            onAction={() => navigate('/reviews')}
          />
        )}

        {activeTab === 'activity' && (
          <Card>
            <Card.Header title="Activity Timeline" />
            <Card.Body>
              <Timeline events={mockActivity} />
            </Card.Body>
          </Card>
        )}
      </div>

      {/* Confirm Dialog */}
      {confirmAction && (
        <ConfirmDialog
          isOpen={!!confirmAction}
          onClose={() => setConfirmAction(null)}
          onConfirm={handleAction}
          title={`${confirmAction.charAt(0).toUpperCase() + confirmAction.slice(1)} Vendor`}
          message={`Are you sure you want to ${confirmAction} "${vendor.businessName}"?`}
          confirmLabel={confirmAction.charAt(0).toUpperCase() + confirmAction.slice(1)}
          variant={confirmAction === 'approve' ? 'primary' : 'danger'}
          loading={actionLoading}
        />
      )}
    </div>
  );
};

export default VendorDetailPage;
