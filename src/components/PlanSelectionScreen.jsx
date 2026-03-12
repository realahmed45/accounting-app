import React, { useState } from "react";
import {
  Check,
  X,
  Zap,
  Users,
  Database,
  Calendar,
  FileText,
  Shield,
  Sparkles,
  Crown,
  Rocket,
  Building2,
  ArrowRight,
  Info,
} from "lucide-react";

const PlanSelectionScreen = ({ onSelectPlan, onSkip, userEmail }) => {
  const [selectedPlan, setSelectedPlan] = useState("free");
  const [billingCycle, setBillingCycle] = useState("monthly");

  const plans = [
    {
      id: "free",
      name: "Starter",
      icon: Zap,
      color: "slate",
      gradient: "from-slate-600 to-slate-700",
      borderColor: "border-slate-300",
      price: { monthly: 0, yearly: 0 },
      description: "Perfect for individuals getting started",
      popular: false,
      features: [
        { text: "1 account/workspace", included: true },
        { text: "50 expenses per month", included: true },
        { text: "7-day expense history", included: true },
        { text: "Basic categories", included: true },
        { text: "Email support (48h)", included: true },
        { text: "Mobile web access", included: true },
        { text: "Team members", included: false },
        { text: "Advanced reports", included: false },
        { text: "Scheduling", included: false },
        { text: "API access", included: false },
      ],
      limits: "1 account • 50 expenses/month • 50MB storage",
    },
    {
      id: "professional",
      name: "Professional",
      icon: Sparkles,
      color: "purple",
      gradient: "from-purple-600 to-pink-600",
      borderColor: "border-purple-400",
      price: { monthly: 12, yearly: 120 },
      description: "For freelancers and solopreneurs",
      popular: true,
      features: [
        { text: "5 accounts/workspaces", included: true },
        { text: "Unlimited expenses", included: true },
        { text: "Unlimited history", included: true },
        { text: "3 team members", included: true },
        { text: "Custom categories & tags", included: true },
        { text: "Photo storage (500MB)", included: true },
        { text: "Basic scheduling (50 shifts/month)", included: true },
        { text: "Email + chat support (24h)", included: true },
        { text: "Export to CSV/PDF", included: true },
        { text: "Bulk operations", included: true },
        { text: "Advanced reports", included: false },
        { text: "API access", included: false },
      ],
      limits: "5 accounts • Unlimited expenses • 500MB storage",
      savingsYearly: "$24 (2 months free)",
    },
    {
      id: "business",
      name: "Business",
      icon: Building2,
      color: "emerald",
      gradient: "from-emerald-600 to-teal-600",
      borderColor: "border-emerald-400",
      price: { monthly: 29, yearly: 290 },
      description: "For growing teams and businesses",
      popular: false,
      features: [
        { text: "20 accounts/workspaces", included: true },
        { text: "Unlimited everything", included: true },
        { text: "Unlimited team members", included: true },
        { text: "Advanced scheduling (unlimited)", included: true },
        { text: "Photo storage (2GB)", included: true },
        { text: "Overtime & shift management", included: true },
        { text: "Advanced reports & analytics", included: true },
        { text: "Priority support (12h)", included: true },
        { text: "API access (10,000 calls/month)", included: true },
        { text: "Custom branding", included: true },
        { text: "Bulk operations", included: true },
        { text: "Advanced exports (Excel, QuickBooks)", included: true },
      ],
      limits: "20 accounts • Unlimited • 2GB storage",
      savingsYearly: "$58 (2 months free)",
    },
    {
      id: "enterprise",
      name: "Enterprise",
      icon: Crown,
      color: "amber",
      gradient: "from-amber-600 to-orange-600",
      borderColor: "border-amber-400",
      price: { monthly: 79, yearly: "Custom" },
      description: "For large organizations",
      popular: false,
      features: [
        { text: "Unlimited everything", included: true },
        { text: "White-label option", included: true },
        { text: "Dedicated account manager", included: true },
        { text: "Phone support (2h response)", included: true },
        { text: "Custom integrations", included: true },
        { text: "Advanced API access (unlimited)", included: true },
        { text: "SOC 2 compliance reports", included: true },
        { text: "Custom contracts", included: true },
        { text: "On-premise deployment option", included: true },
        { text: "SSO & advanced security", included: true },
        { text: "Custom data retention", included: true },
        { text: "99.99% SLA guarantee", included: true },
      ],
      limits: "Unlimited everything • Dedicated support",
      savingsYearly: "Custom pricing available",
    },
  ];

  const handleContinue = () => {
    onSelectPlan(selectedPlan);
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-y-auto z-50">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-20 right-20 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/5 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8 sm:py-12">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12 animate-fadeIn">
          <div className="inline-flex items-center justify-center gap-3 mb-4">
            <Rocket className="w-12 h-12 text-purple-400" />
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white">
              Choose Your Plan
            </h1>
          </div>
          <p className="text-slate-300 text-lg sm:text-xl max-w-2xl mx-auto mb-6">
            Select the perfect plan for your needs. Upgrade or downgrade
            anytime.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-4">
            <span
              className={`text-sm font-semibold ${billingCycle === "monthly" ? "text-white" : "text-slate-400"}`}
            >
              Monthly
            </span>
            <button
              onClick={() =>
                setBillingCycle(
                  billingCycle === "monthly" ? "yearly" : "monthly",
                )
              }
              className="relative w-16 h-8 bg-slate-700 rounded-full transition-colors hover:bg-slate-600"
            >
              <div
                className={`absolute w-6 h-6 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full top-1 transition-all ${billingCycle === "yearly" ? "left-9" : "left-1"}`}
              ></div>
            </button>
            <span
              className={`text-sm font-semibold ${billingCycle === "yearly" ? "text-white" : "text-slate-400"}`}
            >
              Yearly
            </span>
            {billingCycle === "yearly" && (
              <span className="ml-2 px-3 py-1 bg-emerald-600 text-white text-xs font-bold rounded-full animate-pulse">
                Save up to 17%
              </span>
            )}
          </div>

          {userEmail && (
            <p className="text-slate-400 text-sm">
              Setting up plan for{" "}
              <span className="text-white font-semibold">{userEmail}</span>
            </p>
          )}
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 animate-slideUp">
          {plans.map((plan) => {
            const PlanIcon = plan.icon;
            const isSelected = selectedPlan === plan.id;
            const price =
              billingCycle === "monthly"
                ? plan.price.monthly
                : plan.price.yearly;
            const priceDisplay =
              typeof price === "number" ? `$${price}` : price;
            const priceLabel = billingCycle === "monthly" ? "/mo" : "/yr";

            return (
              <div
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={`relative bg-white/95 backdrop-blur-xl rounded-2xl p-6 cursor-pointer transition-all hover:scale-105 hover:shadow-2xl ${
                  isSelected
                    ? `ring-4 ring-${plan.color}-500 shadow-2xl scale-105`
                    : "ring-2 ring-slate-200 hover:ring-slate-300"
                } ${plan.popular ? "lg:-mt-4 lg:mb-0" : ""}`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1 rounded-full text-xs font-bold shadow-lg animate-bounce">
                    ⭐ MOST POPULAR
                  </div>
                )}

                {/* Selected Checkmark */}
                {isSelected && (
                  <div
                    className={`absolute -top-3 -right-3 w-10 h-10 bg-gradient-to-r ${plan.gradient} rounded-full flex items-center justify-center shadow-lg animate-scaleIn`}
                  >
                    <Check className="w-6 h-6 text-white" />
                  </div>
                )}

                {/* Plan Header */}
                <div className="text-center mb-6">
                  <div
                    className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${plan.gradient} rounded-2xl mb-4 shadow-lg`}
                  >
                    <PlanIcon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-sm text-slate-600 mb-4">
                    {plan.description}
                  </p>

                  {/* Price */}
                  <div className="mb-2">
                    <span className="text-5xl font-black text-slate-900">
                      {priceDisplay}
                    </span>
                    {typeof price === "number" && (
                      <span className="text-slate-600 text-lg">
                        {priceLabel}
                      </span>
                    )}
                  </div>
                  {billingCycle === "yearly" && plan.savingsYearly && (
                    <p className="text-xs text-emerald-600 font-bold">
                      💰 {plan.savingsYearly}
                    </p>
                  )}
                </div>

                {/* Features */}
                <div className="space-y-2 mb-6">
                  {plan.features.slice(0, 6).map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      {feature.included ? (
                        <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      ) : (
                        <X className="w-4 h-4 text-slate-300 flex-shrink-0 mt-0.5" />
                      )}
                      <span
                        className={`text-sm ${feature.included ? "text-slate-700 font-medium" : "text-slate-400"}`}
                      >
                        {feature.text}
                      </span>
                    </div>
                  ))}
                  {plan.features.length > 6 && (
                    <p className="text-xs text-slate-500 italic mt-2">
                      + {plan.features.length - 6} more features...
                    </p>
                  )}
                </div>

                {/* Limits */}
                <div className="pt-4 border-t border-slate-200">
                  <p className="text-xs text-slate-500 text-center">
                    {plan.limits}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {onSkip && (
            <button
              onClick={onSkip}
              className="px-8 py-4 bg-slate-700 text-white rounded-xl font-bold hover:bg-slate-600 transition-all"
            >
              Skip for Now
            </button>
          )}
          <button
            onClick={handleContinue}
            className="px-12 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-2 text-lg"
          >
            Continue with {plans.find((p) => p.id === selectedPlan)?.name}
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* Trust Indicators */}
        <div className="mt-12 flex items-center justify-center gap-8 text-slate-400 text-sm flex-wrap">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            <span>Secure Payments</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5" />
            <span>Cancel Anytime</span>
          </div>
          <div className="flex items-center gap-2">
            <Info className="w-5 h-5" />
            <span>No Credit Card Required for Free Plan</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanSelectionScreen;
