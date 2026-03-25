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
  MdLocationOn,
  MdPeople,
  MdVisibility,
  MdBookmarkBorder,
} from 'react-icons/md';

const formatPriceUnit = (unit?: string) => {
  const map: Record<string, string> = {
    per_event: 'per event',
    per_day: 'per day',
    per_night: 'per night',
    per_hour: 'per hour',
    per_person: 'per person',
    per_plate: 'per plate',
    package: 'package',
  };
  return map[unit || ''] || unit || 'per event';
};

const formatDate = (dateString?: string) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-PK', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

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
        let listingData = null;
        try {
          const response = await listingApi.getById(id);
          listingData = response.data.data?.listing || response.data.data;
        } catch {
          // Fallback to getAll with filter
          const response = await listingApi.getAll({ _id: id });
          const data = response.data.data;
          const listings = data?.listings || (Array.isArray(data) ? data : []);
          listingData = listings[0] || null;
        }
        dispatch(setSelectedListing(listingData));
        if (!listingData) showToast.error('Listing not found');
      } catch (err: any) {
        console.error('Listing fetch error:', err);
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
      const updated = response?.data?.data?.listing || response?.data?.data;
      if (updated) {
        dispatch(setSelectedListing(updated));
        dispatch(updateListing(updated));
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
      const updated = response?.data?.data?.listing || response?.data?.data;
      if (updated) {
        dispatch(setSelectedListing(updated));
        dispatch(updateListing(updated));
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

  const address = listing.address;
  const addressParts = [address?.street, address?.area, address?.city, address?.state, address?.country].filter(Boolean);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/listings')} className="p-2 rounded-lg hover:bg-neutral-100 transition-colors">
          <MdArrowBack className="w-5 h-5 text-neutral-400" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-neutral-600">{listing.title || 'Untitled Listing'}</h1>
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
                    {images.map((_: unknown, idx: number) => (
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
                {images.map((img: { url: string }, idx: number) => (
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
                <MdAttachMoney className="w-4 h-4 flex-shrink-0" />
                <span className="font-semibold text-neutral-600">
                  {listing.pricing?.currency || 'PKR'}{' '}
                  {listing.pricing?.basePrice?.toLocaleString() || '0'}
                </span>
                <span>/ {formatPriceUnit(listing.pricing?.priceUnit)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-neutral-400">
                <MdCategory className="w-4 h-4 flex-shrink-0" />
                <span>{listing.category?.name || 'Uncategorized'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-neutral-400">
                <MdStore className="w-4 h-4 flex-shrink-0" />
                <span>{listing.vendor?.businessName || 'N/A'}</span>
              </div>
              {addressParts.length > 0 && (
                <div className="flex items-center gap-2 text-sm text-neutral-400">
                  <MdLocationOn className="w-4 h-4 flex-shrink-0" />
                  <span>{addressParts.join(', ')}</span>
                </div>
              )}
              {((listing.capacity?.min ?? 0) > 0 || (listing.capacity?.max ?? 0) > 0) && (
                <div className="flex items-center gap-2 text-sm text-neutral-400">
                  <MdPeople className="w-4 h-4 flex-shrink-0" />
                  <span>
                    {(listing.capacity?.min ?? 0) > 0 && (listing.capacity?.max ?? 0) > 0
                      ? `${listing.capacity?.min} - ${listing.capacity?.max} guests`
                      : (listing.capacity?.max ?? 0) > 0
                      ? `Up to ${listing.capacity?.max} guests`
                      : `Min ${listing.capacity?.min} guests`}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-neutral-400">
                <MdStar className="w-4 h-4 text-warning-500 flex-shrink-0" />
                <span>
                  {listing.averageRating?.toFixed(1) || '0.0'} ({listing.totalReviews || 0} reviews)
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-neutral-400">
                <MdVisibility className="w-4 h-4 flex-shrink-0" />
                <span>{listing.viewCount || 0} views</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-neutral-400">
                <MdBookmarkBorder className="w-4 h-4 flex-shrink-0" />
                <span>{listing.totalBookings || 0} bookings</span>
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
          <div className="space-y-6">
            {/* Description */}
            {listing.description && (
              <Card>
                <Card.Header title="Description" />
                <Card.Body>
                  <p className="text-sm text-neutral-500 leading-relaxed whitespace-pre-line">
                    {listing.description}
                  </p>
                </Card.Body>
              </Card>
            )}

            {/* Vendor & Category Info */}
            <Card>
              <Card.Header title="Vendor Information" />
              <Card.Body>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-neutral-400 mb-1">Business Name</p>
                    <p className="text-sm text-neutral-600 font-medium">{listing.vendor?.businessName || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-400 mb-1">Category</p>
                    <p className="text-sm text-neutral-600 font-medium">{listing.category?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-400 mb-1">Created</p>
                    <p className="text-sm text-neutral-600 font-medium">{formatDate(listing.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-400 mb-1">Last Updated</p>
                    <p className="text-sm text-neutral-600 font-medium">{formatDate(listing.updatedAt)}</p>
                  </div>
                </div>
              </Card.Body>
            </Card>

            {/* Pricing */}
            <Card>
              <Card.Header title="Pricing" />
              <Card.Body>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-neutral-400 mb-1">Base Price</p>
                    <p className="text-sm text-neutral-600 font-semibold">
                      {listing.pricing?.currency || 'PKR'} {listing.pricing?.basePrice?.toLocaleString() || '0'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-400 mb-1">Price Unit</p>
                    <p className="text-sm text-neutral-600 font-medium capitalize">
                      {formatPriceUnit(listing.pricing?.priceUnit)}
                    </p>
                  </div>
                  {(listing.pricing?.maxPrice ?? 0) > 0 && (
                    <div>
                      <p className="text-xs text-neutral-400 mb-1">Max Price</p>
                      <p className="text-sm text-neutral-600 font-medium">
                        {listing.pricing?.currency || 'PKR'} {listing.pricing?.maxPrice?.toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>

                {/* Packages */}
                {listing.pricing?.packages && listing.pricing.packages.length > 0 && (
                  <div className="mt-5 pt-4 border-t border-neutral-100">
                    <p className="text-sm font-semibold text-neutral-600 mb-3">Packages</p>
                    <div className="space-y-3">
                      {listing.pricing.packages.map((pkg: { name: string; description?: string; price: number; includes?: string[] }, idx: number) => (
                        <div key={idx} className="p-3 bg-neutral-50 rounded-lg">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-sm font-semibold text-neutral-600">{pkg.name}</p>
                            <p className="text-sm font-bold text-primary-600">
                              {listing.pricing?.currency || 'PKR'} {pkg.price?.toLocaleString()}
                            </p>
                          </div>
                          {pkg.description && (
                            <p className="text-xs text-neutral-400 mb-1">{pkg.description}</p>
                          )}
                          {pkg.includes && pkg.includes.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {pkg.includes.map((item: string, i: number) => (
                                <span key={i} className="text-xs bg-white px-2 py-0.5 rounded-full text-neutral-500 border border-neutral-200">
                                  {item}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card.Body>
            </Card>

            {/* Location */}
            {addressParts.length > 0 && (
              <Card>
                <Card.Header title="Location" />
                <Card.Body>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {address?.street && (
                      <div>
                        <p className="text-xs text-neutral-400 mb-1">Street</p>
                        <p className="text-sm text-neutral-600 font-medium">{address.street}</p>
                      </div>
                    )}
                    {address?.area && (
                      <div>
                        <p className="text-xs text-neutral-400 mb-1">Area</p>
                        <p className="text-sm text-neutral-600 font-medium">{address.area}</p>
                      </div>
                    )}
                    {address?.city && (
                      <div>
                        <p className="text-xs text-neutral-400 mb-1">City</p>
                        <p className="text-sm text-neutral-600 font-medium">{address.city}</p>
                      </div>
                    )}
                    {address?.state && (
                      <div>
                        <p className="text-xs text-neutral-400 mb-1">State</p>
                        <p className="text-sm text-neutral-600 font-medium">{address.state}</p>
                      </div>
                    )}
                    {address?.country && (
                      <div>
                        <p className="text-xs text-neutral-400 mb-1">Country</p>
                        <p className="text-sm text-neutral-600 font-medium">{address.country}</p>
                      </div>
                    )}
                    {address?.zipCode && (
                      <div>
                        <p className="text-xs text-neutral-400 mb-1">Zip Code</p>
                        <p className="text-sm text-neutral-600 font-medium">{address.zipCode}</p>
                      </div>
                    )}
                  </div>
                </Card.Body>
              </Card>
            )}

            {/* Amenities & Tags */}
            {((listing.amenities && listing.amenities.length > 0) || (listing.tags && listing.tags.length > 0)) && (
              <Card>
                <Card.Header title="Amenities & Tags" />
                <Card.Body>
                  {listing.amenities && listing.amenities.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs text-neutral-400 mb-2">Amenities</p>
                      <div className="flex flex-wrap gap-2">
                        {listing.amenities.map((amenity: string, idx: number) => (
                          <span key={idx} className="text-xs bg-primary-50 text-primary-600 px-3 py-1 rounded-full font-medium">
                            {amenity}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {listing.tags && listing.tags.length > 0 && (
                    <div>
                      <p className="text-xs text-neutral-400 mb-2">Tags</p>
                      <div className="flex flex-wrap gap-2">
                        {listing.tags.map((tag: string, idx: number) => (
                          <span key={idx} className="text-xs bg-neutral-100 text-neutral-500 px-3 py-1 rounded-full font-medium">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </Card.Body>
              </Card>
            )}

            {/* Statistics */}
            <Card>
              <Card.Header title="Statistics" />
              <Card.Body>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-neutral-50 rounded-lg">
                    <p className="text-2xl font-bold text-neutral-600">{listing.viewCount || 0}</p>
                    <p className="text-xs text-neutral-400 mt-1">Views</p>
                  </div>
                  <div className="text-center p-3 bg-neutral-50 rounded-lg">
                    <p className="text-2xl font-bold text-neutral-600">{listing.totalBookings || 0}</p>
                    <p className="text-xs text-neutral-400 mt-1">Bookings</p>
                  </div>
                  <div className="text-center p-3 bg-neutral-50 rounded-lg">
                    <p className="text-2xl font-bold text-neutral-600">{listing.totalReviews || 0}</p>
                    <p className="text-xs text-neutral-400 mt-1">Reviews</p>
                  </div>
                  <div className="text-center p-3 bg-neutral-50 rounded-lg">
                    <p className="text-2xl font-bold text-warning-500">{listing.averageRating?.toFixed(1) || '0.0'}</p>
                    <p className="text-xs text-neutral-400 mt-1">Avg Rating</p>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </div>
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
