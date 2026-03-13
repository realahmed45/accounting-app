import React, { useState } from "react";
import { useAccount } from "../context/AccountContext";
import { ChevronDown, Plus, Building2 } from "lucide-react";

const AccountSwitcher = ({ setShowCreateAccountModal }) => {
  const { accounts, currentAccount, switchAccount } = useAccount();
  const [isOpen, setIsOpen] = useState(false);

  const handleSwitch = async (accountId) => {
    await switchAccount(accountId);
    setIsOpen(false);
  };

  const handleCreateNew = () => {
    setIsOpen(false);
    if (setShowCreateAccountModal) {
      setShowCreateAccountModal(true);
    }
  };

  if (!currentAccount) {
    return null;
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-4 px-6 py-4 bg-white/2 border border-white/5 backdrop-blur-2xl rounded-2xl transition-all duration-300 group min-w-[260px] shadow-2xl ${
          isOpen ? "ring-2 ring-indigo-500/20 border-indigo-500/30" : "hover:border-white/10 hover:bg-white/5"
        }`}
      >
        <div className="relative p-2.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl group-hover:scale-110 transition-transform shadow-lg shadow-indigo-500/20 overflow-hidden">
           <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
           <Building2 className="relative w-5 h-5 text-white italic" />
        </div>
        <div className="flex-1 text-left">
          <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.3em] mb-0.5 group-hover:text-indigo-400 transition-colors">Neural Node</p>
          <p className="text-sm font-black text-white truncate uppercase italic tracking-tight">
            {currentAccount.accountName}
          </p>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-slate-500 transition-all duration-500 ${isOpen ? "rotate-180 text-indigo-400" : "group-hover:text-slate-300"}`}
        />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-[60]"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 right-0 mt-4 glass-modal-content border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.6)] z-[70] animate-zoomIn origin-top">
            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
              <div className="px-8 py-5 border-b border-white/5 bg-white/2">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em]">
                  Active Matrix Access ({accounts.length})
                </p>
              </div>
              <div className="p-2 space-y-1">
                {accounts.map((account) => (
                  <button
                    key={account._id}
                    onClick={() => handleSwitch(account._id)}
                    className={`w-full text-left px-6 py-4 rounded-xl transition-all group/item relative overflow-hidden ${
                      account._id === currentAccount._id
                        ? "bg-indigo-500/10 border border-indigo-500/20"
                        : "hover:bg-white/5 border border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-4 relative z-10">
                      <div
                        className={`p-2.5 rounded-lg transition-colors ${
                          account._id === currentAccount._id
                            ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/40"
                            : "bg-white/5 text-slate-500 group-hover/item:text-slate-300"
                        }`}
                      >
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <span
                          className={`text-xs font-black block uppercase tracking-wide transition-colors ${
                            account._id === currentAccount._id
                              ? "text-white"
                              : "text-slate-400 group-hover/item:text-slate-200"
                          }`}
                        >
                          {account.accountName}
                        </span>
                        {account._id === currentAccount._id && (
                          <span className="text-[8px] text-indigo-400 font-black uppercase tracking-widest flex items-center gap-1.5 mt-1">
                            <span className="w-1 h-1 rounded-full bg-indigo-400 animate-pulse border border-indigo-400 shadow-[0_0_5px_#6366f1]" />
                            Synchronized
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 bg-black/40 border-t border-white/5">
              <button
                onClick={handleCreateNew}
                className="w-full flex items-center justify-center gap-4 py-4 px-6 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white rounded-xl font-black text-[10px] uppercase tracking-[0.3em] transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-emerald-500/20 group/btn"
              >
                <div className="bg-white/10 p-2 rounded-lg group-hover/btn:scale-110 transition-transform">
                  <Plus className="w-4 h-4" />
                </div>
                Create New Node
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AccountSwitcher;
