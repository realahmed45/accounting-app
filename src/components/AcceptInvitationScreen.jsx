import React, { useState, useEffect } from "react";
import {
  CheckCircle,
  AlertCircle,
  Crown,
  Shield,
  User,
  Lock,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { invitationService } from "../services/api";

const PERMISSION_LABELS = {
  makeExpense: "Log expenses",
  calculateCash: "Calculate cash flow",
  accessSettings: "Access settings",
  addUser: "Manage users",
  addCategories: "Manage categories",
  addBankAccount: "Manage bank accounts",
  createAccountDownward: "Create sub-accounts",
  createAccountUpward: "Link to parent accounts",
};

const AcceptInvitationScreen = ({ token, onAccepted }) => {
  const [invitation, setInvitation] = useState(null);
  const [fetchError, setFetchError] = useState("");
  const [fetchLoading, setFetchLoading] = useState(true);

  // Form
  const [firstName, setFirstName] = useState("");
  const [familyName, setFamilyName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const result = await invitationService.getDetails(token);
        if (result.success) {
          setInvitation(result.data);
        } else {
          setFetchError(result.message || "Invitation not found.");
        }
      } catch (err) {
        setFetchError(
          err?.response?.data?.message ||
            "This invitation is not valid or has already been used.",
        );
      } finally {
        setFetchLoading(false);
      }
    })();
  }, [token]);

  const handleAccept = async (e) => {
    e.preventDefault();
    setSubmitError("");

    if (password.length < 6) {
      setSubmitError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setSubmitError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      const result = await invitationService.accept(token, {
        firstName,
        familyName,
        password,
      });

      if (result.success) {
        // Store creds & trigger auth
        localStorage.setItem("token", result.data.token);
        localStorage.setItem("user", JSON.stringify(result.data.user));

        // Clean up URL
        const url = new URL(window.location.href);
        url.searchParams.delete("invite");
        url.searchParams.delete("token");
        window.history.replaceState({}, "", url.toString());

        if (onAccepted) onAccepted(result.data);
        else window.location.reload();
      } else {
        setSubmitError(result.message || "Failed to accept invitation.");
      }
    } catch (err) {
      setSubmitError(
        err?.response?.data?.message || "Failed to accept invitation.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const isOwnershipTransfer =
    invitation?.invitationType === "ownershipTransfer";

  const grantedPermissions = invitation?.permissions
    ? Object.entries(invitation.permissions)
        .filter(([, v]) => v)
        .map(([k]) => PERMISSION_LABELS[k] || k)
    : [];

  // ── Loading ──────────────────────────────────────────────────────────
  if (fetchLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#020617] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(79,70,229,0.1),transparent_50%)]"></div>
        <div className="relative">
          <div className="w-24 h-24 border-2 border-indigo-500/20 rounded-3xl animate-spin-slow"></div>
          <div className="absolute inset-0 w-24 h-24 border-2 border-t-indigo-500 border-transparent rounded-3xl animate-spin"></div>
          <Loader2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-indigo-400 animate-pulse" />
        </div>
        <p className="mt-8 text-[10px] font-black text-indigo-400 uppercase tracking-[0.5em] animate-pulse">Synchronizing Neural Net...</p>
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────
  if (fetchError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020617] p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(244,63,94,0.05),transparent_50%)]"></div>
        <div className="glass-modal-content max-w-sm w-full p-12 text-center space-y-8 animate-zoomIn">
          <div className="w-20 h-20 bg-rose-500/10 rounded-3xl flex items-center justify-center mx-auto border border-rose-500/20 shadow-[0_0_30px_rgba(244,63,94,0.1)]">
            <AlertCircle className="w-10 h-10 text-rose-500" />
          </div>
          <div className="space-y-3">
            <h1 className="text-xl font-black text-white uppercase tracking-widest italic">
              Protocol Error
            </h1>
            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wide leading-loose">
              {fetchError}
            </p>
          </div>
          <button
            onClick={() => window.location.replace("/")}
            className="w-full py-5 btn-primary rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:scale-105 transition-all"
          >
            Return to Nexus
          </button>
        </div>
      </div>
    );
  }

  // ── Valid invitation ─────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full"></div>
      </div>

      <div className="glass-modal-content max-w-lg w-full overflow-hidden animate-fadeIn relative z-10 border-white/5 shadow-[0_0_100px_rgba(0,0,0,0.5)]">
        {/* Banner */}
        <div
          className={`relative p-10 overflow-hidden ${
            isOwnershipTransfer
              ? "bg-gradient-to-br from-amber-500/20 to-orange-600/20 border-b border-amber-500/20"
              : "bg-gradient-to-br from-indigo-500/20 to-purple-600/20 border-b border-indigo-500/20"
          }`}
        >
          <div className="absolute inset-0 bg-[#020617]/40"></div>
          
          <div className="relative z-10 flex items-center gap-6 mb-6">
            <div className={`p-5 rounded-2xl border ${
              isOwnershipTransfer 
                ? "bg-amber-500/20 border-amber-500/30 shadow-[0_0_30px_rgba(245,158,11,0.2)]" 
                : "bg-indigo-500/20 border-indigo-500/30 shadow-[0_0_30px_rgba(79,70,229,0.2)]"
            }`}>
              {isOwnershipTransfer ? (
                <Crown className="w-8 h-8 text-amber-500" />
              ) : (
                <Shield className="w-8 h-8 text-indigo-400" />
              )}
            </div>
            <div>
              <p className={`text-[10px] font-black uppercase tracking-[0.4em] mb-2 ${
                isOwnershipTransfer ? "text-amber-500" : "text-indigo-400"
              }`}>
                {isOwnershipTransfer ? "Authority Transition" : "Expansion Protocol"}
              </p>
              <h1 className="text-2xl font-black text-white italic tracking-widest uppercase">
                {invitation.accountName}
              </h1>
            </div>
          </div>
          
          <div className="relative z-10 p-6 bg-black/40 rounded-2xl border border-white/5 backdrop-blur-sm">
            <p className="text-[11px] font-medium text-slate-400 leading-relaxed tracking-wide uppercase">
              <span className="text-white font-black italic mr-2 tracking-widest">
                {invitation.inviterName}
              </span>
              {isOwnershipTransfer
                ? "has designated you as the new primary sovereign of this node."
                : `has granted you clearance to access this neural workspace.`}
            </p>
          </div>
        </div>

        {/* Permissions summary */}
        {!isOwnershipTransfer && (
          <div className="px-10 py-6 bg-white/2 border-b border-white/5">
            {invitation.viewOnly ? (
              <div className="flex items-center gap-4">
                <div className="p-2 bg-slate-500/10 rounded-lg">
                  <User className="w-4 h-4 text-slate-400" />
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Level: <span className="text-white italic">Observer Status</span> (Read Only)
                </p>
              </div>
            ) : grantedPermissions.length > 0 ? (
              <div className="space-y-4">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em]">
                  Clearance Matrix:
                </p>
                <div className="flex flex-wrap gap-2">
                  {grantedPermissions.map((p, idx) => (
                    <span key={idx} className="px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[9px] font-black uppercase tracking-widest rounded-lg">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleAccept} className="p-10 space-y-8 glass-modal-body">
          <div className="space-y-2">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
              Identity Synchronization
            </p>
            <p className="text-xs font-medium text-white tracking-wider">
              {invitation.email}
            </p>
          </div>

          {submitError && (
            <div className="p-6 bg-rose-500/5 border border-rose-500/20 text-rose-400 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-4 animate-pulse">
              <AlertCircle className="w-5 h-5 shrink-0" />
              {submitError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="input-group-premium">
              <label className="input-label-premium">First Designation</label>
              <div className="relative group">
                <User className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="e.g., JOHN"
                  required
                  className="input-premium pl-14 py-4 uppercase"
                />
              </div>
            </div>
            <div className="input-group-premium">
              <label className="input-label-premium">Secondary Alias</label>
              <input
                type="text"
                value={familyName}
                onChange={(e) => setFamilyName(e.target.value)}
                placeholder="e.g., SMITH"
                required
                className="input-premium py-4 uppercase"
              />
            </div>
          </div>

          <div className="space-y-6">
            <div className="input-group-premium">
              <label className="input-label-premium">Neural Access Key (Password)</label>
              <div className="relative group">
                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="input-premium pl-14 py-4"
                />
              </div>
            </div>

            <div className="input-group-premium">
              <label className="input-label-premium">Verify Access Key</label>
              <div className="relative group">
                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="input-premium pl-14 py-4"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className={`w-full py-6 text-white rounded-[2rem] font-black text-[12px] tracking-[0.4em] uppercase shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-4 ${
              isOwnershipTransfer
                ? "bg-gradient-to-r from-amber-500 to-orange-600 shadow-amber-500/20"
                : "bg-gradient-to-r from-indigo-500 to-purple-600 shadow-indigo-500/20"
            }`}
          >
            {submitting ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <CheckCircle className="w-5 h-5" />
            )}
            {submitting
              ? "INITIATING..."
              : isOwnershipTransfer
                ? "Accept Authority"
                : "Initialize Sync"}
          </button>

          <div className="flex items-center justify-center gap-4 pt-4">
            <div className="h-px flex-1 bg-white/5"></div>
            <p className="text-[9px] text-slate-600 font-black uppercase tracking-[0.3em]">
              Packet Expiry: {new Date(invitation.expiresAt).toLocaleDateString()}
            </p>
            <div className="h-px flex-1 bg-white/5"></div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AcceptInvitationScreen;
