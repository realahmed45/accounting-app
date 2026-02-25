import React, { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Pencil,
  X,
  CreditCard,
  Building2,
  Wallet,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  Search,
} from "lucide-react";
import { bankAccountService } from "../services/api";

const CURRENCIES = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "CHF", symbol: "Fr", name: "Swiss Franc" },
  { code: "CAD", symbol: "$", name: "Canadian Dollar" },
  { code: "AUD", symbol: "$", name: "Australian Dollar" },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "AED", symbol: "د.إ", name: "UAE Dirham" },
  { code: "SGD", symbol: "$", name: "Singapore Dollar" },
  { code: "HKD", symbol: "$", name: "Hong Kong Dollar" },
  { code: "NZD", symbol: "$", name: "New Zealand Dollar" },
  { code: "SEK", symbol: "kr", name: "Swedish Krona" },
  { code: "NOK", symbol: "kr", name: "Norwegian Krone" },
  { code: "KRW", symbol: "₩", name: "South Korean Won" },
  { code: "MXN", symbol: "$", name: "Mexican Peso" },
  { code: "BRL", symbol: "R$", name: "Brazilian Real" },
  { code: "ZAR", symbol: "R", name: "South African Rand" },
  { code: "RUB", symbol: "₽", name: "Russian Ruble" },
  { code: "TRY", symbol: "₺", name: "Turkish Lira" },
  { code: "SAR", symbol: "﷼", name: "Saudi Riyal" },
  { code: "PLN", symbol: "zł", name: "Polish Zloty" },
  { code: "THB", symbol: "฿", name: "Thai Baht" },
  { code: "IDR", symbol: "Rp", name: "Indonesian Rupiah" },
  { code: "MYR", symbol: "RM", name: "Malaysian Ringgit" },
  { code: "PHP", symbol: "₱", name: "Philippine Peso" },
  { code: "DKK", symbol: "kr", name: "Danish Krone" },
  { code: "CZK", symbol: "Kč", name: "Czech Koruna" },
  { code: "HUF", symbol: "Ft", name: "Hungarian Forint" },
  { code: "ILS", symbol: "₪", name: "Israeli Shekel" },
  { code: "CLP", symbol: "$", name: "Chilean Peso" },
  { code: "PKR", symbol: "₨", name: "Pakistani Rupee" },
  { code: "EGP", symbol: "£", name: "Egyptian Pound" },
  { code: "QAR", symbol: "﷼", name: "Qatari Riyal" },
  { code: "KWD", symbol: "د.ك", name: "Kuwaiti Dinar" },
  { code: "VND", symbol: "₫", name: "Vietnamese Dong" },
  { code: "BDT", symbol: "৳", name: "Bangladeshi Taka" },
  { code: "NGN", symbol: "₦", name: "Nigerian Naira" },
  { code: "ARS", symbol: "$", name: "Argentine Peso" },
  { code: "COP", symbol: "$", name: "Colombian Peso" },
  { code: "PEN", symbol: "S/", name: "Peruvian Sol" },
  { code: "RON", symbol: "lei", name: "Romanian Leu" },
  { code: "UAH", symbol: "₴", name: "Ukrainian Hryvnia" },
  { code: "IQD", symbol: "ع.د", name: "Iraqi Dinar" },
  { code: "KES", symbol: "Sh", name: "Kenyan Shilling" },
  { code: "MAD", symbol: "د.م.", name: "Moroccan Dirham" },
  { code: "OMR", symbol: "ر.ع.", name: "Omani Rial" },
  { code: "LKR", symbol: "Rs", name: "Sri Lankan Rupee" },
  { code: "TWD", symbol: "$", name: "Taiwan Dollar" },
];

const ACCOUNT_TYPE_LABELS = {
  checking: "Checking",
  savings: "Savings",
  credit: "Credit Card",
  cash: "Cash",
  other: "Other",
};

const ACCOUNT_TYPE_COLORS = {
  checking: "bg-blue-100 text-blue-800",
  savings: "bg-green-100 text-green-800",
  credit: "bg-purple-100 text-purple-800",
  cash: "bg-yellow-100 text-yellow-800",
  other: "bg-gray-100 text-gray-800",
};

const defaultForm = {
  name: "",
  bankName: "",
  accountType: "checking",
  lastFourDigits: "",
  balance: "",
  currency: "USD",
};

export default function BankAccountsSection({
  accountId,
  onBankAccountsChange,
}) {
  const [bankAccounts, setBankAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [collapsed, setCollapsed] = useState(false);
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [currencySearch, setCurrencySearch] = useState("");

  useEffect(() => {
    if (accountId) loadBankAccounts();
  }, [accountId]);

  const loadBankAccounts = async () => {
    setLoading(true);
    try {
      const res = await bankAccountService.getAll(accountId);
      if (res.success) {
        setBankAccounts(res.data);
        onBankAccountsChange?.(res.data);
      }
    } catch (err) {
      console.error("Failed to load bank accounts:", err);
    }
    setLoading(false);
  };

  const openAddForm = () => {
    setEditingId(null);
    setForm(defaultForm);
    setError("");
    setShowForm(true);
  };

  const openEditForm = (ba) => {
    setEditingId(ba._id);
    setForm({
      name: ba.name,
      bankName: ba.bankName || "",
      accountType: ba.accountType,
      lastFourDigits: ba.lastFourDigits || "",
      balance: ba.balance?.toString() || "0",
      currency: ba.currency || "USD",
    });
    setError("");
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(defaultForm);
    setError("");
    setCurrencyOpen(false);
    setCurrencySearch("");
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Account name is required");
      return;
    }
    if (form.lastFourDigits && !/^\d{1,4}$/.test(form.lastFourDigits)) {
      setError("Last 4 digits must be numeric (max 4 characters)");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const payload = {
        name: form.name.trim(),
        bankName: form.bankName.trim(),
        accountType: form.accountType,
        lastFourDigits: form.lastFourDigits.trim(),
        balance: parseFloat(form.balance) || 0,
        currency: form.currency || "USD",
      };

      let res;
      if (editingId) {
        res = await bankAccountService.update(accountId, editingId, payload);
      } else {
        res = await bankAccountService.create(accountId, payload);
      }

      if (res.success) {
        await loadBankAccounts();
        closeForm();
        setSuccess(editingId ? "Bank account updated!" : "Bank account added!");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(res.message || "Failed to save");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save bank account");
    }
    setSaving(false);
  };

  const handleDelete = async (bankId) => {
    if (!window.confirm("Remove this bank account?")) return;
    try {
      const res = await bankAccountService.delete(accountId, bankId);
      if (res.success) {
        await loadBankAccounts();
        setSuccess("Bank account removed!");
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete");
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="flex items-center gap-3 text-left flex-1"
        >
          <div className="bg-blue-100 p-2 rounded-lg">
            <CreditCard className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">Bank Accounts</h3>
            <p className="text-sm text-gray-500">
              {bankAccounts.length === 0
                ? "No bank accounts linked yet"
                : `${bankAccounts.length} account${bankAccounts.length !== 1 ? "s" : ""} linked`}
            </p>
          </div>
          <ChevronDown
            className={`w-5 h-5 text-gray-400 ml-2 transition-transform ${collapsed ? "" : "rotate-180"}`}
          />
        </button>
        {!collapsed && (
          <button
            onClick={openAddForm}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Add Bank Account
          </button>
        )}
      </div>

      {!collapsed && (
        <>
          {/* Feedback */}
          {success && (
            <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700 text-sm">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              {success}
            </div>
          )}
          {error && !showForm && (
            <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Add/Edit Form */}
          {showForm && (
            <div className="mb-5 p-4 border-2 border-blue-200 rounded-xl bg-blue-50">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-800">
                  {editingId ? "Edit Bank Account" : "New Bank Account"}
                </h4>
                <button
                  onClick={closeForm}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {error && (
                <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}
              <form onSubmit={handleSave} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Account Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                      placeholder="e.g. Chase Checking"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Bank Name
                    </label>
                    <input
                      type="text"
                      value={form.bankName}
                      onChange={(e) =>
                        setForm({ ...form, bankName: e.target.value })
                      }
                      placeholder="e.g. Chase, Wells Fargo"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Account Type
                    </label>
                    <select
                      value={form.accountType}
                      onChange={(e) =>
                        setForm({ ...form, accountType: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="checking">Checking</option>
                      <option value="savings">Savings</option>
                      <option value="credit">Credit Card</option>
                      <option value="cash">Cash</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Last 4 Digits (optional)
                    </label>
                    <input
                      type="text"
                      value={form.lastFourDigits}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          lastFourDigits: e.target.value
                            .replace(/\D/g, "")
                            .slice(0, 4),
                        })
                      }
                      placeholder="1234"
                      maxLength={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Current Balance (optional)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={form.balance}
                      onChange={(e) =>
                        setForm({ ...form, balance: e.target.value })
                      }
                      placeholder="0.00"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Currency <span className="text-red-500">*</span>
                    </label>
                    {/* Currency trigger button */}
                    <button
                      type="button"
                      onClick={() => {
                        setCurrencyOpen((o) => !o);
                        setCurrencySearch("");
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 border-2 rounded-lg transition-all bg-white text-left text-sm ${
                        currencyOpen
                          ? "border-blue-500 ring-2 ring-blue-100"
                          : "border-gray-200 hover:border-blue-300"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold w-7 text-center text-gray-700 leading-none">
                          {
                            CURRENCIES.find((c) => c.code === form.currency)
                              ?.symbol
                          }
                        </span>
                        <div>
                          <span className="font-semibold text-gray-900">
                            {form.currency}
                          </span>
                          <span className="text-gray-500 text-xs ml-1.5">
                            {
                              CURRENCIES.find((c) => c.code === form.currency)
                                ?.name
                            }
                          </span>
                        </div>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 text-gray-400 transition-transform duration-200 flex-shrink-0 ${
                          currencyOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {/* Inline expandable panel */}
                    {currencyOpen && (
                      <div className="mt-1.5 border border-gray-200 rounded-xl overflow-hidden shadow-md">
                        <div className="p-1.5 bg-gray-50 border-b border-gray-100">
                          <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                            <input
                              type="text"
                              autoFocus
                              value={currencySearch}
                              onChange={(e) =>
                                setCurrencySearch(e.target.value)
                              }
                              placeholder="Search code or name..."
                              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                        </div>
                        <div className="max-h-44 overflow-y-auto divide-y divide-gray-50">
                          {CURRENCIES.filter(
                            (c) =>
                              c.code
                                .toLowerCase()
                                .includes(currencySearch.toLowerCase()) ||
                              c.name
                                .toLowerCase()
                                .includes(currencySearch.toLowerCase()),
                          ).map((currency) => (
                            <button
                              key={currency.code}
                              type="button"
                              onClick={() => {
                                setForm({ ...form, currency: currency.code });
                                setCurrencyOpen(false);
                                setCurrencySearch("");
                              }}
                              className={`w-full flex items-center gap-2 px-3 py-2 hover:bg-blue-50 transition-colors text-left ${
                                form.currency === currency.code
                                  ? "bg-blue-50"
                                  : "bg-white"
                              }`}
                            >
                              <span className="text-base font-bold w-6 text-center text-gray-600 leading-none flex-shrink-0">
                                {currency.symbol}
                              </span>
                              <div className="flex-1 min-w-0">
                                <span className="font-semibold text-xs text-gray-900">
                                  {currency.code}
                                </span>
                                <span className="text-xs text-gray-500 ml-1.5 truncate">
                                  {currency.name}
                                </span>
                              </div>
                              {form.currency === currency.code && (
                                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                              )}
                            </button>
                          ))}
                          {CURRENCIES.filter(
                            (c) =>
                              c.code
                                .toLowerCase()
                                .includes(currencySearch.toLowerCase()) ||
                              c.name
                                .toLowerCase()
                                .includes(currencySearch.toLowerCase()),
                          ).length === 0 && (
                            <div className="py-5 text-center text-xs text-gray-400">
                              No currencies found
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 text-sm font-medium disabled:opacity-50"
                  >
                    {saving
                      ? "Saving..."
                      : editingId
                        ? "Update"
                        : "Add Account"}
                  </button>
                  <button
                    type="button"
                    onClick={closeForm}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Bank Accounts List */}
          {loading ? (
            <div className="text-center py-6 text-gray-500">Loading...</div>
          ) : bankAccounts.length === 0 ? (
            <div className="text-center py-8">
              <div className="bg-gray-100 rounded-full p-4 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                <CreditCard className="w-7 h-7 text-gray-400" />
              </div>
              <p className="text-gray-500 text-sm">
                No bank accounts linked yet.
              </p>
              <p className="text-gray-400 text-xs mt-1">
                Add a bank account to track which account money comes from.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {bankAccounts.map((ba) => (
                <div
                  key={ba._id}
                  className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow bg-white"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {ba.accountType === "credit" ? (
                        <CreditCard className="w-5 h-5 text-purple-500 flex-shrink-0" />
                      ) : ba.accountType === "cash" ? (
                        <Wallet className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                      ) : (
                        <Building2 className="w-5 h-5 text-blue-500 flex-shrink-0" />
                      )}
                      <div>
                        <p className="font-semibold text-gray-800 text-sm leading-tight">
                          {ba.name}
                          {ba.lastFourDigits && (
                            <span className="text-gray-400 font-normal">
                              {" "}
                              ···{ba.lastFourDigits}
                            </span>
                          )}
                        </p>
                        {ba.bankName && (
                          <p className="text-xs text-gray-500">{ba.bankName}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1 ml-2">
                      <button
                        onClick={() => openEditForm(ba)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(ba._id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${ACCOUNT_TYPE_COLORS[ba.accountType]}`}
                    >
                      {ACCOUNT_TYPE_LABELS[ba.accountType]}
                    </span>
                    <span className="text-sm font-bold text-gray-800">
                      {CURRENCIES.find((c) => c.code === (ba.currency || "USD"))
                        ?.symbol || "$"}
                      {(ba.balance || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
