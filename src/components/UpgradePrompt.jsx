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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div
          className={`bg-gradient-to-r ${
            planColors[requiredPlan] || planColors.professional
          } p-6 text-white relative`}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
          <Zap className="w-12 h-12 mb-3" />
          <h2 className="text-2xl font-bold mb-2">Upgrade Required</h2>
          <p className="text-blue-100">
            {feature
              ? `${feature} is available on ${requiredPlan} plan and above`
              : `Upgrade to ${requiredPlan} for premium features`}
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          <h3 className="font-semibold text-gray-900 mb-4 capitalize">
            {requiredPlan} Plan Includes:
          </h3>
          <ul className="space-y-3 mb-6">
            {planBenefits[requiredPlan]?.map((benefit, index) => (
              <li key={index} className="flex items-start">
                <Check className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                <span className="text-gray-700">{benefit}</span>
              </li>
            ))}
          </ul>

          {/* CTA Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleUpgradeClick}
              className={`w-full py-3 px-6 bg-gradient-to-r ${
                planColors[requiredPlan] || planColors.professional
              } text-white rounded-lg hover:opacity-90 transition-all font-semibold flex items-center justify-center`}
            >
              <Zap className="w-5 h-5 mr-2" />
              View Plans & Upgrade
            </button>
            <button
              onClick={onClose}
              className="w-full py-3 px-6 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all font-semibold"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpgradePrompt;
