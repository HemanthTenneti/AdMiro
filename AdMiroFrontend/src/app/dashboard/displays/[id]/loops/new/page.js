"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import axiosInstance from "@/lib/axiosConfig";
import DashboardLayout from "@/components/DashboardLayout";
import {
  CircleNotch,
  ArrowLeft,
  Plus,
  Trash,
  GripVertical,
} from "phosphor-react";

export default function CreateLoopPage() {
  const router = useRouter();
  const params = useParams();
  const displayId = params.id;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [ads, setAds] = useState([]);
  const [selectedAds, setSelectedAds] = useState([]);
  const [loopName, setLoopName] = useState("");
  const [description, setDescription] = useState("");
  const [rotationType, setRotationType] = useState("sequential");
  const [displayName, setDisplayName] = useState("");

  const fetchDisplay = useCallback(async () => {
    try {
      const response = await axiosInstance.get(`/api/displays/${displayId}`);
      setDisplayName(response.data.data.displayName);
    } catch (err) {
      console.error("Error fetching display:", err);
      setError("Failed to load display");
    }
  }, [displayId]);

  const fetchAds = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/api/ads?limit=1000");
      const activeAds = response.data.data.advertisements.filter(
        ad => ad.status === "active"
      );
      setAds(activeAds);
    } catch (err) {
      console.error("Error fetching ads:", err);
      const errorMessage = "Failed to load advertisements";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDisplay();
    fetchAds();
  }, [displayId, fetchDisplay, fetchAds]);

  const handleAddAd = adId => {
    if (!selectedAds.find(item => item.adId === adId)) {
      setSelectedAds([
        ...selectedAds,
        {
          adId,
          loopOrder: selectedAds.length,
          adName: ads.find(a => a._id === adId)?.adName,
        },
      ]);
    }
  };

  const handleRemoveAd = index => {
    setSelectedAds(selectedAds.filter((_, i) => i !== index));
  };

  const handleMoveAd = (index, direction) => {
    if (direction === "up" && index > 0) {
      const newAds = [...selectedAds];
      [newAds[index], newAds[index - 1]] = [newAds[index - 1], newAds[index]];
      setSelectedAds(newAds);
    } else if (direction === "down" && index < selectedAds.length - 1) {
      const newAds = [...selectedAds];
      [newAds[index], newAds[index + 1]] = [newAds[index + 1], newAds[index]];
      setSelectedAds(newAds);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      if (!loopName.trim()) {
        const msg = "Loop name is required";
        setError(msg);
        toast.error(msg);
        setSubmitting(false);
        return;
      }

      if (selectedAds.length === 0) {
        const msg = "Please add at least one advertisement";
        setError(msg);
        toast.error(msg);
        setSubmitting(false);
        return;
      }

      const payload = {
        displayId,
        loopName: loopName.trim(),
        description: description.trim(),
        rotationType,
        advertisements: selectedAds.map((ad, idx) => ({
          adId: ad.adId,
          loopOrder: idx,
        })),
      };

      const response = await axiosInstance.post("/api/loops", payload);
      toast.success("Loop created successfully!");

      // Redirect to loops list
      router.push(`/dashboard/displays/${displayId}/loops`);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to create loop";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8 flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition">
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">
                Create New Playlist
              </h1>
              <p className="text-gray-600">For: {displayName}</p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Info Section */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Playlist Details
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Playlist Name *
                  </label>
                  <input
                    type="text"
                    value={loopName}
                    onChange={e => setLoopName(e.target.value)}
                    placeholder="e.g., Morning Ads, Weekend Promo"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b6f47] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Optional description of this playlist"
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b6f47] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Rotation Type
                  </label>
                  <select
                    value={rotationType}
                    onChange={e => setRotationType(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b6f47] focus:border-transparent">
                    <option value="sequential">Sequential (in order)</option>
                    <option value="random">Random</option>
                    <option value="scheduled">Scheduled</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Advertisement Selection */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Add Advertisements
              </h2>

              {loading ? (
                <div className="flex justify-center py-8">
                  <CircleNotch
                    size={40}
                    className="animate-spin text-[#8b6f47]"
                  />
                </div>
              ) : ads.length === 0 ? (
                <p className="text-gray-600 py-8">
                  No active advertisements available. Create some ads first.
                </p>
              ) : (
                <div className="space-y-3">
                  {ads.map(ad => (
                    <div
                      key={ad._id}
                      className="p-4 border border-gray-200 rounded-lg hover:border-[#8b6f47] transition flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">
                          {ad.adName}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {ad.mediaType === "image" ? "📷 Image" : "🎬 Video"} •{" "}
                          {ad.duration}s
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAddAd(ad._id)}
                        disabled={selectedAds.some(
                          item => item.adId === ad._id
                        )}
                        className="px-4 py-2 bg-[#8b6f47] hover:bg-[#7a5f3a] disabled:opacity-50 text-white font-semibold rounded-lg transition flex items-center gap-2">
                        <Plus size={16} />
                        Add
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Selected Advertisements */}
            {selectedAds.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Playlist Order ({selectedAds.length} ads)
                </h2>

                <div className="space-y-2">
                  {selectedAds.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-[#faf9f7] border border-gray-200 rounded-lg flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleMoveAd(idx, "up")}
                          disabled={idx === 0}
                          className="p-1 hover:bg-gray-300 disabled:opacity-30 rounded">
                          ▲
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveAd(idx, "down")}
                          disabled={idx === selectedAds.length - 1}
                          className="p-1 hover:bg-gray-300 disabled:opacity-30 rounded">
                          ▼
                        </button>
                      </div>

                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">
                          #{idx + 1} - {item.adName}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveAd(idx)}
                        className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition">
                        <Trash size={20} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Submit Buttons */}
            <div className="flex gap-4 pb-8">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition">
                Cancel
              </button>
              <button
                type="submit"
                disabled={
                  submitting || selectedAds.length === 0 || !loopName.trim()
                }
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#8b6f47] hover:bg-[#7a5f3a] disabled:opacity-50 text-white font-semibold rounded-lg transition">
                {submitting ? (
                  <>
                    <CircleNotch size={20} className="animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Playlist"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
