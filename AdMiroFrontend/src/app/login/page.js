"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axiosInstance from "@/lib/axiosConfig";
import { useAuthStore } from "@/context/authStore";
import gsap from "gsap";
import { Eye, EyeSlash, Monitor, Plug } from "phosphor-react";

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const mainRef = useRef(null);
  const cardRef = useRef(null);
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    usernameOrEmail: "",
    password: "",
    confirmPassword: "",
    username: "",
    email: "",
    firstName: "",
    lastName: "",
  });

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = () => {
      const user = localStorage.getItem("user");

      if (user) {
        // User is already logged in (has cookie + user in storage)
        console.log("✅ User already logged in, redirecting to /dashboard");
        router.push("/dashboard");
      }
    };

    // Add a small delay to ensure localStorage is available
    const timer = setTimeout(checkAuth, 100);
    return () => clearTimeout(timer);
  }, [router]);

  useEffect(() => {
    // Page entry animation
    gsap.fromTo(
      mainRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
    );

    // Card animation
    gsap.fromTo(
      cardRef.current,
      { opacity: 0, scale: 0.95 },
      { opacity: 1, scale: 1, duration: 0.7, ease: "back.out", delay: 0.2 }
    );
  }, []);

  useEffect(() => {
    // Animate card when switching between login/register
    gsap.to(cardRef.current, {
      opacity: 0,
      duration: 0.3,
      ease: "power2.in",
      onComplete: () => {
        gsap.fromTo(
          cardRef.current,
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }
        );
      },
    });
  }, [isLogin]);

  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    setError(""); // Clear error when user starts typing
  };

  const handleLogin = async e => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axiosInstance.post("/api/auth/login", {
        usernameOrEmail: formData.usernameOrEmail,
        password: formData.password,
      });

      console.log("✅ Login response:", response.data);
      console.log("👤 User data:", response.data.data.user);

      // Store user in localStorage and auth store
      // Token is in cookie, but we also store it in localStorage as a fallback
      localStorage.setItem("user", JSON.stringify(response.data.data.user));
      localStorage.setItem(
        "accessToken",
        response.data.data.accessToken || "cookie-based"
      );
      setUser(response.data.data.user);

      console.log(
        "💾 Stored in localStorage - User:",
        localStorage.getItem("user")
      );
      console.log(
        "🍪 Access token is in HTTP-only cookie (with fallback header)"
      );

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (err) {
      console.error("❌ Login error:", err);
      setError(
        err.response?.data?.message || "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async e => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const response = await axiosInstance.post("/api/auth/register", {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        firstName: formData.firstName,
        lastName: formData.lastName,
      });

      console.log("✅ Register response:", response.data);
      console.log("👤 User data:", response.data.data.user);

      // Store user in localStorage and auth store
      // Token is in cookie, but we also store it in localStorage as a fallback
      localStorage.setItem("user", JSON.stringify(response.data.data.user));
      localStorage.setItem(
        "accessToken",
        response.data.data.accessToken || "cookie-based"
      );
      setUser(response.data.data.user);

      console.log(
        "💾 Stored in localStorage - User:",
        localStorage.getItem("user")
      );
      console.log(
        "🍪 Access token is in HTTP-only cookie (with fallback header)"
      );

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (err) {
      console.error("❌ Register error:", err);
      setError(
        err.response?.data?.message || "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main ref={mainRef} className="min-h-screen flex">
      {/* Left Side - Form Section */}
      <div
        className="w-full lg:w-1/2 flex flex-col items-center justify-center px-8 py-12"
        style={{ backgroundColor: "#faf9f7" }}>
        <div className="w-full max-w-md">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-[#8b6f47] rounded flex items-center justify-center text-white text-sm font-bold">
              A
            </div>
            <span className="text-2xl font-bold text-black">AdMiro</span>
          </Link>

          {/* Form Card */}
          <div
            ref={cardRef}
            className="w-full bg-white rounded-2xl border-2 border-[#e5e5e5] p-8">
            <h1 className="text-3xl font-bold text-black mb-2">
              {isLogin ? "Welcome back" : "Create account"}
            </h1>
            <p className="text-gray-600 mb-8">
              {isLogin
                ? "Log in to your AdMiro account"
                : "Join AdMiro to manage your displays"}
            </p>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            {/* Login Form */}
            {isLogin ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Username or Email
                  </label>
                  <input
                    type="text"
                    name="usernameOrEmail"
                    value={formData.usernameOrEmail}
                    onChange={handleInputChange}
                    placeholder="Enter your username or email"
                    className="w-full px-4 py-3 border border-[#e5e5e5] rounded-lg focus:outline-none focus:border-[#8b6f47] transition bg-white text-black"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Enter your password"
                      className="w-full px-4 py-3 border border-[#e5e5e5] rounded-lg focus:outline-none focus:border-[#8b6f47] transition bg-white text-black"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-3.5 text-gray-600 hover:text-black transition">
                      {showPassword ? (
                        <EyeSlash size={20} weight="bold" />
                      ) : (
                        <Eye size={20} weight="bold" />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-4 py-3 bg-[#8b6f47] text-white font-bold rounded-lg hover:bg-[#6b5535] transition disabled:opacity-50 disabled:cursor-not-allowed">
                  {loading ? "Logging in..." : "Log in"}
                </button>

                {/* Divider */}
                <div className="flex items-center gap-4 my-6">
                  <div className="flex-1 h-px bg-[#e5e5e5]"></div>
                  <span className="text-xs text-gray-600">OR</span>
                  <div className="flex-1 h-px bg-[#e5e5e5]"></div>
                </div>

                {/* Google OAuth Button */}
                <a
                  href={`${
                    process.env.NEXT_PUBLIC_API_BASE_URL ||
                    "http://localhost:8000"
                  }/api/auth/google`}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-[#e5e5e5] text-black font-semibold rounded-lg hover:bg-gray-50 transition">
                  <svg
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="currentColor">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Continue with Google
                </a>
              </form>
            ) : (
              /* Register Form */
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="First name"
                      className="w-full px-4 py-3 border border-[#e5e5e5] rounded-lg focus:outline-none focus:border-[#8b6f47] transition bg-white text-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="Last name"
                      className="w-full px-4 py-3 border border-[#e5e5e5] rounded-lg focus:outline-none focus:border-[#8b6f47] transition bg-white text-black"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="Choose a username"
                    className="w-full px-4 py-3 border border-[#e5e5e5] rounded-lg focus:outline-none focus:border-[#8b6f47] transition bg-white text-black"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email"
                    className="w-full px-4 py-3 border border-[#e5e5e5] rounded-lg focus:outline-none focus:border-[#8b6f47] transition bg-white text-black"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Create a password"
                      className="w-full px-4 py-3 border border-[#e5e5e5] rounded-lg focus:outline-none focus:border-[#8b6f47] transition bg-white text-black"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-3.5 text-gray-600 hover:text-black transition">
                      {showPassword ? (
                        <EyeSlash size={20} weight="bold" />
                      ) : (
                        <Eye size={20} weight="bold" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Confirm your password"
                      className="w-full px-4 py-3 border border-[#e5e5e5] rounded-lg focus:outline-none focus:border-[#8b6f47] transition bg-white text-black"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-4 py-3 bg-[#8b6f47] text-white font-bold rounded-lg hover:bg-[#6b5535] transition disabled:opacity-50 disabled:cursor-not-allowed">
                  {loading ? "Creating account..." : "Create account"}
                </button>

                {/* Divider */}
                <div className="flex items-center gap-4 my-6">
                  <div className="flex-1 h-px bg-[#e5e5e5]"></div>
                  <span className="text-xs text-gray-600">OR</span>
                  <div className="flex-1 h-px bg-[#e5e5e5]"></div>
                </div>

                {/* Google OAuth Button */}
                <a
                  href={`${
                    process.env.NEXT_PUBLIC_API_BASE_URL ||
                    "http://localhost:8000"
                  }/api/auth/google`}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-[#e5e5e5] text-black font-semibold rounded-lg hover:bg-gray-50 transition">
                  <svg
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="currentColor">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Sign up with Google
                </a>
              </form>
            )}

            {/* Toggle between login and register */}
            <div className="mt-6 text-center border-t border-gray-200 pt-6 space-y-4">
              <div>
                <p className="text-gray-600">
                  {isLogin
                    ? "Don't have an account? "
                    : "Already have an account? "}
                  <button
                    onClick={() => {
                      setIsLogin(!isLogin);
                      setError("");
                      setFormData({
                        usernameOrEmail: "",
                        password: "",
                        confirmPassword: "",
                        username: "",
                        email: "",
                        firstName: "",
                        lastName: "",
                      });
                    }}
                    className="text-[#8b6f47] font-bold hover:underline">
                    {isLogin ? "Sign up" : "Log in"}
                  </button>
                </p>
              </div>

              {/* Use as Display Button */}
              <div className="pt-4">
                <div className="relative mb-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-600">or</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Link
                    href="/display-register"
                    className="w-full px-6 py-2 border-2 border-[#8b6f47] text-[#8b6f47] font-semibold rounded-lg hover:bg-[#f5f0e8] transition text-center flex items-center justify-center gap-2">
                    <Monitor
                      size={18}
                      weight="bold"
                      className="text-[#8b6f47]"
                    />
                    Register Display
                  </Link>
                  <Link
                    href="/display-login"
                    className="w-full px-6 py-2 border-2 border-blue-500 font-semibold rounded-lg hover:bg-blue-50 transition text-center flex items-center justify-center gap-2">
                    <Plug size={18} weight="bold" className="text-blue-500" />
                    <span className="text-blue-500">Login to Display</span>
                  </Link>
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Turn this device into an ad display
                </p>
              </div>
            </div>

            {/* Back to home */}
            <div className="mt-8 text-center">
              <Link
                href="/"
                className="text-gray-600 hover:text-black transition">
                ← Back to home
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Content Section with Image */}
      <div
        className="hidden lg:flex w-1/2 items-center justify-center bg-cover bg-center bg-no-repeat relative overflow-hidden"
        style={{ backgroundImage: "url(/admiro.jpg)" }}>
        {/* Optional overlay for better form visibility if needed */}
        <div className="absolute inset-0 bg-black/0"></div>
      </div>
    </main>
  );
}
