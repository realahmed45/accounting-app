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
  Download,
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

  // Export week data to CSV - NEW FEATURE
  const exportWeekToCSV = () => {
    const allExpenses = weekDates.flatMap((date) =>
      getExpensesForDate(formatDate(date)),
    );

    const headers = [
      "Date",
      "Description",
      "Amount",
      "Category",
      "Person",
      "Source",
      "Time",
    ];
    const rows = allExpenses.map((e) => [
      new Date(e.date).toLocaleDateString(),
      e.note || "",
      e.amount,
      e.category || "Uncategorized",
      e.personName || "Unknown",
      e.source || "Unknown",
      new Date(e.createdAt || e.date).toLocaleTimeString(),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `weekly-expenses-${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

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
      <div className="glass-card overflow-hidden hover:border-slate-700 transition-all duration-300">
        <button
          onClick={() => toggleSection(dateStr, section)}
          className={`w-full px-5 py-4 bg-transparent hover:bg-white/5 flex items-center justify-between transition-all group border-l-4 border-l-${color}-500/50`}
        >
          <div className="flex items-center gap-4">
            <ChevronRight
              className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isExpanded ? "rotate-90 text-white" : ""}`}
            />
            <div className={`p-2.5 rounded-xl bg-${color}-500/20 text-${color}-400 shadow-sm group-hover:scale-110 transition-transform`}>
              <Icon className="w-5 h-5" />
            </div>
            <span className="font-bold text-white text-base tracking-tight">{title}</span>
            <span
              className={`px-2.5 py-0.5 bg-${color}-500/10 text-${color}-400 text-[10px] rounded-full font-black border border-${color}-500/20 uppercase tracking-widest`}
            >
              {count}
            </span>
          </div>
        </button>
        {isExpanded && (
          <div className="p-5 bg-white/5 space-y-4 border-t border-white/5">
            {children}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header with Instructions */}
      <div className="p-6 glass-card border-white/5 relative overflow-hidden group">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-600/5 rounded-full blur-[100px] group-hover:bg-emerald-600/10 transition-all duration-700"></div>
        <div className="flex items-center justify-between flex-wrap gap-3 sm:gap-4 mb-3 sm:mb-4">
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            <div className="bg-gradient-to-br from-emerald-600 to-teal-600 p-2 sm:p-3 rounded-lg sm:rounded-xl shadow-lg flex-shrink-0">
              <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-lg sm:text-2xl font-black text-white flex items-center gap-1.5 sm:gap-2 truncate">
                <span className="truncate">Daily Activity</span>
                <div className="flex-shrink-0">
                  <HelpIcon content="Click any day to expand and see all expenses, shifts, check-ins, and activities. Days with more activity show higher counts." />
                </div>
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 font-medium mt-0.5 sm:mt-1 truncate">
                📅 Week view • Tap any day
              </p>
            </div>
          </div>

          {/* Export Button */}
          <button
            onClick={exportWeekToCSV}
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all text-sm sm:text-base active:scale-95 flex-shrink-0"
          >
            <Download className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Export Week</span>
            <span className="sm:hidden">Export</span>
          </button>
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

      <div className="p-3 sm:p-6 space-y-2 sm:space-y-3">
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
              className="glass-card border-white/5 overflow-hidden hover:border-emerald-500/30 transition-all duration-300 group"
            >
              <button
                onClick={() => toggleDayExpansion(dateStr)}
                className="w-full px-5 py-4 bg-transparent hover:bg-white/5 flex items-center justify-between transition-all active:scale-[0.99]"
              >
                <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
                  <div
                    className={`p-2.5 rounded-xl transition-all duration-500 flex-shrink-0 ${
                      isExpanded
                        ? "bg-emerald-500/20 text-emerald-400 rotate-12 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                        : "bg-slate-800 text-slate-500 group-hover:bg-slate-700"
                    }`}
                  >
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div className="text-left min-w-0 flex-1">
                    <span className="font-black text-lg text-white block tracking-tight">
                      {formatDateReadable(date)}
                    </span>
                    <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5 sm:mt-1 flex-wrap">
                      <span
                        className={`px-3 py-1 ${
                          activityCount > 0
                            ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                            : "bg-slate-800/50 text-slate-500 border border-slate-700/50"
                        } text-[10px] rounded-full font-bold uppercase tracking-wider whitespace-nowrap`}
                      >
                        {activityCount}{" "}
                        <span>
                          {activityCount !== 1 ? "Activities" : "Activity"}
                        </span>
                      </span>
                      {dayTotal > 0 && (
                        <span className="px-3 py-1 bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] rounded-full font-bold uppercase tracking-wider whitespace-nowrap truncate max-w-[150px]">
                          {formatAmount(dayTotal, currentAccount?.currency)}{" "}
                          <span>spent</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <ChevronDown
                    className={`w-5 h-5 sm:w-6 sm:h-6 text-slate-400 group-hover:text-emerald-600 transition-all ${
                      isExpanded ? "rotate-180 text-emerald-600" : ""
                    }`}
                  />
                </div>
              </button>

              {isExpanded && (
                <div className="p-5 bg-white/5 space-y-4 border-t border-white/5">
                  {activityCount === 0 && (
                    <div className="text-center py-12 bg-white/5 rounded-2xl border-2 border-dashed border-white/10">
                      <FileText className="w-16 h-16 mx-auto mb-4 text-slate-700" />
                      <p className="font-bold text-white text-lg mb-2 px-4 tracking-tight">
                        No Activity Yet
                      </p>
                      <p className="text-slate-400 text-xs px-4 font-medium uppercase tracking-widest">
                        Add expenses or schedule activities
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
                        className="flex flex-col sm:flex-row sm:items-start justify-between p-2.5 sm:p-3 bg-red-50 border-l-4 border-red-500 rounded-md group gap-2"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 flex-wrap mb-2">
                            <span className="text-xl font-black text-white tracking-tight">
                              {formatAmount(
                                expense.amount,
                                currentAccount?.currency,
                              )}
                            </span>
                            <span className="px-2 py-0.5 bg-white/10 text-slate-300 text-[10px] font-bold rounded uppercase tracking-widest border border-white/5">
                              {expense.category}
                            </span>
                            {expense.paymentSource === "bank" &&
                              expense.bankAccountId && (
                                <span className="flex items-center gap-1.5 px-2 py-0.5 bg-blue-500/10 text-blue-400 text-[10px] font-bold rounded uppercase tracking-widest border border-blue-500/20">
                                  <CreditCard className="w-3 h-3 flex-shrink-0" />
                                  <span className="truncate max-w-[80px]">
                                    {bankAccounts.find(
                                      (ba) => ba._id === expense.bankAccountId,
                                    )?.name || "Bank"}
                                  </span>
                                </span>
                              )}
                            {expense.paymentSource === "cash" && (
                              <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold rounded uppercase tracking-widest border border-emerald-500/20">
                                💵 Cash
                              </span>
                            )}
                          </div>
                          {expense.note && (
                            <p className="text-sm text-slate-400 mb-2 leading-relaxed italic opacity-80">
                              "{expense.note}"
                            </p>
                          )}
                          <div className="flex items-center gap-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest flex-wrap">
                            <div className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              <span>{expense.user?.name || "System"}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{formatTime(expense.timestamp)}</span>
                            </div>
                            {expense.photos?.length > 0 && (
                              <div className="flex items-center gap-1 text-emerald-500/80">
                                <Camera className="w-3 h-3" />
                                <span>{expense.photos.length} PROOF</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 self-end sm:self-center">
                          <button
                            onClick={() =>
                              setSelectedExpenseForPhoto(
                                dayExpenses.find((e) => e._id === expense._id),
                              )
                            }
                            className="p-2 text-emerald-400 hover:bg-emerald-500/20 rounded-xl transition-all"
                            title="View/Upload Photos"
                          >
                            <Camera className="w-5 h-5" />
                          </button>
                          {!currentWeek.isLocked &&
                            hasPermission("makeExpense") && (
                              <button
                                onClick={() => handleDeleteExpense(expense._id)}
                                className="p-2 text-rose-400 hover:bg-rose-500/20 rounded-xl transition-all"
                                title="Delete"
                              >
                                <Trash2 className="w-5 h-5" />
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
                        className="p-4 bg-indigo-500/5 border-l-4 border-indigo-500/50 rounded-r-xl"
                      >
                        <div className="flex items-center gap-3 flex-wrap mb-2">
                          <span className="font-black text-white tracking-tight">
                            {shift.type.label}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            {shift.type.startTime} - {shift.type.endTime}
                          </span>
                          <span
                            className={`px-2 py-0.5 text-[10px] rounded font-black uppercase tracking-widest border ${
                              shift.status === "assigned" 
                                ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" 
                                : shift.status === "cancelled" 
                                  ? "bg-slate-500/10 text-slate-400 border-slate-500/20" 
                                  : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                            }`}
                          >
                            {shift.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                          {shift.assignedTo && (
                            <div className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              <span>{shift.assignedTo.name}</span>
                            </div>
                          )}
                          {shift.createdBy && (
                            <div className="flex items-center gap-1 opacity-60">
                              <span>BY {shift.createdBy.name}</span>
                            </div>
                          )}
                        </div>
                        {shift.notes && (
                          <p className="text-xs text-slate-300 mt-2 italic opacity-80">
                            "{shift.notes}"
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
                    color="emerald"
                  >
                    {dayData?.checkIns?.map((checkIn) => (
                      <div
                        key={checkIn._id}
                        className="p-4 bg-emerald-500/5 border-l-4 border-emerald-500/50 rounded-r-xl"
                      >
                        <div className="font-bold text-white mb-2 tracking-tight">
                          {checkIn.member?.name || "Member"} checked in
                        </div>
                        <div className="flex items-center gap-3 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-emerald-400" />
                            <span>{formatTime(checkIn.checkInTime)}</span>
                          </div>
                          <div className="flex items-center gap-1 text-emerald-400/80">
                            <Camera className="w-3 h-3" />
                            <span>PHOTO PROOF</span>
                          </div>
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
                    color="amber"
                  >
                    {dayData?.checkOuts?.map((checkOut) => (
                      <div
                        key={checkOut._id}
                        className="p-4 bg-amber-500/5 border-l-4 border-amber-500/50 rounded-r-xl"
                      >
                        <div className="font-bold text-white mb-2 tracking-tight">
                          {checkOut.member?.name || "Member"} checked out
                        </div>
                        <div className="flex items-center gap-3 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-400" />
                            <span>{formatTime(checkOut.checkOutTime)}</span>
                          </div>
                          <div className="flex items-center gap-1 text-emerald-400/80">
                            <Camera className="w-3 h-3" />
                            <span>PHOTO PROOF</span>
                          </div>
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
                          className="p-4 bg-purple-500/5 border-l-4 border-purple-500/50 rounded-r-xl"
                        >
                          <div className="flex items-center gap-3 flex-wrap mb-2">
                            <span className="font-black text-white tracking-tight">
                              {log.member?.name || "Member"}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                              {log.startTime} - {log.endTime}
                            </span>
                            <span className="px-2 py-0.5 bg-purple-500/10 text-purple-400 text-[10px] font-black rounded border border-purple-500/20 uppercase tracking-widest">
                              {hours}H {minutes}M
                            </span>
                          </div>
                          {log.note && (
                            <p className="text-sm text-slate-300 mb-2 italic opacity-80 leading-relaxed">
                              "{log.note}"
                            </p>
                          )}
                          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                            <User className="w-3 h-3" />
                            <span>Logged by: {log.loggedBy?.name || "System"}</span>
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
                    color="violet"
                  >
                    {dayData?.activities?.map((activity) => {
                      const getActivityStyle = (action) => {
                        if (action.includes("bank") || action.includes("cash"))
                          return {
                            bg: "bg-emerald-500/10",
                            border: "border-emerald-500/30",
                            text: "text-emerald-400",
                            icon: "💰",
                          };
                        if (
                          action.includes("permission") ||
                          action.includes("member")
                        )
                          return {
                            bg: "bg-indigo-500/10",
                            border: "border-indigo-500/30",
                            text: "text-indigo-400",
                            icon: "👥",
                          };
                        if (action.includes("week"))
                          return {
                            bg: "bg-amber-500/10",
                            border: "border-amber-500/30",
                            text: "text-amber-400",
                            icon: "📅",
                          };
                        if (action.includes("category"))
                          return {
                            bg: "bg-rose-500/10",
                            border: "border-rose-500/30",
                            text: "text-rose-400",
                            icon: "🏷️",
                          };
                        if (action.includes("ownership"))
                          return {
                            bg: "bg-red-500/10",
                            border: "border-red-500/30",
                            text: "text-red-400",
                            icon: "👑",
                          };
                        if (action.includes("shift_type"))
                          return {
                            bg: "bg-cyan-500/10",
                            border: "border-cyan-500/30",
                            text: "text-cyan-400",
                            icon: "⏰",
                          };
                        return {
                          bg: "bg-slate-500/10",
                          border: "border-slate-500/30",
                          text: "text-slate-400",
                          icon: "📝",
                        };
                      };
                      const style = getActivityStyle(activity.action);
                      return (
                        <div
                          key={activity._id}
                          className={`p-4 ${style.bg} border-l-4 ${style.border} rounded-r-xl group/activity`}
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-xl group-hover/activity:scale-125 transition-transform duration-300">{style.icon}</span>
                            <span className="font-bold text-white tracking-tight">
                              {activity.description}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                            <div className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              <span>{activity.actorName}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{formatTime(activity.timestamp)}</span>
                            </div>
                            <span className={`px-2 py-0.5 bg-white/5 ${style.text} rounded text-[8px] border border-white/5`}>
                              {activity.action.replace(/_/g, " ")}
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
