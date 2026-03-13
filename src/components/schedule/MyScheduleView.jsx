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
  HelpCircle,
  Lightbulb,
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
      <div className="flex flex-col items-center justify-center py-40 animate-fadeIn">
        <div className="w-20 h-20 relative">
          <div className="absolute inset-0 bg-indigo-500 rounded-full blur-3xl opacity-20 animate-pulse" />
          <div className="w-20 h-20 border-[6px] border-white/5 border-t-indigo-500 rounded-full animate-spin relative z-10 shadow-[0_0_20px_rgba(79,70,229,0.2)]" />
        </div>
        <p className="text-slate-400 font-black uppercase tracking-[0.4em] text-[10px] mt-10 opacity-70">
          Syncing Neural Persona...
        </p>
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-fadeIn">
      {/* 🎯 INTELLIGENCE BRIEFING */}
      <div className="glass-panel border-indigo-500/20 bg-indigo-500/5 group p-8">
        <div className="flex items-start gap-6">
          <div className="bg-indigo-600 text-white p-4 rounded-2xl shadow-lg shadow-indigo-600/20 group-hover:rotate-12 transition-transform duration-500">
            <Lightbulb className="w-7 h-7" />
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-black text-white tracking-tighter uppercase mb-6 flex items-center gap-3">
               Field Intelligence Protocol
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/5 p-5 rounded-2xl border border-white/5 hover:border-indigo-500/20 transition-all">
                <h4 className="font-black text-indigo-400 text-[10px] uppercase tracking-widest mb-2">
                  01. Chronological Awareness
                </h4>
                <p className="text-slate-400 text-xs font-medium leading-relaxed">
                  Monitor all active work cycles allocated to your ID. Review temporal windows and shift assignments in real-time.
                </p>
              </div>

              <div className="bg-white/5 p-5 rounded-2xl border border-white/5 hover:border-purple-500/20 transition-all">
                <h4 className="font-black text-purple-400 text-[10px] uppercase tracking-widest mb-2">
                  02. Biometric Verification
                </h4>
                <p className="text-slate-400 text-xs font-medium leading-relaxed">
                  Execute "INITIATE PROOF" on deployment days. System requires synchronized GPS and visual signals for authorization.
                </p>
              </div>

              <div className="bg-white/5 p-5 rounded-2xl border border-white/5 hover:border-emerald-500/20 transition-all">
                <h4 className="font-black text-emerald-400 text-[10px] uppercase tracking-widest mb-2">
                  03. Neural Performance
                </h4>
                <p className="text-slate-400 text-xs font-medium leading-relaxed">
                  Track your operational efficiency: monitor upcoming deployment windows and accumulated overtime neural credits.
                </p>
              </div>

              <div className="bg-white/5 p-5 rounded-2xl border border-white/5 hover:border-amber-500/20 transition-all">
                <h4 className="font-black text-amber-400 text-[10px] uppercase tracking-widest mb-2">
                  04. Sensor Permissions
                </h4>
                <p className="text-slate-400 text-xs font-medium leading-relaxed">
                  Ensure environment sensors (Camera/GPS) are authorized. Verification protocols fail if data streams are interrupted.
                </p>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10">
              <div className="flex items-center gap-3 text-amber-400/80">
                <HelpCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em]">
                  Pro Tip: If Roster is empty, coordinate with your Hive Manager for assignment.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <PremiumStatCard
          label="Next Window"
          value={
            myShifts[0]
              ? new Date(myShifts[0].date).toLocaleDateString(undefined, {
                  day: "numeric",
                  month: "short",
                })
              : "Standby"
          }
          icon={<Target className="w-6 h-6" />}
          gradient="from-indigo-600 to-indigo-900"
          sub="Primary Deployment"
        />
        <PremiumStatCard
          label="Neural Quota"
          value={timeOff ? timeOff.remainingDays : "0"}
          icon={<Zap className="w-6 h-6" />}
          gradient="from-purple-600 to-purple-900"
          sub="Authorized Leave"
        />
        <PremiumStatCard
          label="Velocity Credits"
          value={`+${timeOff?.extraEarnedDays || 0}`}
          icon={<TrendingUp className="w-6 h-6" />}
          gradient="from-emerald-600 to-emerald-900"
          sub="Overtime Override"
        />
      </div>

      {/* Roster Section */}
      <div className="glass-panel p-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[80px] -mr-32 -mt-32 rounded-full" />
        
        <div className="relative z-10 mb-12 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div>
            <h2 className="text-4xl font-black text-white tracking-widest uppercase">
               Mission Roster
            </h2>
            <div className="flex items-center gap-3 mt-4">
              <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
              <p className="text-slate-500 font-black uppercase tracking-[0.2em] text-[10px]">
                Authentication Protocol Active
              </p>
            </div>
          </div>
          <div className="bg-white/5 px-8 py-4 rounded-3xl border border-white/10 flex items-center gap-4 backdrop-blur-md">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">
              Cycle Capacity
            </span>
            <span className="text-3xl font-black text-white tabular-nums">
              {myShifts.length.toString().padStart(2, '0')}
            </span>
          </div>
        </div>

        {myShifts.length === 0 ? (
          <div className="text-center py-24 bg-white/5 rounded-[2.5rem] border border-dashed border-white/10">
            <Calendar className="w-20 h-20 text-white/10 mx-auto mb-6" />
            <p className="text-gray-400 font-black uppercase tracking-widest mb-4">
              System Idle — No Shifts Assigned
            </p>

            {/* Beginner Help */}
            <div className="max-w-xl mx-auto mt-8 bg-blue-500/5 border border-blue-400/20 rounded-2xl p-6">
              <div className="flex items-start gap-4 text-left">
                <div className="bg-blue-500 text-white p-2 rounded-lg flex-shrink-0">
                  <Info className="w-5 h-5" />
                </div>
                <div className="space-y-3">
                  <h4 className="text-white font-bold flex items-center gap-2">
                    <span className="text-red-500 text-lg">!</span> Why don't I
                    see any shifts?
                  </h4>
                  <ul className="text-gray-300 text-sm space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 font-bold flex-shrink-0">
                        •
                      </span>
                      <span>Your manager hasn't assigned you shifts yet</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 font-bold flex-shrink-0">
                        •
                      </span>
                      <span>You might be viewing the wrong account</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 font-bold flex-shrink-0">
                        •
                      </span>
                      <span>Contact your team owner to get scheduled</span>
                    </li>
                  </ul>
                  <p className="text-indigo-400 text-xs font-semibold pt-2 border-t border-white/10">
                    <span className="text-red-500">!</span> Tip: This is sample
                    data to help you learn the interface. In real use, your
                    actual shifts will appear here!
                  </p>
                </div>
              </div>
            </div>
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
                  className={`group relative glass-card p-10 border-2 transition-all duration-700 animate-fadeIn ${
                    isToday
                      ? "border-indigo-500/40 bg-indigo-500/5 shadow-[0_0_50px_rgba(79,70,229,0.15)]"
                      : "border-white/5 hover:border-white/10"
                  }`}
                >
                  <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-10 relative z-10">
                    <div className="flex flex-col sm:flex-row items-center gap-10">
                      <div className="relative">
                        {isToday && (
                          <div className="absolute inset-0 bg-indigo-500 blur-3xl opacity-30 animate-pulse" />
                        )}
                        <div className="text-center p-6 rounded-[2rem] bg-slate-900 border border-white/5 shadow-2xl min-w-[120px] relative z-20 group-hover:scale-110 transition-transform duration-500">
                          <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2 opacity-70">
                            {shiftDate.toLocaleDateString(undefined, {
                              weekday: "short",
                            })}
                          </p>
                          <p className="text-4xl font-black text-white leading-none tracking-tighter">
                            {shiftDate.getDate().toString().padStart(2, '0')}
                          </p>
                        </div>
                      </div>

                      <div className="text-center sm:text-left">
                        <div className="flex items-center justify-center sm:justify-start gap-4">
                          <div
                            className="w-3 h-3 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.3)]"
                            style={{ backgroundColor: color }}
                          />
                          <h3 className="text-3xl font-black text-white uppercase tracking-tighter">
                            {label}
                          </h3>
                        </div>
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-6 mt-6">
                          <div className="flex items-center gap-3 px-5 py-2.5 bg-white/5 rounded-2xl text-xs font-black text-slate-300 border border-white/5 tracking-widest uppercase">
                            <Clock className="w-4 h-4 text-indigo-400" />
                            {startTime} — {endTime}
                          </div>
                          {shift.notes && (
                            <div className="flex items-center gap-3 px-5 py-2.5 bg-purple-500/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-purple-400 border border-purple-500/20">
                              <Info className="w-4 h-4" /> SECURE NOTE
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-center lg:justify-end">
                      {isToday ? (
                        shift.hasCheckedOut ? (
                          <div className="px-10 py-5 bg-emerald-500/10 rounded-3xl border border-emerald-500/20 text-emerald-400 font-black text-xs tracking-widest flex items-center gap-4 uppercase shadow-lg shadow-emerald-500/5">
                            <CheckCircle2 className="w-6 h-6 stroke-[3px]" /> CYCLE COMPLETE
                          </div>
                        ) : shift.hasCheckedIn ? (
                          <button
                            disabled={checkingOut === shift._id}
                            onClick={() => handleCheckOut(shift)}
                            className="group relative flex items-center gap-4 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 disabled:from-slate-800 disabled:to-slate-900 text-white px-12 py-6 rounded-[2.5rem] font-black text-sm uppercase tracking-widest transition-all shadow-[0_20px_40px_rgba(225,29,72,0.3)] active:scale-95 group-hover:-translate-y-1 duration-500 overflow-hidden"
                          >
                            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                            {checkingOut === shift._id ? (
                              <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin" />
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
                            className="group relative flex items-center gap-4 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 disabled:from-slate-800 disabled:to-slate-900 text-white px-12 py-6 rounded-[2.5rem] font-black text-sm uppercase tracking-widest transition-all shadow-[0_20px_40px_rgba(79,70,229,0.3)] active:scale-95 group-hover:-translate-y-1 duration-500 overflow-hidden"
                          >
                            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                            {checkingIn === shift._id ? (
                              <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                            ) : (
                              <>
                                <Camera className="w-6 h-6 transition-transform group-hover:rotate-12" />
                                INITIATE PROOF
                              </>
                            )}
                          </button>
                        )
                      ) : (
                        <div className="px-10 py-5 bg-white/5 rounded-3xl border border-white/5 text-slate-500 font-bold text-xs flex items-center gap-4 uppercase tracking-widest backdrop-blur-md">
                          Inactive <span className="text-slate-700">|</span> Standby Sequence
                          <ChevronRight className="w-5 h-5 text-slate-700" />
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

      {/* Verification Notice */}
      <div className="glass-panel p-10 flex flex-col md:flex-row items-center justify-between gap-10 overflow-hidden relative group">
        <div className="absolute -left-10 -bottom-10 w-64 h-64 bg-indigo-500/5 blur-[80px] rounded-full group-hover:bg-indigo-500/10 transition-colors duration-1000" />

        <div className="relative z-10 flex gap-8 items-start">
          <div className="w-20 h-20 bg-indigo-500/10 rounded-[2rem] flex items-center justify-center border border-indigo-500/20 shadow-inner group-hover:scale-110 transition-transform duration-700">
            <MapPin className="w-10 h-10 text-indigo-400 animate-bounce" />
          </div>
          <div>
            <h4 className="text-3xl font-black text-white tracking-widest uppercase">
              Geo-Spatial Auth
            </h4>
            <p className="text-slate-400 font-medium mt-4 leading-relaxed max-w-lg text-sm">
              Automated protocols capture high-fidelity GPS coordinates and encrypted visual proof. 
              Data is transmitted via AES-256 secure channels for operational integrity.
            </p>
          </div>
        </div>

        <div className="relative z-10 group/badge cursor-pointer">
          <div className="absolute inset-0 bg-indigo-500 blur-3xl opacity-0 group-hover/badge:opacity-20 transition-opacity" />
          <div className="bg-white/5 px-10 py-8 rounded-[2.5rem] border border-white/10 backdrop-blur-2xl relative z-10 shadow-2xl">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 mb-4 text-center">
              Security Clearance
            </p>
            <div className="flex items-center gap-4 font-black text-xl text-white tracking-widest">
              <CheckCircle2 className="w-7 h-7 text-indigo-400 animate-pulse" />
              SYSTEM VERIFIED
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const PremiumStatCard = ({ label, value, icon, gradient, sub }) => (
  <div className="group relative glass-card p-1 border-white/5 transition-all duration-700 hover:-translate-y-4">
    <div
      className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 transition-opacity rounded-[2.8rem] blur-2xl`}
    />
    <div className="bg-slate-900/40 backdrop-blur-xl rounded-[2.8rem] p-10 h-full relative z-10 border border-white/5 shadow-2xl">
      <div
        className={`w-16 h-16 bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center text-white shadow-2xl mb-8 transition-all duration-700 group-hover:scale-110 group-hover:rotate-12 group-hover:shadow-[0_0_30px_rgba(79,70,229,0.4)]`}
      >
        {React.cloneElement(icon, { className: "w-8 h-8" })}
      </div>
      <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-4">
        {label}
      </p>
      <h3 className="text-4xl font-black text-white tracking-tighter tabular-nums">
        {value}
      </h3>
      <p className="text-[10px] font-black text-indigo-400 mt-6 opacity-0 group-hover:opacity-100 transition-all duration-700 translate-y-4 group-hover:translate-y-0 uppercase tracking-widest">
        {sub}
      </p>
    </div>
  </div>
);

export default MyScheduleView;
