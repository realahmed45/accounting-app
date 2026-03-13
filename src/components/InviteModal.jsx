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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 z-50">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-xl w-full max-w-md max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b flex-shrink-0">
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
          {[
            { id: "team", label: "Team Member" },
            { id: "owner", label: "Transfer Ownership" },
            { id: "pending", label: "Pending" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 py-3 text-[11px] font-semibold border-b-2 transition-colors ${
                tab === t.id
                  ? "border-emerald-600 text-emerald-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="overflow-y-auto flex-1 p-4 sm:p-5">
          {/* ── TEAM MEMBER TAB ───────────────────────────────────────────── */}
          {tab === "team" && (
            <div className="space-y-4">
              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-blue-800 space-y-1">
                    <p className="font-medium">Adding a Team Member</p>
                    <p>
                      Team members can be given specific permissions to help
                      manage this account. They will receive an email invitation
                      to join.
                    </p>
                    <ul className="list-disc list-inside space-y-0.5 ml-2 mt-2">
                      <li>Choose individual permissions, or use "View Only"</li>
                      <li>
                        View-only members can see data but cannot make changes
                      </li>
                      <li>You can revoke access at any time in Settings</li>
                    </ul>
                  </div>
                </div>
              </div>

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
                      className="w-full pl-10 pr-3 py-3.5 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="w-full px-4 py-3.5 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
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

                  <div className="space-y-6">
                    {/* Expenses & Cash */}
                    <div>
                      <p className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3">
                        Expenses &amp; Cash
                      </p>
                      <div className="space-y-2">
                        {[
                          { key: "makeExpense", label: "Log expenses" },
                          {
                            key: "calculateCash",
                            label: "Calculate cash flow",
                          },
                        ].map(({ key, label }) => (
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
                              className="w-4 h-4 rounded text-emerald-600 border-gray-300 focus:ring-emerald-500"
                            />
                            <span className="text-sm text-gray-700">
                              {label}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Access Settings */}
                    <div>
                      <p className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3">
                        Access Settings
                      </p>
                      <div className="space-y-2">
                        {[
                          { key: "addUser", label: "Manage users" },
                          { key: "addCategories", label: "Manage categories" },
                          {
                            key: "addBankAccount",
                            label: "Manage bank accounts",
                          },
                          { key: "accessSettings", label: "Access settings" },
                        ].map(({ key, label }) => (
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
                              className="w-4 h-4 rounded text-emerald-600 border-gray-300 focus:ring-emerald-500"
                            />
                            <span className="text-sm text-gray-700">
                              {label}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Account Structure */}
                    <div>
                      <p className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3">
                        Account Structure
                      </p>
                      <div className="space-y-2">
                        {[
                          {
                            key: "createAccountDownward",
                            label: "Create sub-accounts",
                          },
                          {
                            key: "createAccountUpward",
                            label: "Link to parent accounts",
                          },
                        ].map(({ key, label }) => (
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
                              className="w-4 h-4 rounded text-emerald-600 border-gray-300 focus:ring-emerald-500"
                            />
                            <span className="text-sm text-gray-700">
                              {label}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-4 py-3.5 bg-emerald-600 text-white rounded-xl text-sm hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  {loading ? "Sending…" : "Send Invite"}
                </button>
              </form>
            </div>
          )}

          {/* ── TRANSFER OWNERSHIP TAB ───────────────────────────────────────────── */}
          {tab === "owner" && (
            <div className="space-y-4">
              {/* Comprehensive Instructions */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-900 space-y-2">
                    <p className="font-semibold text-sm">
                      ⚠️ Transfer Ownership
                    </p>
                    <p>
                      <strong>This action transfers complete control</strong> of
                      this account to another user. Before proceeding,
                      understand what will happen:
                    </p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>
                        The new owner will have <strong>full control</strong>{" "}
                        over all account data, settings, and members
                      </li>
                      <li>
                        You will become a <strong>regular member</strong> with
                        limited permissions
                      </li>
                      <li>
                        The new owner can remove you or change your permissions
                      </li>
                      <li>
                        Only transfer ownership to someone you absolutely trust
                      </li>
                      <li>
                        <strong>This action cannot be undone</strong> unless the
                        new owner transfers it back
                      </li>
                    </ul>
                    <p className="font-medium mt-2">
                      💡 If you just want to add someone to help manage the
                      account, use the "Team Member" tab instead.
                    </p>
                  </div>
                </div>
              </div>

              {ownerError && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {ownerError}
                </div>
              )}

              {ownerSuccess && (
                <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-lg px-3 py-2 text-sm">
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  {ownerSuccess}
                </div>
              )}

              {!ownerVerified ? (
                <div className="space-y-4">
                  {/* Step 1: Enter Unique ID */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <Crown className="w-5 h-5 text-amber-600" />
                      <h3 className="text-sm font-semibold text-gray-900">
                        Step 1: Enter New Owner's Unique ID
                      </h3>
                    </div>

                    <p className="text-xs text-gray-600">
                      You need the <strong>Account Unique ID</strong> of the
                      person who will become the new owner. This ID is in the
                      format{" "}
                      <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">
                        ACC-XXXXXX
                      </code>
                      .
                    </p>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800 space-y-1">
                      <p className="font-medium">Where to find a Unique ID:</p>
                      <ul className="list-disc list-inside ml-2 space-y-0.5">
                        <li>
                          Ask the person to go to their{" "}
                          <strong>Settings</strong> screen
                        </li>
                        <li>
                          The Unique ID is displayed at the top of the Settings
                          page
                        </li>
                        <li>They can copy it and share it with you</li>
                      </ul>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        New Owner's Unique ID{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={ownerUniqueId}
                        onChange={(e) => {
                          const val = e.target.value
                            .toUpperCase()
                            .replace(/[^A-Z0-9-]/g, "")
                            .slice(0, 10);
                          setOwnerUniqueId(val);
                          setOwnerError("");
                        }}
                        placeholder="ACC-XXXXXX"
                        maxLength={10}
                        className="w-full px-4 py-3.5 border border-gray-300 rounded-xl text-base font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Must be exactly 10 characters (e.g., ACC-A1B2C3)
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={async () => {
                        setOwnerError("");
                        if (ownerUniqueId.length !== 10) {
                          setOwnerError(
                            "Unique ID must be exactly 10 characters",
                          );
                          return;
                        }
                        if (!/^ACC-[A-Z0-9]{6}$/.test(ownerUniqueId)) {
                          setOwnerError("Invalid format. Must be ACC-XXXXXX");
                          return;
                        }

                        setOwnerLoading(true);
                        try {
                          const { accountService } =
                            await import("../services/api");
                          const result =
                            await accountService.findByUniqueId(ownerUniqueId);
                          setOwnerVerified(result.data || result);
                          setOwnerError("");
                        } catch (err) {
                          setOwnerError(
                            err?.response?.data?.message ||
                              "Account not found or invalid ID.",
                          );
                          setOwnerVerified(null);
                        } finally {
                          setOwnerLoading(false);
                        }
                      }}
                      disabled={ownerLoading || ownerUniqueId.length !== 10}
                      className="w-full px-4 py-3.5 bg-emerald-600 text-white rounded-xl text-sm hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {ownerLoading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          Verify Account
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Step 2: Verify & Confirm */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <h3 className="text-sm font-semibold text-green-900">
                        Account Verified
                      </h3>
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs font-medium text-green-900">
                        Account Name:
                      </p>
                      <p className="text-sm text-green-800">
                        {ownerVerified.accountName}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs font-medium text-green-900">
                        Account Type:
                      </p>
                      <p className="text-sm text-green-800 capitalize">
                        {ownerVerified.accountType}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs font-medium text-green-900">
                        Unique ID:
                      </p>
                      <p className="text-sm text-green-800 font-mono">
                        {ownerVerified.uniqueId}
                      </p>
                    </div>
                  </div>

                  {/* Visual diagram */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <p className="text-xs font-medium text-gray-700 mb-2">
                      What will happen:
                    </p>
                    <div className="flex items-center justify-center gap-3 text-sm">
                      <div className="text-center">
                        <div className="bg-amber-100 border border-amber-300 rounded-lg px-3 py-2">
                          <p className="font-medium text-amber-900">
                            You (Current Owner)
                          </p>
                          <p className="text-xs text-amber-700">
                            {accountName}
                          </p>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Becomes member
                        </p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-400" />
                      <div className="text-center">
                        <div className="bg-emerald-100 border border-emerald-300 rounded-lg px-3 py-2">
                          <p className="font-medium text-emerald-900">
                            New Owner
                          </p>
                          <p className="text-xs text-emerald-700">
                            {ownerVerified.accountName}
                          </p>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Full control
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Final warning */}
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                      <div className="text-xs text-red-800 space-y-1">
                        <p className="font-semibold">Before you proceed:</p>
                        <ul className="list-disc list-inside ml-2 space-y-0.5">
                          <li>Make sure you trust this person completely</li>
                          <li>
                            They will have full control and can remove you
                          </li>
                          <li>This action cannot be undone by you</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Verification fields */}
                  <div className="space-y-3 bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <p className="text-xs font-medium text-gray-700">
                      Verification Required{" "}
                      <span className="text-red-500">*</span>
                    </p>
                    <p className="text-xs text-gray-600">
                      For security, please provide the new owner's WhatsApp and
                      Telegram handles. These will be used to verify the
                      transfer.
                    </p>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        WhatsApp Handle <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={ownerWhatsApp}
                        onChange={(e) => setOwnerWhatsApp(e.target.value)}
                        placeholder="+1234567890 or username"
                        className="w-full px-4 py-3.5 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Telegram Handle <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={ownerTelegram}
                        onChange={(e) => setOwnerTelegram(e.target.value)}
                        placeholder="@username"
                        className="w-full px-4 py-3.5 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col-reverse sm:flex-row gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setOwnerVerified(null);
                        setOwnerUniqueId("");
                        setOwnerError("");
                      }}
                      className="flex-1 px-4 py-3.5 bg-gray-100 text-gray-700 rounded-xl text-sm hover:bg-gray-200"
                    >
                      Go Back
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        // Validate required fields
                        if (!ownerWhatsApp.trim() || !ownerTelegram.trim()) {
                          setOwnerError(
                            "WhatsApp and Telegram handles are required for verification.",
                          );
                          return;
                        }

                        setTransferLoading(true);
                        setOwnerError("");
                        try {
                          const { accountService } =
                            await import("../services/api");
                          const result = await accountService.transferOwnership(
                            accountId,
                            ownerUniqueId,
                            ownerWhatsApp.trim(),
                            ownerTelegram.trim(),
                          );
                          setOwnerSuccess(
                            "Ownership transfer initiated successfully! The new owner will receive an invitation to accept.",
                          );
                          setTimeout(() => {
                            onClose();
                          }, 3000);
                        } catch (err) {
                          setOwnerError(
                            err?.response?.data?.message ||
                              "Failed to transfer ownership.",
                          );
                        } finally {
                          setTransferLoading(false);
                        }
                      }}
                      disabled={
                        transferLoading ||
                        !ownerWhatsApp.trim() ||
                        !ownerTelegram.trim()
                      }
                      className="flex-1 px-4 py-3.5 bg-red-600 text-white rounded-xl text-sm hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {transferLoading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Transferring...
                        </>
                      ) : (
                        <>
                          <Crown className="w-4 h-4" />
                          Confirm Transfer
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
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
