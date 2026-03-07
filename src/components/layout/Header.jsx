import React from "react";
import { Wallet, Settings, LogOut } from "lucide-react";
import AccountSwitcher from "../AccountSwitcher";
import NotificationBell from "./NotificationBell";

const Header = ({
  user,
  currentMember,
  hasPermission,
  setShowSettings,
  setShowCreateAccountModal,
  logout,
  onOpenNotificationCenter,
}) => {
  return (
    <div className="bg-white shadow-sm sticky top-0 z-40 border-b border-slate-200">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-slate-900 p-3 rounded-xl shadow-sm hover:shadow-md transition-all">
              <Wallet className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                Weekly Accounting
              </h1>
              <p className="text-sm text-slate-600 font-medium mt-0.5">
                Welcome back, {user?.firstName} 👋
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <AccountSwitcher
              setShowCreateAccountModal={setShowCreateAccountModal}
            />
            {currentMember?.viewOnly && (
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-wider rounded-xl">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"></div>
                View Only
              </div>
            )}
            <NotificationBell onOpenCenter={onOpenNotificationCenter} />
            {hasPermission("accessSettings") && (
              <button
                onClick={() => setShowSettings(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 transition-all duration-200 font-semibold border border-slate-200 rounded-xl shadow-sm hover:shadow"
              >
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Settings</span>
              </button>
            )}
            <button
              onClick={logout}
              className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white hover:bg-red-700 transition-all duration-200 shadow-sm hover:shadow font-semibold rounded-xl"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
