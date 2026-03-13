import React, { useState, useEffect } from "react";
import { 
  Sun, 
  Save, 
  Users, 
  AlertCircle, 
  Edit, 
  CheckCircle2, 
  Target, 
  Zap, 
  ChevronRight,
  TrendingUp,
  ShieldCheck
} from "lucide-react";
import { timeOffService } from "../../services/scheduleApi";
import { memberService } from "../../services/api";

const TimeOffManager = ({ accountId }) => {
  const [members, setMembers] = useState([]);
  const [balances, setBalances] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null); 
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const year = new Date().getFullYear();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [membersRes, balancesRes] = await Promise.all([
        memberService.getAll(accountId),
        timeOffService.getAll(accountId, year)
      ]);
      setMembers(membersRes.data);
      const balanceMap = {};
      balancesRes.data.forEach(b => { balanceMap[b.memberId] = b; });
      setBalances(balanceMap);
    } catch (err) {
      setError("Data synchronization stalled");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (memberId, updates) => {
    setSaving(memberId);
    setError("");
    setSuccess("");
    try {
      await timeOffService.updateAllowance(accountId, memberId, { ...updates, year });
      setSuccess(`Synced for ${members.find(m => m._id === memberId)?.displayName}`);
      setTimeout(() => setSuccess(""), 3000);
      loadData();
    } catch (err) {
      setError("Protocol rejection");
    } finally {
      setSaving(null);
    }
  };

  if (loading) return null;

  return (
    <div className="glass-panel h-full flex flex-col animate-fadeIn border-white/5 overflow-hidden">
      <div className="p-10 border-b border-white/5 flex items-center justify-between group">
         <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-400 rounded-2xl flex items-center justify-center text-white shadow-[0_20px_40px_rgba(16,185,129,0.3)] group-hover:scale-110 transition-transform duration-500">
               <Sun className="w-8 h-8" />
            </div>
            <div>
               <h3 className="text-2xl font-black text-white tracking-widest uppercase">Personnel Quotas</h3>
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mt-3">Annual Leave Synchronization ({year})</p>
            </div>
         </div>
      </div>

      <div className="flex-1 p-10 overflow-y-auto custom-scrollbar space-y-10">
        {members.map(member => {
          const balance = balances[member._id] || { annualAllowance: 0, usedDays: 0, extraEarnedDays: 0 };
          const remaining = (balance.annualAllowance + balance.extraEarnedDays) - balance.usedDays;

          return (
            <div key={member._id} className="glass-panel p-10 group transition-all duration-700 hover:bg-white/[0.04] hover:scale-[1.01] relative overflow-hidden">
               <div className="absolute top-0 right-0 p-16 bg-emerald-500/5 blur-[80px] rounded-full group-hover:bg-emerald-500/10 transition-all duration-700" />
               
               <div className="flex items-center gap-8 mb-10 relative z-10">
                  <div className="w-16 h-16 bg-slate-800 rounded-[1.5rem] flex items-center justify-center text-white font-black text-sm border border-white/5 shadow-2xl group-hover:scale-110 group-hover:border-emerald-500/30 transition-all duration-500">
                    {member.displayName.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h5 className="text-xl font-black text-white tracking-widest uppercase group-hover:text-emerald-400 transition-colors">{member.displayName}</h5>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mt-2">{member.role} // UNIT_0{member._id.toString().slice(-4).toUpperCase()}</p>
                  </div>
                  {saving === member._id && (
                    <div className="ml-auto flex items-center gap-3">
                       <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                       <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Protocol Syncing...</span>
                    </div>
                  )}
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
                  <div className="space-y-6">
                     <div className="flex items-center justify-between p-6 bg-slate-900/50 rounded-2xl border border-white/5 shadow-inner group/input focus-within:border-indigo-500/30 transition-all">
                        <div className="flex items-center gap-4">
                           <Target className="w-5 h-5 text-indigo-400 group-hover/input:scale-110 transition-transform" />
                           <span className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em]">Base Quota</span>
                        </div>
                        <input 
                          type="number" 
                          className="w-20 bg-transparent border-none text-right font-black text-white text-2xl focus:ring-0 appearance-none tabular-nums"
                          value={balance.annualAllowance}
                          onChange={(e) => setBalances(p => ({...p, [member._id]: {...balance, annualAllowance: parseInt(e.target.value)||0}}))}
                          onBlur={() => handleUpdate(member._id, { annualAllowance: balance.annualAllowance })}
                        />
                     </div>
                     <div className="flex items-center justify-between p-6 bg-slate-900/50 rounded-2xl border border-white/5 shadow-inner group/input focus-within:border-purple-500/30 transition-all">
                        <div className="flex items-center gap-4">
                           <Zap className="w-5 h-5 text-purple-400 group-hover/input:scale-110 transition-transform" />
                           <span className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em]">Used Track</span>
                        </div>
                        <input 
                          type="number" 
                          className="w-20 bg-transparent border-none text-right font-black text-white text-2xl focus:ring-0 appearance-none tabular-nums"
                          value={balance.usedDays}
                          onChange={(e) => setBalances(p => ({...p, [member._id]: {...balance, usedDays: parseInt(e.target.value)||0}}))}
                          onBlur={() => handleUpdate(member._id, { usedDays: balance.usedDays })}
                        />
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                     <div className="p-6 bg-indigo-900/10 rounded-2xl border border-indigo-500/10 flex flex-col justify-between group-hover:bg-indigo-900/20 transition-all duration-700 shadow-[0_20px_40px_rgba(79,70,229,0.1)]">
                        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">Neural Bonus</span>
                        <div className="mt-4 flex items-baseline gap-2">
                           <span className="text-3xl font-black text-white tracking-widest">+{balance.extraEarnedDays}</span>
                           <span className="text-[10px] font-black text-slate-700 uppercase tracking-tighter">DAYS</span>
                        </div>
                     </div>
                     <div className={`p-6 rounded-2xl border flex flex-col justify-between transition-all duration-700 shadow-[0_20px_40px_rgba(0,0,0,0.2)] ${
                        remaining < 0 ? 'bg-rose-900/20 border-rose-500/20' : 'bg-emerald-900/20 border-emerald-500/20'
                     }`}>
                        <span className={`text-[10px] font-black uppercase tracking-[0.3em] ${remaining < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>Availability</span>
                        <div className="mt-4 flex items-baseline gap-2">
                           <span className={`text-3xl font-black tracking-widest ${remaining < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>{remaining}</span>
                           <span className="text-[10px] font-black text-slate-700 uppercase tracking-tighter">READY</span>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          );
        })}
      </div>
      
      <div className="p-8 bg-slate-900/50 flex flex-col sm:flex-row items-center gap-6 border-t border-white/5">
        <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-400 border border-emerald-500/20 shrink-0">
           <ShieldCheck className="w-6 h-6 animate-pulse" />
        </div>
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] leading-relaxed text-center sm:text-left">Neural bonus days are auto-credited via approved overtime matrix synchronization protocols.</p>
      </div>
    </div>
  );
};

export default TimeOffManager;
