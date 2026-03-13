import { X, Zap, Check } from "lucide-react";

const UpgradePrompt = ({ feature, requiredPlan = "professional", onClose }) => {
  const handleUpgradeClick = () => {
    // For now, just show an alert. In production, this would open a payment modal or redirect to billing
    alert(
      "Upgrade functionality coming soon! Contact support to upgrade your plan.",
    );
    onClose();
  };

  const planBenefits = {
    professional: [
      "Unlimited expenses",
      "Advanced reports & analytics",
      "Data export (CSV, JSON)",
      "5 accounts",
      "3 team members",
    ],
    business: [
      "Everything in Professional",
      "20 accounts",
      "Unlimited team members",
      "Bulk operations",
      "Advanced budgeting",
      "Priority support",
    ],
    enterprise: [
      "Everything in Business",
      "Unlimited accounts",
      "API access",
      "White-label options",
      "SSO & advanced security",
      "Dedicated support",
    ],
  };

  const planColors = {
    professional: "from-blue-600 to-blue-700",
    business: "from-purple-600 to-purple-700",
    enterprise: "from-yellow-600 to-yellow-700",
  };

  return (
    <div className="glass-modal-backdrop z-[100] animate-fadeIn">
      <div className="glass-modal-content max-w-sm animate-zoomIn overflow-hidden">
        {/* Header */}
        <div
          className={`p-8 text-white relative bg-gradient-to-br ${
            planColors[requiredPlan] || planColors.professional
          } shadow-[inset_0_0_50px_rgba(255,255,255,0.1)]`}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-4 mb-6">
            <div className="p-4 bg-white/10 backdrop-blur-xl rounded-[2rem] border border-white/20 shadow-2xl animate-float">
              <Zap className="w-8 h-8 text-white fill-white/20" />
            </div>
          </div>

          <h2 className="text-3xl font-black italic tracking-widest uppercase">
            Evolution
          </h2>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80 mt-1">
            System Upgrade Required
          </p>
          
          <div className="mt-6 pt-6 border-t border-white/10">
            <p className="text-sm font-bold leading-relaxed opacity-90">
              {feature
                ? `The "${feature}" protocol requires <span className="text-white underline decoration-white/30 decoration-2 underline-offset-4">${requiredPlan.toUpperCase()}</span> clearance.`
                : `Elevate your neural throughput to the ${requiredPlan} tier.`}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="glass-modal-body space-y-8">
          <div>
            <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-6">
              Clearance Benefits
            </h3>
            <ul className="space-y-4">
              {planBenefits[requiredPlan]?.map((benefit, index) => (
                <li key={index} className="flex items-center gap-4 group">
                  <div className="p-1.5 bg-emerald-500/20 rounded-lg group-hover:bg-emerald-500 transition-colors">
                    <Check className="w-3 h-3 text-emerald-400 group-hover:text-white" />
                  </div>
                  <span className="text-slate-300 font-bold text-xs uppercase tracking-wider">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-4">
            <button
              onClick={handleUpgradeClick}
              className={`w-full py-5 rounded-2xl bg-gradient-to-r ${
                planColors[requiredPlan] || planColors.professional
              } text-white font-black text-[10px] tracking-[0.3em] uppercase transition-all hover:scale-[1.02] active:scale-[0.98] shadow-2xl flex items-center justify-center gap-2`}
            >
              <Zap className="w-4 h-4 fill-white" />
              Upgrade Matrix
            </button>
            <button
              onClick={onClose}
              className="w-full py-4 bg-white/5 border border-white/5 text-slate-500 hover:text-white rounded-2xl font-black text-[10px] tracking-[0.3em] uppercase transition-all"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpgradePrompt;
