import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { userApi } from '../../services/api/userApi';
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
  MdEmail,
  MdPhone,
  MdCalendarToday,
  MdToggleOn,
  MdToggleOff,
  MdCalendarMonth,
  MdStar,
} from 'react-icons/md';
import { format } from 'date-fns';

interface UserDetail {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: string;
  isActive: boolean;
  avatar?: { url: string };
  createdAt: string;
}

const mockActivity = [
  { id: '1', title: 'Account created', description: 'User registered on the platform', timestamp: '2024-01-05T10:00:00Z', type: 'info' as const },
  { id: '2', title: 'First booking made', description: 'Booked Grand Ballroom for wedding', timestamp: '2024-01-08T14:30:00Z', type: 'success' as const },
  { id: '3', title: 'Review submitted', description: 'Left a 5-star review for Elite Venues', timestamp: '2024-01-15T09:00:00Z', type: 'info' as const },
];

const UserDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [showToggle, setShowToggle] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const response = await userApi.getAll({ _id: id });
        const users = response.data.data?.users || response.data.data;
        const userData = Array.isArray(users) ? users[0] : users;
        setUser(userData || null);
      } catch {
        showToast.error('Failed to load user details');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  const handleToggleStatus = async () => {
    if (!user) return;
    setActionLoading(true);
    try {
      await userApi.toggleStatus(user._id);
      setUser({ ...user, isActive: !user.isActive });
      showToast.success(`User ${user.isActive ? 'deactivated' : 'activated'} successfully`);
      setShowToggle(false);
    } catch {
      showToast.error('Failed to update user status');
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateStr: string | undefined, pattern = 'MMM d, yyyy') => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return 'N/A';
    return format(date, pattern);
  };

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" label="Loading user details..." />
      </div>
    );
  }

  const tabs = [
    { key: 'profile', label: 'Profile' },
    { key: 'bookings', label: 'Bookings' },
    { key: 'reviews', label: 'Reviews' },
    { key: 'activity', label: 'Activity' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/users')} className="p-2 rounded-lg hover:bg-neutral-100 transition-colors">
          <MdArrowBack className="w-5 h-5 text-neutral-400" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-neutral-600">
            {user.firstName} {user.lastName}
          </h1>
          <p className="text-sm text-neutral-400 mt-0.5">User Details</p>
        </div>
      </div>

      {/* User Info Card */}
      <Card>
        <div className="flex flex-col md:flex-row gap-6">
          <Avatar
            src={user.avatar?.url}
            name={`${user.firstName} ${user.lastName}`}
            size="xl"
          />
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <h2 className="text-xl font-bold text-neutral-600">
                {user.firstName} {user.lastName}
              </h2>
              <StatusBadge status={user.isActive ? 'active' : 'inactive'} type="general" />
              <span className="px-2 py-0.5 rounded text-xs font-medium bg-neutral-100 text-neutral-500 capitalize">
                {user.role}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="flex items-center gap-2 text-sm text-neutral-400">
                <MdEmail className="w-4 h-4" />
                <span>{user.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-neutral-400">
                <MdPhone className="w-4 h-4" />
                <span>{user.phone || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-neutral-400">
                <MdCalendarToday className="w-4 h-4" />
                <span>Joined {formatDate(user.createdAt)}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2 self-start">
            <Button
              variant={user.isActive ? 'danger' : 'primary'}
              size="sm"
              icon={
                user.isActive ? (
                  <MdToggleOff className="w-4 h-4" />
                ) : (
                  <MdToggleOn className="w-4 h-4" />
                )
              }
              onClick={() => setShowToggle(true)}
            >
              {user.isActive ? 'Deactivate' : 'Activate'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab Content */}
      <div>
        {activeTab === 'profile' && (
          <Card>
            <Card.Header title="Profile Information" />
            <Card.Body>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-neutral-400 mb-1">Full Name</p>
                  <p className="text-sm text-neutral-600 font-medium">
                    {user.firstName} {user.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-neutral-400 mb-1">Email</p>
                  <p className="text-sm text-neutral-600 font-medium">{user.email}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-400 mb-1">Phone</p>
                  <p className="text-sm text-neutral-600 font-medium">{user.phone || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-400 mb-1">Role</p>
                  <p className="text-sm text-neutral-600 font-medium capitalize">{user.role}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-400 mb-1">Account Status</p>
                  <StatusBadge status={user.isActive ? 'active' : 'inactive'} type="general" />
                </div>
                <div>
                  <p className="text-xs text-neutral-400 mb-1">Member Since</p>
                  <p className="text-sm text-neutral-600 font-medium">
                    {formatDate(user.createdAt, 'MMMM d, yyyy')}
                  </p>
                </div>
              </div>
            </Card.Body>
          </Card>
        )}

        {activeTab === 'bookings' && (
          <EmptyState
            icon={<MdCalendarMonth />}
            title="User Bookings"
            description="View booking history for this user"
            actionLabel="View All Bookings"
            onAction={() => navigate('/bookings')}
          />
        )}

        {activeTab === 'reviews' && (
          <EmptyState
            icon={<MdStar />}
            title="User Reviews"
            description="Reviews submitted by this user"
            actionLabel="View All Reviews"
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

      {/* Toggle Confirm */}
      {showToggle && (
        <ConfirmDialog
          isOpen={showToggle}
          onClose={() => setShowToggle(false)}
          onConfirm={handleToggleStatus}
          title={user.isActive ? 'Deactivate User' : 'Activate User'}
          message={`Are you sure you want to ${user.isActive ? 'deactivate' : 'activate'} ${user.firstName} ${user.lastName}?`}
          confirmLabel={user.isActive ? 'Deactivate' : 'Activate'}
          variant={user.isActive ? 'danger' : 'primary'}
          loading={actionLoading}
        />
      )}
    </div>
  );
};

export default UserDetailPage;
