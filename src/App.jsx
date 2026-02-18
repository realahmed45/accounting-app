import React, { useState, useEffect } from "react";
import { useAuth } from "./context/AuthContext";
import { useAccount } from "./context/AccountContext";
import AuthScreen from "./components/AuthScreen";
import AccountSwitcher from "./components/AccountSwitcher";
import PhotoUploadModal from "./components/PhotoUploadModal";
import { weekService, expenseService, photoService } from "./services/api";
import {
  DollarSign,
  Building2,
  Wallet,
  ArrowRightLeft,
  Receipt,
  CheckCircle2,
  BarChart3,
  Settings,
  Save,
  Lock,
  Unlock,
  X,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  History,
  Calendar,
  TrendingUp,
  FileText,
  Search,
  Camera,
  LogOut,
} from "lucide-react";

// ==================== UTILITY FUNCTIONS ====================

const getMonday = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.getFullYear(), d.getMonth(), diff);
};

const getWeekDates = (monday) => {
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(monday);
    date.setDate(date.getDate() + i);
    return date;
  });
};

const formatDate = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatDateReadable = (date) => {
  return new Date(date).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
};

const formatTime = (date) => {
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

// ==================== MAIN APP COMPONENT ====================

function App() {
  const { isAuthenticated, user, logout } = useAuth();
  const {
    currentAccount,
    accounts,
    categories,
    people,
    switchAccount,
    createAccount,
    loading: accountLoading,
  } = useAccount();

  // State Management
  const [weeks, setWeeks] = useState([]);
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0);
  const [expandedDays, setExpandedDays] = useState([formatDate(new Date())]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modal States
  const [activeModal, setActiveModal] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedHistoryWeek, setSelectedHistoryWeek] = useState(null);
  const [selectedExpenseForPhoto, setSelectedExpenseForPhoto] = useState(null);
  const [showCreateAccountModal, setShowCreateAccountModal] = useState(false);

  // Form States
  const [addCashAmount, setAddCashAmount] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [newAccountForm, setNewAccountForm] = useState({
    name: "",
    description: "",
  });
  const [expenseForm, setExpenseForm] = useState({
    date: formatDate(new Date()),
    amount: "",
    note: "",
    category: "",
    person: "",
    fromBank: false,
  });
  const [cashCheckForm, setCashCheckForm] = useState({
    person: "",
    pin: "",
    actualAmount: "",
  });
  const [unlockCode, setUnlockCode] = useState("123456");
  const [unlockWeekCode, setUnlockWeekCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Initialize form with first category and person when they load
  useEffect(() => {
    if (categories.length > 0 && !expenseForm.category) {
      setExpenseForm((prev) => ({ ...prev, category: categories[0].name }));
    }
    if (people.length > 0 && !expenseForm.person) {
      setExpenseForm((prev) => ({ ...prev, person: people[0].name }));
    }
  }, [categories, people]);

  // Load weeks when account changes
  useEffect(() => {
    if (currentAccount) {
      loadWeeks();
    }
  }, [currentAccount]);

  // Load expenses when week changes
  useEffect(() => {
    if (currentAccount && weeks.length > 0) {
      const currentWeek = weeks[currentWeekIndex];
      if (currentWeek) {
        loadExpenses(currentWeek._id);
      }
    }
  }, [currentWeekIndex, weeks, currentAccount]);

  const loadWeeks = async () => {
    if (!currentAccount) return;

    setLoading(true);
    try {
      const response = await weekService.getByAccount(currentAccount._id);
      if (response.success && response.data.length > 0) {
        setWeeks(response.data);
        setCurrentWeekIndex(0);
      } else {
        // No weeks exist, create first week
        await createFirstWeek();
      }
    } catch (error) {
      console.error("Error loading weeks:", error);
      // If no weeks, create one
      await createFirstWeek();
    }
    setLoading(false);
  };

  const createFirstWeek = async () => {
    if (!currentAccount) return;

    try {
      const monday = getMonday(new Date());
      const sunday = new Date(monday);
      sunday.setDate(sunday.getDate() + 6);

      const response = await weekService.create({
        accountId: currentAccount._id,
        startDate: formatDate(monday),
        endDate: formatDate(sunday),
        bankBalance: 0,
        cashBoxBalance: 0,
      });

      if (response.success) {
        setWeeks([response.data]);
        setCurrentWeekIndex(0);
      }
    } catch (error) {
      console.error("Error creating first week:", error);
      setError("Failed to create week");
    }
  };

  const loadExpenses = async (weekId) => {
    try {
      const response = await expenseService.getByWeek(weekId);
      if (response.success) {
        setExpenses(response.data);
      }
    } catch (error) {
      console.error("Error loading expenses:", error);
    }
  };

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    if (!newAccountForm.name.trim()) {
      setError("Account name is required");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const result = await createAccount(newAccountForm);

      if (result.success !== false) {
        setSuccess("Account created successfully!");
        setShowCreateAccountModal(false);
        setNewAccountForm({ name: "", description: "" });
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(result.message || "Failed to create account");
      }
    } catch (error) {
      console.error("Error creating account:", error);
      setError("Failed to create account");
    }
    setLoading(false);
  };

  // Show auth screen if not logged in
  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  // Show loading while account data loads
  if (accountLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your accounts...</p>
        </div>
      </div>
    );
  }

  // Show message if no accounts
  if (!currentAccount) {
    return (
      <>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
            <div className="bg-indigo-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Building2 className="w-8 h-8 text-indigo-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              No Accounts Yet
            </h2>
            <p className="text-gray-600 mb-6">
              You need to create an account to start tracking your expenses.
            </p>

            <div className="space-y-3">
              <button
                onClick={() => setShowCreateAccountModal(true)}
                className="w-full bg-indigo-600 text-white px-4 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Create Your First Account
              </button>

              <button
                onClick={logout}
                className="w-full bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Create Account Modal */}
        {showCreateAccountModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-800">
                  Create Account
                </h3>
                <button
                  onClick={() => {
                    setShowCreateAccountModal(false);
                    setNewAccountForm({ name: "", description: "" });
                    setError("");
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleCreateAccount} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Account Name *
                  </label>
                  <input
                    type="text"
                    value={newAccountForm.name}
                    onChange={(e) =>
                      setNewAccountForm({
                        ...newAccountForm,
                        name: e.target.value,
                      })
                    }
                    placeholder="e.g., Personal, Business, Project X"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    value={newAccountForm.description}
                    onChange={(e) =>
                      setNewAccountForm({
                        ...newAccountForm,
                        description: e.target.value,
                      })
                    }
                    placeholder="What is this account for?"
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus className="w-5 h-5" />
                        Create Account
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateAccountModal(false);
                      setNewAccountForm({ name: "", description: "" });
                      setError("");
                    }}
                    className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </>
    );
  }

  const currentWeek = weeks[currentWeekIndex];

  // ==================== CALCULATIONS ====================

  const getTotalExpenses = () => {
    return expenses.reduce((total, exp) => total + exp.amount, 0);
  };

  const getExpectedCashAmount = () => {
    if (!currentWeek) return 0;
    let cash = currentWeek.cashBoxBalance;
    expenses.forEach((exp) => {
      if (!exp.fromBank) {
        cash -= exp.amount;
      }
    });
    return cash;
  };

  const getExpectedBankAmount = () => {
    if (!currentWeek) return 0;
    let bank = currentWeek.bankBalance;
    expenses.forEach((exp) => {
      if (exp.fromBank) {
        bank -= exp.amount;
      }
    });
    return bank;
  };

  // ==================== ACTION HANDLERS ====================

  const handleAddCash = async () => {
    const amount = parseFloat(addCashAmount);
    if (isNaN(amount) || amount <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    try {
      const response = await weekService.update(currentWeek._id, {
        cashBoxBalance: currentWeek.cashBoxBalance + amount,
      });

      if (response.success) {
        const updatedWeeks = [...weeks];
        updatedWeeks[currentWeekIndex] = response.data;
        setWeeks(updatedWeeks);
        setAddCashAmount("");
        setActiveModal(null);
        setSuccess("Cash added successfully!");
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (error) {
      setError(error.response?.data?.message || "Failed to add cash");
    }
  };

  const handleTransferToCash = async () => {
    const amount = parseFloat(transferAmount);
    if (isNaN(amount) || amount <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    if (amount > getExpectedBankAmount()) {
      setError("Insufficient bank balance");
      return;
    }

    try {
      const response = await weekService.update(currentWeek._id, {
        bankBalance: currentWeek.bankBalance - amount,
        cashBoxBalance: currentWeek.cashBoxBalance + amount,
      });

      if (response.success) {
        const updatedWeeks = [...weeks];
        updatedWeeks[currentWeekIndex] = response.data;
        setWeeks(updatedWeeks);
        setTransferAmount("");
        setActiveModal(null);
        setSuccess("Transfer completed!");
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (error) {
      setError(error.response?.data?.message || "Failed to transfer");
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();

    const amount = parseFloat(expenseForm.amount);
    if (isNaN(amount) || amount <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    if (!expenseForm.category || !expenseForm.person) {
      setError("Please select category and person");
      return;
    }

    try {
      const response = await expenseService.create({
        accountId: currentAccount._id,
        weekId: currentWeek._id,
        date: expenseForm.date,
        amount: amount,
        category: expenseForm.category,
        person: expenseForm.person,
        note: expenseForm.note,
        fromBank: expenseForm.fromBank,
      });

      if (response.success) {
        setExpenses([response.data, ...expenses]);
        setExpenseForm({
          date: formatDate(new Date()),
          amount: "",
          note: "",
          category: categories[0]?.name || "",
          person: people[0]?.name || "",
          fromBank: false,
        });
        setActiveModal(null);
        setSuccess("Expense added successfully!");
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (error) {
      setError(error.response?.data?.message || "Failed to add expense");
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    if (!window.confirm("Are you sure you want to delete this expense?")) {
      return;
    }

    try {
      const response = await expenseService.delete(expenseId);
      if (response.success) {
        setExpenses(expenses.filter((exp) => exp._id !== expenseId));
        setSuccess("Expense deleted successfully!");
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (error) {
      setError(error.response?.data?.message || "Failed to delete expense");
    }
  };

  const handleLockWeek = async () => {
    if (unlockCode !== unlockWeekCode) {
      setError("Invalid unlock code");
      return;
    }

    try {
      const response = await weekService.lock(currentWeek._id);
      if (response.success) {
        const updatedWeeks = [...weeks];
        updatedWeeks[currentWeekIndex] = response.data;
        setWeeks(updatedWeeks);
        setUnlockWeekCode("");
        setActiveModal(null);
        setSuccess("Week locked successfully!");
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (error) {
      setError(error.response?.data?.message || "Failed to lock week");
    }
  };

  const createNewWeek = async () => {
    if (!currentWeek) return;

    const lastEndDate = new Date(currentWeek.endDate);
    const newStartDate = new Date(lastEndDate);
    newStartDate.setDate(newStartDate.getDate() + 1);
    const newEndDate = new Date(newStartDate);
    newEndDate.setDate(newEndDate.getDate() + 6);

    try {
      const response = await weekService.create({
        accountId: currentAccount._id,
        startDate: formatDate(newStartDate),
        endDate: formatDate(newEndDate),
        bankBalance: getExpectedBankAmount(),
        cashBoxBalance: getExpectedCashAmount(),
      });

      if (response.success) {
        setWeeks([response.data, ...weeks]);
        setCurrentWeekIndex(0);
        setSuccess("New week created!");
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (error) {
      setError(error.response?.data?.message || "Failed to create week");
    }
  };

  const toggleDayExpansion = (date) => {
    setExpandedDays((prev) =>
      prev.includes(date) ? prev.filter((d) => d !== date) : [...prev, date],
    );
  };

  const getExpensesForDate = (date) => {
    return expenses.filter((exp) => {
      const expDate = formatDate(new Date(exp.date));
      return expDate === date;
    });
  };

  const getDayTotal = (date) => {
    return getExpensesForDate(date).reduce((sum, exp) => sum + exp.amount, 0);
  };

  // ==================== RENDER ====================

  if (!currentWeek) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <Calendar className="w-16 h-16 text-indigo-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            No Weeks Created
          </h2>
          <p className="text-gray-600 mb-6">
            Create your first week to start tracking expenses.
          </p>
          <button
            onClick={createFirstWeek}
            className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
            disabled={loading}
          >
            <Plus className="w-5 h-5" />
            {loading ? "Creating..." : "Create First Week"}
          </button>
        </div>
      </div>
    );
  }

  const weekStartDate = new Date(currentWeek.startDate);
  const weekEndDate = new Date(currentWeek.endDate);
  const weekDates = getWeekDates(weekStartDate);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-3 rounded-xl shadow-lg">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  Weekly Accounting
                </h1>
                <p className="text-sm text-gray-500">
                  Welcome, {user?.firstName}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <AccountSwitcher />
              <button
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="max-w-7xl mx-auto px-4 mt-4">
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            {success}
          </div>
        </div>
      )}

      {error && (
        <div className="max-w-7xl mx-auto px-4 mt-4">
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
            <button onClick={() => setError("")} className="ml-auto">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Week Navigation */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">
              Week {currentWeekIndex + 1} of {weeks.length}
            </h2>
            {currentWeek.isLocked && (
              <span className="flex items-center gap-2 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
                <Lock className="w-4 h-4" />
                Locked
              </span>
            )}
          </div>

          <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
            <span>
              {formatDateReadable(weekStartDate)} -{" "}
              {formatDateReadable(weekEndDate)}
            </span>
          </div>

          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() =>
                setCurrentWeekIndex(Math.max(0, currentWeekIndex - 1))
              }
              disabled={currentWeekIndex === weeks.length - 1}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Previous Week
            </button>
            <button
              onClick={() =>
                setCurrentWeekIndex(
                  Math.min(weeks.length - 1, currentWeekIndex + 1),
                )
              }
              disabled={currentWeekIndex === 0}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next Week →
            </button>
            {currentWeekIndex === 0 && !currentWeek.isLocked && (
              <button
                onClick={createNewWeek}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                New Week
              </button>
            )}
            {!currentWeek.isLocked && (
              <button
                onClick={() => setActiveModal("lockWeek")}
                className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 flex items-center gap-2 ml-auto"
              >
                <Lock className="w-4 h-4" />
                Lock Week
              </button>
            )}
          </div>
        </div>

        {/* Financial Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Bank Balance</span>
              <Building2 className="w-5 h-5 text-blue-500" />
            </div>
            <div className="text-3xl font-bold text-gray-800">
              ${getExpectedBankAmount().toFixed(2)}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              Initial: ${currentWeek.bankBalance.toFixed(2)}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Cash Box</span>
              <Wallet className="w-5 h-5 text-green-500" />
            </div>
            <div className="text-3xl font-bold text-gray-800">
              ${getExpectedCashAmount().toFixed(2)}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              Initial: ${currentWeek.cashBoxBalance.toFixed(2)}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Total Expenses</span>
              <Receipt className="w-5 h-5 text-red-500" />
            </div>
            <div className="text-3xl font-bold text-gray-800">
              ${getTotalExpenses().toFixed(2)}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              {expenses.length} transactions
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {!currentWeek.isLocked && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <button
              onClick={() => setActiveModal("addCash")}
              className="bg-white p-4 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-3 justify-center"
            >
              <DollarSign className="w-5 h-5 text-green-600" />
              <span className="font-semibold">Add Cash to Box</span>
            </button>

            <button
              onClick={() => setActiveModal("transfer")}
              className="bg-white p-4 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-3 justify-center"
            >
              <ArrowRightLeft className="w-5 h-5 text-blue-600" />
              <span className="font-semibold">Bank → Cash</span>
            </button>

            <button
              onClick={() => setActiveModal("addExpense")}
              className="bg-white p-4 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-3 justify-center"
            >
              <Receipt className="w-5 h-5 text-purple-600" />
              <span className="font-semibold">Add Expense</span>
            </button>
          </div>
        )}

        {/* Daily Breakdown */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            Daily Breakdown
          </h3>

          <div className="space-y-3">
            {weekDates.map((date) => {
              const dateStr = formatDate(date);
              const dayExpenses = getExpensesForDate(dateStr);
              const dayTotal = getDayTotal(dateStr);
              const isExpanded = expandedDays.includes(dateStr);

              return (
                <div
                  key={dateStr}
                  className="border border-gray-200 rounded-xl overflow-hidden"
                >
                  <button
                    onClick={() => toggleDayExpansion(dateStr)}
                    className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 flex items-center justify-between transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <span className="font-semibold text-gray-700">
                        {formatDateReadable(date)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-gray-900">
                        ${dayTotal.toFixed(2)}
                      </span>
                      <span className="text-xs text-gray-500">
                        ({dayExpenses.length})
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="p-4 bg-white space-y-2">
                      {dayExpenses.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">
                          No expenses for this day
                        </p>
                      ) : (
                        dayExpenses.map((expense) => (
                          <div
                            key={expense._id}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-gray-800">
                                  ${expense.amount.toFixed(2)}
                                </span>
                                <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 text-xs rounded-full">
                                  {expense.category}
                                </span>
                                <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
                                  {expense.person}
                                </span>
                                {expense.fromBank && (
                                  <Building2
                                    className="w-4 h-4 text-blue-500"
                                    title="From Bank"
                                  />
                                )}
                              </div>
                              {expense.note && (
                                <p className="text-sm text-gray-600">
                                  {expense.note}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() =>
                                  setSelectedExpenseForPhoto(expense)
                                }
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="View/Upload Photos"
                              >
                                <Camera className="w-4 h-4" />
                              </button>
                              {!currentWeek.isLocked && (
                                <button
                                  onClick={() =>
                                    handleDeleteExpense(expense._id)
                                  }
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Delete"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modals */}
      {activeModal === "addCash" && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">
                Add Cash to Box
              </h3>
              <button
                onClick={() => setActiveModal(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <input
              type="number"
              value={addCashAmount}
              onChange={(e) => setAddCashAmount(e.target.value)}
              placeholder="Enter amount"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <div className="flex gap-3">
              <button
                onClick={handleAddCash}
                className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Add Cash
              </button>
              <button
                onClick={() => setActiveModal(null)}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {activeModal === "transfer" && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">
                Transfer Bank → Cash
              </h3>
              <button
                onClick={() => setActiveModal(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600">
                Available in bank:{" "}
                <span className="font-bold text-gray-800">
                  ${getExpectedBankAmount().toFixed(2)}
                </span>
              </p>
            </div>
            <input
              type="number"
              value={transferAmount}
              onChange={(e) => setTransferAmount(e.target.value)}
              placeholder="Enter amount to transfer"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <div className="flex gap-3">
              <button
                onClick={handleTransferToCash}
                className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Transfer
              </button>
              <button
                onClick={() => setActiveModal(null)}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {activeModal === "addExpense" && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 my-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">Add Expense</h3>
              <button
                onClick={() => setActiveModal(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddExpense} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={expenseForm.date}
                  onChange={(e) =>
                    setExpenseForm({ ...expenseForm, date: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={expenseForm.amount}
                  onChange={(e) =>
                    setExpenseForm({ ...expenseForm, amount: e.target.value })
                  }
                  placeholder="0.00"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={expenseForm.category}
                  onChange={(e) =>
                    setExpenseForm({ ...expenseForm, category: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                >
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Person
                </label>
                <select
                  value={expenseForm.person}
                  onChange={(e) =>
                    setExpenseForm({ ...expenseForm, person: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                >
                  {people.map((person) => (
                    <option key={person._id} value={person.name}>
                      {person.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Note (optional)
                </label>
                <textarea
                  value={expenseForm.note}
                  onChange={(e) =>
                    setExpenseForm({ ...expenseForm, note: e.target.value })
                  }
                  placeholder="Add a note..."
                  rows="2"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="fromBank"
                  checked={expenseForm.fromBank}
                  onChange={(e) =>
                    setExpenseForm({
                      ...expenseForm,
                      fromBank: e.target.checked,
                    })
                  }
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <label
                  htmlFor="fromBank"
                  className="text-sm text-gray-700 flex items-center gap-2"
                >
                  <Building2 className="w-4 h-4" />
                  Pay from Bank
                </label>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Add Expense
                </button>
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeModal === "lockWeek" && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">Lock Week</h3>
              <button
                onClick={() => setActiveModal(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-gray-600 mb-4">
              Enter the unlock code to lock this week. Once locked, no changes
              can be made.
            </p>
            <input
              type="password"
              value={unlockWeekCode}
              onChange={(e) => setUnlockWeekCode(e.target.value)}
              placeholder="Enter unlock code"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <div className="flex gap-3">
              <button
                onClick={handleLockWeek}
                className="flex-1 bg-yellow-500 text-white px-6 py-3 rounded-lg hover:bg-yellow-600 transition-colors flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4" />
                Lock Week
              </button>
              <button
                onClick={() => setActiveModal(null)}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Account Modal */}
      {showCreateAccountModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-800">
                Create Account
              </h3>
              <button
                onClick={() => {
                  setShowCreateAccountModal(false);
                  setNewAccountForm({ name: "", description: "" });
                  setError("");
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleCreateAccount} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Name *
                </label>
                <input
                  type="text"
                  value={newAccountForm.name}
                  onChange={(e) =>
                    setNewAccountForm({
                      ...newAccountForm,
                      name: e.target.value,
                    })
                  }
                  placeholder="e.g., Personal, Business, Project X"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={newAccountForm.description}
                  onChange={(e) =>
                    setNewAccountForm({
                      ...newAccountForm,
                      description: e.target.value,
                    })
                  }
                  placeholder="What is this account for?"
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5" />
                      Create Account
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateAccountModal(false);
                    setNewAccountForm({ name: "", description: "" });
                    setError("");
                  }}
                  className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedExpenseForPhoto && (
        <PhotoUploadModal
          expenseId={selectedExpenseForPhoto._id}
          onClose={() => setSelectedExpenseForPhoto(null)}
        />
      )}
    </div>
  );
}

export default App;
