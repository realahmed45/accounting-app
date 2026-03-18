import React, { useState } from "react";
import {
  X,
  Crown,
  Mail,
  AlertCircle,
  CheckCircle,
  Copy,
  ExternalLink,
} from "lucide-react";
import { memberService } from "../services/api";
import { sendOwnershipTransferEmail } from "../services/emailService";

const TransferOwnershipModal = ({
  accountId,
  accountName,
  currentUser,
  onClose,
  onSuccess,
}) => {
  const [toEmail, setToEmail] = useState("");
  const [toWhatsApp, setToWhatsApp] = useState("");
  const [toTelegram, setToTelegram] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [fallbackLink, setFallbackLink] = useState("");
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!toEmail.trim()) {
      setError("Email is required.");
      return;
    }

    setLoading(true);
    const trace = (msg, d) => {
      console.log(`[Transfer Trace] ${msg}`, d || "");
      if (!window.DEBUG_TRANSFER) window.DEBUG_TRANSFER = [];
      window.DEBUG_TRANSFER.push({ time: new Date().toISOString(), msg, d });
    };

    trace("handleSubmit triggered", { toEmail });

    try {
      trace("Calling API transferOwnership...");
      const result = await memberService.transferOwnership(accountId, {
        toEmail: toEmail.trim(),
        toWhatsApp: toWhatsApp.trim(),
        toTelegram: toTelegram.trim(),
      });

      trace("API result", result);

      if (!result.success) {
        trace("API ERROR", result.message);
        setError(result.message || "Failed to initiate transfer.");
        setLoading(false);
        return;
      }

      // Fire email via EmailJS
      trace("Triggering Email Service...");
      const inviterName =
        result.inviterName ||
        `${currentUser?.firstName || ""} ${currentUser?.familyName || ""}`.trim() ||
        currentUser?.email;

      const emailResult = await sendOwnershipTransferEmail({
        toEmail: toEmail.trim(),
        inviterName,
        accountName: result.accountName || accountName,
        inviteLink: result.inviteLink,
      });

      trace("Email Service result", emailResult);

      if (!emailResult.sent) {
        trace("Email skipped/failed", emailResult.error);
        setFallbackLink(result.inviteLink);
      } else {
        trace("Email CONFIRMED sent");
      }

      setDone(true);
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("[Transfer Modal] CRITICAL CATCH:", err);
      trace("CATCH BLOCK ERROR", { 
        msg: err.message, 
        stack: err.stack,
        resp: err.response?.data
      });
      setError(err?.response?.data?.message || "Failed to initiate transfer.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(fallbackLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b">
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-amber-500" />
            <h2 className="text-base font-semibold text-gray-900">
              Transfer Ownership
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5">
          {done ? (
            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Transfer Initiated</p>
                <p className="text-sm text-gray-500 mt-1">
                  {fallbackLink
                    ? "Email could not be sent. Share the link below manually."
                    : `${toEmail} will receive an email with instructions.`}
                </p>
              </div>
              {fallbackLink && (
                <div className="bg-gray-50 border rounded-lg p-3 text-left">
                  <p className="text-xs text-gray-500 mb-2">Share this link:</p>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-blue-600 break-all flex-1">
                      {fallbackLink}
                    </p>
                    <button
                      onClick={handleCopy}
                      className="flex-shrink-0 p-1.5 bg-white border rounded hover:bg-gray-50"
                      title="Copy link"
                    >
                      {copied ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-500" />
                      )}
                    </button>
                  </div>
                </div>
              )}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-left">
                <p className="text-xs text-amber-800">
                  <strong>Important:</strong> Once the new owner accepts, you
                  will automatically be placed in view-only mode. You will need
                  to enter your password before making any changes.
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-sm text-gray-600">
                Transfer full ownership of <strong>{accountName}</strong> to
                another person. They will receive an email invitation. Once
                accepted, you will retain access in view-only mode.
              </p>

              {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              {/* Email — functional */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New owner's email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={toEmail}
                    onChange={(e) => setToEmail(e.target.value)}
                    placeholder="newowner@example.com"
                    required
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* WhatsApp — stored, not yet active */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  WhatsApp number
                  <span className="ml-2 text-xs font-normal text-gray-400">
                    (optional — for future use)
                  </span>
                </label>
                <input
                  type="tel"
                  value={toWhatsApp}
                  onChange={(e) => setToWhatsApp(e.target.value)}
                  placeholder="+1 234 567 8900"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Telegram — stored, not yet active */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telegram handle
                  <span className="ml-2 text-xs font-normal text-gray-400">
                    (optional — for future use)
                  </span>
                </label>
                <input
                  type="text"
                  value={toTelegram}
                  onChange={(e) => setToTelegram(e.target.value)}
                  placeholder="@username"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-400 mt-1">
                  WhatsApp and Telegram notifications will be enabled in a
                  future update. Only email is active now.
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 text-sm bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Crown className="w-4 h-4" />
                  {loading ? "Initiating…" : "Transfer Ownership"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransferOwnershipModal;
