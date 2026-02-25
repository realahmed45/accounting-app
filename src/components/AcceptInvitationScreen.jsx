import React, { useState, useEffect } from "react";
import {
  CheckCircle,
  AlertCircle,
  Crown,
  Shield,
  User,
  Lock,
  Loader2,
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────
  if (fetchError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4">
        <div className="bg-white rounded-xl shadow-lg max-w-sm w-full p-8 text-center space-y-4">
          <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-7 h-7 text-red-500" />
          </div>
          <h1 className="text-lg font-semibold text-gray-900">
            Invitation Not Valid
          </h1>
          <p className="text-sm text-gray-500">{fetchError}</p>
          <button
            onClick={() => window.location.replace("/")}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
          >
            Go to App
          </button>
        </div>
      </div>
    );
  }

  // ── Valid invitation ─────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full overflow-hidden">
        {/* Banner */}
        <div
          className={`p-6 text-white ${
            isOwnershipTransfer
              ? "bg-gradient-to-r from-amber-500 to-orange-600"
              : "bg-gradient-to-r from-blue-600 to-purple-600"
          }`}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              {isOwnershipTransfer ? (
                <Crown className="w-5 h-5 text-white" />
              ) : (
                <Shield className="w-5 h-5 text-white" />
              )}
            </div>
            <div>
              <p className="text-white/80 text-sm">
                {isOwnershipTransfer
                  ? "Ownership Transfer"
                  : "You've been invited"}
              </p>
              <h1 className="text-lg font-bold text-white">
                {invitation.accountName}
              </h1>
            </div>
          </div>
          <p className="text-white/90 text-sm">
            <strong>{invitation.inviterName}</strong>
            {isOwnershipTransfer
              ? " is transferring ownership of this account to you."
              : ` invited you to join this account.`}
          </p>
        </div>

        {/* Permissions summary */}
        {!isOwnershipTransfer && (
          <div className="px-6 py-3 bg-gray-50 border-b">
            {invitation.viewOnly ? (
              <p className="text-sm text-gray-600">
                <span className="inline-flex items-center gap-1 font-medium text-gray-700">
                  <User className="w-3.5 h-3.5" /> View Only
                </span>{" "}
                — you can see everything but cannot make changes.
              </p>
            ) : grantedPermissions.length > 0 ? (
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">
                  Your permissions:
                </p>
                <p className="text-sm text-gray-700">
                  {grantedPermissions.join(", ")}
                </p>
              </div>
            ) : null}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleAccept} className="p-6 space-y-4">
          <p className="text-sm text-gray-500">
            Create your password to join as{" "}
            <strong className="text-gray-700">{invitation.email}</strong>
          </p>

          {submitError && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {submitError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="John"
                  required
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={familyName}
                onChange={(e) => setFamilyName(e.target.value)}
                placeholder="Smith"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 6 characters"
                required
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                required
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className={`w-full px-4 py-2.5 text-white rounded-lg text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2 ${
              isOwnershipTransfer
                ? "bg-amber-500 hover:bg-amber-600"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle className="w-4 h-4" />
            )}
            {submitting
              ? "Joining…"
              : isOwnershipTransfer
                ? "Accept Ownership"
                : "Join Account"}
          </button>

          <p className="text-xs text-gray-400 text-center">
            Invitation expires{" "}
            {new Date(invitation.expiresAt).toLocaleDateString()}
          </p>
        </form>
      </div>
    </div>
  );
};

export default AcceptInvitationScreen;
