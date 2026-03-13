import { useState, useEffect } from "react";
import {
  CreditCard,
  Package,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Loader,
  Zap,
  Calendar,
} from "lucide-react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

const SubscriptionDashboard = () => {
  const [subscription, setSubscription] = useState(null);
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSubscriptionData();
  }, []);

  const fetchSubscriptionData = async () => {
    try {
      const [subRes, usageRes] = await Promise.all([
        api.get("/subscription"),
        api.get("/subscription/usage"),
      ]);

      setSubscription(subRes.data.data);
      setUsage(usageRes.data.data);
    } catch (error) {
      console.error("Failed to load subscription data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getUsagePercentage = (used, limit) => {
    if (limit === Number.MAX_SAFE_INTEGER) return 0;
    return Math.round((used / limit) * 100);
  };

  const getUsageColor = (percentage) => {
    if (percentage >= 90) return "text-red-600 bg-red-100";
    if (percentage >= 75) return "text-yellow-600 bg-yellow-100";
    return "text-green-600 bg-green-100";
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 90) return "bg-red-500";
    if (percentage >= 75) return "bg-yellow-500";
    return "bg-green-500";
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-6">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-2 border-indigo-500/20 rounded-2xl animate-spin-slow"></div>
          <div className="absolute inset-0 border-2 border-t-indigo-500 border-transparent rounded-2xl animate-spin"></div>
        </div>
        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] animate-pulse">
          Accessing Neural Tiers...
        </p>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="p-12 glass-modal-content border-rose-500/20 bg-rose-500/5 text-center space-y-6">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto animate-pulse" />
        <div>
          <h3 className="text-xl font-black text-white uppercase tracking-widest">Access Void</h3>
          <p className="text-sm text-rose-400/60 font-medium uppercase tracking-widest mt-2">No active subscription sequence detected.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-fadeIn">
      {/* Background Ambience */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-[10%] left-[20%] w-[50%] h-[50%] bg-indigo-500/10 blur-[150px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[10%] right-[20%] w-[50%] h-[50%] bg-purple-500/10 blur-[150px] rounded-full animate-pulse" style={{ animationDelay: '3s' }}></div>
      </div>

      {/* Header */}
      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg shadow-indigo-500/20">
              <Zap className="w-6 h-6 text-white italic" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase italic">
              Neural Tier
            </h2>
          </div>
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.4em] ml-16">
            Subscription & Usage Orchestration
          </p>
        </div>
        <button
          onClick={() => navigate("/plans")}
          className="group flex items-center gap-4 px-8 py-4 bg-white/40 hover:bg-white/60 border border-slate-200 text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] transition-all hover:scale-[1.05] active:scale-[0.95] shadow-sm"
        >
          <div className="p-1.5 bg-indigo-500/20 rounded-lg group-hover:scale-110 transition-transform">
            <Zap className="w-4 h-4 text-indigo-400" />
          </div>
          Evolve Access Level
        </button>
      </div>

      {/* Current Plan Hero Card */}
      <div className="relative z-10 glass-card-silk !bg-white/80 p-10 overflow-hidden group shadow-lg border-slate-200">
        {/* Animated Background Element */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/10 blur-[80px] rounded-full group-hover:scale-150 transition-transform duration-1000"></div>
        
        <div className="relative flex flex-col lg:flex-row gap-12 items-start lg:items-center">
          <div className="flex-1 space-y-6">
            <div className="space-y-2">
              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.5em]">Current Protocol</p>
              <h3 className="text-5xl font-black text-slate-900 capitalize tracking-tighter italic">
                {subscription.currentPlan} <span className="text-indigo-600/50">Core</span>
              </h3>
            </div>
            
            <div className="flex flex-wrap gap-8">
              <div className="space-y-1">
                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Authorization Status</p>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${subscription.status === "active" ? "bg-emerald-500 shadow-[0_0_8px_#10b981]" : "bg-rose-500 animate-pulse"}`}></div>
                  <span className="text-xs font-black text-slate-900 uppercase tracking-widest italic">{subscription.status}</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Billing Frequency</p>
                <div className="flex items-center gap-2 text-slate-900">
                  <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="text-xs font-black uppercase tracking-widest italic">{subscription.billingCycle}</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Next Synchronization</p>
                <p className="text-xs font-black text-slate-900 uppercase tracking-widest italic">
                  {formatDate(subscription.currentPeriodEnd)}
                </p>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-auto flex flex-col sm:flex-row gap-6">
            {subscription.currentPlan !== "free" && (
              <div className="p-6 bg-white/5 rounded-[2rem] border border-white/5 flex items-center justify-between gap-8 min-w-[240px]">
                <div>
                  <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Neural Payment Vault</p>
                  <p className="text-xs font-black text-slate-900 tracking-widest italic">
                    {subscription.paymentMethod || "ENCRYPTED_ID"}
                  </p>
                </div>
                <div className="p-4 bg-indigo-500/10 rounded-2xl">
                  <CreditCard className="w-6 h-6 text-indigo-400" />
                </div>
              </div>
            )}
            <div className="p-4 bg-white/5 rounded-[2rem] flex items-center justify-center">
               <Package className="w-16 h-16 text-slate-800" />
            </div>
          </div>
        </div>
      </div>

      {/* Usage Metries Grid */}
      {usage && (
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: "Expenses Flux", value: usage.usage.expensesThisMonth, limit: usage.limits.expensesPerMonth, icon: TrendingUp, color: "indigo" },
            { label: "Account Nodes", value: usage.usage.accountsCount, limit: usage.limits.accounts, icon: Package, color: "purple" },
            { label: "Team Entities", value: usage.usage.teamMembersCount, limit: usage.limits.teamMembers, icon: TrendingUp, color: "blue" },
            { label: "Data Volume", value: (usage.usage.storageUsedMB / 1024).toFixed(1), limit: usage.limits.storageGB, unit: "GB", icon: Package, color: "rose" }
          ].map((stat, idx) => {
            const percentage = getUsagePercentage(stat.value, stat.limit * (stat.unit === "GB" ? 1024 : 1));
            return (
              <div key={idx} className="glass-card-silk p-6 group hover:translate-y-[-4px] transition-all duration-500 shadow-sm border-slate-200">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{stat.label}</h4>
                  <stat.icon className={`w-4 h-4 text-${stat.color}-500/50 group-hover:text-${stat.color}-400 transition-colors`} />
                </div>
                
                <div className="mb-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-slate-900 italic tracking-tighter">{stat.value}</span>
                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                      / {stat.limit === Number.MAX_SAFE_INTEGER ? "∞" : stat.limit}{stat.unit}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="w-full bg-white/5 rounded-full h-1 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${
                        percentage > 90 ? 'bg-rose-500 shadow-[0_0_8px_#f43f5e]' : 
                        percentage > 75 ? 'bg-amber-500' : 'bg-indigo-500'
                      }`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`text-[8px] font-black uppercase tracking-widest ${
                      percentage > 90 ? 'text-rose-400' : percentage > 75 ? 'text-amber-400' : 'text-indigo-400'
                    }`}>
                      {percentage}% Capacity
                    </span>
                    {percentage > 90 && <AlertCircle className="w-3 h-3 text-rose-500 animate-pulse" />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Feature Access Matrix */}
      <div className="relative z-10 glass-card-silk p-10 pb-12 shadow-sm border-slate-200">
        <div className="flex items-center gap-4 mb-10">
          <div className="p-2.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
          </div>
          <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight italic">
            Neural Feature Matrix
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {subscription.features &&
            Object.entries(subscription.features).map(([feature, enabled], idx) => (
              <div
                key={feature}
                className={`flex items-center gap-5 p-5 rounded-[1.5rem] border transition-all duration-500 group ${
                  enabled 
                    ? "bg-white/2 border-white/5 hover:border-emerald-500/20" 
                    : "bg-black/20 border-white/2 opacity-30 grayscale"
                }`}
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div className={`p-3 rounded-xl transition-all ${
                  enabled ? "bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20" : "bg-white/5 text-slate-700"
                }`}>
                  {enabled ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                </div>
                <div>
                  <p className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${enabled ? "text-slate-900" : "text-slate-400"}`}>
                    {feature.replace(/([A-Z])/g, " $1").trim()}
                  </p>
                  <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-1">
                    {enabled ? "Authorized" : "Protocol Locked"}
                  </p>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionDashboard;
