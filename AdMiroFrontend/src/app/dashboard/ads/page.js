"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import axiosInstance from "@/lib/axiosConfig";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Plus,
  Trash,
  PencilSimple,
  CircleNotch,
  MagnifyingGlass,
  X,
} from "phosphor-react";
import gsap from "gsap";

export default function AdvertisementsPage() {
  const router = useRouter();
  const mainRef = useRef(null);
  const [advertisements, setAdvertisements] = useState([]);
  const [allAdvertisements, setAllAdvertisements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Filters and sorting
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [order, setOrder] = useState("desc");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const itemsPerPage = 9;

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
        limit: 1000, // Fetch all ads for client-side filtering
        sortBy,
        order,
      });

      if (statusFilter) {
        params.append("status", statusFilter);
      }

      const response = await axiosInstance.get(`/api/ads?${params}`);
      console.log("✅ Advertisements fetched:", response.data);

      const ads = response.data.data.advertisements || [];
      setAllAdvertisements(ads);
      setAdvertisements(ads);
      setPage(1);
    } catch (err) {
      console.error("❌ Error fetching advertisements:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to fetch advertisements.";
      setError(errorMessage);
      toast.error(errorMessage);
      setAdvertisements([]);
      setAllAdvertisements([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async adId => {
    try {
      setDeleteLoading(adId);
      console.log("🗑️ Deleting advertisement:", adId);

      await axiosInstance.delete(`/api/ads/${adId}`);
      console.log("✅ Advertisement deleted");

      // Remove from local state
      setAdvertisements(advertisements.filter(a => a._id !== adId));
      toast.success("Advertisement deleted successfully!");
      setDeleteConfirmId(null);
    } catch (err) {
      console.error("❌ Error deleting advertisement:", err);
      const errorMessage =
        err.response?.data?.message || "Failed to delete advertisement.";
      setError(errorMessage);
      toast.error(errorMessage);
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

  // Smart search function
  const performSearch = searchValue => {
    setSearchTerm(searchValue);
    setPage(1);

    if (!searchValue.trim()) {
      setAdvertisements(allAdvertisements);
      return;
    }

    const lowercaseSearch = searchValue.toLowerCase();
    const filtered = allAdvertisements.filter(ad => {
      // Search by Ad Name
      if (ad.adName?.toLowerCase().includes(lowercaseSearch)) return true;
      // Search by Duration
      if (ad.duration?.toString().includes(lowercaseSearch)) return true;
      // Search by Status
      if (ad.status?.toLowerCase().includes(lowercaseSearch)) return true;
      // Search by Media Type
      if (ad.mediaType?.toLowerCase().includes(lowercaseSearch)) return true;
      // Search by Description (if available)
      if (ad.description?.toLowerCase().includes(lowercaseSearch)) return true;
      // Search by Views count
      if (ad.views?.toString().includes(lowercaseSearch)) return true;
      // Search by Clicks count
      if (ad.clicks?.toString().includes(lowercaseSearch)) return true;

      return false;
    });

    setAdvertisements(filtered);
  };

  // Pagination logic
  const totalPages = Math.ceil(advertisements.length / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const paginatedAds = advertisements.slice(
    startIndex,
    startIndex + itemsPerPage
  );

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
            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <MagnifyingGlass
                  size={20}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                  weight="bold"
                />
                <input
                  type="text"
                  placeholder="Search by Ad Name, Status, Type, Duration, Views, Clicks..."
                  value={searchTerm}
                  onChange={e => performSearch(e.target.value)}
                  className="w-full pl-12 pr-10 py-3 border-2 border-[#e5e5e5] rounded-lg focus:outline-none focus:border-[#8b6f47] focus:ring-2 focus:ring-[#8b6f47] focus:ring-opacity-20"
                />
                {searchTerm && (
                  <button
                    onClick={() => performSearch("")}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <X size={20} weight="bold" />
                  </button>
                )}
              </div>
              {searchTerm && (
                <p className="mt-2 text-sm text-gray-600">
                  Found <strong>{advertisements.length}</strong> advertisement
                  {advertisements.length !== 1 ? "s" : ""}
                </p>
              )}
            </div>

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
                {searchTerm
                  ? "No advertisements found"
                  : "No advertisements yet"}
              </h2>
              <p className="text-gray-600 mb-8">
                {searchTerm
                  ? "Try adjusting your search terms"
                  : "Create your first advertisement to start managing your campaigns."}
              </p>
              {!searchTerm && (
                <Link
                  href="/dashboard/ads/new"
                  className="inline-block px-8 py-3 bg-[#8b6f47] hover:bg-[#7a5f3a] text-white font-semibold rounded-lg transition">
                  Create Advertisement
                </Link>
              )}
            </div>
          ) : (
            // Advertisements Grid
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {paginatedAds.map(ad => (
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
                        onClick={() => setDeleteConfirmId(ad._id)}
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
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mb-6 mt-8">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-[#8b6f47] hover:bg-[#7a5f3a] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition">
                Previous
              </button>
              <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  pageNum => (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`px-3 py-2 rounded-lg font-semibold transition ${
                        page === pageNum
                          ? "bg-[#8b6f47] text-white"
                          : "bg-[#f0ede9] text-black hover:bg-[#e5e0d9]"
                      }`}>
                      {pageNum}
                    </button>
                  )
                )}
              </div>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 bg-[#8b6f47] hover:bg-[#7a5f3a] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition">
                Next
              </button>
            </div>
          )}

          {/* Count Summary */}
          {advertisements.length > 0 && (
            <div className="text-center text-gray-600">
              <p>
                Showing{" "}
                <strong>
                  {startIndex + 1}-
                  {Math.min(startIndex + itemsPerPage, advertisements.length)}
                </strong>{" "}
                of <strong>{advertisements.length}</strong> advertisement
                {advertisements.length !== 1 ? "s" : ""}
                {searchTerm && ` (searched)`}
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Delete Confirmation Dialog */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Delete Advertisement
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this advertisement? This action
              cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirmId(null)}
                disabled={deleteLoading === deleteConfirmId}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition disabled:opacity-50">
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                disabled={deleteLoading === deleteConfirmId}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition disabled:opacity-50 flex items-center gap-2">
                {deleteLoading === deleteConfirmId && (
                  <CircleNotch size={16} className="animate-spin" />
                )}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
