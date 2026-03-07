import React, { useEffect } from "react";
import { useNotifications } from "../../context/NotificationContext";
import {
  Bell,
  CheckCircle2,
  AlertCircle,
  Info,
  Clock,
  Eye,
  Trash2,
  ExternalLink,
} from "lucide-react";

const NotificationDropdown = ({ onClose, onOpenCenter }) => {
  const {
    notifications,
    unreadCount,
    fetchRecentNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  useEffect(() => {
    fetchRecentNotifications();
  }, [fetchRecentNotifications]);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "urgent":
        return "text-red-600 bg-red-50";
      case "high":
        return "text-orange-600 bg-orange-50";
      case "medium":
        return "text-blue-600 bg-blue-50";
      default:
        return "text-slate-600 bg-slate-50";
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case "urgent":
      case "high":
        return <AlertCircle className="w-4 h-4" />;
      case "medium":
        return <Info className="w-4 h-4" />;
      default:
        return <CheckCircle2 className="w-4 h-4" />;
    }
  };

  const formatTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);

    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return new Date(date).toLocaleDateString();
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      await markAsRead(notification._id);
    }
    // Open notification center
    if (onOpenCenter) {
      onOpenCenter(notification._id);
    }
    onClose();
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead();
    fetchRecentNotifications();
  };

  const handleDelete = async (e, notificationId) => {
    e.stopPropagation();
    await deleteNotification(notificationId);
    fetchRecentNotifications();
  };

  if (!notifications) {
    return (
      <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 overflow-hidden">
        <div className="p-4 text-center text-slate-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
        <div>
          <h3 className="font-bold text-slate-900">Notifications</h3>
          {unreadCount > 0 && (
            <p className="text-xs text-slate-600 mt-0.5">
              {unreadCount} unread
            </p>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
          >
            Mark all read
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="max-h-[400px] overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-8 text-center">
            <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600 font-medium">No notifications yet</p>
            <p className="text-xs text-slate-500 mt-1">
              You'll be notified when something happens
            </p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification._id}
              onClick={() => handleNotificationClick(notification)}
              className={`p-4 border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors ${
                !notification.isRead ? "bg-blue-50" : ""
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`p-2 rounded-lg ${getPriorityColor(notification.priority)}`}
                >
                  {getPriorityIcon(notification.priority)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4
                      className={`font-semibold text-sm ${
                        !notification.isRead
                          ? "text-slate-900"
                          : "text-slate-700"
                      }`}
                    >
                      {notification.title}
                    </h4>
                    {!notification.isRead && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5" />
                    )}
                  </div>

                  <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                    {notification.message}
                  </p>

                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTimeAgo(notification.createdAt)}
                    </span>

                    <button
                      onClick={(e) => handleDelete(e, notification._id)}
                      className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-slate-200 bg-slate-50">
        <button
          onClick={() => {
            if (onOpenCenter) {
              onOpenCenter();
            }
            onClose();
          }}
          className="w-full px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 transition-colors rounded-lg font-semibold text-sm flex items-center justify-center gap-2"
        >
          View All Notifications
          <ExternalLink className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default NotificationDropdown;
