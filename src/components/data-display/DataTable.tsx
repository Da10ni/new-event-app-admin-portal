import type { ReactNode } from 'react';
import { useState, useMemo } from 'react';
import { MdArrowUpward, MdArrowDownward, MdChevronLeft, MdChevronRight } from 'react-icons/md';

export interface Column<T> {
  key: string;
  header: string;
  accessor?: (row: T) => ReactNode;
  sortable?: boolean;
  width?: string;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  emptyIcon?: ReactNode;
  onRowClick?: (row: T) => void;
  pageSize?: number;
  currentPage?: number;
  totalItems?: number;
  onPageChange?: (page: number) => void;
  serverSidePagination?: boolean;
  rowKey?: (row: T) => string;
}

function DataTable<T>({
  columns,
  data,
  loading = false,
  emptyMessage = 'No data found',
  emptyIcon,
  onRowClick,
  pageSize = 10,
  currentPage: externalPage,
  totalItems: externalTotal,
  onPageChange,
  serverSidePagination = false,
  rowKey,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [internalPage, setInternalPage] = useState(1);

  const currentPage = externalPage ?? internalPage;
  const setCurrentPage = onPageChange ?? setInternalPage;

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const safeData = Array.isArray(data) ? data : [];

  const sortedData = useMemo(() => {
    if (!sortKey || serverSidePagination) return safeData;
    return [...safeData].sort((a, b) => {
      const col = columns.find((c) => c.key === sortKey);
      if (!col) return 0;
      const aVal = col.accessor ? col.accessor(a) : (a as Record<string, unknown>)[sortKey];
      const bVal = col.accessor ? col.accessor(b) : (b as Record<string, unknown>)[sortKey];
      const aStr = String(aVal ?? '');
      const bStr = String(bVal ?? '');
      const cmp = aStr.localeCompare(bStr, undefined, { numeric: true });
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [safeData, sortKey, sortDir, columns, serverSidePagination]);

  const totalItems = externalTotal ?? safeData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  const displayData = serverSidePagination
    ? sortedData
    : sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Loading skeleton
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-100">
                {columns.map((col) => (
                  <th key={col.key} className="table-header">
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 5 }).map((_, idx) => (
                <tr key={idx} className="border-b border-neutral-50">
                  {columns.map((col) => (
                    <td key={col.key} className="table-cell">
                      <div className="h-4 bg-neutral-100 rounded animate-pulse w-3/4" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Empty state
  if (safeData.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-100">
                {columns.map((col) => (
                  <th key={col.key} className="table-header">
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
          </table>
        </div>
        <div className="flex flex-col items-center justify-center py-16 px-4">
          {emptyIcon && <div className="text-neutral-200 mb-4">{emptyIcon}</div>}
          <p className="text-neutral-400 text-sm">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-neutral-100">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`table-header ${col.sortable ? 'cursor-pointer select-none hover:text-neutral-600' : ''} ${col.className || ''}`}
                  style={col.width ? { width: col.width } : undefined}
                  onClick={col.sortable ? () => handleSort(col.key) : undefined}
                >
                  <span className="flex items-center gap-1">
                    {col.header}
                    {col.sortable && sortKey === col.key && (
                      sortDir === 'asc' ? (
                        <MdArrowUpward className="w-3.5 h-3.5" />
                      ) : (
                        <MdArrowDownward className="w-3.5 h-3.5" />
                      )
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayData.map((row, rowIdx) => (
              <tr
                key={rowKey ? rowKey(row) : rowIdx}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={`
                  border-b border-neutral-50 last:border-0 transition-colors
                  ${onRowClick ? 'cursor-pointer hover:bg-neutral-50' : ''}
                `}
              >
                {columns.map((col) => (
                  <td key={col.key} className={`table-cell ${col.className || ''}`}>
                    {col.accessor
                      ? col.accessor(row)
                      : String((row as Record<string, unknown>)[col.key] ?? '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-3 border-t border-neutral-100">
          <p className="text-xs text-neutral-400">
            Showing {startItem} to {endItem} of {totalItems} results
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage <= 1}
              className="p-1.5 rounded-lg text-neutral-400 hover:bg-neutral-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <MdChevronLeft className="w-5 h-5" />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }).map((_, idx) => {
              let page: number;
              if (totalPages <= 5) {
                page = idx + 1;
              } else if (currentPage <= 3) {
                page = idx + 1;
              } else if (currentPage >= totalPages - 2) {
                page = totalPages - 4 + idx;
              } else {
                page = currentPage - 2 + idx;
              }
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`
                    w-8 h-8 rounded-lg text-xs font-medium transition-colors
                    ${page === currentPage
                      ? 'bg-primary-500 text-white'
                      : 'text-neutral-400 hover:bg-neutral-50'
                    }
                  `}
                >
                  {page}
                </button>
              );
            })}
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage >= totalPages}
              className="p-1.5 rounded-lg text-neutral-400 hover:bg-neutral-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <MdChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataTable;
