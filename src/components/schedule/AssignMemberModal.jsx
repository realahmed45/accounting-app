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
    <div className="fixed inset-0 z-[130] bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-200">
        <div className="p-8 pb-4 flex items-center justify-between">
           <h3 className="text-xl font-black text-gray-900">Assign Staff</h3>
           <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400">
             <X className="w-5 h-5" />
           </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
           {error && (
             <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs font-bold flex items-center gap-2">
               <AlertCircle className="w-4 h-4" /> {error}
             </div>
           )}

           <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 mb-2">
             <p className="text-[10px] font-black uppercase text-indigo-400 tracking-widest mb-1">Shift Details</p>
             <p className="text-sm font-black text-indigo-900">
               {shift.shiftTypeId?.name || shift.adHocLabel}
             </p>
             <p className="text-xs font-bold text-indigo-600/70 mt-1 uppercase tracking-tighter">
               {new Date(shift.date).toLocaleDateString()} @ {shift.shiftTypeId?.startTime || shift.adHocStart}
             </p>
           </div>

           <div className="space-y-1">
             <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Select Available Staff</label>
             <select 
               required
               className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-4 py-4 text-sm font-bold focus:bg-white focus:border-indigo-500 transition-all"
               value={selectedMemberId}
               onChange={e => setSelectedMemberId(e.target.value)}
             >
               <option value="">-- Choose Member --</option>
               {members.map(m => (
                 <option key={m._id} value={m._id}>{m.displayName}</option>
               ))}
             </select>
           </div>

           <div className="pt-4 flex gap-3">
              <button type="button" onClick={onClose} className="flex-1 py-4 bg-gray-100 text-gray-500 font-bold rounded-2xl text-sm">Cancel</button>
              <button 
                type="submit" 
                disabled={submitting || !selectedMemberId}
                className="flex-[2] py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all disabled:bg-gray-200"
              >
                {submitting ? "Assigning..." : "Assign Member"}
              </button>
           </div>
        </form>
      </div>
    </div>
  );
};

export default AssignMemberModal;
