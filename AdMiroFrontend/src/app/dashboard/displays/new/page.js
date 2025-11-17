"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import axiosInstance from "@/lib/axiosConfig";
import DisplayForm from "@/components/DisplayForm";
import DashboardLayout from "@/components/DashboardLayout";
import gsap from "gsap";

export default function NewDisplayPage() {
  const router = useRouter();
  const mainRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      console.log("❌ No token found, redirecting to login");
      router.push("/login");
    }
  }, [router]);

  // Entry animation
  useEffect(() => {
    if (mainRef.current) {
      gsap.fromTo(
        mainRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
      );
    }
  }, []);

  const handleCreateDisplay = async displayData => {
    setLoading(true);
    setError("");

    try {
      console.log("📤 Submitting display data:", displayData);

      const response = await axiosInstance.post("/api/displays", displayData);

      console.log("✅ Display created:", response.data);

      // Show success message briefly
      setError(""); // Clear any errors
      toast.success("Display created successfully!");

      // Redirect to displays list
      setTimeout(() => {
        router.push("/dashboard/displays");
      }, 1000);
    } catch (err) {
      console.error("❌ Error creating display:", err);

      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to create display. Please try again.";

      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <main
        ref={mainRef}
        className="min-h-screen bg-linear-to-br from-[#faf9f7] to-[#f5f3f0] p-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Link
                href="/dashboard/displays"
                className="text-[#8b6f47] hover:text-[#6d5636] font-medium">
                ← Back to Displays
              </Link>
            </div>

            <h1 className="text-4xl font-bold text-black mb-2">
              Create New Display
            </h1>
            <p className="text-gray-600">
              Set up a new display device for your advertising network.
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl border-2 border-[#e5e5e5] p-8 shadow-sm">
            <DisplayForm
              onSubmit={handleCreateDisplay}
              isLoading={loading}
              error={error}
            />
          </div>

          {/* Info Section */}
          <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">
              💡 Display Setup Tips
            </h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>
                • <strong>Display ID:</strong> Create a unique identifier for
                easy searching and filtering (e.g., LOBBY-1, STORE-MAIN)
              </li>
              <li>
                • <strong>Display Name:</strong> Use a descriptive name for easy
                identification
              </li>
              <li>
                • <strong>Location:</strong> Specify the physical location of
                the display device
              </li>
              <li>
                • <strong>Resolution:</strong> Automatically detected from your
                device. Shows your display&apos;s current resolution.
              </li>
            </ul>
          </div>
        </div>
      </main>
    </DashboardLayout>
  );
}
