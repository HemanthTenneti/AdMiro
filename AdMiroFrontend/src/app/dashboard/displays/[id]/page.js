"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import axiosInstance from "@/lib/axiosConfig";
import DashboardLayout from "@/components/DashboardLayout";
import { ArrowLeft, PencilSimple, Trash, CircleNotch } from "phosphor-react";
import gsap from "gsap";

export default function DisplayDetailPage() {
  const router = useRouter();
  const params = useParams();
  const displayId = params?.id;
  const mainRef = useRef(null);

  const [display, setDisplay] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Wait for client mount and params to be available
  useEffect(() => {
    setMounted(true);
  }, []);

  // Check auth and fetch display
  useEffect(() => {
    if (!mounted || !displayId) return;

    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.push("/login");
      return;
    }

    fetchDisplay();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displayId, mounted]);

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

  const fetchDisplay = async () => {
    try {
      setLoading(true);
      setError("");
      console.log("📤 Fetching display details...");

      const response = await axiosInstance.get(`/api/displays/${displayId}`);
      console.log("✅ Display fetched:", response.data);

      setDisplay(response.data.data);
    } catch (err) {
      console.error("❌ Error fetching display:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to fetch display details.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this display? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      setDeleteLoading(true);
      console.log("🗑️ Deleting display:", displayId);

      await axiosInstance.delete(`/api/displays/${displayId}`);
      console.log("✅ Display deleted");

      router.push("/dashboard/displays");
    } catch (err) {
      console.error("❌ Error deleting display:", err);
      setError(err.response?.data?.message || "Failed to delete display.");
      setDeleteLoading(false);
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

  if (loading) {
    return (
      <DashboardLayout>
        <main className="min-h-screen bg-linear-to-br from-[#faf9f7] to-[#f5f3f0] p-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <CircleNotch
                  size={48}
                  className="text-[#8b6f47] animate-spin mx-auto mb-4"
                  weight="bold"
                />
                <p className="text-gray-600">Loading display details...</p>
              </div>
            </div>
          </div>
        </main>
      </DashboardLayout>
    );
  }

  if (error || !display) {
    return (
      <DashboardLayout>
        <main className="min-h-screen bg-linear-to-br from-[#faf9f7] to-[#f5f3f0] p-8">
          <div className="max-w-4xl mx-auto">
            {/* Back Button */}
            <Link
              href="/dashboard/displays"
              className="flex items-center gap-2 text-[#8b6f47] hover:text-[#7a5f3a] font-semibold mb-6">
              <ArrowLeft size={20} weight="bold" />
              Back to Displays
            </Link>

            {/* Error Alert */}
            <div className="bg-white rounded-2xl border-2 border-red-200 p-8 text-center">
              <h1 className="text-2xl font-bold text-red-700 mb-2">Error</h1>
              <p className="text-gray-600">{error || "Display not found."}</p>
            </div>
          </div>
        </main>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <main
        ref={mainRef}
        className="min-h-screen bg-linear-to-br from-[#faf9f7] to-[#f5f3f0] p-8">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Link
            href="/dashboard/displays"
            className="flex items-center gap-2 text-[#8b6f47] hover:text-[#7a5f3a] font-semibold mb-6 group">
            <ArrowLeft
              size={20}
              weight="bold"
              className="group-hover:-translate-x-1 transition"
            />
            Back to Displays
          </Link>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {/* Display Details Card */}
          <div className="bg-white rounded-2xl border-2 border-[#e5e5e5] overflow-hidden shadow-sm">
            {/* Header */}
            <div className="bg-linear-to-r from-[#8b6f47] to-[#7a5f3a] px-8 py-6 text-white">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2">
                    {display.displayName}
                  </h1>
                  <p className="text-[#e5d4b8] text-sm">
                    ID: <span className="font-mono">{display.displayId}</span>
                  </p>
                </div>
                <span
                  className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(
                    display.status
                  )}`}>
                  {display.status.charAt(0).toUpperCase() +
                    display.status.slice(1)}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {/* Location */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Location
                  </label>
                  <p className="text-gray-900 text-lg">{display.location}</p>
                </div>

                {/* Resolution */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Resolution
                  </label>
                  <p className="text-gray-900 text-lg">
                    {display.resolution.width} × {display.resolution.height}
                  </p>
                </div>

                {/* Connection Token */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Connection Token
                  </label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-gray-100 p-3 rounded-lg text-sm text-gray-900 font-mono overflow-x-auto">
                      {display.connectionToken}
                    </code>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(display.connectionToken);
                        alert("Token copied to clipboard!");
                      }}
                      className="px-4 py-2 bg-[#8b6f47] hover:bg-[#7a5f3a] text-white font-semibold rounded-lg transition whitespace-nowrap">
                      Copy
                    </button>
                  </div>
                </div>

                {/* Created At */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Created
                  </label>
                  <p className="text-gray-900 text-lg">
                    {new Date(display.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>

                {/* Last Updated */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Last Updated
                  </label>
                  <p className="text-gray-900 text-lg">
                    {new Date(display.updatedAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-4 pt-8 border-t border-[#e5e5e5]">
                <Link
                  href={`/dashboard/displays/${display._id}/edit`}
                  className="flex items-center gap-2 px-6 py-3 bg-[#8b6f47] hover:bg-[#7a5f3a] text-white font-semibold rounded-lg transition">
                  <PencilSimple size={18} weight="bold" />
                  Edit Display
                </Link>

                <button
                  onClick={handleDelete}
                  disabled={deleteLoading}
                  className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition disabled:opacity-50">
                  {deleteLoading ? (
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
                      <Trash size={18} weight="bold" />
                      Delete Display
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </DashboardLayout>
  );
}
