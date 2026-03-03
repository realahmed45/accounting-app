import React, { useState, useEffect } from "react";
import { CheckCircle2, AlertCircle, X } from "lucide-react";

const NotificationBanner = ({ success, error, setError }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (success || error) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  if (!success && !error) return null;

  return (
    <div className="fixed top-20 right-6 z-50 animate-slideDown">
      {success && (
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 min-w-[320px] border-2 border-green-400 animate-slideUp">
          <div className="bg-white/20 p-2 rounded-lg backdrop-blur">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <span className="font-semibold text-lg flex-1">{success}</span>
        </div>
      )}
      {error && (
        <div className="bg-gradient-to-r from-red-500 to-rose-500 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 min-w-[320px] border-2 border-red-400 animate-slideUp">
          <div className="bg-white/20 p-2 rounded-lg backdrop-blur">
            <AlertCircle className="w-6 h-6" />
          </div>
          <span className="font-semibold text-lg flex-1">{error}</span>
          <button
            onClick={() => setError("")}
            className="bg-white/20 hover:bg-white/30 p-1.5 rounded-lg transition-all duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationBanner;
