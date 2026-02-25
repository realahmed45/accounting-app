import React, { useState, useEffect } from "react";
import { useAuth } from "./context/AuthContext";
import { useAccount } from "./context/AccountContext";
import AuthScreen from "./components/AuthScreen";
import AccountSwitcher from "./components/AccountSwitcher";
import PhotoUploadModal from "./components/PhotoUploadModal";
import AcceptInvitationScreen from "./components/AcceptInvitationScreen";
import InviteModal from "./components/InviteModal";
import TransferOwnershipModal from "./components/TransferOwnershipModal";
import OwnershipCorrectionModal from "./components/OwnershipCorrectionModal";
import PasswordGate from "./components/PasswordGate";
import ScheduleScreen from "./components/schedule/ScheduleScreen";
import {
  weekService,
  expenseService,
  photoService,
  bankAccountService,
  memberService,
  invitationService,
  activityService,
} from "./services/api";
import { 
  sendInvitationEmail, 
  sendOwnershipTransferEmail 
} from "./services/emailService";
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
  User,
  Users,
  Mail,
  Shield,
  Crown,
  UserPlus,
  UserMinus,
  CalendarDays,
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
    loading: accountLoading,
  } = useAccount();

  // State Management
  const [weeks, setWeeks] = useState([]);
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0);
  const [expandedDays, setExpandedDays] = useState([formatDate(new Date())]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);

  const [bankAccounts, setBankAccounts] = useState([]);
  const [showBankAccountsList, setShowBankAccountsList] = useState(false);
  const [activityLog, setActivityLog] = useState([]);

  // Modal States
  const [activeModal, setActiveModal] = useState(null);
  const [showHistoryTab, setShowHistoryTab] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settingsSection, setSettingsSection] = useState(null); // "users" | "categories" | "bankAccounts"
  const [showSummary, setShowSummary] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedHistoryWeek, setSelectedHistoryWeek] = useState(null);
  const [selectedExpenseForPhoto, setSelectedExpenseForPhoto] = useState(null);
  const [showCreateAccountModal, setShowCreateAccountModal] = useState(false);
  const [baCurrencyOpen, setBaCurrencyOpen] = useState(false);
  const [baCurrencySearch, setBaCurrencySearch] = useState("");
  const [showInviteModal, setShowInviteModal] = useState(false);

  // Members management state
  const [members, setMembers] = useState([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [membersError, setMembersError] = useState("");
  const [showAddMemberForm, setShowAddMemberForm] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberDisplayName, setNewMemberDisplayName] = useState("");
  const [newMemberPerms, setNewMemberPerms] = useState({
    calculateCash: false,
    accessSettings: false,
    addUser: false,
    addCategories: false,
    addBankAccount: false,
    makeExpense: true,
    createAccountDownward: false,
    createAccountUpward: false,
  });
  const [newMemberSubmitting, setNewMemberSubmitting] = useState(false);
  const [newMemberError, setNewMemberError] = useState("");
  const [editingMember, setEditingMember] = useState(null); // member object being edited
  const [editPerms, setEditPerms] = useState({});
  const [editDisplayName, setEditDisplayName] = useState("");
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState("");
  const [transferOwnershipTarget, setTransferOwnershipTarget] = useState("");
  const [transferOwnershipConfirm, setTransferOwnershipConfirm] =
    useState(false);

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
    currency: "USD",
  });
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

  // Accept Invitation flow state
  const [inviteToken, setInviteToken] = useState(null);
  const [inviteDetails, setInviteDetails] = useState(null);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState("");
  const [inviteForm, setInviteForm] = useState({
    firstName: "",
    lastName: "",
    password: "",
    confirmPassword: "",
  });
  const [inviteSubmitting, setInviteSubmitting] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState(false);
  // Pending invitations shown in Settings → Users
  const [pendingInvitations, setPendingInvitations] = useState([]);
  const [inviteSentLink, setInviteSentLink] = useState(""); // link returned when SMTP not configured
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showCorrectionModal, setShowCorrectionModal] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [passwordGateOpen, setPasswordGateOpen] = useState(false);

  // Scroll lock management
  useEffect(() => {
    if (showSchedule || showTransferModal || showCorrectionModal || showInviteModal || passwordGateOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showSchedule, showTransferModal, showCorrectionModal, showInviteModal, passwordGateOpen]);
  const [pendingGateAction, setPendingGateAction] = useState(null);
  const [transferStatus, setTransferStatus] = useState(null);
  const [activityLogs, setActivityLogs] = useState([]);
  const [activityFilter, setActivityFilter] = useState("");
  const [activityLoading, setActivityLoading] = useState(false);

  // Detect invite token in URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const isInvite = params.get("invite") === "1";
    if (token && isInvite) {
      setInviteToken(token);
      // Fetch invitation details
      setInviteLoading(true);
      invitationService
        .getDetails(token)
        .then((res) => {
          if (res.success) setInviteDetails(res.data);
          else setInviteError(res.message || "Invalid invitation");
        })
        .catch((err) =>
          setInviteError(
            err.response?.data?.message || "Failed to load invitation",
          ),
        )
        .finally(() => setInviteLoading(false));
    }
  }, []);

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

  const loadMembers = async () => {
    if (!currentAccount) return;
    setMembersLoading(true);
    setMembersError("");
    try {
      const res = await memberService.getAll(currentAccount._id);
      if (res.success) setMembers(res.data);
      else setMembersError(res.message || "Failed to load members");
    } catch (err) {
      setMembersError(err.response?.data?.message || "Failed to load members");
    } finally {
      setMembersLoading(false);
    }
  };

  // Load members when opening Users settings section
  useEffect(() => {
    if (settingsSection === "users" && currentAccount) {
      loadMembers();
      loadPendingInvitations();
      loadTransferStatus();
    }
    if (settingsSection === "activityLog" && currentAccount) {
      loadActivityLog();
    }
  }, [settingsSection, currentAccount]);

  const loadPendingInvitations = async () => {
    if (!currentAccount) return;
    try {
      const res = await memberService.getInvitations(currentAccount._id);
      if (res.success) setPendingInvitations(res.data);
    } catch {
      setPendingInvitations([]);
    }
  };

  const loadTransferStatus = async () => {
    if (!currentAccount) return;
    try {
      const res = await memberService.getTransferStatus(currentAccount._id);
      if (res.success) setTransferStatus(res.data);
    } catch {
      setTransferStatus(null);
    }
  };

  const loadActivityLog = async (filterOverride) => {
    if (!currentAccount) return;
    setActivityLoading(true);
    const filterToUse =
      filterOverride !== undefined ? filterOverride : activityFilter;
    try {
      const res = await activityService.getLog(currentAccount._id, {
        action: filterToUse || undefined,
      });
      if (res.success) setActivityLogs(res.data || []);
    } catch {
      setActivityLogs([]);
    } finally {
      setActivityLoading(false);
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

  const handleAddMember = async () => runIfAllowed(async () => {
    if (!newMemberEmail.trim()) {
      setNewMemberError("Email is required");
      return;
    }

    const trace = (msg, d) => {
      console.log(`[App Invite Trace] ${msg}`, d || "");
      if (!window.DEBUG_APP_INVITE) window.DEBUG_APP_INVITE = [];
      window.DEBUG_APP_INVITE.push({ time: new Date().toISOString(), msg, d });
    };

    trace("handleAddMember triggered", { email: newMemberEmail });

    setNewMemberSubmitting(true);
    setNewMemberError("");
    setInviteSentLink("");
    try {
      trace("Calling API memberService.add...");
      const res = await memberService.add(currentAccount._id, {
        email: newMemberEmail.trim(),
        displayName: newMemberDisplayName.trim() || undefined,
        permissions: newMemberPerms,
      });

      trace("API Response", res);

      if (res.success) {
        trace("Triggering Email Service...");
        const inviterName = res.inviterName || `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || user?.email;
        
        const emailResult = await sendInvitationEmail({
          toEmail: newMemberEmail.trim(),
          inviterName,
          accountName: res.accountName || currentAccount.accountName,
          inviteLink: res.inviteLink,
          permissions: newMemberPerms,
        });

        trace("Email Service Result", emailResult);

        if (!emailResult.sent) {
          trace("Email failed/skipped", emailResult.error);
          if (res.inviteLink) setInviteSentLink(res.inviteLink);
        }

        setShowAddMemberForm(false);
        setNewMemberEmail("");
        setNewMemberDisplayName("");
        setNewMemberPerms({
          calculateCash: false,
          accessSettings: false,
          addUser: false,
          addCategories: false,
          addBankAccount: false,
          makeExpense: true,
          createAccountDownward: false,
          createAccountUpward: false,
        });
        await loadPendingInvitations();
      } else {
        trace("API reported failure", res.message);
        setNewMemberError(res.message || "Failed to send invitation");
      }
    } catch (err) {
      console.error("[App Invite] CRITICAL CATCH:", err);
      trace("CATCH BLOCK ERROR", { 
        msg: err.message, 
        stack: err.stack,
        resp: err.response?.data
      });
      setNewMemberError(
        err.response?.data?.message || "Failed to send invitation",
      );
    } finally {
      setNewMemberSubmitting(false);
    }
  });

  const handleUpdateMember = async () => runIfAllowed(async () => {
    if (!editingMember) return;
    setEditSubmitting(true);
    setEditError("");
    try {
      const res = await memberService.update(
        currentAccount._id,
        editingMember._id,
        {
          displayName: editDisplayName,
          permissions: editPerms,
        },
      );
      if (res.success) {
        setEditingMember(null);
        await loadMembers();
      } else {
        setEditError(res.message || "Failed to update member");
      }
    } catch (err) {
      setEditError(err.response?.data?.message || "Failed to update member");
    } finally {
      setEditSubmitting(false);
    }
  });

  const handleRemoveMember = async (memberId) => runIfAllowed(async () => {
    if (!window.confirm("Remove this member from the account?")) return;
    try {
      const res = await memberService.remove(currentAccount._id, memberId);
      if (res.success) await loadMembers();
      else alert(res.message || "Failed to remove member");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to remove member");
    }
  });

  const handleTransferOwnership = async () => {
    if (!transferOwnershipTarget) {
      alert("Select a member to transfer ownership to");
      return;
    }
    if (!transferOwnershipConfirm) {
      alert("Please confirm ownership transfer");
      return;
    }
    try {
      const res = await memberService.transferOwnership(
        currentAccount._id,
        transferOwnershipTarget,
      );
      if (res.success) {
        setTransferOwnershipTarget("");
        setTransferOwnershipConfirm(false);
        await loadMembers();
        alert("Ownership transferred successfully");
      } else {
        alert(res.message || "Failed to transfer ownership");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to transfer ownership");
    }
  };

  const handleCancelInvitation = async (invId) => {
    if (!window.confirm("Cancel this invitation?")) return;
    try {
      const res = await memberService.cancelInvitation(
        currentAccount._id,
        invId,
      );
      if (res.success) await loadPendingInvitations();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to cancel invitation");
    }
  };

  // Accept invitation form submit
  const handleAcceptInvite = async () => {
    const { firstName, lastName, password, confirmPassword } = inviteForm;
    if (!firstName.trim() || !lastName.trim()) {
      setInviteError("First and last name are required");
      return;
    }
    if (!password || password.length < 6) {
      setInviteError("Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      setInviteError("Passwords do not match");
      return;
    }
    setInviteSubmitting(true);
    setInviteError("");
    try {
      const res = await invitationService.accept(inviteToken, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        password,
      });
      if (res.success) {
        // Store auth credentials
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        setInviteSuccess(true);
        // Clear the token from URL and reload the app
        window.history.replaceState({}, "", "/");
        setTimeout(() => window.location.reload(), 1800);
      } else {
        setInviteError(res.message || "Failed to accept invitation");
      }
    } catch (err) {
      setInviteError(
        err.response?.data?.message || "Failed to accept invitation",
      );
    } finally {
      setInviteSubmitting(false);
    }
  };

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

  const resetAccountForm = () => {
    setAccountKind("");
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

  // Handle invite token (works for both authenticated and non-authenticated users)
  if (inviteToken) {
    return (
      <AcceptInvitationScreen
        token={inviteToken}
        onAccepted={() => {
          setInviteToken(null);
          window.location.reload();
        }}
      />
    );
  }

  // Show auth screen if not logged in
  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  // Show loading while account data loads
  if (accountLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="bg-white shadow border border-gray-200 p-8 max-w-md w-full text-center">
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white shadow-2xl p-8 max-w-md w-full">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-800">
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

              {/* Step 1: choose kind */}
              {accountKind === "" && (
                <div className="space-y-3">
                  <p className="text-sm text-gray-500 mb-4">
                    What type of account would you like to create?
                  </p>
                  <button
                    type="button"
                    onClick={() => setAccountKind("personal")}
                    className="w-full flex items-center gap-4 p-4 border-2 border-gray-200 rounded-xl hover:border-indigo-400 hover:bg-indigo-50 transition-all text-left"
                  >
                    <div className="bg-green-100 p-3 rounded-lg flex-shrink-0">
                      <User className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">
                        Personal Account
                      </p>
                      <p className="text-sm text-gray-500">
                        For personal expense tracking
                      </p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAccountKind("business")}
                    className="w-full flex items-center gap-4 p-4 border-2 border-gray-200 rounded-xl hover:border-indigo-400 hover:bg-indigo-50 transition-all text-left"
                  >
                    <div className="bg-indigo-100 p-3 rounded-lg flex-shrink-0">
                      <Building2 className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">
                        Business Account
                      </p>
                      <p className="text-sm text-gray-500">
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      autoFocus
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setAccountKind("")}
                      className="px-5 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      ← Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
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
                  </div>
                </form>
              )}

              {/* Step 2b: Business */}
              {accountKind === "business" && (
                <form onSubmit={handleCreateAccount} className="space-y-4">
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        required
                      />
                    </div>
                  )}
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setAccountKind("")}
                      className="px-5 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      ← Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
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
                  </div>
                </form>
              )}
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

  const handleAddCash = async () => runIfAllowed(async () => {
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
        setSuccess("Cash added successfully!");
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (error) {
      setError(error.response?.data?.message || "Failed to add cash");
    }
  });

  const handleTransferToCash = async () => runIfAllowed(async () => {
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
        setSuccess("Transfer completed!");
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (error) {
      setError(error.response?.data?.message || "Failed to transfer");
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
        setSuccess("Expense added successfully!");
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (error) {
      setError(error.response?.data?.message || "Failed to add expense");
    }
    }); // end runIfAllowed
  };

  const handleDeleteExpense = async (expenseId) => runIfAllowed(async () => {
    if (!window.confirm("Are you sure you want to delete this expense?")) {
      return;
    }

    try {
      const response = await expenseService.delete(expenseId);
      if (response.success) {
        setExpenses(expenses.filter((exp) => exp._id !== expenseId));

        // Reload week and bank accounts to reflect updated balances
        await loadWeeks();
        await loadBankAccounts();

        setSuccess("Expense deleted successfully!");
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (error) {
      setError(error.response?.data?.message || "Failed to delete expense");
    }
  });

  const handleLockWeek = async () => runIfAllowed(async () => {
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
  });

  const createNewWeek = async () => runIfAllowed(async () => {
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

    setLoading(true);
    setError("");

    try {
      const payload = {
        name: bankAccountForm.name.trim(),
        bankName: bankAccountForm.bankName.trim(),
        accountType: bankAccountForm.accountType,
        lastFourDigits: bankAccountForm.lastFourDigits.trim(),
        balance: parseFloat(bankAccountForm.balance) || 0,
        currency: bankAccountForm.currency || "USD",
      };

      const res = await bankAccountService.create(currentAccount._id, payload);

      if (res.success) {
        await loadBankAccounts();
        setBankAccountForm({
          name: "",
          bankName: "",
          accountType: "checking",
          lastFourDigits: "",
          balance: "",
          currency: "USD",
        });
        setActiveModal(null);
        setSuccess("Bank account added successfully!");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(res.message || "Failed to save");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save bank account");
    }
    setLoading(false);
    }); // end runIfAllowed
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-40 border-b border-gray-200">
        <div className="w-full px-6 xl:px-12 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-3 rounded-xl shadow-lg hover:shadow-xl transition-all">
                <Wallet className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Weekly Accounting
                </h1>
                <p className="text-sm text-gray-600 font-medium">
                  Welcome back, {user?.firstName} 👋
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <AccountSwitcher />
              {currentMember?.viewOnly && (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-gray-100 border border-gray-200 text-gray-500 text-xs font-bold uppercase tracking-wider rounded-lg shadow-inner">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse"></div>
                  View Only
                </div>
              )}
              {hasPermission("accessSettings") && (
                <button
                  onClick={() => setShowSettings(true)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors font-medium border border-gray-200"
                >
                  <Settings className="w-4 h-4" />
                  <span className="hidden sm:inline">Settings</span>
                </button>
              )}
              <button
                onClick={logout}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 transition-all shadow-md hover:shadow-lg font-medium"
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
        <div className="w-full px-6 xl:px-12 mt-4">
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-xl flex items-center gap-2 shadow-sm">
            <CheckCircle2 className="w-5 h-5" />
            {success}
          </div>
        </div>
      )}
      {error && (
        <div className="w-full px-6 xl:px-12 mt-4">
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl flex items-center gap-2 shadow-sm">
            <AlertCircle className="w-5 h-5" />
            {error}
            <button
              onClick={() => setError("")}
              className="ml-auto hover:bg-red-100 p-1 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
      {/* Main Content */}
      <div className="w-full px-6 xl:px-12 py-6">
        {/* Top Action Bar */}
        <div className="flex justify-end gap-3 mb-6">
          <button
            onClick={() => setShowHistoryTab(!showHistoryTab)}
            className={`px-6 py-3 transition-all flex items-center gap-2 font-semibold shadow-md hover:shadow-xl ${
              showHistoryTab
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            <History className="w-5 h-5" />
            Unified Feed
          </button>

          <button
            onClick={() => setShowSchedule(true)}
            className="px-6 py-3 transition-all flex items-center gap-2 font-semibold shadow-md bg-white text-gray-700 hover:bg-gray-50 hover:shadow-xl"
          >
            <CalendarDays className="w-5 h-5 text-indigo-600" />
            Schedule
          </button>
        </div>

        {showHistoryTab ? (
          <div className="bg-white shadow-xl p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-3 rounded-xl">
                <History className="w-8 h-8 text-white" />
              </div>
              Activity History
            </h2>

            {/* Activity Timeline */}
            <div className="space-y-4">
              {expenses.length === 0 &&
                (!currentWeek?.cashTransactions ||
                  currentWeek.cashTransactions.length === 0) && (
                  <div className="text-center py-16 text-gray-400">
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
                  className="border-l-4 border-indigo-200 pl-6 pb-6"
                >
                  <div className="sticky top-0 bg-white pb-3 mb-4">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-indigo-600" />
                      <h3 className="text-lg font-bold text-gray-800">
                        {formatDateReadable(new Date(date))}
                      </h3>
                      <span className="text-sm text-gray-500">
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
                            className="bg-gradient-to-r from-gray-50 to-white border border-gray-200 p-4 hover:shadow-md border border-gray-200 transition-all"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="bg-red-100 p-2 rounded-lg">
                                    <Receipt className="w-4 h-4 text-red-600" />
                                  </div>
                                  <span className="font-semibold text-gray-800">
                                    Expense
                                  </span>
                                  <span className="text-xl font-bold text-red-600">
                                    -${exp.amount.toFixed(2)}
                                  </span>
                                </div>
                                <div className="flex flex-wrap items-center gap-2 ml-10">
                                  <span className="px-3 py-1 bg-indigo-100 text-indigo-800 text-sm rounded-full font-medium">
                                    {exp.category}
                                  </span>
                                  {exp.paymentSource === "bank" &&
                                    exp.bankAccountId && (
                                      <span className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full font-medium">
                                        <CreditCard className="w-3 h-3" />
                                        {bankAccounts.find(
                                          (ba) => ba._id === exp.bankAccountId,
                                        )?.name || "Bank"}
                                      </span>
                                    )}
                                  {exp.paymentSource === "cash" && (
                                    <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-sm rounded-full font-medium">
                                      💵 Cash
                                    </span>
                                  )}
                                </div>
                                {exp.note && (
                                  <p className="text-sm text-gray-600 mt-2 ml-10">
                                    {exp.note}
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

                      if (activity.type === "cash") {
                        const ct = activity.data;
                        return (
                          <div
                            key={idx}
                            className="bg-gradient-to-r from-green-50 to-white border border-green-200 p-4 hover:shadow-md transition-all"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="bg-green-100 p-2 rounded-lg">
                                    <Wallet className="w-4 h-4 text-green-600" />
                                  </div>
                                  <span className="font-semibold text-gray-800">
                                    Cash Added
                                  </span>
                                  <span className="text-xl font-bold text-green-600">
                                    +${ct.amount.toFixed(2)}
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
            <div className="bg-gradient-to-r from-white to-gray-50 shadow-xl p-6 mb-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-3 rounded-xl shadow-lg">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">
                      Week {currentWeekIndex + 1} of {weeks.length}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {formatDateReadable(weekStartDate)} -{" "}
                      {formatDateReadable(weekEndDate)}
                    </p>
                  </div>
                </div>
                {currentWeek.isLocked && (
                  <span className="flex items-center gap-2 bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 px-4 py-2 rounded-xl text-sm font-medium shadow-md">
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
                  disabled={currentWeekIndex === weeks.length - 1}
                  className="px-5 py-2.5 bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-gray-300 font-medium shadow-sm hover:shadow-md transition-all flex items-center gap-2"
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
                  disabled={currentWeekIndex === 0}
                  className="px-5 py-2.5 bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-gray-300 font-medium shadow-sm hover:shadow-md transition-all flex items-center gap-2"
                >
                  Next Week
                  <ChevronUp className="w-4 h-4 rotate-90" />
                </button>
                {currentWeekIndex === 0 && !currentWeek.isLocked && (
                  <button
                    onClick={createNewWeek}
                    className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 flex items-center gap-2 font-medium shadow-md hover:shadow-lg transition-all"
                  >
                    <Plus className="w-5 h-5" />
                    New Week
                  </button>
                )}
                {!currentWeek.isLocked && hasPermission("makeExpense") && (
                  <button
                    onClick={() => setActiveModal("lockWeek")}
                    className="px-5 py-2.5 bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600 flex items-center gap-2 ml-auto font-medium shadow-md hover:shadow-lg transition-all"
                  >
                    <Lock className="w-5 h-5" />
                    Lock Week
                  </button>
                )}
              </div>
            </div>

            {/* Financial Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
              {/* Bank Balance Card */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 shadow-xl p-6 border border-blue-100">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="bg-blue-600 p-2 rounded-lg">
                      <Building2 className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      Bank Balance
                    </span>
                  </div>
                </div>
                {/* Clickable balance — opens accounts window */}
                <button
                  onClick={() => setActiveModal("bankAccounts")}
                  className="w-full text-left group mb-4"
                  disabled={bankAccounts.length === 0}
                >
                  <div className="text-4xl font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
                    ${getExpectedBankAmount().toFixed(2)}
                  </div>
                  <div className="text-xs mt-1 font-medium text-blue-600">
                    {bankAccounts.length} account
                    {bankAccounts.length !== 1 ? "s" : ""} linked
                    {bankAccounts.length > 0 && (
                      <span className="ml-1 underline underline-offset-2 opacity-70 group-hover:opacity-100">
                        — view all
                      </span>
                    )}
                  </div>
                </button>

                <div className="space-y-2">
                  {!currentWeek.isLocked && hasPermission("addBankAccount") && (
                    <button
                      onClick={() => setActiveModal("addBankAccount")}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 transition-all flex items-center justify-center gap-2 font-medium shadow-md hover:shadow-lg"
                    >
                      <Plus className="w-4 h-4" />
                      Add New Bank
                    </button>
                  )}
                  {!currentWeek.isLocked &&
                    bankAccounts.length > 0 &&
                    hasPermission("calculateCash") && (
                      <button
                        onClick={() => setActiveModal("transfer")}
                        className="w-full bg-white hover:bg-gray-50 text-blue-700 border-2 border-blue-600 px-4 py-2.5 transition-all flex items-center justify-center gap-2 font-medium shadow-md hover:shadow-lg"
                      >
                        <ArrowRightLeft className="w-4 h-4" />
                        Bank → Cash
                      </button>
                    )}
                </div>
              </div>

              {/* Cash Box Card */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 shadow-xl p-6 border border-green-100">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="bg-green-600 p-2 rounded-lg">
                      <Wallet className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      Cash Box
                    </span>
                  </div>
                </div>
                <div className="text-4xl font-bold text-gray-900 mb-2">
                  ${getExpectedCashAmount().toFixed(2)}
                </div>
                <div className="text-xs text-gray-600 mb-4">
                  Current balance
                </div>
                {!currentWeek.isLocked && hasPermission("calculateCash") && (
                  <button
                    onClick={() => setActiveModal("addCash")}
                    className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 transition-all flex items-center justify-center gap-2 font-medium shadow-md hover:shadow-lg"
                  >
                    <DollarSign className="w-4 h-4" />
                    Add Cash
                  </button>
                )}
              </div>

              {/* Total Expenses Card */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 shadow-xl p-6 border border-purple-100">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="bg-purple-600 p-2 rounded-lg">
                      <Receipt className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      Total Expenses
                    </span>
                  </div>
                </div>
                <div className="text-4xl font-bold text-gray-900 mb-2">
                  ${getTotalExpenses().toFixed(2)}
                </div>
                <div className="text-xs text-gray-600 mb-4">
                  {expenses.length} transaction
                  {expenses.length !== 1 ? "s" : ""}
                </div>
                {!currentWeek.isLocked && hasPermission("makeExpense") && (
                  <button
                    onClick={() => setActiveModal("addExpense")}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 transition-all flex items-center justify-center gap-2 font-medium shadow-md hover:shadow-lg"
                  >
                    <Plus className="w-4 h-4" />
                    Add Expense
                  </button>
                )}
              </div>
            </div>

            {/* Daily Breakdown */}
            <div className="bg-white shadow-xl p-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <div className="bg-gradient-to-br from-purple-600 to-pink-600 p-3 rounded-xl">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
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
                      className="border-2 border-gray-200 overflow-hidden hover:border-indigo-300 transition-all shadow-sm hover:shadow-md"
                    >
                      <button
                        onClick={() => toggleDayExpansion(dateStr)}
                        className="w-full px-6 py-4 bg-gradient-to-r from-gray-50 to-white hover:from-indigo-50 hover:to-purple-50 flex items-center justify-between transition-all"
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`p-2 rounded-lg ${isExpanded ? "bg-indigo-600" : "bg-gray-300"}`}
                          >
                            <Calendar
                              className={`w-5 h-5 ${isExpanded ? "text-white" : "text-gray-600"}`}
                            />
                          </div>
                          <span className="font-bold text-gray-800 text-lg">
                            {formatDateReadable(date)}
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="text-lg font-bold text-gray-900">
                              ${dayTotal.toFixed(2)}
                            </div>
                            <div className="text-xs text-gray-500">
                              {dayExpenses.length} transaction
                              {dayExpenses.length !== 1 ? "s" : ""}
                            </div>
                          </div>
                          {isExpanded ? (
                            <ChevronUp className="w-6 h-6 text-indigo-600" />
                          ) : (
                            <ChevronDown className="w-6 h-6 text-gray-400" />
                          )}
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="p-5 bg-white space-y-3 border-t-2 border-gray-100">
                          {dayExpenses.length === 0 ? (
                            <div className="text-center py-8 text-gray-400">
                              <Receipt className="w-12 h-12 mx-auto mb-3 opacity-30" />
                              <p className="font-medium">
                                No expenses for this day
                              </p>
                            </div>
                          ) : (
                            dayExpenses.map((expense) => (
                              <div
                                key={expense._id}
                                className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-xl hover:shadow-lg hover:border-indigo-200 transition-all group"
                              >
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <div className="bg-red-100 p-2 rounded-lg group-hover:bg-red-200 transition-colors">
                                      <Receipt className="w-4 h-4 text-red-600" />
                                    </div>
                                    <span className="text-xl font-bold text-gray-800">
                                      ${expense.amount.toFixed(2)}
                                    </span>
                                    <span className="px-3 py-1 bg-indigo-100 text-indigo-800 text-sm rounded-full font-medium">
                                      {expense.category}
                                    </span>
                                    {expense.paymentSource === "bank" &&
                                      expense.bankAccountId && (
                                        <span className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full font-medium">
                                          <CreditCard className="w-3 h-3" />
                                          {bankAccounts.find(
                                            (ba) =>
                                              ba._id === expense.bankAccountId,
                                          )?.name || "Bank"}
                                        </span>
                                      )}
                                    {expense.paymentSource === "cash" && (
                                      <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-sm rounded-full font-medium">
                                        💵 Cash
                                      </span>
                                    )}
                                  </div>
                                  {expense.note && (
                                    <p className="text-sm text-gray-600 ml-10">
                                      {expense.note}
                                    </p>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() =>
                                      setSelectedExpenseForPhoto(expense)
                                    }
                                    className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-xl transition-all hover:shadow-md"
                                    title="View/Upload Photos"
                                  >
                                    <Camera className="w-5 h-5" />
                                  </button>
                                  {!currentWeek.isLocked &&
                                    hasPermission("makeExpense") && (
                                      <button
                                        onClick={() =>
                                          handleDeleteExpense(expense._id)
                                        }
                                        className="p-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-all hover:shadow-md"
                                        title="Delete"
                                      >
                                        <Trash2 className="w-5 h-5" />
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
          </>
        )}
      </div>
      {/* Modals */}
      {activeModal === "bankAccounts" && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white shadow-2xl w-full max-w-xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="bg-blue-600 p-2.5 rounded-lg">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Bank Accounts
                  </h3>
                  <p className="text-xs text-gray-500">
                    {bankAccounts.length} account
                    {bankAccounts.length !== 1 ? "s" : ""} linked
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="text-gray-400 hover:text-gray-700 hover:bg-gray-100 p-2 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Accounts List */}
            <div className="divide-y divide-gray-100">
              {bankAccounts.length === 0 ? (
                <div className="py-16 text-center">
                  <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">
                    No accounts added yet
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    Use the Add New Bank button to link an account
                  </p>
                </div>
              ) : (
                bankAccounts.map((ba) => (
                  <div
                    key={ba._id}
                    className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-blue-100 p-2.5 rounded-lg flex-shrink-0">
                        <CreditCard className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 text-base">
                          {ba.name}
                          {ba.lastFourDigits && (
                            <span className="text-gray-400 font-normal ml-2 text-sm">
                              ···{ba.lastFourDigits}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-0.5">
                          {ba.bankName && (
                            <span className="text-sm text-gray-500">
                              {ba.bankName}
                            </span>
                          )}
                          {ba.accountType && (
                            <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 capitalize font-medium">
                              {ba.accountType}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-gray-900">
                        ${ba.balance.toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Total Row */}
            {bankAccounts.length > 0 && (
              <div className="flex items-center justify-between px-6 py-4 bg-blue-600 text-white">
                <span className="font-semibold text-base">Total Balance</span>
                <span className="text-2xl font-bold">
                  ${getExpectedBankAmount().toFixed(2)}
                </span>
              </div>
            )}

            {/* Footer Actions */}
            <div className="flex gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
              {!currentWeek.isLocked && (
                <button
                  onClick={() => setActiveModal("addBankAccount")}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 transition-colors flex items-center justify-center gap-2 font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Add New Account
                </button>
              )}
              <button
                onClick={() => setActiveModal(null)}
                className="px-6 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {activeModal === "addCash" && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="bg-green-600 p-2.5 rounded-lg">
                  <Wallet className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  Add Cash to Box
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
                Add Cash
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
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
                ${getExpectedBankAmount().toFixed(2)}
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
                        ${ba.balance.toFixed(2)}
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
                    $
                    {bankAccounts
                      .find((ba) => ba._id === selectedBankAccountForTransfer)
                      ?.balance.toFixed(2) || "0.00"}
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white shadow-xl max-w-xl w-full p-6 my-8">
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
                    currency: "USD",
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
                </label>
                {/* Currency trigger button */}
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
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                      baCurrencyOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {/* Inline expandable panel */}
                {baCurrencyOpen && (
                  <div className="mt-2 border border-gray-200 rounded-xl overflow-hidden shadow-md">
                    <div className="p-2 bg-gray-50 border-b border-gray-100">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          autoFocus
                          value={baCurrencySearch}
                          onChange={(e) => setBaCurrencySearch(e.target.value)}
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
                      currency: "USD",
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
      {activeModal === "addExpense" && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
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
                      ${getExpectedCashAmount().toFixed(2)}
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
                          ${ba.balance.toFixed(2)}
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white shadow-2xl p-8 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-800">
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

            {/* Step 1: choose kind */}
            {accountKind === "" && (
              <div className="space-y-3">
                <p className="text-sm text-gray-500 mb-4">
                  What type of account would you like to create?
                </p>
                <button
                  type="button"
                  onClick={() => setAccountKind("personal")}
                  className="w-full flex items-center gap-4 p-4 border-2 border-gray-200 rounded-xl hover:border-indigo-400 hover:bg-indigo-50 transition-all text-left"
                >
                  <div className="bg-green-100 p-3 rounded-lg flex-shrink-0">
                    <User className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">
                      Personal Account
                    </p>
                    <p className="text-sm text-gray-500">
                      For personal expense tracking
                    </p>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setAccountKind("business")}
                  className="w-full flex items-center gap-4 p-4 border-2 border-gray-200 rounded-xl hover:border-indigo-400 hover:bg-indigo-50 transition-all text-left"
                >
                  <div className="bg-indigo-100 p-3 rounded-lg flex-shrink-0">
                    <Building2 className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">
                      Business Account
                    </p>
                    <p className="text-sm text-gray-500">
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    autoFocus
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setAccountKind("")}
                    className="px-5 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    ← Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
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
                </div>
              </form>
            )}

            {/* Step 2b: Business */}
            {accountKind === "business" && (
              <form onSubmit={handleCreateAccount} className="space-y-4">
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      required
                    />
                  </div>
                )}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setAccountKind("")}
                    className="px-5 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    ← Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
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
                </div>
              </form>
            )}
          </div>
        </div>
      )}
      {selectedExpenseForPhoto && (
        <PhotoUploadModal
          expenseId={selectedExpenseForPhoto._id}
          onClose={() => setSelectedExpenseForPhoto(null)}
        />
      )}
      {/* ==================== SETTINGS SCREEN ==================== */}
      {showSettings && (
        <div className="fixed inset-0 bg-white z-50 flex flex-col">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 px-6 xl:px-12 py-4 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              {settingsSection && (
                <button
                  onClick={() => setSettingsSection(null)}
                  className="p-2 hover:bg-gray-100 text-gray-500 transition-colors mr-1"
                >
                  <ChevronDown className="w-5 h-5 rotate-90" />
                </button>
              )}
              <div className="bg-gray-900 p-2.5 rounded-lg">
                <Settings className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">
                {settingsSection === "users" && "Users"}
                {settingsSection === "categories" && "Categories"}
                {settingsSection === "bankAccounts" && "Bank Accounts"}
                {settingsSection === "activityLog" && "Activity Log"}
                {!settingsSection && "Settings"}
              </h1>
            </div>
            <button
              onClick={() => {
                setShowSettings(false);
                setSettingsSection(null);
              }}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-600 hover:bg-gray-100 transition-colors font-medium"
            >
              <X className="w-4 h-4" />
              Close
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto">
            {/* ── Landing: 4 buttons ── */}
            {!settingsSection && (
              <div className="max-w-lg mx-auto px-6 py-12 space-y-3">
                {[
                  {
                    key: "users",
                    icon: <User className="w-6 h-6" />,
                    label: "Users",
                    desc: "Manage access & team members",
                    color: "bg-indigo-600",
                  },
                  {
                    key: "categories",
                    icon: <BarChart3 className="w-6 h-6" />,
                    label: "Categories",
                    desc: "View & manage expense categories",
                    color: "bg-purple-600",
                  },
                  {
                    key: "bankAccounts",
                    icon: <Building2 className="w-6 h-6" />,
                    label: "Add Bank Account",
                    desc: "Link and manage bank accounts",
                    color: "bg-blue-600",
                  },
                  {
                    key: "activityLog",
                    icon: <History className="w-6 h-6" />,
                    label: "Activity Log",
                    desc: "View account audit trail",
                    color: "bg-gray-700",
                  },
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setSettingsSection(item.key)}
                    className="w-full flex items-center gap-5 px-6 py-5 bg-white border border-gray-200 hover:border-gray-400 hover:shadow-md transition-all text-left group"
                  >
                    <div
                      className={`${item.color} p-3 text-white flex-shrink-0`}
                    >
                      {item.icon}
                    </div>
                    <div className="flex-1">
                      <div className="text-lg font-bold text-gray-900">
                        {item.label}
                      </div>
                      <div className="text-sm text-gray-500">{item.desc}</div>
                    </div>
                    <ChevronDown className="w-5 h-5 text-gray-400 -rotate-90 group-hover:text-gray-700 transition-colors" />
                  </button>
                ))}
              </div>
            )}

            {/* ── Users Screen ── */}
            {settingsSection === "users" && (
              <div className="max-w-2xl mx-auto px-6 py-8">
                {/* Header row */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">
                      Account Members
                    </h2>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {members.length} member{members.length !== 1 ? "s" : ""}{" "}
                      in this account
                    </p>
                  </div>
                  {hasPermission("addUser") && !showAddMemberForm && (
                    <button
                      onClick={() => {
                        setShowAddMemberForm(true);
                        setNewMemberError("");
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
                    >
                      <UserPlus className="w-4 h-4" />
                      Invite Member
                    </button>
                  )}
                </div>

                {membersError && (
                  <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm">
                    {membersError}
                  </div>
                )}

                {/* Invite link banner — shown when SMTP not configured */}
                {inviteSentLink && (
                  <div className="mb-5 border border-green-200 bg-green-50 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-green-800 mb-1">
                          ✓ Invitation created! Email not configured — share
                          this link:
                        </p>
                        <input
                          readOnly
                          value={inviteSentLink}
                          className="w-full px-2 py-1.5 text-xs border border-green-300 bg-white text-gray-700 font-mono"
                          onClick={(e) => e.target.select()}
                        />
                      </div>
                      <button
                        onClick={() =>
                          navigator.clipboard
                            .writeText(inviteSentLink)
                            .then(() => alert("Link copied!"))
                        }
                        className="flex-shrink-0 px-3 py-1.5 bg-green-600 text-white text-xs font-medium hover:bg-green-700"
                      >
                        Copy
                      </button>
                    </div>
                    <button
                      onClick={() => setInviteSentLink("")}
                      className="mt-2 text-xs text-green-600 hover:underline"
                    >
                      Dismiss
                    </button>
                  </div>
                )}

                {/* Add Member Form */}
                {showAddMemberForm && (
                  <div className="mb-6 border border-indigo-200 bg-indigo-50 p-5">
                    <h3 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
                      <UserPlus className="w-4 h-4 text-indigo-600" /> Invite
                      New Member
                    </h3>
                    <p className="text-xs text-gray-500 mb-4">
                      They'll receive an email with a link to set up their
                      password and join this account.
                    </p>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Email *
                        </label>
                        <input
                          type="email"
                          value={newMemberEmail}
                          onChange={(e) => setNewMemberEmail(e.target.value)}
                          placeholder="user@example.com"
                          className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Display Name
                        </label>
                        <input
                          type="text"
                          value={newMemberDisplayName}
                          onChange={(e) =>
                            setNewMemberDisplayName(e.target.value)
                          }
                          placeholder="Optional"
                          className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                    <div className="mb-4">
                      <label className="block text-xs font-medium text-gray-600 mb-3">
                        Permissions
                      </label>
                      <div className="space-y-6">
                        {/* Module 1: Expenses & Cash */}
                        <div>
                          <p className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3">
                            Expenses &amp; Cash
                          </p>
                          <div className="grid grid-cols-2 gap-2">
                            {[
                              { key: "makeExpense", label: "Make Expenses" },
                              { key: "calculateCash", label: "Calculate Cash" },
                            ].map(({ key, label }) => (
                              <label
                                key={key}
                                className="flex items-center gap-2 text-sm cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  checked={!!newMemberPerms[key]}
                                  disabled={!hasPermission(key)}
                                  onChange={(e) =>
                                    setNewMemberPerms((prev) => ({
                                      ...prev,
                                      [key]: e.target.checked,
                                    }))
                                  }
                                  className="w-4 h-4 accent-indigo-600"
                                />
                                <span
                                  className={
                                    !hasPermission(key)
                                      ? "text-gray-400"
                                      : "text-gray-700"
                                  }
                                >
                                  {label}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>
                        {/* Module 2: Access Settings */}
                        <div>
                          <p className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3">
                            Access Settings
                          </p>
                          <div className="grid grid-cols-1 gap-2">
                            {[
                              {
                                key: "addUser",
                                label: "Manage / Create Users",
                              },
                              {
                                key: "addCategories",
                                label: "Manage / Create Categories",
                              },
                              {
                                key: "addBankAccount",
                                label: "Manage / Create Bank Accounts",
                              },
                            ].map(({ key, label }) => (
                              <label
                                key={key}
                                className="flex items-center gap-2 text-sm cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  checked={!!newMemberPerms[key]}
                                  disabled={!hasPermission(key)}
                                  onChange={(e) => {
                                    const checked = e.target.checked;
                                    setNewMemberPerms((prev) => {
                                      const next = { ...prev, [key]: checked };
                                      next.accessSettings = !!(
                                        next.addUser ||
                                        next.addCategories ||
                                        next.addBankAccount
                                      );
                                      return next;
                                    });
                                  }}
                                  className="w-4 h-4 accent-indigo-600"
                                />
                                <span
                                  className={
                                    !hasPermission(key)
                                      ? "text-gray-400"
                                      : "text-gray-700"
                                  }
                                >
                                  {label}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>
                        {/* Module 3: Account Structure */}
                        <div>
                          <p className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3">
                            Account Structure
                          </p>
                          <div className="grid grid-cols-2 gap-2">
                            {[
                              {
                                key: "createAccountDownward",
                                label: "Create Sub-Accounts",
                              },
                              {
                                key: "createAccountUpward",
                                label: "Link To Parent",
                              },
                            ].map(({ key, label }) => (
                              <label
                                key={key}
                                className="flex items-center gap-2 text-sm cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  checked={!!newMemberPerms[key]}
                                  disabled={!hasPermission(key)}
                                  onChange={(e) =>
                                    setNewMemberPerms((prev) => ({
                                      ...prev,
                                      [key]: e.target.checked,
                                    }))
                                  }
                                  className="w-4 h-4 accent-indigo-600"
                                />
                                <span
                                  className={
                                    !hasPermission(key)
                                      ? "text-gray-400"
                                      : "text-gray-700"
                                  }
                                >
                                  {label}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    {newMemberError && (
                      <p className="text-red-600 text-sm mb-3">
                        {newMemberError}
                      </p>
                    )}
                    <div className="flex gap-3">
                      <button
                        onClick={handleAddMember}
                        disabled={newMemberSubmitting}
                        className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                      >
                        {newMemberSubmitting ? "Sending…" : "Send Invitation"}
                      </button>
                      <button
                        onClick={() => {
                          setShowAddMemberForm(false);
                          setNewMemberError("");
                        }}
                        className="px-4 py-2 border border-gray-300 text-gray-600 text-sm hover:bg-gray-100 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Members list */}
                {membersLoading ? (
                  <div className="py-12 text-center text-gray-400 text-sm">
                    Loading members…
                  </div>
                ) : members.length === 0 ? (
                  <div className="py-12 text-center text-gray-400 text-sm border border-gray-200">
                    No members yet
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100 border border-gray-200">
                    {members.map((member) => {
                      const isEditing = editingMember?._id === member._id;
                      const isSelf =
                        member.userId?._id === user?._id ||
                        member.userId === user?._id;
                      const isOwner = member.role === "owner";
                      return (
                        <div key={member._id} className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-3 min-w-0">
                              <div
                                className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${isOwner ? "bg-yellow-100" : "bg-gray-100"}`}
                              >
                                {isOwner ? (
                                  <Crown className="w-4 h-4 text-yellow-600" />
                                ) : (
                                  <User className="w-4 h-4 text-gray-500" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-gray-900 text-sm">
                                    {member.displayName ||
                                      member.userId?.email ||
                                      "—"}
                                  </span>
                                  {isOwner && (
                                    <span className="text-xs px-1.5 py-0.5 bg-yellow-100 text-yellow-700 font-medium">
                                      Owner
                                    </span>
                                  )}
                                  {isSelf && (
                                    <span className="text-xs px-1.5 py-0.5 bg-indigo-100 text-indigo-700 font-medium">
                                      You
                                    </span>
                                  )}
                                  {member.viewOnly && (
                                    <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-500 font-medium">
                                      View Only
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                  <Mail className="w-3 h-3" />
                                  {member.userId?.email || "—"}
                                </div>
                              </div>
                            </div>
                            {!isOwner && (
                              <div className="flex items-center gap-2 flex-shrink-0">
                                {(currentMember?.role === "owner" || isSelf) &&
                                  !isEditing && (
                                    <button
                                      onClick={() => {
                                        setEditingMember(member);
                                        setEditPerms({ ...member.permissions });
                                        setEditDisplayName(
                                          member.displayName || "",
                                        );
                                        setEditError("");
                                      }}
                                      className="text-xs px-3 py-1.5 border border-gray-300 text-gray-600 hover:bg-gray-100 transition-colors"
                                    >
                                      Edit
                                    </button>
                                  )}
                                {(currentMember?.role === "owner" ||
                                  isSelf) && (
                                  <button
                                    onClick={() =>
                                      handleRemoveMember(member._id)
                                    }
                                    className="text-xs px-3 py-1.5 border border-red-200 text-red-600 hover:bg-red-50 transition-colors flex items-center gap-1"
                                  >
                                    <UserMinus className="w-3 h-3" />
                                    {isSelf ? "Leave" : "Remove"}
                                  </button>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Permission pills (view mode) */}
                          {!isEditing && (
                            <div className="mt-2.5 flex flex-wrap gap-1.5 ml-12">
                              {isOwner ? (
                                <span className="text-xs px-2 py-0.5 bg-yellow-50 text-yellow-700 border border-yellow-200">
                                  All Permissions
                                </span>
                              ) : (
                                Object.entries({
                                  makeExpense: "Expenses",
                                  calculateCash: "Cash Calc",
                                  addUser: "Manage Users",
                                  addCategories: "Manage Categories",
                                  addBankAccount: "Bank Accounts",
                                  createAccountDownward: "Sub-Accounts",
                                  createAccountUpward: "Link Parent",
                                })
                                  .filter(([key]) => member.permissions?.[key])
                                  .map(([key, label]) => (
                                    <span
                                      key={key}
                                      className="text-xs px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-100"
                                    >
                                      {label}
                                    </span>
                                  ))
                              )}
                              {!isOwner &&
                                !Object.values(member.permissions || {}).some(
                                  Boolean,
                                ) && (
                                  <span className="text-xs text-gray-400 italic">
                                    No permissions
                                  </span>
                                )}
                            </div>
                          )}

                          {/* Edit mode */}
                          {isEditing && (
                            <div className="mt-3 ml-12 border-t border-gray-100 pt-3">
                              <div className="mb-3">
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                  Display Name
                                </label>
                                <input
                                  type="text"
                                  value={editDisplayName}
                                  onChange={(e) =>
                                    setEditDisplayName(e.target.value)
                                  }
                                  className="w-full max-w-xs px-3 py-1.5 border border-gray-300 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                              </div>
                              <div className="mb-3">
                                <label className="block text-xs font-medium text-gray-600 mb-3">
                                  Permissions
                                </label>
                                <div className="space-y-6">
                                  {/* Module 1: Expenses & Cash */}
                                  <div>
                                    <p className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3">
                                      Expenses &amp; Cash
                                    </p>
                                    <div className="grid grid-cols-2 gap-2">
                                      {[
                                        {
                                          key: "makeExpense",
                                          label: "Make Expenses",
                                        },
                                        {
                                          key: "calculateCash",
                                          label: "Calculate Cash",
                                        },
                                      ].map(({ key, label }) => (
                                        <label
                                          key={key}
                                          className="flex items-center gap-2 text-sm cursor-pointer"
                                        >
                                          <input
                                            type="checkbox"
                                            checked={!!editPerms[key]}
                                            disabled={!hasPermission(key)}
                                            onChange={(e) =>
                                              setEditPerms((prev) => ({
                                                ...prev,
                                                [key]: e.target.checked,
                                              }))
                                            }
                                            className="w-4 h-4 accent-indigo-600"
                                          />
                                          <span
                                            className={
                                              !hasPermission(key)
                                                ? "text-gray-400"
                                                : "text-gray-700"
                                            }
                                          >
                                            {label}
                                          </span>
                                        </label>
                                      ))}
                                    </div>
                                  </div>
                                  {/* Module 2: Access Settings */}
                                  <div>
                                    <p className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3">
                                      Access Settings
                                    </p>
                                    <div className="grid grid-cols-1 gap-2">
                                      {[
                                        {
                                          key: "addUser",
                                          label: "Manage / Create Users",
                                        },
                                        {
                                          key: "addCategories",
                                          label: "Manage / Create Categories",
                                        },
                                        {
                                          key: "addBankAccount",
                                          label:
                                            "Manage / Create Bank Accounts",
                                        },
                                      ].map(({ key, label }) => (
                                        <label
                                          key={key}
                                          className="flex items-center gap-2 text-sm cursor-pointer"
                                        >
                                          <input
                                            type="checkbox"
                                            checked={!!editPerms[key]}
                                            disabled={!hasPermission(key)}
                                            onChange={(e) => {
                                              const checked = e.target.checked;
                                              setEditPerms((prev) => {
                                                const next = {
                                                  ...prev,
                                                  [key]: checked,
                                                };
                                                next.accessSettings = !!(
                                                  next.addUser ||
                                                  next.addCategories ||
                                                  next.addBankAccount
                                                );
                                                return next;
                                              });
                                            }}
                                            className="w-4 h-4 accent-indigo-600"
                                          />
                                          <span
                                            className={
                                              !hasPermission(key)
                                                ? "text-gray-400"
                                                : "text-gray-700"
                                            }
                                          >
                                            {label}
                                          </span>
                                        </label>
                                      ))}
                                    </div>
                                  </div>
                                  {/* Module 3: Account Structure */}
                                  <div>
                                    <p className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3">
                                      Account Structure
                                    </p>
                                    <div className="grid grid-cols-2 gap-2">
                                      {[
                                        {
                                          key: "createAccountDownward",
                                          label: "Create Sub-Accounts",
                                        },
                                        {
                                          key: "createAccountUpward",
                                          label: "Link To Parent",
                                        },
                                      ].map(({ key, label }) => (
                                        <label
                                          key={key}
                                          className="flex items-center gap-2 text-sm cursor-pointer"
                                        >
                                          <input
                                            type="checkbox"
                                            checked={!!editPerms[key]}
                                            disabled={!hasPermission(key)}
                                            onChange={(e) =>
                                              setEditPerms((prev) => ({
                                                ...prev,
                                                [key]: e.target.checked,
                                              }))
                                            }
                                            className="w-4 h-4 accent-indigo-600"
                                          />
                                          <span
                                            className={
                                              !hasPermission(key)
                                                ? "text-gray-400"
                                                : "text-gray-700"
                                            }
                                          >
                                            {label}
                                          </span>
                                        </label>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              {editError && (
                                <p className="text-red-600 text-sm mb-2">
                                  {editError}
                                </p>
                              )}
                              <div className="flex gap-2">
                                <button
                                  onClick={handleUpdateMember}
                                  disabled={editSubmitting}
                                  className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                                >
                                  {editSubmitting ? "Saving…" : "Save"}
                                </button>
                                <button
                                  onClick={() => setEditingMember(null)}
                                  className="px-3 py-1.5 border border-gray-300 text-gray-600 text-xs hover:bg-gray-100 transition-colors"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Transfer Ownership — owner only */}
                {currentMember?.role === "owner" && (
                  <div className="mt-8">
                    <div className="border border-red-200 bg-red-50 p-5">
                      <h3 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
                        <Crown className="w-4 h-4 text-red-600" /> Transfer
                        Ownership
                      </h3>
                      <p className="text-sm text-gray-500 mb-4">
                        Invite someone to become the new owner of this account.
                        You will become view-only until they accept.
                      </p>
                      <div className="flex items-center gap-3 flex-wrap">
                        <button
                          onClick={() => setShowTransferModal(true)}
                          className="px-4 py-2 bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors flex items-center gap-2"
                        >
                          <Crown className="w-4 h-4" /> Transfer Ownership
                        </button>
                        {transferStatus?.status === "pending" && (
                          <button
                            onClick={() => setShowCorrectionModal(true)}
                            className="px-4 py-2 border border-amber-400 text-amber-700 bg-amber-50 text-sm font-medium hover:bg-amber-100 transition-colors"
                          >
                            Help — Wrong recipient?
                          </button>
                        )}
                      </div>
                      {transferStatus?.status === "pending" && (
                        <p className="mt-3 text-xs text-amber-700 bg-amber-50 border border-amber-200 px-3 py-2">
                          ⏳ Transfer pending — waiting for{" "}
                          <strong>{transferStatus.toEmail}</strong> to accept.
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Pending Invitations */}
                {hasPermission("addUser") && pendingInvitations.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      Pending Invitations ({pendingInvitations.length})
                    </h3>
                    <div className="divide-y divide-gray-100 border border-gray-200">
                      {pendingInvitations.map((inv) => (
                        <div
                          key={inv._id}
                          className="flex items-center justify-between px-4 py-3 gap-3"
                        >
                          <div className="min-w-0">
                            <p className="text-sm text-gray-800 font-medium truncate">
                              {inv.email}
                            </p>
                            {inv.displayName && (
                              <p className="text-xs text-gray-500">
                                {inv.displayName}
                              </p>
                            )}
                            <p className="text-xs text-gray-400 mt-0.5">
                              Expires{" "}
                              {new Date(inv.expiresAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-xs px-2 py-0.5 bg-yellow-50 text-yellow-700 border border-yellow-200">
                              Pending
                            </span>
                            <button
                              onClick={() => handleCancelInvitation(inv._id)}
                              className="text-xs px-2 py-1 border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── Categories Screen ── */}
            {settingsSection === "categories" && (
              <div className="max-w-xl mx-auto px-6 py-10">
                <p className="text-sm text-gray-500 mb-6">
                  {categories.length} categories defined for this account.
                </p>
                <div className="divide-y divide-gray-100 border border-gray-200">
                  {categories.length === 0 ? (
                    <div className="px-6 py-12 text-center text-gray-400">
                      No categories yet
                    </div>
                  ) : (
                    categories.map((cat) => (
                      <div
                        key={cat._id}
                        className="flex items-center justify-between px-6 py-4 hover:bg-gray-50"
                      >
                        <span className="font-medium text-gray-800">
                          {cat.name}
                        </span>
                        <button
                          disabled
                          className="text-gray-300 cursor-not-allowed p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
                <button
                  disabled
                  className="mt-4 w-full flex items-center justify-center gap-2 px-6 py-3 border-2 border-dashed border-gray-300 text-gray-400 cursor-not-allowed font-medium"
                >
                  <Plus className="w-4 h-4" /> Add Category — Coming Soon
                </button>
              </div>
            )}

            {/* ── Bank Accounts Screen ── */}
            {settingsSection === "bankAccounts" && (
              <div className="max-w-xl mx-auto px-6 py-10">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-gray-500">
                    {bankAccounts.length} account
                    {bankAccounts.length !== 1 ? "s" : ""} linked
                  </p>
                  <button
                    onClick={() => {
                      setShowSettings(false);
                      setSettingsSection(null);
                      setActiveModal("addBankAccount");
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors"
                  >
                    <Plus className="w-4 h-4" /> Add Account
                  </button>
                </div>
                <div className="border border-gray-200 divide-y divide-gray-100">
                  {bankAccounts.length === 0 ? (
                    <div className="px-6 py-12 text-center">
                      <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 font-medium">
                        No bank accounts linked
                      </p>
                    </div>
                  ) : (
                    bankAccounts.map((ba) => (
                      <div
                        key={ba._id}
                        className="flex items-center justify-between px-6 py-4 hover:bg-gray-50"
                      >
                        <div className="flex items-center gap-4">
                          <div className="bg-blue-100 p-2.5">
                            <CreditCard className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">
                              {ba.name}
                              {ba.lastFourDigits && (
                                <span className="text-gray-400 font-normal ml-2 text-sm">
                                  ···{ba.lastFourDigits}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              {ba.bankName && (
                                <span className="text-sm text-gray-500">
                                  {ba.bankName}
                                </span>
                              )}
                              {ba.accountType && (
                                <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 capitalize font-medium">
                                  {ba.accountType}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-base font-bold text-gray-900">
                          ${ba.balance.toFixed(2)}
                        </div>
                      </div>
                    ))
                  )}
                </div>
                {bankAccounts.length > 0 && (
                  <div className="flex items-center justify-between px-6 py-3 bg-blue-600 text-white mt-0">
                    <span className="font-semibold">Total</span>
                    <span className="text-lg font-bold">
                      ${getExpectedBankAmount().toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* ── Activity Log Screen ── */}
            {settingsSection === "activityLog" && (
              <div className="max-w-2xl mx-auto px-6 py-8">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-gray-500">
                    Recent account activity
                  </p>
                  <select
                    value={activityFilter}
                    onChange={(e) => {
                      const v = e.target.value;
                      setActivityFilter(v);
                      loadActivityLog(v);
                    }}
                    className="px-3 py-1.5 border border-gray-300 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 bg-white"
                  >
                    <option value="">All Actions</option>
                    <option value="expense_added">Expense Added</option>
                    <option value="expense_deleted">Expense Deleted</option>
                    <option value="member_added">Member Added</option>
                    <option value="member_removed">Member Removed</option>
                    <option value="ownership_transferred">
                      Ownership Transferred
                    </option>
                    <option value="ownership_transfer_initiated">
                      Transfer Initiated
                    </option>
                    <option value="week_created">Week Created</option>
                    <option value="week_locked">Week Locked</option>
                    <option value="account_settings_changed">
                      Settings Changed
                    </option>
                  </select>
                </div>
                {activityLoading ? (
                  <div className="py-12 text-center text-gray-400 text-sm">
                    Loading activity…
                  </div>
                ) : (
                  <>
                    <div className="space-y-4">
                      {activityLogs.length === 0 ? (
                        <div className="text-center py-12 text-gray-400 text-sm italic">
                          No activities recorded yet.
                        </div>
                      ) : (
                        activityLogs.map((log) => (
                          <div
                            key={log._id}
                            className="p-3 border border-gray-100 flex items-start gap-4 hover:bg-gray-50 transition-colors"
                          >
                            <div className="p-2 bg-indigo-50 text-indigo-600">
                              <History className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-sm font-bold text-gray-900 truncate">
                                  {log.actorDisplayName}
                                </span>
                                <span className="text-[10px] text-gray-400 uppercase font-medium">
                                  {new Date(log.createdAt).toLocaleString()}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 mt-0.5">
                                <span className="font-semibold text-indigo-700">
                                  {log.action.replace(/_/g, " ")}:
                                </span>{" "}
                                {log.targetDescription}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    <button
                      onClick={loadActivityLog}
                      disabled={activityLoading}
                      className="mt-6 w-full py-2 bg-gray-50 border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-100 transition-colors disabled:opacity-50"
                    >
                      {activityLoading
                        ? "Refreshing..."
                        : "Refresh Audit Trail"}
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}{" "}
      {/* end settings */}
      {/* ==================== MODALS ==================== */}
      {showTransferModal && (
        <TransferOwnershipModal
          accountId={currentAccount?._id}
          accountName={currentAccount?.accountName}
          currentUser={user}
          onClose={() => setShowTransferModal(false)}
          onSuccess={() => {
            setShowTransferModal(false);
            loadTransferStatus();
          }}
        />
      )}
      {showInviteModal && (
        <InviteModal
          accountId={currentAccount?._id}
          accountName={currentAccount?.accountName}
          currentUser={user}
          onClose={() => {
            setShowInviteModal(false);
            loadMembers();
            loadPendingInvitations();
          }}
        />
      )}
      {showCorrectionModal && (
        <OwnershipCorrectionModal
          accountId={currentAccount?._id}
          transferStatus={transferStatus}
          onClose={() => setShowCorrectionModal(false)}
        />
      )}
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
      {showSchedule && (
        <ScheduleScreen
          accountId={currentAccount?._id}
          currentMember={currentMember}
          onClose={() => setShowSchedule(false)}
        />
      )}
    </div>
  );
}

export default App;
