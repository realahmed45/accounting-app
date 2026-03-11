import React, { useState, useEffect } from "react";
import {
  Users,
  Plus,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  MoreVertical,
  UserPlus,
  Trash2,
  Edit,
  CheckCircle2,
  AlertCircle,
  Shapes,
  Gamepad2,
  Lightbulb,
  Info,
  HelpCircle,
} from "lucide-react";
import { shiftService, shiftTypeService } from "../../services/scheduleApi";
import { memberService } from "../../services/api";
import CreateShiftModal from "./CreateShiftModal";
import AssignMemberModal from "./AssignMemberModal";
import CheckInProofModal from "./CheckInProofModal";

const FullScheduleGrid = ({ accountId }) => {
  const [weeksOffset, setWeeksOffset] = useState(0);
  const [days, setDays] = useState([]);
  const [members, setMembers] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [shiftTypes, setShiftTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showProofModal, setShowProofModal] = useState(false);
  const [selectedShift, setSelectedShift] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    if (accountId) {
      loadData();
    }
  }, [weeksOffset, accountId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const startOfWeek = new Date();
      startOfWeek.setDate(
        startOfWeek.getDate() -
          (startOfWeek.getDay() || 7) +
          1 +
          weeksOffset * 7,
      );
      startOfWeek.setHours(0, 0, 0, 0);

      const weekDays = [];
      for (let i = 0; i < 7; i++) {
        const d = new Date(startOfWeek);
        d.setDate(d.getDate() + i);
        weekDays.push(d);
      }
      setDays(weekDays);

      const from = weekDays[0].toISOString();
      const to = weekDays[6].toISOString();

      const [shiftsRes, membersRes, typesRes] = await Promise.all([
        shiftService.getRange(accountId, { from, to }),
        memberService.getAll(accountId),
        shiftTypeService.getAll(accountId),
      ]);

      setShifts(shiftsRes.data);
      setMembers(membersRes.data);
      setShiftTypes(typesRes.data);
    } catch (err) {
      setError("Failed to load schedule data");
    } finally {
      setLoading(false);
    }
  };

  const getShiftsForDayAndMember = (day, memberId) => {
    return shifts.filter((s) => {
      const sDate = new Date(s.date);
      return (
        sDate.toDateString() === day.toDateString() &&
        s.assignedMemberId?._id === memberId
      );
    });
  };

  const getUnassignedShiftsForDay = (day) => {
    return shifts.filter((s) => {
      const sDate = new Date(s.date);
      return sDate.toDateString() === day.toDateString() && !s.assignedMemberId;
    });
  };

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center py-40">
        <div className="w-16 h-16 relative">
          <div className="absolute inset-0 bg-indigo-500 rounded-full blur-2xl opacity-20 animate-pulse" />
          <div className="w-16 h-16 border-4 border-white/10 border-t-indigo-500 rounded-full animate-spin relative z-10" />
        </div>
        <p className="text-gray-400 font-black uppercase tracking-[0.3em] text-[10px] mt-8">
          Parsing Neural Grid...
        </p>
      </div>
    );

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-1000">
      <style>{`
        .grid-header {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .staff-cell {
          background: rgba(255, 255, 255, 0.02);
          border-right: 1px solid rgba(255, 255, 255, 0.05);
        }
        .day-cell {
          border-right: 1px solid rgba(255, 255, 255, 0.05);
        }
        .day-cell:hover {
          background: rgba(255, 255, 255, 0.02);
        }
        .current-day {
          background: rgba(99, 102, 241, 0.05) !important;
        }
      `}</style>

      {/* 🎯 MANAGER INSTRUCTIONS */}
      <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-2 border-purple-400/30 rounded-3xl p-6 backdrop-blur-sm">
        <div className="flex items-start gap-4">
          <div className="bg-purple-500 text-white p-3 rounded-xl flex-shrink-0">
            <Lightbulb className="w-6 h-6" />
          </div>
          <div className="flex-1 space-y-4">
            <h3 className="text-xl font-black text-white flex items-center gap-2">
              <span className="text-red-500 text-2xl">!</span> Team Roster -
              Manager Guide
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                <h4 className="font-bold text-purple-300 mb-2 flex items-center gap-2">
                  <span className="text-red-500">!</span> 1. Create Shifts
                </h4>
                <p className="text-gray-300 text-xs leading-relaxed">
                  Click the blue "Initialize Shift" button to create a new
                  shift. Select date, time, and shift type.
                </p>
              </div>

              <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                <h4 className="font-bold text-purple-300 mb-2 flex items-center gap-2">
                  <span className="text-red-500">!</span> 2. Assign Team Members
                </h4>
                <p className="text-gray-300 text-xs leading-relaxed">
                  Click on "Open Clusters" (unassigned shifts in orange) to
                  assign them to team members from the list.
                </p>
              </div>

              <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                <h4 className="font-bold text-purple-300 mb-2 flex items-center gap-2">
                  <span className="text-red-500">!</span> 3. Navigate Weeks
                </h4>
                <p className="text-gray-300 text-xs leading-relaxed">
                  Use arrow buttons to move between weeks. Click "Today" to
                  return to current week instantly.
                </p>
              </div>

              <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                <h4 className="font-bold text-purple-300 mb-2 flex items-center gap-2">
                  <span className="text-red-500">!</span> 4. View Attendance
                </h4>
                <p className="text-gray-300 text-xs leading-relaxed">
                  Click any assigned shift card to see check-in/out proof
                  (camera photo + GPS location).
                </p>
              </div>

              <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                <h4 className="font-bold text-purple-300 mb-2 flex items-center gap-2">
                  <span className="text-red-500">!</span> 5. Grid Layout
                </h4>
                <p className="text-gray-300 text-xs leading-relaxed">
                  Each row = one team member. Each column = one day. Colored
                  cards = scheduled shifts.
                </p>
              </div>

              <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                <h4 className="font-bold text-purple-300 mb-2 flex items-center gap-2">
                  <span className="text-red-500">!</span> 6. Define Shift Types
                </h4>
                <p className="text-gray-300 text-xs leading-relaxed">
                  Scroll down to "Shift Types" section to create reusable shift
                  templates (Morning, Evening, etc.).
                </p>
              </div>
            </div>

            <div className="bg-amber-500/10 border border-amber-400/30 rounded-xl p-3 flex items-start gap-3">
              <Info className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1 space-y-2">
                <p className="text-amber-200 text-xs font-semibold">
                  <span className="text-red-500 font-bold">!</span> First Time
                  Setup:
                </p>
                <ol className="text-amber-200 text-xs space-y-1 list-decimal list-inside ml-2">
                  <li>
                    Create shift types below (e.g., "Morning 9-5", "Night 10-6")
                  </li>
                  <li>
                    Return here and click "Initialize Shift" to schedule them
                  </li>
                  <li>
                    Assign shifts to team members by clicking orange cards
                  </li>
                  <li>Team members will see their shifts in "My Hub" tab</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-white/5 border border-white/10 rounded-2xl p-1 shadow-2xl backdrop-blur-xl">
            <button
              onClick={() => setWeeksOffset((v) => v - 1)}
              className="p-2 md:p-3 hover:bg-white/10 rounded-xl transition-all group"
            >
              <ChevronLeft className="w-4 h-4 md:w-5 md:h-5 text-gray-400 group-hover:text-white" />
            </button>
            <div className="px-3 md:px-6 py-2 flex items-center gap-2 md:gap-3 text-xs md:text-sm font-black text-white">
              <CalendarIcon className="w-3 h-3 md:w-4 md:h-4 text-indigo-400" />
              {days[0]?.toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              })}{" "}
              —{" "}
              {days[6]?.toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </div>
            <button
              onClick={() => setWeeksOffset((v) => v + 1)}
              className="p-2 md:p-3 hover:bg-white/10 rounded-xl transition-all group"
            >
              <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-gray-400 group-hover:text-white" />
            </button>
          </div>
          {weeksOffset !== 0 && (
            <button
              onClick={() => setWeeksOffset(0)}
              className="px-4 md:px-6 py-2 md:py-3 bg-white/5 border border-white/10 rounded-2xl text-[9px] md:text-[10px] font-black text-indigo-300 hover:text-white uppercase tracking-widest transition-all"
            >
              Today
            </button>
          )}
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="group relative px-4 md:px-8 py-3 md:py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-xs md:text-sm transition-all shadow-2xl hover:-translate-y-1 active:scale-95 overflow-hidden"
        >
          <div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"
            style={{ backgroundSize: "200% 100%" }}
          />
          <div className="flex items-center gap-2 md:gap-3 relative z-10">
            <Plus className="w-4 h-4 md:w-5 md:h-5" />
            <span className="hidden sm:inline">Initialize Shift</span>
            <span className="sm:hidden">New Shift</span>
          </div>
        </button>
      </div>

      {/* The Mega Grid */}
      <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full border-collapse table-fixed lg:min-w-[1200px]">
            <thead>
              <tr className="grid-header">
                <th className="w-64 sticky left-0 z-30 grid-header p-8 text-left">
                  <span className="text-[10px] font-black text-indigo-300 uppercase tracking-[0.3em]">
                    Staff Matrix
                  </span>
                </th>
                {days.map((day, i) => {
                  const isToday =
                    day.toDateString() === new Date().toDateString();
                  return (
                    <th
                      key={i}
                      className={`p-8 text-center day-cell ${isToday ? "current-day" : ""}`}
                    >
                      <div className="flex flex-col items-center">
                        <span className="text-[10px] uppercase font-black text-gray-500 tracking-widest mb-3">
                          {day.toLocaleDateString(undefined, {
                            weekday: "long",
                          })}
                        </span>
                        <div className="relative">
                          {isToday && (
                            <div className="absolute inset-0 bg-indigo-500 blur-lg opacity-40 animate-pulse" />
                          )}
                          <span
                            className={`relative text-2xl font-black w-12 h-12 flex items-center justify-center rounded-2xl ${
                              isToday
                                ? "bg-indigo-600 text-white shadow-xl shadow-indigo-900"
                                : "text-white"
                            }`}
                          >
                            {day.getDate()}
                          </span>
                        </div>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {/* Open Shifts Row */}
              <tr className="border-b border-white/5 group hover:bg-white/[0.02] transition-colors">
                <td className="sticky left-0 z-30 staff-cell group-hover:bg-[#1a1a24] p-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center text-orange-400 border border-orange-500/20 shadow-inner">
                      <Shapes className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-sm font-black text-white leading-none">
                        Open Clusters
                      </div>
                      <div className="text-[9px] text-orange-500 font-black uppercase mt-2 tracking-widest">
                        Awaiting Command
                      </div>
                    </div>
                  </div>
                </td>
                {days.map((day, i) => {
                  const dayShifts = getUnassignedShiftsForDay(day);
                  const isToday =
                    day.toDateString() === new Date().toDateString();
                  return (
                    <td
                      key={i}
                      className={`p-4 day-cell align-top ${isToday ? "current-day" : ""}`}
                    >
                      <div className="space-y-3 min-h-[100px]">
                        {dayShifts.map((shift) => (
                          <ShiftCard
                            key={shift._id}
                            shift={shift}
                            isUnassigned
                            onClick={() => {
                              setSelectedShift(shift);
                              setShowAssignModal(true);
                            }}
                          />
                        ))}
                        {dayShifts.length === 0 && (
                          <div className="h-20 flex flex-col items-center justify-center gap-2 opacity-5">
                            <div className="w-px h-10 bg-white" />
                            <div className="w-1 h-1 bg-white rounded-full" />
                          </div>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>

              {/* Personnel Rows */}
              {members.map((member) => (
                <tr
                  key={member._id}
                  className="border-b border-white/5 group hover:bg-white/[0.02] transition-colors"
                >
                  <td className="sticky left-0 z-30 staff-cell group-hover:bg-[#1a1a24] p-8">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="absolute inset-0 bg-white blur-md opacity-5" />
                        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-white font-black text-sm border border-white/5 relative z-10">
                          {member.displayName.substring(0, 2).toUpperCase()}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-black text-white leading-none truncate max-w-[140px] group-hover:text-indigo-300 transition-colors">
                          {member.displayName}
                        </div>
                        <div className="text-[9px] text-gray-500 font-bold uppercase mt-2 tracking-widest">
                          ID: {member._id.toString().slice(-6)}
                        </div>
                      </div>
                    </div>
                  </td>
                  {days.map((day, i) => {
                    const dayShifts = getShiftsForDayAndMember(day, member._id);
                    const isToday =
                      day.toDateString() === new Date().toDateString();
                    return (
                      <td
                        key={i}
                        className={`p-4 day-cell align-top ${isToday ? "current-day" : ""}`}
                      >
                        <div className="space-y-3 min-h-[100px]">
                          {dayShifts.map((shift) => (
                            <ShiftCard
                              key={shift._id}
                              shift={shift}
                              onClick={() => {
                                setSelectedShift(shift);
                                setShowProofModal(true);
                              }}
                            />
                          ))}
                          {dayShifts.length === 0 && (
                            <div className="inset-0 flex items-center justify-center opacity-0 group-hover:opacity-5 transition-opacity">
                              <Plus className="w-10 h-10 text-white" />
                            </div>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateShiftModal
          accountId={accountId}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            loadData();
          }}
        />
      )}

      {showAssignModal && selectedShift && (
        <AssignMemberModal
          accountId={accountId}
          shift={selectedShift}
          onClose={() => setShowAssignModal(false)}
          onSuccess={() => {
            setShowAssignModal(false);
            loadData();
          }}
        />
      )}

      {showProofModal && selectedShift && (
        <CheckInProofModal
          accountId={accountId}
          shift={selectedShift}
          onClose={() => setShowProofModal(false)}
        />
      )}
    </div>
  );
};

const ShiftCard = ({ shift, isUnassigned, onClick }) => {
  const label = shift.shiftTypeId
    ? shift.shiftTypeId.name
    : shift.adHocLabel || "Custom";
  const color = shift.shiftTypeId ? shift.shiftTypeId.color : "#6366f1";
  const start = shift.shiftTypeId
    ? shift.shiftTypeId.startTime
    : shift.adHocStart;
  const end = shift.shiftTypeId ? shift.shiftTypeId.endTime : shift.adHocEnd;

  return (
    <div
      onClick={onClick}
      className={`relative p-4 rounded-3xl text-white shadow-2xl transition-all duration-300 hover:scale-[1.05] hover:-rotate-1 cursor-pointer group/card overflow-hidden border border-white/10 ${
        isUnassigned
          ? "ring-2 ring-orange-500/50 ring-offset-4 ring-offset-[#0a0a0f]"
          : ""
      }`}
      style={{ backgroundColor: `${color}cc`, backdropFilter: "blur(10px)" }}
    >
      <div className="absolute top-0 right-0 p-3 opacity-0 group-hover/card:opacity-100 transition-opacity">
        <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center">
          <MoreVertical className="w-4 h-4" />
        </div>
      </div>

      <div className="flex flex-col gap-3 relative z-10">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">
          {label}
        </span>
        <div className="flex items-center gap-2 text-md font-black">
          <Clock className="w-4 h-4 text-white/60" />
          {start} — {end}
        </div>

        {isUnassigned && (
          <div className="mt-2 pt-2 border-t border-white/10 flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-pulse" />
            <span className="text-[8px] font-black uppercase tracking-widest text-orange-200">
              Unassigned
            </span>
          </div>
        )}
      </div>

      {/* Decorative Glow */}
      <div className="absolute -bottom-10 -right-10 w-24 h-24 blur-[40px] opacity-40 rounded-full bg-white/20" />
    </div>
  );
};

export default FullScheduleGrid;
