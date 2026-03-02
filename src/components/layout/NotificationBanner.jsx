import React from "react";
import { CheckCircle2, AlertCircle, X } from "lucide-react";

const NotificationBanner = ({ success, error, setError }) => {
  if (!success && !error) return null;

  return (
    <div className="w-full px-6 xl:px-12 mt-4 space-y-4">
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-xl flex items-center gap-2 shadow-sm">
          <CheckCircle2 className="w-5 h-5" />
          {success}
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl flex items-center gap-2 shadow-sm">
          <AlertCircle className="w-5 h-5" />
          {error}
          <button
            onClick={() => setError("")}
            className="ml-auto hover:bg-red-100 p-1 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationBanner;
