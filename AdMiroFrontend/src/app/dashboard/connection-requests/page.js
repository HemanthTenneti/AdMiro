"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "@/lib/axiosConfig";
import DashboardLayout from "@/components/DashboardLayout";
import { CheckCircle, XCircle, Clock, Warning } from "phosphor-react";

export default function ConnectionRequestsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending");
  const [actionLoading, setActionLoading] = useState({});
  const [rejectionReason, setRejectionReason] = useState({});

  // Fetch connection requests
  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axiosInstance.get(
        `/api/displays/connection-requests/all?status=${statusFilter}`
      );

      console.log("Connection requests response:", response.data);
      // response.data has structure: { success, message, data: { data: [], pagination } }
      const requestsData = response.data.data?.data || [];
      console.log("Setting requests:", requestsData);
      setRequests(requestsData);
    } catch (err) {
      console.error("Error fetching requests:", err);
      setError(
        err.response?.data?.message || "Failed to fetch connection requests"
      );
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [statusFilter]);

  // Approve request
  const handleApprove = async requestId => {
    try {
      setActionLoading(prev => ({ ...prev, [requestId]: true }));
      setError("");

      await axiosInstance.post(
        `/api/displays/connection-requests/${requestId}/approve`
      );

      setSuccess("Connection request approved successfully!");
      await fetchRequests();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Error approving request:", err);
      setError(err.response?.data?.message || "Failed to approve request");
    } finally {
      setActionLoading(prev => ({ ...prev, [requestId]: false }));
    }
  };

  // Reject request
  const handleReject = async requestId => {
    const reason = rejectionReason[requestId] || "";

    try {
      setActionLoading(prev => ({ ...prev, [requestId]: true }));
      setError("");

      await axiosInstance.post(
        `/api/displays/connection-requests/${requestId}/reject`,
        { rejectionReason: reason }
      );

      setSuccess("Connection request rejected successfully!");
      setRejectionReason(prev => {
        const newState = { ...prev };
        delete newState[requestId];
        return newState;
      });
      await fetchRequests();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Error rejecting request:", err);
      setError(err.response?.data?.message || "Failed to reject request");
    } finally {
      setActionLoading(prev => ({ ...prev, [requestId]: false }));
    }
  };

  const getStatusIcon = status => {
    switch (status) {
      case "approved":
        return (
          <CheckCircle size={20} className="text-green-600" weight="fill" />
        );
      case "rejected":
        return <XCircle size={20} className="text-red-600" weight="fill" />;
      case "pending":
        return <Clock size={20} className="text-yellow-600" weight="fill" />;
      default:
        return <Warning size={20} className="text-gray-600" weight="fill" />;
    }
  };

  const getStatusColor = status => {
    switch (status) {
      case "pending":
        return "bg-yellow-50 border-yellow-200";
      case "approved":
        return "bg-green-50 border-green-200";
      case "rejected":
        return "bg-red-50 border-red-200";
      default:
        return "bg-gray-50 border-gray-200";
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
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-[#3a3530]">
            Connection Requests
          </h1>
          <p className="text-gray-600 mt-2">
            Manage and approve display connection requests
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
            <Warning
              size={20}
              className="text-red-600 shrink-0 mt-0.5"
              weight="fill"
            />
            <div>
              <h3 className="font-semibold text-red-900">Error</h3>
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex gap-3">
            <CheckCircle
              size={20}
              className="text-green-600 shrink-0 mt-0.5"
              weight="fill"
            />
            <div>
              <h3 className="font-semibold text-green-900">Success</h3>
              <p className="text-green-800 text-sm">{success}</p>
            </div>
          </div>
        )}

        {/* Status Filter */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">
            Filter by Status
          </h2>
          <div className="flex gap-3 flex-wrap">
            {["pending", "approved", "rejected"].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  statusFilter === status
                    ? "bg-[#8b6f47] text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}>
                {status === "pending" && (
                  <Clock size={16} className="inline mr-2" />
                )}
                {status === "approved" && (
                  <CheckCircle size={16} className="inline mr-2" />
                )}
                {status === "rejected" && (
                  <XCircle size={16} className="inline mr-2" />
                )}
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <div className="inline-block animate-spin mb-4">
              <div className="h-8 w-8 border-4 border-[#8b6f47] border-t-transparent rounded-full"></div>
            </div>
            <p className="text-gray-600 font-medium">Loading requests...</p>
          </div>
        )}

        {/* Requests List */}
        {!loading && requests.length > 0 && (
          <div className="space-y-4">
            {requests.map(request => (
              <div
                key={request._id}
                className={`bg-white rounded-lg shadow-sm border-l-4 p-6 ${getStatusColor(
                  request.status
                )}`}>
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusIcon(request.status)}
                      <h3 className="text-lg font-bold text-[#3a3530]">
                        {request.displayName || "Unknown Display"}
                      </h3>
                    </div>
                    <p className="text-gray-600 text-sm">
                      Request ID:{" "}
                      <span className="font-mono">{request.requestId}</span>
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadgeColor(
                      request.status
                    )}`}>
                    {request.status.toUpperCase()}
                  </span>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4 border-t border-gray-200">
                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
                      Location
                    </p>
                    <p className="text-gray-900 font-medium">
                      {request.displayLocation || "Not specified"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
                      Requested
                    </p>
                    <p className="text-gray-900 font-medium">
                      {new Date(request.createdAt).toLocaleDateString(
                        undefined,
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        }
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
                      Firmware
                    </p>
                    <p className="text-gray-900 font-medium">
                      {request.firmwareVersion || "Unknown"}
                    </p>
                  </div>
                </div>

                {/* Rejection Reason */}
                {request.status === "rejected" && request.rejectionReason && (
                  <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded">
                    <p className="text-sm text-red-900">
                      <span className="font-semibold">Reason:</span>{" "}
                      {request.rejectionReason}
                    </p>
                  </div>
                )}

                {/* Actions for Pending Requests */}
                {request.status === "pending" && (
                  <div className="mt-4 space-y-3 border-t border-gray-200 pt-4">
                    <div>
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
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#8b6f47] focus:border-transparent"
                      />
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleApprove(request._id)}
                        disabled={actionLoading[request._id]}
                        className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg font-medium transition">
                        {actionLoading[request._id]
                          ? "Approving..."
                          : "Approve"}
                      </button>
                      <button
                        onClick={() => handleReject(request._id)}
                        disabled={actionLoading[request._id]}
                        className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg font-medium transition">
                        {actionLoading[request._id] ? "Rejecting..." : "Reject"}
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
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Warning
              size={48}
              className="mx-auto mb-4 text-gray-400"
              weight="fill"
            />
            <p className="text-gray-600 text-lg font-medium">
              No {statusFilter} connection requests
            </p>
            <p className="text-gray-500 mt-2">
              {statusFilter === "pending"
                ? "All displays have been approved or are awaiting approval"
                : `No ${statusFilter} requests to display`}
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
