import React, { useState, useEffect } from "react";
import { CheckCircle2, AlertCircle, X } from "lucide-react";

const NotificationBanner = ({ success, error, setError }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [visibleSuccess, setVisibleSuccess] = useState("");
  const [visibleError, setVisibleError] = useState("");

  const playBannerSound = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;

      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.value = error ? 600 : 900;

      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.18);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.18);
    } catch (soundErr) {
      console.error("Failed to play banner sound:", soundErr);
    }
  };

  useEffect(() => {
    if (success || error) {
      if (success) {
        setVisibleSuccess(success);
      }

      if (error) {
        setVisibleError(error);
      }

      setIsVisible(true);
      playBannerSound();
      const timer = setTimeout(() => {
        setIsVisible(false);
        setVisibleSuccess("");
        setVisibleError("");
      }, 50000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  if (!isVisible || (!visibleSuccess && !visibleError)) return null;

  return (
    <div className="fixed top-[max(1rem,env(safe-area-inset-top))] left-2 right-2 sm:top-20 sm:left-auto sm:right-6 z-50 animate-slideDown">
      {visibleSuccess && (
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 sm:px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 min-w-0 sm:min-w-[320px] border-2 border-green-400 animate-slideUp w-full sm:w-auto">
          <div className="bg-white/20 p-2 rounded-lg backdrop-blur">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <span className="font-semibold text-base sm:text-lg flex-1">
            {visibleSuccess}
          </span>
        </div>
      )}
      {visibleError && (
        <div className="bg-gradient-to-r from-red-500 to-rose-500 text-white px-4 sm:px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 min-w-0 sm:min-w-[320px] border-2 border-red-400 animate-slideUp w-full sm:w-auto">
          <div className="bg-white/20 p-2 rounded-lg backdrop-blur">
            <AlertCircle className="w-6 h-6" />
          </div>
          <span className="font-semibold text-base sm:text-lg flex-1">
            {visibleError}
          </span>
          <button
            onClick={() => {
              setIsVisible(false);
              setVisibleError("");
              setError("");
            }}
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
