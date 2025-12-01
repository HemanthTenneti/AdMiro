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

  // Check auth and fetch loops
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.push("/login");
      return;
    }

    fetchLoops();
    fetchDisplays();
  }, [router]);

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

  const fetchLoops = async () => {
    try {
      setLoading(true);
      setError("");
      console.log("📤 Fetching loops...");

      const response = await axiosInstance.get("/api/loops?limit=1000");
      console.log("✅ Loops fetched:", response.data);

      setLoops(response.data.data.loops || []);
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
      <main
        ref={mainRef}
        className="min-h-screen bg-linear-to-br from-[#faf9f7] to-[#f5f3f0] p-8">
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
              href="/dashboard/displays"
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
                No loops yet
              </h2>
              <p className="text-gray-600 mb-8">
                Create your first display loop to start managing advertisement
                playlists across your displays.
              </p>
              <Link
                href="/dashboard/displays"
                className="inline-block px-8 py-3 bg-[#8b6f47] hover:bg-[#7a5f3a] text-white font-semibold rounded-lg transition">
                Go to Displays to Create Loop
              </Link>
            </div>
          ) : (
            // Loops Table
            <div className="bg-white rounded-2xl border-2 border-[#e5e5e5] shadow-sm">
              <div className="overflow-x-auto overflow-y-visible">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#e5e5e5] bg-[#faf9f7]">
                      <th className="px-6 py-4 text-left text-sm font-semibold text-black">
                        Loop Name
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-black">
                        Display
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-black">
                        Rotation Type
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
                          <Link
                            href={`/dashboard/displays/${
                              typeof loop.displayId === "string"
                                ? loop.displayId
                                : loop.displayId?._id || ""
                            }`}
                            className="text-[#8b6f47] hover:text-[#6d5636] font-medium">
                            {loop.displayName || "Unknown Display"}
                          </Link>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-block px-3 py-1 bg-[#8b6f47] text-white text-xs font-semibold rounded-full">
                            {getRotationTypeLabel(loop.rotationType)}
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
                                      {idx + 1}. {ad.adName || "Unknown Ad"}
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

          {/* Loops Count */}
          {loops.length > 0 && (
            <div className="mt-6 text-center text-gray-600">
              <p>
                Showing <strong>{loops.length}</strong> loop
                {loops.length !== 1 ? "s" : ""}
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Assign to Display Modal */}
      {openDropdown && (
        <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Select a Display
            </h3>
            <p className="text-gray-600 mb-6">
              Choose which display to assign this playlist to:
            </p>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {displays.map(display => (
                <button
                  key={display._id}
                  onClick={() =>
                    handleAssignToDisplay(openDropdown, display._id)
                  }
                  disabled={assignLoading === openDropdown}
                  className="w-full text-left px-4 py-3 border border-gray-200 rounded-lg hover:bg-[#faf9f7] hover:border-[#8b6f47] transition text-gray-900 font-medium disabled:opacity-50">
                  {display.displayName}
                </button>
              ))}
            </div>
            <button
              onClick={() => setOpenDropdown(null)}
              disabled={assignLoading === openDropdown}
              className="w-full mt-6 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition disabled:opacity-50">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Delete Loop
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this loop? This action cannot be
              undone.
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
