import React, { useState } from "react";
import {
  X,
  Link,
  AlertCircle,
  CheckCircle2,
  Search,
  Info,
  ArrowRight,
} from "lucide-react";
import { accountService } from "../services/api";

/**
 * LinkParentModal Component
 *
 * Allows users to link their current account to a parent account using unique ID
 *
 * When you link to a parent account:
 * - Creates a hierarchical relationship (parent → child)
 * - Parent account owner can have oversight capabilities
 * - Useful for business hierarchies, department structures, etc.
 *
 * @param {string} accountId - Current account ID to link
 * @param {string} currentAccountName - Current account name (for confirmation)
 * @param {function} onClose - Callback to close modal
 * @param {function} onSuccess - Callback after successful linking
 */
const LinkParentModal = ({
  accountId,
  currentAccountName,
  onClose,
  onSuccess,
}) => {
  const [parentUniqueId, setParentUniqueId] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");
  const [verifiedParent, setVerifiedParent] = useState(null);
  const [step, setStep] = useState(1); // 1: Enter ID, 2: Verify, 3: Confirm

  const handleVerify = async () => {
    if (!parentUniqueId.trim()) {
      setError("Please enter a parent account ID");
      return;
    }

    if (parentUniqueId.length !== 10) {
      setError("ID must be 10 characters (ACC-XXXXXX)");
      return;
    }

    setVerifying(true);
    setError("");
    setVerifiedParent(null);

    try {
      const response = await accountService.findByUniqueId(
        parentUniqueId.trim().toUpperCase(),
      );
      if (response.success) {
        setVerifiedParent(response.data);
        setStep(2);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Account not found. Please check the ID and try again.",
      );
    } finally {
      setVerifying(false);
    }
  };

  const handleLink = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await accountService.linkToParent(
        accountId,
        parentUniqueId.trim().toUpperCase(),
      );
      if (response.success) {
        onSuccess && onSuccess(response.data);
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to link account");
      setStep(2); // Go back to verification step
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setVerifiedParent(null);
    setError("");
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-5 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-600 p-2.5 rounded-xl">
              <Link className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">
                Link to Parent Account
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Step {step} of 3:{" "}
                {step === 1
                  ? "Enter ID"
                  : step === 2
                    ? "Verify Account"
                    : "Confirm Link"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-lg transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Instructional Banner */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-blue-900 mb-2">
                  📚 Understanding Parent-Child Account Relationships
                </p>
                <div className="text-xs text-blue-800 space-y-1.5">
                  <p>
                    <strong>What happens when you link to a parent?</strong>
                  </p>
                  <ul className="ml-4 space-y-1">
                    <li>
                      • Your account <strong>"{currentAccountName}"</strong>{" "}
                      becomes a child account
                    </li>
                    <li>
                      • The parent account owner gains oversight capabilities
                    </li>
                    <li>
                      • You maintain full control of your account operations
                    </li>
                    <li>
                      • Useful for department hierarchies, franchise structures,
                      etc.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Step 1: Enter Parent ID */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Parent Account Unique ID
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={parentUniqueId}
                    onChange={(e) => {
                      const value = e.target.value.toUpperCase();
                      // Only allow alphanumeric and hyphen
                      if (/^[A-Z0-9-]*$/.test(value)) {
                        setParentUniqueId(value);
                      }
                    }}
                    placeholder="ACC-XXXXXX"
                    className="flex-1 px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none font-mono text-lg tracking-wider"
                    maxLength={10}
                    autoFocus
                  />
                  <button
                    onClick={handleVerify}
                    disabled={
                      verifying ||
                      !parentUniqueId.trim() ||
                      parentUniqueId.length !== 10
                    }
                    className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-semibold transition-all"
                  >
                    <Search className="w-5 h-5" />
                    {verifying ? "Verifying..." : "Verify"}
                  </button>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Enter the 10-character unique ID of the parent account
                  (format: ACC-XXXXXX)
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <p className="text-xs font-semibold text-slate-700 mb-2">
                  💡 Where to find a parent account ID:
                </p>
                <ul className="text-xs text-slate-600 space-y-1 ml-4">
                  <li>
                    • Ask the parent account owner to share their unique ID
                  </li>
                  <li>• The ID is displayed in their Settings screen</li>
                  <li>
                    • IDs are always in format: ACC-XXXXXX (letters and numbers)
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* Step 2: Verification Result */}
          {step === 2 && verifiedParent && (
            <div className="space-y-4">
              <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-5">
                <div className="flex items-start gap-4">
                  <div className="bg-emerald-600 p-3 rounded-xl">
                    <CheckCircle2 className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-emerald-900 mb-3">
                      ✅ Account Found & Verified
                    </p>
                    <div className="bg-white rounded-lg p-4 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-600">
                          Account Name:
                        </span>
                        <span className="text-sm font-bold text-slate-900">
                          {verifiedParent.accountName}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-600">
                          Account Type:
                        </span>
                        <span className="text-sm font-semibold text-slate-700 capitalize">
                          {verifiedParent.accountType}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-600">
                          Unique ID:
                        </span>
                        <span className="text-sm font-mono font-bold text-emerald-700">
                          {verifiedParent.uniqueId}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-yellow-900 mb-2">
                      ⚠️ Before You Proceed
                    </p>
                    <div className="text-xs text-yellow-800 space-y-1.5">
                      <p>
                        <strong>
                          You are about to create this relationship:
                        </strong>
                      </p>
                      <div className="bg-white rounded-lg p-3 my-2 flex items-center justify-center gap-3 font-semibold">
                        <span className="text-slate-700">
                          {currentAccountName}
                        </span>
                        <ArrowRight className="w-4 h-4 text-emerald-600" />
                        <span className="text-emerald-700">
                          {verifiedParent.accountName}
                        </span>
                        <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
                          Parent
                        </span>
                      </div>
                      <ul className="ml-4 space-y-1 mt-2">
                        <li>• This action cannot be easily undone</li>
                        <li>
                          • The parent account owner will have oversight access
                        </li>
                        <li>
                          • Your account operations remain under your control
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-900">Error</p>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-slate-50 border-t border-slate-200 px-6 py-4 flex gap-3">
          {step === 1 && (
            <>
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 border-2 border-slate-300 text-slate-700 hover:bg-white rounded-xl font-semibold transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleVerify}
                disabled={
                  verifying ||
                  !parentUniqueId.trim() ||
                  parentUniqueId.length !== 10
                }
                className="flex-1 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {verifying ? "Verifying..." : "Verify Account →"}
              </button>
            </>
          )}
          {step === 2 && (
            <>
              <button
                onClick={resetForm}
                className="flex-1 px-4 py-3 border-2 border-slate-300 text-slate-700 hover:bg-white rounded-xl font-semibold transition-all"
              >
                ← Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!verifiedParent}
                className="flex-1 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold disabled:opacity-50 transition-all"
              >
                Confirm & Link →
              </button>
            </>
          )}
          {step === 3 && (
            <>
              <button
                onClick={() => setStep(2)}
                disabled={loading}
                className="flex-1 px-4 py-3 border-2 border-slate-300 text-slate-700 hover:bg-white rounded-xl font-semibold transition-all"
              >
                ← Back
              </button>
              <button
                onClick={handleLink}
                disabled={loading}
                className="flex-1 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Linking...
                  </>
                ) : (
                  <>
                    <Link className="w-5 h-5" />
                    Link Account Now
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LinkParentModal;
