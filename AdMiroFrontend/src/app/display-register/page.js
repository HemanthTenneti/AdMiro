"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "@/lib/axiosConfig";
import { CircleNotch, Check, ArrowLeft } from "phosphor-react";
import gsap from "gsap";

export default function DisplayRegisterPage() {
  const router = useRouter();
  const mainRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  const [formData, setFormData] = useState({
    displayName: "",
    location: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mainRef.current && mounted) {
      gsap.fromTo(
        mainRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
      );
    }
  }, [mounted]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.displayName.trim()) {
      newErrors.displayName = "Display name is required.";
    } else if (formData.displayName.length < 2) {
      newErrors.displayName = "Display name must be at least 2 characters.";
    } else if (formData.displayName.length > 50) {
      newErrors.displayName = "Display name must not exceed 50 characters.";
    }

    if (!formData.location.trim()) {
      newErrors.location = "Location is required.";
    } else if (formData.location.length < 2) {
      newErrors.location = "Location must be at least 2 characters.";
    } else if (formData.location.length > 50) {
      newErrors.location = "Location must not exceed 50 characters.";
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

  const getDeviceInfo = () => {
    const ua = navigator.userAgent;
    const resolution = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    return {
      browserVersion: ua,
      resolution,
    };
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (!validateForm()) {
      setError("Please fix the errors above.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      console.log("📤 Registering display device...");

      const deviceInfo = getDeviceInfo();

      const response = await axiosInstance.post("/api/displays/register-self", {
        displayName: formData.displayName.trim(),
        location: formData.location.trim(),
        resolution: deviceInfo.resolution,
        browserInfo: { browserVersion: deviceInfo.browserVersion },
      });

      console.log("✅ Display registered:", response.data);

      const { displayId, connectionToken } = response.data.data;

      // Store in localStorage for the display to use
      localStorage.setItem("displayId", displayId);
      localStorage.setItem("connectionToken", connectionToken);
      localStorage.setItem("displayMode", "true");

      setSuccess(true);

      // Redirect to display page after 2 seconds
      setTimeout(() => {
        router.push("/display");
      }, 2000);
    } catch (err) {
      console.error("❌ Error registering display:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to register display device.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <main
      ref={mainRef}
      className="min-h-screen bg-gradient-to-br from-[#faf9f7] to-[#f5f3f0] flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-black mb-8 transition">
          <ArrowLeft size={20} weight="bold" />
          Back
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#8b6f47] rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-white text-2xl font-bold">📺</span>
          </div>
          <h1 className="text-3xl font-bold text-black mb-2">
            Register Display
          </h1>
          <p className="text-gray-600">
            Set up this device to display advertisements
          </p>
        </div>

        {/* Success Alert */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
            <Check size={24} className="text-green-600" weight="bold" />
            <div>
              <p className="font-semibold text-green-900">
                Registration Success!
              </p>
              <p className="text-sm text-green-700">
                Redirecting to display mode...
              </p>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border-2 border-[#e5e5e5] p-8 space-y-6">
          {/* Display Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Display Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="displayName"
              value={formData.displayName}
              onChange={handleInputChange}
              placeholder="e.g., Living Room Display"
              maxLength={50}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b6f47] focus:border-transparent transition ${
                errors.displayName ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.displayName && (
              <p className="text-sm text-red-500 mt-1">{errors.displayName}</p>
            )}
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Location <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="e.g., Store Front, Office"
              maxLength={50}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b6f47] focus:border-transparent transition ${
                errors.location ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.location && (
              <p className="text-sm text-red-500 mt-1">{errors.location}</p>
            )}
          </div>

          {/* Device Info */}
          <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
            <p className="font-semibold mb-2">Device Information:</p>
            <p>
              <strong>Resolution:</strong> {window.innerWidth} x{" "}
              {window.innerHeight}
            </p>
            <p className="text-xs mt-1 truncate">
              <strong>Browser:</strong> {navigator.userAgent.substring(0, 60)}
              ...
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#8b6f47] hover:bg-[#7a5f3a] disabled:opacity-50 text-white font-semibold rounded-lg transition">
            {loading ? (
              <>
                <CircleNotch size={20} className="animate-spin" weight="bold" />
                Registering...
              </>
            ) : (
              "Register Display"
            )}
          </button>
        </form>

        {/* Info Section */}
        <div className="mt-8 bg-blue-50 rounded-2xl border border-blue-200 p-6">
          <h3 className="font-semibold text-blue-900 mb-3">
            💡 What happens next?
          </h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>✅ Your device will be registered as a display</li>
            <li>✅ It will enter full-screen ad display mode</li>
            <li>✅ An admin can assign advertisements to this display</li>
            <li>✅ Ads will rotate automatically in full-screen</li>
            <li>ℹ️ You can exit by pressing ESC key</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
