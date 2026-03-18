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
      <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Monthly Usage
          </span>
          {expensesPercentage >= 90 && (
            <AlertCircle className="w-4 h-4 text-red-500" />
          )}
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${getProgressColor(
              expensesPercentage,
            )}`}
            style={{ width: `${Math.min(expensesPercentage, 100)}%` }}
          ></div>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {usage.usage.expensesThisMonth} /{" "}
          {usage.limits.expensesPerMonth === Number.MAX_SAFE_INTEGER
            ? "∞"
            : usage.limits.expensesPerMonth}{" "}
          expenses
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Usage This Month</h3>
        <TrendingUp className="w-5 h-5 text-gray-400" />
      </div>

      <div className="space-y-4">
        {/* Expenses */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-gray-600">Expenses</span>
            <span className="text-sm font-semibold text-gray-900">
              {usage.usage.expensesThisMonth} /{" "}
              {usage.limits.expensesPerMonth === Number.MAX_SAFE_INTEGER
                ? "∞"
                : usage.limits.expensesPerMonth}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${getProgressColor(
                expensesPercentage,
              )}`}
              style={{ width: `${Math.min(expensesPercentage, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Storage */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-gray-600">Storage</span>
            <span className="text-sm font-semibold text-gray-900">
              {(usage.usage.storageUsedMB / 1024).toFixed(1)}GB /{" "}
              {usage.limits.storageGB}GB
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
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
        </div>
      </div>

      {expensesPercentage >= 90 && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-red-800">
                Approaching Limit
              </p>
              <p className="text-xs text-red-600 mt-1">
                You're using {expensesPercentage}% of your monthly expense
                limit. Consider upgrading your plan.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsageMeter;
