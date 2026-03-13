import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  ChevronDown, 
  ChevronUp,
  Camera,
  MapPin,
  Calendar,
  Layers,
  Sparkles,
  Zap
} from "lucide-react";
import { overtimeService } from "../../services/scheduleApi";

const ExtraHoursPanel = ({ accountId, currentMember }) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    startTime: "09:00",
    endTime: "10:00",
    reason: "",
  });

  const isManager = currentMember?.role === "owner" || currentMember?.permissions?.manageSchedule;

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async () => {
    setLoading(true);
    try {
      const res = await overtimeService.getAll(accountId);
      setRecords(res.data);
    } catch (err) {
      setError("Failed to load records");
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      // 1. Get GPS Position
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { 
          enableHighAccuracy: true,
          timeout: 10000 
        });
      });

      // 2. Capture Real Photo
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
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
        throw new Error("Proof image is too large (max 5MB).");
      }

      stream.getTracks().forEach(track => track.stop());

      // 3. Submit
      await overtimeService.submit(accountId, {
        ...formData,
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        imageData
      });
      
      setShowSubmitModal(false);
      loadRecords();
    } catch (err) {
      if (err.name === "NotAllowedError") {
        setError("Camera/Location permission denied.");
      } else if (err.name === "NotFoundError") {
        setError("No camera device found.");
      } else {
        setError(err.response?.data?.message || err.message || "Sequence Transmission Failure");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleReview = async (ehId, status) => {
    try {
      await overtimeService.review(accountId, ehId, { status });
      loadRecords();
    } catch (err) {
      setError("Review synchronization failed");
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-40 animate-fadeIn">
      <div className="w-20 h-20 relative">
         <div className="absolute inset-0 bg-indigo-500 rounded-full blur-3xl opacity-20 animate-pulse" />
         <div className="w-20 h-20 border-[6px] border-white/5 border-t-indigo-500 rounded-full animate-spin relative z-10 shadow-[0_0_20px_rgba(79,70,229,0.2)]" />
      </div>
      <p className="text-slate-400 font-black uppercase tracking-[0.4em] text-[10px] mt-10 opacity-70">Polling Submission Feed...</p>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in duration-1000">
      {/* Header Module */}
      <div className="glass-panel p-10 rounded-[3rem] group relative overflow-hidden animate-fadeIn">
        <div className="absolute top-0 right-0 p-32 bg-indigo-500/5 blur-[100px] -mr-20 -mt-20 rounded-full group-hover:bg-indigo-500/10 transition-all duration-700" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-10 relative z-10">
          <div>
             <div className="flex items-center gap-4 mb-3">
                <div className="p-3 bg-indigo-500/20 rounded-xl border border-indigo-500/20">
                  <Zap className="w-6 h-6 text-indigo-400" />
                </div>
                <h2 className="text-4xl font-black text-white tracking-widest uppercase">Extra Hours</h2>
             </div>
             <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[10px]">Overtime Audit & Protocol Validation</p>
          </div>
          <button 
            onClick={() => setShowSubmitModal(true)}
            className="group relative flex items-center justify-center gap-4 bg-indigo-600 hover:bg-indigo-500 text-white px-12 py-5 rounded-[2rem] font-black tracking-widest text-[11px] uppercase shadow-[0_20px_40px_rgba(79,70,229,0.3)] transition-all hover:-translate-y-1 active:scale-95 overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <Plus className="w-5 h-5" />
            LOG OPERATIONAL OVERTIME
          </button>
        </div>
      </div>

      {/* Submission Matrix */}
      <div className="grid gap-8">
        {records.length === 0 ? (
          <div className="glass-panel py-32 rounded-[3.5rem] text-center border-dashed border-white/10 opacity-60">
            <Clock className="w-24 h-24 text-slate-700 mx-auto mb-8 animate-pulse" />
            <p className="text-slate-500 font-black uppercase tracking-[0.4em] text-[11px]">All Temporal Extension Requests Processed</p>
          </div>
        ) : (
          records.map((record) => (
            <div key={record._id} className="glass-panel hover:bg-white/[0.04] p-10 group transition-all duration-700 hover:scale-[1.01]">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10">
                <div className="flex items-center gap-10">
                  <div className={`w-24 h-24 rounded-[2rem] flex flex-col items-center justify-center font-black relative overflow-hidden shadow-2xl border-2 transition-transform duration-500 group-hover:scale-110 ${
                    record.status === 'approved' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 
                    record.status === 'rejected' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                  }`}>
                    <span className="text-3xl leading-none">{Math.round(record.durationMinutes / 60 * 10) / 10}</span>
                    <span className="text-[9px] mt-2 opacity-60 uppercase tracking-widest font-black">Hrs</span>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                       <p className="text-2xl font-black text-white tracking-tight group-hover:text-indigo-400 transition-colors uppercase">{record.memberId?.displayName || "Member"}</p>
                       <div className="w-1.5 h-1.5 bg-slate-700 rounded-full" />
                       <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{new Date(record.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-4">
                       <span className="flex items-center gap-3 bg-white/5 px-5 py-2.5 rounded-2xl border border-white/5 text-[10px] font-black text-slate-400 uppercase tracking-widest"><Clock className="w-4 h-4 text-indigo-400" /> {record.startTime} — {record.endTime}</span>
                       {record.reason && <span className="flex items-center gap-3 text-[10px] font-black text-amber-500/80 uppercase tracking-widest"><Layers className="w-4 h-4" /> {record.reason}</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-10 pt-10 lg:pt-0 border-t lg:border-t-0 border-white/5">
                  <div className="flex items-center gap-4 opacity-40 group-hover:opacity-100 transition-opacity">
                    <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-white/5 flex items-center justify-center text-slate-500 hover:text-indigo-400 hover:border-indigo-500/30 transition-all cursor-help" title="Visual Proof Captured">
                      <Camera className="w-6 h-6" />
                    </div>
                    <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-white/5 flex items-center justify-center text-slate-500 hover:text-indigo-400 hover:border-indigo-500/30 transition-all cursor-help" title="Neural GPS Verified">
                      <MapPin className="w-6 h-6" />
                    </div>
                  </div>

                  {record.status === 'pending' && isManager ? (
                    <div className="flex gap-4">
                      <button 
                        onClick={() => handleReview(record._id, 'approved')}
                        className="w-16 h-16 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl shadow-[0_20px_40px_rgba(16,185,129,0.3)] transition-all hover:scale-110 active:scale-95 flex items-center justify-center group/btn"
                      >
                        <CheckCircle2 className="w-8 h-8 group-hover/btn:scale-110 transition-transform" />
                      </button>
                      <button 
                        onClick={() => handleReview(record._id, 'rejected')}
                        className="w-16 h-16 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl shadow-[0_20px_40px_rgba(244,63,94,0.3)] transition-all hover:scale-110 active:scale-95 flex items-center justify-center group/btn"
                      >
                        <XCircle className="w-8 h-8 group-hover/btn:scale-110 transition-transform" />
                      </button>
                    </div>
                  ) : (
                    <div className={`px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] border transition-all duration-500 ${
                      record.status === 'approved' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-[0_10px_30px_rgba(16,185,129,0.1)]' : 
                      record.status === 'rejected' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400 shadow-[0_10px_30px_rgba(244,63,94,0.1)]' : 'bg-amber-500/10 border-amber-500/20 text-amber-400 shadow-[0_10px_30px_rgba(245,158,11,0.1)]'
                    }`}>
                      {record.status}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        ))}
      </div>

      {/* Submission Interface */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-[150] bg-[#0a0a0f]/90 backdrop-blur-3xl flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-[#1a1a2e] w-full max-w-lg rounded-[3.5rem] shadow-[0_64px_128px_-16px_rgba(0,0,0,0.8)] overflow-hidden border border-white/10 animate-in zoom-in-95 duration-500">
            <div className="p-10 pb-0">
               <h3 className="text-3xl font-black text-white tracking-tighter">Overtime Registration</h3>
               <p className="text-indigo-400 text-xs font-black uppercase mt-2 tracking-[0.3em]">End-to-End Encryption Active</p>
            </div>
            
            <form onSubmit={handleSubmit} className="p-10 space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-gray-500 tracking-[0.2em] flex items-center gap-3">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full" /> Operational Date
                </label>
                <input 
                  type="date"
                  required
                  value={formData.date}
                  onChange={e => setFormData(prev => ({...prev, date: e.target.value}))}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-sm font-black text-white focus:border-indigo-500 focus:bg-white/10 outline-none transition-all shadow-inner"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-gray-500 tracking-[0.2em]">Matrix Entry</label>
                  <input type="time" required value={formData.startTime} onChange={e => setFormData(prev => ({...prev, startTime: e.target.value}))} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-sm font-black text-white appearance-none" />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-gray-500 tracking-[0.2em]">Matrix Exit</label>
                  <input type="time" required value={formData.endTime} onChange={e => setFormData(prev => ({...prev, endTime: e.target.value}))} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-sm font-black text-white appearance-none" />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-gray-500 tracking-[0.2em]">Context / Reason</label>
                <textarea 
                  rows="3"
                  value={formData.reason}
                  onChange={e => setFormData(prev => ({...prev, reason: e.target.value}))}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-sm font-black text-white focus:border-indigo-500 transition-all resize-none shadow-inner"
                  placeholder="Justify operational extension..."
                ></textarea>
              </div>

              <div className="pt-6 flex gap-6">
                <button 
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="flex-1 bg-white/5 text-gray-400 font-black py-5 rounded-2xl hover:bg-white/10 transition-all text-sm tracking-widest uppercase border border-white/5"
                >
                  ABORT
                </button>
                <button 
                  type="submit"
                  disabled={submitting}
                  className="flex-[2] bg-indigo-600 text-white font-black py-5 px-10 rounded-2xl shadow-3xl shadow-indigo-900/50 hover:bg-indigo-500 transition-all active:scale-95 flex items-center justify-center gap-4 text-sm tracking-widest overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
                  {submitting ? <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" /> : "EXECUTE SUBMISSION"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExtraHoursPanel;
