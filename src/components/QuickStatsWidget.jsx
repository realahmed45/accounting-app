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
    <div className="glass-card p-6 mb-6 overflow-hidden relative group border-white/5">
      {/* Dynamic Background Glow */}
      <div className="absolute -top-24 -left-24 w-64 h-64 bg-indigo-500/5 rounded-full blur-[100px] group-hover:bg-indigo-500/10 transition-all duration-700"></div>
      <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-purple-500/5 rounded-full blur-[100px] group-hover:bg-purple-500/10 transition-all duration-700"></div>

      <div className="relative flex items-center gap-4 mb-8">
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
        <div className="glass-card border-white/5 p-5 hover:border-blue-500/30 transition-all duration-500 group/stat">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-500/20 p-2.5 rounded-xl text-blue-400 group-hover/stat:scale-110 transition-transform">
              <Calendar className="w-5 h-5" />
            </div>
            {stats.trend === "up" ? (
              <TrendingUp className="w-5 h-5 text-rose-400 animate-pulse" />
            ) : stats.trend === "down" ? (
              <TrendingDown className="w-5 h-5 text-emerald-400 animate-pulse" />
            ) : (
              <Activity className="w-5 h-5 text-slate-500" />
            )}
          </div>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-1">
            Avg Daily
          </p>
          <p className="text-3xl font-black text-white tracking-tight mb-1">
            ${stats.avgDaily.toFixed(2)}
          </p>
          {trendPercentage !== 0 && (
            <div className="flex items-center gap-1.5">
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                trendPercentage > 0 ? "bg-rose-500/20 text-rose-400" : "bg-emerald-500/20 text-emerald-400"
              }`}>
                {trendPercentage > 0 ? "+" : ""}{trendPercentage.toFixed(1)}%
              </span>
              <span className="text-[10px] text-slate-500 font-medium">vs earlier</span>
            </div>
          )}
        </div>

        {/* Largest Expense */}
        <div className="glass-card border-white/5 p-5 hover:border-amber-500/30 transition-all duration-500 group/stat">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-amber-500/20 p-2.5 rounded-xl text-amber-400 group-hover/stat:scale-110 transition-transform">
              <AlertCircle className="w-5 h-5" />
            </div>
            <Target className="w-5 h-5 text-amber-500/50" />
          </div>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-1">
            Peak Spend
          </p>
          <p className="text-3xl font-black text-white tracking-tight mb-1">
            ${stats.largestExpense?.amount?.toFixed(2) || "0.00"}
          </p>
          {stats.largestExpense && (
            <p className="text-[10px] font-bold text-amber-400 truncate opacity-80 uppercase tracking-wider">
              {stats.largestExpense.note || stats.largestExpense.category || "General"}
            </p>
          )}
        </div>

        {/* Most Used Category */}
        <div className="glass-card border-white/5 p-5 hover:border-purple-500/30 transition-all duration-500 group/stat">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-500/20 p-2.5 rounded-xl text-purple-400 group-hover/stat:scale-110 transition-transform">
              <Award className="w-5 h-5" />
            </div>
            <div className="text-[10px] font-black text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
              TOP
            </div>
          </div>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-1">
            Main Category
          </p>
          <p className="text-3xl font-black text-white tracking-tight mb-1">
            ${stats.topCategory?.total?.toFixed(2) || "0.00"}
          </p>
          {stats.topCategory && (
            <p className="text-[10px] font-bold text-purple-400 truncate opacity-80 uppercase tracking-wider">
              {stats.topCategory.name}
            </p>
          )}
        </div>

        {/* Total Spending */}
        <div className="glass-card !bg-indigo-600/20 border-indigo-500/30 p-5 hover:!bg-indigo-600/30 transition-all duration-500 group/stat relative overflow-hidden">
          <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
          <div className="relative flex items-center justify-between mb-4">
            <div className="bg-white/10 p-2.5 rounded-xl text-white group-hover/stat:rotate-12 transition-transform">
              <DollarSign className="w-5 h-5" />
            </div>
            <div className="text-[10px] font-black text-white bg-white/10 px-2 py-0.5 rounded-full border border-white/10">
              {stats.expenseCount} TXNS
            </div>
          </div>
          <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-[0.2em] mb-1">
            Weekly Overall
          </p>
          <p className="text-4xl font-black text-white tracking-tight mb-1">
            ${stats.totalSpent.toFixed(2)}
          </p>
          <p className="text-[10px] font-bold text-indigo-200/60 uppercase tracking-tighter">
            Total for current period
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
