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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-50">
      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 sm:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
            <span className="text-white font-black text-sm">$</span>
          </div>
          <span className="font-bold text-gray-900 text-lg hidden sm:block">
            Weekly Accounting
          </span>
        </div>
        {userEmail && (
          <p className="text-sm text-gray-500 hidden sm:block">
            <span className="font-medium text-gray-700">{userEmail}</span>
          </p>
        )}
        {onSkip && (
          <button
            onClick={onSkip}
            className="text-sm text-gray-500 hover:text-gray-700 font-medium transition-colors flex items-center gap-1"
          >
            Skip for now <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-10">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-3 tracking-tight">
            Pick the right plan for you
          </h1>
          <p className="text-gray-500 text-base sm:text-lg max-w-xl mx-auto">
            Start free, upgrade when you need more. Cancel anytime.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center mt-6 bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                billingCycle === "monthly"
                  ? "bg-gray-900 text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5 ${
                billingCycle === "yearly"
                  ? "bg-gray-900 text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Yearly
              <span
                className={`text-xs font-bold px-1.5 py-0.5 rounded-md ${billingCycle === "yearly" ? "bg-emerald-500 text-white" : "bg-emerald-100 text-emerald-700"}`}
              >
                -17%
              </span>
            </button>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5 mb-8">
          {plans.map((plan) => {
            const PlanIcon = plan.icon;
            const isSelected = selectedPlan === plan.id;
            const price = getDisplayPrice(plan);

            return (
              <div
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={`relative flex flex-col bg-white rounded-2xl cursor-pointer transition-all duration-200 overflow-hidden ${
                  isSelected
                    ? "ring-2 ring-violet-600 shadow-xl shadow-violet-100"
                    : "ring-1 ring-gray-200 shadow-sm hover:shadow-md hover:ring-gray-300"
                } ${plan.popular ? "sm:-mt-2" : ""}`}
              >
                {/* Popular ribbon */}
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-violet-600 text-white text-xs font-bold px-3 py-1 rounded-bl-xl">
                    {plan.badge}
                  </div>
                )}

                {/* Top accent bar */}
                <div
                  className="h-1.5 w-full"
                  style={{ background: plan.accentColor }}
                />

                <div className="p-5 flex flex-col flex-1">
                  {/* Icon + name */}
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: `${plan.accentColor}18` }}
                    >
                      <PlanIcon
                        className="w-5 h-5"
                        style={{ color: plan.accentColor }}
                      />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-gray-900 text-base leading-tight">
                        {plan.name}
                      </h3>
                      <p className="text-xs text-gray-500 leading-tight">
                        {plan.tagline}
                      </p>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mb-5">
                    <div className="flex items-end gap-1">
                      <span className="text-4xl font-black text-gray-900 leading-none">
                        {price}
                      </span>
                      {typeof plan.perMonth[billingCycle] === "number" &&
                        plan.perMonth[billingCycle] > 0 && (
                          <span className="text-gray-400 text-sm mb-0.5">
                            /mo
                          </span>
                        )}
                    </div>
                    {billingCycle === "yearly" &&
                      typeof plan.price.yearly === "number" &&
                      plan.price.yearly > 0 && (
                        <p className="text-xs text-emerald-600 font-semibold mt-1">
                          Billed ${plan.price.yearly}/yr · saves $
                          {(plan.perMonth.monthly - plan.perMonth.yearly) * 12}
                          /yr
                        </p>
                      )}
                    {plan.price.monthly === 0 && (
                      <p className="text-xs text-gray-400 mt-1">
                        No credit card required
                      </p>
                    )}
                  </div>

                  {/* Divider */}
                  <div className="border-t border-gray-100 mb-4" />

                  {/* Features */}
                  <ul className="space-y-2 flex-1">
                    {plan.features.map((f, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm text-gray-700"
                      >
                        <Check
                          className="w-4 h-4 flex-shrink-0 mt-0.5"
                          style={{ color: plan.accentColor }}
                        />
                        <span>{f}</span>
                      </li>
                    ))}
                    {plan.notIncluded.map((f, i) => (
                      <li
                        key={`no-${i}`}
                        className="flex items-start gap-2 text-sm text-gray-400"
                      >
                        <span className="w-4 h-4 flex-shrink-0 mt-0.5 flex items-center justify-center font-bold text-xs">
                          —
                        </span>
                        <span className="line-through">{f}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Select button */}
                  <div className="mt-5">
                    <button
                      type="button"
                      className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all ${
                        isSelected
                          ? "text-white shadow-md"
                          : "text-gray-700 bg-gray-100 hover:bg-gray-200"
                      }`}
                      style={isSelected ? { background: plan.accentColor } : {}}
                    >
                      {isSelected ? (
                        <span className="flex items-center justify-center gap-1.5">
                          <Check className="w-4 h-4" /> Selected
                        </span>
                      ) : (
                        `Choose ${plan.name}`
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="flex flex-col items-center gap-3">
          <button
            onClick={handleContinue}
            className="flex items-center gap-2.5 px-8 py-4 rounded-2xl text-white font-bold text-base shadow-lg transition-all hover:opacity-90 hover:shadow-xl active:scale-95"
            style={{
              background: selectedPlanData?.accentColor || "#7c3aed",
            }}
          >
            {selectedPlanData?.cta || "Continue"}
            <span className="font-normal opacity-90">
              with {selectedPlanData?.name}
            </span>
            <ArrowRight className="w-5 h-5" />
          </button>

          {/* Trust row */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-2 text-xs text-gray-400">
            <span className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" /> Secure checkout
            </span>
            <span className="flex items-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5" /> Cancel anytime
            </span>
            <span className="flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5" /> No card needed for free
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanSelectionScreen;
