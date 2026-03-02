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
} from "lucide-react";
import { shiftService, shiftTypeService } from "../../services/scheduleApi";

// Sub-components
import MyScheduleView from "./MyScheduleView";
import FullScheduleGrid from "./FullScheduleGrid";
import ExtraHoursPanel from "./ExtraHoursPanel";
import ScheduleReportsPanel from "./ScheduleReportsPanel";
import ShiftTypeManager from "./ShiftTypeManager";
import TimeOffManager from "./TimeOffManager";

const ScheduleScreen = ({ accountId, currentMember, onClose }) => {
  const [activeTab, setActiveTab] = useState("mySchedule");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
    <div className="fixed inset-0 z-[100] bg-[#0a0a0f]/80 backdrop-blur-2xl flex flex-col overflow-y-auto animate-in fade-in duration-500">
      <style>{`
        .glass-header {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }
        .tab-glow {
          box-shadow: 0 0 20px rgba(99, 102, 241, 0.3);
        }
        .cyber-bg {
          background: radial-gradient(circle at 50% -20%, rgba(99, 102, 241, 0.15) 0%, transparent 70%);
        }
      `}</style>

      {/* Header Container - Fixed top but scrollable with page */}
      <div className="sticky top-0 z-[110] glass-header px-4 md:px-12 py-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-30 animate-pulse" />
            <div className="relative bg-gradient-to-br from-indigo-600 to-purple-600 p-3 rounded-2xl text-white shadow-2xl">
              <Calendar className="w-7 h-7" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              Scheduling Center
              <span className="text-[10px] bg-white/10 text-indigo-300 px-2 py-0.5 rounded-full uppercase tracking-widest border border-white/5">
                v2.0 Premium
              </span>
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
              <p className="text-xs text-gray-400 font-bold uppercase tracking-tighter">
                Real-time Operational Sync
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="group p-3 bg-white/5 hover:bg-red-500 rounded-2xl transition-all duration-300 border border-white/5 hover:border-red-400 shadow-xl"
        >
          <X className="w-6 h-6 text-gray-400 group-hover:text-white transition-colors" />
        </button>
      </div>

      {/* Main Context Grid */}
      <div className="cyber-bg flex-1 flex flex-col items-center">
        <div className="w-full max-w-7xl px-4 md:px-12 py-10">
          {/* Navigation Bar - Floating Design */}
          <div className="flex justify-center mb-12">
            <div className="bg-white/5 backdrop-blur-xl p-1.5 rounded-[2rem] border border-white/10 shadow-2xl flex gap-1 items-center">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-8 py-4 rounded-[1.5rem] text-sm font-black transition-all duration-500 relative overflow-hidden group ${
                    activeTab === tab.id
                      ? "text-white bg-indigo-600 tab-glow"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <div
                    className={`transition-transform duration-500 ${activeTab === tab.id ? "scale-110" : "group-hover:scale-110"}`}
                  >
                    {tab.icon}
                  </div>
                  {tab.label}
                  {activeTab === tab.id && (
                    <div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"
                      style={{ backgroundSize: "200% 100%" }}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Alert Handlers */}
          {error && (
            <div className="mb-8 max-w-2xl mx-auto bg-red-500/10 border border-red-500/20 text-red-400 px-6 py-4 rounded-3xl flex items-center gap-4 animate-in slide-in-from-top-4">
              <AlertCircle className="w-6 h-6 flex-shrink-0" />
              <p className="text-sm font-bold">{error}</p>
              <button
                onClick={() => setError("")}
                className="ml-auto p-1.5 hover:bg-white/10 rounded-xl transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {success && (
            <div className="mb-8 max-w-2xl mx-auto bg-green-500/10 border border-green-500/20 text-green-400 px-6 py-4 rounded-3xl flex items-center gap-4 animate-in slide-in-from-top-4">
              <CheckCircle2 className="w-6 h-6 flex-shrink-0" />
              <p className="text-sm font-bold">{success}</p>
              <button
                onClick={() => setSuccess("")}
                className="ml-auto p-1.5 hover:bg-white/10 rounded-xl transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* View Container */}
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
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
      </div>

      {/* Footer Branding */}
      <div className="w-full max-w-7xl mx-auto px-12 py-12 flex flex-col md:flex-row items-center justify-between border-t border-white/5 gap-8">
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] mb-2">
              Developed By
            </span>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-cyan-400 flex items-center justify-center text-[10px] font-black text-white">
                AG
              </div>
              <span className="text-sm font-black text-white">
                Antigravity Systems
              </span>
            </div>
          </div>
          <div className="w-px h-10 bg-white/5 mx-2" />
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] mb-2">
              Encryption
            </span>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
              <span className="text-sm font-black text-white">
                AES-256 Validated
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-5 py-2.5 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-black text-gray-300">
              Intelligent Roster Intelligence
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleScreen;
