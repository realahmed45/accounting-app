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
    <div className="bg-white shadow-lg sticky top-0 z-40 border-b-2 border-gray-100 backdrop-blur-md">
      <div className="w-full px-6 xl:px-12 py-5">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 p-3.5 rounded-2xl shadow-xl hover:shadow-2xl transition-all hover:scale-105 duration-300">
              <Wallet className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Weekly Accounting
              </h1>
              <p className="text-sm text-gray-500 font-semibold mt-0.5">
                Welcome back, {user?.firstName} 👋
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <AccountSwitcher />
            {currentMember?.viewOnly && (
              <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-200 text-gray-600 text-xs font-bold uppercase tracking-wider rounded-xl shadow-sm">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                View Only
              </div>
            )}
            {hasPermission("accessSettings") && (
              <button
                onClick={() => setShowSettings(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 transition-all duration-200 font-semibold border-2 border-gray-300 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5"
              >
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Settings</span>
              </button>
            )}
            <button
              onClick={logout}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-500 to-rose-600 text-white hover:from-red-600 hover:to-rose-700 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold rounded-xl hover:-translate-y-0.5"
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
