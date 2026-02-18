import React, { useState } from "react";
import { useAccount } from "../context/AccountContext";
import { ChevronDown, Plus, Building2 } from "lucide-react";

const AccountSwitcher = () => {
  const { accounts, currentAccount, switchAccount, createAccount } =
    useAccount();
  const [isOpen, setIsOpen] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newAccountName, setNewAccountName] = useState("");
  const [creating, setCreating] = useState(false);

  const handleSwitch = async (accountId) => {
    await switchAccount(accountId);
    setIsOpen(false);
  };

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    if (!newAccountName.trim()) return;

    setCreating(true);
    await createAccount({ accountName: newAccountName });
    setNewAccountName("");
    setShowCreateForm(false);
    setCreating(false);
    setIsOpen(false);
  };

  if (!currentAccount) {
    return (
      <div className="p-4">
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Create First Account
        </button>

        {showCreateForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Create New Account</h3>
              <form onSubmit={handleCreateAccount}>
                <input
                  type="text"
                  value={newAccountName}
                  onChange={(e) => setNewAccountName(e.target.value)}
                  placeholder="Account name (e.g., Personal, Business)"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={creating}
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {creating ? "Creating..." : "Create"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors min-w-[200px]"
      >
        <Building2 className="w-4 h-4 text-gray-600" />
        <span className="flex-1 text-left font-medium">
          {currentAccount.accountName}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-gray-600 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-20 overflow-hidden">
            <div className="max-h-64 overflow-y-auto">
              {accounts.map((account) => (
                <button
                  key={account._id}
                  onClick={() => handleSwitch(account._id)}
                  className={`w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors ${
                    account._id === currentAccount._id
                      ? "bg-blue-50 text-blue-600"
                      : ""
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    <span className="font-medium">{account.accountName}</span>
                  </div>
                </button>
              ))}
            </div>

            <div className="border-t border-gray-200">
              {showCreateForm ? (
                <form onSubmit={handleCreateAccount} className="p-2">
                  <input
                    type="text"
                    value={newAccountName}
                    onChange={(e) => setNewAccountName(e.target.value)}
                    placeholder="New account name..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2 text-sm"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={creating}
                      className="flex-1 bg-blue-600 text-white py-1.5 rounded-lg hover:bg-blue-700 text-sm disabled:opacity-50"
                    >
                      {creating ? "Creating..." : "Create"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCreateForm(false)}
                      className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="w-full flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span className="font-medium">Create New Account</span>
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AccountSwitcher;
