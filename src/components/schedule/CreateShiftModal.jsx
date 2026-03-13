import React, { useState, useEffect } from "react";
import {
  X,
  Calendar,
  Clock,
  UserPlus,
  Info,
  AlertCircle,
  Save,
} from "lucide-react";
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
    isAdHoc: false,
  });

  useEffect(() => {
    loadOptions();
  }, []);

  const loadOptions = async () => {
    try {
      const [typesRes, membersRes] = await Promise.all([
        shiftTypeService.getAll(accountId),
        memberService.getAll(accountId),
      ]);
      setShiftTypes(typesRes.data);
      setMembers(membersRes.data);
      if (typesRes.data.length > 0) {
        setFormData((prev) => ({ ...prev, shiftTypeId: typesRes.data[0]._id }));
      } else {
        setFormData((prev) => ({ ...prev, isAdHoc: true }));
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
    <div className="fixed inset-0 z-[150] bg-slate-950/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-6 animate-fadeIn">
      <div className="glass-modal w-full max-w-xl rounded-t-[3rem] sm:rounded-[4rem] overflow-hidden animate-zoomIn max-h-[92vh] flex flex-col relative">
        <div className="absolute top-0 right-0 p-32 bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="p-10 pb-6 flex items-center justify-between relative z-10">
          <div>
            <h3 className="text-3xl font-black text-white tracking-widest uppercase">
              Shift Matrix
            </h3>
            <p className="text-[10px] font-black uppercase text-indigo-400 mt-2 tracking-[0.4em] flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
              Scheduling Protocol // Initialization
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-4 hover:bg-white/5 rounded-2xl text-slate-500 hover:text-white transition-all hover:rotate-90"
          >
            <X className="w-7 h-7" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-10 pt-4 space-y-8 relative z-10 overflow-y-auto custom-scrollbar">
          {error && (
            <div className="p-5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 animate-pulse">
              <AlertCircle className="w-5 h-5" /> {error}
            </div>
          )}

          {/* Type Toggle */}
          <div className="flex bg-slate-900/80 p-1.5 rounded-2xl border border-white/5 shadow-inner">
            <button
              type="button"
              onClick={() => setFormData((p) => ({ ...p, isAdHoc: false }))}
              className={`flex-1 py-4 text-[10px] font-black uppercase tracking-[0.3em] rounded-xl transition-all duration-500 ${!formData.isAdHoc ? "bg-white/10 text-white shadow-2xl tracking-[0.4em]" : "text-slate-500 hover:text-slate-300"}`}
            >
              Blueprint
            </button>
            <button
              type="button"
              onClick={() => setFormData((p) => ({ ...p, isAdHoc: true }))}
              className={`flex-1 py-4 text-[10px] font-black uppercase tracking-[0.3em] rounded-xl transition-all duration-500 ${formData.isAdHoc ? "bg-white/10 text-white shadow-2xl tracking-[0.4em]" : "text-slate-500 hover:text-slate-300"}`}
            >
              Ad-Hoc
            </button>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] ml-2 flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" /> Temporal Pivot
              </label>
              <input
                type="date"
                required
                className="w-full bg-slate-900 border border-white/5 rounded-2xl px-6 py-5 text-sm font-black text-white focus:border-indigo-500 outline-none transition-all shadow-inner uppercase tracking-widest"
                value={formData.date}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, date: e.target.value }))
                }
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] ml-2 flex items-center gap-2">
                <UserPlus className="w-3.5 h-3.5 text-purple-400" /> Active Entity
              </label>
              <select
                className="w-full bg-slate-900 border border-white/5 rounded-2xl px-6 py-5 text-sm font-black text-white focus:border-indigo-500 outline-none transition-all shadow-inner uppercase tracking-widest appearance-none cursor-pointer"
                value={formData.assignedMemberId}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    assignedMemberId: e.target.value,
                  }))
                }
              >
                <option value="">AWAITING DISPATCH</option>
                {members.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.displayName.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {!formData.isAdHoc ? (
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] ml-2">
                Logic Template selection
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {shiftTypes.map((type) => (
                  <button
                    key={type._id}
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        shiftTypeId: type._id,
                      }))
                    }
                    className={`p-6 rounded-3xl border transition-all duration-500 text-left group/btn relative overflow-hidden ${
                      formData.shiftTypeId === type._id
                        ? "border-indigo-500 bg-indigo-500/10 shadow-[0_10px_30px_rgba(79,70,229,0.2)]"
                        : "border-white/5 bg-slate-900/50 hover:bg-slate-900 hover:border-white/10"
                    }`}
                  >
                    <div className="flex items-center gap-4 mb-3 relative z-10">
                      <div
                        className="w-3.5 h-3.5 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.2)]"
                        style={{ backgroundColor: type.color }}
                      />
                      <span className="text-sm font-black text-white tracking-widest uppercase">
                        {type.name}
                      </span>
                    </div>
                    <div className="text-[10px] font-black text-slate-500 flex items-center gap-2 relative z-10 tracking-[0.2em]">
                      <Clock className="w-3.5 h-3.5 text-slate-600" />
                      {type.startTime} // {type.endTime}
                    </div>
                  </button>
                ))}
                {shiftTypes.length === 0 && (
                  <div className="col-span-2 text-[10px] text-slate-600 font-black p-10 bg-slate-900/50 rounded-3xl text-center border border-white/5 border-dashed uppercase tracking-widest">
                    No active logic templates detected.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-8 animate-fadeIn">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] ml-2">
                  Ad-Hoc Designation
                </label>
                <input
                  type="text"
                  className="w-full bg-slate-900 border border-white/5 rounded-2xl px-6 py-5 text-sm font-black text-white uppercase tracking-widest focus:border-indigo-500 outline-none transition-all"
                  value={formData.adHocLabel}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      adHocLabel: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] ml-2">
                    Start Window
                  </label>
                  <input
                    type="time"
                    className="w-full bg-slate-900 border border-white/5 rounded-2xl px-6 py-5 text-sm font-black text-white focus:border-indigo-500 outline-none transition-all"
                    value={formData.adHocStart}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        adHocStart: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] ml-2">
                    End Window
                  </label>
                  <input
                    type="time"
                    className="w-full bg-slate-900 border border-white/5 rounded-2xl px-6 py-5 text-sm font-black text-white focus:border-indigo-500 outline-none transition-all"
                    value={formData.adHocEnd}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        adHocEnd: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] ml-2">
              Mission Directives (Optional)
            </label>
            <textarea
              className="w-full bg-slate-900 border border-white/5 rounded-[2rem] px-6 py-5 text-sm font-black text-white focus:border-indigo-500 outline-none transition-all shadow-inner resize-none min-h-[100px]"
              placeholder="Inject tactical shift notes here..."
              value={formData.notes}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, notes: e.target.value }))
              }
            />
          </div>

          <div className="pt-8 flex gap-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-5 bg-white/5 text-slate-400 font-black rounded-2xl hover:bg-white/10 transition-all uppercase tracking-widest text-[10px] active:scale-95"
            >
              Abort
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-[2] py-5 bg-indigo-600 text-white font-black rounded-2xl shadow-[0_20px_40px_rgba(79,70,229,0.3)] hover:bg-indigo-500 transition-all active:scale-95 flex items-center justify-center gap-4 uppercase tracking-[0.2em] text-[11px]"
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-5 h-5" /> Execute Deployment
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateShiftModal;
