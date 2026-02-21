import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setSelectedListing, updateListing, setLoading } from '../../store/slices/listingSlice';
import { listingApi } from '../../services/api/listingApi';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Tabs from '../../components/ui/Tabs';
import StatusBadge from '../../components/data-display/StatusBadge';
import EmptyState from '../../components/data-display/EmptyState';
import ConfirmDialog from '../../components/feedback/ConfirmDialog';
import LoadingSpinner from '../../components/feedback/LoadingSpinner';
import { showToast } from '../../components/feedback/Toast';
import {
  MdArrowBack,
  MdCheckCircle,
  MdCancel,
  MdStar,
  MdStarBorder,
  MdAttachMoney,
  MdCategory,
  MdStore,
  MdCalendarMonth,
  MdChevronLeft,
  MdChevronRight,
} from 'react-icons/md';

const ListingDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { selectedListing: listing, loading } = useAppSelector((state) => state.listing);

  const [activeTab, setActiveTab] = useState('details');
  const [currentImage, setCurrentImage] = useState(0);
  const [confirmAction, setConfirmAction] = useState<'approve' | 'reject' | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchListing = async () => {
      if (!id) return;
      dispatch(setLoading(true));
      try {
        const response = await listingApi.getAll({ _id: id });
        const listingData = Array.isArray(response.data.data)
          ? response.data.data[0]
          : response.data.data;
        dispatch(setSelectedListing(listingData || null));
      } catch {
        showToast.error('Failed to load listing details');
      } finally {
        dispatch(setLoading(false));
      }
    };
    fetchListing();

    return () => {
      dispatch(setSelectedListing(null));
    };
  }, [id, dispatch]);

  const handleAction = async () => {
    if (!confirmAction || !listing) return;
    setActionLoading(true);
    try {
      let response;
      if (confirmAction === 'approve') {
        response = await listingApi.approve(listing._id);
      } else {
        response = await listingApi.reject(listing._id, 'Rejected by admin');
      }
      if (response?.data?.data) {
        dispatch(setSelectedListing(response.data.data));
        dispatch(updateListing(response.data.data));
      }
      showToast.success(`Listing ${confirmAction}d successfully`);
      setConfirmAction(null);
    } catch {
      showToast.error(`Failed to ${confirmAction} listing`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleFeatured = async () => {
    if (!listing) return;
    try {
      const response = await listingApi.toggleFeatured(listing._id);
      if (response?.data?.data) {
        dispatch(setSelectedListing(response.data.data));
        dispatch(updateListing(response.data.data));
      }
      showToast.success(listing.isFeatured ? 'Listing unfeatured' : 'Listing featured');
    } catch {
      showToast.error('Failed to update featured status');
    }
  };

  if (loading || !listing) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" label="Loading listing details..." />
      </div>
    );
  }

  const images = listing.images || [];
  const tabs = [
    { key: 'details', label: 'Details' },
    { key: 'bookings', label: 'Bookings' },
    { key: 'reviews', label: 'Reviews', count: listing.totalReviews || 0 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/listings')} className="p-2 rounded-lg hover:bg-neutral-100 transition-colors">
          <MdArrowBack className="w-5 h-5 text-neutral-400" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-neutral-600">{listing.title}</h1>
          <p className="text-sm text-neutral-400 mt-0.5">Listing Details</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Image Gallery */}
        <div className="lg:col-span-2">
          <Card padding={false}>
            <div className="relative aspect-video bg-neutral-100 rounded-t-xl overflow-hidden">
              {images.length > 0 ? (
                <img
                  src={images[currentImage]?.url}
                  alt={listing.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-neutral-300">
                  No images available
                </div>
              )}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentImage((prev) => (prev > 0 ? prev - 1 : images.length - 1))}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow transition-colors"
                  >
                    <MdChevronLeft className="w-5 h-5 text-neutral-600" />
                  </button>
                  <button
                    onClick={() => setCurrentImage((prev) => (prev < images.length - 1 ? prev + 1 : 0))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow transition-colors"
                  >
                    <MdChevronRight className="w-5 h-5 text-neutral-600" />
                  </button>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {images.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentImage(idx)}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          idx === currentImage ? 'bg-white' : 'bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 p-3 overflow-x-auto">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImage(idx)}
                    className={`w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors ${
                      idx === currentImage ? 'border-primary-500' : 'border-transparent'
                    }`}
                  >
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Listing Info Sidebar */}
        <div className="space-y-4">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <StatusBadge status={listing.status} type="listing" />
              <button onClick={handleToggleFeatured} className="p-1 rounded hover:bg-neutral-50">
                {listing.isFeatured ? (
                  <MdStar className="w-5 h-5 text-warning-500" />
                ) : (
                  <MdStarBorder className="w-5 h-5 text-neutral-300" />
                )}
              </button>
            </div>

            <h3 className="text-lg font-bold text-neutral-600 mb-3">{listing.title}</h3>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-neutral-400">
                <MdAttachMoney className="w-4 h-4" />
                <span className="font-semibold text-neutral-600">
                  {listing.pricing?.currency || '$'}
                  {listing.pricing?.basePrice?.toLocaleString() || '0'}
                </span>
                <span>/ {listing.pricing?.priceUnit || 'unit'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-neutral-400">
                <MdCategory className="w-4 h-4" />
                <span>{listing.category?.name || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-neutral-400">
                <MdStore className="w-4 h-4" />
                <span>{listing.vendor?.businessName || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-neutral-400">
                <MdStar className="w-4 h-4 text-warning-500" />
                <span>
                  {listing.averageRating?.toFixed(1) || '0.0'} ({listing.totalReviews || 0} reviews)
                </span>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-neutral-100 flex flex-wrap gap-2">
              {listing.status === 'pending' && (
                <>
                  <Button
                    variant="primary"
                    size="sm"
                    fullWidth
                    icon={<MdCheckCircle className="w-4 h-4" />}
                    onClick={() => setConfirmAction('approve')}
                  >
                    Approve Listing
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    fullWidth
                    icon={<MdCancel className="w-4 h-4" />}
                    onClick={() => setConfirmAction('reject')}
                  >
                    Reject Listing
                  </Button>
                </>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab Content */}
      <div>
        {activeTab === 'details' && (
          <Card>
            <Card.Header title="Vendor Information" />
            <Card.Body>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-neutral-400 mb-1">Business Name</p>
                  <p className="text-sm text-neutral-600 font-medium">{listing.vendor?.businessName}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-400 mb-1">Category</p>
                  <p className="text-sm text-neutral-600 font-medium">{listing.category?.name}</p>
                </div>
              </div>
            </Card.Body>
          </Card>
        )}

        {activeTab === 'bookings' && (
          <EmptyState
            icon={<MdCalendarMonth />}
            title="Listing Bookings"
            description="View booking history for this listing"
            actionLabel="View All Bookings"
            onAction={() => navigate('/bookings')}
          />
        )}

        {activeTab === 'reviews' && (
          <EmptyState
            icon={<MdStar />}
            title="Listing Reviews"
            description="Reviews for this listing will appear here"
            actionLabel="View All Reviews"
            onAction={() => navigate('/reviews')}
          />
        )}
      </div>

      {/* Confirm Dialog */}
      {confirmAction && (
        <ConfirmDialog
          isOpen={!!confirmAction}
          onClose={() => setConfirmAction(null)}
          onConfirm={handleAction}
          title={`${confirmAction.charAt(0).toUpperCase() + confirmAction.slice(1)} Listing`}
          message={`Are you sure you want to ${confirmAction} "${listing.title}"?`}
          confirmLabel={confirmAction.charAt(0).toUpperCase() + confirmAction.slice(1)}
          variant={confirmAction === 'approve' ? 'primary' : 'danger'}
          loading={actionLoading}
        />
      )}
    </div>
  );
};

export default ListingDetailPage;
