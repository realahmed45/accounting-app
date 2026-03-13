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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950 font-inter text-slate-300">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-slate-900/50 backdrop-blur-xl border-b border-white/5 px-4 sm:px-12 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <span className="text-white font-black text-xl">$</span>
          </div>
          <span className="font-black text-white text-xl tracking-tighter hidden sm:block uppercase">
            Weekly Accounting
          </span>
        </div>
        
        <div className="flex items-center gap-6">
          {userEmail && (
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-xs font-bold text-slate-400">{userEmail}</span>
            </div>
          )}
          {onSkip && (
            <button
              onClick={onSkip}
              className="text-sm text-slate-400 hover:text-white font-black tracking-widest uppercase transition-all flex items-center gap-2 group"
            >
              Skip
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-12 py-12 sm:py-20 relative z-10">
        {/* Header */}
        <div className="text-center mb-16 animate-fadeIn">
          <h1 className="text-4xl sm:text-6xl font-black text-white mb-6 tracking-tight">
            Elevate Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Financial Control</span>
          </h1>
          <p className="text-slate-400 text-lg sm:text-xl max-w-2xl mx-auto font-medium">
            Join 10,000+ professionals managing their businesses with precision.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center mt-10 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-1.5 shadow-2xl">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-8 py-3 rounded-xl text-sm font-black tracking-widest uppercase transition-all ${
                billingCycle === "monthly"
                  ? "bg-indigo-600 text-white shadow-lg"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={`px-8 py-3 rounded-xl text-sm font-black tracking-widest uppercase transition-all flex items-center gap-3 ${
                billingCycle === "yearly"
                  ? "bg-indigo-600 text-white shadow-lg"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Yearly
              <span
                className={`text-[10px] font-black px-2 py-0.5 rounded-full ${billingCycle === "yearly" ? "bg-white text-indigo-600" : "bg-indigo-500 text-white"}`}
              >
                SAVE 17%
              </span>
            </button>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {plans.map((plan, idx) => {
            const PlanIcon = plan.icon;
            const isSelected = selectedPlan === plan.id;
            const price = getDisplayPrice(plan);

            return (
              <div
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={`group relative flex flex-col glass-card p-8 cursor-pointer border-2 animate-scaleIn ${
                  isSelected
                    ? "border-indigo-500 bg-indigo-500/5 shadow-[0_0_40px_rgba(79,70,229,0.15)]"
                    : "border-white/5 hover:border-white/10"
                }`}
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] font-black px-4 py-1.5 rounded-bl-2xl uppercase tracking-widest shadow-lg">
                    {plan.badge}
                  </div>
                )}

                <div className="flex flex-col flex-1 relative z-10">
                  {/* Icon + name */}
                  <div className="mb-8">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 duration-500"
                      style={{ background: `${plan.accentColor}20` }}
                    >
                      <PlanIcon
                        className="w-7 h-7"
                        style={{ color: plan.accentColor }}
                      />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tighter">
                        {plan.name}
                      </h3>
                      <p className="text-sm text-slate-400 font-medium">
                        {plan.tagline}
                      </p>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mb-8">
                    <div className="flex items-end gap-2">
                      <span className="text-5xl font-black text-white leading-none tracking-tighter">
                        {price}
                      </span>
                      {typeof plan.perMonth[billingCycle] === "number" &&
                        plan.perMonth[billingCycle] > 0 && (
                          <span className="text-slate-500 font-black text-sm mb-1 uppercase tracking-widest">
                            / mo
                          </span>
                        )}
                    </div>
                    {billingCycle === "yearly" &&
                      typeof plan.price.yearly === "number" &&
                      plan.price.yearly > 0 && (
                        <p className="text-xs text-emerald-400 font-bold mt-3 uppercase tracking-wider">
                          Billed ${plan.price.yearly}/yr
                        </p>
                      )}
                  </div>

                  {/* Features */}
                  <ul className="space-y-4 flex-1 mb-10">
                    {plan.features.map((f, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-3 text-sm text-slate-300 font-medium"
                      >
                        <div className="mt-1 w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                          <Check className="w-2.5 h-2.5 text-emerald-500 stroke-[4px]" />
                        </div>
                        <span>{f}</span>
                      </li>
                    ))}
                    {plan.notIncluded.map((f, i) => (
                      <li
                        key={`no-${i}`}
                        className="flex items-start gap-3 text-sm text-slate-500 font-medium"
                      >
                        <div className="mt-1 w-4 h-4 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0">
                          <span className="text-[10px] font-black opacity-30">—</span>
                        </div>
                        <span className="opacity-50 line-through decoration-slate-600">{f}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Select button */}
                  <button
                    type="button"
                    className={`w-full py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                      isSelected
                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                        : "bg-white/5 text-slate-300 hover:bg-white/10 border border-white/5"
                    }`}
                  >
                    {isSelected ? "ACTIVE PLAN" : `CHOOSE ${plan.name}`}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="flex flex-col items-center gap-6 mt-10">
          <button
            onClick={handleContinue}
            className="flex items-center gap-4 px-12 py-5 rounded-2xl text-white font-black text-lg shadow-2xl transition-all hover:scale-[1.02] active:scale-[0.98] animate-slideUp group"
            style={{
              background: `linear-gradient(135deg, ${selectedPlanData?.accentColor || "#6366f1"} 0%, ${selectedPlanData?.accentColor || "#4f46e5"}cc 100%)`,
              boxShadow: `0 20px 40px ${selectedPlanData?.accentColor}30`
            }}
          >
            START WITH {selectedPlanData?.name.toUpperCase()}
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Trust row */}
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-[10px] font-black tracking-widest text-slate-500 uppercase">
            <span className="flex items-center gap-2 group hover:text-slate-400 transition-colors">
              <Shield className="w-4 h-4 text-emerald-500" /> AES-256 SECURE
            </span>
            <span className="flex items-center gap-2 group hover:text-slate-400 transition-colors">
              <RefreshCw className="w-4 h-4 text-indigo-500" /> NO COMMITMENT
            </span>
            <span className="flex items-center gap-2 group hover:text-slate-400 transition-colors">
              <CreditCard className="w-4 h-4 text-purple-500" /> NO CARD REQUIRED
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanSelectionScreen;
