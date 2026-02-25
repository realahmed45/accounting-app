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
    <div className="bg-white/5 backdrop-blur-3xl rounded-[3rem] border border-white/10 shadow-3xl overflow-hidden h-full flex flex-col animate-in fade-in duration-500">
      <div className="p-10 border-b border-white/5 flex items-center justify-between">
         <div>
            <h3 className="text-2xl font-black text-white tracking-tighter flex items-center gap-3">
              <Shapes className="w-6 h-6 text-indigo-400" />
              Deployment Templates
            </h3>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">Matrix Shift Blueprints</p>
         </div>
         <button 
           onClick={() => setShowAdd(!showAdd)}
           className={`p-4 rounded-2xl transition-all duration-300 ${showAdd ? 'bg-red-500 text-white rotate-45' : 'bg-indigo-600 text-white hover:scale-110 shadow-2xl shadow-indigo-900'}`}
         >
           <Plus className="w-6 h-6" />
         </button>
      </div>

      <div className="flex-1 p-10 overflow-y-auto custom-scrollbar">
        {showAdd && (
          <form onSubmit={handleSubmit} className="mb-10 p-8 bg-white/5 rounded-[2rem] border border-indigo-500/20 space-y-6 animate-in slide-in-from-top-4 duration-300 shadow-inner">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-indigo-400 tracking-[0.2em] ml-2">Blueprint Name</label>
              <input 
                required
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-black text-white focus:border-indigo-500 outline-none transition-all shadow-inner"
                placeholder="e.g. ALPHA_SHIFT"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-gray-500 tracking-[0.2em] ml-2">Entry</label>
                <input type="time" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-black text-white appearance-none" value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-gray-500 tracking-[0.2em] ml-2">Exit</label>
                <input type="time" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-black text-white appearance-none" value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})} />
              </div>
            </div>

            <div className="space-y-3">
               <label className="text-[10px] font-black uppercase text-gray-500 tracking-[0.2em] ml-2">Chromatic Tag</label>
               <div className="flex flex-wrap gap-3 p-1">
                 {COLORS.map(c => (
                   <button
                     key={c}
                     type="button"
                     className={`w-10 h-10 rounded-xl transition-all duration-300 ${formData.color === c ? 'ring-4 ring-white/50 scale-110 shadow-2xl' : 'opacity-40 hover:opacity-100 hover:scale-105'}`}
                     style={{ backgroundColor: c }}
                     onClick={() => setFormData({...formData, color: c})}
                   />
                 ))}
               </div>
            </div>

            <button type="submit" className="w-full py-5 bg-indigo-600 text-white font-black rounded-2xl shadow-3xl shadow-indigo-900 transition-all hover:bg-indigo-500 uppercase tracking-widest text-xs flex items-center justify-center gap-3">
               <Save className="w-4 h-4" /> Finalize Blueprint
            </button>
          </form>
        )}

        <div className="space-y-4">
          {types.length === 0 ? (
            <div className="text-center py-10 opacity-20">
               <Target className="w-12 h-12 mx-auto mb-4" />
               <p className="text-[10px] font-black uppercase tracking-[0.2em]">Idle — No Templates Initialized</p>
            </div>
          ) : (
            types.map(t => (
              <div key={t._id} className="group flex items-center justify-between p-6 bg-white/[0.03] hover:bg-white/[0.07] rounded-3xl border border-white/5 transition-all duration-500 shadow-xl">
                 <div className="flex items-center gap-6">
                    <div className="w-14 h-14 rounded-2xl flex flex-col items-center justify-center text-white shadow-2xl transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3 border border-white/10" style={{ backgroundColor: t.color }}>
                      <Clock className="w-6 h-6 opacity-60" />
                    </div>
                    <div>
                       <h5 className="text-lg font-black text-white tracking-tight group-hover:text-indigo-300 transition-colors uppercase">{t.name}</h5>
                       <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">
                         {t.startTime} — {t.endTime}
                       </p>
                    </div>
                 </div>
                 <button 
                   onClick={() => handleDelete(t._id)}
                   className="p-3 text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-red-500/10 rounded-xl"
                 >
                    <Trash2 className="w-5 h-5" />
                 </button>
              </div>
            ))
          )}
        </div>
      </div>
      
      <div className="p-8 bg-black/20 flex items-center gap-4 border-t border-white/5">
        <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400">
           <Sparkles className="w-5 h-5 animate-pulse" />
        </div>
        <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest leading-relaxed">System allows ad-hoc overrides, but blueprint utilization is recommended for operational consistency.</p>
      </div>
    </div>
  );
};

export default ShiftTypeManager;
