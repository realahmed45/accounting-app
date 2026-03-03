import React from "react";
import {
  Calendar,
  ChevronDown,
  ChevronUp,
  Receipt,
  Camera,
  Trash2,
  CreditCard,
} from "lucide-react";

const DailyBreakdown = ({
  weekDates,
  formatDate,
  formatDateReadable,
  getExpensesForDate,
  getDayTotal,
  expandedDays,
  toggleDayExpansion,
  setSelectedExpenseForPhoto,
  handleDeleteExpense,
  currentWeek,
  hasPermission,
  bankAccounts,
  currentAccount,
  formatAmount,
}) => {
  return (
    <div className="bg-white p-8 border-b border-slate-200">
      <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
        <div className="bg-emerald-600 p-3 rounded-xl">
          <Calendar className="w-6 h-6 text-white" />
        </div>
        Daily Breakdown
      </h3>

      <div className="space-y-3">
        {weekDates.map((date) => {
          const dateStr = formatDate(date);
          const dayExpenses = getExpensesForDate(dateStr);
          const dayTotal = getDayTotal(dateStr);
          const isExpanded = expandedDays.includes(dateStr);

          return (
            <div
              key={dateStr}
              className="border border-slate-200 rounded-xl overflow-hidden hover:border-emerald-400 transition-all"
            >
              <button
                onClick={() => toggleDayExpansion(dateStr)}
                className="w-full px-6 py-4 bg-slate-50 hover:bg-slate-100 flex items-center justify-between transition-all"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`p-2 rounded-lg ${
                      isExpanded ? "bg-emerald-600" : "bg-slate-300"
                    }`}
                  >
                    <Calendar
                      className={`w-5 h-5 ${
                        isExpanded ? "text-white" : "text-slate-600"
                      }`}
                    />
                  </div>
                  <span className="font-bold text-slate-800 text-lg">
                    {formatDateReadable(date)}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-lg font-bold text-slate-900">
                      {formatAmount(dayTotal, currentAccount?.currency)}
                    </div>
                    <div className="text-xs text-slate-500">
                      {dayExpenses.length} transaction
                      {dayExpenses.length !== 1 ? "s" : ""}
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-6 h-6 text-emerald-600" />
                  ) : (
                    <ChevronDown className="w-6 h-6 text-slate-400" />
                  )}
                </div>
              </button>

              {isExpanded && (
                <div className="p-5 bg-white space-y-3 border-t border-slate-200">
                  {dayExpenses.length === 0 ? (
                    <div className="text-center py-8 text-slate-400">
                      <Receipt className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p className="font-medium">No expenses for this day</p>
                    </div>
                  ) : (
                    dayExpenses.map((expense) => (
                      <div
                        key={expense._id}
                        className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl hover:border-emerald-300 hover:bg-slate-100 transition-all group"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="bg-red-100 p-2 rounded-lg group-hover:bg-red-200 transition-colors">
                              <Receipt className="w-4 h-4 text-red-600" />
                            </div>
                            <span className="text-xl font-bold text-slate-800">
                              {formatAmount(
                                expense.amount,
                                currentAccount?.currency,
                              )}
                            </span>
                            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-sm rounded-full font-medium">
                              {expense.category}
                            </span>
                            {expense.paymentSource === "bank" &&
                              expense.bankAccountId && (
                                <span className="flex items-center gap-1 px-3 py-1 bg-slate-100 text-slate-800 text-sm rounded-full font-medium">
                                  <CreditCard className="w-3 h-3" />
                                  {bankAccounts.find(
                                    (ba) => ba._id === expense.bankAccountId,
                                  )?.name || "Bank"}
                                </span>
                              )}
                            {expense.paymentSource === "cash" && (
                              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-sm rounded-full font-medium">
                                💵 Cash
                              </span>
                            )}
                          </div>
                          {expense.note && (
                            <p className="text-sm text-slate-600 ml-10">
                              {expense.note}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedExpenseForPhoto(expense)}
                            className="p-2.5 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                            title="View/Upload Photos"
                          >
                            <Camera className="w-5 h-5" />
                          </button>
                          {!currentWeek.isLocked &&
                            hasPermission("makeExpense") && (
                              <button
                                onClick={() => handleDeleteExpense(expense._id)}
                                className="p-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                title="Delete"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DailyBreakdown;
