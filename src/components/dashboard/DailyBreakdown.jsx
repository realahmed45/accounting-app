import React, { useState } from "react";
import {
  Calendar,
  ChevronDown,
  ChevronRight,
  Receipt,
  Camera,
  Trash2,
  CreditCard,
  Clock,
  UserCheck,
  UserX,
  FileText,
  User,
  Briefcase,
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
  currentAccount,
  formatAmount,
  handleDeleteExpense,
  currentWeek,
  hasPermission,
  bankAccounts,
  dailyActivity,
}) => {
  const [expandedSections, setExpandedSections] = useState({});

  const formatTime = (isoString) => {
    if (!isoString) return "";
    return new Date(isoString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const toggleSection = (dateStr, section) => {
    const key = `${dateStr}-${section}`;
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const isSectionExpanded = (dateStr, section) =>
    expandedSections[`${dateStr}-${section}`];

  const getActivityCount = (dateStr) => {
    if (!dailyActivity) return getExpensesForDate(dateStr).length;
    const dayData = dailyActivity.find((d) => d.date === dateStr);
    if (!dayData) return 0;
    return (
      (dayData.expenses?.length || 0) +
      (dayData.shifts?.length || 0) +
      (dayData.checkIns?.length || 0) +
      (dayData.checkOuts?.length || 0) +
      (dayData.workLogs?.length || 0) +
      (dayData.activities?.length || 0)
    );
  };

  const ActivitySection = ({
    dateStr,
    section,
    icon: Icon,
    title,
    count,
    color,
    children,
  }) => {
    const isExpanded = isSectionExpanded(dateStr, section);
    if (count === 0) return null;

    return (
      <div className="border border-slate-200 rounded-lg overflow-hidden">
        <button
          onClick={() => toggleSection(dateStr, section)}
          className={`w-full px-4 py-2.5 bg-${color}-50 hover:bg-${color}-100 flex items-center justify-between transition-colors`}
        >
          <div className="flex items-center gap-2">
            <ChevronRight
              className={`w-4 h-4 text-${color}-600 transition-transform ${isExpanded ? "rotate-90" : ""}`}
            />
            <Icon className={`w-4 h-4 text-${color}-600`} />
            <span className="font-semibold text-slate-800">{title}</span>
            <span
              className={`px-2 py-0.5 bg-${color}-600 text-white text-xs rounded-full font-bold`}
            >
              {count}
            </span>
          </div>
        </button>
        {isExpanded && <div className="p-3 bg-white space-y-2">{children}</div>}
      </div>
    );
  };

  return (
    <div className="bg-white p-6 border-b border-gray-200">
      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        <div className="bg-emerald-500 p-2 rounded-lg">
          <Calendar className="w-4 h-4 text-white" />
        </div>
        Daily Activity
      </h3>

      <div className="space-y-2">
        {weekDates.map((date) => {
          const dateStr = formatDate(date);
          const dayExpenses = getExpensesForDate(dateStr);
          const dayTotal = getDayTotal(dateStr);
          const activityCount = getActivityCount(dateStr);
          const isExpanded = expandedDays.includes(dateStr);
          const dayData = dailyActivity?.find((d) => d.date === dateStr);

          return (
            <div
              key={dateStr}
              className="border border-slate-200 rounded-lg overflow-hidden hover:border-emerald-400 transition-all"
            >
              <button
                onClick={() => toggleDayExpansion(dateStr)}
                className="w-full px-4 py-3 bg-slate-50 hover:bg-emerald-50 flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Calendar
                    className={`w-5 h-5 ${isExpanded ? "text-emerald-600" : "text-slate-400"}`}
                  />
                  <div className="text-left">
                    <span className="font-bold text-slate-800">
                      {formatDateReadable(date)}
                    </span>
                    <span className="ml-2 px-2 py-0.5 bg-slate-200 text-slate-700 text-xs rounded-full font-semibold">
                      {activityCount}{" "}
                      {activityCount !== 1 ? "activities" : "activity"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-slate-900">
                    {formatAmount(dayTotal, currentAccount?.currency)}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                  />
                </div>
              </button>

              {isExpanded && (
                <div className="p-4 bg-white space-y-2 border-t border-slate-200">
                  {activityCount === 0 && (
                    <div className="text-center py-8 text-slate-400">
                      <FileText className="w-12 h-12 mx-auto mb-3 opacity-40" />
                      <p className="font-medium">No activity for this day</p>
                    </div>
                  )}

                  {/* Expenses Section */}
                  <ActivitySection
                    dateStr={dateStr}
                    section="expenses"
                    icon={Receipt}
                    title="Expenses"
                    count={dayData?.expenses?.length || 0}
                    color="red"
                  >
                    {dayData?.expenses?.map((expense) => (
                      <div
                        key={expense._id}
                        className="flex items-start justify-between p-3 bg-red-50 border-l-4 border-red-500 rounded-md group"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-lg font-bold text-slate-800">
                              {formatAmount(
                                expense.amount,
                                currentAccount?.currency,
                              )}
                            </span>
                            <span className="px-2 py-0.5 bg-slate-700 text-white text-xs rounded-full">
                              {expense.category}
                            </span>
                            {expense.paymentSource === "bank" &&
                              expense.bankAccountId && (
                                <span className="flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                                  <CreditCard className="w-3 h-3" />
                                  {bankAccounts.find(
                                    (ba) => ba._id === expense.bankAccountId,
                                  )?.name || "Bank"}
                                </span>
                              )}
                            {expense.paymentSource === "cash" && (
                              <span className="px-2 py-0.5 bg-emerald-600 text-white text-xs rounded-full">
                                💵 Cash
                              </span>
                            )}
                          </div>
                          {expense.note && (
                            <p className="text-sm text-slate-700 mt-1">
                              "{expense.note}"
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-1 text-xs text-slate-600">
                            <User className="w-3 h-3" />
                            <span>{expense.user?.name || "Unknown"}</span>
                            <Clock className="w-3 h-3 ml-2" />
                            <span>{formatTime(expense.timestamp)}</span>
                            {expense.photos?.length > 0 && (
                              <>
                                <Camera className="w-3 h-3 ml-2 text-emerald-600" />
                                <span className="text-emerald-700 font-medium">
                                  {expense.photos.length} proof
                                  {expense.photos.length !== 1 ? "s" : ""}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 ml-2">
                          <button
                            onClick={() =>
                              setSelectedExpenseForPhoto(
                                dayExpenses.find((e) => e._id === expense._id),
                              )
                            }
                            className="p-1.5 text-emerald-600 hover:bg-emerald-100 rounded transition-all"
                            title="View/Upload Photos"
                          >
                            <Camera className="w-4 h-4" />
                          </button>
                          {!currentWeek.isLocked &&
                            hasPermission("makeExpense") && (
                              <button
                                onClick={() => handleDeleteExpense(expense._id)}
                                className="p-1.5 text-red-600 hover:bg-red-100 rounded transition-all"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                        </div>
                      </div>
                    ))}
                  </ActivitySection>

                  {/* Shifts Section */}
                  <ActivitySection
                    dateStr={dateStr}
                    section="shifts"
                    icon={Briefcase}
                    title="Shifts"
                    count={dayData?.shifts?.length || 0}
                    color="blue"
                  >
                    {dayData?.shifts?.map((shift) => (
                      <div
                        key={shift._id}
                        className={`p-3 rounded-md border-l-4 ${shift.status === "assigned" ? "bg-blue-50 border-blue-500" : shift.status === "cancelled" ? "bg-gray-100 border-gray-400" : "bg-amber-50 border-amber-500"}`}
                      >
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-slate-800">
                            {shift.type.label}
                          </span>
                          <span className="text-sm text-slate-600">
                            {shift.type.startTime} - {shift.type.endTime}
                          </span>
                          <span
                            className={`px-2 py-0.5 text-white text-xs rounded-full font-bold ${shift.status === "assigned" ? "bg-blue-600" : shift.status === "cancelled" ? "bg-gray-600" : "bg-amber-600"}`}
                          >
                            {shift.status.toUpperCase()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-xs text-slate-600">
                          {shift.assignedTo && (
                            <>
                              <User className="w-3 h-3" />
                              <span className="font-medium">
                                {shift.assignedTo.name}
                              </span>
                            </>
                          )}
                          {shift.createdBy && (
                            <span className="ml-2 opacity-60">
                              Created by: {shift.createdBy.name}
                            </span>
                          )}
                        </div>
                        {shift.notes && (
                          <p className="text-sm text-slate-700 mt-1">
                            {shift.notes}
                          </p>
                        )}
                      </div>
                    ))}
                  </ActivitySection>

                  {/* Check-ins Section */}
                  <ActivitySection
                    dateStr={dateStr}
                    section="checkins"
                    icon={UserCheck}
                    title="Check-Ins"
                    count={dayData?.checkIns?.length || 0}
                    color="green"
                  >
                    {dayData?.checkIns?.map((checkIn) => (
                      <div
                        key={checkIn._id}
                        className="p-3 bg-green-50 border-l-4 border-green-500 rounded-md"
                      >
                        <div className="font-bold text-slate-800 mb-1">
                          {checkIn.member?.name || "Unknown"} checked in
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-600">
                          <Clock className="w-3 h-3" />
                          <span className="font-semibold">
                            {formatTime(checkIn.checkInTime)}
                          </span>
                          <Camera className="w-3 h-3 ml-2 text-emerald-600" />
                          <span className="text-emerald-700">Photo proof</span>
                        </div>
                      </div>
                    ))}
                  </ActivitySection>

                  {/* Check-outs Section */}
                  <ActivitySection
                    dateStr={dateStr}
                    section="checkouts"
                    icon={UserX}
                    title="Check-Outs"
                    count={dayData?.checkOuts?.length || 0}
                    color="orange"
                  >
                    {dayData?.checkOuts?.map((checkOut) => (
                      <div
                        key={checkOut._id}
                        className="p-3 bg-orange-50 border-l-4 border-orange-500 rounded-md"
                      >
                        <div className="font-bold text-slate-800 mb-1">
                          {checkOut.member?.name || "Unknown"} checked out
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-600">
                          <Clock className="w-3 h-3" />
                          <span className="font-semibold">
                            {formatTime(checkOut.checkOutTime)}
                          </span>
                          <Camera className="w-3 h-3 ml-2 text-emerald-600" />
                          <span className="text-emerald-700">Photo proof</span>
                        </div>
                      </div>
                    ))}
                  </ActivitySection>

                  {/* Work Logs Section */}
                  <ActivitySection
                    dateStr={dateStr}
                    section="worklogs"
                    icon={Clock}
                    title="Work Logs"
                    count={dayData?.workLogs?.length || 0}
                    color="purple"
                  >
                    {dayData?.workLogs?.map((log) => {
                      const hours = Math.floor(log.durationMinutes / 60);
                      const minutes = log.durationMinutes % 60;
                      return (
                        <div
                          key={log._id}
                          className="p-3 bg-purple-50 border-l-4 border-purple-500 rounded-md"
                        >
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-slate-800">
                              {log.member?.name || "Unknown"}
                            </span>
                            <span className="text-sm text-slate-600">
                              {log.startTime} - {log.endTime}
                            </span>
                            <span className="px-2 py-0.5 bg-purple-600 text-white text-xs rounded-full font-bold">
                              {hours}h {minutes}m
                            </span>
                          </div>
                          {log.note && (
                            <p className="text-sm text-slate-700 mt-1">
                              "{log.note}"
                            </p>
                          )}
                          <div className="text-xs text-slate-600 mt-1">
                            Logged by: {log.loggedBy?.name || "Unknown"}
                          </div>
                        </div>
                      );
                    })}
                  </ActivitySection>

                  {/* Other Activities Section */}
                  <ActivitySection
                    dateStr={dateStr}
                    section="activities"
                    icon={FileText}
                    title="Other Activities"
                    count={dayData?.activities?.length || 0}
                    color="indigo"
                  >
                    {dayData?.activities?.map((activity) => {
                      const getActivityStyle = (action) => {
                        if (action.includes("bank") || action.includes("cash"))
                          return {
                            bg: "bg-emerald-50",
                            border: "border-emerald-500",
                            icon: "💰",
                          };
                        if (
                          action.includes("permission") ||
                          action.includes("member")
                        )
                          return {
                            bg: "bg-blue-50",
                            border: "border-blue-500",
                            icon: "👥",
                          };
                        if (action.includes("week"))
                          return {
                            bg: "bg-amber-50",
                            border: "border-amber-500",
                            icon: "📅",
                          };
                        if (action.includes("category"))
                          return {
                            bg: "bg-pink-50",
                            border: "border-pink-500",
                            icon: "🏷️",
                          };
                        if (action.includes("ownership"))
                          return {
                            bg: "bg-red-50",
                            border: "border-red-500",
                            icon: "👑",
                          };
                        if (action.includes("shift_type"))
                          return {
                            bg: "bg-cyan-50",
                            border: "border-cyan-500",
                            icon: "⏰",
                          };
                        return {
                          bg: "bg-slate-50",
                          border: "border-slate-500",
                          icon: "📝",
                        };
                      };
                      const style = getActivityStyle(activity.action);
                      return (
                        <div
                          key={activity._id}
                          className={`p-3 ${style.bg} border-l-4 ${style.border} rounded-md`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg">{style.icon}</span>
                            <span className="font-bold text-slate-800">
                              {activity.description}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-600">
                            <User className="w-3 h-3" />
                            <span>{activity.actorName}</span>
                            <Clock className="w-3 h-3 ml-2" />
                            <span>{formatTime(activity.timestamp)}</span>
                            <span className="px-2 py-0.5 bg-slate-200 text-slate-700 rounded text-xs ml-2">
                              {activity.action.replace(/_/g, " ").toUpperCase()}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </ActivitySection>

                  {/* Fallback for old expense display */}
                  {!dailyActivity && dayExpenses.length > 0 && (
                    <div className="space-y-2">
                      {dayExpenses.map((expense) => (
                        <div
                          key={expense._id}
                          className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-md hover:border-emerald-300 transition-all"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-lg font-bold text-slate-800">
                                {formatAmount(
                                  expense.amount,
                                  currentAccount?.currency,
                                )}
                              </span>
                              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-xs rounded-full">
                                {expense.category}
                              </span>
                              {expense.paymentSource === "bank" &&
                                expense.bankAccountId && (
                                  <span className="flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-800 text-xs rounded-full">
                                    <CreditCard className="w-3 h-3" />
                                    {bankAccounts.find(
                                      (ba) => ba._id === expense.bankAccountId,
                                    )?.name || "Bank"}
                                  </span>
                                )}
                              {expense.paymentSource === "cash" && (
                                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-xs rounded-full">
                                  💵 Cash
                                </span>
                              )}
                            </div>
                            {expense.note && (
                              <p className="text-sm text-slate-600 mt-1">
                                {expense.note}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-1 ml-2">
                            <button
                              onClick={() =>
                                setSelectedExpenseForPhoto(expense)
                              }
                              className="p-1.5 text-emerald-600 hover:bg-emerald-100 rounded transition-all"
                              title="View/Upload Photos"
                            >
                              <Camera className="w-4 h-4" />
                            </button>
                            {!currentWeek.isLocked &&
                              hasPermission("makeExpense") && (
                                <button
                                  onClick={() =>
                                    handleDeleteExpense(expense._id)
                                  }
                                  className="p-1.5 text-red-600 hover:bg-red-100 rounded transition-all"
                                  title="Delete"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                          </div>
                        </div>
                      ))}
                    </div>
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
