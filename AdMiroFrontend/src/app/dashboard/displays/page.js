"use client";

import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";

export default function DisplaysPage() {
  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Displays</h1>
          <p className="text-gray-600 mt-2">Manage your display devices</p>
        </div>

        {/* Placeholder Content */}
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Coming Soon</h2>
          <p className="text-gray-600 mb-8">
            Display management features are being implemented. Check back soon!
          </p>
          <Link
            href="/dashboard"
            className="inline-block px-6 py-3 bg-[#8b6f47] text-white rounded-lg hover:bg-[#7a5f3a] transition">
            Back to Dashboard
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}
