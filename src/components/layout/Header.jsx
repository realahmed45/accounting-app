import React from "react";
import {
  Wallet,
  Settings,
  LogOut,
  LayoutDashboard,
  Calendar,
  HelpCircle,
  Sparkles,
} from "lucide-react";
import AccountSwitcher from "../AccountSwitcher";
import NotificationBell from "./NotificationBell";
import { HelpIcon } from "./Tooltip";

const Header = ({
  user,
  currentMember,
  hasPermission,
  setShowSettings,
  setShowCreateAccountModal,
  logout,
  onOpenNotificationCenter,
  onShowOnboarding, // New prop for reopening tour
}) => {
  return (
    <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 sticky top-0 z-40 shadow-2xl border-b border-slate-700">
      <div className="w-full mx-auto px-6 py-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          {/* Left Section - Logo & Title */}
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-3 rounded-2xl shadow-lg hover:shadow-xl transition-all hover:scale-105">
              <Wallet className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Weekly Accounting
              </h1>
              <p className="text-sm text-slate-300 font-medium mt-0.5">
                Hey <strong>{user?.firstName}</strong>, welcome back! 👋
              </p>
            </div>
          </div>

          {/* Right Section - Actions */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Account Switcher */}
            <div className="relative">
              <AccountSwitcher
                setShowCreateAccountModal={setShowCreateAccountModal}
              />
            </div>

            {/* View-Only Badge */}
            {currentMember?.viewOnly && (
              <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-700/50 backdrop-blur-sm border border-slate-600 text-slate-300 text-xs font-bold uppercase tracking-wider rounded-xl">
                <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
                View Only
              </div>
            )}

            {/* Notifications */}
            <NotificationBell onOpenCenter={onOpenNotificationCenter} />

            {/* Help Button - Restart Tour */}
            <button
              onClick={onShowOnboarding}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-700/50 hover:bg-slate-700 backdrop-blur-sm text-slate-200 hover:text-white transition-all duration-200 font-semibold border border-slate-600 hover:border-slate-500 rounded-xl shadow-lg"
            >
              <HelpCircle className="w-5 h-5" />
              <span className="hidden sm:inline">Help</span>
            </button>

            {/* Settings */}
            {hasPermission("accessSettings") && (
              <button
                onClick={() => setShowSettings(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-700/50 hover:bg-slate-700 backdrop-blur-sm text-slate-200 hover:text-white transition-all duration-200 font-semibold border border-slate-600 hover:border-slate-500 rounded-xl shadow-lg"
              >
                <Settings className="w-5 h-5" />
                <span className="hidden sm:inline">Settings</span>
              </button>
            )}

            {/* Logout */}
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-lg hover:shadow-xl font-bold rounded-xl"
            >
              <LogOut className="w-5 h-5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
