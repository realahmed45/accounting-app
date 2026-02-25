import React, { useState } from "react";
import { useAccount } from "../context/AccountContext";
import { ChevronDown, Plus, Building2, X, User } from "lucide-react";
import {
  BUSINESS_CATEGORIES,
  getCategoryList,
  getSubcategories,
} from "../config/categories";

const AccountSwitcher = () => {
  const { accounts, currentAccount, switchAccount, createAccount } =
    useAccount();
  const [isOpen, setIsOpen] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [accountKind, setAccountKind] = useState(""); // "personal" | "business"
  const [personalDescription, setPersonalDescription] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [customDescription, setCustomDescription] = useState("");
  const [creating, setCreating] = useState(false);

  const resetForm = () => {
    setAccountKind("");
    setPersonalDescription("");
    setSelectedCategory("");
    setSelectedSubcategory("");
    setCustomDescription("");
  };

  const handleSwitch = async (accountId) => {
    await switchAccount(accountId);
    setIsOpen(false);
  };

  const handleCreateAccount = async (e) => {
    e.preventDefault();

    if (accountKind === "personal") {
      setCreating(true);
      await createAccount({
        accountType: "personal",
        accountName: personalDescription.trim() || "Personal",
        description: personalDescription.trim(),
      });
      resetForm();
      setShowCreateForm(false);
      setCreating(false);
      setIsOpen(false);
      return;
    }

    // Business
    if (!selectedCategory) {
      alert("Please select a category");
      return;
    }
    if (selectedCategory === "Other" && !customDescription.trim()) {
      alert("Please provide a description");
      return;
    }
    if (selectedCategory !== "Other" && !selectedSubcategory) {
      alert("Please select a subcategory");
      return;
    }

    setCreating(true);
    await createAccount({
      accountType: "business",
      category: selectedCategory,
      subcategory: selectedSubcategory || null,
      customDescription:
        selectedCategory === "Other" ? customDescription : null,
      accountName:
        selectedCategory === "Other"
          ? customDescription
          : selectedSubcategory || selectedCategory,
    });
    resetForm();
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
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">
                  {accountKind === ""
                    ? "Create Account"
                    : accountKind === "personal"
                      ? "Personal Account"
                      : "Business Account"}
                </h3>
                <button
                  onClick={() => {
                    setShowCreateForm(false);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Step 1 */}
              {accountKind === "" && (
                <div className="space-y-3">
                  <p className="text-sm text-gray-500 mb-3">
                    What type of account would you like to create?
                  </p>
                  <button
                    type="button"
                    onClick={() => setAccountKind("personal")}
                    className="w-full flex items-center gap-3 p-4 border-2 border-gray-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all text-left"
                  >
                    <div className="bg-green-100 p-2 rounded-lg flex-shrink-0">
                      <User className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">
                        Personal Account
                      </p>
                      <p className="text-xs text-gray-500">
                        For personal expense tracking
                      </p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAccountKind("business")}
                    className="w-full flex items-center gap-3 p-4 border-2 border-gray-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all text-left"
                  >
                    <div className="bg-blue-100 p-2 rounded-lg flex-shrink-0">
                      <Building2 className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">
                        Business Account
                      </p>
                      <p className="text-xs text-gray-500">
                        For business and commercial use
                      </p>
                    </div>
                  </button>
                </div>
              )}

              {/* Step 2a: Personal */}
              {accountKind === "personal" && (
                <form onSubmit={handleCreateAccount} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description{" "}
                      <span className="text-gray-400 font-normal">
                        (Optional)
                      </span>
                    </label>
                    <input
                      type="text"
                      value={personalDescription}
                      onChange={(e) => setPersonalDescription(e.target.value)}
                      placeholder="e.g., My personal expenses..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      autoFocus
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setAccountKind("")}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                    >
                      ← Back
                    </button>
                    <button
                      type="submit"
                      disabled={creating}
                      className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      <Plus className="w-4 h-4" />
                      {creating ? "Creating..." : "Create Account"}
                    </button>
                  </div>
                </form>
              )}

              {/* Step 2b: Business */}
              {accountKind === "business" && (
                <form onSubmit={handleCreateAccount} className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => {
                        setSelectedCategory(e.target.value);
                        setSelectedSubcategory("");
                        setCustomDescription("");
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select a category...</option>
                      {getCategoryList().map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                  {selectedCategory && selectedCategory !== "Other" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Subcategory <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={selectedSubcategory}
                        onChange={(e) => setSelectedSubcategory(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      >
                        <option value="">Select a subcategory...</option>
                        {getSubcategories(selectedCategory).map((sub) => (
                          <option key={sub} value={sub}>
                            {sub}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  {selectedCategory === "Other" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Business Description{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={customDescription}
                        onChange={(e) => setCustomDescription(e.target.value)}
                        placeholder="Describe your business..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                  )}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setAccountKind("")}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                    >
                      ← Back
                    </button>
                    <button
                      type="submit"
                      disabled={creating}
                      className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      <Plus className="w-4 h-4" />
                      {creating ? "Creating..." : "Create Account"}
                    </button>
                  </div>
                </form>
              )}
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
                <div className="p-3">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-semibold text-gray-700">
                      {accountKind === ""
                        ? "Select Account Type"
                        : accountKind === "personal"
                          ? "Personal Account"
                          : "Business Account"}
                    </p>
                    {accountKind !== "" && (
                      <button
                        type="button"
                        onClick={() => setAccountKind("")}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        ← Back
                      </button>
                    )}
                  </div>

                  {/* Step 1 */}
                  {accountKind === "" && (
                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={() => setAccountKind("personal")}
                        className="w-full flex items-center gap-2 p-2.5 border-2 border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all text-left"
                      >
                        <div className="bg-green-100 p-1.5 rounded">
                          <User className="w-3.5 h-3.5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800">
                            Personal
                          </p>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setAccountKind("business")}
                        className="w-full flex items-center gap-2 p-2.5 border-2 border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all text-left"
                      >
                        <div className="bg-blue-100 p-1.5 rounded">
                          <Building2 className="w-3.5 h-3.5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800">
                            Business
                          </p>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowCreateForm(false);
                          resetForm();
                        }}
                        className="w-full text-center text-xs text-gray-500 hover:text-gray-700 pt-1"
                      >
                        Cancel
                      </button>
                    </div>
                  )}

                  {/* Step 2a: Personal */}
                  {accountKind === "personal" && (
                    <form onSubmit={handleCreateAccount} className="space-y-2">
                      <input
                        type="text"
                        value={personalDescription}
                        onChange={(e) => setPersonalDescription(e.target.value)}
                        placeholder="Description (optional)..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        autoFocus
                      />
                      <button
                        type="submit"
                        disabled={creating}
                        className="w-full bg-blue-600 text-white py-1.5 rounded-lg hover:bg-blue-700 text-sm disabled:opacity-50"
                      >
                        {creating ? "Creating..." : "Create Account"}
                      </button>
                    </form>
                  )}

                  {/* Step 2b: Business */}
                  {accountKind === "business" && (
                    <form onSubmit={handleCreateAccount} className="space-y-2">
                      <select
                        value={selectedCategory}
                        onChange={(e) => {
                          setSelectedCategory(e.target.value);
                          setSelectedSubcategory("");
                          setCustomDescription("");
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      >
                        <option value="">Select category...</option>
                        {getCategoryList().map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                      {selectedCategory && selectedCategory !== "Other" && (
                        <select
                          value={selectedSubcategory}
                          onChange={(e) =>
                            setSelectedSubcategory(e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        >
                          <option value="">Select subcategory...</option>
                          {getSubcategories(selectedCategory).map((sub) => (
                            <option key={sub} value={sub}>
                              {sub}
                            </option>
                          ))}
                        </select>
                      )}
                      {selectedCategory === "Other" && (
                        <input
                          type="text"
                          value={customDescription}
                          onChange={(e) => setCustomDescription(e.target.value)}
                          placeholder="Describe your business..."
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      )}
                      <button
                        type="submit"
                        disabled={creating}
                        className="w-full bg-blue-600 text-white py-1.5 rounded-lg hover:bg-blue-700 text-sm disabled:opacity-50"
                      >
                        {creating ? "Creating..." : "Create Account"}
                      </button>
                    </form>
                  )}
                </div>
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
