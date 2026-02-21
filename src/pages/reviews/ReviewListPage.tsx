import { useState } from 'react';
import DataTable from '../../components/data-display/DataTable';
import type { Column } from '../../components/data-display/DataTable';
import Input from '../../components/ui/Input';
import Tabs from '../../components/ui/Tabs';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/feedback/ConfirmDialog';
import { showToast } from '../../components/feedback/Toast';
import { MdSearch, MdStar, MdDelete, MdFlag, MdVisibility } from 'react-icons/md';
import { format } from 'date-fns';

interface Review {
  _id: string;
  listing: { _id: string; title: string };
  client: { _id: string; firstName: string; lastName: string };
  rating: number;
  comment: string;
  isReported: boolean;
  createdAt: string;
}

const mockReviews: Review[] = [
  { _id: '1', listing: { _id: 'l1', title: 'Grand Ballroom' }, client: { _id: 'c1', firstName: 'Sarah', lastName: 'Johnson' }, rating: 5, comment: 'Amazing venue! Everything was perfect for our wedding reception. The staff was incredibly helpful and professional.', isReported: false, createdAt: '2024-01-15T10:00:00Z' },
  { _id: '2', listing: { _id: 'l2', title: 'Garden Party Setup' }, client: { _id: 'c2', firstName: 'Michael', lastName: 'Chen' }, rating: 4, comment: 'Great outdoor setup, beautiful decorations. Minor issue with the lighting but overall fantastic.', isReported: false, createdAt: '2024-01-14T15:00:00Z' },
  { _id: '3', listing: { _id: 'l3', title: 'Premium Photography' }, client: { _id: 'c3', firstName: 'Emily', lastName: 'Davis' }, rating: 2, comment: 'Photographer was late and missed several key moments. Not worth the premium price.', isReported: true, createdAt: '2024-01-13T09:00:00Z' },
  { _id: '4', listing: { _id: 'l4', title: 'Live Band Performance' }, client: { _id: 'c4', firstName: 'James', lastName: 'Wilson' }, rating: 5, comment: 'The band was incredible! They had everyone dancing all night. Highly recommend for any event.', isReported: false, createdAt: '2024-01-12T14:00:00Z' },
  { _id: '5', listing: { _id: 'l5', title: 'Elegant Catering' }, client: { _id: 'c5', firstName: 'Lisa', lastName: 'Brown' }, rating: 1, comment: 'Terrible experience. Food was cold and service was rude. This is spam content that should be removed.', isReported: true, createdAt: '2024-01-11T11:00:00Z' },
  { _id: '6', listing: { _id: 'l1', title: 'Grand Ballroom' }, client: { _id: 'c6', firstName: 'Robert', lastName: 'Taylor' }, rating: 4, comment: 'Beautiful venue with great amenities. Parking could be better.', isReported: false, createdAt: '2024-01-10T16:00:00Z' },
];

const filterTabs = [
  { key: 'all', label: 'All Reviews' },
  { key: 'reported', label: 'Reported' },
  { key: 'high', label: '4-5 Stars' },
  { key: 'low', label: '1-2 Stars' },
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
  const [reviews] = useState<Review[]>(mockReviews);
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [deleteReview, setDeleteReview] = useState<Review | null>(null);

  const filteredReviews = reviews.filter((r) => {
    if (activeTab === 'reported') return r.isReported;
    if (activeTab === 'high') return r.rating >= 4;
    if (activeTab === 'low') return r.rating <= 2;
    if (search) {
      const q = search.toLowerCase();
      return (
        r.listing.title.toLowerCase().includes(q) ||
        `${r.client.firstName} ${r.client.lastName}`.toLowerCase().includes(q) ||
        r.comment.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleDelete = () => {
    if (!deleteReview) return;
    showToast.success('Review deleted successfully');
    setDeleteReview(null);
  };

  const columns: Column<Review>[] = [
    {
      key: 'listing',
      header: 'Listing',
      sortable: true,
      accessor: (row) => (
        <span className="font-medium text-neutral-600 truncate max-w-[180px] block">
          {row.listing.title}
        </span>
      ),
    },
    {
      key: 'client',
      header: 'Client',
      accessor: (row) => `${row.client.firstName} ${row.client.lastName}`,
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
      key: 'reported',
      header: 'Reported',
      accessor: (row) =>
        row.isReported ? (
          <span className="flex items-center gap-1 text-error-500 text-xs font-medium">
            <MdFlag className="w-3.5 h-3.5" /> Reported
          </span>
        ) : (
          <span className="text-xs text-neutral-300">-</span>
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
            icon={<MdDelete className="w-4 h-4 text-error-500" />}
            onClick={() => setDeleteReview(row)}
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

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="w-80">
          <Input
            placeholder="Search reviews..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<MdSearch className="w-4 h-4" />}
          />
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={filteredReviews}
        emptyMessage="No reviews found"
        rowKey={(row) => row._id}
        currentPage={page}
        onPageChange={setPage}
        pageSize={10}
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
              <p className="text-sm font-medium text-neutral-600">{selectedReview.listing.title}</p>
            </div>
            <div>
              <p className="text-xs text-neutral-400 mb-1">Client</p>
              <p className="text-sm text-neutral-600">
                {selectedReview.client.firstName} {selectedReview.client.lastName}
              </p>
            </div>
            <div>
              <p className="text-xs text-neutral-400 mb-1">Rating</p>
              <RatingStars rating={selectedReview.rating} />
            </div>
            <div>
              <p className="text-xs text-neutral-400 mb-1">Comment</p>
              <p className="text-sm text-neutral-500 leading-relaxed">{selectedReview.comment}</p>
            </div>
            <div>
              <p className="text-xs text-neutral-400 mb-1">Date</p>
              <p className="text-sm text-neutral-600">
                {format(new Date(selectedReview.createdAt), 'MMMM d, yyyy h:mm a')}
              </p>
            </div>
            {selectedReview.isReported && (
              <div className="p-3 bg-error-50 border border-error-200 rounded-lg">
                <p className="text-sm text-error-500 font-medium flex items-center gap-2">
                  <MdFlag className="w-4 h-4" /> This review has been reported
                </p>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Delete Confirm */}
      {deleteReview && (
        <ConfirmDialog
          isOpen={!!deleteReview}
          onClose={() => setDeleteReview(null)}
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
