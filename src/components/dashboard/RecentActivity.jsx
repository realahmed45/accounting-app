import React, { useState } from "react";
import { Filter, Download, Plus, Eye, Trash2, TrendingUp } from "lucide-react";

// Status badge config
const STATUS_CONFIG = {
  Expense: {
    color: "text-red-500",
    bg: "bg-red-50",
    border: "border-red-200",
  },
  "Deposit Received": {
    color: "text-green-600",
    bg: "bg-green-50",
    border: "border-green-200",
  },
  "Expense from acc": {
    color: "text-orange-500",
    bg: "bg-orange-50",
    border: "border-orange-200",
  },
  "CASH box increased F acc": {
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
  },
  "CASH box increased W cash": {
    color: "text-green-500",
    bg: "bg-green-50",
    border: "border-green-100",
  },
  "Transfer from acc to acc": {
    color: "text-orange-400",
    bg: "bg-orange-50",
    border: "border-orange-100",
  },
};

const getStatusConfig = (status) =>
  STATUS_CONFIG[status] || {
    color: "text-gray-600",
    bg: "bg-gray-100",
    border: "border-gray-200",
  };

const StatusBadge = ({ status }) => {
  const cfg = getStatusConfig(status);
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.color} ${cfg.border}`}
    >
      {status || "Expense"}
    </span>
  );
};

// Format date for display: "Today, 2:45 PM" or "Yesterday, 2:45 PM"
const formatDisplayDate = (dateStr) => {
  const date = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const expDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  const timeStr = date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (expDate.getTime() === today.getTime()) return `Today, ${timeStr}`;
  if (expDate.getTime() === yesterday.getTime()) return `Yesterday, ${timeStr}`;
  return `${date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}, ${timeStr}`;
};

// Mobile transaction card
const MobileTransactionCard = ({ expense, index, balance, onViewDetails }) => {
  const status = expense.paymentStatus || "Expense";
  const cfg = getStatusConfig(status);
  const isInflow = [
    "Deposit Received",
    "CASH box increased F acc",
    "CASH box increased W cash",
  ].includes(status);

  return (
    <div
      className="bg-white rounded-xl p-3 flex items-start gap-3 shadow-sm border border-gray-100"
      onClick={() => onViewDetails(expense)}
    >
      {/* Icon circle */}
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
          isInflow
            ? "bg-green-100"
            : status === "Transfer from acc to acc"
              ? "bg-orange-100"
              : "bg-red-100"
        }`}
      >
        {isInflow ? (
          <TrendingUp
            className={`w-5 h-5 ${isInflow ? "text-green-600" : "text-red-500"}`}
          />
        ) : (
          <svg
            className="w-5 h-5 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 13l-5 5m0 0l-5-5m5 5V6"
            />
          </svg>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="text-xs text-gray-400 font-medium">
            #
            {expense._id?.slice(-4)?.toUpperCase() ||
              `000${index + 1}`.slice(-4)}
          </span>
          <span className="text-xs text-gray-400">
            {formatDisplayDate(expense.date)}
          </span>
        </div>
        <span
          className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${cfg.bg} ${cfg.color} border ${cfg.border}`}
        >
          {status}
        </span>
        <p className="text-sm text-gray-700 mt-1 truncate">
          {expense.note || expense.category || "Expense"}
        </p>
      </div>

      <div className="text-right flex-shrink-0">
        <p className={`font-bold text-sm ${cfg.color}`}>
          ${Number(expense.amount || 0).toFixed(2)}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">
          Balance ${Number(balance || 0).toFixed(2)}
        </p>
      </div>
    </div>
  );
};

const RecentActivity = ({
  expenses = [],
  weeks = [],
  currentWeekIndex = 0,
  onAddExpense,
  onAddNewWeek,
  onViewDetails,
  onDeleteExpense,
  onExport,
  onSeeAll,
  formatAmount,
  currentAccount,
  bankAccounts = [],
  isMobileEmbedded = false,
}) => {
  const [activeTab, setActiveTab] = useState("thisWeek");
  const [openActionMenu, setOpenActionMenu] = useState(null);

  // Filter expenses by tab
  const getFilteredExpenses = () => {
    const now = new Date();
    if (activeTab === "thisWeek") {
      const weekStart = new Date(now);
      weekStart.setDate(
        now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1),
      );
      weekStart.setHours(0, 0, 0, 0);
      return expenses.filter((e) => new Date(e.date) >= weekStart);
    }
    if (activeTab === "previousWeek") {
      const weekStart = new Date(now);
      weekStart.setDate(
        now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1) - 7,
      );
      weekStart.setHours(0, 0, 0, 0);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);
      return expenses.filter((e) => {
        const d = new Date(e.date);
        return d >= weekStart && d < weekEnd;
      });
    }
    if (activeTab === "month") {
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      return expenses.filter((e) => new Date(e.date) >= monthStart);
    }
    return expenses;
  };

  const filtered = getFilteredExpenses();
  const totalExpenses = filtered.reduce((s, e) => s + (e.amount || 0), 0);
  const sym = currentAccount?.currency
    ? getCurrencySymbol(currentAccount.currency)
    : "$";

  // Calculate running balances
  const getRunningBalances = (exps) => {
    // Start from total balance (bank + cash)
    const bankTotal = bankAccounts.reduce((s, b) => s + (b.balance || 0), 0);
    const currentWeek = weeks[currentWeekIndex];
    const cashBalance = currentWeek?.cashBoxBalance || 0;
    let runningBalance = bankTotal + cashBalance;

    // Reverse to oldest first, add balance
    const sorted = [...exps].sort(
      (a, b) => new Date(b.date) - new Date(a.date),
    );
    const balances = {};
    sorted.forEach((exp) => {
      const status = exp.paymentStatus || "Expense";
      const isInflow = [
        "Deposit Received",
        "CASH box increased F acc",
        "CASH box increased W cash",
      ].includes(status);
      balances[exp._id] = runningBalance;
      if (isInflow) runningBalance -= exp.amount;
      else runningBalance += exp.amount;
    });
    return balances;
  };

  const runningBalances = getRunningBalances(filtered);
  const sortedFiltered = [...filtered].sort(
    (a, b) => new Date(b.date) - new Date(a.date),
  );

  // Export to CSV
  const handleExport = () => {
    const rows = sortedFiltered.map((e) => [
      formatDisplayDate(e.date),
      e.note || e.category || "",
      e.paymentStatus || "Expense",
      e.amount,
      runningBalances[e._id] || 0,
    ]);
    const csv = [
      ["Date", "Description", "Status", "Amount", "Balance"].join(","),
      ...rows.map((r) => r.map((c) => `"${c}"`).join(",")),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `expenses-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    onExport?.();
  };

  // ── Mobile embedded view (home screen card list only) ──────────────────────
  if (isMobileEmbedded) {
    return (
      <div className="bg-white rounded-2xl overflow-hidden">
        {/* Header row */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h3 className="text-base font-semibold text-gray-900">
            Recent Activity
          </h3>
          <button className="text-sm text-gray-400 font-medium">Filter</button>
        </div>
        {/* Tab Selector */}
        <div className="px-4 pt-3">
          <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
            {[
              { key: "thisWeek", label: "This Week" },
              { key: "previousWeek", label: "Previous Week" },
              { key: "month", label: "Month" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === tab.key
                    ? "bg-white shadow-sm text-gray-900"
                    : "text-gray-500"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        {/* Card list */}
        <div className="px-4 pb-4 pt-3 space-y-3">
          {sortedFiltered.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p className="text-sm">No expenses for this period</p>
              <button
                onClick={onAddExpense}
                className="mt-3 text-blue-600 text-sm font-medium"
              >
                + Add your first expense
              </button>
            </div>
          ) : (
            sortedFiltered.map((expense, idx) => (
              <MobileTransactionCard
                key={expense._id}
                expense={expense}
                index={idx}
                balance={runningBalances[expense._id] || 0}
                onViewDetails={onViewDetails}
              />
            ))
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Week Tabs + Add New Week */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100">
        <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
          {[
            { key: "thisWeek", label: "This Week" },
            { key: "previousWeek", label: "Previous Week" },
            { key: "month", label: "Month" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? "bg-white shadow-sm text-gray-900"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <button
          onClick={onAddNewWeek || onAddExpense}
          className="hidden sm:flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add New Week +
        </button>
      </div>

      {/* Total Expense Card */}
      <div className="px-6 py-4">
        <div className="border-2 border-green-300 bg-green-50 rounded-xl px-6 py-4">
          <p className="text-gray-800 font-semibold text-base">
            Total Expense: {sym}
            {Number(totalExpenses).toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="px-6 pb-6 flex-1 overflow-auto">
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {/* Table Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h3 className="text-base font-bold text-gray-900">
              Recent Activity
            </h3>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                <Filter className="w-3.5 h-3.5" />
                Filter
              </button>
              <button
                onClick={onSeeAll}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
              >
                See all
              </button>
              <button
                onClick={handleExport}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Export
              </button>
              <button
                onClick={onAddExpense}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add New Expense +
              </button>
            </div>
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Balance
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {sortedFiltered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-12 text-center text-gray-400"
                    >
                      <p className="text-sm">No expenses for this period</p>
                      <button
                        onClick={onAddExpense}
                        className="mt-3 text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        + Add your first expense
                      </button>
                    </td>
                  </tr>
                ) : (
                  sortedFiltered.map((expense) => (
                    <tr
                      key={expense._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-5 py-3.5 text-sm text-gray-600 whitespace-nowrap">
                        {formatDisplayDate(expense.date)}
                      </td>
                      <td className="px-5 py-3.5 text-sm text-gray-800 font-medium max-w-xs truncate">
                        {expense.note || expense.category || "Expense"}
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge
                          status={expense.paymentStatus || "Expense"}
                        />
                      </td>
                      <td className="px-5 py-3.5 text-sm text-gray-800 font-medium whitespace-nowrap">
                        ${Number(expense.amount || 0).toFixed(2)}
                      </td>
                      <td className="px-5 py-3.5 text-sm text-gray-600 whitespace-nowrap">
                        ${Number(runningBalances[expense._id] || 0).toFixed(2)}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <button
                            title="View Details"
                            onClick={(e) => {
                              e.stopPropagation();
                              onViewDetails?.(expense);
                            }}
                            className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            title="Delete Expense"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (
                                window.confirm(
                                  "Delete this expense? This cannot be undone.",
                                )
                              ) {
                                onDeleteExpense?.(expense._id);
                              }
                            }}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden p-4 space-y-3">
            {sortedFiltered.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <p className="text-sm">No expenses for this period</p>
                <button
                  onClick={onAddExpense}
                  className="mt-3 text-blue-600 text-sm font-medium"
                >
                  + Add your first expense
                </button>
              </div>
            ) : (
              sortedFiltered.map((expense, idx) => (
                <MobileTransactionCard
                  key={expense._id}
                  expense={expense}
                  index={idx}
                  balance={runningBalances[expense._id] || 0}
                  onViewDetails={onViewDetails}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Utility: get currency symbol
function getCurrencySymbol(code) {
  const map = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    JPY: "¥",
    CHF: "Fr",
    CAD: "$",
    AUD: "$",
    INR: "₹",
    AED: "د.إ",
  };
  return map[code] || "$";
}

export default RecentActivity;
