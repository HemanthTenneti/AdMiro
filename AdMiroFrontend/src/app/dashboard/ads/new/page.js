"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import axiosInstance from "@/lib/axiosConfig";
import DashboardLayout from "@/components/DashboardLayout";
import {
  ArrowLeft,
  CircleNotch,
  Upload,
  Paste,
  Link as LinkIcon,
} from "phosphor-react";
import gsap from "gsap";

export default function NewAdvertisementPage() {
  const router = useRouter();
  const mainRef = useRef(null);
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [mediaInputMode, setMediaInputMode] = useState("file"); // "file" or "link"
  const [mediaLink, setMediaLink] = useState("");

  // Form data
  const [formData, setFormData] = useState({
    adName: "",
    description: "",
    mediaType: "image",
    duration: 5,
  });

  // Validation errors
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.push("/login");
      return;
    }
  }, [router]);

  useEffect(() => {
    if (mainRef.current && mounted) {
      gsap.fromTo(
        mainRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
      );
    }
  }, [mounted]);

  // Handle paste from clipboard
  useEffect(() => {
    const handlePaste = async e => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let item of items) {
        if (item.type.startsWith("image/")) {
          e.preventDefault();
          const blob = item.getAsFile();
          handleFile(blob);
          toast.success("Image pasted! Ready to upload.");
          break;
        }
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, []);

  const handleFile = file => {
    // Validate file type
    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");

    if (!isImage && !isVideo) {
      setError("Please select an image or video file.");
      toast.error("Invalid file type. Only images and videos are allowed.");
      return;
    }

    // Validate file size (100MB)
    const maxSize = 100 * 1024 * 1024;
    if (file.size > maxSize) {
      setError("File size must not exceed 100MB.");
      toast.error("File too large. Maximum 100MB allowed.");
      return;
    }

    setSelectedFile(file);
    setFormData(prev => ({
      ...prev,
      mediaType: isImage ? "image" : "video",
    }));

    // Create preview
    const reader = new FileReader();
    reader.onload = e => {
      setMediaPreview({
        data: e.target.result,
        type: isImage ? "image" : "video",
        name: file.name,
        size: (file.size / 1024 / 1024).toFixed(2), // MB
      });
    };
    reader.readAsDataURL(file);

    setError("");
    if (errors.media) {
      setErrors(prev => ({ ...prev, media: "" }));
    }
  };

  const handleDrag = e => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = e => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer?.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.adName.trim()) {
      newErrors.adName = "Advertisement name is required.";
    } else if (formData.adName.length < 2) {
      newErrors.adName = "Advertisement name must be at least 2 characters.";
    } else if (formData.adName.length > 100) {
      newErrors.adName = "Advertisement name must not exceed 100 characters.";
    }

    if (!selectedFile && !mediaLink) {
      newErrors.media = "Media file or link is required.";
    }

    // Validate media type is set
    if (!formData.mediaType) {
      newErrors.mediaType = "Media type must be specified.";
    }

    const durationNum = parseInt(formData.duration);
    if (!formData.duration) {
      newErrors.duration = "Duration is required.";
    } else if (isNaN(durationNum) || durationNum < 1 || durationNum > 300) {
      newErrors.duration = "Duration must be between 1 and 300 seconds.";
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
      setLoading(true);
      setError("");
      console.log("📤 Creating advertisement...");

      if (mediaInputMode === "file") {
        // File upload path
        const data = new FormData();
        data.append("media", selectedFile);
        data.append("adName", formData.adName.trim());
        data.append("description", formData.description.trim());
        data.append("mediaType", formData.mediaType);
        data.append("duration", parseInt(formData.duration));

        const response = await axiosInstance.post("/api/ads", data, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        console.log("✅ Advertisement created:", response.data);
      } else {
        // Link path - send as JSON with mediaUrl instead of file
        const response = await axiosInstance.post("/api/ads", {
          adName: formData.adName.trim(),
          description: formData.description.trim(),
          mediaType: formData.mediaType,
          duration: parseInt(formData.duration),
          mediaUrl: mediaLink.trim(),
          isLink: true,
        });

        console.log("✅ Advertisement created:", response.data);
      }

      setSuccess(true);
      toast.success("Advertisement created successfully!");

      setTimeout(() => {
        router.push("/dashboard/ads");
      }, 1500);
    } catch (err) {
      console.error("❌ Error creating advertisement:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to create advertisement.";
      setError(errorMessage);
      toast.error(errorMessage);
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) {
    return null;
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
                Create Advertisement
              </h1>
              <p className="text-gray-600">Add images or videos to display</p>
            </div>
          </div>

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
              ✅ Advertisement created successfully! Redirecting...
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              ❌ {error}
            </div>
          )}

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
                Description{" "}
                <span className="text-gray-500 text-xs">(Optional)</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Add any notes about this advertisement..."
                maxLength={500}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b6f47] focus:border-transparent transition resize-none"
              />
              <p className="text-xs text-gray-500 mt-2">
                {formData.description.length}/500
              </p>
            </div>

            {/* Media Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Media File <span className="text-red-500">*</span>
              </label>

              {/* Toggle between File and Link */}
              <div className="flex gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => {
                    setMediaInputMode("file");
                    setMediaLink("");
                    setMediaPreview(null);
                  }}
                  className={`flex-1 px-4 py-2 rounded-lg font-semibold transition ${
                    mediaInputMode === "file"
                      ? "bg-[#8b6f47] text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}>
                  <Upload size={16} weight="bold" className="inline mr-2" />
                  Upload File
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMediaInputMode("link");
                    setSelectedFile(null);
                    setMediaPreview(null);
                  }}
                  className={`flex-1 px-4 py-2 rounded-lg font-semibold transition ${
                    mediaInputMode === "link"
                      ? "bg-[#8b6f47] text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}>
                  <LinkIcon size={16} weight="bold" className="inline mr-2" />
                  Use Link
                </button>
              </div>

              {/* File Upload Mode */}
              {mediaInputMode === "file" ? (
                <>
                  {!mediaPreview ? (
                    <div
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                      className={`w-full border-2 border-dashed rounded-lg p-12 text-center transition cursor-pointer ${
                        dragActive
                          ? "border-[#8b6f47] bg-[#f5f0e8]"
                          : "border-gray-300 hover:border-[#8b6f47]"
                      } ${errors.media ? "border-red-500" : ""}`}
                      onClick={() => fileInputRef.current?.click()}>
                      <Upload
                        size={32}
                        className="mx-auto mb-4 text-[#8b6f47]"
                      />
                      <p className="text-gray-700 font-semibold mb-2">
                        Drag and drop your image or video
                      </p>
                      <p className="text-gray-500 text-sm mb-4">
                        Or click to browse (Max 100MB)
                      </p>
                      <p className="text-gray-400 text-xs mb-4">
                        Supported: JPG, PNG, GIF, WebP, MP4, MOV, AVI
                      </p>
                      <button
                        type="button"
                        className="inline-block px-6 py-2 bg-[#8b6f47] text-white rounded-lg hover:bg-[#7a5f3a] transition font-semibold">
                        Browse Files
                      </button>
                    </div>
                  ) : (
                    <div className="border-2 border-gray-300 rounded-lg p-6 bg-gray-50">
                      {mediaPreview.type === "image" ? (
                        <div className="text-center">
                          <img
                            src={mediaPreview.data}
                            alt="Preview"
                            className="max-h-48 mx-auto rounded-lg mb-4"
                          />
                          <p className="text-gray-700 font-semibold">
                            {mediaPreview.name}
                          </p>
                          <p className="text-gray-500 text-sm">
                            {mediaPreview.size} MB
                          </p>
                        </div>
                      ) : (
                        <div className="text-center">
                          <video
                            src={mediaPreview.data}
                            controls
                            className="max-h-48 mx-auto rounded-lg mb-4"
                          />
                          <p className="text-gray-700 font-semibold">
                            {mediaPreview.name}
                          </p>
                          <p className="text-gray-500 text-sm">
                            {mediaPreview.size} MB
                          </p>
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setMediaPreview(null);
                          setSelectedFile(null);
                          setFormData(prev => ({
                            ...prev,
                            mediaType: "image",
                          }));
                        }}
                        className="mt-4 text-red-500 hover:text-red-700 font-semibold">
                        Remove File
                      </button>
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    💡 Tip: You can paste images directly using Ctrl+V (Cmd+V on
                    Mac)!
                  </p>
                </>
              ) : (
                /* Link Input Mode */
                <div>
                  <input
                    type="url"
                    value={mediaLink}
                    onChange={e => setMediaLink(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b6f47] focus:border-transparent transition ${
                      errors.media ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {mediaLink && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-700 mb-3">Preview:</p>
                      {formData.mediaType === "image" ? (
                        <img
                          src={mediaLink}
                          alt="Preview"
                          className="max-h-48 mx-auto rounded-lg"
                          onError={() =>
                            toast.error("Failed to load image from URL")
                          }
                        />
                      ) : (
                        <video
                          src={mediaLink}
                          controls
                          className="max-h-48 mx-auto rounded-lg"
                          onError={() =>
                            toast.error("Failed to load video from URL")
                          }
                        />
                      )}
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    Paste a direct link to an image or video file
                  </p>
                </div>
              )}

              {errors.media && (
                <p className="text-sm text-red-500 mt-2">{errors.media}</p>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              onChange={e => e.target.files && handleFile(e.target.files[0])}
              className="hidden"
            />

            {/* Duration */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Display Duration (seconds){" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                min="1"
                max="300"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b6f47] focus:border-transparent transition ${
                  errors.duration ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.duration && (
                <p className="text-sm text-red-500 mt-1">{errors.duration}</p>
              )}
              <p className="text-xs text-gray-500 mt-2">
                How long to display this content (1-300 seconds)
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-6 border-t">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#8b6f47] hover:bg-[#7a5f3a] disabled:opacity-50 text-white font-semibold rounded-lg transition">
                {loading ? (
                  <>
                    <CircleNotch size={20} className="animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Advertisement"
                )}
              </button>
              <Link
                href="/dashboard/ads"
                className="flex items-center justify-center px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition">
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </main>
    </DashboardLayout>
  );
}
