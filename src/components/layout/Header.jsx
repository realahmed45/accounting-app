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
  Moon,
  Sun,
  Menu,
  ChevronDown,
  Bell,
  User,
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
  onShowOnboarding,
  expenses = [],
  onExpenseClick,
  onShowReports,
  onToggleSidebar,
  sidebarLayout = false,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem("darkMode") === "true";
  });
  const searchRef = useRef(null);
  const userDropdownRef = useRef(null);

  // Apply dark mode class on mount and toggle
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("darkMode", isDarkMode ? "true" : "false");
  }, [isDarkMode]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target)
      ) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);

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
          .slice(0, 8)
      : [];

  return sidebarLayout ? (
    /* ========== NEW SIDEBAR LAYOUT HEADER ========== */
    <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
      <div className="flex items-center gap-3 px-4 py-3">
        {/* Hamburger for mobile sidebar toggle */}
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors lg:hidden"
        >
          <Menu className="w-5 h-5 text-gray-600" />
        </button>

        {/* Search Bar */}
        <div ref={searchRef} className="relative flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search or type command..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchResults(true);
              }}
              onFocus={() => setShowSearchResults(true)}
              className="w-full pl-10 pr-16 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">
              ⌘K
            </span>
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setShowSearchResults(false);
                }}
                className="absolute right-8 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          {/* Search Results Dropdown */}
          {showSearchResults && searchQuery.length >= 2 && (
            <div className="absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-xl max-h-80 overflow-y-auto z-50">
              {searchResults.length > 0 ? (
                <>
                  <div className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                    {searchResults.length} result
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
                      className="w-full px-4 py-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-50 last:border-0"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-800">
                            {expense.note || "No description"}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-400">
                            <span>${expense.amount}</span>
                            <span>•</span>
                            <span>{expense.category}</span>
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
                <div className="px-4 py-6 text-center text-gray-400 text-sm">
                  No results found
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 ml-auto">
          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500"
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDarkMode ? (
              <Sun className="w-5 h-5 text-yellow-500" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </button>

          {/* Notifications */}
          <NotificationBell onOpenCenter={onOpenNotificationCenter} />

          {/* User Info + Dropdown */}
          <div
            ref={userDropdownRef}
            className="relative flex items-center gap-2 pl-2"
          >
            <AccountSwitcher
              setShowCreateAccountModal={setShowCreateAccountModal}
              compact
            />
            {user && (
              <button
                onClick={() => setShowUserDropdown((prev) => !prev)}
                className="hidden sm:flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">
                    {(
                      user.firstName?.[0] ||
                      user.email?.[0] ||
                      "U"
                    ).toUpperCase()}
                  </span>
                </div>
                <span className="text-sm font-semibold text-gray-700">
                  {user.firstName} {user.lastName || ""}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-gray-400 transition-transform ${showUserDropdown ? "rotate-180" : ""}`}
                />
              </button>
            )}

            {/* Dropdown Menu */}
            {showUserDropdown && (
              <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
                {/* User info header */}
                <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                  <p className="text-sm font-semibold text-gray-800">
                    {user?.firstName} {user?.lastName || ""}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user?.email}
                  </p>
                </div>

                {/* Menu items */}
                <div className="py-1">
                  <button
                    onClick={() => {
                      setShowSettings(true);
                      setShowUserDropdown(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left"
                  >
                    <Settings className="w-4 h-4 text-gray-500" />
                    Settings
                  </button>

                  <button
                    onClick={toggleDarkMode}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left"
                  >
                    {isDarkMode ? (
                      <Sun className="w-4 h-4 text-yellow-500" />
                    ) : (
                      <Moon className="w-4 h-4 text-gray-500" />
                    )}
                    {isDarkMode ? "Light Mode" : "Dark Mode"}
                  </button>

                  <div className="border-t border-gray-100 my-1" />

                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      logout?.();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors text-left font-medium"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  ) : (
    /* ========== ORIGINAL DARK HEADER ========== */
    <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 sticky top-0 z-40 shadow-2xl border-b border-slate-700">
      <div className="w-full mx-auto px-3 sm:px-6 py-3 sm:py-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 sm:gap-4">
          {/* Left Section - Logo & Title */}
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 sm:p-3 rounded-2xl shadow-lg hover:shadow-xl transition-all hover:scale-105">
              <Wallet className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-3xl font-black text-white tracking-tight truncate">
                Weekly Accounting
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 font-medium mt-0.5 truncate">
                Hey <strong>{user?.firstName}</strong>, welcome back! 👋
              </p>
            </div>
          </div>

          {/* Right Section - Actions */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap w-full lg:w-auto">
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
              <div className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-slate-700/50 backdrop-blur-sm border border-slate-600 text-slate-300 text-[11px] sm:text-xs font-bold uppercase tracking-wider rounded-xl">
                <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
                View Only
              </div>
            )}

            {/* Notifications */}
            <NotificationBell onOpenCenter={onOpenNotificationCenter} />

            {/* Help Button - Restart Tour */}
            <button
              onClick={onShowOnboarding}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-slate-700/50 hover:bg-slate-700 backdrop-blur-sm text-slate-200 hover:text-white transition-all duration-200 font-semibold border border-slate-600 hover:border-slate-500 rounded-xl shadow-lg"
            >
              <HelpCircle className="w-5 h-5" />
              <span className="hidden sm:inline">Help</span>
            </button>

            {/* Reports Button - NEW VISIBLE FEATURE */}
            <button
              onClick={onShowReports}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white transition-all duration-200 font-semibold rounded-xl shadow-lg hover:shadow-xl"
            >
              <BarChart3 className="w-5 h-5" />
              <span className="hidden sm:inline">Reports</span>
            </button>

            {/* Settings */}
            {hasPermission("accessSettings") && (
              <button
                onClick={() => setShowSettings(true)}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-slate-700/50 hover:bg-slate-700 backdrop-blur-sm text-slate-200 hover:text-white transition-all duration-200 font-semibold border border-slate-600 hover:border-slate-500 rounded-xl shadow-lg"
              >
                <Settings className="w-5 h-5" />
                <span className="hidden sm:inline">Settings</span>
              </button>
            )}

            {/* Logout */}
            <button
              onClick={logout}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-lg hover:shadow-xl font-bold rounded-xl"
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
