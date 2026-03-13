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
    <div className="min-h-screen bg-[#020617] text-slate-300 font-inter selection:bg-indigo-500/30 pb-24 sm:pb-12">
      {/* Header */}
      <div className="glass-header sticky top-0 z-[60] py-6">
        <div className="max-w-4xl mx-auto px-6 sm:px-8">
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
                  <Settings className="w-8 h-8 text-indigo-400" />
                  <h1 className="text-2xl sm:text-3xl font-black text-white tracking-widest uppercase italic">
                    Matrix Protocol
                  </h1>
                </div>
                <p className="text-[10px] text-indigo-400/60 font-black uppercase tracking-[0.2em] mt-1">
                  Neural Signal Orchestration
                </p>
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className={`hidden sm:flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-xs tracking-widest uppercase transition-all active:scale-95 ${
                saved
                  ? "bg-emerald-500 text-white shadow-[0_0_30px_rgba(16,185,129,0.3)]"
                  : "btn-primary shadow-[0_0_30px_rgba(79,70,229,0.3)]"
              }`}
            >
              {saved ? (
                <>
                  <Check className="w-4 h-4" />
                  SYNCED
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {saving ? "UPLOADING..." : "COMMIT CHANGES"}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Save Bar */}
      <div className="sm:hidden fixed bottom-0 inset-x-0 z-[70] p-6">
        <div className="glass-card p-2 bg-[#020617]/80 backdrop-blur-2xl border-white/10">
          <button
            onClick={handleSave}
            disabled={saving}
            className={`w-full flex items-center justify-center gap-3 py-5 rounded-2xl font-black text-xs tracking-[0.3em] uppercase transition-all active:scale-95 ${
              saved
                ? "bg-emerald-500 text-white"
                : "btn-primary"
            }`}
          >
            {saved ? (
              <>
                <Check className="w-5 h-5" />
                SYNCED
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                {saving ? "UPLOADING..." : "COMMIT CHANGES"}
              </>
            )}
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 sm:px-8 py-10 space-y-10">
        {/* Email Segment */}
        <div className="glass-card overflow-hidden">
          <div className="p-8 border-b border-white/5 bg-white/2">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-500/20 rounded-lg">
                    <Mail className="w-5 h-5 text-indigo-400" />
                  </div>
                  <h2 className="text-lg font-black text-white tracking-widest uppercase">
                    Neural Uplink (Email)
                  </h2>
                </div>
                <p className="text-sm text-slate-500 font-medium">
                  Configure external signal delivery parameters
                </p>
              </div>
              
              <button
                onClick={() => handleToggle("emailNotifications", "all")}
                className={`w-14 h-8 rounded-full transition-all relative ${
                  formData.emailNotifications.all ? 'bg-indigo-500' : 'bg-white/10'
                }`}
              >
                <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all shadow-lg ${
                  formData.emailNotifications.all ? 'left-7' : 'left-1'
                }`} />
              </button>
            </div>
          </div>

          <div className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
              {Object.entries(formData.emailNotifications)
                .filter(([key]) => key !== "all")
                .map(([key, value]) => (
                  <div
                    key={key}
                    className={`flex items-center justify-between transition-opacity ${
                      !formData.emailNotifications.all ? 'opacity-30' : 'opacity-100'
                    }`}
                  >
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                      {key.replace(/([A-Z])/g, " $1").trim()}
                    </span>
                    <button
                      disabled={!formData.emailNotifications.all}
                      onClick={() => handleToggle("emailNotifications", key)}
                      className={`w-10 h-5 rounded-full transition-all relative ${
                        value ? 'bg-indigo-500/50' : 'bg-white/5'
                      }`}
                    >
                      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${
                        value ? 'left-5.5' : 'left-0.5'
                      }`} />
                    </button>
                  </div>
                ))}
            </div>

            <div className="pt-8 border-t border-white/5">
              <div className="input-group-premium max-w-sm">
                <label className="input-label-premium">Signal Frequency</label>
                <select
                  value={formData.emailFrequency}
                  onChange={(e) => handleEmailFrequencyChange(e.target.value)}
                  disabled={!formData.emailNotifications.all}
                  className="input-premium bg-[#0f172a] appearance-none"
                >
                  <option value="instant" className="bg-[#0f172a]">Direct Transmission (Instant)</option>
                  <option value="hourly_digest" className="bg-[#0f172a]">Hourly Accumulation</option>
                  <option value="daily_digest" className="bg-[#0f172a]">Diurnal Briefing</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Matrix Segment (In-App) */}
        <div className="glass-card overflow-hidden">
          <div className="p-8 border-b border-white/5 bg-white/2">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-500/20 rounded-lg">
                    <Bell className="w-5 h-5 text-indigo-400" />
                  </div>
                  <h2 className="text-lg font-black text-white tracking-widest uppercase">
                    Matrix Overlay (In-App)
                  </h2>
                </div>
                <p className="text-sm text-slate-500 font-medium">
                  Direct neural stream visualization settings
                </p>
              </div>
              
              <button
                onClick={() => handleToggle("inAppNotifications", "all")}
                className={`w-14 h-8 rounded-full transition-all relative ${
                  formData.inAppNotifications.all ? 'bg-indigo-500' : 'bg-white/10'
                }`}
              >
                <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all shadow-lg ${
                  formData.inAppNotifications.all ? 'left-7' : 'left-1'
                }`} />
              </button>
            </div>
          </div>

          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
            {Object.entries(formData.inAppNotifications)
              .filter(([key]) => key !== "all")
              .map(([key, value]) => (
                <div
                  key={key}
                  className={`flex items-center justify-between transition-opacity ${
                    !formData.inAppNotifications.all ? 'opacity-30' : 'opacity-100'
                  }`}
                >
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                    {key.replace(/([A-Z])/g, " $1").trim()}
                  </span>
                  <button
                    disabled={!formData.inAppNotifications.all}
                    onClick={() => handleToggle("inAppNotifications", key)}
                    className={`w-10 h-5 rounded-full transition-all relative ${
                      value ? 'bg-indigo-500/50' : 'bg-white/5'
                    }`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${
                      value ? 'left-5.5' : 'left-0.5'
                    }`} />
                  </button>
                </div>
              ))}
          </div>
        </div>

        {/* Silent Protocol (Quiet Hours) */}
        <div className="glass-card p-8">
          <div className="flex items-start justify-between mb-8">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/20 rounded-lg">
                  <Clock className="w-5 h-5 text-amber-500" />
                </div>
                <h2 className="text-lg font-black text-white tracking-widest uppercase">
                  Silent Protocol
                </h2>
              </div>
              <p className="text-sm text-slate-500 font-medium">
                Autonomous signal suppression periods
              </p>
            </div>
            
            <button
              onClick={handleQuietHoursToggle}
              className={`w-14 h-8 rounded-full transition-all relative ${
                formData.quietHours.enabled ? 'bg-amber-500' : 'bg-white/10'
              }`}
            >
              <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all shadow-lg ${
                formData.quietHours.enabled ? 'left-7' : 'left-1'
              }`} />
            </button>
          </div>

          {formData.quietHours.enabled && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-fadeIn">
              <div className="input-group-premium">
                <label className="input-label-premium">Dark Phase Start</label>
                <input
                  type="time"
                  value={formData.quietHours.startTime}
                  onChange={(e) => handleQuietHoursChange("startTime", e.target.value)}
                  className="input-premium bg-[#0f172a] [color-scheme:dark]"
                />
              </div>
              <div className="input-group-premium">
                <label className="input-label-premium">Dark Phase End</label>
                <input
                  type="time"
                  value={formData.quietHours.endTime}
                  onChange={(e) => handleQuietHoursChange("endTime", e.target.value)}
                  className="input-premium bg-[#0f172a] [color-scheme:dark]"
                />
              </div>
            </div>
          )}
        </div>

        {/* Sensory Overrides */}
        <div className="glass-card p-8 space-y-8">
          <h2 className="text-xs font-black text-indigo-400 tracking-[0.3em] uppercase">
            Sensory Overrides
          </h2>

          <div className="space-y-8">
            <div className="flex items-center justify-between group">
              <div className="flex items-center gap-5">
                <div className="p-3 bg-white/5 rounded-2xl border border-white/5 group-hover:border-indigo-500/30 transition-all">
                  <Volume2 className="w-5 h-5 text-slate-400 group-hover:text-indigo-400" />
                </div>
                <div>
                  <p className="font-black text-white tracking-widest uppercase text-xs">Acoustic Feedback</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">Audio signal on packet arrival</p>
                </div>
              </div>
              <button
                onClick={() => setFormData((prev) => ({ ...prev, notificationSound: !prev.notificationSound }))}
                className={`w-10 h-5 rounded-full transition-all relative ${
                  formData.notificationSound ? 'bg-indigo-500/50' : 'bg-white/5'
                }`}
              >
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${
                  formData.notificationSound ? 'left-5.5' : 'left-0.5'
                }`} />
              </button>
            </div>

            <div className={`p-6 rounded-[2rem] border transition-all ${
              notificationPermission === "denied" 
                ? "bg-rose-500/5 border-rose-500/20" 
                : "bg-white/2 border-white/5 hover:border-indigo-500/20"
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-5">
                  <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
                    <Monitor className="w-5 h-5 text-slate-400" />
                  </div>
                  <div>
                    <p className="font-black text-white tracking-widest uppercase text-xs">Exo-System Alerts</p>
                    <p className={`text-[10px] font-black uppercase tracking-wider mt-1 ${
                      notificationPermission === "granted" ? "text-emerald-400" :
                      notificationPermission === "denied" ? "text-rose-400" : "text-slate-500"
                    }`}>
                      {notificationPermission === "granted" && "Network Authorization Confirmed"}
                      {notificationPermission === "default" && "Awaiting Signal Permission"}
                      {notificationPermission === "denied" && "Permission Blocked in Core"}
                    </p>
                  </div>
                </div>
                <button
                  disabled={notificationPermission === "denied"}
                  onClick={async () => {
                    if (notificationPermission === "default") {
                      const granted = await requestNotificationPermission();
                      if (granted) setFormData(prev => ({ ...prev, desktopNotifications: true }));
                    } else if (notificationPermission === "granted") {
                      setFormData(prev => ({ ...prev, desktopNotifications: !prev.desktopNotifications }));
                    }
                  }}
                  className={`w-10 h-5 rounded-full transition-all relative ${
                    formData.desktopNotifications && notificationPermission === "granted" ? 'bg-indigo-500/50' : 'bg-white/5'
                  }`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${
                    formData.desktopNotifications && notificationPermission === "granted" ? 'left-5.5' : 'left-0.5'
                  }`} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;
