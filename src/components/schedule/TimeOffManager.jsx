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
    <div className="bg-white/5 backdrop-blur-3xl rounded-[3rem] border border-white/10 shadow-3xl overflow-hidden h-full flex flex-col animate-in fade-in duration-500">
      <div className="p-10 border-b border-white/5 flex items-center justify-between">
         <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-gradient-to-br from-green-600 to-teal-500 rounded-2xl flex items-center justify-center text-white shadow-2xl relative">
               <div className="absolute inset-0 bg-green-400 blur-xl opacity-20 animate-pulse" />
               <Sun className="w-8 h-8 relative z-10" />
            </div>
            <div>
               <h3 className="text-2xl font-black text-white tracking-tighter">Personnel Quotas</h3>
               <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">Annual Leave Analytics ({year})</p>
            </div>
         </div>
      </div>

      <div className="flex-1 p-10 overflow-y-auto custom-scrollbar space-y-8">
        {members.map(member => {
          const balance = balances[member._id] || { annualAllowance: 0, usedDays: 0, extraEarnedDays: 0 };
          const remaining = (balance.annualAllowance + balance.extraEarnedDays) - balance.usedDays;

          return (
            <div key={member._id} className="group bg-white/[0.03] hover:bg-white/[0.07] rounded-[2.5rem] p-8 border border-white/5 transition-all duration-500 shadow-xl relative overflow-hidden">
               <div className="absolute top-0 right-0 p-10 bg-green-500/5 blur-[40px] rounded-full" />
               
               <div className="flex items-center gap-6 mb-8 relative z-10">
                  <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-white font-black text-sm border border-white/10 shadow-inner group-hover:scale-110 transition-transform duration-500">
                    {member.displayName.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h5 className="text-xl font-black text-white tracking-tight uppercase">{member.displayName}</h5>
                    <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] mt-1">{member.role}</p>
                  </div>
                  {saving === member._id && (
                    <div className="ml-auto flex items-center gap-2">
                       <div className="w-2 h-2 bg-indigo-500 rounded-full animate-ping" />
                       <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest">Saving...</span>
                    </div>
                  )}
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                  <div className="space-y-4">
                     <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 shadow-inner">
                        <div className="flex items-center gap-3">
                           <Target className="w-4 h-4 text-indigo-400" />
                           <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Base Quota</span>
                        </div>
                        <input 
                          type="number" 
                          className="w-16 bg-transparent border-none text-right font-black text-white text-lg focus:ring-0 appearance-none"
                          value={balance.annualAllowance}
                          onChange={(e) => setBalances(p => ({...p, [member._id]: {...balance, annualAllowance: parseInt(e.target.value)||0}}))}
                          onBlur={() => handleUpdate(member._id, { annualAllowance: balance.annualAllowance })}
                        />
                     </div>
                     <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 shadow-inner">
                        <div className="flex items-center gap-3">
                           <Zap className="w-4 h-4 text-purple-400" />
                           <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Used Track</span>
                        </div>
                        <input 
                          type="number" 
                          className="w-16 bg-transparent border-none text-right font-black text-white text-lg focus:ring-0 appearance-none"
                          value={balance.usedDays}
                          onChange={(e) => setBalances(p => ({...p, [member._id]: {...balance, usedDays: parseInt(e.target.value)||0}}))}
                          onBlur={() => handleUpdate(member._id, { usedDays: balance.usedDays })}
                        />
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div className="p-4 bg-indigo-900/10 rounded-2xl border border-indigo-500/10 flex flex-col justify-between group-hover:bg-indigo-900/20 transition-all duration-500 shadow-2xl shadow-indigo-900/20">
                        <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Neural Bonus</span>
                        <div className="mt-2 flex items-baseline gap-1">
                           <span className="text-2xl font-black text-white">+{balance.extraEarnedDays}</span>
                           <span className="text-[10px] font-black text-gray-600">DAYS</span>
                        </div>
                     </div>
                     <div className={`p-4 rounded-2xl border flex flex-col justify-between transition-all duration-500 shadow-2xl ${
                        remaining < 0 ? 'bg-red-900/20 border-red-500/20 shadow-red-900/20' : 'bg-green-900/20 border-green-500/20 shadow-green-900/20'
                     }`}>
                        <span className={`text-[9px] font-black uppercase tracking-widest ${remaining < 0 ? 'text-red-400' : 'text-green-400'}`}>Remaining</span>
                        <div className="mt-2 flex items-baseline gap-1">
                           <span className={`text-2xl font-black ${remaining < 0 ? 'text-red-400' : 'text-green-400'}`}>{remaining}</span>
                           <span className="text-[10px] font-black text-gray-600 uppercase">Avail</span>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          );
        })}
      </div>
      
      <div className="p-8 bg-black/20 flex items-center gap-4 border-t border-white/5">
        <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center text-green-400">
           <ShieldCheck className="w-5 h-5" />
        </div>
        <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest leading-relaxed">Neural bonus days are auto-credited via approved overtime matrix synchronization.</p>
      </div>
    </div>
  );
};

export default TimeOffManager;
