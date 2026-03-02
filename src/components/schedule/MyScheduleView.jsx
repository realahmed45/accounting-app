import React, { useState, useEffect } from "react";
import {
  Clock,
  MapPin,
  Camera,
  CheckCircle2,
  AlertCircle,
  Calendar,
  ChevronRight,
  Info,
  TrendingUp,
  Zap,
  Target,
} from "lucide-react";
import { shiftService, timeOffService } from "../../services/scheduleApi";

const MyScheduleView = ({ accountId }) => {
  const [myShifts, setMyShifts] = useState([]);
  const [timeOff, setTimeOff] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(null);
  const [checkingOut, setCheckingOut] = useState(null);

  useEffect(() => {
    if (accountId) {
      loadMyData();
    }
  }, [accountId]);

  const loadMyData = async () => {
    setLoading(true);
    try {
      const [shiftsRes, timeOffRes] = await Promise.all([
        shiftService.getMine(accountId),
        timeOffService.getMine(accountId),
      ]);
      setMyShifts(shiftsRes.data);
      setTimeOff(timeOffRes.data);
    } catch (err) {
      console.error("Failed to load my data:", err);
    } finally {
      setLoading(false);
    }
  };

  const isImageTooLarge = (base64String, maxSizeMB = 5) => {
    const stringLength = base64String.length;
    const sizeInBytes = (stringLength * 3) / 4;
    const sizeInMB = sizeInBytes / (1024 * 1024);
    return sizeInMB > maxSizeMB;
  };

  const handleCheckIn = async (shift) => {
    setCheckingIn(shift._id);
    try {
      // 1. Get GPS Position
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        });
      });

      // 2. Capture Real Photo
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      });
      const video = document.createElement("video");
      video.srcObject = stream;
      await video.play();

      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0);

      const imageData = canvas.toDataURL("image/jpeg", 0.7);

      if (isImageTooLarge(imageData)) {
        throw new Error("Proof image is too large (max 5MB). Try again.");
      }

      // Stop all tracks
      stream.getTracks().forEach((track) => track.stop());

      // 3. Submit to API
      await shiftService.checkIn(accountId, shift._id, {
        imageData,
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        locationLabel: `GPS: ${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`,
      });

      loadMyData();
    } catch (err) {
      let msg = "Verification Failed. ";
      if (err.name === "NotAllowedError")
        msg += "Camera or Location permission denied.";
      else if (err.name === "NotFoundError") msg += "No camera detected.";
      else msg += err.message || "Network or hardware signal too weak.";
      alert(msg);
    } finally {
      setCheckingIn(null);
    }
  };

  const handleCheckOut = async (shift) => {
    setCheckingOut(shift._id);
    try {
      // 1. Get GPS Position
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        });
      });

      // 2. Capture Real Photo
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      });
      const video = document.createElement("video");
      video.srcObject = stream;
      await video.play();

      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0);

      const imageData = canvas.toDataURL("image/jpeg", 0.7);

      if (isImageTooLarge(imageData)) {
        throw new Error("Proof image is too large (max 5MB). Try again.");
      }

      // Stop all tracks
      stream.getTracks().forEach((track) => track.stop());

      // 3. Submit to API
      await shiftService.checkOut(accountId, shift._id, {
        imageData,
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        locationLabel: `GPS: ${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`,
      });

      loadMyData();
    } catch (err) {
      let msg = "Checkout Failed. ";
      if (err.name === "NotAllowedError")
        msg += "Camera or Location permission denied.";
      else if (err.name === "NotFoundError") msg += "No camera detected.";
      else msg += err.message || "Network or hardware signal too weak.";
      alert(msg);
    } finally {
      setCheckingOut(null);
    }
  };

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center py-40">
        <div className="w-16 h-16 relative">
          <div className="absolute inset-0 bg-indigo-500 rounded-full blur-2xl opacity-20 animate-pulse" />
          <div className="w-16 h-16 border-4 border-white/10 border-t-indigo-500 rounded-full animate-spin relative z-10" />
        </div>
        <p className="text-gray-400 font-black uppercase tracking-[0.3em] text-[10px] mt-8">
          Fetching Personal Feed...
        </p>
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-1000">
      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <PremiumStatCard
          label="Operational Window"
          value={
            myShifts[0]
              ? new Date(myShifts[0].date).toLocaleDateString(undefined, {
                  day: "numeric",
                  month: "short",
                })
              : "Standby"
          }
          icon={<Target className="w-6 h-6" />}
          gradient="from-indigo-600 to-blue-500"
          sub="Next Deployment"
        />
        <PremiumStatCard
          label="Available Leave"
          value={timeOff ? timeOff.remainingDays : "0"}
          icon={<Zap className="w-6 h-6" />}
          gradient="from-purple-600 to-pink-600"
          sub="Standard Quota"
        />
        <PremiumStatCard
          label="Overtime Credit"
          value={`+${timeOff?.extraEarnedDays || 0}`}
          icon={<TrendingUp className="w-6 h-6" />}
          gradient="from-cyan-600 to-teal-500"
          sub="Neural Reward Bonus"
        />
      </div>

      {/* Roster Section */}
      <div className="bg-white/5 backdrop-blur-3xl rounded-[3rem] p-10 border border-white/10 shadow-2xl overflow-hidden relative">
        <div className="absolute top-0 right-0 p-20 bg-indigo-500/10 blur-[100px] -mr-40 -mt-40 rounded-full" />

        <div className="relative z-10 mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-4xl font-black text-white tracking-tighter">
              Mission Roster
            </h2>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs mt-2">
              Active Assigned Shifts
            </p>
          </div>
          <div className="bg-white/5 px-6 py-3 rounded-2xl border border-white/10 flex items-center gap-3">
            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">
              Queue Capacity
            </span>
            <span className="text-xl font-black text-white">
              {myShifts.length}
            </span>
          </div>
        </div>

        {myShifts.length === 0 ? (
          <div className="text-center py-24 bg-white/5 rounded-[2.5rem] border border-dashed border-white/10">
            <Calendar className="w-20 h-20 text-white/10 mx-auto mb-6" />
            <p className="text-gray-400 font-black uppercase tracking-widest">
              System Idle — No Shifts Assigned
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {myShifts.map((shift) => {
              const shiftDate = new Date(shift.date);
              const isToday =
                shiftDate.toDateString() === new Date().toDateString();
              const label = shift.shiftTypeId
                ? shift.shiftTypeId.name
                : shift.adHocLabel || "Custom Deployment";
              const startTime = shift.shiftTypeId
                ? shift.shiftTypeId.startTime
                : shift.adHocStart;
              const endTime = shift.shiftTypeId
                ? shift.shiftTypeId.endTime
                : shift.adHocEnd;
              const color = shift.shiftTypeId
                ? shift.shiftTypeId.color
                : "#6366f1";

              return (
                <div
                  key={shift._id}
                  className={`group relative p-8 rounded-[2.5rem] border-2 transition-all duration-500 hover:shadow-[0_0_40px_rgba(99,102,241,0.2)] ${
                    isToday
                      ? "border-indigo-500/50 bg-indigo-500/5 shadow-2xl"
                      : "border-white/5 bg-white/[0.02] hover:border-white/20"
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative z-10">
                    <div className="flex items-center gap-8">
                      <div className="relative">
                        {isToday && (
                          <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-40 animate-pulse" />
                        )}
                        <div className="text-center p-4 rounded-3xl bg-white/5 backdrop-blur-md shadow-2xl border border-white/10 min-w-[100px] relative z-20">
                          <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                            {shiftDate.toLocaleDateString(undefined, {
                              weekday: "short",
                            })}
                          </p>
                          <p className="text-3xl font-black text-white mt-1 leading-none">
                            {shiftDate.getDate()}
                          </p>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center gap-3">
                          <div
                            className="w-3 h-3 rounded-full blur-[2px]"
                            style={{ backgroundColor: color }}
                          />
                          <h3 className="text-2xl font-black text-white tracking-tight">
                            {label}
                          </h3>
                        </div>
                        <div className="flex flex-wrap items-center gap-6 mt-4">
                          <div className="flex items-center gap-2.5 px-4 py-2 bg-white/5 rounded-2xl text-sm font-black text-gray-300 border border-white/5">
                            <Clock className="w-4 h-4 text-indigo-400" />
                            {startTime} — {endTime}
                          </div>
                          {shift.notes && (
                            <div className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-purple-400 border border-purple-500/20">
                              <Info className="w-4 h-4" /> Priority Note
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-end">
                      {isToday ? (
                        shift.hasCheckedOut ? (
                          <div className="px-8 py-4 bg-green-500/10 rounded-2xl border border-green-500/20 text-green-400 font-black text-sm flex items-center gap-3">
                            <CheckCircle2 className="w-5 h-5" /> COMPLETED
                          </div>
                        ) : shift.hasCheckedIn ? (
                          <button
                            disabled={checkingOut === shift._id}
                            onClick={() => handleCheckOut(shift)}
                            className="group relative flex items-center gap-4 bg-rose-600 hover:bg-rose-500 disabled:bg-gray-800 text-white px-10 py-5 rounded-[2rem] font-black text-lg transition-all shadow-2xl shadow-rose-900 active:scale-95 overflow-hidden"
                          >
                            <div
                              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"
                              style={{ backgroundSize: "200% 100%" }}
                            />
                            {checkingOut === shift._id ? (
                              <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <>
                                <Camera className="w-6 h-6 transition-transform group-hover:rotate-12" />
                                CHECK OUT
                              </>
                            )}
                          </button>
                        ) : (
                          <button
                            disabled={checkingIn === shift._id}
                            onClick={() => handleCheckIn(shift)}
                            className="group relative flex items-center gap-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-800 text-white px-10 py-5 rounded-[2rem] font-black text-lg transition-all shadow-2xl shadow-indigo-900 active:scale-95 overflow-hidden"
                          >
                            <div
                              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"
                              style={{ backgroundSize: "200% 100%" }}
                            />
                            {checkingIn === shift._id ? (
                              <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <>
                                <Camera className="w-6 h-6 transition-transform group-hover:rotate-12" />
                                INITIATE PROOF
                              </>
                            )}
                          </button>
                        )
                      ) : (
                        <div className="px-8 py-4 bg-white/5 rounded-2xl border border-white/5 text-gray-400 font-bold text-sm flex items-center gap-3 italic">
                          Scheduled for{" "}
                          {shiftDate.toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                          })}
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  </div>

                  {isToday && (
                    <div className="absolute top-6 right-6">
                      <span className="flex h-3 w-3 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,1)]"></span>
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Neural Privacy Notice */}
      <div className="bg-gradient-to-br from-[#1a1a2e] to-[#0f0f1a] rounded-[3rem] p-10 flex flex-col md:flex-row items-center justify-between gap-10 border border-white/10 shadow-3xl overflow-hidden relative">
        <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-indigo-500/10 blur-[50px] rounded-full" />

        <div className="relative z-10 flex gap-6 items-start">
          <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center border border-white/10 shadow-inner">
            <MapPin className="w-8 h-8 text-indigo-400 animate-bounce" />
          </div>
          <div>
            <h4 className="text-2xl font-black text-white tracking-tight">
              Geo-Verified Environment
            </h4>
            <p className="text-gray-400 font-medium mt-2 leading-relaxed max-w-lg">
              Automated protocols capture neural GPS coordinates and visual
              proof during check-in. This data is encrypted end-to-end to ensure
              operational integrity.
            </p>
          </div>
        </div>

        <div className="relative z-10 group cursor-pointer">
          <div className="absolute inset-0 bg-indigo-500 blur-2xl opacity-0 group-hover:opacity-20 transition-opacity" />
          <div className="bg-indigo-600/10 px-8 py-6 rounded-[2rem] border border-indigo-500/30 backdrop-blur-md relative z-10">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-300 mb-3">
              Verification Badge
            </p>
            <div className="flex items-center gap-3 font-black text-lg text-white">
              <CheckCircle2 className="w-6 h-6 text-indigo-400" />
              SYSTEM SECURED
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const PremiumStatCard = ({ label, value, icon, gradient, sub }) => (
  <div className="group relative bg-[#1a1a2e] rounded-[2.5rem] p-1 border border-white/5 shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.6)]">
    <div
      className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity rounded-[2.5rem]`}
    />
    <div className="bg-[#0f0f1a] rounded-[2.3rem] p-8 h-full relative z-10 border border-white/5">
      <div
        className={`w-14 h-14 bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center text-white shadow-3xl mb-6 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6`}
      >
        {icon}
      </div>
      <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-2">
        {label}
      </p>
      <h3 className="text-3xl font-black text-white tracking-tighter">
        {value}
      </h3>
      <p className="text-xs font-bold text-indigo-400 mt-4 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0 uppercase tracking-widest">
        {sub}
      </p>
    </div>
  </div>
);

export default MyScheduleView;
