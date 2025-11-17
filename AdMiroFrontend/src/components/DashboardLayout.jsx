"use client";

import { useState, useEffect, useLayoutEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  House,
  Monitor,
  Image,
  Link as LinkIcon,
  ChartLine,
  Gear,
  SignOut,
  List,
  X,
  Clock,
} from "phosphor-react";

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [userInfo, setUserInfo] = useState({ name: "User", initial: "U" });
  const router = useRouter();

  // Initialize user info after mount
  useLayoutEffect(() => {
    const getUserInfo = () => {
      try {
        const userStr = localStorage.getItem("user");
        if (userStr) {
          const user = JSON.parse(userStr);
          if (user.firstName && user.lastName) {
            return {
              name: `${user.firstName} ${user.lastName}`,
              initial: user.firstName.charAt(0).toUpperCase(),
            };
          }
        }
      } catch (err) {
        console.error("Error parsing user:", err);
      }
      return { name: "User", initial: "U" };
    };
    setUserInfo(getUserInfo());
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: House },
    { label: "Displays", href: "/dashboard/displays", icon: Monitor },
    {
      label: "Connection Requests",
      href: "/dashboard/connection-requests",
      icon: LinkIcon,
    },
    { label: "Advertisements", href: "/dashboard/ads", icon: Image },
    { label: "Display Loops", href: "/dashboard/loops", icon: LinkIcon },
    { label: "System Logs", href: "/dashboard/logs", icon: Clock },
    { label: "Analytics", href: "/dashboard/analytics", icon: ChartLine },
    { label: "Settings", href: "/dashboard/settings", icon: Gear },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-gray-200">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#8b6f47] rounded flex items-center justify-center text-white text-sm font-bold">
                A
              </div>
              <span className="text-xl font-bold text-black">AdMiro</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
            {navItems.map(item => {
              const IconComponent = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => {
                    setSidebarOpen(false);
                    setProfileMenuOpen(false);
                  }}
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition group">
                  <IconComponent
                    size={20}
                    className="text-gray-600 group-hover:text-[#8b6f47]"
                    weight="bold"
                  />
                  <span className="font-medium group-hover:text-[#8b6f47]">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* Sidebar Footer */}
          <div className="border-t border-gray-200 p-4">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 text-gray-700 hover:bg-red-50 rounded-lg transition">
              <SignOut
                size={20}
                className="text-gray-600 hover:text-red-600"
                weight="bold"
              />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation Bar */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="flex items-center justify-between px-6 py-4">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition">
              {sidebarOpen ? (
                <X size={24} className="text-gray-700" weight="bold" />
              ) : (
                <List size={24} className="text-gray-700" weight="bold" />
              )}
            </button>

            {/* Spacer */}
            <div className="hidden md:block" />

            {/* Profile Menu */}
            <div className="relative">
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg transition">
                <div className="flex flex-col items-end">
                  <span className="text-sm font-medium text-gray-900">
                    {userInfo.name}
                  </span>
                  <span className="text-xs text-gray-500">Admin</span>
                </div>
                <div className="w-10 h-10 bg-[#8b6f47] rounded-full flex items-center justify-center text-white font-bold">
                  {userInfo.initial}
                </div>
              </button>

              {/* Profile Dropdown */}
              {profileMenuOpen && (
                <>
                  {/* Click outside overlay */}
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setProfileMenuOpen(false)}
                  />
                  {/* Menu */}
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <Link
                      href="/dashboard/profile"
                      onClick={() => setProfileMenuOpen(false)}
                      className="block px-4 py-3 text-gray-700 hover:bg-gray-50 transition">
                      View Profile
                    </Link>
                    <button
                      onClick={() => {
                        setProfileMenuOpen(false);
                        handleLogout();
                      }}
                      className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 transition border-t border-gray-200">
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-6 max-w-7xl mx-auto">{children}</div>
        </main>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 md:hidden z-40"
          onClick={() => {
            setSidebarOpen(false);
            setProfileMenuOpen(false);
          }}
        />
      )}
    </div>
  );
}
