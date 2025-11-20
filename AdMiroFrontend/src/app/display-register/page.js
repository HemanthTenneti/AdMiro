"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "@/lib/axiosConfig";
import { CircleNotch, Check, ArrowLeft, Clock, Monitor } from "phosphor-react";
import gsap from "gsap";

export default function DisplayRegisterPage() {
  const router = useRouter();
  const mainRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);
  const [waitingForApproval, setWaitingForApproval] = useState(false);
  const [displayId, setDisplayId] = useState("");
  const [connectionToken, setConnectionToken] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");

  const [formData, setFormData] = useState({
    displayName: "",
    location: "",
    displayId: "",
    password: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    setMounted(true);
  }, []);

  // Poll for approval when waiting
  useEffect(() => {
    if (!waitingForApproval || !displayId) return;

    const pollInterval = setInterval(async () => {
      try {
        const response = await axiosInstance.get(
          `/api/displays/by-token/${connectionToken}`
        );
        const displayData = response.data.data;
        const displayStatus = displayData.status;
        const requestStatus = displayData.connectionRequestStatus;
        const reason = displayData.rejectionReason;

        // Check if display has been rejected
        if (requestStatus === "rejected") {
          console.log("❌ Display request rejected!");
          setWaitingForApproval(false);
          setRejectionReason(reason || "No reason provided");
          setError(
            `Your display registration was rejected${
              reason ? `: ${reason}` : ""
            }. Please contact your administrator.`
          );
          return;
        }

        // Check if display has been assigned to an admin (approved)
        if (requestStatus === "approved" && displayData.assignedAdmin) {
          console.log("✅ Display approved!");
          setSuccess(true);
          setWaitingForApproval(false);

          // Store in localStorage
          localStorage.setItem("displayId", displayId);
          localStorage.setItem("connectionToken", connectionToken);
          localStorage.setItem("displayMode", "true");

          // Redirect to display page
          setTimeout(() => {
            router.push("/display");
          }, 2000);
        }
      } catch (err) {
        console.log("Still waiting for approval...");
      }
    }, 3000); // Poll every 3 seconds

    return () => clearInterval(pollInterval);
  }, [waitingForApproval, displayId, connectionToken, router]);

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

    // Display ID is optional but if provided, validate it
    if (formData.displayId.trim()) {
      if (formData.displayId.length < 3) {
        newErrors.displayId = "Display ID must be at least 3 characters.";
      } else if (formData.displayId.length > 30) {
        newErrors.displayId = "Display ID must not exceed 30 characters.";
      }
    }

    // Password is optional but if provided, validate it
    if (formData.password.trim()) {
      if (formData.password.length < 4) {
        newErrors.password = "Password must be at least 4 characters.";
      } else if (formData.password.length > 50) {
        newErrors.password = "Password must not exceed 50 characters.";
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
        ...(formData.displayId.trim() && {
          displayId: formData.displayId.trim(),
        }),
        ...(formData.password.trim() && {
          password: formData.password.trim(),
        }),
        resolution: deviceInfo.resolution,
        browserInfo: { browserVersion: deviceInfo.browserVersion },
      });

      console.log("✅ Display registered:", response.data);

      const {
        displayId: newDisplayId,
        connectionToken: newToken,
        status,
        isPendingApproval,
      } = response.data.data;

      setDisplayId(newDisplayId);
      setConnectionToken(newToken);

      // If pending approval, show waiting screen
      if (isPendingApproval) {
        setWaitingForApproval(true);
      } else {
        // Otherwise proceed normally
        localStorage.setItem("displayId", newDisplayId);
        localStorage.setItem("connectionToken", newToken);
        localStorage.setItem("displayMode", "true");

        setSuccess(true);

        setTimeout(() => {
          router.push("/display");
        }, 2000);
      }
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

  // Show waiting for approval screen
  if (waitingForApproval) {
    return (
      <main className="min-h-screen bg-linear-to-br from-[#faf9f7] to-[#f5f3f0] flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Clock
                size={32}
                weight="bold"
                className="text-white animate-spin"
              />
            </div>
            <h1 className="text-3xl font-bold text-black mb-2">
              Waiting for Approval
            </h1>
            <p className="text-gray-600 mb-6">
              Your display is registered. An admin needs to approve it.
            </p>

            <div className="bg-white rounded-2xl border-2 border-[#e5e5e5] p-6 mb-6">
              <div className="text-left space-y-3">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold mb-1">
                    Display Name
                  </p>
                  <p className="text-lg font-semibold text-black">
                    {formData.displayName}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold mb-1">
                    Location
                  </p>
                  <p className="text-lg font-semibold text-black">
                    {formData.location}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold mb-1">
                    Display ID
                  </p>
                  <p className="font-mono text-sm text-[#8b6f47] break-all">
                    {displayId}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-2xl border border-blue-200 p-6">
              <h3 className="font-semibold text-blue-900 mb-3">
                📋 What to do:
              </h3>
              <ol className="space-y-2 text-sm text-blue-800 text-left">
                <li>1. Log in to the admin dashboard</li>
                <li>2. Go to &quot;Connection Requests&quot; page</li>
                <li>3. Find your display and click &quot;Approve&quot;</li>
                <li>4. This display will automatically start showing ads</li>
              </ol>
            </div>

            <p className="text-xs text-gray-500 mt-6">
              Still waiting... (checks every 3 seconds)
            </p>
          </div>
        </div>
      </main>
    );
  }

  // Show success screen
  if (success) {
    return (
      <main className="min-h-screen bg-linear-to-br from-[#faf9f7] to-[#f5f3f0] flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Check size={32} weight="bold" className="text-white" />
            </div>
            <h1 className="text-3xl font-bold text-black mb-2">Approved!</h1>
            <p className="text-gray-600 mb-6">
              Your display has been approved. Entering display mode...
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
          <div className="w-16 h-16 bg-[#8b6f47] rounded-full mx-auto mb-4 flex items-center justify-center">
            <Monitor size={32} weight="bold" className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-black mb-2">
            Register Display
          </h1>
          <p className="text-gray-600">
            Set up this device to display advertisements
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
          className="bg-white rounded-2xl border-2 border-[#e5e5e5] p-8 space-y-6">
          {/* Display ID */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Display ID{" "}
              <span className="text-gray-500 text-xs">(Optional)</span>
            </label>
            <input
              type="text"
              name="displayId"
              value={formData.displayId}
              onChange={handleInputChange}
              placeholder="e.g., DISP-LOBBY"
              maxLength={30}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b6f47] focus:border-transparent transition ${
                errors.displayId ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.displayId && (
              <p className="text-sm text-red-500 mt-1">{errors.displayId}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Create a short ID (3-30 characters) like DISP-LOBBY, or leave
              blank for auto-generated
            </p>
          </div>

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

          {/* Password */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Password <span className="text-gray-500 text-xs">(Optional)</span>
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Create a password for easy login (4-50 characters)"
              maxLength={50}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b6f47] focus:border-transparent transition ${
                errors.password ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.password && (
              <p className="text-sm text-red-500 mt-1">{errors.password}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Leave blank to use connection token for login, or set a password for easier access
            </p>
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
            <li>✅ Your device will be registered</li>
            <li>✅ An admin will receive a connection request</li>
            <li>✅ Once approved, this device will enter display mode</li>
            <li>✅ Ads will rotate automatically in full-screen</li>
            <li>ℹ️ You can exit by pressing ESC key</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
