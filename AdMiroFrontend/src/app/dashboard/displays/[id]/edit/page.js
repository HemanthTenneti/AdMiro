"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import axiosInstance from "@/lib/axiosConfig";
import DashboardLayout from "@/components/DashboardLayout";
import { ArrowLeft, CircleNotch } from "phosphor-react";
import gsap from "gsap";

export default function EditDisplayPage() {
  const router = useRouter();
  const params = useParams();
  const displayId = params.id;
  const formRef = useRef(null);

  const [display, setDisplay] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form fields
  const [displayName, setDisplayName] = useState("");
  const [location, setLocation] = useState("");
  const [status, setStatus] = useState("offline");

  const fetchDisplay = async () => {
    try {
      setLoading(true);
      setError("");
      console.log("📤 Fetching display details...");

      const response = await axiosInstance.get(`/api/displays/${displayId}`);
      console.log("✅ Display fetched:", response.data);

      const displayData = response.data.data;
      setDisplay(displayData);
      setDisplayName(displayData.displayName);
      setLocation(displayData.location);
      setStatus(displayData.status || "offline");
    } catch (err) {
      console.error("❌ Error fetching display:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to fetch display details.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Check auth and fetch display
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.push("/login");
      return;
    }

    fetchDisplay();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displayId]);

  const validateForm = () => {
    setError("");

    if (!displayName.trim()) {
      setError("Display name is required.");
      return false;
    }
    if (displayName.trim().length < 3) {
      setError("Display name must be at least 3 characters.");
      return false;
    }

    if (!location.trim()) {
      setError("Location is required.");
      return false;
    }
    if (location.trim().length < 3) {
      setError("Location must be at least 3 characters.");
      return false;
    }

    if (!status) {
      setError("Status is required.");
      return false;
    }

    return true;
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");
      console.log("📤 Updating display...");

      const response = await axiosInstance.put(`/api/displays/${displayId}`, {
        displayName: displayName.trim(),
        location: location.trim(),
        status,
      });

      console.log("✅ Display updated:", response.data);
      setSuccess("Display updated successfully!");
      toast.success("Display updated successfully!");

      // Redirect after 1.5s
      setTimeout(() => {
        router.push(`/dashboard/displays/${displayId}`);
      }, 1500);
    } catch (err) {
      console.error("❌ Error updating display:", err);
      const errorMessage =
        err.response?.data?.message || "Failed to update display.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <main className="min-h-screen bg-linear-to-br from-[#faf9f7] to-[#f5f3f0] p-8">
          <div className="max-w-2xl mx-auto">
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

  if (!display) {
    return (
      <DashboardLayout>
        <main className="min-h-screen bg-linear-to-br from-[#faf9f7] to-[#f5f3f0] p-8">
          <div className="max-w-2xl mx-auto">
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
      <main className="min-h-screen bg-linear-to-br from-[#faf9f7] to-[#f5f3f0] p-8">
        <div className="max-w-2xl mx-auto">
          {/* Back Button */}
          <Link
            href={`/dashboard/displays/${display._id}`}
            className="flex items-center gap-2 text-[#8b6f47] hover:text-[#7a5f3a] font-semibold mb-6 group">
            <ArrowLeft
              size={20}
              weight="bold"
              className="group-hover:-translate-x-1 transition"
            />
            Back to Display
          </Link>

          {/* Edit Form Card */}
          <div
            ref={formRef}
            className="bg-white rounded-2xl border-2 border-[#e5e5e5] overflow-hidden shadow-sm">
            {/* Header */}
            <div className="bg-linear-to-r from-[#8b6f47] to-[#7a5f3a] px-8 py-6 text-white">
              <h1 className="text-3xl font-bold">Edit Display</h1>
              <p className="text-[#e5d4b8] text-sm mt-1">
                Update display settings
              </p>
            </div>

            {/* Form Content */}
            <div className="p-8">
              {/* Error Alert */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                  {error}
                </div>
              )}

              {/* Success Alert */}
              {success && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
                  {success}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Display ID (read-only) */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Display ID
                  </label>
                  <input
                    type="text"
                    value={display.displayId}
                    disabled
                    className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-600 font-mono cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This cannot be changed
                  </p>
                </div>

                {/* Display Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Display Name *
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                    placeholder="e.g., Lobby Display"
                    maxLength={100}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b6f47] focus:border-transparent text-gray-900"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {displayName.length}/100 characters
                  </p>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Location *
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    placeholder="e.g., Main Floor, New York"
                    maxLength={100}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b6f47] focus:border-transparent text-gray-900"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {location.length}/100 characters
                  </p>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Status *
                  </label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b6f47] focus:border-transparent text-gray-900 bg-white">
                    <option value="offline">Offline</option>
                    <option value="online">Online</option>
                    <option value="inactive">Inactive</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Set the current status of the display
                  </p>
                </div>

                {/* Resolution (read-only) */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Resolution
                  </label>
                  <div className="px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-600 font-mono">
                    {display.resolution.width} × {display.resolution.height}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    This cannot be changed
                  </p>
                </div>

                {/* Submit Button */}
                <div className="pt-6 border-t border-[#e5e5e5]">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full px-6 py-3 bg-[#8b6f47] hover:bg-[#7a5f3a] disabled:opacity-50 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2">
                    {submitting ? (
                      <>
                        <CircleNotch
                          size={18}
                          className="animate-spin"
                          weight="bold"
                        />
                        Saving Changes...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Help Section */}
          <div className="mt-8 bg-white rounded-2xl border-2 border-[#e5e5e5] p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              ℹ️ What can you edit?
            </h3>
            <ul className="space-y-2 text-gray-700">
              <li>
                <strong>Display Name:</strong> Change the friendly name of your
                display
              </li>
              <li>
                <strong>Location:</strong> Update where the display is located
              </li>
              <li>
                <strong>Status:</strong> Set whether the display is online,
                offline, or inactive
              </li>
              <li>
                <strong>Display ID & Resolution:</strong> These are locked and
                cannot be changed
              </li>
            </ul>
          </div>
        </div>
      </main>
    </DashboardLayout>
  );
}
