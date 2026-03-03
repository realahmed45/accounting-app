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
        className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors min-w-[200px] shadow-sm"
      >
        <Building2 className="w-4 h-4 text-slate-600" />
        <span className="flex-1 text-left font-semibold text-slate-900">
          {currentAccount.accountName}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-slate-600 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-lg z-20 overflow-hidden">
            <div className="max-h-64 overflow-y-auto">
              {accounts.map((account) => (
                <button
                  key={account._id}
                  onClick={() => handleSwitch(account._id)}
                  className={`w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors ${
                    account._id === currentAccount._id
                      ? "bg-slate-100 text-slate-900 font-semibold"
                      : "text-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    <span className="font-medium">{account.accountName}</span>
                  </div>
                </button>
              ))}
            </div>

            <div className="border-t border-slate-200">
              <button
                onClick={handleCreateNew}
                className="w-full flex items-center gap-2 px-4 py-3 text-slate-900 font-semibold hover:bg-slate-50 transition-colors"
              >
                <Plus className="w-4 h-4" />
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
