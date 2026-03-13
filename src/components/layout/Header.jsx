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
  toggleSidebar,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const searchResults =
    searchQuery.length >= 2
      ? expenses
          .filter((expense) => {
            const query = searchQuery.toLowerCase();
            return (
              expense.note?.toLowerCase().includes(query) ||
              expense.amount?.toString().includes(query) ||
              expense.category?.toLowerCase().includes(query) ||
              expense.personName?.toLowerCase().includes(query)
            );
          })
          .slice(0, 8)
      : [];

  return (
    <header className="sticky top-0 z-40 bg-slate-950/50 backdrop-blur-xl border-b border-white/5 py-4 px-6">
      <div className="flex items-center justify-between gap-6 max-w-[1600px] mx-auto">
        {/* Left: Mobile Toggle & Breadcrumbs/Title */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2 hover:bg-white/5 rounded-xl transition-colors"
          >
            <Menu className="w-6 h-6 text-slate-400" />
          </button>
          
          <div className="hidden sm:block">
            <h1 className="text-xl font-bold text-white tracking-tight">
              Accounting <span className="text-indigo-500">.</span>
            </h1>
          </div>
        </div>

        {/* Center: Global Search */}
        <div className="flex-1 max-w-2xl relative" ref={searchRef}>
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
            <input
              type="text"
              placeholder="Search anything... (e.g. 'Coffee', '$50')"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchResults(true);
              }}
              onFocus={() => setShowSearchResults(true)}
              className="w-full pl-11 pr-11 py-2.5 bg-white/5 border border-white/10 hover:border-white/20 focus:border-indigo-500/50 rounded-2xl text-sm transition-all focus:ring-4 focus:ring-indigo-500/10"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Search Results Dropdown */}
          {showSearchResults && searchQuery.length >= 2 && (
            <div className="absolute top-full mt-3 w-full glass-card overflow-hidden z-50 animate-fade-in">
              {searchResults.length > 0 ? (
                <div className="p-2">
                  <p className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    Search Results
                  </p>
                  {searchResults.map((expense) => (
                    <button
                      key={expense._id}
                      onClick={() => {
                        onExpenseClick?.(expense);
                        setShowSearchResults(false);
                        setSearchQuery("");
                      }}
                      className="w-full p-3 hover:bg-white/5 rounded-xl transition-colors text-left group"
                    >
                      <div className="flex justify-between items-start gap-3">
                        <div>
                          <p className="text-white font-semibold text-sm group-hover:text-indigo-400 transition-colors">
                            {expense.note || "Untitled Entry"}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            {expense.category} • {expense.personName}
                          </p>
                        </div>
                        <span className="text-sm font-bold text-white">
                          ${expense.amount}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <p className="text-slate-400 text-sm font-medium">No results found for "{searchQuery}"</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={onShowReports}
            className="hidden md:flex btn-primary !py-2 !px-4 !text-sm"
          >
            <BarChart3 className="w-4 h-4" />
            Reports
          </button>

          <div className="h-6 w-px bg-white/10 mx-2 hidden sm:block"></div>

          <NotificationBell onOpenCenter={onOpenNotificationCenter} />

          <button
            onClick={() => setShowSettings(true)}
            className="p-2.5 hover:bg-white/5 text-slate-400 hover:text-white rounded-xl transition-all border border-transparent hover:border-white/10"
          >
            <Settings className="w-5 h-5" />
          </button>

          <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-500 to-sky-400 p-[1px] hidden sm:block">
            <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center">
              <User className="w-4 h-4 text-indigo-400" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
