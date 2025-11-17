"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";

export default function ConnectionRequestsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [totalPages, setTotalPages] = useState(1);
  const [rejectionReason, setRejectionReason] = useState({});

  // Fetch connection requests
  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("accessToken");
      if (!token) {
        router.push("/login");
        return;
      }

      const params = new URLSearchParams({
        page,
        limit,
        ...(statusFilter && { status: statusFilter }),
      });

      const response = await axios.get(
        `/api/displays/connection-requests/all?${params}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setRequests(response.data.data);
      setTotalPages(response.data.pagination.pages);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to fetch connection requests"
      );
      console.error("Error fetching requests:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [page, limit, statusFilter]);

  // Approve request
  const handleApprove = async requestId => {
    try {
      const token = localStorage.getItem("accessToken");
      await axios.post(
        `/api/displays/connection-requests/${requestId}/approve`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setSuccess("Connection request approved");
      fetchRequests();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to approve request");
    }
  };

  // Reject request
  const handleReject = async requestId => {
    const reason = rejectionReason[requestId] || "";

    try {
      const token = localStorage.getItem("accessToken");
      await axios.post(
        `/api/displays/connection-requests/${requestId}/reject`,
        { rejectionReason: reason },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setSuccess("Connection request rejected");
      setRejectionReason(prev => {
        const newState = { ...prev };
        delete newState[requestId];
        return newState;
      });
      fetchRequests();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reject request");
    }
  };

  const getStatusBadgeColor = status => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9f7] p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#3a3530]">
              Connection Requests
            </h1>
            <p className="text-gray-600 mt-1">
              Manage display connection requests
            </p>
          </div>
          <Link
            href="/dashboard/displays"
            className="px-6 py-2 border border-[#8b6f47] text-[#8b6f47] rounded-lg hover:bg-[#faf9f7] transition">
            View Displays
          </Link>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            {success}
          </div>
        )}

        {/* Status Filter */}
        <div className="bg-white rounded-lg shadow p-4 md:p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <label className="block text-sm font-medium text-gray-700">
              Filter by Status:
            </label>
            <div className="flex gap-2">
              {["pending", "approved", "rejected"].map(status => (
                <button
                  key={status}
                  onClick={() => {
                    setStatusFilter(status);
                    setPage(1);
                  }}
                  className={`px-4 py-2 rounded-lg transition ${
                    statusFilter === status
                      ? "bg-[#8b6f47] text-white"
                      : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin">
              <div className="h-8 w-8 border-4 border-[#8b6f47] border-t-transparent rounded-full"></div>
            </div>
            <p className="text-gray-600 mt-4">Loading requests...</p>
          </div>
        )}

        {/* Requests List */}
        {!loading && requests.length > 0 && (
          <div className="space-y-4">
            {requests.map(request => (
              <div
                key={request._id}
                className="bg-white rounded-lg shadow p-4 md:p-6 border-l-4 border-[#8b6f47]">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-[#3a3530]">
                      {request.displayInfo?.displayName || "Unknown Device"}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      ID: {request.displayInfo?.displayId || request.displayId}
                    </p>
                  </div>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(
                      request.status
                    )}`}>
                    {request.status}
                  </span>
                </div>

                {/* Request Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4 border-t border-b border-gray-200">
                  <div>
                    <p className="text-xs text-gray-600 uppercase tracking-wide">
                      Location
                    </p>
                    <p className="text-gray-900 font-medium mt-1">
                      {request.displayInfo?.location || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 uppercase tracking-wide">
                      Requested At
                    </p>
                    <p className="text-gray-900 font-medium mt-1">
                      {new Date(request.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 uppercase tracking-wide">
                      Device Details
                    </p>
                    <p className="text-gray-900 font-medium mt-1 text-sm">
                      {request.displayInfo?.resolution &&
                        `${request.displayInfo.resolution.width}x${request.displayInfo.resolution.height}`}
                    </p>
                  </div>
                </div>

                {/* Rejection Reason (if rejected) */}
                {request.status === "rejected" && request.rejectionReason && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
                    <p className="text-sm text-red-800">
                      <span className="font-medium">Rejection Reason:</span>{" "}
                      {request.rejectionReason}
                    </p>
                  </div>
                )}

                {/* Actions */}
                {request.status === "pending" && (
                  <div className="mt-4 space-y-3">
                    {/* Rejection Reason Input */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Rejection reason (optional)"
                        value={rejectionReason[request._id] || ""}
                        onChange={e =>
                          setRejectionReason(prev => ({
                            ...prev,
                            [request._id]: e.target.value,
                          }))
                        }
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#8b6f47]"
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(request._id)}
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium">
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(request._id)}
                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium">
                        Reject
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && requests.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-600 text-lg">
              No {statusFilter} connection requests
            </p>
            <Link
              href="/dashboard/displays"
              className="mt-4 inline-block px-6 py-2 bg-[#8b6f47] text-white rounded-lg hover:bg-[#7a5f3a] transition">
              View Displays
            </Link>
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="mt-6 flex justify-center gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50">
              Previous
            </button>
            <div className="px-4 py-2 bg-white border border-gray-300 rounded-lg">
              Page {page} of {totalPages}
            </div>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50">
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
