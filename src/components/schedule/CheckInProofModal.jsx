import React, { useState, useEffect } from "react";
import {
  X,
  MapPin,
  Camera,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { shiftService } from "../../services/scheduleApi";

const CheckInProofModal = ({ accountId, shift, onClose }) => {
  const [checkIn, setCheckIn] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadProof();
  }, []);

  const loadProof = async () => {
    try {
      const res = await shiftService.getCheckIn(accountId, shift._id);
      setCheckIn(res.data);
    } catch (err) {
      setError("No check-in record found for this shift.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[160] bg-slate-950/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-6 animate-fadeIn">
      <div className="glass-modal w-full max-w-md rounded-t-[3rem] sm:rounded-[4rem] overflow-hidden animate-zoomIn max-h-[92vh] flex flex-col relative">
        <div className="absolute top-0 right-0 p-24 bg-indigo-500/5 blur-[80px] rounded-full pointer-events-none" />
        
        <div className="p-10 pb-6 flex items-center justify-between relative z-10">
          <h3 className="text-2xl font-black text-white tracking-widest uppercase">
            Neural Verification
          </h3>
          <button
            onClick={onClose}
            className="p-3 hover:bg-white/5 rounded-xl text-slate-500 hover:text-white transition-all hover:rotate-90"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-10 pt-4 relative z-10 overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="py-20 flex flex-col items-center gap-6">
              <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-slate-500 font-black text-[10px] uppercase tracking-[0.4em]">
                Retrieving Neural Evidence...
              </p>
            </div>
          ) : error ? (
            <div className="py-20 text-center animate-fadeIn">
              <AlertCircle className="w-16 h-16 text-slate-800 mx-auto mb-6 animate-pulse" />
              <p className="text-slate-500 font-black uppercase tracking-widest text-xs">{error}</p>
            </div>
          ) : (
            <div className="space-y-8 animate-fadeIn">
              {/* Photo Proof */}
              <div className="relative group p-1.5 bg-slate-900 rounded-[2.5rem] border border-white/5 shadow-inner">
                <div className="absolute inset-x-6 bottom-6 p-5 bg-slate-950/40 backdrop-blur-md rounded-2xl z-10 border border-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <p className="text-[10px] font-black text-white uppercase tracking-[0.3em] flex items-center gap-3">
                    <Camera className="w-4 h-4 text-emerald-400" /> Operational Biometry // Captured 
                  </p>
                </div>
                <img
                  src={checkIn.imageData}
                  alt="Verification evidence"
                  className="w-full aspect-[4/3] object-cover rounded-[2rem] border border-white/10 grayscale group-hover:grayscale-0 transition-all duration-700 brightness-75 group-hover:brightness-100"
                />
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 gap-6">
                <div className="p-6 bg-slate-900/50 rounded-2xl border border-white/5 shadow-inner group">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-3 flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 group-hover:text-indigo-400 transition-colors" /> Temporal Sync
                  </p>
                  <p className="text-xl font-black text-white tracking-widest uppercase tabular-nums">
                    {new Date(checkIn.checkInTime).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false
                    })}
                  </p>
                </div>
                <div className="p-6 bg-slate-900/50 rounded-2xl border border-white/5 shadow-inner group">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-3 flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 group-hover:scale-110 transition-transform" /> Neural Persona
                  </p>
                  <p className="text-xl font-black text-white truncate tracking-widest uppercase">
                    {checkIn.memberId?.displayName || "N/A"}
                  </p>
                </div>
              </div>

              {/* Location Info */}
              <div className="p-8 bg-indigo-500/5 rounded-[2.5rem] border border-indigo-500/10 flex items-center gap-6 group hover:bg-indigo-500/10 transition-all duration-500">
                <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-[0_15px_30px_rgba(79,70,229,0.3)] group-hover:scale-110 transition-transform">
                  <MapPin className="w-7 h-7" />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">
                    Geospatial Coordinates
                  </p>
                  <p className="text-sm font-black text-white mt-1.5 tracking-widest uppercase tabular-nums">
                    {checkIn.latitude.toFixed(6)} N // {checkIn.longitude.toFixed(6)} E
                  </p>
                  <a
                    href={`https://www.google.com/maps?q=${checkIn.latitude},${checkIn.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] font-black text-indigo-500 hover:text-white transition-colors uppercase tracking-widest mt-2 inline-block decoration-indigo-500/30 underline underline-offset-4"
                  >
                    Open Positioning Matrix →
                  </a>
                </div>
              </div>

              <p className="text-[9px] text-center text-slate-700 font-black uppercase tracking-[0.5em] pt-4 animate-pulse">
                Quantum-Encrypted Verification Proof
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckInProofModal;
