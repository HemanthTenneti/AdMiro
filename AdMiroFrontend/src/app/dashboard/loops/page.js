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
  Monitor,
  MagnifyingGlass,
  X,
  CaretLeft,
  CaretRight,
  CaretUp,
  CaretDown,
} from "phosphor-react";
import gsap from "gsap";

export default function LoopsPage() {
  const router = useRouter();
  const mainRef = useRef(null);
  const [loops, setLoops] = useState([]);
  const [displays, setDisplays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [assignLoading, setAssignLoading] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(null);

  // Search, Sort, and Pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [activeSearchTerm, setActiveSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [sortBy, setSortBy] = useState(null);
  const [sortOrder, setSortOrder] = useState("none");
  const itemsPerPage = 10;

  // Check auth and fetch loops
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.push("/login");
      return;
    }

    fetchLoops(page);
    fetchDisplays();
  }, [router, page, activeSearchTerm, sortBy, sortOrder]);

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

  const fetchLoops = async (pageNum = 1) => {
    try {
      setLoading(true);
      setError("");
      console.log("📤 Fetching loops...");

      const params = {
        page: pageNum,
        limit: itemsPerPage,
      };

      if (activeSearchTerm.trim()) {
        params.search = activeSearchTerm.trim();
      }

      if (sortBy && sortOrder !== "none") {
        params.sortBy = sortBy;
        params.order = sortOrder === "asc" ? "asc" : "desc";
      }

      const response = await axiosInstance.get("/api/loops", { params });
      console.log("✅ Loops fetched:", response.data);

      setLoops(response.data.data.loops || []);

      const pagination = response.data.data.pagination;
      if (pagination) {
        setTotalPages(pagination.totalPages);
        setTotalItems(pagination.total);
      }
    } catch (err) {
      console.error("❌ Error fetching loops:", err);
      const errorMessage =
        err.response?.data?.message || err.message || "Failed to fetch loops.";
      setError(errorMessage);
      toast.error(errorMessage);
      setLoops([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDisplays = async () => {
    try {
      console.log("📤 Fetching displays...");
      const response = await axiosInstance.get("/api/displays?limit=1000");
      console.log("✅ Displays fetched:", response.data);
      setDisplays(response.data.data.displays || []);
    } catch (err) {
      console.error("❌ Error fetching displays:", err);
    }
  };

  const handleSearch = () => {
    setActiveSearchTerm(searchTerm);
    setPage(1);
  };

  const handleSearchKeyPress = e => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setActiveSearchTerm("");
    setPage(1);
  };

  const handleSort = field => {
    if (sortBy === field) {
      if (sortOrder === "asc") {
        setSortOrder("desc");
      } else if (sortOrder === "desc") {
        setSortBy(null);
        setSortOrder("none");
      } else {
        setSortOrder("asc");
      }
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
    setPage(1);
  };

  const getSortIcon = field => {
    if (sortBy !== field || sortOrder === "none") return null;
    return sortOrder === "asc" ? (
      <CaretUp size={16} weight="bold" />
    ) : (
      <CaretDown size={16} weight="bold" />
    );
  };

  const handleDelete = async loopId => {
    try {
      setDeleteLoading(loopId);
      console.log("🗑️ Deleting loop:", loopId);

      await axiosInstance.delete(`/api/loops/${loopId}`);
      console.log("✅ Loop deleted");

      // Remove from local state
      setLoops(loops.filter(l => l._id !== loopId));
      toast.success("Loop deleted successfully!");
      setDeleteConfirmId(null);
    } catch (err) {
      console.error("❌ Error deleting loop:", err);
      const errorMessage =
        err.response?.data?.message || "Failed to delete loop.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleAssignToDisplay = async (loopId, displayId) => {
    try {
      setAssignLoading(loopId);
      console.log("📍 Assigning loop to display:", loopId, displayId);

      await axiosInstance.put(`/api/displays/${displayId}/assign-loop`, {
        loopId,
      });

      // Trigger display refresh to load new loop immediately
      try {
        console.log("🔄 Triggering display refresh...");
        await axiosInstance.post(`/api/displays/${displayId}/trigger-refresh`);
        console.log("✅ Display refresh triggered");
      } catch (refreshErr) {
        console.warn("⚠️ Could not trigger display refresh:", refreshErr);
        // Don't fail the assignment if refresh fails
      }

      toast.success("Loop assigned to display successfully!");
      setOpenDropdown(null);
    } catch (err) {
      console.error("❌ Error assigning loop:", err);
      const errorMessage =
        err.response?.data?.message || "Failed to assign loop.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setAssignLoading(null);
    }
  };

  const getRotationTypeLabel = type => {
    switch (type) {
      case "sequential":
        return "Sequential";
      case "random":
        return "Random";
      case "weighted":
        return "Weighted";
      default:
        return type;
    }
  };

  return (
    <DashboardLayout>
      <main ref={mainRef} className="min-h-screen p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-black mb-2">
                Display Loops
              </h1>
              <p className="text-gray-600">
                Manage advertisement playlists for your displays
              </p>
            </div>
            <Link
              href="/dashboard/loops/new"
              className="flex items-center gap-2 px-6 py-3 bg-[#8b6f47] hover:bg-[#7a5f3a] text-white font-semibold rounded-lg transition">
              <Plus size={20} weight="bold" />
              Create Loop
            </Link>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {/* Search Bar */}
          <div className="mb-8">
            <div className="relative">
              <MagnifyingGlass
                size={20}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                weight="bold"
              />
              <input
                type="text"
                placeholder="Search by Loop Name, Display Name, Rotation Type..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                onKeyPress={handleSearchKeyPress}
                className="w-full pl-12 pr-32 py-3 border-2 border-[#e5e5e5] rounded-lg focus:outline-none focus:border-[#8b6f47] focus:ring-2 focus:ring-[#8b6f47] focus:ring-opacity-20"
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                {searchTerm && (
                  <button
                    onClick={handleClearSearch}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
                    title="Clear search">
                    <X size={18} weight="bold" />
                  </button>
                )}
                <button
                  onClick={handleSearch}
                  className="px-4 py-2 bg-[#8b6f47] hover:bg-[#7a5f3a] text-white font-semibold rounded-lg transition flex items-center gap-2"
                  title="Search">
                  <MagnifyingGlass size={18} weight="bold" />
                  Search
                </button>
              </div>
            </div>
            {activeSearchTerm && (
              <p className="mt-2 text-sm text-gray-600">
                Found <strong>{totalItems}</strong> loop
                {totalItems !== 1 ? "s" : ""} for "{activeSearchTerm}"
              </p>
            )}
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <CircleNotch
                  size={48}
                  className="text-[#8b6f47] animate-spin mx-auto mb-4"
                  weight="bold"
                />
                <p className="text-gray-600">Loading your loops...</p>
              </div>
            </div>
          ) : loops.length === 0 ? (
            // Empty State
            <div className="bg-white rounded-2xl border-2 border-[#e5e5e5] p-12 text-center">
              <h2 className="text-2xl font-bold text-black mb-2">
                {activeSearchTerm ? "No loops found" : "No loops yet"}
              </h2>
              <p className="text-gray-600 mb-8">
                {activeSearchTerm
                  ? "Try adjusting your search terms"
                  : "Create your first display loop to start managing advertisement playlists across your displays."}
              </p>
              {!activeSearchTerm && (
                <Link
                  href="/dashboard/loops/new"
                  className="inline-block px-8 py-3 bg-[#8b6f47] hover:bg-[#7a5f3a] text-white font-semibold rounded-lg transition">
                  Create Display Loop
                </Link>
              )}
            </div>
          ) : (
            // Loops Table
            <div className="bg-white rounded-2xl border-2 border-[#e5e5e5] shadow-sm">
              <div className="overflow-x-auto overflow-y-visible">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#e5e5e5] bg-[#faf9f7]">
                      <th className="px-6 py-4 text-left text-sm font-semibold text-black">
                        <button
                          onClick={() => handleSort("loopName")}
                          className="flex items-center gap-2 hover:text-[#8b6f47] transition">
                          Loop Name {getSortIcon("loopName")}
                        </button>
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-black">
                        <button
                          onClick={() => handleSort("displayLayout")}
                          className="flex items-center gap-2 hover:text-[#8b6f47] transition">
                          Ad Type {getSortIcon("displayLayout")}
                        </button>
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-black">
                        Advertisements
                      </th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-black">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {loops.map(loop => (
                      <tr
                        key={loop._id}
                        className="border-b border-[#e5e5e5] hover:bg-[#faf9f7] transition">
                        <td className="px-6 py-4">
                          <span className="text-black font-medium">
                            {loop.loopName}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-block px-3 py-1 bg-[#8b6f47] text-white text-xs font-semibold rounded-full">
                            {loop.displayLayout === "masonry"
                              ? "Masonry"
                              : "Sequential"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            {loop.advertisements &&
                            loop.advertisements.length > 0 ? (
                              <>
                                {loop.advertisements
                                  .slice(0, 2)
                                  .map((ad, idx) => (
                                    <div
                                      key={idx}
                                      className="text-sm text-gray-600">
                                      {idx + 1}.{" "}
                                      {ad.adId?.adName ||
                                        ad.adName ||
                                        "Unknown Ad"}
                                    </div>
                                  ))}
                                {loop.advertisements.length > 2 && (
                                  <div className="text-sm text-gray-500 italic">
                                    +{loop.advertisements.length - 2} more
                                  </div>
                                )}
                              </>
                            ) : (
                              <span className="text-gray-500 text-sm">
                                No ads assigned
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() =>
                                setOpenDropdown(
                                  openDropdown === loop._id ? null : loop._id
                                )
                              }
                              disabled={
                                assignLoading === loop._id ||
                                displays.length === 0
                              }
                              className="flex items-center gap-2 px-4 py-2 bg-[#8b6f47] text-white rounded-lg hover:bg-[#7a5f3a] transition disabled:opacity-50 font-medium">
                              {assignLoading === loop._id ? (
                                <>
                                  <CircleNotch
                                    size={18}
                                    className="animate-spin"
                                    weight="bold"
                                  />
                                  Assigning...
                                </>
                              ) : (
                                <>
                                  Assign to Display
                                  <Monitor size={16} weight="bold" />
                                </>
                              )}
                            </button>
                            <button
                              onClick={() =>
                                router.push(
                                  `/dashboard/displays/${
                                    typeof loop.displayId === "string"
                                      ? loop.displayId
                                      : loop.displayId?._id || ""
                                  }/loops/${loop._id}/edit`
                                )
                              }
                              className="flex items-center gap-2 px-4 py-2 text-[#8b6f47] hover:bg-[#f0ede9] rounded-lg transition font-medium"
                              title="Edit loop">
                              <PencilSimple size={18} weight="bold" />
                              Edit
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(loop._id)}
                              disabled={deleteLoading === loop._id}
                              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50 font-medium"
                              title="Delete loop">
                              {deleteLoading === loop._id ? (
                                <>
                                  <CircleNotch
                                    size={18}
                                    className="animate-spin"
                                    weight="bold"
                                  />
                                  Deleting...
                                </>
                              ) : (
                                <>
                                  <Trash size={18} />
                                  Delete
                                </>
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col items-center gap-6 mb-6 mt-12">
              <div className="flex items-center justify-center gap-1 flex-wrap">
                {/* Previous Button */}
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-lg transition disabled:opacity-30 disabled:cursor-not-allowed text-[#8b6f47] hover:bg-[#f0ede9]">
                  <CaretLeft size={20} weight="bold" />
                </button>

                <div className="flex items-center gap-1">
                  {/* First Page */}
                  {page > 3 && (
                    <>
                      <button
                        onClick={() => setPage(1)}
                        className="px-3 py-2 rounded-md font-semibold transition text-sm bg-[#f0ede9] text-black hover:bg-[#e5d9c8]">
                        1
                      </button>
                      {page > 4 && (
                        <span className="px-2 text-gray-400 text-lg">···</span>
                      )}
                    </>
                  )}

                  {/* Page Range Around Current */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const startPage = Math.max(
                      1,
                      Math.min(page - 2, totalPages - 4)
                    );
                    return startPage + i;
                  }).map(pageNum => (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`px-3 py-2 rounded-md font-semibold transition text-sm ${
                        page === pageNum
                          ? "bg-[#8b6f47] text-white shadow-md"
                          : "bg-[#f0ede9] text-black hover:bg-[#e5d9c8]"
                      }`}>
                      {pageNum}
                    </button>
                  ))}

                  {/* Last Page */}
                  {page < totalPages - 2 && (
                    <>
                      {page < totalPages - 3 && (
                        <span className="px-2 text-gray-400 text-lg">···</span>
                      )}
                      <button
                        onClick={() => setPage(totalPages)}
                        className="px-3 py-2 rounded-md font-semibold transition text-sm bg-[#f0ede9] text-black hover:bg-[#e5d9c8]">
                        {totalPages}
                      </button>
                    </>
                  )}
                </div>

                {/* Next Button */}
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="p-2 rounded-lg transition disabled:opacity-30 disabled:cursor-not-allowed text-[#8b6f47] hover:bg-[#f0ede9]">
                  <CaretRight size={20} weight="bold" />
                </button>
              </div>

              {/* Page Info */}
              <div className="text-xs tracking-wide text-gray-500 uppercase">
                Page <span className="text-[#8b6f47] font-bold">{page}</span> of{" "}
                <span className="text-[#8b6f47] font-bold">{totalPages}</span>
              </div>
            </div>
          )}

          {/* Count Summary */}
          {loops.length > 0 && (
            <div className="text-center text-gray-600">
              <p>
                Showing{" "}
                <strong>
                  {(page - 1) * itemsPerPage + 1}-
                  {(page - 1) * itemsPerPage + loops.length}
                </strong>{" "}
                of <strong>{totalItems}</strong> loop
                {totalItems !== 1 ? "s" : ""}
                {activeSearchTerm && ` (filtered)`}
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Assign to Display Modal */}
      {openDropdown && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#faf9f7] rounded-2xl border-2 border-[#e5e5e5] shadow-2xl p-8 max-w-md w-full mx-4 transform transition-all">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-black mb-2">
                Assign to Display
              </h3>
              <p className="text-gray-600">
                Choose which display will show this loop
              </p>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto mb-6 pr-2">
              {displays.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p className="font-medium mb-2">No displays available</p>
                  <p className="text-sm">
                    Create a display first to assign loops
                  </p>
                </div>
              ) : (
                displays.map(display => (
                  <button
                    key={display._id}
                    onClick={() =>
                      handleAssignToDisplay(openDropdown, display._id)
                    }
                    disabled={assignLoading === openDropdown}
                    className="w-full text-left px-5 py-4 bg-white border-2 border-[#e5e5e5] rounded-xl hover:border-[#8b6f47] hover:shadow-md transition-all duration-200 text-black font-semibold disabled:opacity-50 disabled:cursor-not-allowed group">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#f5f3f0] group-hover:bg-[#8b6f47] transition-colors duration-200 flex items-center justify-center">
                          <Monitor
                            size={20}
                            weight="bold"
                            className="text-[#8b6f47] group-hover:text-white transition-colors duration-200"
                          />
                        </div>
                        <div>
                          <div className="font-bold text-black">
                            {display.displayName}
                          </div>
                          {display.location && (
                            <div className="text-sm text-gray-500">
                              {display.location}
                            </div>
                          )}
                        </div>
                      </div>
                      {assignLoading === openDropdown && (
                        <CircleNotch
                          size={20}
                          className="animate-spin text-[#8b6f47]"
                          weight="bold"
                        />
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>

            <button
              onClick={() => setOpenDropdown(null)}
              disabled={assignLoading === openDropdown}
              className="w-full px-6 py-3 bg-white border-2 border-[#e5e5e5] rounded-xl text-gray-700 font-semibold hover:bg-[#8b6f47] hover:text-white hover:border-[#8b6f47] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#faf9f7] rounded-2xl border-2 border-[#e5e5e5] shadow-2xl p-8 max-w-md w-full mx-4 transform transition-all">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-black mb-2">
                Delete Loop
              </h3>
              <p className="text-gray-600">
                Are you sure you want to delete this loop? This action cannot be
                undone.
              </p>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirmId(null)}
                disabled={deleteLoading === deleteConfirmId}
                className="px-6 py-3 bg-white border-2 border-[#e5e5e5] rounded-xl text-gray-700 font-semibold hover:bg-[#f0ede9] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                disabled={deleteLoading === deleteConfirmId}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
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
