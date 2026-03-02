import React from "react";
import { Calendar, ChevronDown, ChevronUp, Receipt, Camera, Trash2, CreditCard } from "lucide-react";

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
}) => {
  return (
    <div className="bg-white shadow-xl p-8">
      <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
        <div className="bg-gradient-to-br from-purple-600 to-pink-600 p-3 rounded-xl">
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
              className="border-2 border-gray-200 overflow-hidden hover:border-indigo-300 transition-all shadow-sm hover:shadow-md"
            >
              <button
                onClick={() => toggleDayExpansion(dateStr)}
                className="w-full px-6 py-4 bg-gradient-to-r from-gray-50 to-white hover:from-indigo-50 hover:to-purple-50 flex items-center justify-between transition-all"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`p-2 rounded-lg ${isExpanded ? "bg-indigo-600" : "bg-gray-300"}`}
                  >
                    <Calendar
                      className={`w-5 h-5 ${isExpanded ? "text-white" : "text-gray-600"}`}
                    />
                  </div>
                  <span className="font-bold text-gray-800 text-lg">
                    {formatDateReadable(date)}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">
                      ${dayTotal.toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {dayExpenses.length} transaction
                      {dayExpenses.length !== 1 ? "s" : ""}
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-6 h-6 text-indigo-600" />
                  ) : (
                    <ChevronDown className="w-6 h-6 text-gray-400" />
                  )}
                </div>
              </button>

              {isExpanded && (
                <div className="p-5 bg-white space-y-3 border-t-2 border-gray-100">
                  {dayExpenses.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <Receipt className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p className="font-medium">
                        No expenses for this day
                      </p>
                    </div>
                  ) : (
                    dayExpenses.map((expense) => (
                      <div
                        key={expense._id}
                        className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-xl hover:shadow-lg hover:border-indigo-200 transition-all group"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="bg-red-100 p-2 rounded-lg group-hover:bg-red-200 transition-colors">
                              <Receipt className="w-4 h-4 text-red-600" />
                            </div>
                            <span className="text-xl font-bold text-gray-800">
                              ${expense.amount.toFixed(2)}
                            </span>
                            <span className="px-3 py-1 bg-indigo-100 text-indigo-800 text-sm rounded-full font-medium">
                              {expense.category}
                            </span>
                            {expense.paymentSource === "bank" &&
                              expense.bankAccountId && (
                                <span className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full font-medium">
                                  <CreditCard className="w-3 h-3" />
                                  {bankAccounts.find(
                                    (ba) =>
                                      ba._id === expense.bankAccountId,
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
                            <p className="text-sm text-gray-600 ml-10">
                              {expense.note}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              setSelectedExpenseForPhoto(expense)
                            }
                            className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-xl transition-all hover:shadow-md"
                            title="View/Upload Photos"
                          >
                            <Camera className="w-5 h-5" />
                          </button>
                          {!currentWeek.isLocked &&
                            hasPermission("makeExpense") && (
                              <button
                                onClick={() =>
                                  handleDeleteExpense(expense._id)
                                }
                                className="p-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-all hover:shadow-md"
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
