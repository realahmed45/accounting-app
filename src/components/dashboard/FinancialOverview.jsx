import React from "react";
import {
  Building2,
  Wallet,
  Receipt,
  Plus,
  ArrowRightLeft,
  DollarSign,
  Edit,
} from "lucide-react";

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
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 bg-white border-b border-slate-200">
      {/* Bank Balance Card */}
      <div className="p-8 border-r border-slate-200 hover:bg-slate-50 transition-colors">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-slate-900 p-2.5 rounded-xl">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-semibold text-slate-700">
              Bank Balance
            </span>
          </div>
        </div>
        <button
          onClick={() => setActiveModal("bankAccounts")}
          className="w-full text-left group mb-5"
          disabled={bankAccounts.length === 0}
        >
          <div className="text-4xl font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
            {formatAmount(getExpectedBankAmount(), currentAccount?.currency)}
          </div>
          <div className="text-xs mt-2 font-medium text-slate-600">
            {bankAccounts.length} account
            {bankAccounts.length !== 1 ? "s" : ""} linked
            {bankAccounts.length > 0 && (
              <span className="ml-1 underline underline-offset-2 opacity-70 group-hover:opacity-100">
                — view all
              </span>
            )}
          </div>
        </button>

        <div className="space-y-2">
          {!currentWeek.isLocked &&
            bankAccounts.length > 0 &&
            hasPermission("calculateCash") && (
              <button
                onClick={() => setActiveModal("transfer")}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-4 py-3 transition-all flex items-center justify-center gap-2 font-semibold shadow-sm"
              >
                <ArrowRightLeft className="w-4 h-4" />
                Bank → Cash
              </button>
            )}
        </div>
      </div>

      {/* Cash Box Card */}
      <div className="p-8 border-r border-slate-200 hover:bg-slate-50 transition-colors">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-600 p-2.5 rounded-xl">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-semibold text-slate-700">
              Cash Box
            </span>
          </div>
        </div>
        <div className="text-4xl font-bold text-slate-900 mb-2">
          {formatAmount(getExpectedCashAmount(), currentAccount?.currency)}
        </div>
        <div className="text-xs text-slate-600 mb-5 font-medium">
          Current balance
        </div>
      </div>

      {/* Total Expenses Card */}
      <div className="p-8 hover:bg-slate-50 transition-colors">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-red-600 p-2.5 rounded-xl">
              <Receipt className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-semibold text-slate-700">
              Total Expenses
            </span>
          </div>
        </div>
        <div className="text-4xl font-bold text-slate-900 mb-2">
          {formatAmount(getTotalExpenses(), currentAccount?.currency)}
        </div>
        <div className="text-xs text-slate-600 mb-5 font-medium">
          {expenses.length} transaction
          {expenses.length !== 1 ? "s" : ""}
        </div>
        {!currentWeek.isLocked && hasPermission("makeExpense") && (
          <button
            onClick={() => setActiveModal("addExpense")}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-4 py-3 transition-all flex items-center justify-center gap-2 font-semibold shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Expense
          </button>
        )}
      </div>
    </div>
  );
};

export default FinancialOverview;
