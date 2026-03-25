import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { bookingApi } from '../../services/api/bookingApi';
import Card from '../../components/ui/Card';
import StatusBadge from '../../components/data-display/StatusBadge';
import LoadingSpinner from '../../components/feedback/LoadingSpinner';
import { showToast } from '../../components/feedback/Toast';
import type { Booking } from '../../types';
import {
  MdArrowBack,
  MdPerson,
  MdStore,
  MdCalendarMonth,
  MdAttachMoney,
  MdEmail,
  MdConfirmationNumber,
  MdPhone,
  MdLocationOn,
  MdGroup,
  MdEventNote,
  MdMessage,
  MdPayment,
  MdReceipt,
  MdCheckCircle,
  MdCancel,
  MdSchedule,
  MdRefresh,
  MdStar,
  MdStarHalf,
  MdStarOutline,
} from 'react-icons/md';
import { reviewApi } from '../../services/api/reviewApi';
import { format, isValid } from 'date-fns';

const formatDate = (dateStr: string | undefined, fmt: string): string => {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr);
  return isValid(d) ? format(d, fmt) : 'N/A';
};

const getPaymentStatusColor = (status?: string) => {
  switch (status) {
    case 'succeeded': return 'text-green-600 bg-green-50';
    case 'refunded': return 'text-blue-600 bg-blue-50';
    case 'failed': return 'text-red-600 bg-red-50';
    case 'processing': return 'text-amber-600 bg-amber-50';
    default: return 'text-neutral-500 bg-neutral-50';
  }
};

interface ReviewData {
  _id: string; rating: number; comment: string; title?: string;
  detailedRatings?: { quality?: number; communication?: number; valueForMoney?: number; punctuality?: number };
  vendorReply?: { comment: string; repliedAt: string };
  client: { _id: string; firstName: string; lastName: string; email?: string; avatar?: { url: string } };
  createdAt: string;
}

const renderStars = (rating: number) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (rating >= i) {
      stars.push(<MdStar key={i} className="w-4 h-4 text-amber-400" />);
    } else if (rating >= i - 0.5) {
      stars.push(<MdStarHalf key={i} className="w-4 h-4 text-amber-400" />);
    } else {
      stars.push(<MdStarOutline key={i} className="w-4 h-4 text-neutral-300" />);
    }
  }
  return <div className="flex items-center gap-0.5">{stars}</div>;
};

const BookingDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviewData, setReviewData] = useState<ReviewData | null>(null);

  useEffect(() => {
    const fetchBooking = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const response = await bookingApi.getById(id);
        const data = response.data?.data;
        setBooking(data?.booking || data || null);
      } catch {
        showToast.error('Failed to load booking details');
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [id]);

  useEffect(() => {
    if (booking?.isReviewed && id) {
      reviewApi.getAll({ booking: id })
        .then((res) => {
          const reviews = res.data?.data?.reviews;
          setReviewData(reviews?.[0] || null);
        })
        .catch(() => setReviewData(null));
    }
  }, [booking?.isReviewed, id]);

  if (loading || !booking) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" label="Loading booking details..." />
      </div>
    );
  }

  const currency = booking.pricingSnapshot?.currency || 'PKR';
  const totalAmount = booking.pricingSnapshot?.totalAmount || 0;
  const basePrice = booking.pricingSnapshot?.basePrice || totalAmount;
  const isPaid = booking.paymentStatus === 'succeeded';
  const isRefunded = booking.paymentStatus === 'refunded';

  // Build real timeline from booking data
  const timelineEvents: Array<{ icon: React.ReactNode; title: string; description: string; time: string; color: string }> = [];

  timelineEvents.push({
    icon: <MdSchedule className="w-4 h-4" />,
    title: 'Booking Created',
    description: 'Client submitted a booking request',
    time: formatDate(booking.createdAt, 'MMM d, yyyy h:mm a'),
    color: 'bg-blue-500',
  });

  if (['accepted', 'confirmed', 'completed'].includes(booking.status)) {
    timelineEvents.push({
      icon: <MdCheckCircle className="w-4 h-4" />,
      title: 'Vendor Accepted',
      description: 'Vendor accepted the booking',
      time: '',
      color: 'bg-green-500',
    });
  }

  if (['confirmed', 'completed'].includes(booking.status)) {
    timelineEvents.push({
      icon: <MdCheckCircle className="w-4 h-4" />,
      title: 'Confirmed',
      description: 'Booking has been confirmed',
      time: '',
      color: 'bg-green-500',
    });
  }

  if (isPaid || isRefunded) {
    timelineEvents.push({
      icon: <MdPayment className="w-4 h-4" />,
      title: 'Payment Received',
      description: `Full payment of ${currency} ${totalAmount.toLocaleString()} received`,
      time: formatDate(booking.paidAt, 'MMM d, yyyy h:mm a'),
      color: 'bg-green-500',
    });
  }

  if (isRefunded) {
    timelineEvents.push({
      icon: <MdRefresh className="w-4 h-4" />,
      title: 'Payment Refunded',
      description: `${currency} ${totalAmount.toLocaleString()} refunded to client`,
      time: formatDate(booking.refundedAt, 'MMM d, yyyy h:mm a'),
      color: 'bg-blue-500',
    });
  }

  if (booking.status === 'cancelled') {
    timelineEvents.push({
      icon: <MdCancel className="w-4 h-4" />,
      title: 'Booking Cancelled',
      description: 'This booking was cancelled',
      time: '',
      color: 'bg-red-500',
    });
  }

  if (booking.status === 'rejected') {
    timelineEvents.push({
      icon: <MdCancel className="w-4 h-4" />,
      title: 'Booking Rejected',
      description: 'Vendor rejected the booking',
      time: '',
      color: 'bg-red-500',
    });
  }

  if (booking.status === 'completed') {
    timelineEvents.push({
      icon: <MdCheckCircle className="w-4 h-4" />,
      title: 'Completed',
      description: 'Event has been completed',
      time: '',
      color: 'bg-primary-500',
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/bookings')} className="p-2 rounded-lg hover:bg-neutral-100 transition-colors">
          <MdArrowBack className="w-5 h-5 text-neutral-400" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-neutral-600">
              {booking.bookingNumber}
            </h1>
            <StatusBadge status={booking.status} type="booking" />
          </div>
          <p className="text-sm text-neutral-400 mt-0.5">Booking Details</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Booking Info */}
          <Card>
            <Card.Header title="Booking Information" />
            <Card.Body>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
                    <MdConfirmationNumber className="w-5 h-5 text-primary-500" />
                  </div>
                  <div>
                    <p className="text-xs text-neutral-400">Booking Number</p>
                    <p className="text-sm font-medium text-neutral-600">{booking.bookingNumber}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-success-50 flex items-center justify-center">
                    <MdCalendarMonth className="w-5 h-5 text-success-500" />
                  </div>
                  <div>
                    <p className="text-xs text-neutral-400">Event Date</p>
                    <p className="text-sm font-medium text-neutral-600">
                      {formatDate(booking.eventDate, 'EEEE, MMMM d, yyyy')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-warning-50 flex items-center justify-center">
                    <MdAttachMoney className="w-5 h-5 text-warning-500" />
                  </div>
                  <div>
                    <p className="text-xs text-neutral-400">Total Amount</p>
                    <p className="text-sm font-medium text-neutral-600">
                      {currency} {totalAmount.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                    <MdCalendarMonth className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-xs text-neutral-400">Booked On</p>
                    <p className="text-sm font-medium text-neutral-600">
                      {formatDate(booking.createdAt, 'MMM d, yyyy h:mm a')}
                    </p>
                  </div>
                </div>
                {booking.guestCount && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                      <MdGroup className="w-5 h-5 text-purple-500" />
                    </div>
                    <div>
                      <p className="text-xs text-neutral-400">Guests</p>
                      <p className="text-sm font-medium text-neutral-600">{booking.guestCount} guests</p>
                    </div>
                  </div>
                )}
                {booking.eventType && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-pink-50 flex items-center justify-center">
                      <MdEventNote className="w-5 h-5 text-pink-500" />
                    </div>
                    <div>
                      <p className="text-xs text-neutral-400">Event Type</p>
                      <p className="text-sm font-medium text-neutral-600">{booking.eventType}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Client Message */}
              {booking.clientMessage && (
                <div className="mt-4 pt-4 border-t border-neutral-100">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-neutral-50 flex items-center justify-center shrink-0">
                      <MdMessage className="w-5 h-5 text-neutral-400" />
                    </div>
                    <div>
                      <p className="text-xs text-neutral-400 mb-1">Client Message</p>
                      <p className="text-sm text-neutral-600 bg-neutral-50 rounded-lg p-3">{booking.clientMessage}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Vendor Response */}
              {booking.vendorResponse && (
                <div className="mt-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
                      <MdMessage className="w-5 h-5 text-green-500" />
                    </div>
                    <div>
                      <p className="text-xs text-neutral-400 mb-1">Vendor Response</p>
                      <p className="text-sm text-neutral-600 bg-green-50 rounded-lg p-3">{booking.vendorResponse}</p>
                    </div>
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>

          {/* Client Info */}
          <Card>
            <Card.Header title="Client Information" />
            <Card.Body>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary-500 flex items-center justify-center">
                  <MdPerson className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-neutral-600">
                    {booking.client?.firstName} {booking.client?.lastName}
                  </p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-neutral-400 mt-1">
                    <div className="flex items-center gap-1.5">
                      <MdEmail className="w-4 h-4" />
                      <span>{booking.client?.email}</span>
                    </div>
                    {booking.client?.phone && (
                      <div className="flex items-center gap-1.5">
                        <MdPhone className="w-4 h-4" />
                        <span>{booking.client.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* Vendor Info */}
          <Card>
            <Card.Header title="Vendor Information" />
            <Card.Body>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-secondary-500 flex items-center justify-center">
                  <MdStore className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-neutral-600">
                    {booking.vendor?.businessName}
                  </p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-neutral-400 mt-1">
                    <div className="flex items-center gap-1.5">
                      <MdReceipt className="w-4 h-4" />
                      <span>Listing: {booking.listing?.title}</span>
                    </div>
                    {booking.listing?.address && (
                      <div className="flex items-center gap-1.5">
                        <MdLocationOn className="w-4 h-4" />
                        <span>{booking.listing.address.city}, {booking.listing.address.country}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* Transaction Details (only if paid/refunded) */}
          {(isPaid || isRefunded) && (
            <Card>
              <Card.Header title="Transaction Details" />
              <Card.Body>
                <div className="space-y-3 text-sm">
                  {booking.transactionId && (
                    <div>
                      <p className="text-xs text-neutral-400 mb-0.5">Transaction ID</p>
                      <p className="font-mono text-xs text-neutral-600 break-all">{booking.transactionId}</p>
                    </div>
                  )}
                  {booking.paymentIntentId && (
                    <div>
                      <p className="text-xs text-neutral-400 mb-0.5">Payment Intent</p>
                      <p className="font-mono text-xs text-neutral-600 break-all">{booking.paymentIntentId}</p>
                    </div>
                  )}
                  {booking.paidAt && (
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Paid On</span>
                      <span className="text-neutral-600">{formatDate(booking.paidAt, 'MMM d, yyyy h:mm a')}</span>
                    </div>
                  )}
                  {isRefunded && booking.refundId && (
                    <>
                      <div className="border-t border-neutral-100 pt-3">
                        <p className="text-xs text-neutral-400 mb-0.5">Refund ID</p>
                        <p className="font-mono text-xs text-neutral-600 break-all">{booking.refundId}</p>
                      </div>
                      {booking.refundedAt && (
                        <div className="flex justify-between">
                          <span className="text-neutral-400">Refunded On</span>
                          <span className="text-neutral-600">{formatDate(booking.refundedAt, 'MMM d, yyyy h:mm a')}</span>
                        </div>
                      )}
                    </>
                  )}
                  <div className="border-t border-neutral-100 pt-3 flex items-center gap-1.5 text-[10px] text-neutral-300">
                    <MdPayment className="w-3 h-3" />
                    <span>Processed via Stripe</span>
                  </div>
                </div>
              </Card.Body>
            </Card>
          )}
        </div>

        {/* Right Side */}
        <div className="space-y-6">
          {/* Status Timeline */}
          <Card>
            <Card.Header title="Status Timeline" />
            <Card.Body>
              <div className="space-y-0">
                {timelineEvents.map((event, idx) => (
                  <div key={idx} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full ${event.color} flex items-center justify-center text-white shrink-0`}>
                        {event.icon}
                      </div>
                      {idx < timelineEvents.length - 1 && (
                        <div className="w-0.5 h-8 bg-neutral-200" />
                      )}
                    </div>
                    <div className="pb-4">
                      <p className="text-sm font-medium text-neutral-600">{event.title}</p>
                      <p className="text-xs text-neutral-400">{event.description}</p>
                      {event.time && event.time !== 'N/A' && (
                        <p className="text-xs text-neutral-300 mt-0.5">{event.time}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>

          {/* Payment Summary */}
          <Card>
            <Card.Header title="Payment Summary" />
            <Card.Body>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-400">Base Price</span>
                  <span className="text-neutral-600 font-medium">
                    {currency} {basePrice.toLocaleString()}
                  </span>
                </div>
                <div className="border-t border-neutral-100 pt-3 flex justify-between text-sm">
                  <span className="font-semibold text-neutral-600">Total</span>
                  <span className="font-bold text-neutral-600">
                    {currency} {totalAmount.toLocaleString()}
                  </span>
                </div>

                {/* Payment Status */}
                {booking.paymentStatus && (
                  <div className="border-t border-neutral-100 pt-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-neutral-400">Payment Status</span>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${getPaymentStatusColor(booking.paymentStatus)}`}>
                        {booking.paymentStatus}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>

          {/* Client Review */}
          <Card>
            <Card.Header title="Client Review" />
            <Card.Body>
              {booking.isReviewed && reviewData ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    {renderStars(reviewData.rating)}
                    <span className="text-xs text-neutral-400">
                      {formatDate(reviewData.createdAt, 'MMM d, yyyy')}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-primary-500 flex items-center justify-center">
                      <MdPerson className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-neutral-600">
                      {reviewData.client?.firstName} {reviewData.client?.lastName}
                    </span>
                  </div>

                  {reviewData.title && (
                    <p className="text-sm font-semibold text-neutral-600">{reviewData.title}</p>
                  )}

                  <p className="text-sm text-neutral-500 leading-relaxed whitespace-pre-wrap">
                    {reviewData.comment}
                  </p>

                  {reviewData.detailedRatings && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {reviewData.detailedRatings.quality != null && (
                        <span className="text-[11px] bg-neutral-100 text-neutral-500 px-2 py-0.5 rounded-full">
                          Quality: {reviewData.detailedRatings.quality}/5
                        </span>
                      )}
                      {reviewData.detailedRatings.communication != null && (
                        <span className="text-[11px] bg-neutral-100 text-neutral-500 px-2 py-0.5 rounded-full">
                          Communication: {reviewData.detailedRatings.communication}/5
                        </span>
                      )}
                      {reviewData.detailedRatings.valueForMoney != null && (
                        <span className="text-[11px] bg-neutral-100 text-neutral-500 px-2 py-0.5 rounded-full">
                          Value: {reviewData.detailedRatings.valueForMoney}/5
                        </span>
                      )}
                      {reviewData.detailedRatings.punctuality != null && (
                        <span className="text-[11px] bg-neutral-100 text-neutral-500 px-2 py-0.5 rounded-full">
                          Punctuality: {reviewData.detailedRatings.punctuality}/5
                        </span>
                      )}
                    </div>
                  )}

                  {reviewData.vendorReply && (
                    <div className="mt-2 pl-3 border-l-2 border-primary-200 bg-primary-50 rounded-r-lg p-3">
                      <p className="text-xs font-medium text-neutral-600 mb-1">Vendor Reply</p>
                      <p className="text-sm text-neutral-500">{reviewData.vendorReply.comment}</p>
                      <p className="text-xs text-neutral-400 mt-1">
                        {formatDate(reviewData.vendorReply.repliedAt, 'MMM d, yyyy')}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-400">Reviewed</span>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    booking.isReviewed ? 'bg-green-50 text-green-600' : 'bg-neutral-100 text-neutral-400'
                  }`}>
                    {booking.isReviewed ? 'Yes' : 'No'}
                  </span>
                </div>
              )}
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BookingDetailPage;