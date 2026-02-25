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
    <div className="flex flex-col items-center justify-center py-40">
      <div className="w-16 h-16 relative">
         <div className="absolute inset-0 bg-indigo-500 rounded-full blur-2xl opacity-20 animate-pulse" />
         <div className="w-16 h-16 border-4 border-white/10 border-t-indigo-500 rounded-full animate-spin relative z-10" />
      </div>
      <p className="text-gray-400 font-black uppercase tracking-[0.3em] text-[10px] mt-8">Compiling Analytics Matrix...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in duration-1000">
      {/* Analytics Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10 bg-white/5 backdrop-blur-3xl p-12 rounded-[3.5rem] border border-white/10 shadow-3xl relative overflow-hidden">
        <div className="absolute top-0 left-0 p-32 bg-indigo-500/10 blur-[100px] -ml-20 -mt-20 rounded-full" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
           <div className="w-20 h-20 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-[2rem] flex items-center justify-center text-white shadow-2xl animate-pulse">
              <BarChart3 className="w-10 h-10" />
           </div>
           <div>
              <h2 className="text-4xl font-black text-white tracking-tighter">Neural Analytics</h2>
              <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mt-2 italic flex items-center gap-2">
                 <Target className="w-3 h-3 text-indigo-400" /> Operational Efficiency & Distribution Audit
              </p>
           </div>
        </div>

        <div className="relative z-10 flex items-center gap-4">
           <div className="bg-white/5 border border-white/10 p-2 rounded-2xl flex items-center gap-2">
              <input 
                type="month" 
                value={reportDate}
                onChange={e => setReportDate(e.target.value)}
                className="bg-transparent text-white font-black text-sm px-4 py-2 focus:outline-none appearance-none cursor-pointer"
              />
              <ChevronDown className="w-4 h-4 text-gray-400 mr-2" />
           </div>
           <button className="p-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl transition-all shadow-xl hover:-translate-y-1">
              <Download className="w-6 h-6" />
           </button>
        </div>
      </div>

      {!data || data.length === 0 ? (
        <div className="bg-white/5 py-40 rounded-[3.5rem] text-center border-2 border-dashed border-white/10">
           <BarChart3 className="w-20 h-20 text-white/5 mx-auto mb-8" />
           <p className="text-gray-500 font-black uppercase tracking-widest">No activity signatures detected for this period</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Main List */}
          <div className="xl:col-span-3 space-y-6">
            {data.map((item, idx) => (
              <div key={idx} className="bg-white/5 backdrop-blur-3xl rounded-[2.5rem] p-10 border border-white/5 hover:border-white/20 transition-all duration-500 group relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 bg-indigo-500/5 blur-[50px] rounded-full" />
                
                <div className="flex flex-col md:flex-row items-center justify-between gap-10 relative z-10">
                  <div className="flex items-center gap-8">
                    <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-white font-black text-lg border border-white/10 shadow-inner group-hover:scale-110 transition-transform duration-500">
                      {item.member.displayName.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                       <h4 className="text-2xl font-black text-white tracking-tight group-hover:text-indigo-300 transition-colors uppercase">{item.member.displayName}</h4>
                       <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1 inline-block">Role: {item.member.role}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap justify-center gap-10">
                    <MetricBox label="Actual Hours" value={Math.round(item.stats.totalHours * 10) / 10} icon={<Clock className="w-4 h-4" />} color="text-indigo-400" />
                    <MetricBox label="Leave Taken" value={item.stats.timeOffDays} icon={<Zap className="w-4 h-4" />} color="text-purple-400" suffix="Days" />
                    <MetricBox label="Efficiency" value={`${Math.round((item.stats.totalHours / 160) * 100)}%`} icon={<TrendingUp className="w-4 h-4" />} color="text-cyan-400" />
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <div className="h-1.5 w-48 bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full transition-all duration-1000"
                          style={{ width: `${Math.min((item.stats.totalHours / 160) * 100, 100)}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Utilization Index</span>
                   </div>
                   <button className="text-[10px] font-black text-indigo-400 hover:text-white uppercase tracking-widest decoration-dotted underline underline-offset-4">Full Matrix Audit</button>
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar Insights */}
          <div className="space-y-8">
             <div className="bg-[#1a1a2e] rounded-[3rem] p-10 border border-white/10 shadow-3xl text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 to-transparent pointer-events-none" />
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-2xl relative z-10">
                   <Users className="w-8 h-8" />
                </div>
                <h5 className="text-sm font-black text-gray-400 uppercase tracking-[0.3em] mb-2 relative z-10">Team Payload</h5>
                <p className="text-5xl font-black text-white tracking-tighter relative z-10">{data.length}</p>
                <div className="mt-6 flex items-center justify-center gap-2 relative z-10">
                   <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                   <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Active Nodes</span>
                </div>
             </div>

             <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-[3rem] p-10 text-white relative shadow-3xl overflow-hidden group">
                <div className="absolute top-0 right-0 p-20 bg-white/10 blur-[60px] rounded-full group-hover:scale-150 transition-transform duration-700" />
                <Sparkles className="w-10 h-10 opacity-50 mb-6" />
                <h5 className="text-lg font-black tracking-tight mb-4 relative z-10 leading-tight">Collective Optimization Engine</h5>
                <p className="text-sm font-medium text-white/60 leading-relaxed mb-8 relative z-10">Automated protocols are analyzing work patterns to suggest dynamic roster adjustments based on historical throughput.</p>
                <button className="w-full py-4 bg-white text-indigo-900 font-bold rounded-2xl text-[10px] uppercase tracking-widest hover:bg-gray-100 transition-all relative z-10">Trigger Simulation</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

const MetricBox = ({ label, value, icon, color, suffix = "Hrs" }) => (
  <div className="flex flex-col items-center">
    <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 mb-3 ${color} shadow-inner`}>
      {icon}
    </div>
    <div className="text-center">
      <p className="text-2xl font-black text-white tracking-tighter leading-none">{value} <span className="text-[10px] opacity-40 uppercase tracking-tighter">{suffix}</span></p>
      <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] mt-2">{label}</p>
    </div>
  </div>
);

export default ScheduleReportsPanel;
