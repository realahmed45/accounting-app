import React, { useState } from "react";
import { Lock, X, AlertCircle } from "lucide-react";
import { authService } from "../services/api";

/**
 * PasswordGate — shown before any write action when the member is view-only.
 *
 * Usage:
 *   const [gateOpen, setGateOpen] = useState(false);
 *   const [pendingAction, setPendingAction] = useState(null);
 *
 *   const runIfAllowed = (fn) => {
 *     if (currentMember?.viewOnly) { setPendingAction(() => fn); setGateOpen(true); }
 *     else fn();
 *   };
 */
const PasswordGate = ({ isOpen, onSuccess, onCancel }) => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await authService.verifyPassword(password);
      if (result.success) {
        setPassword("");
        onSuccess();
      } else {
        setError("Incorrect password.");
      }
    } catch {
      setError("Incorrect password.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setPassword("");
    setError("");
    onCancel();
  };

  return (
    <div className="glass-modal-backdrop z-[100] animate-fadeIn">
      <div className="glass-modal-content max-w-sm animate-zoomIn">
        <div className="glass-modal-header border-amber-500/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/20 rounded-xl">
              <Lock className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-widest uppercase">
                Secure Mode
              </h2>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mt-0.5">
                Restricted Protocol Access
              </p>
            </div>
          </div>
          <button
            onClick={handleCancel}
            className="p-2 hover:bg-white/5 rounded-xl transition-colors text-slate-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="glass-modal-body space-y-6">
          <p className="text-slate-300 font-medium text-sm leading-relaxed">
            Authorized signal required. This workspace is currently in <span className="text-amber-400 font-bold">VIEW-ONLY</span> state. Provide credentials for override.
          </p>

          {error && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl flex items-center gap-3 animate-shake">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span className="text-xs font-bold uppercase tracking-wider">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="input-group-premium">
              <label className="input-label-premium">
                Neural Key (Password)
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoFocus
                required
                className="input-premium"
              />
            </div>
            
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading || !password}
                className="flex-[2] btn-primary py-4 text-xs font-black tracking-widest uppercase hover:scale-[1.02] active:scale-[0.98] shadow-[0_10px_30px_rgba(79,70,229,0.3)]"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    SYNCING...
                  </span>
                ) : (
                  "AUTHORIZE"
                )}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 btn-secondary py-4 text-xs font-black tracking-widest uppercase"
              >
                EXIT
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PasswordGate;
