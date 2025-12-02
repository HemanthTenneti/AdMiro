"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import axiosInstance from "@/lib/axiosConfig";
import DashboardLayout from "@/components/DashboardLayout";
import { CircleNotch, ArrowLeft, Plus, Trash, Monitor } from "phosphor-react";

export default function CreateLoopPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [ads, setAds] = useState([]);
  const [displays, setDisplays] = useState([]);
  const [selectedAds, setSelectedAds] = useState([]);
  const [selectedDisplayId, setSelectedDisplayId] = useState("");
  const [loopName, setLoopName] = useState("");
  const [description, setDescription] = useState("");
  const [rotationType, setRotationType] = useState("sequential");
  const [displayLayout, setDisplayLayout] = useState("fullscreen");

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.push("/login");
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const [adsRes, displaysRes] = await Promise.all([
          axiosInstance.get("/api/ads?limit=1000"),
          axiosInstance.get("/api/displays?limit=1000"),
        ]);

        const activeAds = adsRes.data.data.advertisements.filter(
          ad => ad.status === "active"
        );
        setAds(activeAds);
        setDisplays(displaysRes.data.data.displays || []);
      } catch (err) {
        console.error("Error fetching data:", err);
        const errorMessage = "Failed to load data";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

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

      if (!selectedDisplayId) {
        const msg = "Please select a display";
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
        displayId: selectedDisplayId,
        loopName: loopName.trim(),
        description: description.trim(),
        rotationType,
        displayLayout,
        advertisements: selectedAds.map((ad, idx) => ({
          adId: ad.adId,
          loopOrder: idx,
        })),
      };

      await axiosInstance.post("/api/loops", payload);
      toast.success("Loop created successfully!");

      // Redirect to loops list
      router.push("/dashboard/loops");
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
              onClick={() => router.push("/dashboard/loops")}
              className="p-2 hover:bg-white/50 rounded-lg transition">
              <ArrowLeft size={24} weight="bold" />
            </button>
            <div>
              <h1 className="text-4xl font-bold text-black">Create New Loop</h1>
              <p className="text-gray-600">
                Build a playlist of advertisements for your display
              </p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <CircleNotch
                  size={48}
                  className="text-[#8b6f47] animate-spin mx-auto mb-4"
                  weight="bold"
                />
                <p className="text-gray-600">Loading...</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Info Section */}
              <div className="bg-white rounded-2xl border-2 border-[#e5e5e5] p-6 shadow-sm">
                <h2 className="text-2xl font-bold text-black mb-6">
                  Loop Details
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-black mb-2">
                      Loop Name *
                    </label>
                    <input
                      type="text"
                      value={loopName}
                      onChange={e => setLoopName(e.target.value)}
                      placeholder="e.g., Morning Ads, Weekend Promo"
                      className="w-full px-4 py-3 border-2 border-[#e5e5e5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b6f47] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-black mb-2">
                      Description
                    </label>
                    <textarea
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      placeholder="Optional description of this loop"
                      rows={3}
                      className="w-full px-4 py-3 border-2 border-[#e5e5e5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b6f47] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-black mb-2">
                      Select Display *
                    </label>
                    {displays.length === 0 ? (
                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700">
                        No displays available. Please create a display first.
                      </div>
                    ) : (
                      <select
                        value={selectedDisplayId}
                        onChange={e => setSelectedDisplayId(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-[#e5e5e5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b6f47] focus:border-transparent">
                        <option value="">Choose a display...</option>
                        {displays.map(display => (
                          <option key={display._id} value={display._id}>
                            {display.displayName}
                            {display.location ? ` - ${display.location}` : ""}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-black mb-2">
                      Display Layout
                    </label>
                    <select
                      value={displayLayout}
                      onChange={e => setDisplayLayout(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-[#e5e5e5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b6f47] focus:border-transparent">
                      <option value="fullscreen">Fullscreen</option>
                      <option value="masonry">Masonry</option>
                    </select>
                  </div>

                  {displayLayout === "fullscreen" && (
                    <div>
                      <label className="block text-sm font-semibold text-black mb-2">
                        Rotation Type
                      </label>
                      <select
                        value={rotationType}
                        onChange={e => setRotationType(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-[#e5e5e5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b6f47] focus:border-transparent">
                        <option value="sequential">
                          Sequential (slideshow)
                        </option>
                        <option value="random">Random</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>

              {/* Advertisement Selection */}
              <div className="bg-white rounded-2xl border-2 border-[#e5e5e5] p-6 shadow-sm">
                <h2 className="text-2xl font-bold text-black mb-6">
                  Add Advertisements
                </h2>

                {ads.length === 0 ? (
                  <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700 text-center">
                    <p className="font-semibold mb-2">
                      No active advertisements available
                    </p>
                    <p className="text-sm">
                      Create some ads first before building a loop.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {ads.map(ad => (
                      <div
                        key={ad._id}
                        className="p-4 border-2 border-[#e5e5e5] rounded-lg hover:border-[#8b6f47] transition flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-black">
                            {ad.adName}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {ad.mediaType === "image" ? "📷 Image" : "🎬 Video"}{" "}
                            • {ad.duration}s
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleAddAd(ad._id)}
                          disabled={selectedAds.some(
                            item => item.adId === ad._id
                          )}
                          className="px-4 py-2 bg-[#8b6f47] hover:bg-[#7a5f3a] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition flex items-center gap-2">
                          <Plus size={16} weight="bold" />
                          Add
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Selected Advertisements */}
              {selectedAds.length > 0 && (
                <div className="bg-white rounded-2xl border-2 border-[#e5e5e5] p-6 shadow-sm">
                  <h2 className="text-2xl font-bold text-black mb-6">
                    Loop Order ({selectedAds.length} ads)
                  </h2>

                  <div className="space-y-2">
                    {selectedAds.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-4 bg-[#f5f3f0] border-2 border-[#e5e5e5] rounded-lg flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleMoveAd(idx, "up")}
                            disabled={idx === 0}
                            className="p-1 hover:bg-[#8b6f47] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed rounded transition">
                            ▲
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveAd(idx, "down")}
                            disabled={idx === selectedAds.length - 1}
                            className="p-1 hover:bg-[#8b6f47] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed rounded transition">
                            ▼
                          </button>
                        </div>

                        <div className="flex-1">
                          <p className="font-semibold text-black">
                            #{idx + 1} - {item.adName}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveAd(idx)}
                          className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition">
                          <Trash size={20} weight="bold" />
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
                  onClick={() => router.push("/dashboard/loops")}
                  className="flex-1 px-6 py-3 bg-white border-2 border-[#e5e5e5] text-gray-700 font-semibold rounded-xl hover:bg-[#f5f3f0] transition">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    submitting ||
                    selectedAds.length === 0 ||
                    !loopName.trim() ||
                    !selectedDisplayId
                  }
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#8b6f47] hover:bg-[#7a5f3a] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition">
                  {submitting ? (
                    <>
                      <CircleNotch
                        size={20}
                        className="animate-spin"
                        weight="bold"
                      />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus size={20} weight="bold" />
                      Create Loop
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
