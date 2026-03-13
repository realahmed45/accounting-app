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
      <div className="glass-modal-content p-8 border-amber-500/20 bg-amber-500/5 animate-scaleIn">
        <div className="flex items-start gap-5">
          <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
            <Info className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <p className="text-sm font-black text-amber-500 uppercase tracking-[0.2em] mb-2">
              Signature Void Detect
            </p>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-widest leading-relaxed">
              This node was initialized before the unique protocol. Please re-synchronize or contact terminal support.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-modal-content p-8 relative overflow-hidden group border-white/5 hover:border-white/10 transition-all duration-500 shadow-[0_30px_60px_rgba(0,0,0,0.4)]">
      {/* Neural Link Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-1000"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/5 blur-3xl translate-y-16 -translate-x-16 group-hover:scale-150 transition-transform duration-1000"></div>
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-3 rounded-2xl shadow-lg shadow-indigo-500/20 group-hover:rotate-12 transition-transform duration-500">
              <Hash className="w-6 h-6 text-white italic" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.4em] mb-1">
                Neural Signature
              </p>
              <button
                onClick={() => setShowInfo(!showInfo)}
                className="text-[9px] text-indigo-400 hover:text-indigo-300 font-black uppercase tracking-[0.2em] flex items-center gap-2 transition-colors"
              >
                <Info className="w-3.5 h-3.5" />
                Access Protocol Intel
              </button>
            </div>
          </div>
          <button
            onClick={handleCopy}
            className={`p-4 rounded-2xl transition-all duration-300 border relative overflow-hidden group/btn ${
              copied 
                ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400" 
                : "bg-white/2 border-white/5 hover:border-white/10 text-slate-500 hover:text-white"
            }`}
            title="Siphon Signature"
          >
            {copied ? (
              <Check className="w-5 h-5 animate-scaleIn" />
            ) : (
              <Copy className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
            )}
            {copied && <div className="absolute inset-0 bg-emerald-500/20 animate-pulse"></div>}
          </button>
        </div>

        <div className="relative mb-8 group/key">
          <div className="absolute inset-0 bg-indigo-500/10 blur-2xl opacity-0 group-hover/key:opacity-100 transition-opacity duration-700"></div>
          <div className="relative bg-black/40 border border-white/10 rounded-2xl p-6 shadow-inner overflow-hidden">
            <div className="absolute top-0 right-0 p-2 opacity-10 font-bold text-[8px] tracking-[0.5em] text-white">KEY_SIGNED</div>
            <p className="text-4xl font-black text-white tracking-[0.15em] font-mono text-center select-all drop-shadow-[0_0_15px_rgba(99,102,241,0.3)] group-hover/key:scale-[1.02] transition-transform duration-500 italic">
              {uniqueId}
            </p>
          </div>
        </div>

        {showInfo && (
          <div className="glass-modal-content bg-white/2 border-white/5 p-6 animate-slideUp space-y-4">
            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] flex items-center gap-3">
              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-ping" />
              Protocol Capabilities
            </p>
            <div className="grid grid-cols-1 gap-4">
              {[
                { label: "Authority Transition", desc: "Initialize ownership delegation to secondary nodes." },
                { label: "Linear Integration", desc: "Forge hierarchical bonds between disparate neural clusters." },
                { label: "Matrix Identifier", desc: "Immutable reference point for all system-wide operations." }
              ].map((item, i) => (
                <div key={i} className="flex gap-4 p-3 rounded-xl bg-white/2 hover:bg-white/5 transition-colors group/item">
                  <div className="w-1 h-auto bg-indigo-500/20 group-hover/item:bg-indigo-500 transition-colors rounded-full" />
                  <div>
                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">{item.label}</p>
                    <p className="text-[9px] text-slate-500 font-medium uppercase tracking-tight opacity-70 leading-normal">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!showInfo && (
          <div className="flex items-center justify-center gap-3 text-[9px] text-slate-600 font-black uppercase tracking-[0.3em] group-hover:text-slate-400 transition-colors">
            <span className="w-8 h-[1px] bg-white/10" />
            Distribute Signature for Grid Linking
            <span className="w-8 h-[1px] bg-white/10" />
          </div>
        )}
      </div>
    </div>
  );
};

export default UniqueIdDisplay;
