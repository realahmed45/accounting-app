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
      <div className="flex items-center justify-center p-12">
        <Loader className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="p-6 bg-yellow-50 rounded-lg border border-yellow-200">
        <AlertCircle className="w-6 h-6 text-yellow-600 mb-2" />
        <p className="text-yellow-800">No subscription found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          Subscription & Usage
        </h2>
        <button
          onClick={() => navigate("/plans")}
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all flex items-center"
        >
          <Zap className="w-4 h-4 mr-2" />
          Upgrade Plan
        </button>
      </div>

      {/* Current Plan Card */}
      <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl p-8 text-white shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-blue-100 mb-1">Current Plan</p>
            <h3 className="text-3xl font-bold capitalize">
              {subscription.currentPlan}
            </h3>
          </div>
          <Package className="w-12 h-12 opacity-80" />
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <p className="text-blue-100 text-sm mb-1">Status</p>
            <div className="flex items-center">
              {subscription.status === "active" ? (
                <>
                  <CheckCircle className="w-5 h-5 mr-2" />
                  <span className="font-semibold">Active</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-5 h-5 mr-2" />
                  <span className="font-semibold capitalize">
                    {subscription.status}
                  </span>
                </>
              )}
            </div>
          </div>

          <div>
            <p className="text-blue-100 text-sm mb-1">Billing Cycle</p>
            <div className="flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              <span className="font-semibold capitalize">
                {subscription.billingCycle}
              </span>
            </div>
          </div>

          <div>
            <p className="text-blue-100 text-sm mb-1">Next Billing</p>
            <p className="font-semibold">
              {formatDate(subscription.currentPeriodEnd)}
            </p>
          </div>
        </div>

        {subscription.currentPlan !== "free" && (
          <div className="mt-6 pt-6 border-t border-white border-opacity-20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Payment Method</p>
                <p className="font-semibold">
                  {subscription.paymentMethod || "None"}
                </p>
              </div>
              <button className="px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-all">
                <CreditCard className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Usage Stats */}
      {usage && (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Expenses Usage */}
          <div className="bg-white rounded-lg p-6 shadow-md border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-gray-700">Expenses</h4>
              <TrendingUp className="w-5 h-5 text-gray-400" />
            </div>
            <div className="mb-2">
              <div className="flex items-baseline">
                <span className="text-3xl font-bold text-gray-900">
                  {usage.usage.expensesThisMonth}
                </span>
                <span className="text-gray-500 ml-2">
                  /{" "}
                  {usage.limits.expensesPerMonth === Number.MAX_SAFE_INTEGER
                    ? "∞"
                    : usage.limits.expensesPerMonth}
                </span>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div
                className={`h-2 rounded-full transition-all ${getProgressColor(
                  getUsagePercentage(
                    usage.usage.expensesThisMonth,
                    usage.limits.expensesPerMonth,
                  ),
                )}`}
                style={{
                  width: `${Math.min(
                    getUsagePercentage(
                      usage.usage.expensesThisMonth,
                      usage.limits.expensesPerMonth,
                    ),
                    100,
                  )}%`,
                }}
              ></div>
            </div>
            <p
              className={`text-xs font-semibold px-2 py-1 rounded inline-block ${getUsageColor(
                getUsagePercentage(
                  usage.usage.expensesThisMonth,
                  usage.limits.expensesPerMonth,
                ),
              )}`}
            >
              {getUsagePercentage(
                usage.usage.expensesThisMonth,
                usage.limits.expensesPerMonth,
              )}
              % used
            </p>
          </div>

          {/* Accounts Usage */}
          <div className="bg-white rounded-lg p-6 shadow-md border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-gray-700">Accounts</h4>
              <Package className="w-5 h-5 text-gray-400" />
            </div>
            <div className="mb-2">
              <div className="flex items-baseline">
                <span className="text-3xl font-bold text-gray-900">
                  {usage.usage.accountsCount}
                </span>
                <span className="text-gray-500 ml-2">
                  / {usage.limits.accounts}
                </span>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div
                className={`h-2 rounded-full transition-all ${getProgressColor(
                  getUsagePercentage(
                    usage.usage.accountsCount,
                    usage.limits.accounts,
                  ),
                )}`}
                style={{
                  width: `${Math.min(
                    getUsagePercentage(
                      usage.usage.accountsCount,
                      usage.limits.accounts,
                    ),
                    100,
                  )}%`,
                }}
              ></div>
            </div>
            <p
              className={`text-xs font-semibold px-2 py-1 rounded inline-block ${getUsageColor(
                getUsagePercentage(
                  usage.usage.accountsCount,
                  usage.limits.accounts,
                ),
              )}`}
            >
              {getUsagePercentage(
                usage.usage.accountsCount,
                usage.limits.accounts,
              )}
              % used
            </p>
          </div>

          {/* Team Members Usage */}
          <div className="bg-white rounded-lg p-6 shadow-md border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-gray-700">Team Members</h4>
              <TrendingUp className="w-5 h-5 text-gray-400" />
            </div>
            <div className="mb-2">
              <div className="flex items-baseline">
                <span className="text-3xl font-bold text-gray-900">
                  {usage.usage.teamMembersCount}
                </span>
                <span className="text-gray-500 ml-2">
                  /{" "}
                  {usage.limits.teamMembers === Number.MAX_SAFE_INTEGER
                    ? "∞"
                    : usage.limits.teamMembers}
                </span>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div
                className={`h-2 rounded-full transition-all ${getProgressColor(
                  getUsagePercentage(
                    usage.usage.teamMembersCount,
                    usage.limits.teamMembers,
                  ),
                )}`}
                style={{
                  width: `${Math.min(
                    getUsagePercentage(
                      usage.usage.teamMembersCount,
                      usage.limits.teamMembers,
                    ),
                    100,
                  )}%`,
                }}
              ></div>
            </div>
            <p
              className={`text-xs font-semibold px-2 py-1 rounded inline-block ${getUsageColor(
                getUsagePercentage(
                  usage.usage.teamMembersCount,
                  usage.limits.teamMembers,
                ),
              )}`}
            >
              {getUsagePercentage(
                usage.usage.teamMembersCount,
                usage.limits.teamMembers,
              )}
              % used
            </p>
          </div>

          {/* Storage Usage */}
          <div className="bg-white rounded-lg p-6 shadow-md border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-gray-700">Storage</h4>
              <Package className="w-5 h-5 text-gray-400" />
            </div>
            <div className="mb-2">
              <div className="flex items-baseline">
                <span className="text-3xl font-bold text-gray-900">
                  {(usage.usage.storageUsedMB / 1024).toFixed(1)}
                </span>
                <span className="text-gray-500 ml-2">
                  / {usage.limits.storageGB}GB
                </span>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div
                className={`h-2 rounded-full transition-all ${getProgressColor(
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
            <p
              className={`text-xs font-semibold px-2 py-1 rounded inline-block ${getUsageColor(
                getUsagePercentage(
                  usage.usage.storageUsedMB,
                  usage.limits.storageGB * 1024,
                ),
              )}`}
            >
              {getUsagePercentage(
                usage.usage.storageUsedMB,
                usage.limits.storageGB * 1024,
              )}
              % used
            </p>
          </div>
        </div>
      )}

      {/* Feature List */}
      <div className="bg-white rounded-lg p-6 shadow-md border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Your Plan Features
        </h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subscription.features &&
            Object.entries(subscription.features).map(([feature, enabled]) => (
              <div
                key={feature}
                className="flex items-center p-3 rounded-lg bg-gray-50"
              >
                {enabled ? (
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-gray-300 mr-3" />
                )}
                <span
                  className={`text-sm ${
                    enabled ? "text-gray-900" : "text-gray-400"
                  }`}
                >
                  {feature
                    .replace(/([A-Z])/g, " $1")
                    .replace(/^./, (str) => str.toUpperCase())}
                </span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionDashboard;
