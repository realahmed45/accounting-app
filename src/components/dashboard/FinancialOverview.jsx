import React from "react";
import {
  Building2,
  Wallet,
  Receipt,
  Plus,
  ArrowRightLeft,
  DollarSign,
  Edit,
  TrendingUp,
  TrendingDown,
  AlertCircle,
} from "lucide-react";
import { HelpIcon, InstructionBox } from "../layout/Tooltip";

const FinancialOverview = ({
  bankAccounts,
  currentWeek,
  hasPermission,
  setActiveModal,
  getExpectedBankAmount,
  getExpectedCashAmount,
  getTotalExpenses,
  expenses,
  currentAccount,
  formatAmount,
}) => {
  // Calculate financial health indicators
  const bankBalance = getExpectedBankAmount();
  const cashBalance = getExpectedCashAmount();
  const totalExpenses = getTotalExpenses();
  const netBalance = bankBalance + cashBalance - totalExpenses;

  return (
    <div className="w-full bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Help Banner for First-Time Users */}
      {expenses.length === 0 && (
        <div className="px-6 pt-6 pb-4">
          <InstructionBox
            title="👋 Welcome to Your Financial Dashboard!"
            variant="info"
            icon={AlertCircle}
          >
            This is your financial overview. You'll see three main cards here:{" "}
            <strong>Bank Balance</strong> (money in your bank accounts),{" "}
            <strong>Cash Box</strong> (physical cash on hand), and{" "}
            <strong>Total Expenses</strong> (all spending for this week). Click
            any card to see more details or add new transactions!
          </InstructionBox>
        </div>
      )}

      {/* Main Financial Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
        {/* Bank Balance Card */}
        <div className="group relative overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-slate-200">
          {/* Gradient Overlay */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-500"></div>

          <div className="relative p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-3 rounded-xl shadow-lg">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-700 uppercase tracking-wide">
                      Bank Balance
                    </span>
                    <HelpIcon content="This shows the total balance across all your linked bank accounts. Click to view individual account details or add new accounts." />
                  </div>
                  <span className="text-xs text-slate-500 font-medium">
                    {bankAccounts.length}{" "}
                    {bankAccounts.length === 1 ? "Account" : "Accounts"} Linked
                  </span>
                </div>
              </div>
            </div>

            {/* Amount Display */}
            <button
              onClick={() => setActiveModal("bankAccounts")}
              className="w-full text-left mb-4 group/amount"
            >
              <div className="text-4xl font-black text-slate-900 group-hover/amount:text-blue-600 transition-colors mb-1">
                {formatAmount(bankBalance, currentAccount?.currency)}
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <TrendingUp className="w-3 h-3 text-emerald-600" />
                <span className="font-medium">
                  {bankAccounts.length > 0
                    ? "Click to view accounts"
                    : "No accounts linked"}
                </span>
              </div>
            </button>

            {/* Actions */}
            <div className="space-y-2">
              {!currentWeek.isLocked &&
                bankAccounts.length > 0 &&
                hasPermission("calculateCash") && (
                  <button
                    onClick={() => setActiveModal("transfer")}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl px-4 py-3 transition-all flex items-center justify-center gap-2 font-bold shadow-md hover:shadow-lg"
                  >
                    <ArrowRightLeft className="w-4 h-4" />
                    Transfer to Cash
                  </button>
                )}
              {bankAccounts.length === 0 && (
                <button
                  onClick={() => setActiveModal("bankAccounts")}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl px-4 py-3 transition-all flex items-center justify-center gap-2 font-bold"
                >
                  <Plus className="w-4 h-4" />
                  Add Bank Account
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Cash Box Card */}
        <div className="group relative overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-slate-200">
          {/* Gradient Overlay */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-500"></div>

          <div className="relative p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 p-3 rounded-xl shadow-lg">
                  <Wallet className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-700 uppercase tracking-wide">
                      Cash Box
                    </span>
                    <HelpIcon content="This represents physical cash you have on hand. Track cash deposits, withdrawals, and daily cash expenses here." />
                  </div>
                  <span className="text-xs text-slate-500 font-medium">
                    Physical Cash
                  </span>
                </div>
              </div>
            </div>

            {/* Amount Display */}
            <div className="mb-4">
              <div className="text-4xl font-black text-slate-900 mb-1">
                {formatAmount(cashBalance, currentAccount?.currency)}
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <Wallet className="w-3 h-3 text-emerald-600" />
                <span className="font-medium">Available cash balance</span>
              </div>
            </div>

            {/* Info */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
              <p className="text-xs text-emerald-800 font-medium">
                💡 Transfer money from your bank to increase your cash balance
                for daily expenses.
              </p>
            </div>
          </div>
        </div>

        {/* Total Expenses Card */}
        <div className="group relative overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-slate-200">
          {/* Gradient Overlay */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-500/10 to-pink-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-500"></div>

          <div className="relative p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-red-600 to-red-700 p-3 rounded-xl shadow-lg">
                  <Receipt className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-700 uppercase tracking-wide">
                      Total Expenses
                    </span>
                    <HelpIcon content="All expenses for the current week. Click 'Add Expense' to record new purchases, bills, or any outgoing money." />
                  </div>
                  <span className="text-xs text-slate-500 font-medium">
                    {expenses.length}{" "}
                    {expenses.length === 1 ? "Transaction" : "Transactions"}
                  </span>
                </div>
              </div>
            </div>

            {/* Amount Display */}
            <div className="mb-4">
              <div className="text-4xl font-black text-slate-900 mb-1">
                {formatAmount(totalExpenses, currentAccount?.currency)}
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <TrendingDown className="w-3 h-3 text-red-600" />
                <span className="font-medium">Total spending this week</span>
              </div>
            </div>

            {/* Action */}
            {!currentWeek.isLocked && hasPermission("makeExpense") ? (
              <button
                onClick={() => setActiveModal("addExpense")}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl px-4 py-3 transition-all flex items-center justify-center gap-2 font-bold shadow-md hover:shadow-lg"
              >
                <Plus className="w-4 h-4" />
                Add Expense
              </button>
            ) : (
              <div className="bg-slate-100 rounded-xl p-3 text-center">
                <p className="text-xs text-slate-600 font-medium">
                  {currentWeek.isLocked
                    ? "🔒 Week is locked"
                    : "❌ No permission to add expenses"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Net Balance Indicator */}
      <div className="px-6 pb-6">
        <div
          className={`
          p-4 rounded-xl border-2 flex items-center justify-between
          ${
            netBalance >= 0
              ? "bg-emerald-50 border-emerald-200"
              : "bg-red-50 border-red-200"
          }
        `}
        >
          <div className="flex items-center gap-3">
            {netBalance >= 0 ? (
              <TrendingUp className="w-6 h-6 text-emerald-600" />
            ) : (
              <TrendingDown className="w-6 h-6 text-red-600" />
            )}
            <div>
              <div className="text-xs font-bold uppercase tracking-wide text-slate-600">
                Net Balance (Bank + Cash - Expenses)
              </div>
              <div
                className={`text-2xl font-black ${
                  netBalance >= 0 ? "text-emerald-700" : "text-red-700"
                }`}
              >
                {formatAmount(netBalance, currentAccount?.currency)}
              </div>
            </div>
          </div>
          <HelpIcon
            content="This shows your overall financial position for the week. It's calculated as: (Bank Balance + Cash) - Total Expenses. A positive number means you're in good shape!"
            position="left"
          />
        </div>
      </div>
    </div>
  );
};

export default FinancialOverview;
