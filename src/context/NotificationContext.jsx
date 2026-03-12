import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
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

  // Polling interval — 5 seconds for near-instant notifications.
  // Safe to keep fast because fetchUnreadCount no longer includes unreadCount
  // in its useCallback deps (uses prevUnreadCountRef instead), so changing the
  // count no longer creates a new function reference and re-triggers the effect.
  const POLLING_INTERVAL = 5000;

  // Use a ref to track the previous unread count without causing re-renders or effect loops
  const prevUnreadCountRef = useRef(0);

  // Fetch unread count — NOTE: does NOT include unreadCount in deps to avoid infinite loop
  const fetchUnreadCount = useCallback(async () => {
    if (!user) return;

    try {
      const response = await notificationService.getUnreadCount();
      if (response?.success && response?.data?.unreadCount !== undefined) {
        const newCount = response.data.unreadCount;
        console.log(
          `📊 Unread count: ${newCount} (previous: ${prevUnreadCountRef.current})`,
        );

        // If count increased, show toasts for new notifications
        if (newCount > prevUnreadCountRef.current) {
          console.log(
            `🔔 New notifications detected! Count: ${prevUnreadCountRef.current} → ${newCount}`,
          );
          fetchRecentForToast();
        }

        prevUnreadCountRef.current = newCount;
        setUnreadCount(newCount);
      }
    } catch (err) {
      console.error("❌ Failed to fetch unread count:", err);
    }
  }, [user]);

  // Fetch recent notifications for toast display
  const fetchRecentForToast = async () => {
    try {
      console.log("📥 Fetching recent notifications for toast...");
      const response = await notificationService.getRecentNotifications();
      if (response?.success && response?.data?.notifications) {
        const recentUnread = response.data.notifications.filter(
          (n) => !n.isRead,
        );

        console.log(`   Found ${recentUnread.length} unread notifications`);

        // Show toast for the most recent unread notification
        if (recentUnread.length > 0) {
          const newest = recentUnread[0];
          console.log(`   Showing toast for: ${newest.title}`);
          addToast(newest);

          // Show desktop notification
          showDesktopNotification(newest);

          // Play sound
          playNotificationSound();
        }
      }
    } catch (err) {
      console.error("❌ Failed to fetch recent notifications:", err);
    }
  };

  // Fetch recent notifications
  const fetchRecentNotifications = useCallback(async () => {
    if (!user) return;

    try {
      const response = await notificationService.getRecentNotifications();
      if (response?.success && response?.data?.notifications) {
        setNotifications(response.data.notifications);
      } else {
        setNotifications([]);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
      setError(err.message);
      setNotifications([]);
    }
  }, [user]);

  // Fetch user preferences
  const fetchPreferences = useCallback(async () => {
    if (!user) return;

    try {
      console.log("⚙️ Fetching notification preferences...");
      const response = await notificationService.getPreferences();
      if (response?.success && response?.data) {
        console.log("✅ Preferences loaded:", response.data);
        setPreferences(response.data);
      } else {
        console.log("⚠️ Failed to load preferences:", response);
      }
    } catch (err) {
      console.error("❌ Failed to fetch preferences:", err);
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
      if (response?.success && response?.data) {
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
      console.log("❌ No user logged in, skipping notification polling");
      setNotifications([]);
      setUnreadCount(0);
      setPreferences(null);
      return;
    }

    console.log(
      `✅ User logged in: ${user.email}, starting notification polling...`,
    );

    // Initial fetch
    fetchUnreadCount();
    fetchRecentNotifications();
    fetchPreferences();

    // Setup polling
    const interval = setInterval(() => {
      console.log(
        `🔁 Polling for notifications (every ${POLLING_INTERVAL / 1000}s)...`,
      );
      fetchUnreadCount();
    }, POLLING_INTERVAL);

    return () => {
      console.log("🗑️ Cleaning up notification polling");
      clearInterval(interval);
    };
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

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

  // Play notification sound — always plays, loud, attractive double-chime
  const playNotificationSound = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;

      const ctx = new AudioCtx();

      // Resume context if browser suspended it (autoplay policy)
      const resume =
        ctx.state === "suspended" ? ctx.resume() : Promise.resolve();

      resume.then(() => {
        const now = ctx.currentTime;

        // ── Helper: play one tone ──────────────────────────────────────
        const playTone = (freq, startTime, duration, peakGain = 0.8) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.type = "sine";
          osc.frequency.value = freq;

          // Fast attack, smooth decay
          gain.gain.setValueAtTime(0, startTime);
          gain.gain.linearRampToValueAtTime(peakGain, startTime + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

          osc.start(startTime);
          osc.stop(startTime + duration);
        };

        // ── Double-chime: high note then slightly higher note ──────────
        // First chime
        playTone(880, now, 0.35, 0.85); // A5
        playTone(1320, now, 0.35, 0.4); // E6 harmonic overtone

        // Second chime (100ms later, slightly higher = pleasant ascending ding)
        playTone(1046, now + 0.12, 0.4, 0.85); // C6
        playTone(1568, now + 0.12, 0.4, 0.4); // G6 harmonic overtone
      });
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
