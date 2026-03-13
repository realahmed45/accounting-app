import React from "react";
import {
  LayoutDashboard,
  Calendar,
  BarChart3,
  Settings,
  X,
  Wallet,
  LogOut,
  ChevronRight,
} from "lucide-react";

const Sidebar = ({
  isOpen,
  setIsOpen,
  activeTab,
  setActiveTab,
  user,
  logout,
  hasPermission,
}) => {
  const menuItems = [
    { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { id: "accounting", icon: Wallet, label: "Accounting" },
    { id: "schedule", icon: Calendar, label: "Schedule" },
    { id: "reports", icon: BarChart3, label: "Reports" },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-72 glass-panel border-r border-white/10 transition-transform duration-300 cubic-bezier(0.4, 0, 0.2, 1) transform 
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          lg:static lg:h-screen lg:rounded-none lg:border-t-0 lg:border-l-0 lg:border-b-0`}
      >
        <div className="flex flex-col h-full p-6">
          {/* Logo Section */}
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-xl shadow-lg ring-1 ring-white/20">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">Velox</span>
            </div>
            <button
              className="lg:hidden p-2 hover:bg-white/5 rounded-lg transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  if (window.innerWidth < 1024) setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 group
                  ${
                    activeTab === item.id
                      ? "bg-indigo-500/10 text-indigo-400 ring-1 ring-indigo-500/20"
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 ${activeTab === item.id ? "text-indigo-400" : ""}`} />
                  <span className="font-semibold">{item.label}</span>
                </div>
                {activeTab === item.id && <ChevronRight className="w-4 h-4 animate-fade-in" />}
              </button>
            ))}
          </nav>

          {/* User Section & Footer */}
          <div className="mt-auto pt-6 border-t border-white/10 space-y-4">
            {hasPermission("accessSettings") && (
              <button
                onClick={() => setActiveTab("settings")}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200
                  ${
                    activeTab === "settings"
                      ? "bg-indigo-500/10 text-indigo-400"
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }`}
              >
                <Settings className="w-5 h-5" />
                <span className="font-semibold">Settings</span>
              </button>
            )}

            <div className="p-4 glass-panel bg-white/5 border-white/5 rounded-2xl">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-sky-400 flex items-center justify-center text-white font-bold text-sm ring-2 ring-white/10">
                  {user?.firstName?.[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">{user?.firstName}</p>
                  <p className="text-xs text-slate-500 truncate">Free Plan</p>
                </div>
              </div>
              <button
                onClick={logout}
                className="w-full flex items-center justify-center gap-2 p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all text-xs font-bold"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
