import React, { useState, useEffect } from "react";
import { 
  BarChart3, 
  Calendar, 
  Download, 
  TrendingUp, 
  Users, 
  Clock, 
  Zap, 
  Target,
  ChevronDown,
  Info
} from "lucide-react";
import { reportService } from "../../services/scheduleApi";

const ScheduleReportsPanel = ({ accountId }) => {
  const [reportDate, setReportDate] = useState(new Date().toISOString().substring(0, 7)); // YYYY-MM
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadReport();
  }, [reportDate]);

  const loadReport = async () => {
    setLoading(true);
    try {
      const year = reportDate.split("-")[0];
      const month = reportDate.split("-")[1];
      const res = await reportService.getMonthlySummary(accountId, year, month);
      setData(res.data);
    } catch (err) {
      setError("Data synchronization failed");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-40 animate-fadeIn">
      <div className="w-20 h-20 relative">
         <div className="absolute inset-0 bg-indigo-500 rounded-full blur-3xl opacity-20 animate-pulse" />
         <div className="w-20 h-20 border-[6px] border-white/5 border-t-indigo-500 rounded-full animate-spin relative z-10 shadow-[0_0_20px_rgba(79,70,229,0.2)]" />
      </div>
      <p className="text-slate-400 font-black uppercase tracking-[0.4em] text-[10px] mt-10 opacity-70">Synthesizing Analytics Matrix...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in duration-1000">
      {/* Analytics Header */}
      <div className="glass-panel p-10 rounded-[3rem] group relative overflow-hidden animate-fadeIn">
        <div className="absolute top-0 left-0 p-32 bg-indigo-500/5 blur-[100px] -ml-20 -mt-20 rounded-full group-hover:bg-indigo-500/10 transition-all duration-700" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10 relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-8">
             <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-[2rem] flex items-center justify-center text-white shadow-[0_20px_40px_rgba(79,70,229,0.3)] group-hover:scale-110 transition-transform duration-500">
                <BarChart3 className="w-9 h-9" />
             </div>
             <div>
                <h2 className="text-4xl font-black text-white tracking-widest uppercase">Neural Analytics</h2>
                <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[10px] mt-3 flex items-center gap-2">
                   <Target className="w-3.5 h-3.5 text-indigo-400" /> Operational Throughput & Payload Distribution
                </p>
             </div>
          </div>

          <div className="flex items-center gap-6">
             <div className="bg-slate-900 border border-white/5 p-2 rounded-2xl flex items-center gap-2 shadow-inner">
                <input 
                  type="month" 
                  value={reportDate}
                  onChange={e => setReportDate(e.target.value)}
                  className="bg-transparent text-white font-black text-[11px] uppercase tracking-widest px-6 py-3 focus:outline-none appearance-none cursor-pointer"
                />
                <ChevronDown className="w-4 h-4 text-slate-500 mr-2" />
             </div>
             <button className="p-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl transition-all shadow-[0_15px_30px_rgba(79,70,229,0.2)] hover:-translate-y-1 active:scale-95">
                <Download className="w-6 h-6" />
             </button>
          </div>
        </div>
      </div>

      {!data || data.length === 0 ? (
        <div className="glass-panel py-40 rounded-[3.5rem] text-center border-dashed border-white/10 opacity-60">
           <BarChart3 className="w-24 h-24 text-slate-800 mx-auto mb-10 animate-pulse" />
           <p className="text-slate-500 font-black uppercase tracking-[0.4em] text-[11px]">No Activity Signatures Detected for this Temporal Window</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-10">
          {/* Main List */}
          <div className="xl:col-span-3 space-y-8">
            {data.map((item, idx) => (
              <div key={idx} className="glass-panel p-10 group transition-all duration-700 hover:bg-white/[0.04] hover:scale-[1.01] relative overflow-hidden">
                <div className="absolute top-0 right-0 p-16 bg-indigo-500/5 blur-[80px] rounded-full group-hover:bg-indigo-500/10 transition-all duration-700" />
                
                <div className="flex flex-col md:flex-row items-center justify-between gap-10 relative z-10">
                  <div className="flex items-center gap-10">
                    <div className="w-20 h-20 bg-slate-800 rounded-[1.5rem] flex items-center justify-center text-white font-black text-xl border border-white/5 shadow-2xl group-hover:scale-110 group-hover:border-indigo-500/30 transition-all duration-500">
                      {item.member.displayName.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                       <h4 className="text-2xl font-black text-white tracking-widest uppercase group-hover:text-indigo-400 transition-colors uppercase">{item.member.displayName}</h4>
                       <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2 inline-block">Role: {item.member.role}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap justify-center gap-12">
                    <MetricBox label="Actual Hours" value={Math.round(item.stats.totalHours * 10) / 10} icon={<Clock className="w-4 h-4" />} color="text-indigo-400" />
                    <MetricBox label="Leave Taken" value={item.stats.timeOffDays} icon={<Zap className="w-4 h-4" />} color="text-purple-400" suffix="Days" />
                    <MetricBox label="Efficiency" value={`${Math.round((item.stats.totalHours / 160) * 100)}%`} icon={<TrendingUp className="w-4 h-4" />} color="text-emerald-400" />
                  </div>
                </div>

                <div className="mt-10 pt-10 border-t border-white/5 flex items-center justify-between">
                   <div className="flex items-center gap-6">
                      <div className="h-2 w-64 bg-slate-900 rounded-full overflow-hidden shadow-inner">
                        <div 
                          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-[1.5s] ease-out shadow-[0_0_15px_rgba(99,102,241,0.5)]"
                          style={{ width: `${Math.min((item.stats.totalHours / 160) * 100, 100)}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Utilization Index</span>
                   </div>
                   <button className="text-[10px] font-black text-indigo-400 hover:text-white uppercase tracking-widest transition-colors decoration-indigo-400/30 underline underline-offset-[6px]">Full Matrix Audit</button>
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar Insights */}
          <div className="space-y-10">
             <div className="glass-panel p-10 text-center group">
                <div className="w-20 h-20 bg-slate-900 rounded-[2rem] flex items-center justify-center text-indigo-400 mx-auto mb-8 shadow-2xl border border-white/5 group-hover:scale-110 transition-transform duration-500">
                   <Users className="w-10 h-10" />
                </div>
                <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-3">Team Payload</h5>
                <p className="text-6xl font-black text-white tracking-widest uppercase">{data.length.toString().padStart(2, '0')}</p>
                <div className="mt-8 flex items-center justify-center gap-3">
                   <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Entities</span>
                </div>
             </div>

             <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[3rem] p-10 text-white relative shadow-[0_30px_60px_rgba(79,70,229,0.3)] overflow-hidden group">
                <div className="absolute top-0 right-0 p-24 bg-white/10 blur-[80px] rounded-full group-hover:scale-150 transition-transform duration-1000" />
                <Sparkles className="w-10 h-10 text-white/40 mb-8" />
                <h5 className="text-xl font-black uppercase tracking-widest mb-4 leading-tight">Optimization Engine</h5>
                <p className="text-xs font-medium text-white/70 leading-relaxed mb-10">Neural protocols analysis suggests dynamic shift adjustments based on high-frequency work patterns.</p>
                <button className="w-full py-4.5 bg-white text-indigo-600 font-black rounded-2xl text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all active:scale-95 shadow-2xl">Trigger Simulation</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

const MetricBox = ({ label, value, icon, color, suffix = "Hrs" }) => (
  <div className="flex flex-col items-center">
    <div className={`w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center border border-white/5 mb-4 ${color} shadow-inner group-hover:border-indigo-500/20 transition-all`}>
      {icon}
    </div>
    <div className="text-center">
      <p className="text-2xl font-black text-white tracking-widest leading-none uppercase">{value}<span className="text-[9px] ml-1 opacity-30 uppercase tracking-tighter">{suffix}</span></p>
      <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.3em] mt-3 whitespace-nowrap">{label}</p>
    </div>
  </div>
);

export default ScheduleReportsPanel;
