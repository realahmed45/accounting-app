import { useState, useEffect } from "react";
import { Check, X, Zap, Loader } from "lucide-react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

const PlanSelectionPage = () => {
  const [plans, setPlans] = useState([]);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPlansAndSubscription();
  }, []);

  const fetchPlansAndSubscription = async () => {
    try {
      const [plansRes, subRes] = await Promise.all([
        api.get("/subscription/plans"),
        api.get("/subscription"),
      ]);

      setPlans(plansRes.data.data);
      setCurrentSubscription(subRes.data.data);
    } catch (error) {
      console.error("Failed to load plans:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planName) => {
    try {
      setSubscribing(planName);

      await api.post("/subscription/subscribe", {
        planName,
        billingCycle: "monthly",
      });

      // Refresh subscription data
      await fetchPlansAndSubscription();

      // Show success message
      alert(`Successfully subscribed to ${planName} plan!`);

      // Navigate to dashboard
      setTimeout(() => navigate("/dashboard"), 1000);
    } catch (error) {
      console.error("Subscription error:", error);
      alert(error.response?.data?.message || "Failed to subscribe");
    } finally {
      setSubscribing(null);
    }
  };

  const getPlanColor = (planName) => {
    const colors = {
      free: "border-gray-300 bg-white",
      professional: "border-blue-500 bg-blue-50",
      business: "border-purple-500 bg-purple-50",
      enterprise: "border-yellow-500 bg-yellow-50",
    };
    return colors[planName] || colors.free;
  };

  const getPlanBadge = (planName) => {
    const badges = {
      professional: { text: "Popular", color: "bg-blue-500" },
      business: { text: "Best Value", color: "bg-purple-500" },
      enterprise: { text: "Ultimate", color: "bg-yellow-500" },
    };
    return badges[planName];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600">
            Select the perfect plan for your accounting needs
          </p>
          {currentSubscription && (
            <div className="mt-4 inline-block px-4 py-2 bg-white rounded-full shadow-sm">
              <span className="text-sm text-gray-600">Current plan: </span>
              <span className="font-semibold text-gray-900 capitalize">
                {currentSubscription.currentPlan}
              </span>
            </div>
          )}
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {plans.map((plan) => {
            const isCurrentPlan =
              currentSubscription?.currentPlan === plan.name;
            const badge = getPlanBadge(plan.name);

            return (
              <div
                key={plan.name}
                className={`relative rounded-2xl border-2 p-8 shadow-lg transition-transform hover:scale-105 ${getPlanColor(
                  plan.name,
                )}`}
              >
                {/* Badge */}
                {badge && (
                  <div
                    className={`absolute -top-4 left-1/2 transform -translate-x-1/2 ${badge.color} text-white px-4 py-1 rounded-full text-sm font-semibold`}
                  >
                    {badge.text}
                  </div>
                )}

                {/* Plan Name */}
                <h3 className="text-2xl font-bold text-gray-900 capitalize mb-2">
                  {plan.name}
                </h3>

                {/* Price */}
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">
                    ${plan.monthlyPrice}
                  </span>
                  <span className="text-gray-600">/month</span>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Limits */}
                {plan.limits && (
                  <div className="mb-6 p-4 bg-white bg-opacity-50 rounded-lg">
                    <h4 className="font-semibold text-sm text-gray-700 mb-2">
                      Limits:
                    </h4>
                    <ul className="space-y-1 text-xs text-gray-600">
                      {plan.limits.expensesPerMonth !==
                        Number.MAX_SAFE_INTEGER && (
                        <li>• {plan.limits.expensesPerMonth} expenses/month</li>
                      )}
                      {plan.limits.expensesPerMonth ===
                        Number.MAX_SAFE_INTEGER && (
                        <li>• Unlimited expenses</li>
                      )}
                      <li>• {plan.limits.accounts} accounts</li>
                      {plan.limits.teamMembers !== Number.MAX_SAFE_INTEGER && (
                        <li>• {plan.limits.teamMembers} team members</li>
                      )}
                      {plan.limits.teamMembers === Number.MAX_SAFE_INTEGER && (
                        <li>• Unlimited team members</li>
                      )}
                      <li>• {plan.limits.storageGB}GB storage</li>
                    </ul>
                  </div>
                )}

                {/* CTA Button */}
                {isCurrentPlan ? (
                  <button
                    disabled
                    className="w-full py-3 px-6 rounded-lg bg-gray-300 text-gray-600 font-semibold cursor-not-allowed"
                  >
                    Current Plan
                  </button>
                ) : (
                  <button
                    onClick={() => handleSubscribe(plan.name)}
                    disabled={subscribing !== null}
                    className="w-full py-3 px-6 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {subscribing === plan.name ? (
                      <>
                        <Loader className="w-5 h-5 animate-spin mr-2" />
                        Subscribing...
                      </>
                    ) : plan.name === "free" ? (
                      "Downgrade to Free"
                    ) : (
                      <>
                        <Zap className="w-5 h-5 mr-2" />
                        {currentSubscription ? "Upgrade" : "Get Started"}
                      </>
                    )}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-6 shadow">
              <h3 className="font-semibold text-gray-900 mb-2">
                Can I change my plan later?
              </h3>
              <p className="text-gray-600">
                Yes! You can upgrade or downgrade your plan at any time. Changes
                take effect immediately.
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow">
              <h3 className="font-semibold text-gray-900 mb-2">
                What happens if I exceed my limits?
              </h3>
              <p className="text-gray-600">
                You'll receive a notification when approaching your limits. You
                can upgrade to continue or wait until the next billing cycle.
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow">
              <h3 className="font-semibold text-gray-900 mb-2">
                Is there a free trial?
              </h3>
              <p className="text-gray-600">
                The free plan is always available with no time limit. Paid plans
                start immediately with full features.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanSelectionPage;
