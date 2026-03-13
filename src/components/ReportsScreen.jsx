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
    <div className="w-full min-h-screen animate-fadeIn space-y-8">
      {/* Header section redesigned for in-page use */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-slate-200">
        <div className="flex items-center gap-4">
          <div className="bg-indigo-600 p-3 rounded-xl shadow-lg shadow-indigo-500/20">
            <BarChart3 className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">
              Analytics <span className="text-indigo-600">Hub</span>
            </h2>
            <p className="text-slate-500 text-xs font-black tracking-widest mt-1 opacity-70">
              Visualizing Spending Intelligence
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="group flex items-center gap-2 px-6 py-3 bg-white/40 hover:bg-white/60 border border-slate-200 text-slate-600 hover:text-slate-900 rounded-2xl transition-all font-bold text-sm shadow-sm"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
      </div>

      <div className="space-y-8">

        <div className="p-0 overflow-y-auto scrollbar-hide">
          {/* Filters */}
          <div className="flex flex-wrap gap-6 mb-10 items-center bg-white/40 p-6 rounded-2xl border border-slate-200 backdrop-blur-md shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-400" />
                <label className="text-slate-400 font-black text-[10px] tracking-widest uppercase">
                  Time Period
                </label>
              </div>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="bg-white/60 text-slate-900 px-4 py-2.5 rounded-xl border border-slate-200 font-black text-xs uppercase tracking-widest focus:outline-none focus:border-indigo-500 transition-all shadow-sm"
              >
                <option value="7">Last 7 days</option>
                <option value="14">Last 14 days</option>
                <option value="30">Last 30 days</option>
                <option value="60">Last 60 days</option>
                <option value="90">Last 90 days</option>
                <option value="365">Last year</option>
              </select>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-purple-400" />
                <label className="text-slate-400 font-black text-[10px] tracking-widest uppercase">
                  Category
                </label>
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-white/60 text-slate-900 px-4 py-2.5 rounded-xl border border-slate-200 font-black text-xs uppercase tracking-widest focus:outline-none focus:border-purple-500 transition-all shadow-sm"
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
              className="ml-auto btn-primary px-8 py-3 text-xs font-black tracking-widest uppercase flex items-center gap-2 group"
            >
              <Download className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
              Export CSV
            </button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="glass-card-silk p-6 border-l-4 border-l-indigo-600 bg-white shadow-sm group">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-indigo-500/20 p-2.5 rounded-xl group-hover:scale-110 transition-transform duration-500">
                  <DollarSign className="w-6 h-6 text-indigo-400" />
                </div>
                <TrendingUp className="w-5 h-5 text-indigo-400/50" />
              </div>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">
                Aggregate Spending
              </p>
              <p className="text-4xl font-black text-slate-900 tracking-tighter">
                ${stats.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-indigo-400/60 text-[10px] mt-2 font-black uppercase tracking-widest">
                Last {dateRange} days
              </p>
            </div>

            <div className="glass-card-silk p-6 border-l-4 border-l-purple-600 bg-white shadow-sm group">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-purple-500/20 p-2.5 rounded-xl group-hover:scale-110 transition-transform duration-500">
                  <BarChart3 className="w-6 h-6 text-purple-400" />
                </div>
                <PieChart className="w-5 h-5 text-purple-400/50" />
              </div>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">
                Transaction Volume
              </p>
              <p className="text-4xl font-black text-slate-900 tracking-tighter">{stats.count}</p>
              <p className="text-purple-400/60 text-[10px] mt-2 font-black uppercase tracking-widest">
                Verified Records
              </p>
            </div>

            <div className="glass-card-silk p-6 border-l-4 border-l-emerald-600 bg-white shadow-sm group">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-emerald-500/20 p-2.5 rounded-xl group-hover:scale-110 transition-transform duration-500">
                  <TrendingDown className="w-6 h-6 text-emerald-400" />
                </div>
                <Calendar className="w-5 h-5 text-emerald-400/50" />
              </div>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">
                Average Value
              </p>
              <p className="text-4xl font-black text-slate-900 tracking-tighter">
                ${stats.average.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-emerald-400/60 text-[10px] mt-2 font-black uppercase tracking-widest">
                Per Transaction
              </p>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
            {/* Expenses by Category */}
            <div className="glass-panel p-8 group">
              <div className="flex items-center gap-4 mb-8">
                <div className="bg-amber-500/20 p-2.5 rounded-xl group-hover:rotate-12 transition-transform duration-500">
                  <Tag className="w-6 h-6 text-amber-500" />
                </div>
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">
                  Sector Distribution
                </h3>
              </div>
              <div className="space-y-6">
                {stats.topCategories.length > 0 ? (
                  stats.topCategories.map(([category, data], index) => {
                    const percentage = (data.total / stats.total) * 100;
                    const barWidth = (data.total / maxCategoryValue) * 100;
                    const colors = [
                      "from-indigo-600 to-indigo-700",
                      "from-purple-600 to-purple-700",
                      "from-emerald-600 to-emerald-700",
                      "from-amber-600 to-amber-700",
                      "from-rose-600 to-rose-700",
                    ];

                    return (
                      <div key={category} className="group/item">
                        <div className="flex items-center justify-between mb-2.5">
                          <span className="text-slate-300 font-black text-xs uppercase tracking-widest">
                            {category}
                          </span>
                          <div className="text-right flex items-baseline gap-2">
                            <span className="text-slate-900 font-black text-lg tracking-tighter">
                              ${data.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                            <span className="text-slate-500 font-bold text-[10px] uppercase">
                              {percentage.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                        <div className="w-full bg-white/5 rounded-full h-3 overflow-hidden p-[2px]">
                          <div
                            className={`h-full bg-gradient-to-r ${colors[index]} transition-all duration-1000 flex items-center justify-end pr-2 rounded-full shadow-[0_0_15px_rgba(79,70,229,0.3)] animate-fadeIn`}
                            style={{ width: `${barWidth}%`, animationDelay: `${index * 150}ms` }}
                          >
                            <span className="text-white text-[8px] font-black">
                              {data.count}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 opacity-30">
                    <Filter className="w-12 h-12 mb-4" />
                    <p className="text-slate-400 font-black text-xs uppercase tracking-widest">
                      No matching records found
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Expenses by Person */}
            <div className="glass-panel p-8 group">
              <div className="flex items-center gap-4 mb-8">
                <div className="bg-blue-500/20 p-2.5 rounded-xl group-hover:rotate-12 transition-transform duration-500">
                  <Users className="w-6 h-6 text-blue-500" />
                </div>
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">
                  Elite Contributors
                </h3>
              </div>
              <div className="space-y-6">
                {stats.topPeople.length > 0 ? (
                  stats.topPeople.map(([person, data], index) => {
                    const percentage = (data.total / stats.total) * 100;
                    const barWidth = (data.total / maxPersonValue) * 100;
                    const colors = [
                      "from-emerald-500 to-emerald-600",
                      "from-blue-500 to-blue-600",
                      "from-purple-500 to-purple-600",
                      "from-amber-500 to-amber-600",
                      "from-pink-500 to-pink-600",
                    ];

                    return (
                      <div key={person} className="group/item">
                        <div className="flex items-center justify-between mb-2.5">
                          <span className="text-slate-300 font-black text-xs uppercase tracking-widest">{person}</span>
                          <div className="text-right flex items-baseline gap-2">
                            <span className="text-slate-900 font-black text-lg tracking-tighter">
                              ${data.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                            <span className="text-slate-500 font-bold text-[10px] uppercase">
                              {percentage.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                        <div className="w-full bg-white/5 rounded-full h-3 overflow-hidden p-[2px]">
                          <div
                            className={`h-full bg-gradient-to-r ${colors[index]} transition-all duration-1000 flex items-center justify-end pr-2 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.3)] animate-fadeIn`}
                            style={{ width: `${barWidth}%`, animationDelay: `${index * 150}ms` }}
                          >
                            <span className="text-white text-[8px] font-black">
                              {data.count}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 opacity-30">
                    <Users className="w-12 h-12 mb-4" />
                    <p className="text-slate-400 font-black text-xs uppercase tracking-widest">
                      Awaiting contributor data
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* All Categories Table */}
          <div className="glass-card-silk p-8 mb-4 border-slate-200 shadow-sm bg-white/60">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="bg-purple-500/20 p-2.5 rounded-xl">
                  <PieChart className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">
                  Comprehensive Breakdown
                </h3>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-separate border-spacing-y-2">
                <thead>
                  <tr className="text-slate-500 font-black text-[10px] uppercase tracking-[0.2em]">
                    <th className="text-left py-4 px-6 font-black">Categorization</th>
                    <th className="text-right py-4 px-6 font-black">Volume</th>
                    <th className="text-right py-4 px-6 font-black">Gross Total</th>
                    <th className="text-right py-4 px-6 font-black">Mean Value</th>
                    <th className="text-right py-4 px-6 font-black">Percentage</th>
                  </tr>
                </thead>
                <tbody className="space-y-4">
                  {Object.entries(stats.byCategory)
                    .sort((a, b) => b[1].total - a[1].total)
                    .map(([category, data]) => {
                      const percentage = (data.total / stats.total) * 100;
                      return (
                        <tr
                          key={category}
                          className="group bg-white/40 hover:bg-white/60 transition-all duration-300"
                        >
                          <td className="py-5 px-6 rounded-l-2xl border-y border-l border-slate-200 group-hover:border-indigo-200">
                            <div className="flex items-center gap-3">
                              <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                              <span className="text-slate-900 font-bold tracking-tight">
                                {category}
                              </span>
                            </div>
                          </td>
                          <td className="text-right py-5 px-6 border-y border-slate-200 group-hover:border-indigo-200 font-black text-slate-500 text-xs">
                            {data.count}
                          </td>
                          <td className="text-right py-5 px-6 border-y border-slate-200 group-hover:border-indigo-200">
                            <span className="text-slate-900 font-black tracking-tighter text-lg">
                              ${data.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          </td>
                          <td className="text-right py-5 px-6 border-y border-slate-200 group-hover:border-indigo-200 font-bold text-slate-500 text-xs">
                            ${(data.total / data.count).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="text-right py-5 px-6 rounded-r-2xl border-y border-r border-slate-200 group-hover:border-indigo-200">
                            <span className="px-3 py-1.5 bg-emerald-500/10 text-emerald-600 rounded-lg text-xs font-black tracking-widest">
                              {percentage.toFixed(1)}%
                            </span>
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
