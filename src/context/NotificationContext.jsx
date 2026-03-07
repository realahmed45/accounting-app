import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { notificationService } from "../services/notificationApi";
import { useAuth } from "./AuthContext";

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within NotificationProvider",
    );
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [preferences, setPreferences] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notificationPermission, setNotificationPermission] = useState(
    typeof Notification !== "undefined" ? Notification.permission : "default",
  );

  // Polling interval (5 seconds for instant notifications)
  const POLLING_INTERVAL = 5000;

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    if (!user) return;

    try {
      const response = await notificationService.getUnreadCount();
      if (response.success) {
        const newCount = response.data.unreadCount;

        // If count increased, show toasts for new notifications
        if (newCount > unreadCount) {
          fetchRecentForToast();
        }

        setUnreadCount(newCount);
      }
    } catch (err) {
      console.error("Failed to fetch unread count:", err);
    }
  }, [user, unreadCount]);

  // Fetch recent notifications for toast display
  const fetchRecentForToast = async () => {
    try {
      const response = await notificationService.getRecentNotifications();
      if (response.success) {
        const recentUnread = response.data.notifications.filter(
          (n) => !n.isRead,
        );

        // Show toast for the most recent unread notification
        if (recentUnread.length > 0) {
          const newest = recentUnread[0];
          addToast(newest);

          // Show desktop notification
          showDesktopNotification(newest);

          // Play sound
          playNotificationSound();
        }
      }
    } catch (err) {
      console.error("Failed to fetch recent notifications:", err);
    }
  };

  // Fetch recent notifications
  const fetchRecentNotifications = useCallback(async () => {
    if (!user) return;

    try {
      const response = await notificationService.getRecentNotifications();
      if (response.success) {
        setNotifications(response.data.notifications);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
      setError(err.message);
    }
  }, [user]);

  // Fetch user preferences
  const fetchPreferences = useCallback(async () => {
    if (!user) return;

    try {
      const response = await notificationService.getPreferences();
      if (response.success) {
        setPreferences(response.data);
      }
    } catch (err) {
      console.error("Failed to fetch preferences:", err);
    }
  }, [user]);

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);

      // Update local state
      setNotifications((prev) =>
        prev.map((n) =>
          n._id === notificationId ? { ...n, isRead: true } : n,
        ),
      );

      // Decrease unread count
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  // Mark all as read
  const markAllAsRead = async (accountId = null) => {
    try {
      await notificationService.markAllAsRead(accountId);

      // Update local state
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));

      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId) => {
    try {
      await notificationService.deleteNotification(notificationId);

      // Update local state
      setNotifications((prev) => prev.filter((n) => n._id !== notificationId));

      // Refresh unread count
      fetchUnreadCount();
    } catch (err) {
      console.error("Failed to delete notification:", err);
    }
  };

  // Update preferences
  const updatePreferences = async (newPreferences) => {
    try {
      const response =
        await notificationService.updatePreferences(newPreferences);
      if (response.success) {
        setPreferences(response.data);
        return true;
      }
      return false;
    } catch (err) {
      console.error("Failed to update preferences:", err);
      return false;
    }
  };

  // Add toast notification
  const addToast = (notification) => {
    const toast = {
      id: notification._id || Date.now(),
      ...notification,
      timestamp: Date.now(),
    };

    setToasts((prev) => [...prev, toast]);

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      removeToast(toast.id);
    }, 5000);
  };

  // Remove toast
  const removeToast = (toastId) => {
    setToasts((prev) => prev.filter((t) => t.id !== toastId));
  };

  // Setup polling when user is logged in
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      setPreferences(null);
      return;
    }

    // Initial fetch
    fetchUnreadCount();
    fetchRecentNotifications();
    fetchPreferences();

    // Setup polling
    const interval = setInterval(() => {
      fetchUnreadCount();
    }, POLLING_INTERVAL);

    return () => clearInterval(interval);
  }, [user, fetchUnreadCount, fetchRecentNotifications, fetchPreferences]);

  // Check if notifications should be played with sound
  const shouldPlaySound = () => {
    if (!preferences) return false;
    return preferences.notificationSound === true;
  };

  // Request desktop notification permission
  const requestNotificationPermission = async () => {
    if (typeof Notification === "undefined") {
      console.log("Browser does not support notifications");
      return false;
    }

    if (Notification.permission === "granted") {
      setNotificationPermission("granted");
      return true;
    }

    if (Notification.permission !== "denied") {
      try {
        const permission = await Notification.requestPermission();
        setNotificationPermission(permission);

        if (permission === "granted") {
          console.log("✅ Desktop notification permission granted");
          // Update preferences
          if (preferences) {
            await updatePreferences({
              ...preferences,
              desktopNotifications: true,
            });
          }
          return true;
        }
      } catch (err) {
        console.error("Failed to request notification permission:", err);
      }
    }

    return false;
  };

  // Show desktop notification
  const showDesktopNotification = (notification) => {
    // Check if desktop notifications are enabled in preferences
    if (!preferences?.desktopNotifications) return;

    // Check browser support and permission
    if (
      typeof Notification === "undefined" ||
      Notification.permission !== "granted"
    ) {
      return;
    }

    try {
      // Get priority icon
      const getIcon = (priority) => {
        switch (priority) {
          case "urgent":
            return "🚨";
          case "high":
            return "⚠️";
          case "medium":
            return "📬";
          default:
            return "🔔";
        }
      };

      const icon = getIcon(notification.priority);
      const title = `${icon} ${notification.title}`;
      const options = {
        body: notification.message,
        icon: "/logo.png", // Replace with your actual logo path
        badge: "/badge.png", // Replace with your actual badge path
        tag: notification._id,
        requireInteraction: notification.priority === "urgent", // Keep urgent notifications until clicked
        silent: false,
        timestamp: Date.now(),
        data: {
          notificationId: notification._id,
          url: "/notifications",
        },
      };

      const desktopNotif = new Notification(title, options);

      // Handle click - open notification center
      desktopNotif.onclick = (event) => {
        event.preventDefault();
        window.focus();

        // Store notification ID in sessionStorage to highlight it
        sessionStorage.setItem("highlightNotification", notification._id);

        // Navigate to notifications page
        window.location.hash = "#notifications";

        desktopNotif.close();
      };

      // Auto-close after 10 seconds (except urgent)
      if (notification.priority !== "urgent") {
        setTimeout(() => desktopNotif.close(), 10000);
      }

      console.log("🔔 Desktop notification shown:", notification.title);
    } catch (err) {
      console.error("Failed to show desktop notification:", err);
    }
  };

  // Play notification sound
  const playNotificationSound = () => {
    if (!shouldPlaySound()) return;

    try {
      // Create a simple beep sound
      const audioContext = new (
        window.AudioContext || window.webkitAudioContext
      )();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = "sine";

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.5,
      );

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (err) {
      console.error("Failed to play notification sound:", err);
    }
  };

  const value = {
    notifications,
    unreadCount,
    preferences,
    toasts,
    loading,
    error,
    notificationPermission,
    fetchRecentNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    updatePreferences,
    addToast,
    removeToast,
    requestNotificationPermission,
    showDesktopNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;
