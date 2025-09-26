"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface Column<T> {
  key: keyof T;
  label: string;
  render?: (value: T[keyof T], item: T) => React.ReactNode;
  sortable?: boolean;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchable?: boolean;
  filterable?: boolean;
  onRowClick?: (item: T) => void;
  actions?: (item: T) => React.ReactNode;
  className?: string;
}

export function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  searchable = true,
  filterable = true,
  onRowClick,
  actions,
  className,
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortKey, setSortKey] = useState<keyof T | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  const filteredData = data.filter((item) =>
    Object.values(item).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortKey) return 0;

    const aVal = a[sortKey];
    const bVal = b[sortKey];

    if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
    if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const handleSort = (key: keyof T) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  const handleSelectAll = () => {
    if (selectedItems.size === data.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(data.map((item) => String(item.id))));
    }
  };

  const handleSelectItem = (id: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  return (
    <div
      className={cn(
        "bg-white dark:bg-secondary-800 rounded-xl shadow-sm border border-slate-200 dark:border-secondary-700",
        className
      )}
    >
      {/* Header */}
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {searchable && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-secondary-500" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-64 bg-slate-50 dark:bg-secondary-800 border border-slate-200 dark:border-secondary-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-secondary-900 dark:text-white"
                />
              </div>
            )}
            {filterable && (
              <Button variant="ghost" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            )}
          </div>
          <div className="text-sm text-slate-600 dark:text-secondary-400">
            {filteredData.length} of {data.length} items
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 dark:bg-secondary-700">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={
                    selectedItems.size === data.length && data.length > 0
                  }
                  onChange={handleSelectAll}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
              </th>
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-secondary-400 uppercase tracking-wider"
                >
                  <button
                    onClick={() => column.sortable && handleSort(column.key)}
                    className={cn(
                      "flex items-center space-x-1 hover:text-slate-700 dark:hover:text-secondary-200",
                      column.sortable && "cursor-pointer"
                    )}
                  >
                    <span>{column.label}</span>
                    {column.sortable && (
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 transition-transform",
                          sortKey === column.key &&
                            sortDirection === "desc" &&
                            "rotate-180"
                        )}
                      />
                    )}
                  </button>
                </th>
              ))}
              {actions && (
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-secondary-400 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-secondary-800 divide-y divide-slate-200 dark:divide-secondary-700">
            {sortedData.map((item, index) => (
              <motion.tr
                key={String(item.id)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                className={cn(
                  "hover:bg-slate-50 dark:hover:bg-secondary-700 transition-colors",
                  onRowClick && "cursor-pointer"
                )}
                onClick={() => onRowClick?.(item)}
              >
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectedItems.has(String(item.id))}
                    onChange={() => handleSelectItem(String(item.id))}
                    className="rounded border-secondary-300 dark:border-secondary-600 text-primary-600 dark:text-primary-400 focus:ring-primary-500"
                    onClick={(e) => e.stopPropagation()}
                  />
                </td>
                {columns.map((column) => (
                  <td
                    key={String(column.key)}
                    className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900 dark:text-white"
                  >
                    {column.render
                      ? column.render(item[column.key], item)
                      : String(item[column.key])}
                  </td>
                ))}
                {actions && (
                  <td className="px-6 py-4 text-right">
                    <div onClick={(e) => e.stopPropagation()}>
                      {actions(item)}
                    </div>
                  </td>
                )}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {sortedData.length === 0 && (
        <div className="text-center py-12">
          <div className="text-slate-400 dark:text-secondary-500 mb-4">
            <Search className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
            No items found
          </h3>
          <p className="text-slate-600 dark:text-secondary-400">
            {searchTerm
              ? "Try adjusting your search terms."
              : "No data available."}
          </p>
        </div>
      )}
    </div>
  );
}
