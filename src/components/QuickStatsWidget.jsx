import React, { useMemo } from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Activity,
  Target,
  Award,
  AlertCircle,
} from "lucide-react";

const QuickStatsWidget = ({ expenses = [], weekDates }) => {
  const stats = useMemo(() => {
    if (!expenses || expenses.length === 0) {
      return {
        totalSpent: 0,
        avgDaily: 0,
        largestExpense: null,
        topCategory: null,
        trend: "neutral",
        expenseCount: 0,
      };
    }

    // Calculate total
    const total = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);

    // Calculate daily average
    const daysWithExpenses = new Set(
      expenses.map((e) => {
        const date = new Date(e.date);
        return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      }),
    ).size;
    const avgDaily = daysWithExpenses > 0 ? total / daysWithExpenses : 0;

    // Find largest expense
    const largest = expenses.reduce(
      (max, e) => (Number(e.amount || 0) > Number(max?.amount || 0) ? e : max),
      expenses[0],
    );

    // Find top category
    const categoryTotals = {};
    expenses.forEach((e) => {
      const cat = e.category || "Uncategorized";
      categoryTotals[cat] = (categoryTotals[cat] || 0) + Number(e.amount || 0);
    });
    const topCat = Object.entries(categoryTotals).sort(
      (a, b) => b[1] - a[1],
    )[0];

    // Calculate trend (compare first half vs second half of week)
    const midpoint = Math.floor(expenses.length / 2);
    const firstHalf = expenses.slice(0, midpoint);
    const secondHalf = expenses.slice(midpoint);
    const firstHalfTotal = firstHalf.reduce(
      (sum, e) => sum + Number(e.amount || 0),
      0,
    );
    const secondHalfTotal = secondHalf.reduce(
      (sum, e) => sum + Number(e.amount || 0),
      0,
    );
    const trend =
      secondHalfTotal > firstHalfTotal
        ? "up"
        : secondHalfTotal < firstHalfTotal
          ? "down"
          : "neutral";

    return {
      totalSpent: total,
      avgDaily,
      largestExpense: largest,
      topCategory: topCat ? { name: topCat[0], total: topCat[1] } : null,
      trend,
      expenseCount: expenses.length,
    };
  }, [expenses]);

  const trendPercentage = useMemo(() => {
    if (!expenses || expenses.length < 2) return 0;
    const midpoint = Math.floor(expenses.length / 2);
    const firstHalf = expenses.slice(0, midpoint);
    const secondHalf = expenses.slice(midpoint);
    const firstHalfTotal = firstHalf.reduce(
      (sum, e) => sum + Number(e.amount || 0),
      0,
    );
    const secondHalfTotal = secondHalf.reduce(
      (sum, e) => sum + Number(e.amount || 0),
      0,
    );
    if (firstHalfTotal === 0) return 0;
    return ((secondHalfTotal - firstHalfTotal) / firstHalfTotal) * 100;
  }, [expenses]);

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-6 mb-6 shadow-2xl border-2 border-slate-700">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-3 rounded-xl shadow-lg">
          <Activity className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-2xl font-black text-white">Quick Stats</h3>
          <p className="text-slate-400 text-sm font-medium">
            This week's financial overview
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Average Daily Spending */}
        <div className="bg-slate-800/50 backdrop-blur-sm border-2 border-slate-700 p-5 rounded-2xl hover:scale-105 transition-all hover:border-blue-500 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-2.5 rounded-lg">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            {stats.trend === "up" ? (
              <TrendingUp className="w-5 h-5 text-red-400" />
            ) : stats.trend === "down" ? (
              <TrendingDown className="w-5 h-5 text-emerald-400" />
            ) : (
              <Activity className="w-5 h-5 text-slate-400" />
            )}
          </div>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">
            Avg Daily Spend
          </p>
          <p className="text-3xl font-black text-white mb-1">
            ${stats.avgDaily.toFixed(2)}
          </p>
          {trendPercentage !== 0 && (
            <p
              className={`text-xs font-semibold ${
                trendPercentage > 0 ? "text-red-400" : "text-emerald-400"
              }`}
            >
              {trendPercentage > 0 ? "+" : ""}
              {trendPercentage.toFixed(1)}% vs earlier
            </p>
          )}
        </div>

        {/* Largest Expense */}
        <div className="bg-slate-800/50 backdrop-blur-sm border-2 border-slate-700 p-5 rounded-2xl hover:scale-105 transition-all hover:border-amber-500 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="bg-gradient-to-br from-amber-600 to-amber-700 p-2.5 rounded-lg">
              <AlertCircle className="w-5 h-5 text-white" />
            </div>
            <Target className="w-5 h-5 text-amber-400" />
          </div>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">
            Largest Expense
          </p>
          <p className="text-3xl font-black text-white mb-1">
            ${stats.largestExpense?.amount?.toFixed(2) || "0.00"}
          </p>
          {stats.largestExpense && (
            <p className="text-xs font-semibold text-amber-400 truncate">
              {stats.largestExpense.note ||
                stats.largestExpense.category ||
                "Unknown"}
            </p>
          )}
        </div>

        {/* Most Used Category */}
        <div className="bg-slate-800/50 backdrop-blur-sm border-2 border-slate-700 p-5 rounded-2xl hover:scale-105 transition-all hover:border-purple-500 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="bg-gradient-to-br from-purple-600 to-purple-700 p-2.5 rounded-lg">
              <Award className="w-5 h-5 text-white" />
            </div>
            <div className="text-xs font-bold text-purple-400 bg-purple-900/50 px-2 py-1 rounded-full">
              TOP
            </div>
          </div>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">
            Top Category
          </p>
          <p className="text-3xl font-black text-white mb-1">
            ${stats.topCategory?.total?.toFixed(2) || "0.00"}
          </p>
          {stats.topCategory && (
            <p className="text-xs font-semibold text-purple-400 truncate">
              {stats.topCategory.name}
            </p>
          )}
        </div>

        {/* Total Spending */}
        <div className="bg-gradient-to-br from-emerald-600 to-teal-600 p-5 rounded-2xl hover:scale-105 transition-all shadow-lg hover:shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <div className="bg-white/20 backdrop-blur-sm p-2.5 rounded-lg">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <div className="text-xs font-bold text-white bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full">
              {stats.expenseCount} TOTAL
            </div>
          </div>
          <p className="text-emerald-100 text-xs font-bold uppercase tracking-wider mb-1">
            Week Total
          </p>
          <p className="text-4xl font-black text-white mb-1">
            ${stats.totalSpent.toFixed(2)}
          </p>
          <p className="text-xs font-semibold text-emerald-100">
            {stats.expenseCount} transaction
            {stats.expenseCount !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Quick Insights */}
      {stats.expenseCount > 0 && (
        <div className="mt-4 bg-slate-800/30 border border-slate-700 rounded-xl p-4">
          <p className="text-slate-300 text-sm font-medium">
            💡 <strong>Insight:</strong>{" "}
            {stats.trend === "up" && (
              <span>
                Your spending increased later in the week. Consider reviewing
                your recent purchases.
              </span>
            )}
            {stats.trend === "down" && (
              <span>
                Great job! You spent less later in the week. Keep up the good
                habits! 🎉
              </span>
            )}
            {stats.trend === "neutral" && (
              <span>
                Your spending has been consistent throughout the week.
              </span>
            )}
          </p>
        </div>
      )}
    </div>
  );
};

export default QuickStatsWidget;
