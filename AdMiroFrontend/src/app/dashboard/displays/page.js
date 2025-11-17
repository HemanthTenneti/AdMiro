"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axiosInstance from "@/lib/axiosConfig";
import DashboardLayout from "@/components/DashboardLayout";
import { Plus, Trash, PencilSimple, CircleNotch } from "phosphor-react";
import gsap from "gsap";

export default function DisplaysPage() {
  const router = useRouter();
  const mainRef = useRef(null);
  const [displays, setDisplays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(null);

  // Check auth and fetch displays
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.push("/login");
      return;
    }

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

  const fetchDisplays = async () => {
    try {
      setLoading(true);
      setError("");
      console.log("📤 Fetching displays...");

      const response = await axiosInstance.get("/api/displays");
      console.log("✅ Displays fetched:", response.data);

      setDisplays(response.data.data.displays || []);
    } catch (err) {
      console.error("❌ Error fetching displays:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to fetch displays.";
      setError(errorMessage);
      setDisplays([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async displayId => {
    if (!confirm("Are you sure you want to delete this display?")) {
      return;
    }

    try {
      setDeleteLoading(displayId);
      console.log("🗑️ Deleting display:", displayId);

      await axiosInstance.delete(`/api/displays/${displayId}`);
      console.log("✅ Display deleted");

      // Remove from local state
      setDisplays(displays.filter(d => d._id !== displayId));
    } catch (err) {
      console.error("❌ Error deleting display:", err);
      setError(err.response?.data?.message || "Failed to delete display.");
    } finally {
      setDeleteLoading(null);
    }
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
      <main
        ref={mainRef}
        className="min-h-screen bg-linear-to-br from-[#faf9f7] to-[#f5f3f0] p-8">
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
              Create Display
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
                <p className="text-gray-600">Loading your displays...</p>
              </div>
            </div>
          ) : displays.length === 0 ? (
            // Empty State
            <div className="bg-white rounded-2xl border-2 border-[#e5e5e5] p-12 text-center">
              <h2 className="text-2xl font-bold text-black mb-2">
                No displays yet
              </h2>
              <p className="text-gray-600 mb-8">
                Create your first display to get started managing your digital
                signage.
              </p>
              <Link
                href="/dashboard/displays/new"
                className="inline-block px-8 py-3 bg-[#8b6f47] hover:bg-[#7a5f3a] text-white font-semibold rounded-lg transition">
                Create Display
              </Link>
            </div>
          ) : (
            // Displays Table
            <div className="bg-white rounded-2xl border-2 border-[#e5e5e5] overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#e5e5e5] bg-[#faf9f7]">
                      <th className="px-6 py-4 text-left text-sm font-semibold text-black">
                        Display ID
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-black">
                        Name
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-black">
                        Location
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-black">
                        Resolution
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-black">
                        Created By
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-black">
                        Status
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
                          <span className="font-mono text-sm font-semibold text-[#8b6f47]">
                            {display.displayId}
                          </span>
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
                              className="p-2 text-[#8b6f47] hover:bg-[#f0ede9] rounded-lg transition"
                              title="View/Edit details">
                              <PencilSimple size={18} weight="bold" />
                            </button>
                            <button
                              onClick={() => handleDelete(display._id)}
                              disabled={deleteLoading === display._id}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                              title="Delete display">
                              {deleteLoading === display._id ? (
                                <CircleNotch
                                  size={18}
                                  className="animate-spin"
                                  weight="bold"
                                />
                              ) : (
                                <Trash size={18} />
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
            <div className="mt-6 text-center text-gray-600">
              <p>
                Showing <strong>{displays.length}</strong> display
                {displays.length !== 1 ? "s" : ""}
              </p>
            </div>
          )}
        </div>
      </main>
    </DashboardLayout>
  );
}
