import React, { useState, useEffect } from "react";
import { useAuth } from "./context/AuthContext";
import { useAccount } from "./context/AccountContext";
import AuthScreen from "./components/AuthScreen";
import AccountSwitcher from "./components/AccountSwitcher";
import PhotoUploadModal from "./components/PhotoUploadModal";
import PasswordGate from "./components/PasswordGate";
import ScheduleScreen from "./components/schedule/ScheduleScreen";
import Header from "./components/layout/Header";
import NotificationBanner from "./components/layout/NotificationBanner";
import ToastNotification from "./components/layout/ToastNotification";
import NotificationCenter from "./components/NotificationCenter";
import NotificationSettings from "./components/NotificationSettings";
import FinancialOverview from "./components/dashboard/FinancialOverview";
import DailyBreakdown from "./components/dashboard/DailyBreakdown";
import SettingsScreen from "./components/settings/SettingsScreen";
import {
  weekService,
  expenseService,
  photoService,
  bankAccountService,
  accountService,
} from "./services/api";
import {
  BUSINESS_CATEGORIES,
  getCategoryList,
  getSubcategories,
} from "./config/categories";
import {
  DollarSign,
  Building2,
  Wallet,
  ArrowRightLeft,
  Receipt,
  CreditCard,
  CheckCircle2,
  BarChart3,
  Settings,
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
  Camera,
  Lock,
  FileText,
  LogOut,
  User,
  Users,
  Search,
  Edit,
} from "lucide-react";

// ==================== CURRENCIES ====================

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

const getCurrencySymbol = (currencyCode) => {
  const currency = CURRENCIES.find((c) => c.code === currencyCode);
  return currency?.symbol || "$";
};

const formatAmount = (amount, currencyCode) => {
  const symbol = getCurrencySymbol(currencyCode);
  return `${symbol}${amount.toFixed(2)}`;
};

// ==================== MAIN APP COMPONENT ====================

function App() {
  const { isAuthenticated, user, logout } = useAuth();
  const {
    currentAccount,
    accounts,
    categories,
    people,
    currentMember,
    hasPermission,
    switchAccount,
    createAccount,
    addCategory,
    refreshAccounts,
    loading: accountLoading,
  } = useAccount();

  // State Management
  const [weeks, setWeeks] = useState([]);
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0);
  const [expandedDays, setExpandedDays] = useState([formatDate(new Date())]);
  const [expenses, setExpenses] = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [dailyActivity, setDailyActivity] = useState(null);

  // Modal States
  const [activeModal, setActiveModal] = useState(null);
  const [showHistoryTab, setShowHistoryTab] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedHistoryWeek, setSelectedHistoryWeek] = useState(null);
  const [selectedExpenseForPhoto, setSelectedExpenseForPhoto] = useState(null);
  const [showCreateAccountModal, setShowCreateAccountModal] = useState(false);
  const [showNotificationCenter, setShowNotificationCenter] = useState(false);
  const [showNotificationSettings, setShowNotificationSettings] =
    useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [highlightNotificationId, setHighlightNotificationId] = useState(null);

  const openNotificationCenter = (notificationId = null) => {
    setHighlightNotificationId(notificationId);
    setShowNotificationCenter(true);
  };

  // Form States
  const [addCashAmount, setAddCashAmount] = useState("");
  const [addCashNote, setAddCashNote] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [selectedBankAccountForTransfer, setSelectedBankAccountForTransfer] =
    useState("");
  const [bankAccountForm, setBankAccountForm] = useState({
    name: "",
    bankName: "",
    accountType: "checking",
    lastFourDigits: "",
    balance: "",
    currency: "",
  });

  const [bulkBalanceUpdates, setBulkBalanceUpdates] = useState({});
  const [topUpAmount, setTopUpAmount] = useState("");
  const [topUpReason, setTopUpReason] = useState("");
  const [selectedBankForTopUp, setSelectedBankForTopUp] = useState(null);
  const [accountKind, setAccountKind] = useState(""); // "personal" | "business"
  const [personalDescription, setPersonalDescription] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [customDescription, setCustomDescription] = useState("");
  const [expenseForm, setExpenseForm] = useState({
    date: formatDate(new Date()),
    amount: "",
    note: "",
    category: "",
    bankAccountId: "",
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
  const [statusModal, setStatusModal] = useState({
    show: false,
    type: "",
    message: "",
  });
  const [loadingMessage, setLoadingMessage] = useState("");
  const [pendingGateAction, setPendingGateAction] = useState(null);
  const [baCurrencyOpen, setBaCurrencyOpen] = useState(false);
  const [baCurrencySearch, setBaCurrencySearch] = useState("");
  const [passwordGateOpen, setPasswordGateOpen] = useState(false);

  // Initialize form with first category when it loads
  useEffect(() => {
    if (categories.length > 0 && !expenseForm.category) {
      setExpenseForm((prev) => ({ ...prev, category: categories[0].name }));
    }
  }, [categories]);

  // Load weeks & bank accounts when account changes
  useEffect(() => {
    if (currentAccount) {
      loadWeeks();
      loadBankAccounts();
    }
  }, [currentAccount]);

  const loadBankAccounts = async () => {
    if (!currentAccount) return;
    try {
      const res = await bankAccountService.getAll(currentAccount._id);
      if (res.success) setBankAccounts(res.data);
    } catch (err) {
      console.error("Failed to load bank accounts:", err);
    }
  };

  const runIfAllowed = (fn) => {
    if (currentMember?.viewOnly) {
      setPendingGateAction(() => fn);
      setPasswordGateOpen(true);
    } else {
      fn();
    }
  };

  // Load expenses when week changes
  useEffect(() => {
    if (currentAccount && weeks.length > 0) {
      const currentWeek = weeks[currentWeekIndex];
      if (currentWeek) {
        loadExpenses(currentWeek._id);
        loadDailyActivity(currentWeek._id);
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
      // Create week containing today's date
      const today = new Date();
      const monday = getMonday(today);
      const sunday = new Date(monday);
      sunday.setDate(sunday.getDate() + 6);

      console.log(
        `📅 Creating first week: ${formatDate(monday)} to ${formatDate(sunday)} (today: ${formatDate(today)})`,
      );

      const response = await weekService.create({
        accountId: currentAccount._id,
        startDate: formatDate(monday),
        endDate: formatDate(sunday),
        cashBoxBalance: 0,
      });

      if (response.success) {
        setWeeks([response.data]);
        setCurrentWeekIndex(0);
        console.log(`✅ First week created successfully`);
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

  const loadDailyActivity = async (weekId) => {
    try {
      if (!currentAccount) return;
      console.log(`📊 Loading daily activity for week ${weekId}...`);
      const response = await accountService.getDailyActivity(
        currentAccount._id,
        { weekId },
      );
      if (response.success) {
        console.log(`✅ Daily activity loaded:`, response.data);
        console.log(`   - Days with data: ${response.data.daily.length}`);
        console.log(
          `   - Total expenses: ${response.data.summary.totalExpenses}`,
        );
        console.log(`   - Total shifts: ${response.data.summary.totalShifts}`);
        console.log(
          `   - Total check-ins: ${response.data.summary.totalCheckIns}`,
        );
        console.log(
          `   - Total work logs: ${response.data.summary.totalWorkLogs}`,
        );
        console.log(
          `   - Total activities: ${response.data.summary.totalActivities}`,
        );
        setDailyActivity(response.data.daily);
      }
    } catch (error) {
      console.error("❌ Error loading daily activity:", error);
      // Fallback to no daily activity (will use old expense display)
      setDailyActivity(null);
    }
  };

  const resetAccountForm = () => {
    setAccountKind("business");
    setPersonalDescription("");
    setSelectedCategory("");
    setSelectedSubcategory("");
    setCustomDescription("");
    setError("");
  };

  const handleCreateAccount = async (e) => {
    e.preventDefault();

    if (accountKind === "personal") {
      // Personal account — no category required
      setLoading(true);
      setError("");
      try {
        const result = await createAccount({
          accountType: "personal",
          accountName: personalDescription.trim() || "Personal",
          description: personalDescription.trim(),
        });
        if (result.success !== false) {
          setSuccess("Account created successfully!");
          setShowCreateAccountModal(false);
          resetAccountForm();
          setTimeout(() => setSuccess(""), 3000);
        } else {
          setError(result.message || "Failed to create account");
        }
      } catch (err) {
        setError("Failed to create account");
      }
      setLoading(false);
      return;
    }

    // Business account
    if (!selectedCategory) {
      setError("Category is required");
      return;
    }
    if (selectedCategory === "Other" && !customDescription.trim()) {
      setError("Custom description is required for Other category");
      return;
    }
    if (selectedCategory !== "Other" && !selectedSubcategory) {
      setError("Subcategory is required");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const accountData = {
        accountType: "business",
        category: selectedCategory,
        subcategory: selectedSubcategory || null,
        customDescription:
          selectedCategory === "Other" ? customDescription : null,
        accountName:
          selectedCategory === "Other"
            ? customDescription
            : selectedSubcategory || selectedCategory,
      };

      const result = await createAccount(accountData);

      if (result.success !== false) {
        setSuccess("Account created successfully!");
        setShowCreateAccountModal(false);
        resetAccountForm();
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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-14 w-14 border-b-3 border-slate-900 mx-auto mb-4"></div>
          <p className="text-slate-600 text-lg font-medium">
            Loading your accounts...
          </p>
        </div>
      </div>
    );
  }

  // Show message if no accounts
  if (!currentAccount) {
    return (
      <>
        <div className="min-h-screen bg-white flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 shadow-lg rounded-2xl p-12 max-w-lg w-full text-center">
            <div className="bg-slate-100 rounded-2xl p-5 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
              <Building2 className="w-10 h-10 text-slate-700" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-3">
              No Accounts Yet
            </h2>
            <p className="text-slate-600 mb-8 text-lg">
              You need to create an account to start tracking your expenses.
            </p>

            <div className="space-y-3">
              <button
                onClick={() => setShowCreateAccountModal(true)}
                className="w-full bg-indigo-600 text-white px-4 py-3 hover:bg-indigo-700 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Create Your First Account
              </button>

              <button
                onClick={logout}
                className="w-full bg-gray-200 text-gray-700 px-4 py-2 hover:bg-gray-300 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Create Account Modal */}
        {showCreateAccountModal && (
          <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-[60] animate-fadeIn">
            <div className="bg-white shadow-2xl rounded-2xl p-8 max-w-md w-full transform transition-all animate-slideUp">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  {accountKind === ""
                    ? "Create Account"
                    : accountKind === "personal"
                      ? "Personal Account"
                      : "Business Account"}
                </h3>
                <button
                  onClick={() => {
                    setShowCreateAccountModal(false);
                    resetAccountForm();
                  }}
                  className="text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg p-2 transition-all duration-200"
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

              {/* Business Account Form */}
              <form onSubmit={handleCreateAccount} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => {
                      setSelectedCategory(e.target.value);
                      setSelectedSubcategory("");
                      setCustomDescription("");
                    }}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 hover:border-gray-300 font-medium"
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
                  <div className="animate-slideDown">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Subcategory <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={selectedSubcategory}
                      onChange={(e) => setSelectedSubcategory(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 hover:border-gray-300 font-medium"
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
                  <div className="animate-slideDown">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Business Description{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={customDescription}
                      onChange={(e) => setCustomDescription(e.target.value)}
                      placeholder="Describe your business..."
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 hover:border-gray-300"
                      required
                    />
                  </div>
                )}
                <div className="pt-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus className="w-5 h-5" />
                        Create Account
                      </>
                    )}
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

  const getTotalBankBalance = () => {
    return bankAccounts.reduce(
      (total, account) => total + (account.balance || 0),
      0,
    );
  };

  const getExpectedBankAmount = () => {
    return getTotalBankBalance();
  };

  const getTotalExpenses = () => {
    return expenses.reduce((total, exp) => total + exp.amount, 0);
  };

  const getExpectedCashAmount = () => {
    if (!currentWeek) return 0;
    return currentWeek.cashBoxBalance;
  };

  // ==================== ACTION HANDLERS ====================

  // No additional helper needed, using runIfAllowed defined above.

  const handleAddCash = async () =>
    runIfAllowed(async () => {
      const amount = parseFloat(addCashAmount);
      if (isNaN(amount) || amount <= 0) {
        setError("Please enter a valid amount");
        return;
      }

      try {
        const response = await weekService.addCash(
          currentWeek._id,
          amount,
          addCashNote.trim(),
        );

        if (response.success) {
          const updatedWeeks = [...weeks];
          updatedWeeks[currentWeekIndex] = response.data;
          setWeeks(updatedWeeks);
          setAddCashAmount("");
          setAddCashNote("");
          setActiveModal(null);
          setStatusModal({
            show: true,
            type: "success",
            message: "Cash added successfully!",
          });
          setTimeout(
            () => setStatusModal({ show: false, type: "", message: "" }),
            10000,
          );
        }
      } catch (error) {
        const errorMsg = error.response?.data?.message || "Failed to add cash";
        setStatusModal({ show: true, type: "error", message: errorMsg });
        setTimeout(
          () => setStatusModal({ show: false, type: "", message: "" }),
          10000,
        );
      } finally {
        setLoading(false);
      }
    });

  const handleTransferToCash = async () =>
    runIfAllowed(async () => {
      const amount = parseFloat(transferAmount);
      if (isNaN(amount) || amount <= 0) {
        setError("Please enter a valid amount");
        return;
      }

      if (!selectedBankAccountForTransfer) {
        setError("Please select a bank account");
        return;
      }

      const selectedBank = bankAccounts.find(
        (ba) => ba._id === selectedBankAccountForTransfer,
      );
      if (selectedBank && amount > selectedBank.balance) {
        setError("Insufficient bank account balance");
        return;
      }

      setLoading(true);
      setLoadingMessage("Transferring funds...");
      try {
        const response = await weekService.transferBankToCash(currentWeek._id, {
          bankAccountId: selectedBankAccountForTransfer,
          amount: amount,
        });

        if (response.success) {
          // Update week
          const updatedWeeks = [...weeks];
          updatedWeeks[currentWeekIndex] = response.data.week;
          setWeeks(updatedWeeks);

          // Update bank accounts list
          await loadBankAccounts();

          setTransferAmount("");
          setSelectedBankAccountForTransfer("");
          setActiveModal(null);
          setStatusModal({
            show: true,
            type: "success",
            message: "Bank to cash transfer completed successfully!",
          });
          setTimeout(
            () => setStatusModal({ show: false, type: "", message: "" }),
            10000,
          );
        }
      } catch (error) {
        const errorMsg = error.response?.data?.message || "Failed to transfer";
        setStatusModal({ show: true, type: "error", message: errorMsg });
        setTimeout(
          () => setStatusModal({ show: false, type: "", message: "" }),
          10000,
        );
      } finally {
        setLoading(false);
      }
    });

  const handleAddExpense = async (e) => {
    if (e) e.preventDefault();
    runIfAllowed(async () => {
      const amount = parseFloat(expenseForm.amount);
      if (isNaN(amount) || amount <= 0) {
        setError("Please enter a valid amount");
        return;
      }

      if (!expenseForm.category) {
        setError("Please select category");
        return;
      }

      // Determine payment source
      const paymentSource = expenseForm.bankAccountId ? "bank" : "cash";

      setLoading(true);
      setLoadingMessage("Adding expense...");
      try {
        const response = await expenseService.create({
          accountId: currentAccount._id,
          weekId: currentWeek._id,
          date: expenseForm.date,
          amount: amount,
          category: expenseForm.category,
          note: expenseForm.note,
          paymentSource: paymentSource,
          bankAccountId: expenseForm.bankAccountId || null,
        });

        if (response.success) {
          setExpenses([response.data, ...expenses]);

          // Reload week and bank accounts to reflect updated balances
          await loadWeeks();
          await loadBankAccounts();

          setExpenseForm({
            date: formatDate(new Date()),
            amount: "",
            note: "",
            category: categories[0]?.name || "",
            bankAccountId: "",
          });
          setActiveModal(null);
          setStatusModal({
            show: true,
            type: "success",
            message: "Expense added successfully!",
          });
          setTimeout(
            () => setStatusModal({ show: false, type: "", message: "" }),
            10000,
          );
        }
      } catch (error) {
        const errorMsg =
          error.response?.data?.message || "Failed to add expense";
        setStatusModal({ show: true, type: "error", message: errorMsg });
        setTimeout(
          () => setStatusModal({ show: false, type: "", message: "" }),
          10000,
        );
      }
    }); // end runIfAllowed
  };

  const handleDeleteExpense = async (expenseId) =>
    runIfAllowed(async () => {
      if (!window.confirm("Are you sure you want to delete this expense?")) {
        return;
      }

      setLoading(true);
      setLoadingMessage("Deleting expense...");
      try {
        const response = await expenseService.delete(expenseId);
        if (response.success) {
          // Reload expenses from server to reflect deletion
          if (currentWeek?._id) {
            await loadExpenses(currentWeek._id);
          }

          // Reload week and bank accounts to reflect updated balances
          await loadWeeks();
          await loadBankAccounts();

          setStatusModal({
            show: true,
            type: "success",
            message: "Expense deleted successfully!",
          });
          setTimeout(
            () => setStatusModal({ show: false, type: "", message: "" }),
            10000,
          );
        }
      } catch (error) {
        const errorMsg =
          error.response?.data?.message || "Failed to delete expense";
        setStatusModal({ show: true, type: "error", message: errorMsg });
        setTimeout(
          () => setStatusModal({ show: false, type: "", message: "" }),
          10000,
        );
      }
    });

  const handleLockWeek = async () =>
    runIfAllowed(async () => {
      if (unlockCode !== unlockWeekCode) {
        setError("Invalid unlock code");
        return;
      }

      setLoading(true);
      setLoadingMessage("Locking week...");
      try {
        const response = await weekService.lock(currentWeek._id);
        if (response.success) {
          const updatedWeeks = [...weeks];
          updatedWeeks[currentWeekIndex] = response.data;
          setWeeks(updatedWeeks);
          setUnlockWeekCode("");
          setActiveModal(null);
          setStatusModal({
            show: true,
            type: "success",
            message: "Week locked successfully!",
          });
          setTimeout(
            () => setStatusModal({ show: false, type: "", message: "" }),
            10000,
          );
        }
      } catch (error) {
        const errorMsg = error.response?.data?.message || "Failed to lock week";
        setStatusModal({ show: true, type: "error", message: errorMsg });
        setTimeout(
          () => setStatusModal({ show: false, type: "", message: "" }),
          10000,
        );
      }
    });

  const createNewWeek = async () =>
    runIfAllowed(async () => {
      if (!currentWeek) return;

      const lastEndDate = new Date(currentWeek.endDate);
      const newStartDate = new Date(lastEndDate);
      newStartDate.setDate(newStartDate.getDate() + 1);
      const newEndDate = new Date(newStartDate);
      newEndDate.setDate(newEndDate.getDate() + 6);

      setLoading(true);
      setLoadingMessage("Creating new week...");
      try {
        const response = await weekService.create({
          accountId: currentAccount._id,
          startDate: formatDate(newStartDate),
          endDate: formatDate(newEndDate),
          cashBoxBalance: getExpectedCashAmount(),
        });

        if (response.success) {
          setWeeks([response.data, ...weeks]);
          setCurrentWeekIndex(0);
          setStatusModal({
            show: true,
            type: "success",
            message: "New week created successfully!",
          });
          setTimeout(
            () => setStatusModal({ show: false, type: "", message: "" }),
            10000,
          );
        }
      } catch (error) {
        const errorMsg =
          error.response?.data?.message || "Failed to create week";
        setStatusModal({ show: true, type: "error", message: errorMsg });
        setTimeout(
          () => setStatusModal({ show: false, type: "", message: "" }),
          10000,
        );
      }
    });

  const handleSaveBankAccount = async (e) => {
    if (e) e.preventDefault();
    runIfAllowed(async () => {
      if (!bankAccountForm.name.trim()) {
        setError("Account name is required");
        return;
      }

      if (
        bankAccountForm.lastFourDigits &&
        !/^\d{1,4}$/.test(bankAccountForm.lastFourDigits)
      ) {
        setError("Last 4 digits must be numeric (max 4 characters)");
        return;
      }

      // Require currency when creating first bank account
      if (bankAccounts.length === 0 && !bankAccountForm.currency) {
        setError("Please select a currency for your first bank account");
        return;
      }

      // For subsequent banks, use account currency
      if (bankAccounts.length > 0 && !currentAccount?.currency) {
        setError("Account currency not set. Please contact support.");
        return;
      }

      setLoading(true);
      setError("");

      try {
        const payload = {
          name: bankAccountForm.name.trim(),
          bankName: bankAccountForm.bankName.trim(),
          accountType: bankAccountForm.accountType,
          lastFourDigits: bankAccountForm.lastFourDigits.trim(),
          balance: parseFloat(bankAccountForm.balance) || 0,
          currency:
            bankAccounts.length === 0
              ? bankAccountForm.currency
              : currentAccount.currency,
        };

        const res = await bankAccountService.create(
          currentAccount._id,
          payload,
        );

        if (res.success) {
          await Promise.all([loadBankAccounts(), refreshAccounts()]);
          setBankAccountForm({
            name: "",
            bankName: "",
            accountType: "checking",
            lastFourDigits: "",
            balance: "",
            currency: "",
          });
          setActiveModal(null);
          setStatusModal({
            show: true,
            type: "success",
            message: "Bank account added successfully!",
          });
          setTimeout(
            () => setStatusModal({ show: false, type: "", message: "" }),
            10000,
          );
        } else {
          setError(res.message || "Failed to save");
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to save bank account");
      }
      setLoading(false);
    }); // end runIfAllowed
  };

  const handleBulkBalanceUpdate = async () =>
    runIfAllowed(async () => {
      const updates = Object.entries(bulkBalanceUpdates).filter(
        ([bankId, data]) =>
          data.newBalance !== undefined && data.newBalance !== "",
      );

      if (updates.length === 0) {
        setError("No changes to save");
        return;
      }

      setLoading(true);
      try {
        // Update all bank accounts sequentially
        for (const [bankId, data] of updates) {
          const newBalance = parseFloat(data.newBalance);
          if (isNaN(newBalance) || newBalance < 0) {
            setError(`Invalid balance for account`);
            setLoading(false);
            return;
          }

          await bankAccountService.adjustBalance(
            currentAccount._id,
            bankId,
            newBalance,
            data.reason || "Bulk balance update",
          );
        }

        await loadBankAccounts();
        setBulkBalanceUpdates({});
        setActiveModal(null);
        setStatusModal({
          show: true,
          type: "success",
          message: "All bank balances updated successfully!",
        });
        setTimeout(
          () => setStatusModal({ show: false, type: "", message: "" }),
          10000,
        );
      } catch (err) {
        const errorMsg =
          err.response?.data?.message || "Failed to update balances";
        setStatusModal({ show: true, type: "error", message: errorMsg });
        setTimeout(
          () => setStatusModal({ show: false, type: "", message: "" }),
          10000,
        );
      }
      setLoading(false);
    });

  const handleTopUpBankBalance = async () =>
    runIfAllowed(async () => {
      const amount = parseFloat(topUpAmount);
      if (isNaN(amount) || amount <= 0) {
        setError("Please enter a valid amount greater than 0");
        return;
      }

      if (!selectedBankForTopUp) {
        setError("Please select a bank account");
        return;
      }

      setLoading(true);
      try {
        const newBalance = selectedBankForTopUp.balance + amount;

        await bankAccountService.adjustBalance(
          currentAccount._id,
          selectedBankForTopUp._id,
          newBalance,
          topUpReason.trim() || "Top up",
        );

        await loadBankAccounts();
        setTopUpAmount("");
        setTopUpReason("");
        setSelectedBankForTopUp(null);
        setActiveModal(null);
        setStatusModal({
          show: true,
          type: "success",
          message: `Successfully topped up ${selectedBankForTopUp.name} with ${formatAmount(amount, currentAccount?.currency)}!`,
        });
        setTimeout(
          () => setStatusModal({ show: false, type: "", message: "" }),
          10000,
        );
      } catch (err) {
        const errorMsg =
          err.response?.data?.message || "Failed to top up balance";
        setStatusModal({ show: true, type: "error", message: errorMsg });
        setTimeout(
          () => setStatusModal({ show: false, type: "", message: "" }),
          10000,
        );
      }
      setLoading(false);
    });

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white shadow border border-gray-200 p-8 max-w-md w-full text-center">
          <Calendar className="w-16 h-16 text-indigo-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            No Weeks Created
          </h2>
          <p className="text-gray-600 mb-6">
            Create your first week to start tracking expenses.
          </p>
          <button
            onClick={createFirstWeek}
            className="w-full bg-indigo-600 text-white px-6 py-3 hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
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
    <div className="min-h-screen h-full bg-white">
      <Header
        user={user}
        currentMember={currentMember}
        hasPermission={hasPermission}
        setShowSettings={setShowSettings}
        setShowCreateAccountModal={setShowCreateAccountModal}
        logout={logout}
        onOpenNotificationCenter={openNotificationCenter}
      />
      <NotificationBanner success={success} error={error} setError={setError} />
      <ToastNotification onOpenCenter={openNotificationCenter} />
      {/* Main Content */}
      {/* Main Content */}
      <div className="w-full bg-white px-8 py-6">
        {/* Top Action Bar */}
        <div className="flex flex-wrap justify-end gap-3 mb-6">
          <button
            onClick={() => setShowHistoryTab(!showHistoryTab)}
            className={`px-6 py-3 rounded-xl transition-all flex items-center gap-2 font-semibold shadow-sm hover:shadow-md ${
              showHistoryTab
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            <History className="w-5 h-5" />
            Unified Feed
          </button>

          <button
            onClick={() => setShowSchedule(true)}
            className="px-6 py-3 rounded-xl transition-all flex items-center gap-2 font-semibold shadow-sm bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:shadow-md"
          >
            <Calendar className="w-5 h-5 text-emerald-600" />
            Schedule
          </button>
        </div>

        {showHistoryTab ? (
          <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-6 sm:p-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-6 flex items-center gap-3">
              <div className="bg-slate-900 p-3 rounded-xl">
                <History className="w-8 h-8 text-white" />
              </div>
              Activity History
            </h2>

            {/* Activity Timeline */}
            <div className="space-y-4">
              {expenses.length === 0 &&
                (!currentWeek?.cashTransactions ||
                  currentWeek.cashTransactions.length === 0) && (
                  <div className="text-center py-16 text-slate-400">
                    <FileText className="w-20 h-20 mx-auto mb-4 opacity-30" />
                    <p className="text-lg font-medium">No activities yet</p>
                    <p className="text-sm mt-2">
                      Start adding expenses, transfers, or cash to see activity
                      history
                    </p>
                  </div>
                )}

              {/* Build unified activity list: expenses + cash transactions */}
              {Object.entries(
                [
                  ...expenses.map((e) => ({
                    type: "expense",
                    data: e,
                    timestamp: new Date(e.createdAt || e.date),
                  })),
                  ...(currentWeek?.cashTransactions || []).map((ct) => ({
                    type: "cash",
                    data: ct,
                    timestamp: new Date(ct.createdAt || ct.date),
                  })),
                ]
                  .sort((a, b) => b.timestamp - a.timestamp)
                  .reduce((groups, activity) => {
                    const date = formatDate(activity.timestamp);
                    if (!groups[date]) groups[date] = [];
                    groups[date].push(activity);
                    return groups;
                  }, {}),
              ).map(([date, activities]) => (
                <div
                  key={date}
                  className="border-l-4 border-slate-300 pl-6 pb-6"
                >
                  <div className="sticky top-0 bg-white pb-3 mb-4">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-emerald-600" />
                      <h3 className="text-lg font-bold text-slate-800">
                        {formatDateReadable(new Date(date))}
                      </h3>
                      <span className="text-sm text-slate-500">
                        ({activities.length} activities)
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {activities.map((activity, idx) => {
                      if (activity.type === "expense") {
                        const exp = activity.data;
                        return (
                          <div
                            key={idx}
                            className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md transition-all hover:border-slate-300"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="bg-red-50 p-2 rounded-lg">
                                    <Receipt className="w-4 h-4 text-red-600" />
                                  </div>
                                  <span className="font-semibold text-slate-800">
                                    Expense
                                  </span>
                                  <span className="text-xl font-bold text-red-600">
                                    -
                                    {formatAmount(
                                      exp.amount,
                                      currentAccount?.currency,
                                    ).substring(
                                      getCurrencySymbol(
                                        currentAccount?.currency,
                                      ).length,
                                    )}
                                  </span>
                                </div>
                                <div className="flex flex-wrap items-center gap-2 ml-10">
                                  <span className="px-3 py-1 bg-slate-100 text-slate-700 text-sm rounded-full font-medium">
                                    {exp.category}
                                  </span>
                                  {exp.paymentSource === "bank" &&
                                    exp.bankAccountId && (
                                      <span className="flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 text-sm rounded-full font-medium">
                                        <CreditCard className="w-3 h-3" />
                                        {bankAccounts.find(
                                          (ba) => ba._id === exp.bankAccountId,
                                        )?.name || "Bank"}
                                      </span>
                                    )}
                                  {exp.paymentSource === "cash" && (
                                    <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-sm rounded-full font-medium">
                                      💵 Cash
                                    </span>
                                  )}
                                </div>
                                {exp.note && (
                                  <p className="text-sm text-slate-600 mt-2 ml-10">
                                    {exp.note}
                                  </p>
                                )}
                              </div>
                              <div className="text-xs text-slate-500">
                                {formatTime(activity.timestamp)}
                              </div>
                            </div>
                          </div>
                        );
                      }

                      if (activity.type === "cash") {
                        const ct = activity.data;
                        return (
                          <div
                            key={idx}
                            className="bg-white border border-emerald-200 rounded-lg p-4 hover:shadow-md transition-all hover:border-emerald-300"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="bg-emerald-50 p-2 rounded-lg">
                                    <Wallet className="w-4 h-4 text-emerald-600" />
                                  </div>
                                  <span className="font-semibold text-slate-800">
                                    Cash Added
                                  </span>
                                  <span className="text-xl font-bold text-green-600">
                                    +
                                    {formatAmount(
                                      ct.amount,
                                      currentAccount?.currency,
                                    ).substring(
                                      getCurrencySymbol(
                                        currentAccount?.currency,
                                      ).length,
                                    )}
                                  </span>
                                </div>
                                {ct.note && (
                                  <p className="text-sm text-gray-600 mt-1 ml-10">
                                    {ct.note}
                                  </p>
                                )}
                              </div>
                              <div className="text-xs text-gray-500">
                                {formatTime(activity.timestamp)}
                              </div>
                            </div>
                          </div>
                        );
                      }

                      return null;
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Week Navigation */}
            <div className="bg-white border-b border-slate-200 p-6 mb-0">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-600 p-3 rounded-xl">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">
                      Week {currentWeekIndex + 1} of {weeks.length}
                    </h2>
                    <p className="text-sm text-slate-600">
                      {formatDateReadable(weekStartDate)} -{" "}
                      {formatDateReadable(weekEndDate)}
                    </p>
                  </div>
                </div>
                {currentWeek.isLocked && (
                  <span className="flex items-center gap-2 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-xl text-sm font-semibold">
                    <Lock className="w-4 h-4" />
                    Locked
                  </span>
                )}
              </div>

              <div className="flex gap-3 flex-wrap">
                <button
                  onClick={() =>
                    setCurrentWeekIndex(Math.max(0, currentWeekIndex - 1))
                  }
                  disabled={currentWeekIndex === 0}
                  className="px-5 py-2.5 bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed border border-slate-300 font-semibold rounded-xl transition-all flex items-center gap-2"
                >
                  <ChevronDown className="w-4 h-4 rotate-90" />
                  Previous Week
                </button>
                <button
                  onClick={() =>
                    setCurrentWeekIndex(
                      Math.min(weeks.length - 1, currentWeekIndex + 1),
                    )
                  }
                  disabled={currentWeekIndex === weeks.length - 1}
                  className="px-5 py-2.5 bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed border border-slate-300 font-semibold rounded-xl transition-all flex items-center gap-2"
                >
                  Next Week
                  <ChevronUp className="w-4 h-4 rotate-90" />
                </button>
                {currentWeekIndex === 0 && !currentWeek.isLocked && (
                  <button
                    onClick={createNewWeek}
                    className="px-5 py-2.5 bg-emerald-600 text-white hover:bg-emerald-700 flex items-center gap-2 font-semibold rounded-xl transition-all"
                  >
                    <Plus className="w-5 h-5" />
                    New Week
                  </button>
                )}
                {!currentWeek.isLocked && hasPermission("makeExpense") && (
                  <button
                    onClick={() => setActiveModal("lockWeek")}
                    className="px-5 py-2.5 bg-yellow-500 text-white hover:bg-yellow-600 flex items-center gap-2 ml-auto font-semibold rounded-xl transition-all"
                  >
                    <Lock className="w-5 h-5" />
                    Lock Week
                  </button>
                )}
              </div>
            </div>

            <FinancialOverview
              bankAccounts={bankAccounts}
              currentWeek={currentWeek}
              hasPermission={hasPermission}
              setActiveModal={setActiveModal}
              getExpectedBankAmount={getExpectedBankAmount}
              getExpectedCashAmount={getExpectedCashAmount}
              getTotalExpenses={getTotalExpenses}
              expenses={expenses}
              currentAccount={currentAccount}
              formatAmount={formatAmount}
            />

            <DailyBreakdown
              weekDates={weekDates}
              formatDate={formatDate}
              formatDateReadable={formatDateReadable}
              getExpensesForDate={getExpensesForDate}
              getDayTotal={getDayTotal}
              expandedDays={expandedDays}
              toggleDayExpansion={toggleDayExpansion}
              setSelectedExpenseForPhoto={setSelectedExpenseForPhoto}
              currentAccount={currentAccount}
              formatAmount={formatAmount}
              handleDeleteExpense={handleDeleteExpense}
              currentWeek={currentWeek}
              hasPermission={hasPermission}
              bankAccounts={bankAccounts}
              dailyActivity={dailyActivity}
            />
          </>
        )}
      </div>
      {/* Modals */}
      {activeModal === "bankAccounts" && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-[60] animate-fadeIn">
          <div className="bg-white shadow-2xl rounded-2xl w-full max-w-xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 border-b-2 border-blue-700">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">
                    Bank Accounts
                  </h3>
                  <p className="text-xs text-blue-100 font-medium mt-0.5">
                    {bankAccounts.length} account
                    {bankAccounts.length !== 1 ? "s" : ""} linked
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-lg transition-all duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Accounts List */}
            <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
              {bankAccounts.length === 0 ? (
                <div className="py-16 text-center">
                  <div className="bg-blue-50 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                    <CreditCard className="w-10 h-10 text-blue-400" />
                  </div>
                  <p className="text-gray-700 font-semibold text-lg">
                    No accounts added yet
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Add bank accounts through Settings to get started
                  </p>
                </div>
              ) : (
                bankAccounts.map((ba) => (
                  <div
                    key={ba._id}
                    className="flex items-center justify-between px-6 py-5 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-gradient-to-br from-blue-100 to-indigo-100 p-3 rounded-xl flex-shrink-0 group-hover:from-blue-500 group-hover:to-indigo-500 transition-all duration-200">
                        <CreditCard className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors" />
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 text-lg">
                          {ba.name}
                          {ba.lastFourDigits && (
                            <span className="text-gray-400 font-normal ml-2 text-base">
                              ···{ba.lastFourDigits}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          {ba.bankName && (
                            <span className="text-sm text-gray-600 font-medium">
                              {ba.bankName}
                            </span>
                          )}
                          {ba.accountType && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-2.5 py-1 capitalize font-bold rounded-full">
                              {ba.accountType}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-black text-gray-900 group-hover:text-blue-600 transition-colors">
                        {formatAmount(ba.balance, currentAccount?.currency)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Total Row */}
            {bankAccounts.length > 0 && (
              <div className="flex items-center justify-between px-6 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-inner">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  <span className="font-bold text-lg">Total Balance</span>
                </div>
                <span className="text-3xl font-black tracking-tight">
                  {formatAmount(
                    getExpectedBankAmount(),
                    currentAccount?.currency,
                  )}
                </span>
              </div>
            )}

            {/* Footer Actions */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <button
                onClick={() => setActiveModal(null)}
                className="w-full px-6 py-3 border-2 border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400 transition-all duration-200 font-semibold rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {activeModal === "addCash" && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]">
          <div className="bg-white shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="bg-green-600 p-2.5 rounded-lg">
                  <Wallet className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  Top Up Cash Balance
                </h3>
              </div>
              <button
                onClick={() => {
                  setActiveModal(null);
                  setAddCashAmount("");
                  setAddCashNote("");
                }}
                className="text-gray-400 hover:text-gray-700 hover:bg-gray-100 p-2 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={addCashAmount}
                  onChange={(e) => setAddCashAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-3 border border-gray-300 text-lg font-semibold focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Note{" "}
                  <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <textarea
                  value={addCashNote}
                  onChange={(e) => setAddCashNote(e.target.value)}
                  placeholder="e.g. Cash from sales, daily collection..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none text-sm"
                />
              </div>
            </div>
            <div className="flex gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={handleAddCash}
                className="flex-1 bg-green-600 text-white px-6 py-3 hover:bg-green-700 transition-colors font-semibold"
              >
                Top Up Cash
              </button>
              <button
                onClick={() => {
                  setActiveModal(null);
                  setAddCashAmount("");
                  setAddCashNote("");
                }}
                className="px-6 py-3 border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {activeModal === "transfer" && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]">
          <div className="bg-white shadow-2xl w-full max-w-md">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="bg-indigo-600 p-2.5 rounded-lg">
                  <ArrowRightLeft className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  Transfer Bank → Cash
                </h3>
              </div>
              <button
                onClick={() => {
                  setActiveModal(null);
                  setSelectedBankAccountForTransfer("");
                  setTransferAmount("");
                }}
                className="text-gray-400 hover:text-gray-700 hover:bg-gray-100 p-2 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Total Balance Banner */}
            <div className="flex items-center justify-between px-6 py-4 bg-indigo-50 border-b border-indigo-100">
              <span className="text-sm font-semibold text-indigo-700 uppercase tracking-wide">
                Total Bank Balance
              </span>
              <span className="text-2xl font-bold text-indigo-800">
                {formatAmount(
                  getExpectedBankAmount(),
                  currentAccount?.currency,
                )}
              </span>
            </div>

            {/* Step 1: Pick an account */}
            <div className="px-6 pt-5 pb-2">
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                1. Select a bank account
              </p>
              <div className="divide-y divide-gray-100 border border-gray-200">
                {bankAccounts.map((ba) => {
                  const isSelected = selectedBankAccountForTransfer === ba._id;
                  return (
                    <button
                      key={ba._id}
                      onClick={() => setSelectedBankAccountForTransfer(ba._id)}
                      className={`w-full flex items-center justify-between px-4 py-3 transition-colors text-left ${
                        isSelected
                          ? "bg-indigo-600 text-white"
                          : "hover:bg-gray-50 text-gray-800"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded ${isSelected ? "bg-indigo-500" : "bg-blue-100"}`}
                        >
                          <CreditCard
                            className={`w-4 h-4 ${isSelected ? "text-white" : "text-blue-600"}`}
                          />
                        </div>
                        <div>
                          <div className="font-semibold text-sm">
                            {ba.name}
                            {ba.lastFourDigits && (
                              <span
                                className={`ml-2 font-normal text-xs ${isSelected ? "text-indigo-200" : "text-gray-400"}`}
                              >
                                ···{ba.lastFourDigits}
                              </span>
                            )}
                          </div>
                          {ba.bankName && (
                            <div
                              className={`text-xs ${isSelected ? "text-indigo-200" : "text-gray-400"}`}
                            >
                              {ba.bankName}
                            </div>
                          )}
                        </div>
                      </div>
                      <div
                        className={`text-base font-bold ${isSelected ? "text-white" : "text-gray-900"}`}
                      >
                        {formatAmount(ba.balance, currentAccount?.currency)}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Enter amount */}
            <div className="px-6 pt-4 pb-5">
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                2. Enter amount
              </p>
              <input
                type="number"
                step="0.01"
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
                placeholder="0.00"
                disabled={!selectedBankAccountForTransfer}
                className="w-full px-4 py-3 border border-gray-300 text-lg font-semibold focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400"
              />
              {selectedBankAccountForTransfer && (
                <p className="text-xs text-gray-500 mt-1.5">
                  Available:{" "}
                  <span className="font-semibold text-gray-800">
                    {formatAmount(
                      bankAccounts.find(
                        (ba) => ba._id === selectedBankAccountForTransfer,
                      )?.balance || 0,
                      currentAccount?.currency,
                    )}
                  </span>
                </p>
              )}
            </div>

            {/* Footer */}
            <div className="flex gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={handleTransferToCash}
                disabled={!selectedBankAccountForTransfer || !transferAmount}
                className="flex-1 bg-indigo-600 text-white px-6 py-3 hover:bg-indigo-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Transfer to Cash
              </button>
              <button
                onClick={() => {
                  setActiveModal(null);
                  setSelectedBankAccountForTransfer("");
                  setTransferAmount("");
                }}
                className="px-6 py-3 border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {activeModal === "addBankAccount" && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60] overflow-y-auto">
          <div className="bg-white shadow-xl max-w-xl w-full p-6 my-8 rounded-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-800">
                Add Bank Account
              </h3>
              <button
                onClick={() => {
                  setActiveModal(null);
                  setBankAccountForm({
                    name: "",
                    bankName: "",
                    accountType: "checking",
                    lastFourDigits: "",
                    balance: "",
                    currency: "",
                  });
                  setBaCurrencyOpen(false);
                  setBaCurrencySearch("");
                  setError("");
                }}
                className="text-gray-400 hover:text-gray-600"
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

            <form onSubmit={handleSaveBankAccount} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={bankAccountForm.name}
                  onChange={(e) =>
                    setBankAccountForm({
                      ...bankAccountForm,
                      name: e.target.value,
                    })
                  }
                  placeholder="e.g., Main Checking, Business Savings"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bank Name{" "}
                  <span className="text-gray-400 text-xs">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={bankAccountForm.bankName}
                  onChange={(e) =>
                    setBankAccountForm({
                      ...bankAccountForm,
                      bankName: e.target.value,
                    })
                  }
                  placeholder="e.g., Chase, Bank of America"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Account Type
                  </label>
                  <select
                    value={bankAccountForm.accountType}
                    onChange={(e) =>
                      setBankAccountForm({
                        ...bankAccountForm,
                        accountType: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="checking">Checking</option>
                    <option value="savings">Savings</option>
                    <option value="credit">Credit Card</option>
                    <option value="cash">Cash</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last 4 Digits{" "}
                    <span className="text-gray-400 text-xs">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={bankAccountForm.lastFourDigits}
                    onChange={(e) =>
                      setBankAccountForm({
                        ...bankAccountForm,
                        lastFourDigits: e.target.value,
                      })
                    }
                    placeholder="1234"
                    maxLength="4"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Initial Balance
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={bankAccountForm.balance}
                  onChange={(e) =>
                    setBankAccountForm({
                      ...bankAccountForm,
                      balance: e.target.value,
                    })
                  }
                  placeholder="0.00"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Currency <span className="text-red-500">*</span>
                  {bankAccounts.length > 0 && currentAccount?.currency && (
                    <span className="ml-2 text-xs text-blue-600 font-semibold">
                      (Account Currency: {currentAccount.currency})
                    </span>
                  )}
                </label>
                {bankAccounts.length > 0 ? (
                  <div className="w-full flex items-center gap-3 px-4 py-3 border-2 border-gray-300 rounded-xl bg-gray-50">
                    <span className="text-2xl font-bold w-10 text-center text-gray-600 leading-none">
                      {CURRENCIES.find(
                        (c) => c.code === currentAccount?.currency,
                      )?.symbol || "?"}
                    </span>
                    <div>
                      <span className="font-semibold text-gray-700">
                        {currentAccount?.currency || "Not Set"}
                      </span>
                      <span className="text-gray-500 text-sm ml-2">
                        {CURRENCIES.find(
                          (c) => c.code === currentAccount?.currency,
                        )?.name || ""}
                      </span>
                    </div>
                  </div>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setBaCurrencyOpen((o) => !o);
                        setBaCurrencySearch("");
                      }}
                      className={`w-full flex items-center justify-between px-4 py-3 border-2 rounded-xl transition-all bg-white text-left ${
                        baCurrencyOpen
                          ? "border-blue-500 ring-2 ring-blue-100"
                          : "border-gray-200 hover:border-blue-300"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {bankAccountForm.currency ? (
                          <>
                            <span className="text-2xl font-bold w-10 text-center text-gray-700 leading-none">
                              {
                                CURRENCIES.find(
                                  (c) => c.code === bankAccountForm.currency,
                                )?.symbol
                              }
                            </span>
                            <div>
                              <span className="font-semibold text-gray-900">
                                {bankAccountForm.currency}
                              </span>
                              <span className="text-gray-500 text-sm ml-2">
                                {
                                  CURRENCIES.find(
                                    (c) => c.code === bankAccountForm.currency,
                                  )?.name
                                }
                              </span>
                            </div>
                          </>
                        ) : (
                          <span className="text-gray-400 font-medium">
                            Select currency...
                          </span>
                        )}
                      </div>
                      <ChevronDown
                        className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                          baCurrencyOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {baCurrencyOpen && (
                      <div className="mt-2 border border-gray-200 rounded-xl overflow-hidden shadow-md">
                        <div className="p-2 bg-gray-50 border-b border-gray-100">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                              type="text"
                              autoFocus
                              value={baCurrencySearch}
                              onChange={(e) =>
                                setBaCurrencySearch(e.target.value)
                              }
                              placeholder="Search by code or name..."
                              className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                        </div>
                        <div className="max-h-52 overflow-y-auto divide-y divide-gray-50">
                          {CURRENCIES.filter(
                            (c) =>
                              c.code
                                .toLowerCase()
                                .includes(baCurrencySearch.toLowerCase()) ||
                              c.name
                                .toLowerCase()
                                .includes(baCurrencySearch.toLowerCase()),
                          ).map((currency) => (
                            <button
                              key={currency.code}
                              type="button"
                              onClick={() => {
                                setBankAccountForm({
                                  ...bankAccountForm,
                                  currency: currency.code,
                                });
                                setBaCurrencyOpen(false);
                                setBaCurrencySearch("");
                              }}
                              className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50 transition-colors text-left ${
                                bankAccountForm.currency === currency.code
                                  ? "bg-blue-50"
                                  : "bg-white"
                              }`}
                            >
                              <span className="text-xl font-bold w-8 text-center text-gray-600 leading-none flex-shrink-0">
                                {currency.symbol}
                              </span>
                              <div className="flex-1 min-w-0">
                                <span className="font-semibold text-sm text-gray-900">
                                  {currency.code}
                                </span>
                                <span className="text-xs text-gray-500 ml-2 truncate">
                                  {currency.name}
                                </span>
                              </div>
                              {bankAccountForm.currency === currency.code && (
                                <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                              )}
                            </button>
                          ))}
                          {CURRENCIES.filter(
                            (c) =>
                              c.code
                                .toLowerCase()
                                .includes(baCurrencySearch.toLowerCase()) ||
                              c.name
                                .toLowerCase()
                                .includes(baCurrencySearch.toLowerCase()),
                          ).length === 0 && (
                            <div className="py-6 text-center text-sm text-gray-400">
                              No currencies found
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" />
                      Add Bank Account
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveModal(null);
                    setBankAccountForm({
                      name: "",
                      bankName: "",
                      accountType: "checking",
                      lastFourDigits: "",
                      balance: "",
                      currency: "",
                    });
                    setBaCurrencyOpen(false);
                    setBaCurrencySearch("");
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
      {activeModal === "topUpBankBalance" && !selectedBankForTopUp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]">
          <div className="bg-white shadow-2xl max-w-lg w-full rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-green-600 to-emerald-600">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">
                    Select Bank Account
                  </h3>
                  <p className="text-xs text-white/90 mt-1">
                    Choose which account to top up
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setActiveModal(null);
                  setSelectedBankForTopUp(null);
                  setError("");
                }}
                className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="px-6 py-5 max-h-[70vh] overflow-y-auto">
              <div className="space-y-3">
                {bankAccounts.map((ba) => (
                  <button
                    key={ba._id}
                    onClick={() => {
                      setSelectedBankForTopUp(ba);
                      setError("");
                    }}
                    className="w-full bg-gradient-to-r from-gray-50 to-green-50 border-2 border-gray-200 hover:border-green-500 rounded-xl p-5 transition-all hover:shadow-lg group text-left"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="bg-green-600 group-hover:bg-green-700 p-3 rounded-xl transition-colors">
                          <Building2 className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <div className="font-bold text-lg text-gray-900 group-hover:text-green-700 transition-colors">
                            {ba.name}
                            {ba.lastFourDigits && (
                              <span className="text-gray-400 font-normal ml-2 text-sm">
                                ···{ba.lastFourDigits}
                              </span>
                            )}
                          </div>
                          {ba.bankName && (
                            <div className="text-sm text-gray-600 mt-1">
                              {ba.bankName}{" "}
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded capitalize ml-1">
                                {ba.accountType}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500 mb-1">
                          Current Balance
                        </div>
                        <div className="text-2xl font-bold text-gray-900 group-hover:text-green-700 transition-colors">
                          {formatAmount(ba.balance, currentAccount?.currency)}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => {
                  setActiveModal(null);
                  setSelectedBankForTopUp(null);
                  setError("");
                }}
                className="w-full px-6 py-3 border-2 border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors font-semibold rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {activeModal === "topUpBankBalance" && selectedBankForTopUp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]">
          <div className="bg-white shadow-2xl max-w-md w-full rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-green-600 to-emerald-600">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur">
                  <Plus className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">
                    Top Up Bank Balance
                  </h3>
                  <p className="text-xs text-white/90 mt-1">
                    {selectedBankForTopUp.name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setActiveModal(null);
                  setSelectedBankForTopUp(null);
                  setTopUpAmount("");
                  setTopUpReason("");
                  setError("");
                }}
                className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {error && (
              <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <div className="px-6 py-5">
              <div className="bg-gradient-to-r from-gray-50 to-green-50 border-2 border-green-200 rounded-xl p-5 mb-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-600 p-3 rounded-xl">
                      <Building2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="font-bold text-base text-gray-900">
                        {selectedBankForTopUp.name}
                      </div>
                      {selectedBankForTopUp.bankName && (
                        <div className="text-sm text-gray-600">
                          {selectedBankForTopUp.bankName}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500 mb-1">
                      Current Balance
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      {formatAmount(
                        selectedBankForTopUp.balance,
                        currentAccount?.currency,
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                    Top Up Amount <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={topUpAmount}
                    onChange={(e) => {
                      setTopUpAmount(e.target.value);
                      setError("");
                    }}
                    placeholder="0.00"
                    className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl text-2xl font-bold focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    autoFocus
                  />
                  {topUpAmount && parseFloat(topUpAmount) > 0 && (
                    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="text-sm text-gray-700">
                        New Balance:{" "}
                        <span className="font-bold text-green-700 text-lg">
                          {formatAmount(
                            selectedBankForTopUp.balance +
                              parseFloat(topUpAmount),
                            currentAccount?.currency,
                          )}
                        </span>
                      </div>
                      <div className="text-xs text-green-600 mt-1">
                        +
                        {formatAmount(
                          parseFloat(topUpAmount),
                          currentAccount?.currency,
                        )}{" "}
                        increase
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                    Reason{" "}
                    <span className="text-gray-400 font-normal text-xs normal-case">
                      (optional)
                    </span>
                  </label>
                  <input
                    type="text"
                    value={topUpReason}
                    onChange={(e) => setTopUpReason(e.target.value)}
                    placeholder="e.g., Deposit, Cash transfer, Revenue..."
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => {
                  setSelectedBankForTopUp(null);
                  setTopUpAmount("");
                  setTopUpReason("");
                  setError("");
                }}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors font-semibold rounded-lg"
              >
                ← Back
              </button>
              <button
                onClick={handleTopUpBankBalance}
                disabled={
                  loading || !topUpAmount || parseFloat(topUpAmount) <= 0
                }
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all font-bold text-lg shadow-lg hover:shadow-xl uppercase tracking-wide rounded-lg"
              >
                {loading
                  ? "Processing..."
                  : `Top Up ${formatAmount(parseFloat(topUpAmount) || 0, currentAccount?.currency)}`}
              </button>
            </div>
          </div>
        </div>
      )}
      {activeModal === "updateBankBalances" && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60] overflow-y-auto">
          <div className="bg-white shadow-xl max-w-4xl w-full my-8">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-indigo-600 to-blue-600">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2.5 rounded-lg backdrop-blur">
                  <Edit className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">
                    Update Bank Balances
                  </h3>
                  <p className="text-xs text-white/80 mt-1">
                    Adjust balances for reconciliation, deposits, or corrections
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setActiveModal(null);
                  setBulkBalanceUpdates({});
                  setError("");
                }}
                className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {error && (
              <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <div className="px-6 py-5 max-h-[60vh] overflow-y-auto">
              <div className="space-y-4">
                {bankAccounts.map((ba) => {
                  const updateData = bulkBalanceUpdates[ba._id] || {};
                  const newBalance =
                    updateData.newBalance !== undefined
                      ? parseFloat(updateData.newBalance)
                      : ba.balance;
                  const difference = newBalance - ba.balance;

                  return (
                    <div
                      key={ba._id}
                      className="bg-gradient-to-r from-gray-50 to-blue-50 border-2 border-gray-200 rounded-xl p-5 hover:border-blue-300 transition-all"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="bg-blue-600 p-3 rounded-xl">
                            <Building2 className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <div className="font-bold text-lg text-gray-900">
                              {ba.name}
                              {ba.lastFourDigits && (
                                <span className="text-gray-400 font-normal ml-2 text-sm">
                                  ···{ba.lastFourDigits}
                                </span>
                              )}
                            </div>
                            {ba.bankName && (
                              <div className="text-sm text-gray-600 mt-0.5">
                                {ba.bankName}{" "}
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded capitalize ml-2">
                                  {ba.accountType}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-gray-500 mb-1">
                            Current Balance
                          </div>
                          <div className="text-xl font-bold text-gray-900">
                            {formatAmount(ba.balance, currentAccount?.currency)}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            New Balance
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            value={
                              updateData.newBalance !== undefined
                                ? updateData.newBalance
                                : ba.balance
                            }
                            onChange={(e) =>
                              setBulkBalanceUpdates({
                                ...bulkBalanceUpdates,
                                [ba._id]: {
                                  ...updateData,
                                  newBalance: e.target.value,
                                },
                              })
                            }
                            placeholder="0.00"
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-lg font-bold focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          />
                          {Math.abs(difference) > 0.01 && (
                            <div className="mt-2 text-sm">
                              <span
                                className={`font-bold ${
                                  difference >= 0
                                    ? "text-green-600"
                                    : "text-red-600"
                                }`}
                              >
                                {difference >= 0 ? "+" : ""}
                                {formatAmount(
                                  Math.abs(difference),
                                  currentAccount?.currency,
                                )}
                              </span>
                              <span className="text-gray-600 ml-1">
                                from current
                              </span>
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Reason (optional)
                          </label>
                          <input
                            type="text"
                            value={updateData.reason || ""}
                            onChange={(e) =>
                              setBulkBalanceUpdates({
                                ...bulkBalanceUpdates,
                                [ba._id]: {
                                  ...updateData,
                                  reason: e.target.value,
                                },
                              })
                            }
                            placeholder="e.g., Reconciliation, Deposit..."
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={handleBulkBalanceUpdate}
                disabled={
                  loading || Object.keys(bulkBalanceUpdates).length === 0
                }
                className="flex-1 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white px-6 py-4 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all font-bold text-lg shadow-lg hover:shadow-xl uppercase tracking-wide"
              >
                {loading ? "Updating..." : "Save All Changes"}
              </button>
              <button
                onClick={() => {
                  setActiveModal(null);
                  setBulkBalanceUpdates({});
                  setError("");
                }}
                className="px-8 py-4 border-2 border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors font-semibold rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {activeModal === "addExpense" && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60] overflow-y-auto">
          <div className="bg-white shadow-xl max-w-md w-full p-6 my-8">
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
                <div className="relative">
                  <input
                    type="text"
                    value={expenseForm.date}
                    onChange={(e) =>
                      setExpenseForm({ ...expenseForm, date: e.target.value })
                    }
                    placeholder="YYYY-MM-DD or select from calendar"
                    pattern="\d{4}-\d{2}-\d{2}"
                    className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                  <input
                    type="date"
                    value={expenseForm.date}
                    onChange={(e) =>
                      setExpenseForm({ ...expenseForm, date: e.target.value })
                    }
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 opacity-0 cursor-pointer"
                    title="Pick from calendar"
                  />
                  <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
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
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <CreditCard className="w-4 h-4" />
                  Payment Source
                </label>
                <div className="border border-gray-200 divide-y divide-gray-100">
                  {/* Cash option */}
                  <button
                    type="button"
                    onClick={() =>
                      setExpenseForm({ ...expenseForm, bankAccountId: "" })
                    }
                    className={`w-full flex items-center justify-between px-4 py-3 transition-colors text-left ${
                      expenseForm.bankAccountId === ""
                        ? "bg-emerald-600 text-white"
                        : "hover:bg-gray-50 text-gray-800"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded ${expenseForm.bankAccountId === "" ? "bg-emerald-500" : "bg-emerald-100"}`}
                      >
                        <Wallet
                          className={`w-4 h-4 ${expenseForm.bankAccountId === "" ? "text-white" : "text-emerald-600"}`}
                        />
                      </div>
                      <span className="font-semibold text-sm">Cash</span>
                    </div>
                    <span
                      className={`text-sm font-bold ${expenseForm.bankAccountId === "" ? "text-white" : "text-gray-900"}`}
                    >
                      {formatAmount(
                        getExpectedCashAmount(),
                        currentAccount?.currency,
                      )}
                    </span>
                  </button>
                  {/* Bank accounts */}
                  {bankAccounts.map((ba) => {
                    const isSelected = expenseForm.bankAccountId === ba._id;
                    return (
                      <button
                        key={ba._id}
                        type="button"
                        onClick={() =>
                          setExpenseForm({
                            ...expenseForm,
                            bankAccountId: ba._id,
                          })
                        }
                        className={`w-full flex items-center justify-between px-4 py-3 transition-colors text-left ${
                          isSelected
                            ? "bg-indigo-600 text-white"
                            : "hover:bg-gray-50 text-gray-800"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-2 rounded ${isSelected ? "bg-indigo-500" : "bg-blue-100"}`}
                          >
                            <CreditCard
                              className={`w-4 h-4 ${isSelected ? "text-white" : "text-blue-600"}`}
                            />
                          </div>
                          <div>
                            <div className="font-semibold text-sm">
                              {ba.name}
                              {ba.lastFourDigits && (
                                <span
                                  className={`ml-2 font-normal text-xs ${isSelected ? "text-indigo-200" : "text-gray-400"}`}
                                >
                                  ···{ba.lastFourDigits}
                                </span>
                              )}
                            </div>
                            {ba.bankName && (
                              <div
                                className={`text-xs ${isSelected ? "text-indigo-200" : "text-gray-400"}`}
                              >
                                {ba.bankName}
                              </div>
                            )}
                          </div>
                        </div>
                        <span
                          className={`text-sm font-bold ${isSelected ? "text-white" : "text-gray-900"}`}
                        >
                          {formatAmount(ba.balance, currentAccount?.currency)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 text-white px-6 py-3 hover:bg-indigo-700 transition-colors font-semibold"
                >
                  Add Expense
                </button>
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-6 py-3 border border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {activeModal === "lockWeek" && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]">
          <div className="bg-white shadow-xl max-w-md w-full p-6">
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
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-[60] animate-fadeIn">
          <div className="bg-white shadow-2xl rounded-2xl p-8 max-w-md w-full transform transition-all animate-slideUp">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                {accountKind === ""
                  ? "Create Account"
                  : accountKind === "personal"
                    ? "Personal Account"
                    : "Business Account"}
              </h3>
              <button
                onClick={() => {
                  setShowCreateAccountModal(false);
                  resetAccountForm();
                }}
                className="text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg p-2 transition-all duration-200"
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

            {/* Business Account Form */}
            <form onSubmit={handleCreateAccount} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setSelectedSubcategory("");
                    setCustomDescription("");
                  }}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 hover:border-gray-300 font-medium"
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
                <div className="animate-slideDown">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Subcategory <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedSubcategory}
                    onChange={(e) => setSelectedSubcategory(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 hover:border-gray-300 font-medium"
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
                <div className="animate-slideDown">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Business Description <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={customDescription}
                    onChange={(e) => setCustomDescription(e.target.value)}
                    placeholder="Describe your business..."
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 hover:border-gray-300"
                    required
                  />
                </div>
              )}
              <div className="pt-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5" />
                      Create Account
                    </>
                  )}
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
      {/* ==================== SETTINGS SCREENnn ==================== */}
      {showSettings && (
        <SettingsScreen
          user={user}
          currentAccount={currentAccount}
          currentMember={currentMember}
          hasPermission={hasPermission}
          categories={categories}
          bankAccounts={bankAccounts}
          addCategory={addCategory}
          setShowSettings={setShowSettings}
          setActiveModal={setActiveModal}
          getExpectedBankAmount={getExpectedBankAmount}
          runIfAllowed={runIfAllowed}
          formatAmount={formatAmount}
          onOpenNotificationSettings={() => {
            setShowSettings(false);
            setShowNotificationSettings(true);
          }}
        />
      )}{" "}
      {/* end settings */}
      {/* ==================== MODALS ==================== */}
      <PasswordGate
        isOpen={passwordGateOpen}
        onSuccess={() => {
          setPasswordGateOpen(false);
          if (pendingGateAction) {
            pendingGateAction();
            setPendingGateAction(null);
          }
        }}
        onCancel={() => {
          setPasswordGateOpen(false);
          setPendingGateAction(null);
        }}
      />
      {/* Schedule Screen */}
      {showSchedule && (
        <ScheduleScreen
          accountId={currentAccount?._id}
          currentMember={currentMember}
          onClose={() => setShowSchedule(false)}
        />
      )}
      {/* Notification Center Modal */}
      {showNotificationCenter && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="w-full h-full overflow-auto">
            <NotificationCenter
              onClose={() => {
                setShowNotificationCenter(false);
                setHighlightNotificationId(null);
              }}
              onOpenSettings={() => {
                setShowNotificationCenter(false);
                setShowNotificationSettings(true);
              }}
              highlightId={highlightNotificationId}
            />
          </div>
        </div>
      )}
      {/* Notification Settings Modal */}
      {showNotificationSettings && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="w-full h-full overflow-auto">
            <NotificationSettings
              onClose={() => setShowNotificationSettings(false)}
            />
          </div>
        </div>
      )}
      {/* Status Modal (Success/Error) */}
      {statusModal.show && (
        <div className="fixed inset-0 z-[70] bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className={`bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative transform transition-all animate-bounce-in ${
              statusModal.type === "success"
                ? "border-4 border-green-500"
                : "border-4 border-red-500"
            }`}
          >
            {/* Close button */}
            <button
              onClick={() =>
                setStatusModal({ show: false, type: "", message: "" })
              }
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Icon */}
            <div
              className={`flex items-center justify-center w-20 h-20 mx-auto mb-6 rounded-full ${
                statusModal.type === "success" ? "bg-green-100" : "bg-red-100"
              }`}
            >
              {statusModal.type === "success" ? (
                <CheckCircle2 className="w-12 h-12 text-green-600" />
              ) : (
                <AlertCircle className="w-12 h-12 text-red-600" />
              )}
            </div>

            {/* Title */}
            <h3
              className={`text-2xl font-bold text-center mb-3 ${
                statusModal.type === "success"
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {statusModal.type === "success" ? "Success!" : "Error!"}
            </h3>

            {/* Message */}
            <p className="text-gray-700 text-center text-lg mb-6">
              {statusModal.message}
            </p>

            {/* OK Button */}
            <button
              onClick={() =>
                setStatusModal({ show: false, type: "", message: "" })
              }
              className={`w-full py-3 rounded-lg font-semibold text-white transition-colors ${
                statusModal.type === "success"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              }`}
            >
              OK
            </button>
          </div>
        </div>
      )}
      {/* Loading Modal */}
      {loading && (
        <div className="fixed inset-0 z-[75] bg-black bg-opacity-70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 text-center">
            {/* Animated Spinner */}
            <div className="flex justify-center mb-6">
              <div className="relative w-20 h-20">
                <div className="absolute inset-0 border-4 border-indigo-200 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
              </div>
            </div>

            {/* Loading Text */}
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              {loadingMessage || "Processing..."}
            </h3>
            <p className="text-gray-500 text-sm">Please wait a moment</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
