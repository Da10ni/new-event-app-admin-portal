import { useEffect, useState, useCallback } from 'react';
import { categoryApi } from '../../services/api/categoryApi';
import DataTable from '../../components/data-display/DataTable';
import type { Column } from '../../components/data-display/DataTable';
import StatusBadge from '../../components/data-display/StatusBadge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/feedback/ConfirmDialog';
import LoadingSpinner from '../../components/feedback/LoadingSpinner';
import { showToast } from '../../components/feedback/Toast';
import type { Category } from '../../types';
import { MdAdd, MdSearch, MdEdit, MdDelete, MdCategory } from 'react-icons/md';

const CategoryListPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '', sortOrder: 0 });
  const [formLoading, setFormLoading] = useState(false);

  // Delete state
  const [deleteCategory, setDeleteCategory] = useState<Category | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const response = await categoryApi.getAll();
      setCategories(response.data.data?.categories || []);
    } catch {
      showToast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormData({ name: '', description: '', sortOrder: 0 });
    setShowModal(true);
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      sortOrder: category.sortOrder,
    });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      showToast.error('Category name is required');
      return;
    }

    setFormLoading(true);
    try {
      if (editingCategory) {
        await categoryApi.update(editingCategory._id, formData);
        showToast.success('Category updated successfully');
      } else {
        await categoryApi.create(formData);
        showToast.success('Category created successfully');
      }
      setShowModal(false);
      fetchCategories();
    } catch {
      showToast.error(editingCategory ? 'Failed to update category' : 'Failed to create category');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteCategory) return;
    setDeleteLoading(true);
    try {
      await categoryApi.delete(deleteCategory._id);
      showToast.success('Category deleted successfully');
      setDeleteCategory(null);
      fetchCategories();
    } catch {
      showToast.error('Failed to delete category');
    } finally {
      setDeleteLoading(false);
    }
  };

  const columns: Column<Category>[] = [
    {
      key: 'icon',
      header: '',
      width: '50px',
      accessor: () => (
        <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center">
          <MdCategory className="w-4 h-4 text-primary-500" />
        </div>
      ),
    },
    {
      key: 'name',
      header: 'Name',
      sortable: true,
      accessor: (row) => (
        <span className="font-medium text-neutral-600">{row.name}</span>
      ),
    },
    {
      key: 'slug',
      header: 'Slug',
      accessor: (row) => (
        <span className="text-xs font-mono bg-neutral-50 px-2 py-1 rounded">{row.slug}</span>
      ),
    },
    {
      key: 'listingCount',
      header: 'Listings',
      sortable: true,
      accessor: (row) => row.listingCount || 0,
    },
    {
      key: 'sortOrder',
      header: 'Sort Order',
      sortable: true,
      accessor: (row) => row.sortOrder,
    },
    {
      key: 'status',
      header: 'Status',
      accessor: (row) => (
        <StatusBadge status={row.isActive ? 'active' : 'inactive'} type="general" />
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
            icon={<MdEdit className="w-4 h-4 text-neutral-400" />}
            onClick={() => openEditModal(row)}
          />
          <Button
            variant="ghost"
            size="sm"
            icon={<MdDelete className="w-4 h-4 text-error-500" />}
            onClick={() => setDeleteCategory(row)}
          />
        </div>
      ),
    },
  ];

  const filteredCategories = categories.filter((c) => {
    if (search) {
      return c.name.toLowerCase().includes(search.toLowerCase());
    }
    return true;
  });

  if (loading && categories.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" label="Loading categories..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-600">Category Management</h1>
          <p className="text-sm text-neutral-400 mt-0.5">Organize listings into categories</p>
        </div>
        <Button
          variant="primary"
          size="sm"
          icon={<MdAdd className="w-4 h-4" />}
          onClick={openCreateModal}
        >
          Add Category
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="w-80">
          <Input
            placeholder="Search categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<MdSearch className="w-4 h-4" />}
          />
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={filteredCategories}
        loading={loading}
        emptyMessage="No categories found"
        rowKey={(row) => row._id}
        currentPage={page}
        onPageChange={setPage}
        pageSize={10}
      />

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingCategory ? 'Edit Category' : 'Create Category'}
        size="sm"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" loading={formLoading} onClick={handleSubmit}>
              {editingCategory ? 'Save Changes' : 'Create Category'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Category Name"
            placeholder="e.g., Venues, Photography"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Input
            label="Description"
            placeholder="Brief description of this category"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
          <Input
            label="Sort Order"
            type="number"
            placeholder="0"
            value={String(formData.sortOrder)}
            onChange={(e) => setFormData({ ...formData, sortOrder: Number(e.target.value) })}
          />
        </div>
      </Modal>

      {/* Delete Confirm */}
      {deleteCategory && (
        <ConfirmDialog
          isOpen={!!deleteCategory}
          onClose={() => setDeleteCategory(null)}
          onConfirm={handleDelete}
          title="Delete Category"
          message={`Are you sure you want to delete "${deleteCategory.name}"? This action cannot be undone. Categories with existing listings cannot be deleted.`}
          confirmLabel="Delete"
          variant="danger"
          loading={deleteLoading}
        />
      )}
    </div>
  );
};

export default CategoryListPage;
