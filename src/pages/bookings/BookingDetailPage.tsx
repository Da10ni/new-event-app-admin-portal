import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { bookingApi } from '../../services/api/bookingApi';
import Card from '../../components/ui/Card';
import StatusBadge from '../../components/data-display/StatusBadge';
import Timeline from '../../components/data-display/Timeline';
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
} from 'react-icons/md';
import { format } from 'date-fns';

const mockStatusTimeline = [
  { id: '1', title: 'Booking created', description: 'Client submitted a booking request', timestamp: '2024-01-10T10:00:00Z', type: 'info' as const },
  { id: '2', title: 'Vendor confirmed', description: 'Vendor accepted the booking', timestamp: '2024-01-10T14:30:00Z', type: 'success' as const },
  { id: '3', title: 'Payment received', description: 'Full payment of $2,500 received', timestamp: '2024-01-11T09:00:00Z', type: 'success' as const },
];

const BookingDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooking = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const response = await bookingApi.getAll({ _id: id });
        const bookingData = Array.isArray(response.data.data)
          ? response.data.data[0]
          : response.data.data;
        setBooking(bookingData || null);
      } catch {
        showToast.error('Failed to load booking details');
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [id]);

  if (loading || !booking) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" label="Loading booking details..." />
      </div>
    );
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
                      {booking.eventDate
                        ? format(new Date(booking.eventDate), 'MMMM d, yyyy')
                        : 'N/A'}
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
                      ${booking.pricingSnapshot?.totalAmount?.toLocaleString() || '0'}
                      <span className="text-neutral-300 ml-1">{booking.pricingSnapshot?.currency}</span>
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
                      {format(new Date(booking.createdAt), 'MMM d, yyyy h:mm a')}
                    </p>
                  </div>
                </div>
              </div>
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
                <div>
                  <p className="font-medium text-neutral-600">
                    {booking.client?.firstName} {booking.client?.lastName}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-neutral-400">
                    <MdEmail className="w-4 h-4" />
                    <span>{booking.client?.email}</span>
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
                  <p className="text-sm text-neutral-400">
                    Listing: {booking.listing?.title}
                  </p>
                </div>
              </div>
            </Card.Body>
          </Card>
        </div>

        {/* Right Side */}
        <div className="space-y-6">
          {/* Status Timeline */}
          <Card>
            <Card.Header title="Status Timeline" />
            <Card.Body>
              <Timeline events={mockStatusTimeline} />
            </Card.Body>
          </Card>

          {/* Payment Info */}
          <Card>
            <Card.Header title="Payment Summary" />
            <Card.Body>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-400">Subtotal</span>
                  <span className="text-neutral-600 font-medium">
                    ${booking.pricingSnapshot?.totalAmount?.toLocaleString() || '0'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-400">Platform Fee</span>
                  <span className="text-neutral-600 font-medium">
                    ${Math.round((booking.pricingSnapshot?.totalAmount || 0) * 0.1).toLocaleString()}
                  </span>
                </div>
                <div className="border-t border-neutral-100 pt-3 flex justify-between text-sm">
                  <span className="font-semibold text-neutral-600">Total</span>
                  <span className="font-bold text-neutral-600">
                    ${booking.pricingSnapshot?.totalAmount?.toLocaleString() || '0'}
                  </span>
                </div>
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BookingDetailPage;
