"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import axiosInstance from "@/lib/axiosConfig";
import DashboardLayout from "@/components/DashboardLayout";
import {
  ArrowLeft,
  CircleNotch,
  Trash,
  PencilSimple,
  Copy,
  Check,
} from "phosphor-react";
import gsap from "gsap";

export default function AdvertisementDetailPage() {
  const router = useRouter();
  const params = useParams();
  const mainRef = useRef(null);

  const [ad, setAd] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [copiedField, setCopiedField] = useState(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.push("/login");
      return;
    }

    if (params?.id) {
      fetchAdvertisement();
    }
  }, [mounted, params?.id, router]);

  useEffect(() => {
    if (mainRef.current && ad && !loading) {
      gsap.fromTo(
        mainRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
      );
    }
  }, [loading, ad]);

  const fetchAdvertisement = async () => {
    try {
      setLoading(true);
      setError("");
      console.log("📤 Fetching advertisement:", params.id);

      const response = await axiosInstance.get(`/api/ads/${params.id}`);
      console.log("✅ Advertisement fetched:", response.data);

      setAd(response.data.data);
    } catch (err) {
      console.error("❌ Error fetching advertisement:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to fetch advertisement.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this advertisement?")) {
      return;
    }

    try {
      setDeleteLoading(true);
      console.log("🗑️ Deleting advertisement:", params.id);

      await axiosInstance.delete(`/api/ads/${params.id}`);
      console.log("✅ Advertisement deleted");

      router.push("/dashboard/ads");
    } catch (err) {
      console.error("❌ Error deleting advertisement:", err);
      setError(
        err.response?.data?.message || "Failed to delete advertisement."
      );
      setDeleteLoading(false);
    }
  };

  const updateStatus = async newStatus => {
    try {
      setStatusLoading(true);
      console.log("🔄 Updating status to:", newStatus);

      const response = await axiosInstance.put(`/api/ads/${params.id}/status`, {
        status: newStatus,
      });
      console.log("✅ Status updated:", response.data);

      setAd(response.data.data);
    } catch (err) {
      console.error("❌ Error updating status:", err);
      setError(err.response?.data?.message || "Failed to update status.");
    } finally {
      setStatusLoading(false);
    }
  };

  const copyToClipboard = async (text, field) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error("Error copying to clipboard:", err);
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

  const getStatusActions = () => {
    if (!ad) return [];

    const currentStatus = ad.status;
    const allStatuses = ["draft", "scheduled", "active", "paused", "expired"];

    // Filter out current status and expired (can't change to expired manually)
    return allStatuses.filter(
      status => status !== currentStatus && status !== "expired"
    );
  };

  if (!mounted) {
    return null;
  }

  if (loading) {
    return (
      <DashboardLayout>
        <main className="min-h-screen bg-linear-to-br from-[#faf9f7] to-[#f5f3f0] p-8 flex items-center justify-center">
          <div className="text-center">
            <CircleNotch
              size={48}
              className="text-[#8b6f47] animate-spin mx-auto mb-4"
              weight="bold"
            />
            <p className="text-gray-600">Loading advertisement...</p>
          </div>
        </main>
      </DashboardLayout>
    );
  }

  if (error || !ad) {
    return (
      <DashboardLayout>
        <main className="min-h-screen bg-linear-to-br from-[#faf9f7] to-[#f5f3f0] p-8">
          <div className="max-w-3xl mx-auto">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-700 hover:text-black mb-8 transition">
              <ArrowLeft size={20} weight="bold" />
              Back to Advertisements
            </button>

            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 text-center">
              <h2 className="text-2xl font-bold text-red-900 mb-2">
                Unable to Load Advertisement
              </h2>
              <p className="text-red-700 mb-6">
                {error || "Advertisement not found"}
              </p>
              <Link
                href="/dashboard/ads"
                className="inline-block px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition">
                Back to Advertisements
              </Link>
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
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-lg hover:bg-white transition">
              <ArrowLeft size={24} weight="bold" className="text-gray-700" />
            </button>
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-black">{ad.adName}</h1>
              <p className="text-gray-600">Advertisement Details</p>
            </div>
            <span
              className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(
                ad.status
              )}`}>
              {ad.status.charAt(0).toUpperCase() + ad.status.slice(1)}
            </span>
          </div>

          {/* Media Preview */}
          {ad.mediaUrl && (
            <div className="mb-8 bg-white rounded-2xl border-2 border-[#e5e5e5] overflow-hidden">
              <div className="w-full aspect-video bg-gray-200 flex items-center justify-center">
                {ad.mediaType === "image" ? (
                  <img
                    src={ad.mediaUrl}
                    alt={ad.adName}
                    className="w-full h-full object-cover"
                    onError={e => {
                      e.target.style.display = "none";
                    }}
                  />
                ) : (
                  <video
                    src={ad.mediaUrl}
                    controls
                    className="w-full h-full"
                    onError={e => {
                      e.target.style.display = "none";
                    }}
                  />
                )}
              </div>
            </div>
          )}

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Information */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Info */}
              <div className="bg-white rounded-2xl border-2 border-[#e5e5e5] p-8">
                <h2 className="text-xl font-bold text-black mb-6">
                  Information
                </h2>

                <div className="space-y-6">
                  {/* Ad ID */}
                  <div>
                    <label className="text-sm font-semibold text-gray-700">
                      Advertisement ID
                    </label>
                    <div className="flex items-center gap-2 mt-2 p-3 bg-gray-50 rounded-lg">
                      <code className="flex-1 text-gray-800 font-mono text-sm">
                        {ad.adId || ad._id}
                      </code>
                      <button
                        onClick={() => copyToClipboard(ad.adId || ad._id, "id")}
                        className="p-2 hover:bg-gray-200 rounded transition">
                        {copiedField === "id" ? (
                          <Check
                            size={18}
                            className="text-green-600"
                            weight="bold"
                          />
                        ) : (
                          <Copy
                            size={18}
                            className="text-gray-600"
                            weight="bold"
                          />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Description */}
                  {ad.description && (
                    <div>
                      <label className="text-sm font-semibold text-gray-700">
                        Description
                      </label>
                      <p className="mt-2 p-3 bg-gray-50 rounded-lg text-gray-800">
                        {ad.description}
                      </p>
                    </div>
                  )}

                  {/* Duration */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-semibold text-gray-700">
                        Duration
                      </label>
                      <p className="mt-2 text-2xl font-bold text-black">
                        {ad.duration}s
                      </p>
                    </div>

                    {/* Media Type */}
                    <div>
                      <label className="text-sm font-semibold text-gray-700">
                        Media Type
                      </label>
                      <div className="mt-2 inline-block px-4 py-2 bg-blue-50 rounded-lg text-blue-800 font-semibold">
                        {ad.mediaType === "image" ? "🖼️ Image" : "🎬 Video"}
                      </div>
                    </div>
                  </div>

                  {/* Media URL */}
                  <div>
                    <label className="text-sm font-semibold text-gray-700">
                      Media URL
                    </label>
                    <div className="flex items-center gap-2 mt-2 p-3 bg-gray-50 rounded-lg overflow-hidden">
                      <code className="flex-1 text-gray-800 font-mono text-xs truncate">
                        {ad.mediaUrl}
                      </code>
                      <button
                        onClick={() => copyToClipboard(ad.mediaUrl, "url")}
                        className="p-2 hover:bg-gray-200 rounded transition flex-shrink-0">
                        {copiedField === "url" ? (
                          <Check
                            size={18}
                            className="text-green-600"
                            weight="bold"
                          />
                        ) : (
                          <Copy
                            size={18}
                            className="text-gray-600"
                            weight="bold"
                          />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Scheduling Info */}
              {ad.scheduledStart && ad.scheduledEnd && (
                <div className="bg-blue-50 rounded-2xl border-2 border-blue-200 p-8">
                  <h2 className="text-xl font-bold text-blue-900 mb-6">
                    Schedule
                  </h2>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-semibold text-blue-800">
                        Start Date & Time
                      </label>
                      <p className="mt-2 text-lg text-blue-900 font-semibold">
                        {new Date(ad.scheduledStart).toLocaleString()}
                      </p>
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-blue-800">
                        End Date & Time
                      </label>
                      <p className="mt-2 text-lg text-blue-900 font-semibold">
                        {new Date(ad.scheduledEnd).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Stats */}
              <div className="bg-white rounded-2xl border-2 border-[#e5e5e5] p-8">
                <h2 className="text-xl font-bold text-black mb-6">
                  Performance
                </h2>

                <div className="space-y-4">
                  <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                    <p className="text-sm text-gray-600">Views</p>
                    <p className="text-3xl font-bold text-blue-900">
                      {ad.views || 0}
                    </p>
                  </div>

                  <div className="text-center p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
                    <p className="text-sm text-gray-600">Clicks</p>
                    <p className="text-3xl font-bold text-green-900">
                      {ad.clicks || 0}
                    </p>
                  </div>

                  {ad.views > 0 && (
                    <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg">
                      <p className="text-sm text-gray-600">
                        Click-Through Rate
                      </p>
                      <p className="text-3xl font-bold text-purple-900">
                        {((ad.clicks / ad.views) * 100).toFixed(2)}%
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Status Actions */}
              {getStatusActions().length > 0 && (
                <div className="bg-white rounded-2xl border-2 border-[#e5e5e5] p-8">
                  <h2 className="text-xl font-bold text-black mb-4">
                    Change Status
                  </h2>

                  <div className="space-y-2">
                    {getStatusActions().map(status => (
                      <button
                        key={status}
                        onClick={() => updateStatus(status)}
                        disabled={statusLoading}
                        className="w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-gray-800 font-semibold rounded-lg transition text-sm capitalize">
                        {statusLoading ? (
                          <CircleNotch
                            size={16}
                            className="inline animate-spin mr-2"
                            weight="bold"
                          />
                        ) : null}
                        Change to {status}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Timestamps */}
              <div className="bg-gray-50 rounded-2xl border-2 border-gray-200 p-8">
                <h2 className="text-sm font-semibold text-gray-700 mb-4">
                  Timestamps
                </h2>

                <div className="space-y-3 text-xs text-gray-600">
                  <div>
                    <p className="font-semibold">Created</p>
                    <p>{new Date(ad.createdAt).toLocaleString()}</p>
                  </div>

                  <div>
                    <p className="font-semibold">Last Updated</p>
                    <p>{new Date(ad.updatedAt).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <button
                  onClick={() => router.push(`/dashboard/ads/${ad._id}/edit`)}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#8b6f47] hover:bg-[#7a5f3a] text-white font-semibold rounded-lg transition">
                  <PencilSimple size={18} weight="bold" />
                  Edit
                </button>

                <button
                  onClick={handleDelete}
                  disabled={deleteLoading}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-semibold rounded-lg transition">
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
                      Delete
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
