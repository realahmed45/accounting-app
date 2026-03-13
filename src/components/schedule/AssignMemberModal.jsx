import React, { useState, useEffect } from "react";
import { X, UserPlus, Save, AlertCircle } from "lucide-react";
import { shiftService } from "../../services/scheduleApi";
import { memberService } from "../../services/api";

const AssignMemberModal = ({ accountId, shift, onClose, onSuccess }) => {
  const [members, setMembers] = useState([]);
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    try {
      const res = await memberService.getAll(accountId);
      setMembers(res.data);
    } catch (err) {
      setError("Failed to load members");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedMemberId) return;
    setSubmitting(true);
    setError("");
    try {
      await shiftService.assign(accountId, shift._id, selectedMemberId);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || "Assignment failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return null;

  return (
    <div className="fixed inset-0 z-[150] bg-slate-950/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-6 animate-fadeIn">
      <div className="glass-modal w-full max-w-sm rounded-t-[3rem] sm:rounded-[3.5rem] overflow-hidden animate-zoomIn max-h-[92vh] flex flex-col relative">
        <div className="absolute top-0 right-0 p-24 bg-indigo-500/5 blur-[80px] rounded-full pointer-events-none" />
        
        <div className="p-8 pb-4 flex items-center justify-between relative z-10">
          <h3 className="text-xl font-black text-white tracking-widest uppercase">Entity Dispatch</h3>
          <button
            onClick={onClose}
            className="p-3 hover:bg-white/5 rounded-xl text-slate-500 hover:text-white transition-all hover:rotate-90"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8 relative z-10">
          {error && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 animate-pulse">
              <AlertCircle className="w-4 h-4" /> {error}
            </div>
          )}

          <div className="p-6 bg-slate-900/80 rounded-[2rem] border border-white/5 shadow-inner relative overflow-hidden group">
            <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <p className="text-[10px] font-black uppercase text-indigo-400 tracking-[0.3em] mb-3">
              Deployment Specs
            </p>
            <p className="text-base font-black text-white tracking-widest uppercase truncate">
              {shift.shiftTypeId?.name || shift.adHocLabel}
            </p>
            <p className="text-[10px] font-black text-slate-500 mt-2 uppercase tracking-[0.2em] flex items-center gap-2">
              <Calendar className="w-3 h-3 text-slate-600" />
              {new Date(shift.date).toLocaleDateString()} // {shift.shiftTypeId?.startTime || shift.adHocStart}
            </p>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] ml-2">
              Select available node
            </label>
            <select
              required
              className="w-full bg-slate-900 border border-white/5 rounded-2xl px-6 py-5 text-sm font-black text-white focus:border-indigo-500 outline-none transition-all shadow-inner uppercase tracking-widest appearance-none cursor-pointer"
              value={selectedMemberId}
              onChange={(e) => setSelectedMemberId(e.target.value)}
            >
              <option value="">NODE SELECTION</option>
              {members.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.displayName.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-6 flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4.5 bg-white/5 text-slate-400 font-black rounded-2xl hover:bg-white/10 transition-all uppercase tracking-widest text-[10px] active:scale-95"
            >
              Abort
            </button>
            <button
              type="submit"
              disabled={submitting || !selectedMemberId}
              className="flex-[1.5] py-4.5 bg-indigo-600 text-white font-black rounded-2xl shadow-[0_20px_40px_rgba(79,70,229,0.3)] hover:bg-indigo-500 transition-all active:scale-95 disabled:bg-slate-800 disabled:text-slate-600 uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-3"
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <UserPlus className="w-4 h-4" /> Finalize Dispatch
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignMemberModal;
