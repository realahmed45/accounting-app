import React, { useState, useEffect } from "react";
import { X, Calendar, Clock, UserPlus, Info, AlertCircle, Save } from "lucide-react";
import { shiftService, shiftTypeService } from "../../services/scheduleApi";
import { memberService } from "../../services/api";

const CreateShiftModal = ({ accountId, date, onClose, onSuccess }) => {
  const [shiftTypes, setShiftTypes] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    shiftTypeId: "",
    assignedMemberId: "",
    date: date || new Date().toISOString().split("T")[0],
    notes: "",
    adHocStart: "09:00",
    adHocEnd: "17:00",
    adHocLabel: "Custom Shift",
    isAdHoc: false
  });

  useEffect(() => {
    loadOptions();
  }, []);

  const loadOptions = async () => {
    try {
      const [typesRes, membersRes] = await Promise.all([
        shiftTypeService.getAll(accountId),
        memberService.getAll(accountId)
      ]);
      setShiftTypes(typesRes.data);
      setMembers(membersRes.data);
      if (typesRes.data.length > 0) {
        setFormData(prev => ({ ...prev, shiftTypeId: typesRes.data[0]._id }));
      } else {
        setFormData(prev => ({ ...prev, isAdHoc: true }));
      }
    } catch (err) {
      setError("Failed to load options");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const payload = {
        date: formData.date,
        assignedMemberId: formData.assignedMemberId || null,
        notes: formData.notes,
      };

      if (formData.isAdHoc) {
        payload.adHocStart = formData.adHocStart;
        payload.adHocEnd = formData.adHocEnd;
        payload.adHocLabel = formData.adHocLabel;
      } else {
        payload.shiftTypeId = formData.shiftTypeId;
      }

      await shiftService.create(accountId, payload);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create shift");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return null;

  return (
    <div className="fixed inset-0 z-[120] bg-gray-900/40 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-200">
        <div className="p-8 pb-4 flex items-center justify-between">
           <div>
              <h3 className="text-2xl font-black text-gray-900">New Shift Entry</h3>
              <p className="text-[10px] font-black uppercase text-indigo-600 mt-1 tracking-widest bg-indigo-50 px-2 py-0.5 rounded-full inline-block">
                Schedule Planning
              </p>
           </div>
           <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400">
             <X className="w-6 h-6" />
           </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> {error}
            </div>
          )}

          {/* Type Toggle */}
          <div className="flex bg-gray-100 p-1 rounded-2xl">
             <button 
               type="button"
               onClick={() => setFormData(p => ({...p, isAdHoc: false}))}
               className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${!formData.isAdHoc ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400'}`}
             >
               From Template
             </button>
             <button 
               type="button"
               onClick={() => setFormData(p => ({...p, isAdHoc: true}))}
               className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${formData.isAdHoc ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400'}`}
             >
               Ad-Hoc / Custom
             </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
               <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider flex items-center gap-1.5"><Calendar className="w-3 h-3" /> Date</label>
               <input 
                 type="date" required 
                 className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-5 py-4 text-sm font-bold focus:bg-white focus:border-indigo-500 transition-all"
                 value={formData.date}
                 onChange={e => setFormData(prev => ({...prev, date: e.target.value}))}
               />
            </div>
            <div className="space-y-1">
               <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider flex items-center gap-1.5"><UserPlus className="w-3 h-3" /> Assignment</label>
               <select 
                 className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-5 py-4 text-sm font-bold focus:bg-white focus:border-indigo-500 transition-all"
                 value={formData.assignedMemberId}
                 onChange={e => setFormData(prev => ({...prev, assignedMemberId: e.target.value}))}
               >
                 <option value="">-- No Member --</option>
                 {members.map(m => (
                   <option key={m._id} value={m._id}>{m.displayName}</option>
                 ))}
               </select>
            </div>
          </div>

          {!formData.isAdHoc ? (
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Select Template</label>
              <div className="grid grid-cols-2 gap-2">
                {shiftTypes.map(type => (
                  <button
                    key={type._id}
                    type="button"
                    onClick={() => setFormData(prev => ({...prev, shiftTypeId: type._id}))}
                    className={`p-3 rounded-2xl border-2 text-left transition-all ${
                      formData.shiftTypeId === type._id ? 'border-indigo-500 bg-indigo-50/50' : 'border-gray-50 hover:border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: type.color }} />
                      <span className="text-sm font-bold text-gray-900">{type.name}</span>
                    </div>
                    <div className="text-[10px] font-black text-gray-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {type.startTime} - {type.endTime}
                    </div>
                  </button>
                ))}
                {shiftTypes.length === 0 && (
                  <p className="col-span-2 text-[10px] text-gray-400 font-bold p-4 bg-gray-50 rounded-2xl text-center italic">No templates found. Use Ad-Hoc mode.</p>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4 animate-in slide-in-from-left-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Custom Label</label>
                <input 
                  type="text" className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-5 py-4 text-sm font-bold"
                  value={formData.adHocLabel}
                  onChange={e => setFormData(prev => ({...prev, adHocLabel: e.target.value}))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Start</label>
                  <input type="time" className="w-full bg-gray-50 rounded-2xl px-5 py-4 text-sm font-bold" value={formData.adHocStart} onChange={e => setFormData(prev => ({...prev, adHocStart: e.target.value}))} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider">End</label>
                  <input type="time" className="w-full bg-gray-50 rounded-2xl px-5 py-4 text-sm font-bold" value={formData.adHocEnd} onChange={e => setFormData(prev => ({...prev, adHocEnd: e.target.value}))} />
                </div>
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Staff Notes (Optional)</label>
            <textarea 
              className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-5 py-4 text-sm font-bold focus:bg-white focus:border-indigo-500 transition-all resize-none"
              rows="2"
              value={formData.notes}
              onChange={e => setFormData(prev => ({...prev, notes: e.target.value}))}
            />
          </div>

          <div className="pt-4 flex gap-3">
             <button type="button" onClick={onClose} className="flex-1 py-4 bg-gray-100 text-gray-500 font-bold rounded-[1.5rem] hover:bg-gray-200 transition-all">Cancel</button>
             <button 
               type="submit" 
               disabled={submitting}
               className="flex-[2] py-4 bg-indigo-600 text-white font-black rounded-[1.5rem] shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 flex items-center justify-center gap-2"
             >
               {submitting ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Save className="w-5 h-5" /> Schedule Shift</>}
             </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateShiftModal;
