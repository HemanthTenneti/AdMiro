"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import axiosInstance from "@/lib/axiosConfig";
import DashboardLayout from "@/components/DashboardLayout";
import { ArrowLeft, Trash, Funnel } from "phosphor-react";

export default function LogsPage() {
  const router = useRouter();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize] = useState(10);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Filters
  const [actionFilter, setActionFilter] = useState("");
  const [entityTypeFilter, setEntityTypeFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        router.push("/login");
        return;
      }
    };
    checkAuth();
  }, [router]);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        let url = `/api/logs?page=${currentPage}&limit=${pageSize}`;

        if (actionFilter) url += `&action=${actionFilter}`;
        if (entityTypeFilter) url += `&entityType=${entityTypeFilter}`;

        const response = await axiosInstance.get(url);
        const data = response.data?.data || {};

        setLogs(data.logs || []);
        setTotal(data.pagination?.total || 0);
        setTotalPages(data.pagination?.pages || 1);
      } catch (error) {
        console.error("Failed to fetch logs:", error);
        setLogs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [currentPage, actionFilter, entityTypeFilter, pageSize]);

  const handleDeleteLog = async logId => {
    try {
      await axiosInstance.delete(`/api/logs/${logId}`);
      setLogs(logs.filter(log => log._id !== logId));
      setTotal(total - 1);
      toast.success("Log deleted successfully");
      setDeleteConfirmId(null);
    } catch (error) {
      console.error("Failed to delete log:", error);
      toast.error("Failed to delete log");
    }
  };

  const getActionColor = action => {
    switch (action) {
      case "create":
        return "bg-blue-50";
      case "update":
        return "bg-orange-50";
      case "delete":
        return "bg-red-50";
      case "status_change":
        return "bg-purple-50";
      default:
        return "bg-gray-50";
    }
  };

  const getActionBadgeColor = action => {
    switch (action) {
      case "create":
        return "bg-blue-100 text-blue-800 border border-blue-300";
      case "update":
        return "bg-orange-100 text-orange-800 border border-orange-300";
      case "delete":
        return "bg-red-100 text-red-800 border border-red-300";
      case "status_change":
        return "bg-purple-100 text-purple-800 border border-purple-300";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-300";
    }
  };

  const getEntityTypeColor = entityType => {
    switch (entityType) {
      case "display":
        return "bg-blue-50";
      case "advertisement":
        return "bg-purple-50";
      case "loop":
        return "bg-amber-50";
      case "user":
        return "bg-green-50";
      default:
        return "bg-gray-50";
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Link href="/dashboard">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition">
              <ArrowLeft size={20} className="text-gray-600" />
            </button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">System Logs</h1>
        </div>
        <p className="text-gray-600">
          View and manage system activity logs for all operations.
        </p>
      </div>

      {/* Filters */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 mb-8 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Funnel size={20} className="text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Action Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Action Type
            </label>
            <select
              value={actionFilter}
              onChange={e => {
                setActionFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b6f47]">
              <option value="">All Actions</option>
              <option value="create">Create</option>
              <option value="update">Update</option>
              <option value="delete">Delete</option>
              <option value="status_change">Status Change</option>
            </select>
          </div>

          {/* Entity Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Entity Type
            </label>
            <select
              value={entityTypeFilter}
              onChange={e => {
                setEntityTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b6f47]">
              <option value="">All Types</option>
              <option value="display">Display</option>
              <option value="advertisement">Advertisement</option>
              <option value="loop">Loop</option>
              <option value="user">User</option>
              <option value="system">System</option>
            </select>
          </div>

          {/* Clear Filters */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              &nbsp;
            </label>
            <button
              onClick={() => {
                setActionFilter("");
                setEntityTypeFilter("");
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium text-gray-700">
              Clear Filters
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Showing <span className="font-semibold">{logs.length}</span> of{" "}
            <span className="font-semibold">{total}</span> total logs
          </p>
        </div>
      </div>

      {/* Logs Table */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#8b6f47]" />
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-gray-500 text-lg mb-2">No logs found</p>
            <p className="text-gray-400 text-sm">
              {actionFilter || entityTypeFilter
                ? "Try adjusting your filters"
                : "System activity will appear here"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                    Action
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                    Entity Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                    Date
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr
                    key={log._id}
                    className={`border-b border-gray-200 hover:opacity-75 transition ${getActionColor(
                      log.action
                    )}`}>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getActionBadgeColor(
                          log.action
                        )}`}>
                        {log.action.replace(/_/g, " ").toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-gray-900 capitalize">
                        {log.entityType}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {log.details?.description || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <p className="text-gray-900 font-medium">
                          {log.userId?.firstName && log.userId?.lastName
                            ? `${log.userId.firstName} ${log.userId.lastName}`
                            : log.userId?.username || "Unknown"}
                        </p>
                        <p className="text-gray-500 text-xs">
                          {log.userId?.email || ""}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">
                        {new Date(log.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                        <br />
                        <span className="text-xs text-gray-500">
                          {new Date(log.createdAt).toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          })}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => setDeleteConfirmId(log._id)}
                        className="p-2 hover:bg-red-100 rounded-lg transition text-gray-600 hover:text-red-600"
                        title="Delete log">
                        <Trash size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 bg-white flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition">
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition">
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Delete Log
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this log? This action cannot be
              undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition">
                Cancel
              </button>
              <button
                onClick={() => handleDeleteLog(deleteConfirmId)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
