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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
      {/* Bank Balance Card */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 shadow-xl p-6 border border-blue-100">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-700">
              Bank Balance
            </span>
          </div>
        </div>
        <button
          onClick={() => setActiveModal("bankAccounts")}
          className="w-full text-left group mb-4"
          disabled={bankAccounts.length === 0}
        >
          <div className="text-4xl font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
            ${getExpectedBankAmount().toFixed(2)}
          </div>
          <div className="text-xs mt-1 font-medium text-blue-600">
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
            hasPermission("updateBankBalance") &&
            bankAccounts.length > 0 && (
              <button
                onClick={() => setActiveModal("updateBankBalances")}
                className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white px-4 py-3 transition-all flex items-center justify-center gap-2 font-bold shadow-lg hover:shadow-xl text-sm uppercase tracking-wide"
              >
                <Edit className="w-5 h-5" />
                Update Bank Balances
              </button>
            )}
          {!currentWeek.isLocked && hasPermission("addBankAccount") && (
            <button
              onClick={() => setActiveModal("addBankAccount")}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 transition-all flex items-center justify-center gap-2 font-medium shadow-md hover:shadow-lg"
            >
              <Plus className="w-4 h-4" />
              Add New Bank
            </button>
          )}
          {!currentWeek.isLocked &&
            bankAccounts.length > 0 &&
            hasPermission("calculateCash") && (
              <button
                onClick={() => setActiveModal("transfer")}
                className="w-full bg-white hover:bg-gray-50 text-blue-700 border-2 border-blue-600 px-4 py-2.5 transition-all flex items-center justify-center gap-2 font-medium shadow-md hover:shadow-lg"
              >
                <ArrowRightLeft className="w-4 h-4" />
                Bank → Cash
              </button>
            )}
        </div>
      </div>

      {/* Cash Box Card */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 shadow-xl p-6 border border-green-100">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="bg-green-600 p-2 rounded-lg">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-700">Cash Box</span>
          </div>
        </div>
        <div className="text-4xl font-bold text-gray-900 mb-2">
          ${getExpectedCashAmount().toFixed(2)}
        </div>
        <div className="text-xs text-gray-600 mb-4">Current balance</div>
        {!currentWeek.isLocked && hasPermission("calculateCash") && (
          <button
            onClick={() => setActiveModal("addCash")}
            className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 transition-all flex items-center justify-center gap-2 font-medium shadow-md hover:shadow-lg"
          >
            <DollarSign className="w-4 h-4" />
            Add Cash
          </button>
        )}
      </div>

      {/* Total Expenses Card */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 shadow-xl p-6 border border-purple-100">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="bg-purple-600 p-2 rounded-lg">
              <Receipt className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-700">
              Total Expenses
            </span>
          </div>
        </div>
        <div className="text-4xl font-bold text-gray-900 mb-2">
          ${getTotalExpenses().toFixed(2)}
        </div>
        <div className="text-xs text-gray-600 mb-4">
          {expenses.length} transaction
          {expenses.length !== 1 ? "s" : ""}
        </div>
        {!currentWeek.isLocked && hasPermission("makeExpense") && (
          <button
            onClick={() => setActiveModal("addExpense")}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 transition-all flex items-center justify-center gap-2 font-medium shadow-md hover:shadow-lg"
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
