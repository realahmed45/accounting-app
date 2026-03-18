import React, { useState } from "react";
import { X, HelpCircle, AlertCircle, CheckCircle } from "lucide-react";
import { memberService } from "../services/api";

const OwnershipCorrectionModal = ({ accountId, onClose }) => {
  // Steps: "input" | "confirm" | "done"
  const [step, setStep] = useState("input");
  const [intendedEmail, setIntendedEmail] = useState("");
  const [intendedWhatsApp, setIntendedWhatsApp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleYes = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await memberService.requestOwnershipCorrection(accountId, {
        intendedEmail: intendedEmail.trim(),
        intendedWhatsApp: intendedWhatsApp.trim(),
        confirm: true,
      });
      if (result.success) {
        setStep("done");
      } else {
        setError(result.message || "Failed to submit correction request.");
      }
    } catch (err) {
      setError(
        err?.response?.data?.message || "Failed to submit correction request.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleNo = () => {
    setIntendedEmail("");
    setIntendedWhatsApp("");
    setStep("input");
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
              <HelpCircle className="w-4 h-4 text-red-600" />
            </div>
            <h2 className="text-base font-semibold text-gray-900">
              Ownership Sent to Wrong Person
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {step === "input" && (
            <>
              {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}
              <p className="text-sm text-gray-700 font-medium">
                Which email/number were you supposed to send it to?
              </p>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Supposed to send to:
                </label>
                <input
                  type="email"
                  value={intendedEmail}
                  onChange={(e) => setIntendedEmail(e.target.value)}
                  placeholder="correct@example.com"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  WhatsApp (optional):
                </label>
                <input
                  type="tel"
                  value={intendedWhatsApp}
                  onChange={(e) => setIntendedWhatsApp(e.target.value)}
                  placeholder="+1 234 567 8900"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={() => {
                  if (!intendedEmail.trim()) {
                    setError("Please enter the correct email.");
                    return;
                  }
                  setError("");
                  setStep("confirm");
                }}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
              >
                Continue
              </button>
            </>
          )}

          {step === "confirm" && (
            <>
              {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}
              <p className="text-sm text-gray-700 font-medium">
                Do you want to transfer ownership to{" "}
                <span className="text-blue-600 font-semibold">
                  {intendedEmail}
                </span>{" "}
                instead?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleYes}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? "Submitting…" : "Yes"}
                </button>
                <button
                  onClick={handleNo}
                  disabled={loading}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50"
                >
                  No — send to a different one
                </button>
              </div>
            </>
          )}

          {step === "done" && (
            <div className="text-center space-y-3 py-2">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <p className="font-medium text-gray-900">
                Correction Request Submitted
              </p>
              <p className="text-sm text-gray-500">
                Your correction request has been submitted. Ownership will be
                moved to the correct person within <strong>4 days</strong>.
              </p>
              <button
                onClick={onClose}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OwnershipCorrectionModal;
