import React, { useMemo, useState } from "react";
import {
  X,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  PieChart,
  BarChart3,
  Download,
  Filter,
  Users,
  Tag,
} from "lucide-react";

const ReportsScreen = ({
  onClose,
  expenses = [],
  categories = [],
  people = [],
}) => {
  const [dateRange, setDateRange] = useState("30"); // days
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Filter expenses by date range
  const filteredExpenses = useMemo(() => {
    const daysAgo = parseInt(dateRange);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysAgo);

    let filtered = expenses.filter((e) => new Date(e.date) >= cutoffDate);

    if (selectedCategory !== "all") {
      filtered = filtered.filter((e) => e.category === selectedCategory);
    }

    return filtered;
  }, [expenses, dateRange, selectedCategory]);

  // Calculate summary statistics
  const stats = useMemo(() => {
    const total = filteredExpenses.reduce(
      (sum, e) => sum + Number(e.amount || 0),
      0,
    );
    const count = filteredExpenses.length;
    const average = count > 0 ? total / count : 0;

    // Group by category
    const byCategory = {};
    filteredExpenses.forEach((expense) => {
      const cat = expense.category || "Uncategorized";
      if (!byCategory[cat]) {
        byCategory[cat] = { total: 0, count: 0 };
      }
      byCategory[cat].total += Number(expense.amount || 0);
      byCategory[cat].count += 1;
    });

    // Group by person
    const byPerson = {};
    filteredExpenses.forEach((expense) => {
      const person = expense.personName || "Unknown";
      if (!byPerson[person]) {
        byPerson[person] = { total: 0, count: 0 };
      }
      byPerson[person].total += Number(expense.amount || 0);
      byPerson[person].count += 1;
    });

    // Top 5 categories
    const topCategories = Object.entries(byCategory)
      .sort((a, b) => b[1].total - a[1].total)
      .slice(0, 5);

    // Top 5 spenders
    const topPeople = Object.entries(byPerson)
      .sort((a, b) => b[1].total - a[1].total)
      .slice(0, 5);

    return {
      total,
      count,
      average,
      byCategory,
      byPerson,
      topCategories,
      topPeople,
    };
  }, [filteredExpenses]);

  // Export to CSV
  const exportToCSV = () => {
    const headers = [
      "Date",
      "Description",
      "Amount",
      "Category",
      "Person",
      "Source",
    ];
    const rows = filteredExpenses.map((e) => [
      new Date(e.date).toLocaleDateString(),
      e.note || "",
      e.amount,
      e.category || "Uncategorized",
      e.personName || "Unknown",
      e.source || "Unknown",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `expense-report-${dateRange}days-${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const maxCategoryValue = Math.max(
    ...stats.topCategories.map(([_, data]) => data.total),
    1,
  );
  const maxPersonValue = Math.max(
    ...stats.topPeople.map(([_, data]) => data.total),
    1,
  );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl shadow-2xl w-full max-w-7xl max-h-[90vh] overflow-hidden border-2 border-slate-700">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-8 py-6 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <BarChart3 className="w-8 h-8 text-white" />
            <div>
              <h2 className="text-3xl font-black text-white">
                Expense Reports & Analytics
              </h2>
              <p className="text-emerald-100 text-sm font-medium mt-1">
                Visualize your spending patterns and trends
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-xl transition-all text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-8 items-center bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-blue-400" />
              <label className="text-slate-300 font-bold text-sm">
                Time Period:
              </label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="bg-slate-700 text-white px-4 py-2 rounded-xl border-2 border-slate-600 font-semibold focus:outline-none focus:border-blue-500"
              >
                <option value="7">Last 7 days</option>
                <option value="14">Last 14 days</option>
                <option value="30">Last 30 days</option>
                <option value="60">Last 60 days</option>
                <option value="90">Last 90 days</option>
                <option value="365">Last year</option>
              </select>
            </div>

            <div className="flex items-center gap-3">
              <Filter className="w-5 h-5 text-purple-400" />
              <label className="text-slate-300 font-bold text-sm">
                Category:
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-slate-700 text-white px-4 py-2 rounded-xl border-2 border-slate-600 font-semibold focus:outline-none focus:border-purple-500"
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => {
                  const catName = typeof cat === "string" ? cat : cat.name;
                  return (
                    <option key={catName} value={catName}>
                      {catName}
                    </option>
                  );
                })}
              </select>
            </div>

            <button
              onClick={exportToCSV}
              className="ml-auto flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg transition-all"
            >
              <Download className="w-5 h-5" />
              Export CSV
            </button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-6 rounded-2xl shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <DollarSign className="w-8 h-8 text-white/80" />
                <TrendingUp className="w-6 h-6 text-white/60" />
              </div>
              <p className="text-blue-100 text-sm font-bold uppercase tracking-wider mb-1">
                Total Spent
              </p>
              <p className="text-4xl font-black text-white">
                ${stats.total.toFixed(2)}
              </p>
              <p className="text-blue-100 text-xs mt-2 font-medium">
                in {dateRange} days
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-600 to-purple-700 p-6 rounded-2xl shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <BarChart3 className="w-8 h-8 text-white/80" />
                <PieChart className="w-6 h-6 text-white/60" />
              </div>
              <p className="text-purple-100 text-sm font-bold uppercase tracking-wider mb-1">
                Total Expenses
              </p>
              <p className="text-4xl font-black text-white">{stats.count}</p>
              <p className="text-purple-100 text-xs mt-2 font-medium">
                transactions recorded
              </p>
            </div>

            <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 p-6 rounded-2xl shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <TrendingDown className="w-8 h-8 text-white/80" />
                <Calendar className="w-6 h-6 text-white/60" />
              </div>
              <p className="text-emerald-100 text-sm font-bold uppercase tracking-wider mb-1">
                Average Expense
              </p>
              <p className="text-4xl font-black text-white">
                ${stats.average.toFixed(2)}
              </p>
              <p className="text-emerald-100 text-xs mt-2 font-medium">
                per transaction
              </p>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Expenses by Category */}
            <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
              <div className="flex items-center gap-3 mb-6">
                <Tag className="w-6 h-6 text-amber-400" />
                <h3 className="text-2xl font-black text-white">
                  Top Categories
                </h3>
              </div>
              <div className="space-y-4">
                {stats.topCategories.length > 0 ? (
                  stats.topCategories.map(([category, data], index) => {
                    const percentage = (data.total / stats.total) * 100;
                    const barWidth = (data.total / maxCategoryValue) * 100;
                    const colors = [
                      "from-blue-600 to-blue-700",
                      "from-purple-600 to-purple-700",
                      "from-emerald-600 to-emerald-700",
                      "from-amber-600 to-amber-700",
                      "from-red-600 to-red-700",
                    ];

                    return (
                      <div key={category}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white font-bold">
                            {category}
                          </span>
                          <div className="text-right">
                            <span className="text-white font-black text-lg">
                              ${data.total.toFixed(2)}
                            </span>
                            <span className="text-slate-400 text-sm ml-2">
                              ({percentage.toFixed(1)}%)
                            </span>
                          </div>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-4 overflow-hidden">
                          <div
                            className={`h-full bg-gradient-to-r ${colors[index]} transition-all duration-500 flex items-center justify-end pr-2`}
                            style={{ width: `${barWidth}%` }}
                          >
                            <span className="text-white text-xs font-bold">
                              {data.count}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-slate-400 text-center py-8">
                    No expense data for this period
                  </p>
                )}
              </div>
            </div>

            {/* Expenses by Person */}
            <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
              <div className="flex items-center gap-3 mb-6">
                <Users className="w-6 h-6 text-blue-400" />
                <h3 className="text-2xl font-black text-white">Top Spenders</h3>
              </div>
              <div className="space-y-4">
                {stats.topPeople.length > 0 ? (
                  stats.topPeople.map(([person, data], index) => {
                    const percentage = (data.total / stats.total) * 100;
                    const barWidth = (data.total / maxPersonValue) * 100;
                    const colors = [
                      "from-emerald-600 to-emerald-700",
                      "from-blue-600 to-blue-700",
                      "from-purple-600 to-purple-700",
                      "from-amber-600 to-amber-700",
                      "from-pink-600 to-pink-700",
                    ];

                    return (
                      <div key={person}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white font-bold">{person}</span>
                          <div className="text-right">
                            <span className="text-white font-black text-lg">
                              ${data.total.toFixed(2)}
                            </span>
                            <span className="text-slate-400 text-sm ml-2">
                              ({percentage.toFixed(1)}%)
                            </span>
                          </div>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-4 overflow-hidden">
                          <div
                            className={`h-full bg-gradient-to-r ${colors[index]} transition-all duration-500 flex items-center justify-end pr-2`}
                            style={{ width: `${barWidth}%` }}
                          >
                            <span className="text-white text-xs font-bold">
                              {data.count}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-slate-400 text-center py-8">
                    No expense data for this period
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* All Categories Table */}
          <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
            <h3 className="text-2xl font-black text-white mb-4 flex items-center gap-3">
              <PieChart className="w-6 h-6 text-purple-400" />
              Complete Breakdown
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-slate-700">
                    <th className="text-left py-3 px-4 text-slate-300 font-bold uppercase text-xs">
                      Category
                    </th>
                    <th className="text-right py-3 px-4 text-slate-300 font-bold uppercase text-xs">
                      Count
                    </th>
                    <th className="text-right py-3 px-4 text-slate-300 font-bold uppercase text-xs">
                      Total
                    </th>
                    <th className="text-right py-3 px-4 text-slate-300 font-bold uppercase text-xs">
                      Avg
                    </th>
                    <th className="text-right py-3 px-4 text-slate-300 font-bold uppercase text-xs">
                      % of Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(stats.byCategory)
                    .sort((a, b) => b[1].total - a[1].total)
                    .map(([category, data]) => {
                      const percentage = (data.total / stats.total) * 100;
                      return (
                        <tr
                          key={category}
                          className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors"
                        >
                          <td className="py-3 px-4 text-white font-semibold">
                            {category}
                          </td>
                          <td className="text-right py-3 px-4 text-slate-300">
                            {data.count}
                          </td>
                          <td className="text-right py-3 px-4 text-white font-bold">
                            ${data.total.toFixed(2)}
                          </td>
                          <td className="text-right py-3 px-4 text-slate-300">
                            ${(data.total / data.count).toFixed(2)}
                          </td>
                          <td className="text-right py-3 px-4 text-emerald-400 font-bold">
                            {percentage.toFixed(1)}%
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsScreen;
