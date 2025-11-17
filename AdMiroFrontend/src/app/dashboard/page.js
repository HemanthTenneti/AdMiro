"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axiosInstance from "@/lib/axiosConfig";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Monitor,
  Image,
  ChartLine,
  Eye,
  Plus,
  ArrowRight,
} from "phosphor-react";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [totalDisplays, setTotalDisplays] = useState(0);
  const [displaysLoading, setDisplaysLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("accessToken");
      const userData = localStorage.getItem("user");

      if (!token) {
        router.push("/login");
        return;
      }

      if (userData) {
        try {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
        } catch (e) {
          console.error("Failed to parse user data");
        }
      }

      setLoading(false);
    };

    checkAuth();
  }, [router]);

  useEffect(() => {
    const fetchDisplays = async () => {
      try {
        setDisplaysLoading(true);
        const response = await axiosInstance.get("/api/displays?limit=1");
        // The response structure is: { success, message, data: { displays, pagination: { total } } }
        const total = response.data?.data?.pagination?.total || 0;
        setTotalDisplays(total);
      } catch (error) {
        console.error("Failed to fetch displays count:", error);
        setTotalDisplays(0);
      } finally {
        setDisplaysLoading(false);
      }
    };

    const fetchLogs = async () => {
      try {
        setLogsLoading(true);
        const response = await axiosInstance.get("/api/logs/recent?limit=4");
        // The response structure is: { success, message, data: { logs } }
        setLogs(response.data?.data?.logs || []);
      } catch (error) {
        console.error("Failed to fetch logs:", error);
        setLogs([]);
      } finally {
        setLogsLoading(false);
      }
    };

    if (!loading) {
      fetchDisplays();
      fetchLogs();
    }
  }, [loading]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8b6f47]" />
      </div>
    );
  }

  const stats = [
    {
      label: "Total Displays",
      value: displaysLoading ? "..." : totalDisplays.toString(),
      icon: Monitor,
      bgColor: "#dbeafe",
      iconColor: "#3b82f6",
    },
    {
      label: "Active Ads",
      value: "—",
      icon: Image,
      bgColor: "#e9d5ff",
      iconColor: "#a855f7",
    },
    {
      label: "Total Loops",
      value: "—",
      icon: ChartLine,
      bgColor: "#fef3c7",
      iconColor: "#f59e0b",
    },
  ];

  const quickActions = [
    {
      label: "Add Display",
      href: "/dashboard/displays/new",
      icon: Monitor,
    },
    {
      label: "Create Ad",
      href: "/dashboard/ads/new",
      icon: Image,
    },
  ];

  const getActionColor = action => {
    switch (action) {
      case "create":
        return "bg-blue-50";
      case "update":
        return "bg-orange-50";
      case "delete":
        return "bg-red-50";
      case "status_change":
        return "bg-purple-50";
      default:
        return "bg-gray-50";
    }
  };

  const getActionBadgeColor = action => {
    switch (action) {
      case "create":
        return "bg-blue-100 text-blue-800 border border-blue-300";
      case "update":
        return "bg-orange-100 text-orange-800 border border-orange-300";
      case "delete":
        return "bg-red-100 text-red-800 border border-red-300";
      case "status_change":
        return "bg-purple-100 text-purple-800 border border-purple-300";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-300";
    }
  };

  return (
    <DashboardLayout>
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 text-gray-900">
          Welcome back, {user?.firstName || "User"}! 👋
        </h1>
        <p className="text-gray-600">
          Here&apos;s what&apos;s happening with your displays today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div
                  className="rounded-lg p-3"
                  style={{ backgroundColor: stat.bgColor }}>
                  <Icon
                    size={24}
                    style={{ color: stat.iconColor }}
                    weight="bold"
                  />
                </div>
              </div>
              <p className="text-sm mb-2 text-gray-600">{stat.label}</p>
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 mb-8 shadow-sm">
        <h2 className="text-xl font-bold mb-4 text-gray-900">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Link
                key={index}
                href={action.href}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg p-2 bg-blue-100">
                    <Icon size={20} className="text-[#8b6f47]" weight="bold" />
                  </div>
                  <span className="font-medium text-gray-900">
                    {action.label}
                  </span>
                </div>
                <ArrowRight size={16} className="text-gray-400" />
              </Link>
            );
          })}
        </div>
      </div>

      {/* System Logs */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold mb-4 text-gray-900">System Logs</h2>
        <div className="space-y-2">
          {logsLoading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading logs...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No activity yet</p>
            </div>
          ) : (
            logs.map(log => (
              <div
                key={log._id}
                className={`flex items-center justify-between py-4 px-4 rounded-lg border border-gray-200 transition ${getActionColor(
                  log.action
                )}`}>
                <div className="flex items-center gap-3 flex-1">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getActionBadgeColor(
                      log.action
                    )}`}>
                    {log.action.replace(/_/g, " ").toUpperCase()}
                  </span>
                  <div>
                    <p className="font-medium text-gray-900">
                      {log.details?.description}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {log.userId?.firstName && log.userId?.lastName
                        ? `${log.userId.firstName} ${log.userId.lastName}`
                        : log.userId?.username || "Unknown"}
                    </p>
                  </div>
                </div>
                <span className="text-sm text-gray-500 whitespace-nowrap ml-4">
                  {new Date(log.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
