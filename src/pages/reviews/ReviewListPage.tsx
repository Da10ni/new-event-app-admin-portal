import { useState, useEffect, useCallback } from 'react';
import DataTable from '../../components/data-display/DataTable';
import type { Column } from '../../components/data-display/DataTable';
import Input from '../../components/ui/Input';
import Tabs from '../../components/ui/Tabs';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/feedback/ConfirmDialog';
import { showToast } from '../../components/feedback/Toast';
import { MdSearch, MdStar, MdDelete, MdFlag, MdVisibility, MdVisibilityOff, MdSort } from 'react-icons/md';
import { format } from 'date-fns';
import { reviewApi } from '../../services/api/reviewApi';

interface Review {
  _id: string;
  listing: { _id: string; title: string };
  client: { _id: string; firstName: string; lastName: string };
  vendor: { _id: string; businessName: string };
  rating: number;
  title?: string;
  comment: string;
  detailedRatings?: {
    quality?: number;
    communication?: number;
    valueForMoney?: number;
    punctuality?: number;
  };
  vendorReply?: { comment: string; repliedAt: string };
  isVisible: boolean;
  isReported: boolean;
  createdAt: string;
}

const filterTabs = [
  { key: 'all', label: 'All Reviews' },
  { key: 'reported', label: 'Reported' },
  { key: 'high', label: '4-5 Stars' },
  { key: 'low', label: '1-2 Stars' },
  { key: 'hidden', label: 'Hidden' },
];

const RatingStars = ({ rating }: { rating: number }) => (
  <div className="flex items-center gap-0.5">
    {Array.from({ length: 5 }).map((_, idx) => (
      <MdStar
        key={idx}
        className={`w-4 h-4 ${idx < rating ? 'text-warning-500' : 'text-neutral-200'}`}
      />
    ))}
  </div>
);

const ReviewListPage = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Review | null>(null);
  const [sortByRating, setSortByRating] = useState<'desc' | 'asc' | ''>('desc');

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = { page, limit: 10 };

      if (activeTab === 'reported') params.isReported = true;
      if (activeTab === 'high') params['rating[gte]'] = 4;
      if (activeTab === 'low') params['rating[lte]'] = 2;
      if (activeTab === 'hidden') params.isVisible = false;

      if (sortByRating === 'desc') params.sort = '-rating,-createdAt';
      else if (sortByRating === 'asc') params.sort = 'rating,-createdAt';
      else params.sort = '-createdAt';

      if (search.trim()) params.search = search.trim();

      const res = await reviewApi.getAll(params);
      const data = res.data?.data;
      setReviews(data?.reviews || []);
      setTotalItems(res.data?.meta?.total || 0);
    } catch {
      showToast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  }, [page, activeTab, sortByRating, search]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await reviewApi.delete(deleteTarget._id);
      showToast.success('Review deleted successfully');
      setDeleteTarget(null);
      fetchReviews();
    } catch {
      showToast.error('Failed to delete review');
    }
  };

  const handleToggleVisibility = async (review: Review) => {
    try {
      await reviewApi.toggleVisibility(review._id);
      showToast.success(review.isVisible ? 'Review hidden' : 'Review made visible');
      fetchReviews();
    } catch {
      showToast.error('Failed to update review visibility');
    }
  };

  const cycleSortByRating = () => {
    setSortByRating((prev) => {
      if (prev === '') return 'desc';
      if (prev === 'desc') return 'asc';
      return '';
    });
    setPage(1);
  };

  const columns: Column<Review>[] = [
    {
      key: 'listing',
      header: 'Listing',
      sortable: true,
      accessor: (row) => (
        <span className="font-medium text-neutral-600 truncate max-w-[180px] block">
          {row.listing?.title || 'N/A'}
        </span>
      ),
    },
    {
      key: 'client',
      header: 'Client',
      accessor: (row) => `${row.client?.firstName || ''} ${row.client?.lastName || ''}`,
    },
    {
      key: 'rating',
      header: 'Rating',
      sortable: true,
      accessor: (row) => <RatingStars rating={row.rating} />,
    },
    {
      key: 'comment',
      header: 'Comment',
      accessor: (row) => (
        <span className="text-sm text-neutral-400 truncate max-w-[250px] block">
          {row.comment}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Date',
      sortable: true,
      accessor: (row) => format(new Date(row.createdAt), 'MMM d, yyyy'),
    },
    {
      key: 'status',
      header: 'Status',
      accessor: (row) => (
        <div className="flex flex-col gap-1">
          {row.isReported && (
            <span className="flex items-center gap-1 text-error-500 text-xs font-medium">
              <MdFlag className="w-3.5 h-3.5" /> Reported
            </span>
          )}
          {!row.isVisible && (
            <span className="flex items-center gap-1 text-neutral-400 text-xs font-medium">
              <MdVisibilityOff className="w-3.5 h-3.5" /> Hidden
            </span>
          )}
          {!row.isReported && row.isVisible && (
            <span className="text-xs text-neutral-300">-</span>
          )}
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      accessor: (row) => (
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="sm"
            icon={<MdVisibility className="w-4 h-4 text-neutral-400" />}
            onClick={() => setSelectedReview(row)}
          />
          <Button
            variant="ghost"
            size="sm"
            icon={
              row.isVisible
                ? <MdVisibilityOff className="w-4 h-4 text-warning-500" />
                : <MdVisibility className="w-4 h-4 text-success-500" />
            }
            onClick={() => handleToggleVisibility(row)}
          />
          <Button
            variant="ghost"
            size="sm"
            icon={<MdDelete className="w-4 h-4 text-error-500" />}
            onClick={() => setDeleteTarget(row)}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-600">Review Moderation</h1>
        <p className="text-sm text-neutral-400 mt-0.5">Monitor and moderate user reviews</p>
      </div>

      {/* Filter Tabs */}
      <Tabs tabs={filterTabs} activeTab={activeTab} onChange={(key) => { setActiveTab(key); setPage(1); }} />

      {/* Search + Sort */}
      <div className="flex items-center gap-4">
        <div className="w-80">
          <Input
            placeholder="Search reviews..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            icon={<MdSearch className="w-4 h-4" />}
          />
        </div>
        <Button
          variant={sortByRating ? 'outline' : 'ghost'}
          size="sm"
          onClick={cycleSortByRating}
        >
          <MdSort className="w-4 h-4 mr-1" />
          {sortByRating === 'desc' ? 'Highest First' : sortByRating === 'asc' ? 'Lowest First' : 'Sort by Rating'}
        </Button>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={reviews}
        emptyMessage="No reviews found"
        rowKey={(row) => row._id}
        currentPage={page}
        onPageChange={setPage}
        pageSize={10}
        totalItems={totalItems}
        serverSidePagination
        loading={loading}
      />

      {/* Review Detail Modal */}
      {selectedReview && (
        <Modal
          isOpen={!!selectedReview}
          onClose={() => setSelectedReview(null)}
          title="Review Details"
          size="md"
        >
          <div className="space-y-4">
            <div>
              <p className="text-xs text-neutral-400 mb-1">Listing</p>
              <p className="text-sm font-medium text-neutral-600">{selectedReview.listing?.title}</p>
            </div>
            <div>
              <p className="text-xs text-neutral-400 mb-1">Client</p>
              <p className="text-sm text-neutral-600">
                {selectedReview.client?.firstName} {selectedReview.client?.lastName}
              </p>
            </div>
            <div>
              <p className="text-xs text-neutral-400 mb-1">Vendor</p>
              <p className="text-sm text-neutral-600">{selectedReview.vendor?.businessName}</p>
            </div>
            <div>
              <p className="text-xs text-neutral-400 mb-1">Rating</p>
              <RatingStars rating={selectedReview.rating} />
            </div>
            {selectedReview.title && (
              <div>
                <p className="text-xs text-neutral-400 mb-1">Title</p>
                <p className="text-sm font-medium text-neutral-600">{selectedReview.title}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-neutral-400 mb-1">Comment</p>
              <p className="text-sm text-neutral-500 leading-relaxed">{selectedReview.comment}</p>
            </div>
            {selectedReview.detailedRatings && (
              <div>
                <p className="text-xs text-neutral-400 mb-2">Detailed Ratings</p>
                <div className="grid grid-cols-2 gap-2">
                  {selectedReview.detailedRatings.quality != null && (
                    <div className="text-sm text-neutral-500">Quality: {selectedReview.detailedRatings.quality}/5</div>
                  )}
                  {selectedReview.detailedRatings.communication != null && (
                    <div className="text-sm text-neutral-500">Communication: {selectedReview.detailedRatings.communication}/5</div>
                  )}
                  {selectedReview.detailedRatings.valueForMoney != null && (
                    <div className="text-sm text-neutral-500">Value: {selectedReview.detailedRatings.valueForMoney}/5</div>
                  )}
                  {selectedReview.detailedRatings.punctuality != null && (
                    <div className="text-sm text-neutral-500">Punctuality: {selectedReview.detailedRatings.punctuality}/5</div>
                  )}
                </div>
              </div>
            )}
            {selectedReview.vendorReply && (
              <div className="p-3 bg-primary-50 border border-primary-200 rounded-lg">
                <p className="text-xs text-neutral-400 mb-1">Vendor Reply</p>
                <p className="text-sm text-neutral-500">{selectedReview.vendorReply.comment}</p>
                <p className="text-xs text-neutral-300 mt-1">
                  {format(new Date(selectedReview.vendorReply.repliedAt), 'MMMM d, yyyy h:mm a')}
                </p>
              </div>
            )}
            <div>
              <p className="text-xs text-neutral-400 mb-1">Date</p>
              <p className="text-sm text-neutral-600">
                {format(new Date(selectedReview.createdAt), 'MMMM d, yyyy h:mm a')}
              </p>
            </div>
            <div className="flex gap-2">
              {selectedReview.isReported && (
                <div className="p-3 bg-error-50 border border-error-200 rounded-lg flex-1">
                  <p className="text-sm text-error-500 font-medium flex items-center gap-2">
                    <MdFlag className="w-4 h-4" /> This review has been reported
                  </p>
                </div>
              )}
              {!selectedReview.isVisible && (
                <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg flex-1">
                  <p className="text-sm text-neutral-500 font-medium flex items-center gap-2">
                    <MdVisibilityOff className="w-4 h-4" /> This review is hidden
                  </p>
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirm */}
      {deleteTarget && (
        <ConfirmDialog
          isOpen={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          title="Delete Review"
          message="Are you sure you want to delete this review? This action cannot be undone."
          confirmLabel="Delete"
          variant="danger"
        />
      )}
    </div>
  );
};

export default ReviewListPage;
