import Badge from '../ui/Badge';

type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info' | 'purple' | 'orange';

type StatusType = 'booking' | 'vendor' | 'listing' | 'general';

const bookingStatusMap: Record<string, { variant: BadgeVariant; label: string }> = {
  inquiry: { variant: 'info', label: 'Inquiry' },
  pending: { variant: 'warning', label: 'Pending' },
  confirmed: { variant: 'success', label: 'Confirmed' },
  rejected: { variant: 'error', label: 'Rejected' },
  cancelled: { variant: 'default', label: 'Cancelled' },
  completed: { variant: 'purple', label: 'Completed' },
  no_show: { variant: 'orange', label: 'No Show' },
};

const vendorStatusMap: Record<string, { variant: BadgeVariant; label: string }> = {
  pending: { variant: 'warning', label: 'Pending' },
  approved: { variant: 'success', label: 'Approved' },
  rejected: { variant: 'error', label: 'Rejected' },
  suspended: { variant: 'orange', label: 'Suspended' },
};

const listingStatusMap: Record<string, { variant: BadgeVariant; label: string }> = {
  draft: { variant: 'default', label: 'Draft' },
  pending: { variant: 'warning', label: 'Pending' },
  approved: { variant: 'success', label: 'Approved' },
  rejected: { variant: 'error', label: 'Rejected' },
  suspended: { variant: 'orange', label: 'Suspended' },
  archived: { variant: 'default', label: 'Archived' },
};

const statusMaps: Record<StatusType, Record<string, { variant: BadgeVariant; label: string }>> = {
  booking: bookingStatusMap,
  vendor: vendorStatusMap,
  listing: listingStatusMap,
  general: {
    active: { variant: 'success', label: 'Active' },
    inactive: { variant: 'default', label: 'Inactive' },
    pending: { variant: 'warning', label: 'Pending' },
    approved: { variant: 'success', label: 'Approved' },
    rejected: { variant: 'error', label: 'Rejected' },
  },
};

interface StatusBadgeProps {
  status: string;
  type?: StatusType;
  dot?: boolean;
  className?: string;
}

const StatusBadge = ({
  status,
  type = 'general',
  dot = true,
  className = '',
}: StatusBadgeProps) => {
  const map = statusMaps[type];
  const safeStatus = status || 'unknown';
  const statusInfo = map[safeStatus.toLowerCase()] || {
    variant: 'default' as BadgeVariant,
    label: safeStatus.charAt(0).toUpperCase() + safeStatus.slice(1),
  };

  return (
    <Badge variant={statusInfo.variant} dot={dot} className={className}>
      {statusInfo.label}
    </Badge>
  );
};

export default StatusBadge;
