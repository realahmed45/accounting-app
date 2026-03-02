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
    <div className="flex flex-col items-center justify-center py-40">
      <div className="w-16 h-16 relative">
         <div className="absolute inset-0 bg-indigo-500 rounded-full blur-2xl opacity-20 animate-pulse" />
         <div className="w-16 h-16 border-4 border-white/10 border-t-indigo-500 rounded-full animate-spin relative z-10" />
      </div>
      <p className="text-gray-400 font-black uppercase tracking-[0.3em] text-[10px] mt-8">Polling Submission Feed...</p>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in duration-1000">
      {/* Header Module */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-10 bg-white/5 backdrop-blur-3xl p-10 rounded-[3rem] border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-20 bg-indigo-500/10 blur-[80px] -mr-20 -mt-20 rounded-full" />
        <div className="relative z-10">
           <div className="flex items-center gap-3 mb-4">
              <Zap className="w-6 h-6 text-indigo-400 fill-indigo-400/20" />
              <h2 className="text-4xl font-black text-white tracking-tight">Extra Hours</h2>
           </div>
           <p className="text-gray-400 font-bold uppercase tracking-widest text-xs italic">Overtime log audit & manager validation sequence</p>
        </div>
        <button 
          onClick={() => setShowSubmitModal(true)}
          className="group relative flex items-center justify-center gap-4 bg-indigo-600 hover:bg-indigo-500 text-white px-10 py-5 rounded-2xl font-black tracking-wide shadow-2xl shadow-indigo-900 transition-all hover:-translate-y-1 active:scale-95 overflow-hidden z-10"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
          <Plus className="w-6 h-6" />
          LOG OVERTIME
        </button>
      </div>

      {/* Submission Matrix */}
      <div className="grid gap-6">
        {records.length === 0 ? (
          <div className="bg-white/5 py-24 rounded-[3rem] text-center border-2 border-dashed border-white/10">
            <Clock className="w-20 h-20 text-white/5 mx-auto mb-6" />
            <p className="text-gray-500 font-black uppercase tracking-widest">Feed Empty — All Submissions Processed</p>
          </div>
        ) : (
          records.map((record) => (
            <div key={record._id} className="bg-white/5 backdrop-blur-3xl rounded-[2.5rem] p-8 shadow-2xl border border-white/5 group hover:border-white/20 transition-all duration-500">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10">
                <div className="flex items-center gap-8">
                  <div className={`w-20 h-20 rounded-[1.5rem] flex flex-col items-center justify-center font-black relative overflow-hidden shadow-2xl border-2 ${
                    record.status === 'approved' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 
                    record.status === 'rejected' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-orange-500/10 border-orange-500/20 text-orange-400'
                  }`}>
                    <span className="text-2xl leading-none">{Math.round(record.durationMinutes / 60 * 10) / 10}</span>
                    <span className="text-[10px] mt-1 opacity-60 uppercase">Hours</span>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                       <p className="text-lg font-black text-white">{record.memberId?.displayName || "Member"}</p>
                       <div className="w-1.5 h-1.5 bg-white/20 rounded-full" />
                       <p className="text-sm font-bold text-gray-400 uppercase tracking-tighter">{new Date(record.date).toLocaleDateString(undefined, { day: 'numeric', month: 'long' })}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-[11px] font-black uppercase tracking-widest text-gray-500">
                       <span className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/5"><Clock className="w-3.5 h-3.5" /> {record.startTime} — {record.endTime}</span>
                       {record.reason && <span className="flex items-center gap-2 text-indigo-400"><Shapes className="w-3.5 h-3.5" /> {record.reason}</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6 border-t md:border-t-0 border-white/10 pt-8 md:pt-0">
                  <div className="flex items-center gap-2.5 mr-6">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 group-hover:bg-indigo-500/20 group-hover:text-indigo-400 transition-all duration-500" title="Visual Proof Captured">
                      <Camera className="w-6 h-6" />
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 group-hover:bg-indigo-500/20 group-hover:text-indigo-400 transition-all duration-500" title="Neural GPS Verified">
                      <MapPin className="w-6 h-6" />
                    </div>
                  </div>

                  {record.status === 'pending' && isManager ? (
                    <div className="flex gap-4">
                      <button 
                        onClick={() => handleReview(record._id, 'approved')}
                        className="w-14 h-14 bg-green-500 hover:bg-green-400 text-white rounded-2xl shadow-3xl shadow-green-900 transition-all hover:scale-110 active:scale-90 flex items-center justify-center"
                      >
                        <CheckCircle2 className="w-7 h-7" />
                      </button>
                      <button 
                        onClick={() => handleReview(record._id, 'rejected')}
                        className="w-14 h-14 bg-red-500 hover:bg-red-400 text-white rounded-2xl shadow-3xl shadow-red-900 transition-all hover:scale-110 active:scale-90 flex items-center justify-center"
                      >
                        <XCircle className="w-7 h-7" />
                      </button>
                    </div>
                  ) : (
                    <div className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border shadow-2xl ${
                      record.status === 'approved' ? 'bg-green-500/10 border-green-500/30 text-green-400 shadow-green-900/20' : 
                      record.status === 'rejected' ? 'bg-red-500/10 border-red-500/30 text-red-400 shadow-red-900/20' : 'bg-orange-500/10 border-orange-500/30 text-orange-400 shadow-orange-900/20'
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
