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
      <div className="flex flex-col items-center justify-center py-40 animate-fadeIn">
        <div className="w-20 h-20 relative">
          <div className="absolute inset-0 bg-indigo-500 rounded-full blur-3xl opacity-20 animate-pulse" />
          <div className="w-20 h-20 border-[6px] border-white/5 border-t-indigo-500 rounded-full animate-spin relative z-10 shadow-[0_0_20px_rgba(79,70,229,0.2)]" />
        </div>
        <p className="text-slate-400 font-black uppercase tracking-[0.4em] text-[10px] mt-10 opacity-70">
          Syncing Neural Grid...
        </p>
      </div>
    );

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-1000">
      <style>{`
        .grid-header-cell {
          background: rgba(15, 23, 42, 0.8);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          border-right: 1px solid rgba(255, 255, 255, 0.05);
        }
        .sticky-staff-cell {
          background: rgba(15, 23, 42, 0.95);
          backdrop-filter: blur(20px);
          border-right: 2px solid rgba(79, 70, 229, 0.2);
        }
        .grid-data-cell {
          border-right: 1px solid rgba(255, 255, 255, 0.03);
          border-bottom: 1px solid rgba(255, 255, 255, 0.03);
          transition: all 0.3s ease;
        }
        .grid-data-cell:hover {
          background: rgba(255, 255, 255, 0.02);
        }
        .grid-today-column {
          background: rgba(79, 70, 229, 0.03) !important;
        }
      `}</style>

      {/* 🎯 FLEET MANAGEMENT BRIEFING */}
      <div className="glass-panel border-purple-500/20 bg-purple-500/5 group p-8 mb-12 animate-fadeIn">
        <div className="flex items-start gap-6">
          <div className="bg-purple-600 text-white p-4 rounded-2xl shadow-lg shadow-purple-600/20 group-hover:scale-110 transition-transform duration-500">
            <Lightbulb className="w-7 h-7" />
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-black text-white tracking-tighter uppercase mb-6 flex items-center gap-3">
               Fleet Orchestration Protocol
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white/5 p-5 rounded-2xl border border-white/5 hover:border-purple-500/20 transition-all">
                <h4 className="font-black text-purple-400 text-[10px] uppercase tracking-widest mb-2">
                  01. Deployment Logic
                </h4>
                <p className="text-slate-400 text-xs font-medium leading-relaxed">
                  Utilize "INITIALIZE SHIFT" to architect work windows. Define temporal parameters and associate with specialized shift templates.
                </p>
              </div>

              <div className="bg-white/5 p-5 rounded-2xl border border-white/5 hover:border-indigo-500/20 transition-all">
                <h4 className="font-black text-indigo-400 text-[10px] uppercase tracking-widest mb-2">
                  02. Entity Allocation
                </h4>
                <p className="text-slate-400 text-xs font-medium leading-relaxed">
                  Monitor "Open Clusters" for unallocated shifts. Execute assignment commands to bind personnel to active work cycles.
                </p>
              </div>

              <div className="bg-white/5 p-5 rounded-2xl border border-white/5 hover:border-emerald-500/20 transition-all">
                <h4 className="font-black text-emerald-400 text-[10px] uppercase tracking-widest mb-2">
                  03. Grid Navigation
                </h4>
                <p className="text-slate-400 text-xs font-medium leading-relaxed">
                  Traverse future workstreams using the temporal offset controls. Synced live with the central mission database.
                </p>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10 flex items-center gap-4 text-amber-400/80">
              <Info className="w-5 h-5 flex-shrink-0" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em]">
                System Ready: Configure reusable blueprints in the "Shift Types" section below.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center bg-white/5 border border-white/10 rounded-2xl p-1 shadow-2xl backdrop-blur-2xl">
            <button
              onClick={() => setWeeksOffset((v) => v - 1)}
              className="p-3 hover:bg-white/10 rounded-xl transition-all group"
            >
              <ChevronLeft className="w-5 h-5 text-slate-500 group-hover:text-white" />
            </button>
            <div className="px-8 py-2 flex items-center gap-3 text-xs font-black text-white uppercase tracking-widest">
              <CalendarIcon className="w-4 h-4 text-indigo-400" />
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
              className="p-3 hover:bg-white/10 rounded-xl transition-all group"
            >
              <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-white" />
            </button>
          </div>
          {weeksOffset !== 0 && (
            <button
              onClick={() => setWeeksOffset(0)}
              className="px-6 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black text-indigo-400 hover:text-white uppercase tracking-widest transition-all shadow-xl"
            >
              Sync Present
            </button>
          )}
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="group relative px-10 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-widest transition-all shadow-[0_20px_40px_rgba(79,70,229,0.3)] hover:-translate-y-1 active:scale-95 overflow-hidden"
        >
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center gap-3 relative z-10">
            <Plus className="w-5 h-5" />
            <span>Initialize Logic Batch</span>
          </div>
        </button>
      </div>

      {/* The Mega Grid */}
      <div className="glass-panel rounded-[3rem] overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full border-collapse table-fixed lg:min-w-[1400px]">
            <thead>
              <tr>
                <th className="w-72 sticky left-0 z-40 grid-header-cell sticky-staff-cell p-8 text-left">
                  <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em]">
                    Entity Grid
                  </span>
                </th>
                {days.map((day, i) => {
                  const isToday =
                    day.toDateString() === new Date().toDateString();
                  return (
                    <th
                      key={i}
                      className={`p-8 text-center grid-header-cell ${isToday ? "grid-today-column" : ""}`}
                    >
                      <div className="flex flex-col items-center">
                        <span className="text-[9px] uppercase font-black text-slate-500 tracking-[0.2em] mb-4">
                          {day.toLocaleDateString(undefined, {
                            weekday: "short",
                          })}
                        </span>
                        <div className="relative">
                          {isToday && (
                            <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-30 animate-pulse" />
                          )}
                          <span
                            className={`relative text-2xl font-black w-14 h-14 flex items-center justify-center rounded-2xl transition-all duration-500 ${
                              isToday
                                ? "bg-indigo-600 text-white shadow-2xl shadow-indigo-900 border border-indigo-400/30 scale-110"
                                : "text-white border border-white/5 bg-white/5"
                            }`}
                          >
                            {day.getDate().toString().padStart(2, '0')}
                          </span>
                        </div>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {/* Open Shifts Row */}
              <tr className="group hover:bg-white/[0.02] transition-colors">
                <td className="sticky left-0 z-30 sticky-staff-cell p-8">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-amber-500/10 rounded-[1.5rem] flex items-center justify-center text-amber-500 border border-amber-500/20 shadow-inner group-hover:scale-110 transition-transform">
                      <Shapes className="w-7 h-7" />
                    </div>
                    <div>
                      <div className="text-[10px] font-black text-white leading-none uppercase tracking-widest">
                        Open Clusters
                      </div>
                      <p className="text-[8px] text-amber-500 font-bold uppercase mt-2 tracking-[0.2em]">
                        Pending Logic
                      </p>
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
                      className={`p-5 grid-data-cell align-top ${isToday ? "grid-today-column" : ""}`}
                    >
                      <div className="space-y-4 min-h-[120px]">
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
                          <div className="h-24 flex flex-col items-center justify-center gap-3 opacity-20">
                            <div className="w-[1px] h-12 bg-slate-800" />
                            <div className="w-1.5 h-1.5 bg-slate-700 rounded-full" />
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
                  className="group hover:bg-white/[0.03] transition-colors"
                >
                  <td className="sticky left-0 z-30 sticky-staff-cell p-8">
                    <div className="flex items-center gap-5">
                      <div className="relative">
                        <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-0 group-hover:opacity-10 transition-opacity" />
                        <div className="w-14 h-14 bg-slate-800 rounded-[1.5rem] flex items-center justify-center text-white font-black text-[10px] border border-white/5 relative z-10 group-hover:border-indigo-500/30 transition-all">
                          {member.displayName.substring(0, 2).toUpperCase()}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] font-black text-white leading-none uppercase tracking-widest group-hover:text-indigo-400 transition-colors">
                          {member.displayName}
                        </div>
                        <p className="text-[8px] text-slate-500 font-bold mt-2.5 tracking-[0.2em] font-mono">
                          OPERATOR://{member._id.toString().slice(-6).toUpperCase()}
                        </p>
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
                        className={`p-5 grid-data-cell align-top ${isToday ? "grid-today-column" : ""}`}
                      >
                        <div className="space-y-4 min-h-[120px]">
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
                            <div className="inset-0 flex items-center justify-center opacity-0 group-hover:opacity-5 transition-opacity duration-500 scale-50 group-hover:scale-100">
                              <Plus className="w-12 h-12 text-white" />
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
    : shift.adHocLabel || "Custom Batch";
  const color = shift.shiftTypeId ? shift.shiftTypeId.color : "#6366f1";
  const start = shift.shiftTypeId
    ? shift.shiftTypeId.startTime
    : shift.adHocStart;
  const end = shift.shiftTypeId ? shift.shiftTypeId.endTime : shift.adHocEnd;

  return (
    <div
      onClick={onClick}
      className={`relative p-5 rounded-[2rem] text-white transition-all duration-500 hover:scale-[1.03] hover:-translate-y-1 cursor-pointer group/card overflow-hidden border border-white/10 shadow-xl ${
        isUnassigned
          ? "ring-2 ring-amber-500/30 ring-offset-4 ring-offset-slate-900 shadow-amber-500/5 animate-pulse"
          : ""
      }`}
      style={{ 
        background: `linear-gradient(135deg, ${color}33, ${color}66)`,
        backdropFilter: "blur(12px)" 
      }}
    >
      <div className="absolute top-0 right-0 p-4 opacity-0 group-hover/card:opacity-100 transition-opacity">
        <div className="w-7 h-7 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/5">
          <MoreVertical className="w-3.5 h-3.5" />
        </div>
      </div>

      <div className="flex flex-col gap-4 relative z-10">
        <span className="text-[8px] font-black uppercase tracking-[0.3em] text-white/70">
          {label}
        </span>
        <div className="flex items-center gap-3 text-xs font-black">
          <Clock className="w-3.5 h-3.5 text-white/60" />
          <span className="tabular-nums tracking-tighter">{start} — {end}</span>
        </div>

        {isUnassigned && (
          <div className="mt-2 pt-3 border-t border-white/10 flex items-center gap-3">
            <div className="w-2 h-2 bg-amber-400 rounded-full shadow-[0_0_10px_rgba(251,191,36,0.5)]" />
            <span className="text-[7px] font-black uppercase tracking-[0.2em] text-amber-200">
              Awaiting Member
            </span>
          </div>
        )}
      </div>

      {/* Decorative Glow */}
      <div className="absolute -bottom-10 -right-10 w-24 h-24 blur-[40px] opacity-20 rounded-full bg-white shadow-[0_0_50px_rgba(255,255,255,0.2)]" />
    </div>
  );
};

export default FullScheduleGrid;
