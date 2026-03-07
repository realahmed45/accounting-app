import React, { useState, useRef, useEffect } from "react";
import { Bell } from "lucide-react";
import { useNotifications } from "../../context/NotificationContext";
import NotificationDropdown from "./NotificationDropdown";

const NotificationBell = ({ onOpenCenter }) => {
  const { unreadCount } = useNotifications();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 transition-all duration-200 font-semibold border border-slate-200 rounded-xl shadow-sm hover:shadow"
      >
        <Bell className="w-4 h-4" />
        <span className="hidden sm:inline">Notifications</span>

        {/* Badge */}
        {unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 min-w-[20px] h-5 flex items-center justify-center bg-red-500 text-white text-xs font-bold rounded-full px-1.5 shadow-lg animate-pulse">
            {unreadCount > 99 ? "99+" : unreadCount}
          </div>
        )}
      </button>

      {/* Dropdown */}
      {showDropdown && (
        <NotificationDropdown
          onClose={() => setShowDropdown(false)}
          onOpenCenter={onOpenCenter}
        />
      )}
    </div>
  );
};

export default NotificationBell;
