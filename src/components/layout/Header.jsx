import React from "react";
import { Wallet, Settings, LogOut } from "lucide-react";
import AccountSwitcher from "../AccountSwitcher";

const Header = ({ 
  user, 
  currentMember, 
  hasPermission, 
  setShowSettings, 
  logout 
}) => {
  return (
    <div className="bg-white shadow-sm sticky top-0 z-40 border-b border-gray-200">
      <div className="w-full px-6 xl:px-12 py-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-3 rounded-xl shadow-lg hover:shadow-xl transition-all">
              <Wallet className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Weekly Accounting
              </h1>
              <p className="text-sm text-gray-600 font-medium">
                Welcome back, {user?.firstName} 👋
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <AccountSwitcher />
            {currentMember?.viewOnly && (
              <div className="flex items-center gap-1.5 px-3 py-1 bg-gray-100 border border-gray-200 text-gray-500 text-xs font-bold uppercase tracking-wider rounded-lg shadow-inner">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse"></div>
                View Only
              </div>
            )}
            {hasPermission("accessSettings") && (
              <button
                onClick={() => setShowSettings(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors font-medium border border-gray-200"
              >
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Settings</span>
              </button>
            )}
            <button
              onClick={logout}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 transition-all shadow-md hover:shadow-lg font-medium"
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
