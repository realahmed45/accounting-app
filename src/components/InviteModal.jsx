import React, { useState, useEffect } from "react";
import {
  X,
  UserPlus,
  Mail,
  AlertCircle,
  CheckCircle,
  Trash2,
  Copy,
  RefreshCw,
  Eye,
  Crown,
  ShieldAlert,
  ArrowRight,
  Info,
} from "lucide-react";
import { memberService, invitationService } from "../services/api";
import { sendInvitationEmail } from "../services/emailService";

const PERMISSION_OPTIONS = [
  { key: "makeExpense", label: "Log expenses" },
  { key: "calculateCash", label: "Calculate cash flow" },
  { key: "accessSettings", label: "Access settings" },
  { key: "addUser", label: "Manage users" },
  { key: "addCategories", label: "Manage categories" },
  { key: "addBankAccount", label: "Manage bank accounts" },
  { key: "createAccountDownward", label: "Create sub-accounts" },
  { key: "createAccountUpward", label: "Link to parent accounts" },
];

const DEFAULT_PERMISSIONS = {
  makeExpense: true,
  calculateCash: false,
  accessSettings: false,
  addUser: false,
  addCategories: false,
  addBankAccount: false,
  createAccountDownward: false,
  createAccountUpward: false,
};

const InviteModal = ({
  accountId,
  accountName,
  currentUser,
  onClose,
  initialTab = "team",
}) => {
  const [tab, setTab] = useState(initialTab); // "team" | "owner" | "pending"

  // Invite form state
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [viewOnly, setViewOnly] = useState(false);
  const [permissions, setPermissions] = useState({ ...DEFAULT_PERMISSIONS });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [fallbackLink, setFallbackLink] = useState("");
  const [copied, setCopied] = useState(false);

  // Pending invitations state
  const [pending, setPending] = useState([]);
  const [pendingLoading, setPendingLoading] = useState(false);
  const [revoking, setRevoking] = useState(null);

  // Ownership transfer state
  const [ownerUniqueId, setOwnerUniqueId] = useState("");
  const [ownerVerified, setOwnerVerified] = useState(null);
  const [ownerLoading, setOwnerLoading] = useState(false);
  const [ownerError, setOwnerError] = useState("");
  const [ownerSuccess, setOwnerSuccess] = useState("");
  const [transferLoading, setTransferLoading] = useState(false);
  const [ownerWhatsApp, setOwnerWhatsApp] = useState("");
  const [ownerTelegram, setOwnerTelegram] = useState("");

  useEffect(() => {
    if (tab === "pending") loadPending();
  }, [tab]);

  const loadPending = async () => {
    setPendingLoading(true);
    try {
      const result = await invitationService.getAccountInvitations(accountId);
      if (result.success)
        setPending(result.data.filter((i) => i.type !== "ownershipTransfer"));
    } catch {
      /* silent */
    } finally {
      setPendingLoading(false);
    }
  };

  const togglePermission = (key) => {
    if (viewOnly) return;
    setPermissions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleViewOnlyToggle = () => {
    const next = !viewOnly;
    setViewOnly(next);
    if (next) {
      setPermissions(
        Object.fromEntries(
          Object.keys(DEFAULT_PERMISSIONS).map((k) => [k, false]),
        ),
      );
    } else {
      setPermissions({ ...DEFAULT_PERMISSIONS });
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setFallbackLink("");

    if (!email.trim()) {
      setError("Email is required.");
      return;
    }

    setLoading(true);
    const trace = (msg, d) => {
      console.log(`[Invite Trace] ${msg}`, d || "");
      if (!window.DEBUG_INVITE) window.DEBUG_INVITE = [];
      window.DEBUG_INVITE.push({ time: new Date().toISOString(), msg, d });
    };

    trace("handleSend triggered", { email, displayName, viewOnly });

    try {
      trace("Calling memberService.add...");
      const result = await memberService.add(accountId, {
        email: email.trim(),
        displayName: displayName.trim(),
        permissions,
        viewOnly,
      });

      trace("API result received", result);

      if (!result.success) {
        trace("API ERROR", result.message);
        setError(result.message || "Failed to send invitation.");
        setLoading(false);
        return;
      }

      trace("Triggering Email Service...");
      const inviterName =
        result.inviterName ||
        `${currentUser?.firstName || ""} ${currentUser?.familyName || ""}`.trim() ||
        currentUser?.email;

      const emailResult = await sendInvitationEmail({
        toEmail: email.trim(),
        inviterName,
        accountName: result.accountName || accountName,
        inviteLink: result.inviteLink,
        permissions,
      });

      trace("Email Service result", emailResult);

      if (emailResult.sent) {
        setSuccess(`Invitation sent to ${email.trim()}`);
      } else {
        trace("Email skipped/failed", emailResult.error);
        setFallbackLink(result.inviteLink);
        setSuccess(
          `Invitation created. Email could not be sent — share the link below.`,
        );
      }

      setEmail("");
      setDisplayName("");
      setViewOnly(false);
      setPermissions({ ...DEFAULT_PERMISSIONS });

      if (tab === "pending") loadPending();
    } catch (err) {
      console.error("[Invite Modal] CRITICAL CATCH:", err);
      trace("CATCH BLOCK ERROR", {
        msg: err.message,
        stack: err.stack,
        resp: err.response?.data,
      });
      setError(err?.response?.data?.message || "Failed to send invitation.");
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (inv) => {
    setRevoking(inv._id);
    try {
      await invitationService.cancelInvitation(accountId, inv._id);
      setPending((prev) => prev.filter((i) => i._id !== inv._id));
    } catch {
      /* silent */
    } finally {
      setRevoking(null);
    }
  };

  const handleCopy = (link) => {
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  return (
    <div className="glass-modal-backdrop sm:items-center p-0 sm:p-8 z-[110] animate-fadeIn">
      <div className="glass-modal-content max-w-lg animate-zoomIn overflow-hidden flex flex-col h-full sm:h-auto max-h-[95vh]">
        {/* Header */}
        <div className="glass-modal-header border-white/5 py-8">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 shadow-[0_0_30px_rgba(79,70,229,0.1)]">
              <UserPlus className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-widest uppercase italic">
                Neural Invitation
              </h2>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mt-1">
                Member Expansion Protocol
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/5 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex p-2 bg-[#020617]/50 border-y border-white/5">
          {[
            { id: "team", label: "Team Member" },
            { id: "owner", label: "Ownership" },
            { id: "pending", label: "Queue" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 py-3 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl transition-all ${
                tab === t.id
                  ? "bg-white/10 text-white shadow-xl"
                  : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="overflow-y-auto flex-1 glass-modal-body space-y-8 scroll-smooth pb-12">
          {/* ── TEAM MEMBER TAB ───────────────────────────────────────────── */}
          {tab === "team" && (
            <div className="space-y-8 animate-fadeIn">
              {/* Instructions */}
              <div className="p-6 bg-indigo-500/5 border border-indigo-500/10 rounded-[2rem] group hover:border-indigo-500/20 transition-all">
                <div className="flex items-start gap-5">
                  <div className="p-3 bg-indigo-500/20 rounded-xl">
                    <Info className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div className="text-[11px] text-slate-400 font-medium leading-relaxed uppercase tracking-wide">
                    <p className="font-black text-white mb-2 tracking-[0.2em]">Protocol Initiation</p>
                    <p>Assign clearances to architect your collective workspace. Specific permissions ensure data integrity across the neural net.</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSend} className="space-y-10">
                {error && (
                  <div className="p-6 bg-rose-500/5 border border-rose-500/20 text-rose-400 rounded-[2rem] text-[10px] font-black uppercase tracking-widest flex items-center gap-4 animate-pulse">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    {error}
                  </div>
                )}
                {success && (
                  <div className="space-y-6">
                    <div className="p-6 bg-emerald-500/5 border border-emerald-500/20 text-emerald-400 rounded-[2rem] text-[10px] font-black uppercase tracking-widest flex items-center gap-4">
                      <CheckCircle className="w-5 h-5 shrink-0" />
                      {success}
                    </div>
                    {fallbackLink && (
                      <div className="p-6 bg-white/5 border border-white/10 rounded-[2rem] space-y-4 shadow-inner">
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                          Manual Link Extraction:
                        </p>
                        <div className="flex items-center gap-4">
                          <span className="text-[10px] font-mono text-indigo-400 truncate flex-1 tracking-wider p-3 bg-black/40 rounded-xl border border-white/5">
                            {fallbackLink}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopy(fallbackLink)}
                            className="p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 transition-all group"
                          >
                            {copied ? (
                              <CheckCircle className="w-4 h-4 text-emerald-500" />
                            ) : (
                              <Copy className="w-4 h-4 text-slate-400 group-hover:text-white" />
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Email */}
                <div className="input-group-premium">
                  <label className="input-label-premium">Recipient Identifier (Email)</label>
                  <div className="relative group">
                    <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g., node_01@nexus.com"
                      className="input-premium pl-16 py-5"
                      required
                    />
                  </div>
                </div>

                {/* Display name */}
                <div className="input-group-premium">
                  <label className="input-label-premium">
                    System Alias
                    <span className="text-[9px] font-bold text-slate-600 ml-4 tracking-[0.3em]">
                      (OPTIONAL_SPEC)
                    </span>
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g., ARCHITECT_ALPHA"
                    className="input-premium py-5"
                  />
                </div>

                {/* View-Only quick toggle */}
                <div className="space-y-8">
                  <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <h3 className="text-[10px] font-black text-white uppercase tracking-[0.3em] flex items-center gap-3">
                      <ShieldAlert className="w-4 h-4 text-indigo-400" />
                      Clearance Matrices
                    </h3>
                    <button
                      type="button"
                      onClick={handleViewOnlyToggle}
                      className={`flex items-center gap-3 text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-xl border transition-all ${
                        viewOnly
                          ? "bg-indigo-500 border-indigo-500 text-white shadow-[0_0_20px_rgba(79,70,229,0.5)]"
                          : "bg-white/5 border-white/10 text-slate-400 hover:text-white"
                      }`}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Observe Mode
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-10">
                    {/* Groups of permissions with glass styling */}
                    {[
                      { title: "Fiscal Core", keys: ["makeExpense", "calculateCash"] },
                      { title: "Architectural Controls", keys: ["addUser", "addCategories", "addBankAccount", "accessSettings"] },
                      { title: "Network Topology", keys: ["createAccountDownward", "createAccountUpward"] }
                    ].map((group, groupIdx) => (
                      <div key={groupIdx} className="space-y-6">
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] ml-2">
                          {group.title}
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {group.keys.map((key) => {
                            const option = PERMISSION_OPTIONS.find(o => o.key === key);
                            return (
                              <button
                                key={key}
                                type="button"
                                disabled={viewOnly}
                                onClick={() => togglePermission(key)}
                                className={`flex items-center justify-between p-5 rounded-[1.5rem] border transition-all text-left group ${
                                  viewOnly ? "opacity-30 cursor-not-allowed" :
                                  permissions[key] ? "bg-indigo-500/10 border-indigo-500/30 ring-1 ring-indigo-500/20" : "bg-white/2 border-white/5 hover:border-white/10 hover:bg-white/5"
                                }`}
                              >
                                <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${
                                  permissions[key] && !viewOnly ? "text-white" : "text-slate-500 group-hover:text-slate-300"
                                }`}>
                                  {option?.label}
                                </span>
                                <div className={`w-8 h-4 rounded-full transition-all relative ${
                                  permissions[key] && !viewOnly ? "bg-indigo-500" : "bg-white/10"
                                }`}>
                                  <div className={`absolute top-1 w-2 h-2 rounded-full bg-white transition-all ${
                                    permissions[key] && !viewOnly ? "left-5 shadow-[0_0_10px_white]" : "left-1"
                                  }`} />
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-6 btn-primary rounded-[2rem] font-black text-[12px] tracking-[0.4em] uppercase flex items-center justify-center gap-4 hover:scale-[1.02] active:scale-[0.98] shadow-2xl disabled:opacity-50 transition-all mb-4"
                >
                  {loading ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <UserPlus className="w-5 h-5" />
                  )}
                  {loading ? "Transmitting..." : "Initialize Protocol"}
                </button>
              </form>
            </div>
          )}

          {/* ── TRANSFER OWNERSHIP TAB ───────────────────────────────────────────── */}
          {tab === "owner" && (
            <div className="space-y-8 animate-fadeIn">
              <div className="p-8 bg-rose-500/5 border border-rose-500/20 rounded-[2.5rem] relative overflow-hidden group">
                <div className="absolute -right-8 -top-8 w-32 h-32 bg-rose-500/10 blur-3xl rounded-full"></div>
                <div className="flex items-start gap-6 relative z-10">
                  <div className="p-4 bg-rose-500/20 rounded-2xl shadow-[0_0_20px_rgba(244,63,94,0.2)]">
                    <ShieldAlert className="w-6 h-6 text-rose-500" />
                  </div>
                  <div className="text-[11px] text-slate-400 font-medium leading-relaxed uppercase tracking-wide">
                    <p className="font-black text-rose-500 mb-3 tracking-[0.3em] italic">Critical: Authority Handover</p>
                    <p className="mb-4">You are about to delegate <span className="text-white font-black italic">Absolute Control</span>. This operation is non-reversible through the current nexus.</p>
                    <ul className="space-y-2 text-[9px] font-black text-rose-400/80">
                      <li className="flex items-center gap-2 italic">
                        <ArrowRight className="w-3 h-3" />
                        Complete Node Transfer
                      </li>
                      <li className="flex items-center gap-2 italic">
                        <ArrowRight className="w-3 h-3" />
                        Member Status Relegation
                      </li>
                      <li className="flex items-center gap-2 italic">
                        <ArrowRight className="w-3 h-3" />
                        Loss of Root Clearances
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {ownerError && (
                <div className="p-6 bg-rose-500/5 border border-rose-500/20 text-rose-400 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-4">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  {ownerError}
                </div>
              )}

              {ownerSuccess && (
                <div className="p-6 bg-emerald-500/5 border border-emerald-500/20 text-emerald-400 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-4">
                  <CheckCircle className="w-5 h-5 shrink-0" />
                  {ownerSuccess}
                </div>
              )}

              {!ownerVerified ? (
                <div className="space-y-8">
                  <div className="glass-card p-8 border-white/5 space-y-8 bg-[#020617]/40 ring-1 ring-white/5">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-amber-500/20 rounded-xl border border-amber-500/20">
                        <Crown className="w-5 h-5 text-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                      </div>
                      <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] italic">
                        Phase I: Target Verification
                      </h3>
                    </div>

                    <div className="p-6 bg-white/5 border border-white/10 rounded-[1.5rem] space-y-4">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-loose">
                        Scan the recipient's <span className="text-indigo-400">Neural Signature (ACC-ID)</span> located in their primary infrastructure settings.
                      </p>
                    </div>

                    <div className="input-group-premium">
                      <label className="input-label-premium">Recipient ACC-ID</label>
                      <input
                        type="text"
                        value={ownerUniqueId}
                        onChange={(e) => {
                          const val = e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, "").slice(0, 10);
                          setOwnerUniqueId(val);
                          setOwnerError("");
                        }}
                        placeholder="ACC-XXXXXX"
                        maxLength={10}
                        className="input-premium font-mono tracking-[0.3em] py-5 text-center text-lg placeholder:tracking-normal placeholder:opacity-30"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={async () => {
                        setOwnerError("");
                        if (ownerUniqueId.length !== 10) {
                          setOwnerError("Signature must be 10 characters");
                          return;
                        }
                        if (!/^ACC-[A-Z0-9]{6}$/.test(ownerUniqueId)) {
                          setOwnerError("Format rejection: ACC-XXXXXX required");
                          return;
                        }

                        setOwnerLoading(true);
                        try {
                          const { accountService } = await import("../services/api");
                          const result = await accountService.findByUniqueId(ownerUniqueId);
                          setOwnerVerified(result.data || result);
                          setOwnerError("");
                        } catch (err) {
                          setOwnerError(err?.response?.data?.message || "Signature not found in neural net.");
                          setOwnerVerified(null);
                        } finally {
                          setOwnerLoading(false);
                        }
                      }}
                      disabled={ownerLoading || ownerUniqueId.length !== 10}
                      className="w-full py-5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.4em] flex items-center justify-center gap-4 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-30"
                    >
                      {ownerLoading ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                      )}
                      {ownerLoading ? "Verifying..." : "Scan Signature"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-10 animate-fadeIn">
                  <div className="glass-card p-8 border-emerald-500/20 bg-emerald-500/5 space-y-8">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-emerald-500/20 rounded-xl border border-emerald-500/20">
                        <CheckCircle className="w-5 h-5 text-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                      </div>
                      <h3 className="text-xs font-black text-emerald-400 uppercase tracking-[0.2em] italic">
                        Phase II: Signature Confirmed
                      </h3>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { label: "Target Designation", value: ownerVerified.accountName },
                        { label: "Architecture", value: ownerVerified.accountType, capitalize: true },
                        { label: "Unique Sync ID", value: ownerVerified.uniqueId, mono: true }
                      ].map((item, idx) => (
                        <div key={idx} className="p-5 bg-black/30 rounded-2xl border border-white/5 group hover:border-emerald-500/30 transition-all">
                          <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-2">{item.label}</p>
                          <p className={`text-[10px] font-black text-white tracking-widest ${item.capitalize ? 'capitalize' : ''} ${item.mono ? 'font-mono' : ''}`}>
                            {item.value}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="relative py-12 flex items-center justify-center gap-8">
                    <div className="absolute inset-0 flex items-center px-12">
                      <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                    </div>
                    <div className="relative p-4 bg-[#020617] rounded-2xl border border-white/10 shadow-2xl">
                      <ArrowRight className="w-6 h-6 text-indigo-400 animate-slideRight" />
                    </div>
                  </div>

                  <div className="space-y-8 bg-black/40 p-8 rounded-[2.5rem] border border-white/5 shadow-inner">
                    <div className="space-y-3">
                      <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] flex items-center gap-3">
                        <RefreshCw className="w-4 h-4" />
                        Verification Uplink
                      </h3>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-loose">
                        Secure the handover through encrypted external channels.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="input-group-premium">
                        <label className="input-label-premium text-[10px]">Matrix Handle (WhatsApp)</label>
                        <input
                          type="text"
                          value={ownerWhatsApp}
                          onChange={(e) => setOwnerWhatsApp(e.target.value)}
                          placeholder="+X_CHANNEL..."
                          className="input-premium py-4"
                        />
                      </div>
                      <div className="input-group-premium">
                        <label className="input-label-premium text-[10px]">Neural Handle (Telegram)</label>
                        <input
                          type="text"
                          value={ownerTelegram}
                          onChange={(e) => setOwnerTelegram(e.target.value)}
                          placeholder="@ID_PROTO..."
                          className="input-premium py-4"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={transferLoading || !ownerWhatsApp || !ownerTelegram}
                    onClick={async () => {
                      if (!confirm("Are you ABSOLUTELY sure you want to transfer ownership? This cannot be undone.")) return;
                      setTransferLoading(true);
                      setOwnerError("");
                      try {
                        const { accountService } = await import("../services/api");
                        const result = await accountService.transferOwnership(
                          accountId,
                          ownerUniqueId,
                          ownerWhatsApp.trim(),
                          ownerTelegram.trim()
                        );
                        setOwnerSuccess("Ownership transfer initiated successfully! The new owner will receive an invitation to accept.");
                        setTimeout(() => { onClose(); }, 3000);
                      } catch (err) {
                        setOwnerError(err?.response?.data?.message || "Failed to transfer ownership.");
                      } finally {
                        setTransferLoading(false);
                      }
                    }}
                    className="w-full py-6 bg-rose-500 hover:bg-rose-600 text-white rounded-[2rem] font-black text-[12px] tracking-[0.4em] uppercase shadow-[0_20px_50px_rgba(244,63,94,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-20 flex items-center justify-center gap-4 mb-2"
                  >
                    {transferLoading ? (
                      <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : (
                      <ShieldAlert className="w-5 h-5" />
                    )}
                    {transferLoading ? "Delegating..." : "Finalize Handover"}
                  </button>
                  <button
                    onClick={() => { setOwnerVerified(null); setOwnerUniqueId(""); }}
                    className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/5 text-slate-500 hover:text-white rounded-2xl text-[9px] font-black uppercase tracking-[0.3em] transition-all"
                  >
                    Abort Handover
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── PENDING TAB ───────────────────────────────────────────── */}
          {tab === "pending" && (
            <div className="space-y-8 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <h3 className="text-[10px] font-black text-white uppercase tracking-[0.3em] flex items-center gap-3">
                  <RefreshCw className="w-4 h-4 text-emerald-400" />
                  Invitation Queue
                </h3>
                <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[9px] font-black text-slate-500 uppercase tracking-widest">
                  {pending.length} Active Packets
                </span>
              </div>

              {pendingLoading ? (
                <div className="flex flex-col items-center justify-center py-24 space-y-6">
                  <div className="relative w-12 h-12">
                    <div className="absolute inset-0 border-2 border-indigo-500/20 rounded-xl animate-spin-slow"></div>
                    <div className="absolute inset-0 border-2 border-t-indigo-500 border-transparent rounded-xl animate-spin"></div>
                  </div>
                  <p className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.3em] animate-pulse">Scanning Neural Queue...</p>
                </div>
              ) : pending.length === 0 ? (
                <div className="py-24 flex flex-col items-center justify-center text-center space-y-8 bg-white/2 rounded-[2.5rem] border border-dashed border-white/10">
                  <div className="p-8 bg-white/5 rounded-[2rem]">
                    <Mail className="w-12 h-12 text-slate-700" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-xl font-black text-white uppercase tracking-widest">Queue Nullified</p>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">No outbound protocols detected.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {pending.map((inv) => (
                    <div key={inv._id} className="glass-card p-6 border-white/5 bg-white/2 hover:border-white/20 transition-all group overflow-hidden relative">
                      <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-1 h-8 bg-indigo-500 rounded-full group-hover:h-12 transition-all"></div>
                      <div className="flex items-center justify-between relative z-10">
                        <div className="space-y-2 min-w-0 flex-1">
                          <p className="text-sm font-black text-white truncate tracking-wider uppercase">
                            {inv.email}
                          </p>
                          <div className="flex items-center gap-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                            <span className="flex items-center gap-1.5">
                              <Calendar className="w-3 h-3 text-indigo-400" />
                              Synced: {formatDate(inv.createdAt)}
                            </span>
                            <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 rounded-md border border-indigo-500/10">
                              Tier: {inv.viewOnly ? "Observer" : "Architect"}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleCopy(inv.inviteLink)}
                            className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/5 group/copy"
                            title="Extract Link"
                          >
                            <Copy className="w-4 h-4 text-slate-400 group-hover/copy:text-white" />
                          </button>
                          <button
                            onClick={() => handleRevoke(inv)}
                            disabled={revoking === inv._id}
                            className="p-3 bg-rose-500/5 hover:bg-rose-500/20 rounded-xl transition-all border border-rose-500/20 text-rose-500 group/revoke"
                            title="Purge Protocol"
                          >
                            {revoking === inv._id ? (
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4 group-hover/revoke:scale-110 transition-transform" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InviteModal;
