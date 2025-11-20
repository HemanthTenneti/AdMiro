"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import axiosInstance from "@/lib/axiosConfig";
import {
  CircleNotch,
  DotsThreeVertical,
  SignOut,
  Repeat,
} from "phosphor-react";

export default function DisplayPage() {
  const router = useRouter();
  const containerRef = useRef(null);

  const [displayId, setDisplayId] = useState(null);
  const [connectionToken, setConnectionToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [ads, setAds] = useState([]);
  const [currentAd, setCurrentAd] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [loginMode, setLoginMode] = useState(false);
  const [loginData, setLoginData] = useState({
    displayId: "",
    connectionToken: "",
  });
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const menuRef = useRef(null);

  // Report status to backend
  const reportDisplayStatus = useCallback(
    async (token, status) => {
      try {
        console.log("📡 Reporting display status:", status);
        await axiosInstance.post("/api/displays/report-status", {
          connectionToken: token,
          status,
          currentAdPlaying: currentAd?.adId || "none",
        });
        console.log("✅ Status reported successfully");
      } catch (err) {
        console.error("❌ Error reporting status:", err);
      }
    },
    [currentAd?.adId]
  );

  // Fetch ads for display
  const fetchAdsForDisplay = useCallback(async () => {
    try {
      const token = localStorage.getItem("connectionToken");
      if (!token) {
        setError("No connection token found");
        return;
      }

      console.log("📺 Fetching display loop and advertisements...");
      const response = await axiosInstance.get(`/api/displays/loop/${token}`);
      console.log("✅ Display loop fetched:", response.data);

      const advertisements = response.data.data.advertisements || [];

      if (advertisements.length === 0) {
        setError("No advertisements assigned to this display");
        setAds([]);
        setCurrentAd(null);
        return;
      }

      setAds(advertisements);
      setCurrentAdIndex(0);
      setCurrentAd(advertisements[0]);
      setTimeRemaining(advertisements[0].duration);
      setError("");
    } catch (err) {
      console.error("❌ Error fetching display loop:", err);
      setError("Failed to load advertisements for this display");
    }
  }, []);

  // Initialize display on mount
  useEffect(() => {
    const token = localStorage.getItem("connectionToken");
    const displayIdStored = localStorage.getItem("displayId");

    if (!token || !displayIdStored) {
      // No display registered, show login form
      setLoginMode(true);
      setLoading(false);
      return;
    }

    setConnectionToken(token);
    setDisplayId(displayIdStored);
    setLoading(false);

    // Fetch ads
    fetchAdsForDisplay();

    // Report initial status
    reportDisplayStatus(token, "online");

    // Set up heartbeat (report status every 10 seconds)
    const heartbeatInterval = setInterval(() => {
      reportDisplayStatus(token, "online");
    }, 10000);

    // Set up loop polling (check for new loop assignments every 30 seconds)
    const loopPollingInterval = setInterval(() => {
      fetchAdsForDisplay();
    }, 30000);

    return () => {
      clearInterval(heartbeatInterval);
      clearInterval(loopPollingInterval);
    };
  }, [fetchAdsForDisplay, reportDisplayStatus]);

  // Request fullscreen when display is active
  useEffect(() => {
    const requestFullscreen = async () => {
      try {
        if (
          containerRef.current &&
          document.fullscreenElement === null &&
          displayId
        ) {
          await containerRef.current.requestFullscreen().catch(() => {
            console.log("ℹ️ Fullscreen not available");
          });
        }
      } catch (err) {
        console.error("Fullscreen error:", err);
      }
    };

    requestFullscreen();
  }, [displayId]);

  // Handle ESC key to exit fullscreen and return to login
  useEffect(() => {
    const handleKeyDown = e => {
      if (e.key === "Escape") {
        if (document.fullscreenElement) {
          document.exitFullscreen();
        }
        localStorage.removeItem("displayId");
        localStorage.removeItem("connectionToken");
        router.push("/login");
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [router]);

  // Timer for ad rotation
  useEffect(() => {
    if (!currentAd || ads.length === 0) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          // Move to next ad
          const nextIndex = (currentAdIndex + 1) % ads.length;
          setCurrentAdIndex(nextIndex);
          setCurrentAd(ads[nextIndex]);
          return ads[nextIndex].duration;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentAd, currentAdIndex, ads]);

  // Handle display login
  const handleDisplayLogin = async e => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError("");

    try {
      console.log("🔐 Logging in display with token...");

      // Validate with backend
      const response = await axiosInstance.post("/api/displays/login-display", {
        displayId: loginData.displayId,
        connectionToken: loginData.connectionToken,
      });

      console.log("✅ Display login successful:", response.data);

      // Store credentials
      localStorage.setItem("connectionToken", loginData.connectionToken);
      localStorage.setItem("displayId", response.data.data.displayId);

      // Update state
      setConnectionToken(loginData.connectionToken);
      setDisplayId(response.data.data.displayId);
      setLoginMode(false);
      setLoading(false);

      // Fetch ads
      fetchAdsForDisplay();

      // Report status
      reportDisplayStatus(loginData.connectionToken, "online");
    } catch (err) {
      console.error("❌ Login error:", err);
      setLoginError(
        err.response?.data?.message ||
          "Failed to authenticate display. Please check your credentials."
      );
    } finally {
      setLoginLoading(false);
    }
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("connectionToken");
    localStorage.removeItem("displayId");
    localStorage.removeItem("displayMode");
    setConnectionToken(null);
    setDisplayId(null);
    setAds([]);
    setCurrentAd(null);
    setLoginMode(true);
    setShowMenu(false);
    router.push("/login");
  };

  // Handle switch display
  const handleSwitchDisplay = () => {
    localStorage.removeItem("connectionToken");
    localStorage.removeItem("displayId");
    localStorage.removeItem("displayMode");
    setConnectionToken(null);
    setDisplayId(null);
    setAds([]);
    setCurrentAd(null);
    setLoginMode(true);
    setShowMenu(false);
  };

  // Handle refresh loop
  const handleRefreshLoop = async () => {
    setIsRefreshing(true);
    try {
      await fetchAdsForDisplay();
      // Show brief visual feedback
      setTimeout(() => setIsRefreshing(false), 500);
    } catch (err) {
      console.error("Refresh failed:", err);
      setIsRefreshing(false);
    }
  };

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    }

    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showMenu]);

  // Loading state
  if (loading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <CircleNotch
            size={48}
            className="text-white animate-spin mx-auto mb-4"
            weight="bold"
          />
          <p className="text-white">Initializing display...</p>
        </div>
      </div>
    );
  }

  // Login form
  if (loginMode) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-linear-to-br from-[#1a1a1a] to-[#2a2a2a]">
        <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
          <h1 className="text-3xl font-bold text-black mb-2">Display Login</h1>
          <p className="text-gray-600 mb-6">
            Enter your display credentials to activate
          </p>

          {loginError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {loginError}
            </div>
          )}

          <form onSubmit={handleDisplayLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Display ID
              </label>
              <input
                type="text"
                value={loginData.displayId}
                onChange={e =>
                  setLoginData({ ...loginData, displayId: e.target.value })
                }
                placeholder="e.g., DISP-1234567890-ABC123"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b6f47] focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Connection Token
              </label>
              <input
                type="text"
                value={loginData.connectionToken}
                onChange={e =>
                  setLoginData({
                    ...loginData,
                    connectionToken: e.target.value,
                  })
                }
                placeholder="e.g., ac886ad0-46d6-459d-a2b4-c46afe4aad2b"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b6f47] focus:border-transparent font-mono text-sm"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#8b6f47] hover:bg-[#7a5f3a] disabled:opacity-50 text-white font-semibold rounded-lg transition">
              {loginLoading ? (
                <>
                  <CircleNotch
                    size={20}
                    className="animate-spin"
                    weight="bold"
                  />
                  Authenticating...
                </>
              ) : (
                "Activate Display"
              )}
            </button>
          </form>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg text-sm text-blue-800">
            <p className="font-semibold mb-2">💡 How to find credentials:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Go to /displays/new to get new credentials</li>
              <li>Or check your admin dashboard for existing displays</li>
              <li>Copy the Display ID and Connection Token from there</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  // No ads to display
  if (ads.length === 0 && error) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <p className="text-red-500 text-2xl mb-4">{error}</p>
          <p className="text-white text-sm">Press ESC to return to login</p>
        </div>
      </div>
    );
  }

  // Display current ad
  return (
    <div
      ref={containerRef}
      className="w-screen h-screen flex items-center justify-center bg-black overflow-hidden">
      {currentAd ? (
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Ad Display Area */}
          {currentAd.mediaType === "image" ? (
            <Image
              src={currentAd.mediaUrl}
              alt={currentAd.adName}
              fill
              className="object-contain"
              priority
              onError={() => {
                setError("Failed to load image");
              }}
            />
          ) : (
            <video
              src={currentAd.mediaUrl}
              autoPlay
              muted
              loop
              className="w-full h-full object-contain"
              onError={() => {
                setError("Failed to load video");
              }}
            />
          )}

          {/* Menu Button (top left) */}
          <div className="absolute top-4 left-4 z-50" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-3 bg-black bg-opacity-60 hover:bg-opacity-80 text-white rounded-lg transition"
              title="Display options">
              <DotsThreeVertical size={24} weight="bold" />
            </button>

            {/* Dropdown Menu */}
            {showMenu && (
              <div className="absolute top-14 left-0 bg-white rounded-lg shadow-xl overflow-hidden min-w-48 z-50">
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <p className="text-sm font-semibold text-gray-700">
                    Display ID
                  </p>
                  <p className="text-xs text-gray-600 font-mono break-all">
                    {displayId}
                  </p>
                </div>

                <button
                  onClick={handleSwitchDisplay}
                  className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-gray-100 text-gray-700 font-semibold transition border-b border-gray-100">
                  <Repeat size={18} />
                  Switch Display
                </button>

                <button
                  onClick={handleRefreshLoop}
                  disabled={isRefreshing}
                  className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-blue-50 text-blue-600 font-semibold transition border-b border-gray-100 disabled:opacity-50">
                  <Repeat
                    size={18}
                    className={isRefreshing ? "animate-spin" : ""}
                  />
                  {isRefreshing ? "Refreshing..." : "Refresh Loop"}
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-red-50 text-red-600 font-semibold transition">
                  <SignOut size={18} />
                  Logout
                </button>
              </div>
            )}
          </div>

          {/* Debug Info (bottom right, small) */}
          <div className="absolute bottom-4 right-4 bg-black bg-opacity-70 text-white text-xs p-2 rounded font-mono max-w-xs">
            <div>Display: {displayId?.substring(0, 20)}...</div>
            <div>Ad: {currentAd.adName}</div>
            <div>Time: {timeRemaining}s</div>
            <div>
              ({currentAdIndex + 1}/{ads.length})
            </div>
          </div>

          {/* Time remaining indicator (top right) */}
          <div className="absolute top-4 right-4 bg-[#8b6f47] text-white px-4 py-2 rounded-lg font-semibold">
            {timeRemaining}s
          </div>
        </div>
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-black relative">
          <div className="text-center">
            <p className="text-red-500 text-2xl font-semibold mb-4">{error}</p>
            <p className="text-gray-400 text-sm">
              Press ESC to return to login
            </p>
          </div>

          {/* Menu Button (top left) - visible even with errors */}
          <div className="absolute top-4 left-4 z-50" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-3 bg-black bg-opacity-60 hover:bg-opacity-80 text-white rounded-lg transition"
              title="Display options">
              <DotsThreeVertical size={24} weight="bold" />
            </button>

            {/* Dropdown Menu */}
            {showMenu && (
              <div className="absolute top-14 left-0 bg-white rounded-lg shadow-xl overflow-hidden min-w-48 z-50">
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <p className="text-sm font-semibold text-gray-700">
                    Display ID
                  </p>
                  <p className="text-xs text-gray-600 font-mono break-all">
                    {displayId}
                  </p>
                </div>

                <button
                  onClick={handleSwitchDisplay}
                  className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-gray-100 text-gray-700 font-semibold transition border-b border-gray-100">
                  <Repeat size={18} />
                  Switch Display
                </button>

                <button
                  onClick={handleRefreshLoop}
                  disabled={isRefreshing}
                  className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-blue-50 text-blue-600 font-semibold transition border-b border-gray-100 disabled:opacity-50">
                  <Repeat
                    size={18}
                    className={isRefreshing ? "animate-spin" : ""}
                  />
                  {isRefreshing ? "Refreshing..." : "Refresh Loop"}
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-red-50 text-red-600 font-semibold transition">
                  <SignOut size={18} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
