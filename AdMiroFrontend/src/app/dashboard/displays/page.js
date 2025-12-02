"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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
  Copy,
  Check,
  CaretLeft,
  CaretRight,
} from "phosphor-react";
import gsap from "gsap";

export default function DisplaysPage() {
  const router = useRouter();
  const mainRef = useRef(null);
  const [displays, setDisplays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeSearchTerm, setActiveSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [copiedId, setCopiedId] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [sortBy, setSortBy] = useState(null);
  const [sortOrder, setSortOrder] = useState("none"); // "none", "asc", "desc"
  const itemsPerPage = 8;

  const fetchDisplays = useCallback(
    async (pageNum = 1) => {
      try {
        setLoading(true);
        setError("");
        console.log(`📤 Fetching displays - Page ${pageNum}...`);

        const params = {
          page: pageNum,
          limit: itemsPerPage,
        };

        // Add search parameter if there's a search term
        if (activeSearchTerm.trim()) {
          params.search = activeSearchTerm.trim();
        }

        // Add sorting parameters if a column is sorted
        if (sortBy && sortOrder !== "none") {
          params.sortBy = sortBy;
          params.order = sortOrder === "asc" ? "asc" : "desc";
        }

        const response = await axiosInstance.get("/api/displays", {
          params,
        });
        console.log("✅ Displays fetched:", response.data);

        setDisplays(response.data.data.displays || []);

        // Set pagination info from backend response
        const pagination = response.data.data.pagination;
        if (pagination) {
          setTotalPages(pagination.totalPages);
          setTotalItems(pagination.total);
        }
      } catch (err) {
        console.error("❌ Error fetching displays:", err);
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          "Failed to fetch displays.";
        setError(errorMessage);
        toast.error(errorMessage);
        setDisplays([]);
      } finally {
        setLoading(false);
      }
    },
    [activeSearchTerm, itemsPerPage, sortBy, sortOrder]
  );

  // Check auth and fetch displays
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.push("/login");
      return;
    }

    fetchDisplays(page);
  }, [router, page, fetchDisplays]);

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

  const handleDelete = async displayId => {
    try {
      setDeleteLoading(displayId);
      console.log("🗑️ Deleting display:", displayId);

      await axiosInstance.delete(`/api/displays/${displayId}`);
      console.log("✅ Display deleted");

      toast.success("Display deleted successfully!");
      setDeleteConfirmId(null);

      // Refetch displays to update the list and pagination
      fetchDisplays(page);
    } catch (err) {
      console.error("❌ Error deleting display:", err);
      const errorMessage =
        err.response?.data?.message || "Failed to delete display.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleCopyDisplayId = displayId => {
    navigator.clipboard.writeText(displayId);
    setCopiedId(displayId);
    toast.success("Display ID copied!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleColumnSort = columnName => {
    setPage(1); // Reset to first page when sorting changes
    if (sortBy === columnName) {
      // Cycle through: asc -> desc -> none -> asc
      const nextOrder =
        sortOrder === "asc" ? "desc" : sortOrder === "desc" ? "none" : "asc";
      setSortOrder(nextOrder);
      if (nextOrder === "none") {
        setSortBy(null);
      }
    } else {
      // New column - start with ascending
      setSortBy(columnName);
      setSortOrder("asc");
    }
  };

  const getSortIndicator = columnName => {
    if (sortBy !== columnName) return "";
    if (sortOrder === "asc") return " ↑";
    if (sortOrder === "desc") return " ↓";
    return "";
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

  const getStatusColor = status => {
    switch (status) {
      case "online":
        return "bg-green-100 text-green-800";
      case "offline":
        return "bg-red-100 text-red-800";
      case "inactive":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <DashboardLayout>
      <main ref={mainRef} className="min-h-screen p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-black mb-2">Displays</h1>
              <p className="text-gray-600">Manage your display devices</p>
            </div>
            <Link
              href="/dashboard/displays/new"
              className="flex items-center gap-2 px-6 py-3 bg-[#8b6f47] hover:bg-[#7a5f3a] text-white font-semibold rounded-lg transition">
              <Plus size={20} weight="bold" />
              Add Display
            </Link>
          </div>

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
                placeholder="Search by Display ID, Name, Location, Creator, Resolution, or Status..."
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
                Found <strong>{totalItems}</strong> display
                {totalItems !== 1 ? "s" : ""} for &ldquo;{activeSearchTerm}
                &rdquo;
              </p>
            )}
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
                <p className="text-gray-600">Loading your displays...</p>
              </div>
            </div>
          ) : displays.length === 0 ? (
            // Empty State
            <div className="bg-white rounded-2xl border-2 border-[#e5e5e5] p-12 text-center">
              <h2 className="text-2xl font-bold text-black mb-2">
                {activeSearchTerm ? "No displays found" : "No displays yet"}
              </h2>
              <p className="text-gray-600 mb-8">
                {activeSearchTerm
                  ? "Try adjusting your search terms"
                  : "Create your first display to get started managing your digital signage."}
              </p>
              {!activeSearchTerm && (
                <Link
                  href="/dashboard/displays/new"
                  className="inline-block px-8 py-3 bg-[#8b6f47] hover:bg-[#7a5f3a] text-white font-semibold rounded-lg transition">
                  Add Display
                </Link>
              )}
            </div>
          ) : (
            // Displays Table
            <div className="bg-white rounded-2xl border-2 border-[#e5e5e5] overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#e5e5e5] bg-[#faf9f7]">
                      <th
                        onClick={() => handleColumnSort("displayId")}
                        className="px-6 py-4 text-left text-sm font-semibold text-black cursor-pointer hover:bg-[#ede8df] transition">
                        Display ID{getSortIndicator("displayId")}
                      </th>
                      <th
                        onClick={() => handleColumnSort("displayName")}
                        className="px-6 py-4 text-left text-sm font-semibold text-black cursor-pointer hover:bg-[#ede8df] transition">
                        Name{getSortIndicator("displayName")}
                      </th>
                      <th
                        onClick={() => handleColumnSort("location")}
                        className="px-6 py-4 text-left text-sm font-semibold text-black cursor-pointer hover:bg-[#ede8df] transition">
                        Location{getSortIndicator("location")}
                      </th>
                      <th
                        onClick={() => handleColumnSort("resolution")}
                        className="px-6 py-4 text-left text-sm font-semibold text-black cursor-pointer hover:bg-[#ede8df] transition">
                        Resolution{getSortIndicator("resolution")}
                      </th>
                      <th
                        onClick={() => handleColumnSort("assignedAdmin")}
                        className="px-6 py-4 text-left text-sm font-semibold text-black cursor-pointer hover:bg-[#ede8df] transition">
                        Created By{getSortIndicator("assignedAdmin")}
                      </th>
                      <th
                        onClick={() => handleColumnSort("status")}
                        className="px-6 py-4 text-left text-sm font-semibold text-black cursor-pointer hover:bg-[#ede8df] transition">
                        Status{getSortIndicator("status")}
                      </th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-black">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {displays.map((display, index) => (
                      <tr
                        key={display._id}
                        className="border-b border-[#e5e5e5] hover:bg-[#faf9f7] transition">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm font-semibold text-[#8b6f47]">
                              {display.displayId}
                            </span>
                            <button
                              onClick={() =>
                                handleCopyDisplayId(display.displayId)
                              }
                              className="p-1 hover:bg-[#f5f0e8] rounded transition"
                              title="Copy Display ID">
                              {copiedId === display.displayId ? (
                                <Check
                                  size={16}
                                  weight="bold"
                                  className="text-green-600"
                                />
                              ) : (
                                <Copy
                                  size={16}
                                  weight="bold"
                                  className="text-gray-400 hover:text-[#8b6f47]"
                                />
                              )}
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-black font-medium">
                            {display.displayName}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-gray-600">
                            {display.location}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-gray-600 text-sm">
                            {display.resolution.width} ×{" "}
                            {display.resolution.height}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-gray-600 text-sm">
                            {display.assignedAdmin?.firstName &&
                            display.assignedAdmin?.lastName
                              ? `${display.assignedAdmin.firstName} ${display.assignedAdmin.lastName}`
                              : display.assignedAdmin?.username || "Unknown"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                              display.status
                            )}`}>
                            {display.status.charAt(0).toUpperCase() +
                              display.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() =>
                                router.push(
                                  `/dashboard/displays/${display._id}`
                                )
                              }
                              className="flex items-center gap-2 px-4 py-2 text-[#8b6f47] hover:bg-[#f0ede9] rounded-lg transition font-medium"
                              title="View/Edit details">
                              <PencilSimple size={18} weight="bold" />
                              Edit
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(display._id)}
                              disabled={deleteLoading === display._id}
                              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50 font-medium"
                              title="Delete display">
                              {deleteLoading === display._id ? (
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

          {/* Displays Count */}
          {displays.length > 0 && (
            <div className="mt-12">
              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex flex-col items-center gap-6">
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
                            <span className="px-2 text-gray-400 text-lg">
                              ···
                            </span>
                          )}
                        </>
                      )}

                      {/* Page Range Around Current */}
                      {Array.from(
                        { length: Math.min(5, totalPages) },
                        (_, i) => {
                          const startPage = Math.max(
                            1,
                            Math.min(page - 2, totalPages - 4)
                          );
                          return startPage + i;
                        }
                      ).map(pageNum => (
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
                            <span className="px-2 text-gray-400 text-lg">
                              ···
                            </span>
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
                    Page{" "}
                    <span className="text-[#8b6f47] font-bold">{page}</span> of{" "}
                    <span className="text-[#8b6f47] font-bold">
                      {totalPages}
                    </span>
                  </div>
                </div>
              )}

              {/* Count Summary */}
              <div className="text-center text-gray-600">
                <p>
                  Showing{" "}
                  <strong>
                    {(page - 1) * itemsPerPage + 1}-
                    {(page - 1) * itemsPerPage + displays.length}
                  </strong>{" "}
                  of <strong>{totalItems}</strong> display
                  {totalItems !== 1 ? "s" : ""}
                  {activeSearchTerm && ` (filtered)`}
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Delete Confirmation Dialog */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Delete Display
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this display? This action cannot
              be undone.
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
