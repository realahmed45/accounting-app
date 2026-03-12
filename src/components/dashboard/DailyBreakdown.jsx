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
  Info,
  HelpCircle,
} from "lucide-react";
import { HelpIcon, InstructionBox } from "../layout/Tooltip";

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
      <div className="border-2 border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition-all">
        <button
          onClick={() => toggleSection(dateStr, section)}
          className={`w-full px-4 py-3.5 bg-gradient-to-r from-${color}-50 to-${color}-100/50 hover:from-${color}-100 hover:to-${color}-50 flex items-center justify-between transition-all group border-l-4 border-${color}-500`}
        >
          <div className="flex items-center gap-3">
            <ChevronRight
              className={`w-5 h-5 text-${color}-600 transition-transform ${isExpanded ? "rotate-90" : ""}`}
            />
            <div className={`p-2 rounded-lg bg-${color}-500 shadow-md`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-slate-800 text-base">{title}</span>
            <span
              className={`px-3 py-1 bg-gradient-to-r from-${color}-600 to-${color}-700 text-white text-xs rounded-full font-black shadow-sm`}
            >
              {count}
            </span>
          </div>
        </button>
        {isExpanded && (
          <div className="p-4 bg-white space-y-3 border-t-2 border-${color}-100">
            {children}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-gradient-to-br from-white via-slate-50 to-white">
      {/* Header with Instructions */}
      <div className="p-6 border-b border-slate-200 bg-white">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-emerald-600 to-teal-600 p-3 rounded-xl shadow-lg">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                Daily Activity Breakdown
                <HelpIcon content="Click any day to expand and see all expenses, shifts, check-ins, and activities. Days with more activity show higher counts." />
              </h3>
              <p className="text-sm text-slate-600 font-medium mt-1">
                📅 Week view • Click any day to expand details
              </p>
            </div>
          </div>
        </div>

        {/* First-time user instruction */}
        {weekDates.every(
          (date) => getExpensesForDate(formatDate(date)).length === 0,
        ) && (
          <InstructionBox
            title="How to use Daily Breakdown"
            variant="info"
            icon={Info}
          >
            This section shows all your daily activities organized by date.{" "}
            <strong>Click on any day</strong> below to expand and see expenses,
            shifts, check-ins, and work logs. When you add expenses or
            activities, they'll appear here automatically!
          </InstructionBox>
        )}
      </div>

      <div className="p-6 space-y-3">
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
              className="border-2 border-slate-200 rounded-2xl overflow-hidden hover:border-emerald-400 hover:shadow-lg transition-all bg-white"
            >
              <button
                onClick={() => toggleDayExpansion(dateStr)}
                className="w-full px-5 py-4 bg-gradient-to-r from-slate-50 to-white hover:from-emerald-50 hover:to-teal-50 flex items-center justify-between transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`p-2.5 rounded-xl transition-all ${
                      isExpanded
                        ? "bg-gradient-to-br from-emerald-600 to-teal-600 shadow-lg"
                        : "bg-slate-200 group-hover:bg-emerald-100"
                    }`}
                  >
                    <Calendar
                      className={`w-6 h-6 ${
                        isExpanded
                          ? "text-white"
                          : "text-slate-600 group-hover:text-emerald-700"
                      }`}
                    />
                  </div>
                  <div className="text-left">
                    <span className="font-black text-lg text-slate-800 block">
                      {formatDateReadable(date)}
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`px-3 py-1 ${
                          activityCount > 0
                            ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                            : "bg-slate-200 text-slate-600"
                        } text-xs rounded-full font-bold`}
                      >
                        {activityCount}{" "}
                        {activityCount !== 1 ? "Activities" : "Activity"}
                      </span>
                      {dayTotal > 0 && (
                        <span className="px-3 py-1 bg-red-100 text-red-700 text-xs rounded-full font-bold">
                          {formatAmount(dayTotal, currentAccount?.currency)}{" "}
                          spent
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <ChevronDown
                    className={`w-6 h-6 text-slate-400 group-hover:text-emerald-600 transition-all ${
                      isExpanded ? "rotate-180 text-emerald-600" : ""
                    }`}
                  />
                </div>
              </button>

              {isExpanded && (
                <div className="p-5 bg-slate-50/50 space-y-3 border-t-2 border-slate-200">
                  {activityCount === 0 && (
                    <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-slate-300">
                      <FileText className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                      <p className="font-bold text-slate-800 text-lg mb-2">
                        No Activity Yet
                      </p>
                      <p className="text-slate-500 text-sm">
                        Add expenses or schedule activities for this day to see
                        them here!
                      </p>
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
