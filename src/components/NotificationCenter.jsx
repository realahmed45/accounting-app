import React, { useState, useEffect } from "react";
import { useNotifications } from "../../context/NotificationContext";
import { notificationService } from "../../services/notificationApi";
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
      if (response.success) {
        setNotifications(response.data.notifications);
        setPagination((prev) => ({
          ...prev,
          total: response.data.total,
          totalPages: response.data.totalPages,
        }));
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
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
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                  <Bell className="w-8 h-8" />
                  Notification Center
                </h1>
                <p className="text-sm text-slate-600 mt-1">
                  {pagination.total} total notifications
                </p>
              </div>
            </div>

            <button
              onClick={onOpenSettings}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 transition-colors rounded-lg font-semibold"
            >
              <Settings className="w-4 h-4" />
              Settings
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-900 flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters
            </h2>
            <button
              onClick={resetFilters}
              className="text-sm text-blue-600 hover:text-blue-700 font-semibold"
            >
              Reset
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Read Status */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Status
              </label>
              <select
                value={filters.isRead}
                onChange={(e) => handleFilterChange("isRead", e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All</option>
                <option value="false">Unread</option>
                <option value="true">Read</option>
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Priority
              </label>
              <select
                value={filters.priority}
                onChange={(e) => handleFilterChange("priority", e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                From Date
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) =>
                  handleFilterChange("startDate", e.target.value)
                }
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Mark All Read Button */}
          <div className="mt-4 pt-4 border-t border-slate-200">
            <button
              onClick={handleMarkAllRead}
              className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white hover:bg-blue-700 transition-colors rounded-lg font-semibold flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              Mark All as Read
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {loading ? (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto mb-4" />
              <p className="text-slate-600">Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
              <Bell className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                No notifications found
              </h3>
              <p className="text-slate-600">
                {Object.values(filters).some((v) => v !== "")
                  ? "Try adjusting your filters"
                  : "You're all caught up!"}
              </p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification._id}
                id={`notification-${notification._id}`}
                className={`bg-white rounded-xl shadow-sm border-2 p-6 transition-all hover:shadow-md ${
                  !notification.isRead
                    ? "border-blue-300 bg-blue-50"
                    : "border-slate-200"
                } ${
                  highlightId === notification._id
                    ? "ring-4 ring-yellow-300"
                    : ""
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Priority Icon */}
                  <div
                    className={`p-3 rounded-xl border-2 ${getPriorityColor(
                      notification.priority,
                    )}`}
                  >
                    {getPriorityIcon(notification.priority)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-slate-900">
                          {notification.title}
                        </h3>
                        <p className="text-slate-600 mt-1">
                          {notification.message}
                        </p>

                        {/* Metadata */}
                        {notification.data &&
                          Object.keys(notification.data).length > 0 && (
                            <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                              <p className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                                Details
                              </p>
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                {Object.entries(notification.data).map(
                                  ([key, value]) => (
                                    <div key={key}>
                                      <span className="text-slate-600 font-medium">
                                        {key.replace(/([A-Z])/g, " $1").trim()}:
                                      </span>{" "}
                                      <span className="text-slate-900 font-semibold">
                                        {typeof value === "object"
                                          ? JSON.stringify(value)
                                          : value?.toString() || "N/A"}
                                      </span>
                                    </div>
                                  ),
                                )}
                              </div>
                            </div>
                          )}

                        <div className="flex items-center gap-4 mt-4 text-sm text-slate-600">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {formatDate(notification.createdAt)}
                          </span>
                          <span className="px-2 py-1 bg-slate-100 rounded-md font-medium">
                            {notification.priority}
                          </span>
                          {!notification.isRead && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md font-semibold flex items-center gap-1">
                              <div className="w-2 h-2 bg-blue-500 rounded-full" />
                              Unread
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2">
                        {!notification.isRead && (
                          <button
                            onClick={() => handleMarkAsRead(notification._id)}
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Mark as read"
                          >
                            <Eye className="w-5 h-5 text-slate-600" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(notification._id)}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-5 h-5 text-red-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-4">
            <button
              onClick={() =>
                setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
              }
              disabled={pagination.page === 1}
              className="px-4 py-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>

            <span className="text-slate-700 font-semibold">
              Page {pagination.page} of {pagination.totalPages}
            </span>

            <button
              onClick={() =>
                setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
              }
              disabled={pagination.page === pagination.totalPages}
              className="px-4 py-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold flex items-center gap-2"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationCenter;
