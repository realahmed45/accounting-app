import React, { useState } from "react";
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
  HelpCircle,
} from "lucide-react";
import axios from "axios";

/**
 * Sample Data Loader Component
 * Allows users to inject demo data to explore and learn the system
 */
const SampleDataLoader = ({ accountId, onDataLoaded }) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const loadSampleData = async (dataType = "all") => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");
      let endpoint = "";

      switch (dataType) {
        case "all":
          endpoint = `/api/accounts/${accountId}/sample-data/seed-all`;
          break;
        case "shifts":
          endpoint = `/api/accounts/${accountId}/sample-data/seed-shifts`;
          break;
        case "expenses":
          endpoint = `/api/accounts/${accountId}/sample-data/seed-expenses`;
          break;
        default:
          endpoint = `/api/accounts/${accountId}/sample-data/seed-all`;
      }

      const response = await axios.post(
        `http://localhost:5000${endpoint}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setSuccess(response.data.message || "Sample data loaded successfully!");

      // Callback to refresh the parent component
      if (onDataLoaded) {
        setTimeout(() => onDataLoaded(), 1500);
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || "Failed to load sample data";
      setError(errorMsg);
      console.error("Error loading sample data:", err);
    } finally {
      setLoading(false);
    }
  };

  const clearSampleData = async () => {
    if (!confirm("⚠️ This will remove all sample data. Continue?")) {
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");
      const response = await axios.delete(
        `http://localhost:5000/api/accounts/${accountId}/sample-data/clear`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setSuccess(response.data.message || "Sample data cleared successfully!");

      if (onDataLoaded) {
        setTimeout(() => onDataLoaded(), 1500);
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || "Failed to clear sample data";
      setError(errorMsg);
      console.error("Error clearing sample data:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-2 border-indigo-400/30 rounded-3xl p-6 backdrop-blur-sm">
      <div className="flex items-start gap-4">
        <div className="bg-indigo-500 text-white p-3 rounded-xl flex-shrink-0">
          <Sparkles className="w-6 h-6" />
        </div>

        <div className="flex-1 space-y-4">
          <div>
            <h3 className="text-xl font-black text-white flex items-center gap-2 mb-2">
              <span className="text-red-500 text-2xl">!</span> Try Sample Data
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              New to the system? Load sample data to explore all features
              without setting everything up manually. This creates realistic
              demo shifts, expenses, and activities you can play around with!
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => loadSampleData("all")}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-600 text-white rounded-xl font-bold text-sm transition-all shadow-lg active:scale-95"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Load All Sample Data
                </>
              )}
            </button>

            <button
              onClick={() => loadSampleData("shifts")}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-600 text-white rounded-xl font-bold text-sm transition-all shadow-lg active:scale-95"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>🗓️ Shifts Only</>
              )}
            </button>

            <button
              onClick={clearSampleData}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-red-600/20 hover:bg-red-600/30 disabled:bg-gray-600 text-red-300 border border-red-500/30 rounded-xl font-bold text-sm transition-all active:scale-95"
            >
              🗑️ Clear Sample Data
            </button>
          </div>

          {/* Success Message */}
          {success && (
            <div className="flex items-center gap-3 bg-green-500/10 border border-green-500/30 rounded-xl p-4">
              <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
              <p className="text-green-300 text-sm font-semibold">{success}</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 rounded-xl p-4">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-red-300 text-sm font-semibold">{error}</p>
            </div>
          )}

          {/* Info Box */}
          <div className="bg-amber-500/10 border border-amber-400/30 rounded-xl p-4 flex items-start gap-3">
            <HelpCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="text-amber-200 text-xs space-y-1">
              <p className="font-semibold">
                <span className="text-red-500 font-bold">!</span> What happens
                when you load sample data?
              </p>
              <ul className="list-disc list-inside ml-2 space-y-1 text-amber-300/90">
                <li>Creates 5 shift types (Morning, Evening, Night, etc.)</li>
                <li>Schedules 2 weeks of sample shifts for your team</li>
                <li>
                  Adds 30 days of sample expenses across various categories
                </li>
                <li>
                  All sample data is marked with 📘 icon for easy identification
                </li>
                <li>You can clear it anytime without affecting real data</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SampleDataLoader;
