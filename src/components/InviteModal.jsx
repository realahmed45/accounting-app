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

const InviteModal = ({ accountId, accountName, currentUser, onClose }) => {
  const [tab, setTab] = useState("invite"); // "invite" | "pending"

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
        resp: err.response?.data
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b flex-shrink-0">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-semibold text-gray-900">
              Invite Member
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b flex-shrink-0">
          {["invite", "pending"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                tab === t
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {t === "invite" ? "Send Invite" : "Pending"}
            </button>
          ))}
        </div>

        <div className="overflow-y-auto flex-1 p-5">
          {/* ── INVITE TAB ───────────────────────────────────────────── */}
          {tab === "invite" && (
            <form onSubmit={handleSend} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}
              {success && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-lg px-3 py-2 text-sm">
                    <CheckCircle className="w-4 h-4 flex-shrink-0" />
                    {success}
                  </div>
                  {fallbackLink && (
                    <div className="bg-gray-50 border rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-1">
                        Share this link manually:
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-blue-600 break-all flex-1">
                          {fallbackLink}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(fallbackLink)}
                          className="flex-shrink-0 p-1 border rounded hover:bg-white"
                        >
                          {copied ? (
                            <CheckCircle className="w-3 h-3 text-green-500" />
                          ) : (
                            <Copy className="w-3 h-3 text-gray-500" />
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="member@example.com"
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Display name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Display name
                  <span className="text-xs font-normal text-gray-400 ml-2">
                    (optional)
                  </span>
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="How they'll appear in the account"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* View-Only quick toggle */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Permissions
                  </span>
                  <button
                    type="button"
                    onClick={handleViewOnlyToggle}
                    className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border transition-colors ${
                      viewOnly
                        ? "bg-gray-100 border-gray-400 text-gray-700 font-medium"
                        : "border-gray-300 text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    <Eye className="w-3 h-3" />
                    View Only
                  </button>
                </div>

                <div className="space-y-1.5">
                  {PERMISSION_OPTIONS.map(({ key, label }) => (
                    <label
                      key={key}
                      className={`flex items-center gap-2.5 cursor-pointer ${
                        viewOnly ? "opacity-40 cursor-not-allowed" : ""
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={permissions[key] || false}
                        onChange={() => togglePermission(key)}
                        disabled={viewOnly}
                        className="w-4 h-4 rounded text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                {loading ? "Sending…" : "Send Invite"}
              </button>
            </form>
          )}

          {/* ── PENDING TAB ─────────────────────────────────────────────── */}
          {tab === "pending" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  {pending.length} pending{" "}
                  {pending.length === 1 ? "invitation" : "invitations"}
                </p>
                <button
                  onClick={loadPending}
                  disabled={pendingLoading}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <RefreshCw
                    className={`w-4 h-4 ${pendingLoading ? "animate-spin" : ""}`}
                  />
                </button>
              </div>

              {pendingLoading && (
                <div className="text-center py-8 text-gray-400 text-sm">
                  Loading…
                </div>
              )}

              {!pendingLoading && pending.length === 0 && (
                <div className="text-center py-8 text-gray-400 text-sm">
                  No pending invitations.
                </div>
              )}

              {!pendingLoading &&
                pending.map((inv) => (
                  <div
                    key={inv._id}
                    className="flex items-start justify-between gap-3 p-3 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {inv.email}
                      </p>
                      {inv.displayName && (
                        <p className="text-xs text-gray-500">
                          {inv.displayName}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-0.5">
                        Expires {formatDate(inv.expiresAt)}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRevoke(inv)}
                      disabled={revoking === inv._id}
                      className="flex-shrink-0 p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded disabled:opacity-50"
                      title="Revoke invitation"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InviteModal;
