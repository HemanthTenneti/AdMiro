"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axiosInstance from "@/lib/axiosConfig";
import DashboardLayout from "@/components/DashboardLayout";
import { Plus, Trash, PencilSimple, CircleNotch } from "phosphor-react";
import gsap from "gsap";

export default function AdvertisementsPage() {
  const router = useRouter();
  const mainRef = useRef(null);
  const [advertisements, setAdvertisements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(null);

  // Filters and sorting
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [order, setOrder] = useState("desc");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  // Check auth and fetch advertisements
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.push("/login");
      return;
    }

    fetchAdvertisements();
  }, [router]);

  // Refetch when filters change
  useEffect(() => {
    setPage(1);
    fetchAdvertisements();
  }, [statusFilter, sortBy, order]);

  // Entry animation
  useEffect(() => {
    if (mainRef.current && !loading) {
      gsap.fromTo(
        mainRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
      );
    }
  }, [loading]);

  const fetchAdvertisements = async (pageNum = 1) => {
    try {
      setLoading(true);
      setError("");
      console.log("📤 Fetching advertisements...");

      const params = new URLSearchParams({
        page: pageNum,
        limit: 10,
        sortBy,
        order,
      });

      if (statusFilter) {
        params.append("status", statusFilter);
      }

      const response = await axiosInstance.get(`/api/ads?${params}`);
      console.log("✅ Advertisements fetched:", response.data);

      setAdvertisements(response.data.data.advertisements || []);
      setPagination(response.data.data.pagination || {});
      setPage(pageNum);
    } catch (err) {
      console.error("❌ Error fetching advertisements:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to fetch advertisements.";
      setError(errorMessage);
      setAdvertisements([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async adId => {
    if (!confirm("Are you sure you want to delete this advertisement?")) {
      return;
    }

    try {
      setDeleteLoading(adId);
      console.log("🗑️ Deleting advertisement:", adId);

      await axiosInstance.delete(`/api/ads/${adId}`);
      console.log("✅ Advertisement deleted");

      // Remove from local state
      setAdvertisements(advertisements.filter(a => a._id !== adId));
    } catch (err) {
      console.error("❌ Error deleting advertisement:", err);
      setError(
        err.response?.data?.message || "Failed to delete advertisement."
      );
    } finally {
      setDeleteLoading(null);
    }
  };

  const getStatusColor = status => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      case "paused":
        return "bg-yellow-100 text-yellow-800";
      case "expired":
        return "bg-red-100 text-red-800";
      case "draft":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getMediaTypeIcon = mediaType => {
    return mediaType === "video" ? "🎬" : "🖼️";
  };

  return (
    <DashboardLayout>
      <main
        ref={mainRef}
        className="min-h-screen bg-linear-to-br from-[#faf9f7] to-[#f5f3f0] p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-black mb-2">
                Advertisements
              </h1>
              <p className="text-gray-600">
                Create and manage your advertisement campaigns
              </p>
            </div>
            <Link
              href="/dashboard/ads/new"
              className="flex items-center gap-2 px-6 py-3 bg-[#8b6f47] hover:bg-[#7a5f3a] text-white font-semibold rounded-lg transition">
              <Plus size={20} weight="bold" />
              Create Ad
            </Link>
          </div>

          {/* Filters Bar */}
          <div className="bg-white rounded-2xl border-2 border-[#e5e5e5] p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b6f47] focus:border-transparent">
                  <option value="">All Status</option>
                  <option value="draft">Draft</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                  <option value="expired">Expired</option>
                </select>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b6f47] focus:border-transparent">
                  <option value="createdAt">Created Date</option>
                  <option value="adName">Name</option>
                  <option value="status">Status</option>
                  <option value="duration">Duration</option>
                </select>
              </div>

              {/* Order */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Order
                </label>
                <select
                  value={order}
                  onChange={e => setOrder(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b6f47] focus:border-transparent">
                  <option value="desc">Newest First</option>
                  <option value="asc">Oldest First</option>
                </select>
              </div>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <CircleNotch
                  size={48}
                  className="text-[#8b6f47] animate-spin mx-auto mb-4"
                  weight="bold"
                />
                <p className="text-gray-600">Loading advertisements...</p>
              </div>
            </div>
          ) : advertisements.length === 0 ? (
            // Empty State
            <div className="bg-white rounded-2xl border-2 border-[#e5e5e5] p-12 text-center">
              <h2 className="text-2xl font-bold text-black mb-2">
                No advertisements yet
              </h2>
              <p className="text-gray-600 mb-8">
                Create your first advertisement to start managing your
                campaigns.
              </p>
              <Link
                href="/dashboard/ads/new"
                className="inline-block px-8 py-3 bg-[#8b6f47] hover:bg-[#7a5f3a] text-white font-semibold rounded-lg transition">
                Create Advertisement
              </Link>
            </div>
          ) : (
            // Advertisements Grid
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {advertisements.map(ad => (
                <div
                  key={ad._id}
                  className="bg-white rounded-2xl border-2 border-[#e5e5e5] overflow-hidden hover:shadow-lg transition">
                  {/* Thumbnail */}
                  {ad.thumbnailUrl && (
                    <div className="w-full h-40 bg-gray-200 overflow-hidden">
                      <img
                        src={ad.thumbnailUrl}
                        alt={ad.adName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-black mb-1">
                          {ad.adName}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {getMediaTypeIcon(ad.mediaType)} {ad.mediaType}
                        </p>
                      </div>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                          ad.status
                        )}`}>
                        {ad.status.charAt(0).toUpperCase() + ad.status.slice(1)}
                      </span>
                    </div>

                    {/* Duration */}
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">
                        <strong>Duration:</strong> {ad.duration}s
                      </p>
                    </div>

                    {/* Scheduled Info */}
                    {ad.scheduledStart && ad.scheduledEnd && (
                      <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                        <p className="text-xs text-gray-600">
                          <strong>Scheduled:</strong>{" "}
                          {new Date(ad.scheduledStart).toLocaleDateString()} to{" "}
                          {new Date(ad.scheduledEnd).toLocaleDateString()}
                        </p>
                      </div>
                    )}

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div>
                        <p className="text-xs text-gray-600">Views</p>
                        <p className="text-lg font-bold text-black">
                          {ad.views || 0}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Clicks</p>
                        <p className="text-lg font-bold text-black">
                          {ad.clicks || 0}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          router.push(`/dashboard/ads/${ad._id}/edit`)
                        }
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#8b6f47] hover:bg-[#7a5f3a] text-white font-semibold rounded-lg transition">
                        <PencilSimple size={16} weight="bold" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(ad._id)}
                        disabled={deleteLoading === ad._id}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition disabled:opacity-50">
                        {deleteLoading === ad._id ? (
                          <CircleNotch
                            size={16}
                            className="animate-spin"
                            weight="bold"
                          />
                        ) : (
                          <Trash size={16} weight="bold" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-8">
              <button
                onClick={() => fetchAdvertisements(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-[#8b6f47] hover:bg-[#7a5f3a] disabled:opacity-50 text-white font-semibold rounded-lg transition">
                Previous
              </button>
              <span className="text-gray-700">
                Page {page} of {pagination.totalPages}
              </span>
              <button
                onClick={() =>
                  fetchAdvertisements(Math.min(pagination.totalPages, page + 1))
                }
                disabled={page === pagination.totalPages}
                className="px-4 py-2 bg-[#8b6f47] hover:bg-[#7a5f3a] disabled:opacity-50 text-white font-semibold rounded-lg transition">
                Next
              </button>
            </div>
          )}

          {/* Count Summary */}
          {advertisements.length > 0 && (
            <div className="mt-6 text-center text-gray-600">
              <p>
                Showing <strong>{advertisements.length}</strong> advertisement
                {advertisements.length !== 1 ? "s" : ""} (Total:{" "}
                <strong>{pagination.total}</strong>)
              </p>
            </div>
          )}
        </div>
      </main>
    </DashboardLayout>
  );
}
