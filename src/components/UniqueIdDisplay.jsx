import React, { useState } from "react";
import { Copy, Check, Hash, Info } from "lucide-react";

/**
 * UniqueIdDisplay Component
 *
 * Displays the account's unique ID with copy functionality
 * This ID is used for:
 * - Account linking (parent-child relationships)
 * - Ownership transfer
 * - Easy account identification
 *
 * @param {string} uniqueId - The account's unique identifier (e.g., "ACC-A1B2C3")
 */
const UniqueIdDisplay = ({ uniqueId }) => {
  const [copied, setCopied] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(uniqueId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!uniqueId) {
    return (
      <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-yellow-900">
              Account ID Not Generated
            </p>
            <p className="text-xs text-yellow-700 mt-1">
              This account was created before the unique ID system. Please
              contact support.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-slate-300 rounded-xl p-5 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, transparent, transparent 10px, currentColor 10px, currentColor 11px)",
            color: "#0f172a",
          }}
        />
      </div>

      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-600 p-2 rounded-lg">
              <Hash className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-slate-600 font-semibold uppercase tracking-wide">
                Account Unique ID
              </p>
              <button
                onClick={() => setShowInfo(!showInfo)}
                className="text-xs text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1 mt-0.5"
              >
                <Info className="w-3 h-3" />
                What's this for?
              </button>
            </div>
          </div>
          <button
            onClick={handleCopy}
            className="p-3 bg-white hover:bg-emerald-50 border-2 border-slate-300 hover:border-emerald-500 rounded-xl transition-all group"
            title="Copy to clipboard"
          >
            {copied ? (
              <Check className="w-5 h-5 text-emerald-600" />
            ) : (
              <Copy className="w-5 h-5 text-slate-600 group-hover:text-emerald-600" />
            )}
          </button>
        </div>

        <div className="bg-white border-2 border-slate-300 rounded-xl p-4 mb-3">
          <p className="text-3xl font-bold text-slate-900 tracking-wider font-mono text-center select-all">
            {uniqueId}
          </p>
        </div>

        {showInfo && (
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 space-y-2">
            <p className="text-sm font-semibold text-blue-900">
              🔗 How to use your Account ID:
            </p>
            <ul className="text-xs text-blue-800 space-y-1.5 ml-4">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>
                  <strong>Transfer Ownership:</strong> Share this ID with
                  someone to transfer full account ownership to them
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>
                  <strong>Link to Parent:</strong> Use another account's ID to
                  establish a hierarchical relationship
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>
                  <strong>Account Identification:</strong> Uniquely identifies
                  this account in all system operations
                </span>
              </li>
            </ul>
            <p className="text-xs text-blue-700 mt-3 border-t border-blue-200 pt-2">
              💡 <strong>Tip:</strong> Click the copy button to easily share
              this ID with team members or support.
            </p>
          </div>
        )}

        {!showInfo && (
          <p className="text-xs text-slate-500 text-center">
            Share this ID to link accounts or transfer ownership
          </p>
        )}
      </div>
    </div>
  );
};

export default UniqueIdDisplay;
