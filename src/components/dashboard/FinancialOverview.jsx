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
    <div className="w-full space-y-6 animate-fade-in">
      {/* Help Banner for First-Time Users */}
      {expenses.length === 0 && (
        <div className="px-3 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4">
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 p-3 sm:p-6">
        {/* Bank Balance Card */}
        <div className="glass-card group relative overflow-hidden transition-all duration-500 border-white/5 hover:border-indigo-500/30">
          {/* Animated Background Glow */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-600/10 rounded-full blur-[100px] group-hover:bg-indigo-600/20 transition-all duration-700"></div>

          <div className="relative p-4 sm:p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-2 sm:p-3 rounded-lg sm:rounded-xl shadow-lg flex-shrink-0">
                  <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                      Bank Balance
                    </span>
                    <div className="flex-shrink-0">
                      <HelpIcon content="This shows the total balance across all your linked bank accounts. Click to view individual account details or add new accounts." />
                    </div>
                  </div>
                  <span className="text-xs text-slate-500 font-medium">
                    {bankAccounts.length}{" "}
                    {bankAccounts.length === 1 ? "Account" : "Accounts"}
                  </span>
                </div>
              </div>
            </div>

            {/* Amount Display */}
            <button
              onClick={() => setActiveModal("bankAccounts")}
              className="w-full text-left mb-3 sm:mb-4 group/amount"
            >
              <div className="text-3xl sm:text-4xl font-black text-white tracking-tight group-hover/amount:text-indigo-400 transition-colors mb-1 truncate">
                {formatAmount(bankBalance, currentAccount?.currency)}
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <TrendingUp className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                <span className="font-medium truncate">
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
                    className="w-full btn-primary !py-2.5 !text-sm flex items-center justify-center gap-2"
                  >
                    <ArrowRightLeft className="w-4 h-4 flex-shrink-0" />
                    <span>Transfer to Cash</span>
                  </button>
                )}
              {bankAccounts.length === 0 && (
                <button
                  onClick={() => setActiveModal("bankAccounts")}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 transition-all flex items-center justify-center gap-2 font-bold text-sm sm:text-base active:scale-95"
                >
                  <Plus className="w-4 h-4 flex-shrink-0" />
                  <span>Add Bank Account</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Cash Box Card */}
        <div className="glass-card group relative overflow-hidden transition-all duration-500 border-white/5 hover:border-emerald-500/30">
          {/* Animated Background Glow */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-600/10 rounded-full blur-[100px] group-hover:bg-emerald-600/20 transition-all duration-700"></div>

          <div className="relative p-4 sm:p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 p-2 sm:p-3 rounded-lg sm:rounded-xl shadow-lg flex-shrink-0">
                  <Wallet className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <span className="text-xs sm:text-sm font-bold text-slate-700 uppercase tracking-wide truncate">
                      Cash Box
                    </span>
                    <div className="flex-shrink-0">
                      <HelpIcon content="This represents physical cash you have on hand. Track cash deposits, withdrawals, and daily cash expenses here." />
                    </div>
                  </div>
                  <span className="text-xs text-slate-500 font-medium">
                    Physical Cash
                  </span>
                </div>
              </div>
            </div>

            {/* Amount Display */}
            <div className="mb-3 sm:mb-4">
              <div className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-1 truncate">
                {formatAmount(cashBalance, currentAccount?.currency)}
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <Wallet className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                <span className="font-medium truncate">
                  Available cash balance
                </span>
              </div>
            </div>

            {/* Info */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg sm:rounded-xl p-2.5 sm:p-3">
              <p className="text-xs text-emerald-800 font-medium">
                💡 Transfer money from your bank to increase your cash balance
                for daily expenses.
              </p>
            </div>
          </div>
        </div>

        {/* Total Expenses Card */}
        <div className="glass-card group relative overflow-hidden transition-all duration-500 border-white/5 hover:border-rose-500/30">
          {/* Animated Background Glow */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-rose-600/10 rounded-full blur-[100px] group-hover:bg-rose-600/20 transition-all duration-700"></div>

          <div className="relative p-4 sm:p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                <div className="bg-gradient-to-br from-red-600 to-red-700 p-2 sm:p-3 rounded-lg sm:rounded-xl shadow-lg flex-shrink-0">
                  <Receipt className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <span className="text-xs sm:text-sm font-bold text-slate-700 uppercase tracking-wide truncate">
                      Total Expenses
                    </span>
                    <div className="flex-shrink-0">
                      <HelpIcon content="All expenses for the current week. Click 'Add Expense' to record new purchases, bills, or any outgoing money." />
                    </div>
                  </div>
                  <span className="text-xs text-slate-500 font-medium">
                    {expenses.length}{" "}
                    {expenses.length === 1 ? "Transaction" : "Transactions"}
                  </span>
                </div>
              </div>
            </div>

            {/* Amount Display */}
            <div className="mb-3 sm:mb-4">
              <div className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-1 truncate">
                {formatAmount(totalExpenses, currentAccount?.currency)}
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <TrendingDown className="w-3 h-3 text-red-600 flex-shrink-0" />
                <span className="font-medium truncate">
                  Total spending this week
                </span>
              </div>
            </div>

            {/* Action */}
            {!currentWeek.isLocked && hasPermission("makeExpense") ? (
                <button
                  onClick={() => setActiveModal("addExpense")}
                  className="w-full btn-primary !bg-rose-600 hover:!bg-rose-700 !py-2.5 !text-sm flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4 flex-shrink-0" />
                  <span>Add Expense</span>
                </button>
            ) : (
              <div className="bg-slate-100 rounded-lg sm:rounded-xl p-2.5 sm:p-3 text-center">
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
      <div className="px-3 sm:px-6 pb-4 sm:pb-6">
        <div
          className={`
          p-5 sm:p-6 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all duration-300
          ${
            netBalance >= 0
              ? "bg-emerald-500/5 border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.05)]"
              : "bg-rose-500/5 border-rose-500/20 shadow-[0_0_30px_rgba(244,63,94,0.05)]"
          }
        `}
        >
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <div className={`p-3 rounded-xl ${netBalance >= 0 ? "bg-emerald-500/20" : "bg-rose-500/20"}`}>
              {netBalance >= 0 ? (
                <TrendingUp className="w-6 h-6 text-emerald-400" />
              ) : (
                <TrendingDown className="w-6 h-6 text-rose-400" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-1">
                Net Balance (Bank + Cash - Expenses)
              </div>
              <div
                className={`text-2xl sm:text-3xl font-black tracking-tight ${
                  netBalance >= 0 ? "text-emerald-400" : "text-rose-400"
                } truncate`}
              >
                {formatAmount(netBalance, currentAccount?.currency)}
              </div>
            </div>
          </div>
          <div className="flex-shrink-0 self-end sm:self-auto">
            <HelpIcon
              content="This shows your overall financial position for the week. It's calculated as: (Bank Balance + Cash) - Total Expenses. A positive number means you're in good shape!"
              position="left"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialOverview;
