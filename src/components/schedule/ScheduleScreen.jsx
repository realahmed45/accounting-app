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
    <div className="fixed inset-0 z-[100] bg-white flex flex-col overflow-y-auto">
      {/* Header Container - Fixed top but scrollable with page */}
      <div className="sticky top-0 z-[110] bg-white border-b border-slate-200 px-4 md:px-12 py-6 flex items-center justify-between\">
        <div className="flex items-center gap-4">
          <div className="bg-emerald-600 p-3 rounded-xl\">
            <Calendar className="w-7 h-7 text-white\" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight\">
              Scheduling Center
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-2 h-2 bg-emerald-500 rounded-full\" />
              <p className="text-xs text-slate-600 font-semibold\">
                Real-time Sync
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="group p-3 bg-slate-100 hover:bg-red-500 rounded-xl transition-all duration-300 border border-slate-200 hover:border-red-400\"
        >
          <X className="w-6 h-6 text-slate-600 group-hover:text-white transition-colors\" />
        </button>
      </div>

      {/* Main Context Grid */}
      <div className="flex-1 flex flex-col items-center bg-slate-50">
        <div className="w-full max-w-7xl px-4 md:px-12 py-10">
          {/* Navigation Bar - Floating Design */}
          <div className="flex justify-center mb-12">
            <div className="bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm flex gap-1 items-center">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-8 py-4 rounded-xl text-sm font-semibold transition-all duration-300 ${
                    activeTab === tab.id
                      ? "text-white bg-emerald-600 shadow-md"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <div
                    className={`transition-transform duration-300 ${activeTab === tab.id ? "scale-110" : "group-hover:scale-110"}`}
                  >
                    {tab.icon}
                  </div>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* 🎯 BEGINNER HELP BANNER */}
          {showHelp && (
            <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-6 shadow-lg">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 bg-blue-500 text-white p-3 rounded-xl">
                  <Lightbulb className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-bold text-blue-900 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5" />
                      Welcome to the Scheduling Center! 🎉
                    </h3>
                    <button
                      onClick={() => setShowHelp(false)}
                      className="text-blue-600 hover:text-blue-800 hover:bg-blue-100 p-2 rounded-lg transition-colors"
                      title="Close help banner"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-3 text-sm text-blue-800">
                    <p className="font-semibold text-base">
                      <span className="text-red-600 font-bold text-lg">!</span>{" "}
                      What is Scheduling?
                      <span className="font-normal ml-2">
                        It's where you manage work shifts, time-off, and team
                        availability!
                      </span>
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      {/* For Regular Users */}
                      <div className="bg-white p-4 rounded-xl border border-blue-200">
                        <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                          <UserCheck className="w-4 h-4" />
                          For Team Members:
                        </h4>
                        <ul className="space-y-2 text-xs">
                          <li className="flex items-start gap-2">
                            <span className="text-red-600 font-bold flex-shrink-0">
                              !
                            </span>
                            <span>
                              <strong>My Hub:</strong> See your upcoming work
                              shifts here
                            </span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-red-600 font-bold flex-shrink-0">
                              !
                            </span>
                            <span>
                              <strong>Check-In/Out:</strong> Use your camera &
                              GPS to verify attendance
                            </span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-red-600 font-bold flex-shrink-0">
                              !
                            </span>
                            <span>
                              <strong>Request Time-Off:</strong> Submit vacation
                              or sick leave requests
                            </span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-red-600 font-bold flex-shrink-0">
                              !
                            </span>
                            <span>
                              <strong>My Overtime:</strong> View and submit
                              extra hours worked
                            </span>
                          </li>
                        </ul>
                      </div>

                      {/* For Managers */}
                      {isManager && (
                        <div className="bg-white p-4 rounded-xl border border-blue-200">
                          <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            For Managers/Owners:
                          </h4>
                          <ul className="space-y-2 text-xs">
                            <li className="flex items-start gap-2">
                              <span className="text-red-600 font-bold flex-shrink-0">
                                !
                              </span>
                              <span>
                                <strong>Team Roster:</strong> Create shifts &
                                assign team members
                              </span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-red-600 font-bold flex-shrink-0">
                                !
                              </span>
                              <span>
                                <strong>Shift Types:</strong> Define recurring
                                shifts (Morning, Evening, etc.)
                              </span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-red-600 font-bold flex-shrink-0">
                                !
                              </span>
                              <span>
                                <strong>Overtime Feed:</strong> Review and
                                approve extra hours
                              </span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-red-600 font-bold flex-shrink-0">
                                !
                              </span>
                              <span>
                                <strong>Analytics:</strong> View attendance
                                reports & statistics
                              </span>
                            </li>
                          </ul>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 bg-amber-50 border border-amber-300 rounded-xl p-3">
                      <p className="text-amber-900 font-semibold text-xs flex items-center gap-2">
                        <Info className="w-4 h-4 flex-shrink-0" />
                        <span>
                          <span className="text-red-600 font-bold">!</span> New
                          here? Start by exploring the <strong>My Hub</strong>{" "}
                          tab to see example shifts.
                          {isManager &&
                            " As a manager, check out the Team Roster to create your first shift!"}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Show Help Button (when help is hidden) */}
          {!showHelp && (
            <div className="mb-6 flex justify-center">
              <button
                onClick={() => setShowHelp(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-xl transition-colors text-sm font-semibold"
              >
                <HelpCircle className="w-4 h-4" />
                Show Help & Instructions
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
            <div className="mb-8 max-w-2xl mx-auto bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl flex items-center gap-4">
              <AlertCircle className="w-6 h-6 flex-shrink-0" />
              <p className="text-sm font-semibold">{error}</p>
              <button
                onClick={() => setError("")}
                className="ml-auto p-1.5 hover:bg-red-100 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {success && (
            <div className="mb-8 max-w-2xl mx-auto bg-emerald-50 border border-emerald-200 text-emerald-700 px-6 py-4 rounded-xl flex items-center gap-4">
              <CheckCircle2 className="w-6 h-6 flex-shrink-0" />
              <p className="text-sm font-semibold">{success}</p>
              <button
                onClick={() => setSuccess("")}
                className="ml-auto p-1.5 hover:bg-emerald-100 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
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
      </div>
    </div>
  );
};

export default ScheduleScreen;
