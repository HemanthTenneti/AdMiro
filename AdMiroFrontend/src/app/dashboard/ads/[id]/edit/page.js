"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import axiosInstance from "@/lib/axiosConfig";
import DashboardLayout from "@/components/DashboardLayout";
import { ArrowLeft, CircleNotch } from "phosphor-react";
import gsap from "gsap";

export default function EditAdvertisementPage() {
  const router = useRouter();
  const params = useParams();
  const mainRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    adName: "",
    description: "",
    mediaUrl: "",
    mediaType: "image",
    duration: 5,
    status: "draft",
    scheduledStart: "",
    scheduledEnd: "",
  });

  // Validation errors
  const [errors, setErrors] = useState({});

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
    if (mainRef.current && !loading && mounted) {
      gsap.fromTo(
        mainRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
      );
    }
  }, [loading, mounted]);

  const fetchAdvertisement = async () => {
    try {
      setLoading(true);
      setError("");
      console.log("📤 Fetching advertisement:", params.id);

      const response = await axiosInstance.get(`/api/ads/${params.id}`);
      console.log("✅ Advertisement fetched:", response.data);

      const ad = response.data.data;
      setFormData({
        adName: ad.adName,
        description: ad.description || "",
        mediaUrl: ad.mediaUrl,
        mediaType: ad.mediaType,
        duration: ad.duration,
        status: ad.status,
        scheduledStart: ad.scheduledStart ? ad.scheduledStart.slice(0, 16) : "",
        scheduledEnd: ad.scheduledEnd ? ad.scheduledEnd.slice(0, 16) : "",
      });
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

  const validateForm = () => {
    const newErrors = {};

    // Validate adName
    if (!formData.adName.trim()) {
      newErrors.adName = "Advertisement name is required.";
    } else if (formData.adName.length < 2) {
      newErrors.adName = "Advertisement name must be at least 2 characters.";
    } else if (formData.adName.length > 100) {
      newErrors.adName = "Advertisement name must not exceed 100 characters.";
    }

    // Validate mediaUrl
    if (!formData.mediaUrl.trim()) {
      newErrors.mediaUrl = "Media URL is required.";
    } else {
      try {
        new URL(formData.mediaUrl);
      } catch {
        newErrors.mediaUrl = "Please enter a valid URL.";
      }
    }

    // Validate duration
    const durationNum = parseInt(formData.duration);
    if (!formData.duration) {
      newErrors.duration = "Duration is required.";
    } else if (isNaN(durationNum) || durationNum < 1 || durationNum > 300) {
      newErrors.duration = "Duration must be between 1 and 300 seconds.";
    }

    // Validate scheduled dates if provided
    if (formData.scheduledStart && formData.scheduledEnd) {
      const start = new Date(formData.scheduledStart);
      const end = new Date(formData.scheduledEnd);
      if (start >= end) {
        newErrors.scheduledEnd = "End date must be after start date.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (!validateForm()) {
      setError("Please fix the validation errors above.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      console.log("📤 Updating advertisement...");

      const payload = {
        adName: formData.adName.trim(),
        description: formData.description.trim(),
        mediaUrl: formData.mediaUrl.trim(),
        mediaType: formData.mediaType,
        duration: parseInt(formData.duration),
        status: formData.status,
      };

      // Add optional fields
      if (formData.scheduledStart && formData.scheduledEnd) {
        payload.scheduledStart = formData.scheduledStart;
        payload.scheduledEnd = formData.scheduledEnd;
      }

      const response = await axiosInstance.put(
        `/api/ads/${params.id}`,
        payload
      );
      console.log("✅ Advertisement updated:", response.data);

      setSuccess(true);

      // Redirect after 1.5 seconds
      setTimeout(() => {
        router.push(`/dashboard/ads/${params.id}`);
      }, 1500);
    } catch (err) {
      console.error("❌ Error updating advertisement:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to update advertisement.";
      setError(errorMessage);
      setSuccess(false);
    } finally {
      setSubmitting(false);
    }
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

  if (error && formData.adName === "") {
    return (
      <DashboardLayout>
        <main className="min-h-screen bg-linear-to-br from-[#faf9f7] to-[#f5f3f0] p-8">
          <div className="max-w-3xl mx-auto">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-700 hover:text-black mb-8 transition">
              <ArrowLeft size={20} weight="bold" />
              Back
            </button>

            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 text-center">
              <h2 className="text-2xl font-bold text-red-900 mb-2">
                Unable to Load Advertisement
              </h2>
              <p className="text-red-700 mb-6">{error}</p>
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
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-lg hover:bg-white transition">
              <ArrowLeft size={24} weight="bold" className="text-gray-700" />
            </button>
            <div>
              <h1 className="text-4xl font-bold text-black">
                Edit Advertisement
              </h1>
              <p className="text-gray-600">Update your advertisement details</p>
            </div>
          </div>

          {/* Success Alert */}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
              ✅ Advertisement updated successfully! Redirecting...
            </div>
          )}

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              ❌ {error}
            </div>
          )}

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl border-2 border-[#e5e5e5] p-8 space-y-6">
            {/* Advertisement Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Advertisement Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="adName"
                value={formData.adName}
                onChange={handleInputChange}
                placeholder="e.g., Spring Collection Campaign"
                maxLength={100}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b6f47] focus:border-transparent transition ${
                  errors.adName ? "border-red-500" : "border-gray-300"
                }`}
              />
              <div className="flex items-center justify-between mt-2">
                {errors.adName && (
                  <p className="text-sm text-red-500">{errors.adName}</p>
                )}
                <p className="text-xs text-gray-500 ml-auto">
                  {formData.adName.length}/100
                </p>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Update details about your advertisement campaign"
                maxLength={500}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b6f47] focus:border-transparent transition"
              />
              <p className="text-xs text-gray-500 mt-2">
                {formData.description.length}/500
              </p>
            </div>

            {/* Media Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Media Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Media Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="mediaType"
                  value={formData.mediaType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b6f47] focus:border-transparent transition">
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                </select>
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Duration (seconds) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  placeholder="e.g., 15"
                  min="1"
                  max="300"
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b6f47] focus:border-transparent transition ${
                    errors.duration ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.duration && (
                  <p className="text-sm text-red-500 mt-2">{errors.duration}</p>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  Valid range: 1-300 seconds
                </p>
              </div>
            </div>

            {/* Media URL */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Media URL <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                name="mediaUrl"
                value={formData.mediaUrl}
                onChange={handleInputChange}
                placeholder="https://example.com/image.jpg"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b6f47] focus:border-transparent transition ${
                  errors.mediaUrl ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.mediaUrl && (
                <p className="text-sm text-red-500 mt-2">{errors.mediaUrl}</p>
              )}
              <p className="text-xs text-gray-500 mt-2">
                {formData.mediaType === "image"
                  ? "Recommended: PNG, JPEG, or WebP format"
                  : "Recommended: MP4 or WebM format"}
              </p>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b6f47] focus:border-transparent transition">
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
              </select>
              <p className="text-xs text-gray-500 mt-2">
                Control the publication status of your advertisement.
              </p>
            </div>

            {/* Scheduling Section */}
            <div className="border-t-2 border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-black mb-4">
                Scheduling (Optional)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Scheduled Start */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Start Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    name="scheduledStart"
                    value={formData.scheduledStart}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b6f47] focus:border-transparent transition"
                  />
                </div>

                {/* Scheduled End */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    End Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    name="scheduledEnd"
                    value={formData.scheduledEnd}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b6f47] focus:border-transparent transition ${
                      errors.scheduledEnd ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.scheduledEnd && (
                    <p className="text-sm text-red-500 mt-2">
                      {errors.scheduledEnd}
                    </p>
                  )}
                </div>
              </div>

              <p className="text-xs text-gray-500 mt-4">
                Leave blank to activate the advertisement immediately.
              </p>
            </div>

            {/* Form Actions */}
            <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => router.back()}
                disabled={submitting}
                className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 text-gray-800 font-semibold rounded-lg transition">
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#8b6f47] hover:bg-[#7a5f3a] disabled:opacity-50 text-white font-semibold rounded-lg transition">
                {submitting ? (
                  <>
                    <CircleNotch
                      size={20}
                      className="animate-spin"
                      weight="bold"
                    />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </form>

          {/* Help Section */}
          <div className="mt-8 bg-blue-50 rounded-2xl border border-blue-200 p-6">
            <h3 className="font-semibold text-blue-900 mb-3">💡 Tips</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>
                <strong>Duration:</strong> How long the advertisement plays on
                displays (1-300 seconds)
              </li>
              <li>
                <strong>Status:</strong> Draft (unpublished), Scheduled (future
                campaign), Active (live), or Paused
              </li>
              <li>
                <strong>Scheduling:</strong> Set specific dates to automatically
                start/stop your campaign
              </li>
            </ul>
          </div>
        </div>
      </main>
    </DashboardLayout>
  );
}
