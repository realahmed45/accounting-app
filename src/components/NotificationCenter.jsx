import React, { useState, useEffect } from "react";
import { useNotifications } from "../context/NotificationContext";
import { notificationService } from "../services/notificationApi";
import {
  Bell,
  Filter,
  CheckCircle2,
  AlertCircle,
  Info,
  Clock,
  Trash2,
  Eye,
  Search,
  ChevronLeft,
  ChevronRight,
  Settings,
  X,
} from "lucide-react";

const NotificationCenter = ({ onClose, onOpenSettings, highlightId }) => {
  const { markAsRead, deleteNotification, markAllAsRead } = useNotifications();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    isRead: "",
    type: "",
    priority: "",
    startDate: "",
    endDate: "",
    search: "",
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  // Fetch notifications
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters,
      };

      // Remove empty filters
      Object.keys(params).forEach((key) => {
        if (params[key] === "") delete params[key];
      });

      const response = await notificationService.getNotifications(params);
      if (response?.success && response?.data?.notifications) {
        setNotifications(response.data.notifications || []);
        setPagination((prev) => ({
          ...prev,
          total: response.data.total || 0,
          totalPages: response.data.totalPages || 0,
        }));
      } else {
        setNotifications([]);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [pagination.page, filters]);

  // Scroll to highlighted notification
  useEffect(() => {
    if (highlightId) {
      setTimeout(() => {
        const element = document.getElementById(`notification-${highlightId}`);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 300);
    }
  }, [highlightId, notifications]);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "urgent":
        return "text-red-600 bg-red-50 border-red-200";
      case "high":
        return "text-orange-600 bg-orange-50 border-orange-200";
      case "medium":
        return "text-blue-600 bg-blue-50 border-blue-200";
      default:
        return "text-slate-600 bg-slate-50 border-slate-200";
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case "urgent":
      case "high":
        return <AlertCircle className="w-5 h-5" />;
      case "medium":
        return <Info className="w-5 h-5" />;
      default:
        return <CheckCircle2 className="w-5 h-5" />;
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleMarkAsRead = async (notificationId) => {
    await markAsRead(notificationId);
    fetchNotifications();
  };

  const handleDelete = async (notificationId) => {
    await deleteNotification(notificationId);
    fetchNotifications();
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead();
    fetchNotifications();
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const resetFilters = () => {
    setFilters({
      isRead: "",
      type: "",
      priority: "",
      startDate: "",
      endDate: "",
      search: "",
    });
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 font-inter selection:bg-indigo-500/30">
      {/* Header */}
      <div className="glass-header sticky top-0 z-[60] py-6">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <button
                onClick={onClose}
                className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/5 active:scale-95 group"
              >
                <X className="w-6 h-6 text-slate-400 group-hover:text-white" />
              </button>
              <div>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Bell className="w-8 h-8 text-indigo-400" />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full border-2 border-[#020617] animate-pulse"></div>
                  </div>
                  <h1 className="text-3xl font-black text-white tracking-widest uppercase italic">
                    Neural Hub
                  </h1>
                </div>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="h-[1px] w-8 bg-indigo-500/50"></span>
                  <p className="text-[10px] text-indigo-400/60 font-black uppercase tracking-[0.2em]">
                    Active Signal Flux: {pagination.total} Packets
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={onOpenSettings}
              className="group flex items-center gap-3 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl transition-all active:scale-95"
            >
              <Settings className="w-4 h-4 text-slate-400 group-hover:text-indigo-400 group-hover:rotate-90 transition-all duration-500" />
              <span className="text-xs font-black tracking-widest uppercase text-slate-400 group-hover:text-white">
                Matrix Config
              </span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Controls Panel */}
          <div className="lg:col-span-1 space-y-6">
            <div className="glass-card p-6 space-y-6 sticky top-32">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-black text-white tracking-[0.2em] uppercase flex items-center gap-2">
                  <Filter className="w-4 h-4 text-indigo-400" />
                  Signal Filters
                </h2>
                <button
                  onClick={resetFilters}
                  className="text-[10px] font-black text-indigo-400 hover:text-white uppercase tracking-widest transition-colors"
                >
                  Clear All
                </button>
              </div>

              <div className="space-y-4">
                <div className="input-group-premium">
                  <label className="input-label-premium">Stream Status</label>
                  <select
                    value={filters.isRead}
                    onChange={(e) => handleFilterChange("isRead", e.target.value)}
                    className="input-premium bg-[#0f172a] appearance-none"
                  >
                    <option value="" className="bg-[#0f172a]">All Signals</option>
                    <option value="false" className="bg-[#0f172a]">Unprocessed</option>
                    <option value="true" className="bg-[#0f172a]">Acknowledged</option>
                  </select>
                </div>

                <div className="input-group-premium">
                  <label className="input-label-premium">Priority Level</label>
                  <select
                    value={filters.priority}
                    onChange={(e) => handleFilterChange("priority", e.target.value)}
                    className="input-premium bg-[#0f172a] appearance-none"
                  >
                    <option value="" className="bg-[#0f172a]">All Priorities</option>
                    <option value="urgent" className="bg-[#0f172a]">Urgent</option>
                    <option value="high" className="bg-[#0f172a]">Priority High</option>
                    <option value="medium" className="bg-[#0f172a]">Medium</option>
                    <option value="low" className="bg-[#0f172a]">Standard</option>
                  </select>
                </div>

                <div className="input-group-premium">
                  <label className="input-label-premium">Time Horizon</label>
                  <input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => handleFilterChange("startDate", e.target.value)}
                    className="input-premium bg-[#0f172a] [color-scheme:dark]"
                  />
                </div>
              </div>

              <button
                onClick={handleMarkAllRead}
                className="w-full btn-primary py-4 text-[10px] font-black tracking-[0.2em] uppercase flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                Flush All Signals
              </button>
            </div>
          </div>

          {/* Feed Panel */}
          <div className="lg:col-span-3 space-y-4">
            {loading ? (
              <div className="glass-card p-20 flex flex-col items-center justify-center space-y-6">
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 border-2 border-indigo-500/20 rounded-2xl animate-spin-slow"></div>
                  <div className="absolute inset-0 border-2 border-t-indigo-500 border-transparent rounded-2xl animate-spin"></div>
                </div>
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] animate-pulse">
                  Decrypting Neural Stream...
                </p>
              </div>
            ) : notifications?.length === 0 ? (
              <div className="glass-card p-20 flex flex-col items-center justify-center text-center space-y-6">
                <div className="p-6 bg-white/5 rounded-[2rem] border border-white/10">
                  <Bell className="w-12 h-12 text-slate-600" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white uppercase tracking-widest">
                    Silent Frequency
                  </h3>
                  <p className="text-sm text-slate-500 mt-2 max-w-xs mx-auto">
                    No active signals detected in the current matrix parameters.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {(notifications || []).map((notification) => (
                  <div
                    key={notification._id}
                    id={`notification-${notification._id}`}
                    className={`glass-card p-6 transition-all group relative overflow-hidden ${
                      !notification.isRead
                        ? "border-indigo-500/30 bg-indigo-500/5 shadow-[0_0_30px_rgba(79,70,229,0.1)]"
                        : "border-white/5 opacity-80"
                    } ${
                      highlightId === notification._id
                        ? "ring-2 ring-amber-500/50 scale-[1.01]"
                        : ""
                    }`}
                  >
                    {!notification.isRead && (
                      <div className="absolute left-0 top-0 w-1 h-full bg-indigo-500"></div>
                    )}
                    
                    <div className="flex items-start gap-6">
                      {/* Status Icon */}
                      <div className={`p-4 rounded-2xl border transition-all ${
                        getPriorityColor(notification.priority).includes("red") ? "bg-rose-500/10 border-rose-500/20 text-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.1)]" :
                        getPriorityColor(notification.priority).includes("orange") ? "bg-amber-500/10 border-amber-500/20 text-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.1)]" :
                        "bg-indigo-500/10 border-indigo-500/20 text-indigo-400"
                      }`}>
                        {getPriorityIcon(notification.priority)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-6">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <h3 className="text-lg font-black text-white tracking-tight group-hover:text-indigo-400 transition-colors uppercase">
                                {notification.title}
                              </h3>
                              <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border tracking-widest ${
                                notification.priority === 'urgent' ? 'border-rose-500/30 text-rose-500 bg-rose-500/10' :
                                'border-indigo-500/30 text-indigo-400 bg-indigo-500/10'
                              }`}>
                                {notification.priority}
                              </span>
                            </div>
                            <p className="text-slate-400 mt-2 text-sm font-medium leading-relaxed">
                              {notification.message}
                            </p>

                            {/* Data Grid */}
                            {notification.data && typeof notification.data === "object" && Object.keys(notification.data).length > 0 && (
                              <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {Object.entries(notification.data).map(([key, value]) => (
                                  <div key={key} className="p-3 bg-white/5 rounded-xl border border-white/5 group/node hover:border-indigo-500/30 transition-all">
                                    <p className="text-[9px] font-black text-indigo-400/50 uppercase tracking-widest mb-1 group-hover/node:text-indigo-400">
                                      {key.replace(/([A-Z])/g, " $1").trim()}
                                    </p>
                                    <p className="text-xs font-bold text-slate-200 truncate">
                                      {typeof value === "object" ? JSON.stringify(value) : value?.toString() || "N/A"}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            )}

                            <div className="flex items-center gap-6 mt-6">
                              <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                <Clock className="w-3.5 h-3.5" />
                                {formatDate(notification.createdAt)}
                              </div>
                              {!notification.isRead && (
                                <div className="flex items-center gap-2 text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] animate-pulse">
                                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                                  LIVE STREAM
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-col gap-2">
                            {!notification.isRead && (
                              <button
                                onClick={() => handleMarkAsRead(notification._id)}
                                className="p-2.5 bg-white/5 hover:bg-emerald-500/20 text-slate-500 hover:text-emerald-400 border border-white/5 hover:border-emerald-500/30 rounded-xl transition-all active:scale-95"
                                title="Acknowledge Signal"
                              >
                                <Eye className="w-5 h-5" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(notification._id)}
                              className="p-2.5 bg-white/5 hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 border border-white/5 hover:border-rose-500/30 rounded-xl transition-all active:scale-95"
                              title="Purge Signal"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
              <div className="pt-10 flex items-center justify-center gap-4">
                <button
                  onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                  className="p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 disabled:opacity-20 disabled:cursor-not-allowed transition-all active:scale-95 group"
                >
                  <ChevronLeft className="w-5 h-5 text-slate-400 group-hover:text-white" />
                </button>

                <div className="px-6 py-3 bg-white/5 border border-white/5 rounded-2xl flex items-center gap-3">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Sector</span>
                  <span className="text-sm font-black text-white tabular-nums">{pagination.page} / {pagination.totalPages}</span>
                </div>

                <button
                  onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page === pagination.totalPages}
                  className="p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 disabled:opacity-20 disabled:cursor-not-allowed transition-all active:scale-95 group"
                >
                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-white" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter;
