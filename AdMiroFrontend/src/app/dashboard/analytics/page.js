"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import axiosInstance from "@/lib/axiosConfig";
import DashboardLayout from "@/components/DashboardLayout";
import {
  ArrowLeft,
  CircleNotch,
  Monitor,
  Image as ImageIcon,
  CheckCircle,
  XCircle,
  Clock,
} from "phosphor-react";

export default function AnalyticsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("displays");
  const [displaysData, setDisplaysData] = useState(null);
  const [adsData, setAdsData] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.push("/login");
      return;
    }

    fetchAnalytics();
  }, [router]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [displaysRes, adsRes] = await Promise.all([
        axiosInstance.get("/api/analytics/displays-summary"),
        axiosInstance.get("/api/analytics/ads-summary"),
      ]);

      setDisplaysData(displaysRes.data.data);
      setAdsData(adsRes.data.data);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      toast.error("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <main className="min-h-screen bg-linear-to-br from-[#faf9f7] to-[#f5f3f0] p-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <CircleNotch
                size={48}
                className="text-[#8b6f47] animate-spin mx-auto mb-4"
                weight="bold"
              />
              <p className="text-gray-600">Loading analytics...</p>
            </div>
          </div>
        </main>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <main className="min-h-screen bg-linear-to-br from-[#faf9f7] to-[#f5f3f0] p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => router.push("/dashboard")}
              className="flex items-center gap-2 text-[#8b6f47] hover:text-[#6d5636] font-medium mb-6">
              <ArrowLeft size={20} weight="bold" />
              Back to Dashboard
            </button>

            <h1 className="text-4xl font-bold text-black mb-2">Analytics</h1>
            <p className="text-gray-600">
              Monitor your displays and advertisements performance
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2 mb-8 border-b border-[#e5e5e5] bg-white rounded-t-2xl px-8 py-4">
            <button
              onClick={() => setActiveTab("displays")}
              className={`px-4 py-3 font-semibold transition border-b-2 flex items-center gap-2 ${
                activeTab === "displays"
                  ? "border-[#8b6f47] text-[#8b6f47]"
                  : "border-transparent text-gray-600 hover:text-[#8b6f47]"
              }`}>
              <Monitor size={20} weight="bold" />
              Displays
            </button>
            <button
              onClick={() => setActiveTab("ads")}
              className={`px-4 py-3 font-semibold transition border-b-2 flex items-center gap-2 ${
                activeTab === "ads"
                  ? "border-[#8b6f47] text-[#8b6f47]"
                  : "border-transparent text-gray-600 hover:text-[#8b6f47]"
              }`}>
              <ImageIcon size={20} weight="bold" />
              Advertisements
            </button>
          </div>

          {/* Displays Tab */}
          {activeTab === "displays" && displaysData && (
            <div className="bg-white rounded-b-2xl border-2 border-[#e5e5e5] border-t-0 p-8">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                  <p className="text-gray-600 text-sm font-semibold mb-2">
                    Total Displays
                  </p>
                  <p className="text-4xl font-bold text-blue-600">
                    {displaysData.totalDisplays}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                  <p className="text-gray-600 text-sm font-semibold mb-2">
                    Online
                  </p>
                  <div className="flex items-end gap-2">
                    <p className="text-4xl font-bold text-green-600">
                      {displaysData.onlineCount}
                    </p>
                    <CheckCircle
                      size={24}
                      className="text-green-600"
                      weight="bold"
                    />
                  </div>
                </div>

                <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6 border border-red-200">
                  <p className="text-gray-600 text-sm font-semibold mb-2">
                    Offline
                  </p>
                  <div className="flex items-end gap-2">
                    <p className="text-4xl font-bold text-red-600">
                      {displaysData.offlineCount}
                    </p>
                    <XCircle size={24} className="text-red-600" weight="bold" />
                  </div>
                </div>

                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-6 border border-yellow-200">
                  <p className="text-gray-600 text-sm font-semibold mb-2">
                    Inactive
                  </p>
                  <div className="flex items-end gap-2">
                    <p className="text-4xl font-bold text-yellow-600">
                      {displaysData.inactiveCount}
                    </p>
                    <Clock
                      size={24}
                      className="text-yellow-600"
                      weight="bold"
                    />
                  </div>
                </div>
              </div>

              {/* Displays Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="text-left py-4 px-4 font-semibold text-gray-700">
                        Display Name
                      </th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-700">
                        Location
                      </th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-700">
                        Status
                      </th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-700">
                        Connection
                      </th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-700">
                        Resolution
                      </th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-700">
                        Last Seen
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {displaysData.displays.map(display => (
                      <tr
                        key={display._id}
                        className="border-b border-gray-100 hover:bg-gray-50 transition">
                        <td className="py-4 px-4">
                          <p className="font-medium text-gray-900">
                            {display.displayName}
                          </p>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-gray-700">{display.location}</p>
                        </td>
                        <td className="py-4 px-4">
                          <span
                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${
                              display.status === "online"
                                ? "bg-green-100 text-green-700"
                                : display.status === "offline"
                                ? "bg-red-100 text-red-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}>
                            {display.status === "online" && (
                              <CheckCircle size={16} weight="fill" />
                            )}
                            {display.status === "offline" && (
                              <XCircle size={16} weight="fill" />
                            )}
                            {display.status === "inactive" && (
                              <Clock size={16} weight="fill" />
                            )}
                            {display.status.charAt(0).toUpperCase() +
                              display.status.slice(1)}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                              display.isConnected
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-700"
                            }`}>
                            {display.isConnected ? "Connected" : "Disconnected"}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-gray-700 font-mono text-sm">
                            {display.resolution}
                          </p>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-gray-600 text-sm">
                            {display.lastSeen
                              ? new Date(display.lastSeen).toLocaleDateString()
                              : "Never"}
                          </p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {displaysData.displays.length === 0 && (
                <div className="text-center py-12">
                  <Monitor
                    size={48}
                    className="text-gray-300 mx-auto mb-4"
                    weight="light"
                  />
                  <p className="text-gray-500 text-lg">No displays found</p>
                </div>
              )}
            </div>
          )}

          {/* Advertisements Tab */}
          {activeTab === "ads" && adsData && (
            <div className="bg-white rounded-b-2xl border-2 border-[#e5e5e5] border-t-0 p-8">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                  <p className="text-gray-600 text-sm font-semibold mb-2">
                    Total Ads
                  </p>
                  <p className="text-4xl font-bold text-blue-600">
                    {adsData.totalAds}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                  <p className="text-gray-600 text-sm font-semibold mb-2">
                    Active
                  </p>
                  <p className="text-4xl font-bold text-green-600">
                    {adsData.activeAds}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-6 border border-yellow-200">
                  <p className="text-gray-600 text-sm font-semibold mb-2">
                    Paused
                  </p>
                  <p className="text-4xl font-bold text-yellow-600">
                    {adsData.pausedAds}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6 border border-red-200">
                  <p className="text-gray-600 text-sm font-semibold mb-2">
                    Expired
                  </p>
                  <p className="text-4xl font-bold text-red-600">
                    {adsData.expiredAds}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
                  <p className="text-gray-600 text-sm font-semibold mb-2">
                    Total Impressions
                  </p>
                  <p className="text-4xl font-bold text-purple-600">
                    {adsData.totalImpressions}
                  </p>
                </div>
              </div>

              {/* Ads Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="text-left py-4 px-4 font-semibold text-gray-700">
                        Ad Name
                      </th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-700">
                        Type
                      </th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-700">
                        Status
                      </th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-700">
                        Duration
                      </th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-700">
                        Impressions
                      </th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-700">
                        Views
                      </th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-700">
                        Clicks
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {adsData.ads.map(ad => (
                      <tr
                        key={ad._id}
                        className="border-b border-gray-100 hover:bg-gray-50 transition">
                        <td className="py-4 px-4">
                          <p className="font-medium text-gray-900">
                            {ad.adName}
                          </p>
                        </td>
                        <td className="py-4 px-4">
                          <span className="inline-block px-3 py-1 rounded-full text-sm font-semibold bg-gray-100 text-gray-700">
                            {ad.mediaType.charAt(0).toUpperCase() +
                              ad.mediaType.slice(1)}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span
                            className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${
                              ad.status === "active"
                                ? "bg-green-100 text-green-700"
                                : ad.status === "paused"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-red-100 text-red-700"
                            }`}>
                            {ad.status.charAt(0).toUpperCase() +
                              ad.status.slice(1)}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-gray-700">{ad.duration}s</p>
                        </td>
                        <td className="py-4 px-4">
                          <p className="font-semibold text-gray-900">
                            {ad.impressions}
                          </p>
                        </td>
                        <td className="py-4 px-4">
                          <p className="font-semibold text-gray-900">
                            {ad.views}
                          </p>
                        </td>
                        <td className="py-4 px-4">
                          <p className="font-semibold text-gray-900">
                            {ad.clicks}
                          </p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {adsData.ads.length === 0 && (
                <div className="text-center py-12">
                  <ImageIcon
                    size={48}
                    className="text-gray-300 mx-auto mb-4"
                    weight="light"
                  />
                  <p className="text-gray-500 text-lg">
                    No advertisements found
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </DashboardLayout>
  );
}
