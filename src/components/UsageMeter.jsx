import { useState, useEffect } from "react";
import { TrendingUp, AlertCircle } from "lucide-react";
import api from "../services/api";

const UsageMeter = ({ compact = false }) => {
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsage();
  }, []);

  const fetchUsage = async () => {
    try {
      const res = await api.get("/subscription/usage");
      setUsage(res.data.data);
    } catch (error) {
      console.error("Failed to load usage:", error);
    } finally {
      setLoading(false);
    }
  };

  const getUsagePercentage = (used, limit) => {
    if (limit === Number.MAX_SAFE_INTEGER) return 0;
    return Math.round((used / limit) * 100);
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 90) return "bg-red-500";
    if (percentage >= 75) return "bg-yellow-500";
    return "bg-green-500";
  };

  if (loading || !usage) return null;

  const expensesPercentage = getUsagePercentage(
    usage.usage.expensesThisMonth,
    usage.limits.expensesPerMonth,
  );

  // Only show if approaching limit
  if (expensesPercentage < 75 && compact) return null;

  if (compact) {
    return (
      <div className="glass-card p-4 border-white/5 bg-[#020617]/40 backdrop-blur-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${
              expensesPercentage >= 90 ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]' : 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]'
            }`} />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
              Throughput
            </span>
          </div>
          <span className="text-[10px] font-black text-white uppercase tracking-widest">
            {expensesPercentage}%
          </span>
        </div>
        <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(79,70,229,0.4)] ${getProgressColor(
              expensesPercentage,
            )}`}
            style={{ width: `${Math.min(expensesPercentage, 100)}%` }}
          ></div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-8 border-white/5 bg-[#020617]/40 backdrop-blur-2xl group">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-sm font-black text-white uppercase tracking-[0.3em] italic">
            Neural Capacity
          </h3>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
            Real-time Resource Allocation
          </p>
        </div>
        <div className="p-3 bg-white/5 rounded-2xl border border-white/5 group-hover:border-indigo-500/30 transition-all">
          <TrendingUp className="w-5 h-5 text-indigo-400" />
        </div>
      </div>

      <div className="space-y-8">
        {/* Expenses */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Packet Flux (Expenses)</span>
            <div className="flex items-end gap-1.5">
              <span className="text-xs font-black text-white tracking-widest">
                {usage.usage.expensesThisMonth}
              </span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
                / {usage.limits.expensesPerMonth === Number.MAX_SAFE_INTEGER ? "∞" : usage.limits.expensesPerMonth}
              </span>
            </div>
          </div>
          <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)]">
            <div
              className={`h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_20px_rgba(79,70,229,0.3)] ${getProgressColor(
                expensesPercentage,
              )}`}
              style={{ width: `${Math.min(expensesPercentage, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Storage */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Archive Mass (Storage)</span>
            <div className="flex items-end gap-1.5">
              <span className="text-xs font-black text-white tracking-widest">
                {(usage.usage.storageUsedMB / 1024).toFixed(1)}
              </span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
                / {usage.limits.storageGB} GB
              </span>
            </div>
          </div>
          <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)]">
            <div
              className={`h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_20px_rgba(79,70,229,0.3)] ${getProgressColor(
                getUsagePercentage(
                  usage.usage.storageUsedMB,
                  usage.limits.storageGB * 1024,
                ),
              )}`}
              style={{
                width: `${Math.min(
                  getUsagePercentage(
                    usage.usage.storageUsedMB,
                    usage.limits.storageGB * 1024,
                  ),
                  100,
                )}%`,
              }}
            ></div>
          </div>
        </div>
      </div>

      {expensesPercentage >= 90 && (
        <div className="mt-8 p-6 bg-rose-500/5 border border-rose-500/20 rounded-[2rem] animate-pulse">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-rose-500/20 rounded-xl">
              <AlertCircle className="w-5 h-5 text-rose-500" />
            </div>
            <div>
              <p className="text-[10px] font-black text-rose-500 uppercase tracking-[0.2em]">
                Protocol Saturation
              </p>
              <p className="text-[11px] text-slate-400 font-medium leading-relaxed mt-2 uppercase tracking-wide">
                Throughput at <span className="text-white font-black">{expensesPercentage}%</span> capacity. Neural expansion required.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsageMeter;
