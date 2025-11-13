"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { SignOut, ArrowLeft } from "phosphor-react";

export default function TestPage() {
  const router = useRouter();
  const containerRef = useRef(null);
  const cardRef = useRef(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rawData, setRawData] = useState("");

  useEffect(() => {
    // Add a small delay to ensure localStorage is available
    const timer = setTimeout(() => {
      try {
        const userData = localStorage.getItem("user");
        const accessToken = localStorage.getItem("accessToken");

        console.log("📦 localStorage user:", userData);
        console.log(
          "📦 localStorage accessToken:",
          accessToken ? "EXISTS" : "MISSING"
        );

        if (!userData || !accessToken) {
          setError("No user logged in. Redirecting to login...");
          setTimeout(() => {
            router.push("/login");
          }, 2000);
          return;
        }

        if (userData === "undefined" || userData === "null") {
          setError("Invalid user data. Please login again.");
          localStorage.removeItem("user");
          localStorage.removeItem("accessToken");
          setTimeout(() => {
            router.push("/login");
          }, 2000);
          return;
        }

        try {
          const parsedUser = JSON.parse(userData);
          console.log("✅ Parsed user data:", parsedUser);
          setUser(parsedUser);
          setRawData(JSON.stringify(parsedUser, null, 2));
          setError("");
          setLoading(false);
        } catch (parseErr) {
          console.error("❌ JSON Parse Error:", parseErr.message);
          console.error("Raw userData string:", userData);
          setError(
            `Error parsing user data: ${parseErr.message}. Please login again.`
          );
          localStorage.removeItem("user");
          localStorage.removeItem("accessToken");
          setLoading(false);
        }
      } catch (err) {
        console.error("❌ Unexpected error:", err);
        setError(`Unexpected error: ${err.message}`);
        setLoading(false);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [router]);

  useEffect(() => {
    if (!loading && user) {
      // Page entry animation
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
      );

      // Card animation
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, scale: 0.95 },
        { opacity: 1, scale: 1, duration: 0.7, ease: "back.out", delay: 0.2 }
      );
    }
  }, [loading, user]);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    router.push("/login");
  };

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "#faf9f7" }}>
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#8b6f47]"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "#faf9f7" }}>
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Link
            href="/login"
            className="inline-block px-6 py-2 border border-[#8b6f47] text-[#8b6f47] rounded-lg hover:bg-[#8b6f47] hover:text-white transition-colors">
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: "#faf9f7" }}>
      <div
        ref={cardRef}
        className="w-full max-w-md bg-white rounded-2xl shadow-lg overflow-hidden"
        style={{ borderTop: "4px solid #8b6f47" }}>
        {/* Header */}
        <div
          style={{ backgroundColor: "#faf9f7" }}
          className="p-8 border-b border-[#e5e5e5]">
          <h1 className="text-3xl font-bold text-black mb-2">
            Welcome, {user?.firstName || "User"}! ✨
          </h1>
          <p className="text-gray-600">
            Your profile authentication successful
          </p>
        </div>

        {/* Profile Statistics */}
        <div className="p-8 space-y-6">
          {/* User ID */}
          <div className="bg-gray-50 rounded-lg p-4 border border-[#e5e5e5]">
            <p className="text-sm font-semibold text-gray-500 mb-1">User ID</p>
            <p className="text-lg font-mono text-black break-all">
              {user?._id || "N/A"}
            </p>
          </div>

          {/* Name */}
          <div className="bg-gray-50 rounded-lg p-4 border border-[#e5e5e5]">
            <p className="text-sm font-semibold text-gray-500 mb-1">
              Full Name
            </p>
            <p className="text-lg font-semibold text-black">
              {user?.firstName} {user?.lastName}
            </p>
          </div>

          {/* Username */}
          <div className="bg-gray-50 rounded-lg p-4 border border-[#e5e5e5]">
            <p className="text-sm font-semibold text-gray-500 mb-1">Username</p>
            <p className="text-lg font-mono text-black">
              @{user?.username || "N/A"}
            </p>
          </div>

          {/* Email */}
          <div className="bg-gray-50 rounded-lg p-4 border border-[#e5e5e5]">
            <p className="text-sm font-semibold text-gray-500 mb-1">Email</p>
            <p className="text-lg font-mono text-black break-all">
              {user?.email || "N/A"}
            </p>
          </div>

          {/* Role */}
          <div className="bg-gray-50 rounded-lg p-4 border border-[#e5e5e5]">
            <p className="text-sm font-semibold text-gray-500 mb-1">
              Account Type
            </p>
            <p className="text-lg font-semibold text-[#8b6f47] capitalize">
              {user?.role || "user"}
            </p>
          </div>

          {/* Raw User Data (for debugging) */}
          <details className="mt-6 p-4 bg-gray-50 rounded-lg border border-[#e5e5e5]">
            <summary className="cursor-pointer font-semibold text-gray-700 hover:text-black">
              📋 Raw User Data
            </summary>
            <pre className="mt-3 text-xs bg-white p-3 rounded border border-[#e5e5e5] overflow-auto">
              {rawData || JSON.stringify(user, null, 2)}
            </pre>
          </details>
        </div>

        {/* Actions */}
        <div className="p-8 border-t border-[#e5e5e5] space-y-3">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#8b6f47] text-white font-bold rounded-lg hover:bg-opacity-90 transition-all">
            <SignOut size={20} />
            Logout
          </button>

          <Link
            href="/"
            className="w-full flex items-center justify-center gap-2 px-6 py-3 border-2 border-[#8b6f47] text-[#8b6f47] font-bold rounded-lg hover:bg-[#8b6f47] hover:text-white transition-all">
            <ArrowLeft size={20} />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
