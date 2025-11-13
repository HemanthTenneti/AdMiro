"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import gsap from "gsap";
import { Eye, EyeSlash } from "phosphor-react";

export default function LoginPage() {
  const router = useRouter();
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
      const response = await axios.post(
        "http://localhost:8000/api/auth/login",
        {
          usernameOrEmail: formData.usernameOrEmail,
          password: formData.password,
        }
      );

      // Store access token in localStorage
      localStorage.setItem("accessToken", response.data.data.accessToken);
      localStorage.setItem("user", JSON.stringify(response.data.data.user));

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (err) {
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
      const response = await axios.post(
        "http://localhost:8000/api/auth/register",
        {
          username: formData.username,
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          firstName: formData.firstName,
          lastName: formData.lastName,
        }
      );

      // Store access token in localStorage
      localStorage.setItem("accessToken", response.data.data.accessToken);
      localStorage.setItem("user", JSON.stringify(response.data.data.user));

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className="min-h-screen bg-[#faf9f7] flex items-center justify-center px-8"
      ref={mainRef}>
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 mb-12">
          <div className="w-8 h-8 bg-[#8b6f47] rounded flex items-center justify-center text-white text-sm font-bold">
            A
          </div>
          <span className="text-2xl font-bold text-black">AdMiro</span>
        </Link>

        {/* Form Card */}
        <div
          className="bg-white rounded-2xl border border-[#e5e5e5] p-8"
          ref={cardRef}>
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
            </form>
          )}

          {/* Toggle between login and register */}
          <div className="mt-6 text-center">
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
        </div>

        {/* Back to home */}
        <div className="mt-8 text-center">
          <Link href="/" className="text-gray-600 hover:text-black transition">
            ← Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
