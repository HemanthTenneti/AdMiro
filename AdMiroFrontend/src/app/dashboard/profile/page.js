"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import axiosInstance from "@/lib/axiosConfig";
import DashboardLayout from "@/components/DashboardLayout";
import { ArrowLeft, CircleNotch, Upload, Eye, EyeSlash } from "phosphor-react";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [isGoogleOAuth, setIsGoogleOAuth] = useState(false);

  // Profile form
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  // Email form
  const [newEmail, setNewEmail] = useState("");

  // Password form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Profile picture
  const [profilePicture, setProfilePicture] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.push("/login");
      return;
    }

    fetchUserProfile();
  }, [router]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/api/profile");
      setUser(response.data.data);
      setFirstName(response.data.data.firstName || "");
      setLastName(response.data.data.lastName || "");
      setNewEmail(response.data.data.email || "");
      setProfilePicture(response.data.data.profilePicture);
      // Check if user registered via Google OAuth
      setIsGoogleOAuth(response.data.data.googleId ? true : false);
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async e => {
    e.preventDefault();

    if (!firstName.trim() || !lastName.trim()) {
      toast.error("First name and last name are required");
      return;
    }

    try {
      setSaving(true);
      await axiosInstance.put("/api/profile", {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });

      // Update localStorage
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      user.firstName = firstName.trim();
      user.lastName = lastName.trim();
      localStorage.setItem("user", JSON.stringify(user));

      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateEmail = async e => {
    e.preventDefault();

    if (!newEmail.trim()) {
      toast.error("Email is required");
      return;
    }

    try {
      setSaving(true);
      await axiosInstance.put("/api/profile/email", {
        email: newEmail.trim(),
      });

      toast.success("Email updated successfully!");
    } catch (error) {
      console.error("Error updating email:", error);
      toast.error(error.response?.data?.message || "Failed to update email");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async e => {
    e.preventDefault();

    // Validate new passwords first (same for all users)
    if (!newPassword || newPassword.trim() === "") {
      toast.error("New password is required");
      return;
    }

    if (!confirmPassword || confirmPassword.trim() === "") {
      toast.error("Password confirmation is required");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    // Current password is required ONLY if user is a pure OAuth user (hasn't set a password yet)
    // Once they set a password, they can log in with either OAuth or password, so they need current password to change it
    if (isGoogleOAuth) {
      // Pure OAuth user setting password for the first time - don't need current password
    } else {
      // User has already set a password (either from start or after OAuth registration)
      // They need current password to change it
      if (!currentPassword || currentPassword.trim() === "") {
        toast.error("Current password is required");
        return;
      }
    }

    try {
      setSaving(true);
      await axiosInstance.put("/api/profile/password", {
        currentPassword: isGoogleOAuth ? undefined : currentPassword,
        newPassword,
        confirmPassword,
      });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      // After successful password change, if user was pure OAuth user, treat them as dual-auth user
      // This means they now have a password and must provide current password for future changes
      if (isGoogleOAuth) {
        setIsGoogleOAuth(false);
      }

      toast.success("Password changed successfully!");
    } catch (error) {
      console.error("Error changing password:", error);
      toast.error(error.response?.data?.message || "Failed to change password");
    } finally {
      setSaving(false);
    }
  };

  const handleProfilePictureUpload = async e => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Only image files are allowed");
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("profilePicture", file);

      const response = await axiosInstance.post(
        "/api/profile/picture",
        formData
      );
      setProfilePicture(response.data.data.profilePicture);
      toast.success("Profile picture updated successfully!");
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      toast.error(
        error.response?.data?.message || "Failed to upload profile picture"
      );
    } finally {
      setUploading(false);
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
              <p className="text-gray-600">Loading your profile...</p>
            </div>
          </div>
        </main>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <main className="min-h-screen bg-linear-to-br from-[#faf9f7] to-[#f5f3f0] p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => router.push("/dashboard")}
              className="flex items-center gap-2 text-[#8b6f47] hover:text-[#6d5636] font-medium mb-6">
              <ArrowLeft size={20} weight="bold" />
              Back to Dashboard
            </button>

            <h1 className="text-4xl font-bold text-black mb-2">
              Profile Settings
            </h1>
            <p className="text-gray-600">Manage your account information</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Profile Picture Section */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl border-2 border-[#e5e5e5] p-6 sticky top-6">
                <div className="text-center">
                  {profilePicture ? (
                    <img
                      src={profilePicture}
                      alt="Profile"
                      className="w-32 h-32 rounded-full object-cover mx-auto mb-4 border-4 border-[#8b6f47]"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-[#8b6f47] text-white flex items-center justify-center mx-auto mb-4 text-4xl font-bold border-4 border-[#8b6f47]">
                      {user?.firstName?.charAt(0).toUpperCase() ||
                        user?.username?.charAt(0).toUpperCase() ||
                        "U"}
                    </div>
                  )}

                  <label className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[#8b6f47] hover:bg-[#7a5f3a] text-white font-semibold rounded-lg transition cursor-pointer">
                    <Upload size={18} weight="bold" />
                    {uploading ? "Uploading..." : "Change Photo"}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfilePictureUpload}
                      disabled={uploading}
                      className="hidden"
                    />
                  </label>

                  <div className="mt-6 pt-6 border-t border-gray-200 text-left">
                    <p className="text-xs text-gray-500 uppercase font-semibold mb-2">
                      Username
                    </p>
                    <p className="text-lg font-bold text-black">
                      {user?.username}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      Cannot be changed
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Settings Tabs */}
            <div className="lg:col-span-3">
              {/* Tab Navigation */}
              <div className="flex gap-2 mb-8 border-b border-[#e5e5e5]">
                <button
                  onClick={() => setActiveTab("profile")}
                  className={`px-4 py-3 font-semibold transition border-b-2 ${
                    activeTab === "profile"
                      ? "border-[#8b6f47] text-[#8b6f47]"
                      : "border-transparent text-gray-600 hover:text-[#8b6f47]"
                  }`}>
                  Profile Info
                </button>
                <button
                  onClick={() => setActiveTab("email")}
                  className={`px-4 py-3 font-semibold transition border-b-2 ${
                    activeTab === "email"
                      ? "border-[#8b6f47] text-[#8b6f47]"
                      : "border-transparent text-gray-600 hover:text-[#8b6f47]"
                  }`}>
                  Email
                </button>
                <button
                  onClick={() => setActiveTab("password")}
                  className={`px-4 py-3 font-semibold transition border-b-2 ${
                    activeTab === "password"
                      ? "border-[#8b6f47] text-[#8b6f47]"
                      : "border-transparent text-gray-600 hover:text-[#8b6f47]"
                  }`}>
                  Password
                </button>
              </div>

              {/* Profile Info Tab */}
              {activeTab === "profile" && (
                <form
                  onSubmit={handleUpdateProfile}
                  className="bg-white rounded-2xl border-2 border-[#e5e5e5] p-8">
                  <h2 className="text-2xl font-bold text-black mb-6">
                    Personal Information
                  </h2>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={e => setFirstName(e.target.value)}
                        placeholder="Enter your first name"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b6f47] focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={e => setLastName(e.target.value)}
                        placeholder="Enter your last name"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b6f47] focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={user?.email}
                        disabled
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed text-gray-600"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Edit email in the Email tab
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={saving}
                      className="w-full px-6 py-3 bg-[#8b6f47] hover:bg-[#7a5f3a] disabled:opacity-50 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2">
                      {saving ? (
                        <>
                          <CircleNotch
                            size={18}
                            className="animate-spin"
                            weight="bold"
                          />
                          Saving...
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* Email Tab */}
              {activeTab === "email" && (
                <form
                  onSubmit={handleUpdateEmail}
                  className="bg-white rounded-2xl border-2 border-[#e5e5e5] p-8">
                  <h2 className="text-2xl font-bold text-black mb-6">
                    Email Address
                  </h2>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        New Email Address
                      </label>
                      <input
                        type="email"
                        value={newEmail}
                        onChange={e => setNewEmail(e.target.value)}
                        placeholder="Enter your new email"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b6f47] focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        We'll send a verification link to your new email address
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={saving}
                      className="w-full px-6 py-3 bg-[#8b6f47] hover:bg-[#7a5f3a] disabled:opacity-50 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2">
                      {saving ? (
                        <>
                          <CircleNotch
                            size={18}
                            className="animate-spin"
                            weight="bold"
                          />
                          Updating...
                        </>
                      ) : (
                        "Update Email"
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* Password Tab */}
              {activeTab === "password" && (
                <form
                  onSubmit={handleChangePassword}
                  className="bg-white rounded-2xl border-2 border-[#e5e5e5] p-8">
                  <h2 className="text-2xl font-bold text-black mb-6">
                    Change Password
                  </h2>

                  {isGoogleOAuth && (
                    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>Note:</strong> Since you signed up with Google,
                        you can set a password here. After that, you'll be able
                        to log in with either Google or your password.
                      </p>
                    </div>
                  )}

                  <div className="space-y-6">
                    {!isGoogleOAuth && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Current Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPasswords.current ? "text" : "password"}
                            value={currentPassword}
                            onChange={e => setCurrentPassword(e.target.value)}
                            placeholder="Enter your current password"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b6f47] focus:border-transparent"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowPasswords(prev => ({
                                ...prev,
                                current: !prev.current,
                              }))
                            }
                            className="absolute right-4 top-3 text-gray-500 hover:text-gray-700">
                            {showPasswords.current ? (
                              <EyeSlash size={20} weight="bold" />
                            ) : (
                              <Eye size={20} weight="bold" />
                            )}
                          </button>
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPasswords.new ? "text" : "password"}
                          value={newPassword}
                          onChange={e => setNewPassword(e.target.value)}
                          placeholder="Enter your new password"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b6f47] focus:border-transparent"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowPasswords(prev => ({
                              ...prev,
                              new: !prev.new,
                            }))
                          }
                          className="absolute right-4 top-3 text-gray-500 hover:text-gray-700">
                          {showPasswords.new ? (
                            <EyeSlash size={20} weight="bold" />
                          ) : (
                            <Eye size={20} weight="bold" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPasswords.confirm ? "text" : "password"}
                          value={confirmPassword}
                          onChange={e => setConfirmPassword(e.target.value)}
                          placeholder="Confirm your new password"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b6f47] focus:border-transparent"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowPasswords(prev => ({
                              ...prev,
                              confirm: !prev.confirm,
                            }))
                          }
                          className="absolute right-4 top-3 text-gray-500 hover:text-gray-700">
                          {showPasswords.confirm ? (
                            <EyeSlash size={20} weight="bold" />
                          ) : (
                            <Eye size={20} weight="bold" />
                          )}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={saving}
                      className="w-full px-6 py-3 bg-[#8b6f47] hover:bg-[#7a5f3a] disabled:opacity-50 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2">
                      {saving ? (
                        <>
                          <CircleNotch
                            size={18}
                            className="animate-spin"
                            weight="bold"
                          />
                          Changing...
                        </>
                      ) : (
                        "Change Password"
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>
    </DashboardLayout>
  );
}
