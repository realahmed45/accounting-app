import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Trash2, 
  Edit, 
  Clock, 
  Palette, 
  Save, 
  X, 
  AlertCircle,
  Shapes,
  Sparkles,
  Zap,
  Target
} from "lucide-react";
import { shiftTypeService } from "../../services/scheduleApi";

const COLORS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#f43f5e", 
  "#f97316", "#eab308", "#22c55e", "#06b6d4"
];

const ShiftTypeManager = ({ accountId }) => {
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    startTime: "09:00",
    endTime: "17:00",
    color: COLORS[0],
    isStandard: true
  });

  useEffect(() => {
    loadTypes();
  }, []);

  const loadTypes = async () => {
    try {
      const res = await shiftTypeService.getAll(accountId);
      setTypes(res.data);
    } catch (err) {
      console.error("Load failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await shiftTypeService.create(accountId, formData);
      setShowAdd(false);
      loadTypes();
      setFormData({ name: "", startTime: "09:00", endTime: "17:00", color: COLORS[0], isStandard: true });
    } catch (err) {
      alert("Creation protocol failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Confirm deletion of this deployment template?")) return;
    try {
      await shiftTypeService.delete(accountId, id);
      loadTypes();
    } catch (err) {
      alert("Deletion protocol failed");
    }
  };

  if (loading) return null;

  return (
    <div className="glass-panel rounded-[3rem] h-full flex flex-col animate-fadeIn border-white/5 overflow-hidden">
      <div className="p-10 border-b border-white/5 flex items-center justify-between group">
         <div>
            <h3 className="text-2xl font-black text-white tracking-widest uppercase flex items-center gap-4">
              <div className="p-2.5 bg-indigo-500/20 rounded-xl border border-indigo-500/20">
                <Shapes className="w-6 h-6 text-indigo-400" />
              </div>
              Deployment Logic
            </h3>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mt-3">Temporal Blueprint Archiving</p>
         </div>
         <button 
           onClick={() => setShowAdd(!showAdd)}
           className={`p-5 rounded-2xl transition-all duration-500 shadow-2xl ${showAdd ? 'bg-rose-600 text-white rotate-45 scale-90' : 'bg-indigo-600 text-white hover:scale-110 shadow-indigo-900/50'}`}
         >
           <Plus className="w-6 h-6" />
         </button>
      </div>

      <div className="flex-1 p-10 overflow-y-auto custom-scrollbar">
        {showAdd && (
          <form onSubmit={handleSubmit} className="mb-12 p-10 bg-white/5 rounded-[2.5rem] border border-indigo-500/20 space-y-8 animate-fadeIn shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-16 bg-indigo-500/5 blur-[60px] rounded-full" />
            
            <div className="space-y-4 relative z-10">
              <label className="text-[10px] font-black uppercase text-indigo-400 tracking-[0.3em] ml-2">Blueprint Designation</label>
              <input 
                required
                className="w-full bg-slate-900 border border-white/5 rounded-2xl px-6 py-5 text-sm font-black text-white focus:border-indigo-500 outline-none transition-all shadow-inner uppercase tracking-widest"
                placeholder="e.g. ALPHA_VANGUARD"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-8 relative z-10">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] ml-2">Sync Intake</label>
                <input type="time" className="w-full bg-slate-900 border border-white/5 rounded-2xl px-6 py-5 text-sm font-black text-white appearance-none transition-all focus:border-indigo-500" value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} />
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] ml-2">Sync release</label>
                <input type="time" className="w-full bg-slate-900 border border-white/5 rounded-2xl px-6 py-5 text-sm font-black text-white appearance-none transition-all focus:border-indigo-500" value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})} />
              </div>
            </div>

            <div className="space-y-4 relative z-10">
               <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] ml-2">Chromatic Signature</label>
               <div className="flex flex-wrap gap-4 p-2 bg-slate-900/50 rounded-2xl border border-white/5">
                 {COLORS.map(c => (
                   <button
                     key={c}
                     type="button"
                     className={`w-12 h-12 rounded-xl transition-all duration-500 ${formData.color === c ? 'ring-4 ring-indigo-500 scale-110 shadow-[0_0_20px_rgba(79,70,229,0.4)]' : 'opacity-30 hover:opacity-100 hover:scale-105'}`}
                     style={{ backgroundColor: c }}
                     onClick={() => setFormData({...formData, color: c})}
                   />
                 ))}
               </div>
            </div>

            <button type="submit" className="w-full py-6 bg-indigo-600 text-white font-black rounded-2xl shadow-[0_20px_40px_rgba(79,70,229,0.3)] transition-all hover:bg-indigo-500 uppercase tracking-[0.3em] text-[11px] flex items-center justify-center gap-4 relative z-10">
               <Save className="w-5 h-5" /> Execute Initialization
            </button>
          </form>
        )}

        <div className="space-y-6">
          {types.length === 0 ? (
            <div className="text-center py-20 opacity-20">
               <Target className="w-16 h-16 mx-auto mb-6 animate-pulse" />
               <p className="text-[11px] font-black uppercase tracking-[0.4em]">Grid Default — No Active Blueprints</p>
            </div>
          ) : (
            types.map(t => (
              <div key={t._id} className="group flex items-center justify-between p-8 bg-white/[0.03] hover:bg-white/[0.06] rounded-[2rem] border border-white/5 transition-all duration-700 hover:scale-[1.02] shadow-xl">
                 <div className="flex items-center gap-8">
                    <div className="w-16 h-16 rounded-2xl flex flex-col items-center justify-center text-white shadow-2xl transition-all duration-700 group-hover:scale-110 group-hover:rotate-12 border border-white/10 relative overflow-hidden" style={{ backgroundColor: t.color }}>
                      <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <Clock className="w-7 h-7 opacity-70 relative z-10" />
                    </div>
                    <div>
                       <h5 className="text-xl font-black text-white tracking-widest uppercase group-hover:text-indigo-400 transition-colors">{t.name}</h5>
                       <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mt-2">
                         Temporal Window: {t.startTime} // {t.endTime}
                       </p>
                    </div>
                 </div>
                 <button 
                   onClick={() => handleDelete(t._id)}
                   className="p-4 text-slate-600 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all duration-500 hover:bg-rose-500/10 rounded-2xl border border-transparent hover:border-rose-500/20 shadow-inner"
                 >
                    <Trash2 className="w-6 h-6" />
                 </button>
              </div>
            ))
          )}
        </div>
      </div>
      
      <div className="p-8 bg-slate-900/50 flex flex-col sm:flex-row items-center gap-6 border-t border-white/5">
        <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 border border-indigo-500/20 shrink-0">
           <Sparkles className="w-6 h-6 animate-pulse" />
        </div>
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] leading-relaxed text-center sm:text-left">System enables dynamic ad-hoc overrides, but blueprint utilization is enforced for sustained operational excellence.</p>
      </div>
    </div>
  );
};

export default ShiftTypeManager;
