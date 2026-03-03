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
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      {/* Bank Balance Card */}
      <div className="bg-white shadow-md rounded-2xl p-6 border border-slate-200 hover:shadow-lg transition-shadow">
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
            ${getExpectedBankAmount().toFixed(2)}
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
      <div className="bg-white shadow-md rounded-2xl p-6 border border-slate-200 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-600 p-2.5 rounded-xl">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-semibold text-slate-700">Cash Box</span>
          </div>
        </div>
        <div className="text-4xl font-bold text-slate-900 mb-2">
          ${getExpectedCashAmount().toFixed(2)}
        </div>
        <div className="text-xs text-slate-600 mb-5 font-medium">Current balance</div>
        {!currentWeek.isLocked && hasPermission("calculateCash") && (
          <button
            onClick={() => setActiveModal("addCash")}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-4 py-3 transition-all flex items-center justify-center gap-2 font-semibold shadow-sm"
          >
            <DollarSign className="w-4 h-4" />
            Top Up Cash Balance
          </button>
        )}
      </div>

      {/* Total Expenses Card */}
      <div className="bg-white shadow-md rounded-2xl p-6 border border-slate-200 hover:shadow-lg transition-shadow">
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
          ${getTotalExpenses().toFixed(2)}
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
