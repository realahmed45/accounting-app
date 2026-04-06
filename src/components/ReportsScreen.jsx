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
    <div className="fixed inset-0 bg-white lg:bg-black/50 z-50 lg:flex lg:items-center lg:justify-center overflow-y-auto">
      {/* Inner card — full-screen on mobile, centered modal on desktop */}
      <div className="min-h-screen lg:min-h-0 w-full lg:max-w-5xl lg:max-h-[90vh] lg:overflow-hidden lg:rounded-2xl flex flex-col bg-white lg:shadow-2xl">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between sticky top-0 z-10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-600 p-2 rounded-lg flex-shrink-0">
              <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base sm:text-xl font-bold text-gray-900">
                Reports &amp; Analytics
              </h2>
              <p className="text-xs text-gray-500 hidden sm:block">
                Visualize your spending patterns
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl text-gray-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 mb-6 p-4 bg-gray-50 border border-gray-200 rounded-xl">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500 flex-shrink-0" />
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="flex-1 px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option value="7">Last 7 days</option>
                <option value="14">Last 14 days</option>
                <option value="30">Last 30 days</option>
                <option value="60">Last 60 days</option>
                <option value="90">Last 90 days</option>
                <option value="365">Last year</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500 flex-shrink-0" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="flex-1 px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
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
              className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-sm transition-colors sm:ml-auto"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="w-5 h-5 text-blue-600" />
                <TrendingUp className="w-4 h-4 text-blue-400" />
              </div>
              <p className="text-xs text-blue-600 font-bold uppercase tracking-wide mb-1">
                Total Spent
              </p>
              <p className="text-2xl font-black text-blue-900">
                ${stats.total.toFixed(2)}
              </p>
              <p className="text-xs text-blue-500 mt-1">in {dateRange} days</p>
            </div>
            <div className="bg-purple-50 border border-purple-100 p-4 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <BarChart3 className="w-5 h-5 text-purple-600" />
                <PieChart className="w-4 h-4 text-purple-400" />
              </div>
              <p className="text-xs text-purple-600 font-bold uppercase tracking-wide mb-1">
                Total Expenses
              </p>
              <p className="text-2xl font-black text-purple-900">
                {stats.count}
              </p>
              <p className="text-xs text-purple-500 mt-1">
                transactions recorded
              </p>
            </div>
            <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <TrendingDown className="w-5 h-5 text-emerald-600" />
                <Calendar className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-xs text-emerald-600 font-bold uppercase tracking-wide mb-1">
                Average Expense
              </p>
              <p className="text-2xl font-black text-emerald-900">
                ${stats.average.toFixed(2)}
              </p>
              <p className="text-xs text-emerald-500 mt-1">per transaction</p>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Top Categories */}
            <div className="bg-white border border-gray-200 p-4 sm:p-5 rounded-xl shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Tag className="w-4 h-4 text-amber-500" />
                <h3 className="text-base font-bold text-gray-900">
                  Top Categories
                </h3>
              </div>
              <div className="space-y-3">
                {stats.topCategories.length > 0 ? (
                  stats.topCategories.map(([category, data], index) => {
                    const percentage = (data.total / stats.total) * 100;
                    const barWidth = (data.total / maxCategoryValue) * 100;
                    const colors = [
                      "bg-blue-500",
                      "bg-purple-500",
                      "bg-emerald-500",
                      "bg-amber-500",
                      "bg-red-500",
                    ];
                    return (
                      <div key={category}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-semibold text-gray-800 truncate mr-2">
                            {category}
                          </span>
                          <span className="text-sm font-bold text-gray-900 flex-shrink-0">
                            ${data.total.toFixed(2)}{" "}
                            <span className="text-xs text-gray-400 font-normal">
                              ({percentage.toFixed(1)}%)
                            </span>
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2.5">
                          <div
                            className={`h-full ${colors[index]} rounded-full transition-all duration-500`}
                            style={{ width: `${barWidth}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-gray-400 text-center py-8 text-sm">
                    No data for this period
                  </p>
                )}
              </div>
            </div>

            {/* Top Spenders */}
            <div className="bg-white border border-gray-200 p-4 sm:p-5 rounded-xl shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-4 h-4 text-blue-500" />
                <h3 className="text-base font-bold text-gray-900">
                  Top Spenders
                </h3>
              </div>
              <div className="space-y-3">
                {stats.topPeople.length > 0 ? (
                  stats.topPeople.map(([person, data], index) => {
                    const percentage = (data.total / stats.total) * 100;
                    const barWidth = (data.total / maxPersonValue) * 100;
                    const colors = [
                      "bg-emerald-500",
                      "bg-blue-500",
                      "bg-purple-500",
                      "bg-amber-500",
                      "bg-pink-500",
                    ];
                    return (
                      <div key={person}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-semibold text-gray-800 truncate mr-2">
                            {person}
                          </span>
                          <span className="text-sm font-bold text-gray-900 flex-shrink-0">
                            ${data.total.toFixed(2)}{" "}
                            <span className="text-xs text-gray-400 font-normal">
                              ({percentage.toFixed(1)}%)
                            </span>
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2.5">
                          <div
                            className={`h-full ${colors[index]} rounded-full transition-all duration-500`}
                            style={{ width: `${barWidth}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-gray-400 text-center py-8 text-sm">
                    No data for this period
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Complete Breakdown Table */}
          <div className="bg-white border border-gray-200 p-4 sm:p-5 rounded-xl shadow-sm">
            <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-purple-500" />
              Complete Breakdown
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[380px]">
                <thead>
                  <tr className="border-b-2 border-gray-100">
                    <th className="text-left py-2 px-3 text-gray-500 font-bold uppercase text-xs">
                      Category
                    </th>
                    <th className="text-right py-2 px-3 text-gray-500 font-bold uppercase text-xs">
                      Count
                    </th>
                    <th className="text-right py-2 px-3 text-gray-500 font-bold uppercase text-xs">
                      Total
                    </th>
                    <th className="text-right py-2 px-3 text-gray-500 font-bold uppercase text-xs hidden sm:table-cell">
                      Avg
                    </th>
                    <th className="text-right py-2 px-3 text-gray-500 font-bold uppercase text-xs">
                      %
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
                          className="border-b border-gray-50 hover:bg-gray-50"
                        >
                          <td className="py-2.5 px-3 text-gray-900 font-semibold text-sm">
                            {category}
                          </td>
                          <td className="text-right py-2.5 px-3 text-gray-600 text-sm">
                            {data.count}
                          </td>
                          <td className="text-right py-2.5 px-3 text-gray-900 font-bold text-sm">
                            ${data.total.toFixed(2)}
                          </td>
                          <td className="text-right py-2.5 px-3 text-gray-500 text-sm hidden sm:table-cell">
                            ${(data.total / data.count).toFixed(2)}
                          </td>
                          <td className="text-right py-2.5 px-3 text-emerald-600 font-bold text-sm">
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
