"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
      value: "24",
      icon: Monitor,
      bgColor: "#dbeafe",
      iconColor: "#3b82f6",
    },
    {
      label: "Active Ads",
      value: "12",
      icon: Image,
      bgColor: "#e9d5ff",
      iconColor: "#a855f7",
    },
    {
      label: "Total Impressions",
      value: "48.5K",
      icon: Eye,
      bgColor: "#d1fae5",
      iconColor: "#10b981",
    },
    {
      label: "Engagement Rate",
      value: "8.4%",
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
    {
      label: "View Analytics",
      href: "/dashboard/analytics",
      icon: ChartLine,
    },
  ];

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

      {/* Recent Activity */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold mb-4 text-gray-900">
          Recent Activity
        </h2>
        <div className="space-y-4">
          {[
            {
              action: "Display connected",
              details: "Mall Display 1 (Location: Downtown)",
              time: "2 hours ago",
            },
            {
              action: "New ad created",
              details: "Summer Campaign 2025",
              time: "4 hours ago",
            },
            {
              action: "Display updated",
              details: "Airport Terminal 2 configuration changed",
              time: "1 day ago",
            },
            {
              action: "Analytics milestone",
              details: "Reached 50K impressions",
              time: "2 days ago",
            },
          ].map((activity, index) => (
            <div
              key={index}
              className="flex items-center justify-between py-3 border-b border-gray-200 last:border-b-0">
              <div>
                <p className="font-medium text-gray-900">{activity.action}</p>
                <p className="text-sm text-gray-600">{activity.details}</p>
              </div>
              <span className="text-sm text-gray-500">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
