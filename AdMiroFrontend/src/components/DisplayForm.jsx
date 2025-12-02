"use client";

import { useState } from "react";

export default function DisplayForm({ onSubmit, isLoading, error }) {
  // Get screen resolution
  const getScreenResolution = () => {
    if (typeof window !== "undefined") {
      return {
        width: window.screen.width,
        height: window.screen.height,
      };
    }
    return { width: 1920, height: 1080 };
  };

  const screenResolution = getScreenResolution();

  const [formData, setFormData] = useState({
    displayId: "",
    displayName: "",
    location: "",
    password: "",
    width: screenResolution.width,
    height: screenResolution.height,
  });

  const [validationErrors, setValidationErrors] = useState({});

  const handleInputChange = e => {
    const { name, value, type } = e.target;
    const newValue = type === "number" ? parseInt(value) : value;

    setFormData(prev => ({
      ...prev,
      [name]: newValue,
    }));

    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.displayId.trim()) {
      errors.displayId = "Display ID is required.";
    } else if (formData.displayId.length < 3) {
      errors.displayId = "Display ID must be at least 3 characters.";
    }

    if (!formData.displayName.trim()) {
      errors.displayName = "Display name is required.";
    } else if (formData.displayName.length < 3) {
      errors.displayName = "Display name must be at least 3 characters.";
    }

    if (!formData.location.trim()) {
      errors.location = "Location is required.";
    } else if (formData.location.length < 3) {
      errors.location = "Location must be at least 3 characters.";
    }

    if (formData.password && formData.password.length < 4) {
      errors.password = "Password must be at least 4 characters if provided.";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Prepare data for submission
    const displayData = {
      displayId: formData.displayId.trim(),
      displayName: formData.displayName.trim(),
      location: formData.location.trim(),
      password: formData.password.trim() || undefined,
      resolution: {
        width: formData.width,
        height: formData.height,
      },
    };

    await onSubmit(displayData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Display ID */}
      <div>
        <label className="block text-sm font-medium text-black mb-2">
          Display ID <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="displayId"
          value={formData.displayId}
          onChange={handleInputChange}
          placeholder="e.g., LOBBY-1, STORE-MAIN"
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none transition bg-white text-black ${
            validationErrors.displayId
              ? "border-red-500 focus:border-red-500"
              : "border-[#e5e5e5] focus:border-[#8b6f47]"
          }`}
          disabled={isLoading}
        />
        {validationErrors.displayId && (
          <p className="mt-1 text-sm text-red-600">
            {validationErrors.displayId}
          </p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Unique identifier for your display. Used for searching, sorting, and
          filtering.
        </p>
      </div>

      {/* Display Name */}
      <div>
        <label className="block text-sm font-medium text-black mb-2">
          Display Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="displayName"
          value={formData.displayName}
          onChange={handleInputChange}
          placeholder="e.g., Main Lobby Display"
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none transition bg-white text-black ${
            validationErrors.displayName
              ? "border-red-500 focus:border-red-500"
              : "border-[#e5e5e5] focus:border-[#8b6f47]"
          }`}
          disabled={isLoading}
        />
        {validationErrors.displayName && (
          <p className="mt-1 text-sm text-red-600">
            {validationErrors.displayName}
          </p>
        )}
      </div>

      {/* Location */}
      <div>
        <label className="block text-sm font-medium text-black mb-2">
          Location <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="location"
          value={formData.location}
          onChange={handleInputChange}
          placeholder="e.g., Building A, Floor 2"
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none transition bg-white text-black ${
            validationErrors.location
              ? "border-red-500 focus:border-red-500"
              : "border-[#e5e5e5] focus:border-[#8b6f47]"
          }`}
          disabled={isLoading}
        />
        {validationErrors.location && (
          <p className="mt-1 text-sm text-red-600">
            {validationErrors.location}
          </p>
        )}
      </div>

      {/* Password */}
      <div>
        <label className="block text-sm font-medium text-black mb-2">
          Password (Optional)
        </label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleInputChange}
          placeholder="Set a password for display login"
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none transition bg-white text-black ${
            validationErrors.password
              ? "border-red-500 focus:border-red-500"
              : "border-[#e5e5e5] focus:border-[#8b6f47]"
          }`}
          disabled={isLoading}
        />
        {validationErrors.password && (
          <p className="mt-1 text-sm text-red-600">
            {validationErrors.password}
          </p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Optional password for additional security when logging in displays.
          Leave blank for no password protection.
        </p>
      </div>

      {/* Resolution - Auto-detected from display */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 text-sm mb-3">
          Display Resolution (Auto-detected)
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-blue-900 mb-1">
              Width
            </label>
            <div className="px-4 py-3 bg-white border border-blue-200 rounded-lg text-blue-900 font-semibold">
              {formData.width}px
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-blue-900 mb-1">
              Height
            </label>
            <div className="px-4 py-3 bg-white border border-blue-200 rounded-lg text-blue-900 font-semibold">
              {formData.height}px
            </div>
          </div>
        </div>
        <p className="mt-3 text-xs text-blue-800">
          Resolution is automatically detected from your display. It cannot be
          modified during display creation.
        </p>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-[#8b6f47] hover:bg-[#6d5636] disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition duration-200">
        {isLoading ? "Adding Display..." : "Add Display"}
      </button>
    </form>
  );
}
