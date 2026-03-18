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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[100]">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
              <Lock className="w-4 h-4 text-amber-600" />
            </div>
            <h2 className="text-base font-semibold text-gray-900">
              View-Only Mode
            </h2>
          </div>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          You are in view-only mode. Enter your password to proceed with this
          action.
        </p>

        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2 text-sm mb-4">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            autoFocus
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !password}
              className="flex-1 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Verifying…" : "Confirm"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PasswordGate;
