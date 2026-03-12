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
        className="flex items-center gap-3 px-5 py-3 bg-slate-700/50 backdrop-blur-sm border-2 border-slate-600 hover:border-slate-500 rounded-xl hover:bg-slate-700 transition-all min-w-[220px] shadow-lg hover:shadow-xl"
      >
        <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-lg">
          <Building2 className="w-5 h-5 text-white" />
        </div>
        <span className="flex-1 text-left font-bold text-white truncate">
          {currentAccount.accountName}
        </span>
        <ChevronDown
          className={`w-5 h-5 text-slate-300 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-slate-200 rounded-xl shadow-2xl z-20 overflow-hidden animate-slideDown">
            <div className="max-h-80 overflow-y-auto">
              <div className="p-2 bg-slate-50 border-b border-slate-200">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider px-3 py-2">
                  Your Accounts ({accounts.length})
                </p>
              </div>
              {accounts.map((account) => (
                <button
                  key={account._id}
                  onClick={() => handleSwitch(account._id)}
                  className={`w-full text-left px-4 py-3.5 hover:bg-blue-50 transition-all ${
                    account._id === currentAccount._id
                      ? "bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-blue-600"
                      : "border-l-4 border-transparent hover:border-l-blue-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        account._id === currentAccount._id
                          ? "bg-gradient-to-br from-blue-600 to-purple-600"
                          : "bg-slate-200"
                      }`}
                    >
                      <Building2
                        className={`w-4 h-4 ${
                          account._id === currentAccount._id
                            ? "text-white"
                            : "text-slate-600"
                        }`}
                      />
                    </div>
                    <div className="flex-1">
                      <span
                        className={`font-bold block ${
                          account._id === currentAccount._id
                            ? "text-blue-900"
                            : "text-slate-700"
                        }`}
                      >
                        {account.accountName}
                      </span>
                      {account._id === currentAccount._id && (
                        <span className="text-xs text-blue-600 font-semibold">
                          ✓ Active
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="border-t-2 border-slate-200 bg-slate-50">
              <button
                onClick={handleCreateNew}
                className="w-full flex items-center gap-3 px-4 py-4 text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 font-bold transition-all shadow-md"
              >
                <div className="bg-white/20 p-2 rounded-lg">
                  <Plus className="w-5 h-5" />
                </div>
                <span>Create New Account</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AccountSwitcher;
