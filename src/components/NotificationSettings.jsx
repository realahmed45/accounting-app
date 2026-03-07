import React, { useState, useEffect } from "react";
import { useNotifications } from "../context/NotificationContext";
import {
  Settings,
  Bell,
  Mail,
  Clock,
  Volume2,
  Monitor,
  Save,
  X,
  Check,
} from "lucide-react";

const NotificationSettings = ({ onClose }) => {
  const {
    preferences,
    updatePreferences,
    requestNotificationPermission,
    notificationPermission,
  } = useNotifications();
  const [formData, setFormData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (preferences) {
      setFormData({
        emailNotifications: {
          all: preferences.emailNotifications?.all ?? true,
          expenses: preferences.emailNotifications?.expenses ?? true,
          shifts: preferences.emailNotifications?.shifts ?? true,
          checkIns: preferences.emailNotifications?.checkIns ?? true,
          workLogs: preferences.emailNotifications?.workLogs ?? true,
          permissions: preferences.emailNotifications?.permissions ?? true,
          ownership: preferences.emailNotifications?.ownership ?? true,
          banking: preferences.emailNotifications?.banking ?? true,
          weekly: preferences.emailNotifications?.weekly ?? true,
        },
        inAppNotifications: {
          all: preferences.inAppNotifications?.all ?? true,
          expenses: preferences.inAppNotifications?.expenses ?? true,
          shifts: preferences.inAppNotifications?.shifts ?? true,
          checkIns: preferences.inAppNotifications?.checkIns ?? true,
          workLogs: preferences.inAppNotifications?.workLogs ?? true,
          permissions: preferences.inAppNotifications?.permissions ?? true,
          ownership: preferences.inAppNotifications?.ownership ?? true,
          banking: preferences.inAppNotifications?.banking ?? true,
          weekly: preferences.inAppNotifications?.weekly ?? true,
        },
        emailFrequency: preferences.emailFrequency || "instant",
        quietHours: {
          enabled: preferences.quietHours?.enabled ?? false,
          startTime: preferences.quietHours?.startTime || "22:00",
          endTime: preferences.quietHours?.endTime || "08:00",
        },
        notificationSound: preferences.notificationSound ?? true,
        desktopNotifications: preferences.desktopNotifications ?? true,
      });
    }
  }, [preferences]);

  const handleToggle = (section, key) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: !prev[section][key],
      },
    }));
  };

  const handleEmailFrequencyChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      emailFrequency: value,
    }));
  };

  const handleQuietHoursToggle = () => {
    setFormData((prev) => ({
      ...prev,
      quietHours: {
        ...prev.quietHours,
        enabled: !prev.quietHours.enabled,
      },
    }));
  };

  const handleQuietHoursChange = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      quietHours: {
        ...prev.quietHours,
        [key]: value,
      },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    const success = await updatePreferences(formData);
    setSaving(false);

    if (success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  if (!formData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
                  <Settings className="w-8 h-8" />
                  Notification Settings
                </h1>
                <p className="text-sm text-slate-600 mt-1">
                  Customize how you receive notifications
                </p>
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className={`flex items-center gap-2 px-6 py-3 ${
                saved
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-slate-900 hover:bg-slate-800"
              } text-white transition-colors rounded-lg font-semibold disabled:opacity-50`}
            >
              {saved ? (
                <>
                  <Check className="w-5 h-5" />
                  Saved!
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  {saving ? "Saving..." : "Save Changes"}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Email Notifications */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Mail className="w-6 h-6" />
                Email Notifications
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Choose which emails you want to receive
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.emailNotifications.all}
                onChange={() => handleToggle("emailNotifications", "all")}
                className="sr-only peer"
              />
              <div className="w-14 h-7 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
              <span className="ml-3 text-sm font-semibold text-slate-700">
                Master Switch
              </span>
            </label>
          </div>

          <div className="space-y-4">
            {Object.entries(formData.emailNotifications)
              .filter(([key]) => key !== "all")
              .map(([key, value]) => (
                <div
                  key={key}
                  className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0"
                >
                  <span className="text-slate-700 font-medium capitalize">
                    {key.replace(/([A-Z])/g, " $1").trim()}
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={() => handleToggle("emailNotifications", key)}
                      disabled={!formData.emailNotifications.all}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
                  </label>
                </div>
              ))}
          </div>

          {/* Email Frequency */}
          <div className="mt-6 pt-6 border-t border-slate-200">
            <label className="block text-sm font-semibold text-slate-700 mb-3">
              Email Frequency
            </label>
            <select
              value={formData.emailFrequency}
              onChange={(e) => handleEmailFrequencyChange(e.target.value)}
              disabled={!formData.emailNotifications.all}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              <option value="instant">Instant (as they happen)</option>
              <option value="hourly_digest">Hourly Digest</option>
              <option value="daily_digest">Daily Digest</option>
            </select>
          </div>
        </div>

        {/* In-App Notifications */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Bell className="w-6 h-6" />
                In-App Notifications
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Control notifications within the app
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.inAppNotifications.all}
                onChange={() => handleToggle("inAppNotifications", "all")}
                className="sr-only peer"
              />
              <div className="w-14 h-7 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
              <span className="ml-3 text-sm font-semibold text-slate-700">
                Master Switch
              </span>
            </label>
          </div>

          <div className="space-y-4">
            {Object.entries(formData.inAppNotifications)
              .filter(([key]) => key !== "all")
              .map(([key, value]) => (
                <div
                  key={key}
                  className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0"
                >
                  <span className="text-slate-700 font-medium capitalize">
                    {key.replace(/([A-Z])/g, " $1").trim()}
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={() => handleToggle("inAppNotifications", key)}
                      disabled={!formData.inAppNotifications.all}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
                  </label>
                </div>
              ))}
          </div>
        </div>

        {/* Quiet Hours */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-6 h-6" />
                Quiet Hours
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Mute notifications during specific hours
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.quietHours.enabled}
                onChange={handleQuietHoursToggle}
                className="sr-only peer"
              />
              <div className="w-14 h-7 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {formData.quietHours.enabled && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Start Time
                </label>
                <input
                  type="time"
                  value={formData.quietHours.startTime}
                  onChange={(e) =>
                    handleQuietHoursChange("startTime", e.target.value)
                  }
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  End Time
                </label>
                <input
                  type="time"
                  value={formData.quietHours.endTime}
                  onChange={(e) =>
                    handleQuietHoursChange("endTime", e.target.value)
                  }
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
                />
              </div>
            </div>
          )}
        </div>

        {/* Additional Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-6">
            Additional Settings
          </h2>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Volume2 className="w-5 h-5 text-slate-600" />
                <div>
                  <p className="font-semibold text-slate-900">
                    Notification Sound
                  </p>
                  <p className="text-sm text-slate-600">
                    Play a sound when new notifications arrive
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.notificationSound}
                  onChange={() =>
                    setFormData((prev) => ({
                      ...prev,
                      notificationSound: !prev.notificationSound,
                    }))
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Desktop Notifications with Permission Request */}
            <div
              className={`flex items-center justify-between pt-6 border-t border-slate-200 p-4 rounded-lg transition-colors ${
                notificationPermission === "denied" ? "bg-red-50" : ""
              }`}
            >
              <div className="flex items-center gap-3 flex-1">
                <Monitor className="w-5 h-5 text-slate-600 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-semibold text-slate-900">
                    Desktop Notifications
                  </p>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {notificationPermission === "granted" &&
                      "✅ Browser notifications enabled"}
                    {notificationPermission === "default" &&
                      "🔔 Click toggle to request permission"}
                    {notificationPermission === "denied" &&
                      "❌ Permission denied - Enable in browser settings"}
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={
                    formData.desktopNotifications &&
                    notificationPermission === "granted"
                  }
                  disabled={notificationPermission === "denied"}
                  onChange={async () => {
                    if (notificationPermission === "default") {
                      // Request permission first
                      const granted = await requestNotificationPermission();
                      if (granted) {
                        setFormData((prev) => ({
                          ...prev,
                          desktopNotifications: true,
                        }));
                      }
                    } else if (notificationPermission === "granted") {
                      setFormData((prev) => ({
                        ...prev,
                        desktopNotifications: !prev.desktopNotifications,
                      }));
                    }
                  }}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Save Button (Mobile) */}
        <div className="sm:hidden">
          <button
            onClick={handleSave}
            disabled={saving}
            className={`w-full flex items-center justify-center gap-2 px-6 py-4 ${
              saved
                ? "bg-green-600 hover:bg-green-700"
                : "bg-slate-900 hover:bg-slate-800"
            } text-white transition-colors rounded-xl font-bold text-lg disabled:opacity-50`}
          >
            {saved ? (
              <>
                <Check className="w-6 h-6" />
                Saved!
              </>
            ) : (
              <>
                <Save className="w-6 h-6" />
                {saving ? "Saving..." : "Save Changes"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;
