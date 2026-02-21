import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { userApi } from '../../services/api/userApi';
import DataTable from '../../components/data-display/DataTable';
import type { Column } from '../../components/data-display/DataTable';
import StatusBadge from '../../components/data-display/StatusBadge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Avatar from '../../components/ui/Avatar';
import ConfirmDialog from '../../components/feedback/ConfirmDialog';
import LoadingSpinner from '../../components/feedback/LoadingSpinner';
import { showToast } from '../../components/feedback/Toast';
import { MdSearch, MdToggleOn, MdToggleOff } from 'react-icons/md';
import { format } from 'date-fns';

interface UserItem {
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

const UserListPage = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [toggleUser, setToggleUser] = useState<UserItem | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = {};
      if (search) params.search = search;
      const response = await userApi.getAll(params);
      setUsers(response.data.data?.users || []);
    } catch {
      showToast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleToggleStatus = async () => {
    if (!toggleUser) return;
    setActionLoading(true);
    try {
      await userApi.toggleStatus(toggleUser._id);
      setUsers((prev) =>
        prev.map((u) =>
          u._id === toggleUser._id ? { ...u, isActive: !u.isActive } : u
        )
      );
      showToast.success(`User ${toggleUser.isActive ? 'deactivated' : 'activated'} successfully`);
      setToggleUser(null);
    } catch {
      showToast.error('Failed to update user status');
    } finally {
      setActionLoading(false);
    }
  };

  const columns: Column<UserItem>[] = [
    {
      key: 'name',
      header: 'Name',
      sortable: true,
      accessor: (row) => (
        <div className="flex items-center gap-3">
          <Avatar
            src={row.avatar?.url}
            name={`${row.firstName} ${row.lastName}`}
            size="sm"
          />
          <div>
            <p className="font-medium text-neutral-600">
              {row.firstName} {row.lastName}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'email',
      header: 'Email',
      sortable: true,
      accessor: (row) => row.email,
    },
    {
      key: 'phone',
      header: 'Phone',
      accessor: (row) => row.phone || 'N/A',
    },
    {
      key: 'role',
      header: 'Role',
      sortable: true,
      accessor: (row) => (
        <span className="capitalize text-sm">{row.role}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      accessor: (row) => (
        <StatusBadge
          status={row.isActive ? 'active' : 'inactive'}
          type="general"
        />
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
        <div onClick={(e) => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="sm"
            icon={
              row.isActive ? (
                <MdToggleOn className="w-5 h-5 text-success-500" />
              ) : (
                <MdToggleOff className="w-5 h-5 text-neutral-300" />
              )
            }
            onClick={() => setToggleUser(row)}
          />
        </div>
      ),
    },
  ];

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" label="Loading users..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-600">User Management</h1>
        <p className="text-sm text-neutral-400 mt-0.5">View and manage platform users</p>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="w-80">
          <Input
            placeholder="Search users by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<MdSearch className="w-4 h-4" />}
          />
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={users}
        loading={loading}
        emptyMessage="No users found"
        onRowClick={(row) => navigate(`/users/${row._id}`)}
        rowKey={(row) => row._id}
        currentPage={page}
        onPageChange={setPage}
        pageSize={10}
      />

      {/* Toggle Confirm */}
      {toggleUser && (
        <ConfirmDialog
          isOpen={!!toggleUser}
          onClose={() => setToggleUser(null)}
          onConfirm={handleToggleStatus}
          title={toggleUser.isActive ? 'Deactivate User' : 'Activate User'}
          message={`Are you sure you want to ${toggleUser.isActive ? 'deactivate' : 'activate'} ${toggleUser.firstName} ${toggleUser.lastName}?`}
          confirmLabel={toggleUser.isActive ? 'Deactivate' : 'Activate'}
          variant={toggleUser.isActive ? 'danger' : 'primary'}
          loading={actionLoading}
        />
      )}
    </div>
  );
};

export default UserListPage;
