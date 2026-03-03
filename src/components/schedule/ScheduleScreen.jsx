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
