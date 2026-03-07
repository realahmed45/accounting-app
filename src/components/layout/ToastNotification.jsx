import React, { useEffect } from "react";
import { useNotifications } from "../../context/NotificationContext";
import { AlertCircle, Info, CheckCircle2, X } from "lucide-react";

const ToastNotification = ({ onOpenCenter }) => {
  const { toasts, removeToast, markAsRead } = useNotifications();

  const handleToastClick = async (notification) => {
    // Mark as read
    if (!notification.isRead) {
      await markAsRead(notification._id);
    }
    // Open notification center with this notification highlighted
    if (onOpenCenter) {
      onOpenCenter(notification._id);
    }
    // Remove toast
    removeToast(notification._id);
  };

  const getPriorityStyles = (priority) => {
    switch (priority) {
      case "urgent":
        return "bg-red-50 border-red-300 text-red-900";
      case "high":
        return "bg-orange-50 border-orange-300 text-orange-900";
      case "medium":
        return "bg-blue-50 border-blue-300 text-blue-900";
      default:
        return "bg-slate-50 border-slate-300 text-slate-900";
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

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed top-20 right-4 z-50 space-y-3"
      style={{ maxWidth: "400px" }}
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          onClick={() => handleToastClick(toast)}
          className={`${getPriorityStyles(
            toast.priority,
          )} rounded-xl shadow-2xl border-2 p-4 cursor-pointer transform transition-all duration-300 hover:scale-105 animate-slideIn`}
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              {getPriorityIcon(toast.priority)}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4" />
                  <h4 className="font-bold text-sm">{toast.title}</h4>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeToast(toast.id);
                  }}
                  className="flex-shrink-0 hover:bg-black/10 rounded-lg p-1 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-sm mt-1 line-clamp-2">{toast.message}</p>

              <p className="text-xs opacity-75 mt-2">Click to view details</p>
            </div>
          </div>

          {/* Progress bar for auto-dismiss */}
          <div className="mt-3 h-1 bg-black/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-current opacity-50 animate-shrink"
              style={{ animationDuration: "5s" }}
            />
          </div>
        </div>
      ))}

      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes shrink {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }

        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }

        .animate-shrink {
          animation: shrink 5s linear;
        }
      `}</style>
    </div>
  );
};

export default ToastNotification;
