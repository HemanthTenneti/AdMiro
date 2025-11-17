"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import axiosInstance from "@/lib/axiosConfig";
import DashboardLayout from "@/components/DashboardLayout";
import { CircleNotch, Trash, Pencil, Plus, ListChecks } from "phosphor-react";

export default function DisplayLoopsPage() {
  const router = useRouter();
  const params = useParams();
  const displayId = params.id;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [loops, setLoops] = useState([]);
  const [displayName, setDisplayName] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const LIMIT = 10;

  const fetchDisplay = useCallback(async () => {
    try {
      const response = await axiosInstance.get(`/api/displays/${displayId}`);
      setDisplayName(response.data.data.displayName);
    } catch (err) {
      console.error("Error fetching display:", err);
    }
  }, [displayId]);

  const fetchLoops = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await axiosInstance.get(
        `/api/loops/displays/${displayId}/loops?page=${page}&limit=${LIMIT}`
      );
      setLoops(response.data.data.loops);
      setTotalPages(response.data.data.pagination.totalPages);
    } catch (err) {
      console.error("Error fetching loops:", err);
      const errorMessage =
        err.response?.data?.message || "Failed to load loops";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [displayId, page]);

  useEffect(() => {
    if (displayId) {
      fetchLoops();
      fetchDisplay();
    }
  }, [displayId, page, fetchLoops, fetchDisplay]);

  const handleDelete = async loopId => {
    setDeleting(true);
    try {
      await axiosInstance.delete(`/api/loops/${loopId}`);
      setLoops(loops.filter(l => l._id !== loopId));
      setDeleteConfirm(null);
      toast.success("Loop deleted successfully!");
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to delete loop";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setDeleting(false);
    }
  };

  const formatDuration = seconds => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${secs}s`;
    return `${secs}s`;
  };

  return (
    <DashboardLayout>
      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Playlists for {displayName}
            </h1>
            <p className="text-gray-600">Manage advertisement playlists</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {/* Create New Loop Button */}
          <div className="mb-6">
            <button
              onClick={() =>
                router.push(`/dashboard/displays/${displayId}/loops/new`)
              }
              className="flex items-center gap-2 px-6 py-3 bg-[#8b6f47] hover:bg-[#7a5f3a] text-white font-semibold rounded-lg transition">
              <Plus size={20} weight="bold" />
              Create New Playlist
            </button>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="flex justify-center py-12">
              <CircleNotch size={48} className="animate-spin text-[#8b6f47]" />
            </div>
          ) : loops.length === 0 ? (
            /* Empty State */
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <ListChecks size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No playlists yet
              </h3>
              <p className="text-gray-600 mb-6">
                Create your first playlist to assign ads to this display
              </p>
              <button
                onClick={() =>
                  router.push(`/dashboard/displays/${displayId}/loops/new`)
                }
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#8b6f47] hover:bg-[#7a5f3a] text-white font-semibold rounded-lg transition">
                <Plus size={20} weight="bold" />
                Create Playlist
              </button>
            </div>
          ) : (
            /* Loops List */
            <div className="grid gap-4">
              {loops.map(loop => (
                <div
                  key={loop._id}
                  className="p-6 bg-white rounded-lg border border-gray-200 hover:border-[#8b6f47] transition">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        {loop.loopName}
                      </h3>
                      {loop.description && (
                        <p className="text-gray-600 text-sm mt-1">
                          {loop.description}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          router.push(
                            `/dashboard/displays/${displayId}/loops/${loop._id}/edit`
                          )
                        }
                        className="p-2 text-gray-600 hover:text-[#8b6f47] hover:bg-[#faf9f7] rounded-lg transition">
                        <Pencil size={20} weight="bold" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(loop._id)}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
                        <Trash2 size={20} weight="bold" />
                      </button>
                    </div>
                  </div>

                  {/* Loop Details */}
                  <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                    <div>
                      <p className="text-gray-600">Advertisements</p>
                      <p className="text-xl font-semibold text-gray-900">
                        {loop.advertisements?.length || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Total Duration</p>
                      <p className="text-xl font-semibold text-gray-900">
                        {formatDuration(loop.totalDuration || 0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Rotation Type</p>
                      <p className="text-xl font-semibold text-gray-900 capitalize">
                        {loop.rotationType}
                      </p>
                    </div>
                  </div>

                  {/* Ads Preview */}
                  {loop.advertisements && loop.advertisements.length > 0 && (
                    <div className="pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-600 mb-2">
                        Advertisements in order:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {loop.advertisements.map((item, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-[#faf9f7] text-gray-700 text-sm rounded-full border border-gray-300">
                            {item.adId?.adName || "Unknown"}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50">
                Previous
              </button>
              <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-10 h-10 rounded-lg font-semibold transition ${
                      page === p
                        ? "bg-[#8b6f47] text-white"
                        : "border border-gray-300 hover:bg-gray-50"
                    }`}>
                    {p}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50">
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Delete Playlist?
            </h3>
            <p className="text-gray-600 mb-6">
              This action cannot be undone. All associations with advertisements
              will be removed.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setDeleteConfirm(null)}
                disabled={deleting}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50">
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                disabled={deleting}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg disabled:opacity-50">
                {deleting ? (
                  <>
                    <CircleNotch size={16} className="animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
