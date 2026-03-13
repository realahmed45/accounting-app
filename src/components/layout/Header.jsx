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
  setActiveTab,
  setShowCreateAccountModal,
  logout,
  onOpenNotificationCenter,
  onShowOnboarding,
  expenses = [],
  onExpenseClick,
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
    <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-2xl border-b border-white/5 py-4 px-6 shadow-2xl">
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
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <span className="bg-indigo-500/10 text-indigo-400 p-1.5 rounded-lg border border-indigo-500/20">
                <Wallet className="w-5 h-5" />
              </span>
              Neural <span className="text-indigo-500 font-extrabold">Portal</span>
            </h1>
          </div>
        </div>

        {/* Center: Global Search */}
        <div className="flex-1 max-w-2xl relative" ref={searchRef}>
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
            <input
              type="text"
              placeholder="Search financial neural path... (e.g. 'Coffee', '$50')"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchResults(true);
              }}
              onFocus={() => setShowSearchResults(true)}
              className="w-full pl-11 pr-11 py-2.5 bg-white/5 border border-white/10 hover:border-white/20 focus:border-indigo-500/50 rounded-2xl text-sm transition-all focus:ring-4 focus:ring-indigo-500/10 text-white placeholder:text-slate-600"
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
            <div className="absolute top-full mt-3 w-full glass-panel border border-white/10 overflow-hidden z-50 animate-fade-in shadow-2xl bg-slate-900/90 backdrop-blur-3xl">
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
                <div className="p-8 text-center text-slate-400">
                  <p className="text-sm tracking-wide">No neural records found for "{searchQuery}"</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab("reports")}
            className="hidden md:flex items-center gap-2 px-4 py-2 bg-indigo-500 shadow-lg shadow-indigo-500/20 text-white rounded-xl text-sm font-bold hover:scale-105 transition-all"
          >
            <BarChart3 className="w-4 h-4" />
            Reports
          </button>

          <div className="h-6 w-px bg-white/10 mx-2 hidden sm:block"></div>

          <NotificationBell onOpenCenter={onOpenNotificationCenter} />

          <button
            onClick={() => setActiveTab("settings")}
            className="p-2.5 hover:bg-white/5 text-slate-400 hover:text-white rounded-xl transition-all border border-transparent hover:border-white/10"
          >
            <Settings className="w-5 h-5" />
          </button>

          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-sky-400 p-[1.5px] hidden sm:block">
            <div className="w-full h-full rounded-[10px] bg-slate-950 flex items-center justify-center">
              <User className="w-4 h-4 text-indigo-400" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
