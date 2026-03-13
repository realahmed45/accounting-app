import React, { useState } from "react";
import {
  Check,
  Zap,
  Sparkles,
  Building2,
  Crown,
  ArrowRight,
  Shield,
  RefreshCw,
  CreditCard,
  ChevronRight,
} from "lucide-react";

const PlanSelectionScreen = ({ onSelectPlan, onSkip, userEmail }) => {
  const [selectedPlan, setSelectedPlan] = useState("professional");
  const [billingCycle, setBillingCycle] = useState("monthly");

  const plans = [
    {
      id: "free",
      name: "Starter",
      tagline: "Get started for free",
      icon: Zap,
      accentColor: "#64748b",
      accentBg: "bg-slate-100",
      price: { monthly: 0, yearly: 0 },
      perMonth: { monthly: 0, yearly: 0 },
      features: [
        "1 workspace",
        "50 expenses / month",
        "Basic categories",
        "Email support",
        "Mobile web access",
      ],
      notIncluded: ["Team members", "Scheduling", "Advanced reports"],
      cta: "Start Free",
      popular: false,
    },
    {
      id: "professional",
      name: "Pro",
      tagline: "For freelancers & solo pros",
      icon: Sparkles,
      accentColor: "#7c3aed",
      accentBg: "bg-violet-600",
      price: { monthly: 12, yearly: 120 },
      perMonth: { monthly: 12, yearly: 10 },
      features: [
        "5 workspaces",
        "Unlimited expenses",
        "3 team members",
        "Custom categories & tags",
        "500 MB photo storage",
        "Scheduling (50 shifts / mo)",
        "CSV / PDF export",
        "Priority chat support",
      ],
      notIncluded: ["Advanced reports", "API access"],
      cta: "Start Pro",
      popular: true,
      badge: "Most Popular",
    },
    {
      id: "business",
      name: "Business",
      tagline: "For growing teams",
      icon: Building2,
      accentColor: "#059669",
      accentBg: "bg-emerald-600",
      price: { monthly: 29, yearly: 290 },
      perMonth: { monthly: 29, yearly: 24 },
      features: [
        "20 workspaces",
        "Unlimited everything",
        "Unlimited team members",
        "Advanced reports & analytics",
        "2 GB photo storage",
        "Full scheduling suite",
        "API access (10k calls / mo)",
        "Custom branding",
        "Advanced exports (Excel, QB)",
        "12-hour priority support",
      ],
      notIncluded: [],
      cta: "Start Business",
      popular: false,
    },
    {
      id: "enterprise",
      name: "Enterprise",
      tagline: "For large organizations",
      icon: Crown,
      accentColor: "#d97706",
      accentBg: "bg-amber-500",
      price: { monthly: 79, yearly: "Custom" },
      perMonth: { monthly: 79, yearly: "Custom" },
      features: [
        "Unlimited workspaces",
        "White-label option",
        "Dedicated account manager",
        "Phone support (2-hour SLA)",
        "Custom integrations & API",
        "SSO & advanced security",
        "SOC 2 compliance",
        "On-premise deployment",
        "99.99% uptime SLA",
        "Custom data retention",
      ],
      notIncluded: [],
      cta: "Contact Sales",
      popular: false,
    },
  ];

  const selectedPlanData = plans.find((p) => p.id === selectedPlan);

  const getDisplayPrice = (plan) => {
    const val = plan.perMonth[billingCycle];
    if (typeof val !== "number") return val;
    return val === 0 ? "Free" : `$${val}`;
  };

  const handleContinue = () => {
    onSelectPlan(selectedPlan);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#020617] font-inter text-slate-300">
      {/* Background Ambience */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-indigo-500/10 blur-[150px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-purple-500/10 blur-[150px] rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-[#020617]/40 backdrop-blur-2xl border-b border-white/5 px-6 sm:px-12 py-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative p-2.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg shadow-indigo-500/20 group overflow-hidden">
            <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
            <span className="relative text-white font-black text-xl italic tracking-tighter">W</span>
          </div>
          <span className="font-black text-white text-lg tracking-[0.2em] hidden sm:block uppercase italic">
            Neural<span className="text-indigo-400">Nex</span>
          </span>
        </div>
        
        <div className="flex items-center gap-8">
          {userEmail && (
            <div className="hidden md:flex items-center gap-3 px-5 py-2.5 bg-white/5 rounded-full border border-white/10 shadow-[inner_0_0_10px_rgba(255,255,255,0.05)]">
              <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_10px_#6366f1]" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{userEmail}</span>
            </div>
          )}
          {onSkip && (
            <button
              onClick={onSkip}
              className="text-[10px] text-slate-500 hover:text-white font-black tracking-[0.3em] uppercase transition-all flex items-center gap-3 group"
            >
              Bypass
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-12 py-12 sm:py-24 relative z-10">
        {/* Header */}
        <div className="text-center mb-20 animate-fadeIn space-y-6">
          <p className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.5em]">Capacity Configuration</p>
          <h1 className="text-5xl sm:text-7xl font-black text-white mb-8 tracking-[-0.05em] uppercase italic">
            Tier <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400">Specialization</span>
          </h1>
          <p className="text-slate-500 text-sm sm:text-lg max-w-2xl mx-auto font-medium uppercase tracking-[0.1em] leading-relaxed">
            Select the processing power required for your neural workflow.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center mt-12 bg-white/2 backdrop-blur-md border border-white/5 rounded-[2rem] p-1.5 shadow-2xl">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-10 py-4 rounded-[1.75rem] text-[10px] font-black tracking-[0.2em] uppercase transition-all ${
                billingCycle === "monthly"
                  ? "bg-white/10 text-white shadow-xl"
                  : "text-slate-500 hover:text-white"
              }`}
            >
              Lunar Cycle
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={`px-10 py-4 rounded-[1.75rem] text-[10px] font-black tracking-[0.2em] uppercase transition-all flex items-center gap-4 ${
                billingCycle === "yearly"
                  ? "bg-white/10 text-white shadow-xl"
                  : "text-slate-500 hover:text-white"
              }`}
            >
              Solar Cycle
              <span
                className={`text-[9px] font-black px-3 py-1 rounded-full ${billingCycle === "yearly" ? "bg-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.5)]" : "bg-white/5 text-slate-500"}`}
              >
                -17% Efficiency
              </span>
            </button>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {plans.map((plan, idx) => {
            const PlanIcon = plan.icon;
            const isSelected = selectedPlan === plan.id;
            const price = getDisplayPrice(plan);

            return (
              <div
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={`group relative flex flex-col glass-modal-content p-10 cursor-pointer border animate-scaleIn transition-all duration-500 ${
                  isSelected
                    ? "border-indigo-500/50 bg-indigo-500/5 shadow-[0_0_60px_rgba(79,70,229,0.1)] scale-[1.02]"
                    : "border-white/5 hover:border-white/10 hover:bg-white/2"
                }`}
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[9px] font-black px-5 py-2 rounded-bl-2xl uppercase tracking-[0.3em] shadow-lg">
                    {plan.badge}
                  </div>
                )}

                <div className="flex flex-col flex-1 relative z-10">
                  {/* Icon + name */}
                  <div className="mb-10 text-center">
                    <div
                      className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8 transition-all duration-700 group-hover:rotate-[360deg] shadow-[inset_0_0_20px_rgba(255,255,255,0.02)]"
                      style={{ background: `${plan.accentColor}10`, border: `1px solid ${plan.accentColor}20` }}
                    >
                      <PlanIcon
                        className="w-10 h-10"
                        style={{ color: plan.accentColor }}
                      />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tight italic">
                        {plan.name}
                      </h3>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                        {plan.tagline}
                      </p>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mb-10 text-center py-6 bg-white/2 rounded-2xl border border-white/5">
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Starting At</span>
                    </div>
                    <div className="flex items-end justify-center gap-2">
                      <span className="text-5xl font-black text-white leading-none tracking-tighter italic">
                        {price}
                      </span>
                      {typeof plan.perMonth[billingCycle] === "number" &&
                        plan.perMonth[billingCycle] > 0 && (
                          <span className="text-slate-500 font-black text-[10px] mb-1 uppercase tracking-[0.3em]">
                            / Term
                          </span>
                        )}
                    </div>
                  </div>

                  {/* Features */}
                  <ul className="space-y-5 flex-1 mb-12">
                    {plan.features.map((f, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-4 text-[11px] text-slate-400 font-medium uppercase tracking-wide leading-relaxed"
                      >
                        <div className="mt-1 w-4 h-4 rounded-lg bg-indigo-500/10 flex items-center justify-center flex-shrink-0 border border-indigo-500/20">
                          <Check className="w-2.5 h-2.5 text-indigo-400 stroke-[4px]" />
                        </div>
                        <span>{f}</span>
                      </li>
                    ))}
                    {plan.notIncluded.map((f, i) => (
                      <li
                        key={`no-${i}`}
                        className="flex items-start gap-4 text-[11px] text-slate-600 font-medium uppercase tracking-wide opacity-50"
                      >
                        <div className="mt-1 w-4 h-4 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0 border border-white/5">
                          <span className="text-[10px] font-black opacity-30">—</span>
                        </div>
                        <span className="line-through decoration-slate-800">{f}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Select button */}
                  <button
                    type="button"
                    className={`w-full py-5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.3em] transition-all duration-300 ${
                      isSelected
                        ? "bg-indigo-600 text-white shadow-[0_15px_30px_rgba(79,70,229,0.3)]"
                        : "bg-white/5 text-slate-400 hover:bg-white/10 border border-white/5 hover:text-white"
                    }`}
                  >
                    {isSelected ? "ACTIVE NODE" : `Deploy ${plan.name}`}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="flex flex-col items-center gap-8 mt-12 animate-slideUp">
          <button
            onClick={handleContinue}
            className="flex items-center gap-6 px-16 py-7 rounded-[2.5rem] text-white font-black text-lg shadow-2xl transition-all hover:scale-[1.05] active:scale-[0.95] group relative overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${selectedPlanData?.accentColor || "#6366f1"} 0%, ${selectedPlanData?.accentColor || "#4f46e5"}cc 100%)`,
              boxShadow: `0 30px 60px ${selectedPlanData?.accentColor}30`
            }}
          >
            <div className="absolute inset-0 bg-white/10 group-hover:translate-x-full transition-transform duration-1000"></div>
            <span className="relative uppercase tracking-[0.4em] italic z-10">
              Initialize {selectedPlanData?.name}
            </span>
            <ArrowRight className="relative w-7 h-7 group-hover:translate-x-2 transition-transform z-10" />
          </button>

          {/* Trust Matrix */}
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 pt-12">
            {[
              { icon: Shield, label: "AES-512 NEURAL SHIELD", color: "text-indigo-400" },
              { icon: RefreshCw, label: "0% LATENCY GUARANTEE", color: "text-purple-400" },
              { icon: CreditCard, label: "NO CORE VALIDATION REQ.", color: "text-pink-400" }
            ].map((item, idx) => (
              <span key={idx} className="flex items-center gap-3 text-[9px] font-black tracking-[0.3em] text-slate-500 uppercase group hover:text-slate-300 transition-colors">
                <item.icon className={`w-4 h-4 ${item.color} group-hover:scale-110 transition-transform`} />
                {item.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanSelectionScreen;
