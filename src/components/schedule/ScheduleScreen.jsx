import React, { useState, useEffect } from "react";
import {
  X,
  Clock,
  ChevronLeft,
  ChevronRight,
  Plus,
  Users,
  UserCheck,
  History,
  ClipboardList,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles,
  Info,
  HelpCircle,
  Lightbulb,
  XCircle,
} from "lucide-react";
import { shiftService, shiftTypeService } from "../../services/scheduleApi";

// Sub-components
import MyScheduleView from "./MyScheduleView";
import FullScheduleGrid from "./FullScheduleGrid";
import ExtraHoursPanel from "./ExtraHoursPanel";
import ScheduleReportsPanel from "./ScheduleReportsPanel";
import ShiftTypeManager from "./ShiftTypeManager";
import TimeOffManager from "./TimeOffManager";
import SampleDataLoader from "./SampleDataLoader";

const ScheduleScreen = ({ accountId, currentMember, onClose }) => {
  const [activeTab, setActiveTab] = useState("mySchedule");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showHelp, setShowHelp] = useState(true);

  const isManager =
    currentMember?.role === "owner" ||
    currentMember?.permissions?.manageSchedule;

  const tabs = [
    {
      id: "mySchedule",
      label: "My Hub",
      icon: <UserCheck className="w-4 h-4" />,
    },
    ...(isManager
      ? [
          {
            id: "fullSchedule",
            label: "Team Roster",
            icon: <Users className="w-4 h-4" />,
          },
          {
            id: "extraHours",
            label: "Overtime Feed",
            icon: <Clock className="w-4 h-4" />,
          },
          {
            id: "reports",
            label: "Analytics",
            icon: <ClipboardList className="w-4 h-4" />,
          },
        ]
      : [
          {
            id: "extraHours",
            label: "My Overtime",
            icon: <Clock className="w-4 h-4" />,
          },
        ]),
  ];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeTab]);

  return (
    <div className="w-full min-h-screen animate-fadeIn space-y-8">
      {/* Header section redesigned as an in-page title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-slate-200">
        <div className="flex items-center gap-5">
          <div className="bg-indigo-600 p-3.5 rounded-2xl shadow-xl shadow-indigo-500/20">
            <Calendar className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">
              Schedule <span className="text-indigo-600">Hub</span>
            </h1>
            <div className="flex items-center gap-2.5 mt-1.5">
              <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_#10b981]" />
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">
                Live Ecosystem Sync
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="group flex items-center gap-2 px-6 py-3 bg-white/40 hover:bg-white/60 border border-slate-200 text-slate-600 hover:text-slate-900 rounded-2xl transition-all font-bold text-sm"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
      </div>

      {/* Navigation Bar - Floating Design */}
      <div className="flex justify-start mb-8 overflow-x-auto pb-4 scrollbar-hide">
        <div className="bg-white/40 backdrop-blur-xl p-2 rounded-2xl border border-slate-200 shadow-sm flex gap-2 items-center">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 whitespace-nowrap ${
                activeTab === tab.id
                  ? "text-white bg-indigo-600 shadow-lg scale-[1.02]"
                  : "text-slate-500 hover:text-slate-900 hover:bg-white/40"
              }`}
            >
              <div
                className={`transition-transform duration-500 ${activeTab === tab.id ? "scale-110" : "group-hover:scale-110"}`}
              >
                {tab.icon}
              </div>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

          {/* 🎯 INTELLIGENCE BANNER */}
          {showHelp && (
            <div className="mb-12 glass-panel border-indigo-500/20 bg-indigo-500/5 group p-8 animate-fadeIn">
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0 bg-indigo-600 text-white p-4 rounded-2xl shadow-lg shadow-indigo-600/20 group-hover:scale-110 transition-transform duration-500">
                  <Lightbulb className="w-7 h-7" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter flex items-center gap-3">
                    Scheduling Intelligence Hub
                  </h3>
                    <button
                      onClick={() => setShowHelp(false)}
                      className="text-slate-500 hover:text-rose-400 p-2 rounded-xl border border-white/5 hover:bg-rose-500/10 transition-all"
                    >
                      <XCircle className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
                    {/* For Regular Users */}
                    <div className="space-y-4">
                      <h4 className="font-black text-indigo-400 text-[10px] uppercase tracking-widest flex items-center gap-2">
                        <UserCheck className="w-4 h-4" /> Personnel Operations
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-start gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-all">
                          <div className="w-6 h-6 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-black text-xs">1</div>
                          <div>
                            <p className="text-slate-900 font-bold text-sm tracking-tight">Workstream Vision</p>
                            <p className="text-slate-600 text-xs mt-1">Real-time visualization of your allocated work cycles and upcoming shifts.</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-all">
                          <div className="w-6 h-6 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400 font-black text-xs">2</div>
                          <div>
                            <p className="text-slate-900 font-bold text-sm tracking-tight">Biometric Verification</p>
                            <p className="text-slate-600 text-xs mt-1">Secure check-in/out protocols with GPS and camera-integrated attendance tracking.</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* For Managers */}
                    {isManager && (
                      <div className="space-y-4">
                        <h4 className="font-black text-emerald-400 text-[10px] uppercase tracking-widest flex items-center gap-2">
                          <Users className="w-4 h-4" /> Fleet Management
                        </h4>
                        <div className="space-y-3">
                          <div className="flex items-start gap-4 p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10 hover:border-emerald-500/20 transition-all">
                            <div className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-black text-xs">A</div>
                            <div>
                              <p className="text-slate-900 font-bold text-sm tracking-tight">Roster Orchestration</p>
                              <p className="text-slate-600 text-xs mt-1">Architect complex work schedules, assign team members, and optimize coverage.</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-4 p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10 hover:border-emerald-500/20 transition-all">
                            <div className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-black text-xs">B</div>
                            <div>
                              <p className="text-slate-900 font-bold text-sm tracking-tight">Velocity Reports</p>
                              <p className="text-slate-600 text-xs mt-1">Deep analytics on punctuality, attendance trends, and overtime distribution.</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-8 pt-6 border-t border-white/5">
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-3">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      Pro Tip: Navigate to <span className="text-white">MY HUB</span> for your personal command center.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Show Help Button (when help is hidden) */}
          {!showHelp && (
            <div className="mb-10 flex justify-center animate-fadeIn">
              <button
                onClick={() => setShowHelp(true)}
                className="flex items-center gap-3 px-8 py-3 bg-white/5 hover:bg-indigo-600/20 text-indigo-400 rounded-2xl transition-all border border-indigo-500/10 text-[10px] font-black uppercase tracking-widest shadow-xl"
              >
                <HelpCircle className="w-4 h-4" />
                Initialize Operator Briefing
              </button>
            </div>
          )}

          {/* 🎯 SAMPLE DATA LOADER */}
          <div className="mb-8">
            <SampleDataLoader
              accountId={accountId}
              onDataLoaded={() => {
                // Refresh the current view
                window.location.reload();
              }}
            />
          </div>

          {/* Alert Handlers */}
          {error && (
            <div className="mb-10 max-w-2xl mx-auto glass-panel border-rose-500/20 bg-rose-500/5 text-rose-400 p-6 flex items-center gap-5 shadow-2xl animate-slideDown">
              <div className="p-2 bg-rose-500/20 rounded-xl">
                <AlertCircle className="w-7 h-7" />
              </div>
              <p className="font-bold tracking-tight">{error}</p>
              <button
                onClick={() => setError("")}
                className="ml-auto p-2 hover:bg-rose-500/10 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}

          {success && (
            <div className="mb-10 max-w-2xl mx-auto glass-panel border-emerald-500/20 bg-emerald-500/5 text-emerald-400 p-6 flex items-center gap-5 shadow-2xl animate-slideDown">
              <div className="p-2 bg-emerald-500/20 rounded-xl">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <p className="font-bold tracking-tight">{success}</p>
              <button
                onClick={() => setSuccess("")}
                className="ml-auto p-2 hover:bg-emerald-500/10 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* View Container */}
          <div>
            {activeTab === "mySchedule" && (
              <MyScheduleView accountId={accountId} />
            )}
            {activeTab === "fullSchedule" && (
              <div className="space-y-16">
                <FullScheduleGrid accountId={accountId} />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <ShiftTypeManager accountId={accountId} />
                  <TimeOffManager accountId={accountId} />
                </div>
              </div>
            )}
            {activeTab === "extraHours" && (
              <ExtraHoursPanel
                accountId={accountId}
                currentMember={currentMember}
              />
            )}
            {activeTab === "reports" && (
              <ScheduleReportsPanel accountId={accountId} />
            )}
          </div>
    </div>
  );
};

export default ScheduleScreen;
