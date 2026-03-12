import React, { useState, useEffect, useRef } from "react";
import {
  Wallet,
  Settings,
  LogOut,
  LayoutDashboard,
  Calendar,
  HelpCircle,
  Sparkles,
  Search,
  X,
  BarChart3,
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
  expenses = [], // NEW: Pass expenses for search
  onExpenseClick, // NEW: Callback when clicking search result
  onShowReports, // NEW: Callback to show reports screen
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchRef = useRef(null);

  // Close search dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter expenses based on search query
  const searchResults =
    searchQuery.length >= 2
      ? expenses
          .filter((expense) => {
            const query = searchQuery.toLowerCase();
            return (
              expense.note?.toLowerCase().includes(query) ||
              expense.amount?.toString().includes(query) ||
              expense.category?.toLowerCase().includes(query) ||
              expense.personName?.toLowerCase().includes(query) ||
              new Date(expense.date).toLocaleDateString().includes(query)
            );
          })
          .slice(0, 8) // Show max 8 results
      : [];

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
            {/* Global Search Bar - NEW VISIBLE FEATURE */}
            <div ref={searchRef} className="relative hidden lg:block">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search expenses... (Ctrl+K)"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSearchResults(true);
                  }}
                  onFocus={() => setShowSearchResults(true)}
                  className="w-96 pl-11 pr-11 py-2.5 bg-slate-700/50 border-2 border-slate-600 hover:border-slate-500 focus:border-blue-500 text-white placeholder-slate-400 rounded-xl font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setShowSearchResults(false);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Search Results Dropdown */}
              {showSearchResults && searchQuery.length >= 2 && (
                <div className="absolute top-full mt-2 w-full bg-slate-800 border-2 border-slate-700 rounded-xl shadow-2xl max-h-96 overflow-y-auto z-50">
                  {searchResults.length > 0 ? (
                    <>
                      <div className="px-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-700">
                        Found {searchResults.length} result
                        {searchResults.length !== 1 ? "s" : ""}
                      </div>
                      {searchResults.map((expense) => (
                        <button
                          key={expense._id}
                          onClick={() => {
                            onExpenseClick?.(expense);
                            setShowSearchResults(false);
                            setSearchQuery("");
                          }}
                          className="w-full px-4 py-3 hover:bg-slate-700 transition-colors text-left border-b border-slate-700/50 last:border-0"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className="text-white font-bold">
                                {expense.note || "No description"}
                              </p>
                              <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                                <span className="font-semibold">
                                  ${expense.amount}
                                </span>
                                <span>•</span>
                                <span>
                                  {expense.category || "Uncategorized"}
                                </span>
                                <span>•</span>
                                <span>{expense.personName || "Unknown"}</span>
                                <span>•</span>
                                <span>
                                  {new Date(expense.date).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </>
                  ) : (
                    <div className="px-4 py-8 text-center text-slate-400">
                      <Search className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p className="font-semibold">No expenses found</p>
                      <p className="text-xs mt-1">
                        Try a different search term
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

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

            {/* Reports Button - NEW VISIBLE FEATURE */}
            <button
              onClick={onShowReports}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white transition-all duration-200 font-semibold rounded-xl shadow-lg hover:shadow-xl"
            >
              <BarChart3 className="w-5 h-5" />
              <span className="hidden sm:inline">Reports</span>
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
