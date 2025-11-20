"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axiosInstance from "@/lib/axiosConfig";
import { ArrowLeft, CircleNotch, Monitor } from "phosphor-react";
import gsap from "gsap";

export default function DisplayLoginPage() {
  const router = useRouter();
  const mainRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [formData, setFormData] = useState({
    displayId: "",
    password: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    setMounted(true);
  }, []);

  // Check if already logged in as display
  useEffect(() => {
    const token = localStorage.getItem("connectionToken");
    const displayId = localStorage.getItem("displayId");
    const isDisplayMode = localStorage.getItem("displayMode") === "true";

    if (token && displayId && isDisplayMode) {
      // Already logged in, redirect to display
      router.push("/display");
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
    setError("");
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.displayId.trim()) {
      newErrors.displayId = "Display ID is required.";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (!validateForm()) {
      setError("Please fill in all required fields.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      console.log("🔐 Authenticating display...");

      const response = await axiosInstance.post("/api/displays/login-display", {
        displayId: formData.displayId.trim(),
        password: formData.password.trim(),
      });

      console.log("✅ Display authenticated:", response.data);

      // Validate response has required data
      if (
        !response.data.data.displayId ||
        !response.data.data.connectionToken
      ) {
        throw new Error("Invalid response from server");
      }

      // Store in localStorage
      localStorage.setItem("displayId", response.data.data.displayId);
      localStorage.setItem(
        "connectionToken",
        response.data.data.connectionToken
      );
      localStorage.setItem("displayMode", "true");

      setSuccess(true);

      // Redirect to display after 2 seconds
      setTimeout(() => {
        router.push("/display");
      }, 2000);
    } catch (err) {
      console.error("❌ Error authenticating display:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to authenticate display. Please check your credentials.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) {
    return null;
  }

  // Show success screen
  if (success) {
    return (
      <main className="min-h-screen bg-linear-to-br from-[#faf9f7] to-[#f5f3f0] flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-white text-2xl">✓</span>
            </div>
            <h1 className="text-3xl font-bold text-black mb-2">Logged In!</h1>
            <p className="text-gray-600 mb-6">
              Display authenticated successfully. Entering display mode...
            </p>

            <div className="flex items-center justify-center gap-2 text-[#8b6f47]">
              <CircleNotch size={20} className="animate-spin" weight="bold" />
              <span>Redirecting...</span>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main
      ref={mainRef}
      className="min-h-screen bg-linear-to-br from-[#faf9f7] to-[#f5f3f0] flex items-center justify-center p-4">
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
          <div className="w-16 h-16 bg-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
            <Monitor size={32} weight="bold" className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-black mb-2">Display Login</h1>
          <p className="text-gray-600">
            Reconnect your previously registered display device
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border-2 border-[#e5e5e5] p-8 space-y-6 mb-6">
          {/* Display ID */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Display ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="displayId"
              value={formData.displayId}
              onChange={handleInputChange}
              placeholder="e.g., DISP-LOB123"
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition font-mono text-sm ${
                errors.displayId ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.displayId && (
              <p className="text-sm text-red-500 mt-1">{errors.displayId}</p>
            )}
            <p className="text-xs text-gray-500 mt-2">
              The Display ID you created during registration
            </p>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Enter your password"
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                errors.password ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.password && (
              <p className="text-sm text-red-500 mt-1">{errors.password}</p>
            )}
            <p className="text-xs text-gray-500 mt-2">
              The password you set during display registration
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-semibold rounded-lg transition">
            {loading ? (
              <>
                <CircleNotch size={20} className="animate-spin" weight="bold" />
                Authenticating...
              </>
            ) : (
              "Login to Display"
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-[#faf9f7] text-gray-600">or</span>
          </div>
        </div>

        {/* Register New Display */}
        <Link
          href="/display-register"
          className="w-full px-6 py-3 border-2 border-[#8b6f47] text-[#8b6f47] font-semibold rounded-lg hover:bg-[#f5f0e8] transition text-center mb-4 flex items-center justify-center gap-2">
          <Monitor size={18} weight="bold" />
          Register New Display
        </Link>

        {/* Info Section */}
        <div className="bg-blue-50 rounded-2xl border border-blue-200 p-6">
          <h3 className="font-semibold text-blue-900 mb-3">
            💡 Easy Password Login
          </h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>✅ Use your Display ID and password to log in</li>
            <li>✅ No need to copy long connection tokens</li>
            <li>✅ Stay logged in across browser refreshes</li>
            <li>✅ Display mode persists when you leave and return</li>
          </ul>
        </div>

        {/* Back to Login */}
        <div className="mt-8 text-center">
          <Link
            href="/login"
            className="text-gray-600 hover:text-black transition">
            ← Back to Login
          </Link>
        </div>
      </div>
    </main>
  );
}
