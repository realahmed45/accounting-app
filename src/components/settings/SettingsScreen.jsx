import React, { useState, useEffect } from "react";
import {
  Settings,
  X,
  ChevronDown,
  User,
  BarChart3,
  Building2,
  History,
  UserPlus,
  Crown,
  UserMinus,
  Mail,
  Plus,
  CheckCircle2,
  Search,
  CreditCard,
  AlertCircle,
  Receipt,
  Trash2,
  DollarSign,
  Wallet,
  Edit2,
  Check,
  Star,
  Zap,
  Shield,
  TrendingUp,
  ArrowRightLeft,
} from "lucide-react";
import {
  memberService,
  invitationService,
  activityService,
} from "../../services/api";
import { sendInvitationEmail } from "../../services/emailService";
import TransferOwnershipModal from "../TransferOwnershipModal";
import InviteModal from "../InviteModal";
import OwnershipCorrectionModal from "../OwnershipCorrectionModal";
import UniqueIdDisplay from "../UniqueIdDisplay";
import LinkParentModal from "../LinkParentModal";

// Currency list for display
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
];

const SettingsScreen = ({
  user,
  currentAccount,
  currentMember,
  hasPermission,
  categories,
  bankAccounts,
  addCategory,
  setShowSettings,
  setActiveModal,
  getExpectedBankAmount,
  runIfAllowed,
  formatAmount,
  onOpenNotificationSettings,
}) => {
  const [settingsSection, setSettingsSection] = useState(null); // "users" | "categories" | "bankAccounts" | "topUpBank" | "topUpCash" | "activityLog" | "subscription"

  // Subscription upgrade state
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);
  const [upgrading, setUpgrading] = useState(false);
  const [upgradeSuccess, setUpgradeSuccess] = useState("");
  const [upgradeError, setUpgradeError] = useState("");
  const [selectedUpgradePlan, setSelectedUpgradePlan] = useState("");
  const [selectedBillingCycle, setSelectedBillingCycle] = useState("monthly");

  const loadSubscription = async () => {
    setSubscriptionLoading(true);
    try {
      const { default: api } = await import("../../services/api");
      const response = await api.get("/subscription");
      if (response.data.success) {
        setCurrentSubscription(response.data.data);
        setSelectedUpgradePlan(response.data.data.currentPlan);
      }
    } catch (err) {
      console.error("Failed to load subscription:", err);
    } finally {
      setSubscriptionLoading(false);
    }
  };

  const handleUpgradePlan = async () => {
    if (!selectedUpgradePlan) return;
    setUpgrading(true);
    setUpgradeError("");
    setUpgradeSuccess("");
    try {
      const { default: api } = await import("../../services/api");
      const response = await api.post("/subscription/subscribe", {
        plan: selectedUpgradePlan,
        billingCycle: selectedBillingCycle,
      });
      if (response.data.success) {
        setCurrentSubscription(response.data.data);
        setUpgradeSuccess(
          `✅ Successfully switched to ${selectedUpgradePlan} plan!`,
        );
      } else {
        setUpgradeError(response.data.message || "Failed to update plan");
      }
    } catch (err) {
      setUpgradeError(
        err?.response?.data?.message ||
          "Failed to update plan. Please try again.",
      );
    } finally {
      setUpgrading(false);
    }
  };

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
    updateBankBalance: false,
    makeExpense: true,
    createAccountDownward: false,
    createAccountUpward: false,
  });
  const [newMemberSubmitting, setNewMemberSubmitting] = useState(false);
  const [newMemberError, setNewMemberError] = useState("");
  const [editingMember, setEditingMember] = useState(null);
  const [editPerms, setEditPerms] = useState({});
  const [editDisplayName, setEditDisplayName] = useState("");
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState("");
  const [transferStatus, setTransferStatus] = useState(null);
  const [pendingInvitations, setPendingInvitations] = useState([]);
  const [inviteSentLink, setInviteSentLink] = useState("");

  // Categories management
  const [showAddCategoryForm, setShowAddCategoryForm] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [categorySubmitting, setCategorySubmitting] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editCategoryName, setEditCategoryName] = useState("");
  const [editCategorySubmitting, setEditCategorySubmitting] = useState(false);

  // Activity Log
  const [activityLogs, setActivityLogs] = useState([]);
  const [activityFilter, setActivityFilter] = useState("");
  const [activityLoading, setActivityLoading] = useState(false);

  // Modals state
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showCorrectionModal, setShowCorrectionModal] = useState(false);
  const [showLinkParentModal, setShowLinkParentModal] = useState(false);
  const [initialInviteTab, setInitialInviteTab] = useState("team");

  // Parent account state
  const [parentAccount, setParentAccount] = useState(null);

  useEffect(() => {
    if (settingsSection === "users" && currentAccount) {
      loadMembers();
      loadPendingInvitations();
      loadTransferStatus();
    }
    if (settingsSection === "activityLog" && currentAccount) {
      loadActivityLog();
    }
    if (settingsSection === "subscription") {
      loadSubscription();
    }
  }, [settingsSection, currentAccount]);

  // Load parent account data
  useEffect(() => {
    const loadParentAccount = async () => {
      if (currentAccount?.parentAccountId) {
        try {
          const { accountService } = await import("../../services/api");
          const result = await accountService.getById(
            currentAccount.parentAccountId,
          );
          if (result.success) {
            setParentAccount(result.data);
          }
        } catch (err) {
          console.error("Failed to load parent account:", err);
        }
      }
    };
    loadParentAccount();
  }, [currentAccount]);

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

  const handleAddMember = async () =>
    runIfAllowed(async () => {
      if (!newMemberEmail.trim()) {
        setNewMemberError("Email is required");
        return;
      }
      setNewMemberSubmitting(true);
      setNewMemberError("");
      setInviteSentLink("");
      try {
        const res = await memberService.add(currentAccount._id, {
          email: newMemberEmail.trim(),
          displayName: newMemberDisplayName.trim() || undefined,
          permissions: newMemberPerms,
        });

        if (res.success) {
          const inviterName =
            `${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
            user?.email;
          const emailResult = await sendInvitationEmail({
            toEmail: newMemberEmail.trim(),
            inviterName,
            accountName: res.accountName || currentAccount.accountName,
            inviteLink: res.inviteLink,
            permissions: newMemberPerms,
          });

          if (!emailResult.sent && res.inviteLink) {
            setInviteSentLink(res.inviteLink);
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
            updateBankBalance: false,
            makeExpense: true,
            createAccountDownward: false,
            createAccountUpward: false,
          });
          await loadPendingInvitations();
        } else {
          setNewMemberError(res.message || "Failed to send invitation");
        }
      } catch (err) {
        setNewMemberError(
          err.response?.data?.message || "Failed to send invitation",
        );
      } finally {
        setNewMemberSubmitting(false);
      }
    });

  const handleUpdateMember = async () =>
    runIfAllowed(async () => {
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

  const handleRemoveMember = async (memberId) =>
    runIfAllowed(async () => {
      if (!window.confirm("Remove this member from the account?")) return;
      try {
        const res = await memberService.remove(currentAccount._id, memberId);
        if (res.success) await loadMembers();
        else alert(res.message || "Failed to remove member");
      } catch (err) {
        alert(err.response?.data?.message || "Failed to remove member");
      }
    });

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

  const handleAddCategoryLocal = async () =>
    runIfAllowed(async () => {
      if (!newCategoryName.trim()) {
        alert("Category name is required");
        return;
      }
      setCategorySubmitting(true);
      try {
        const res = await addCategory(newCategoryName.trim());
        if (res.success) {
          setNewCategoryName("");
          setShowAddCategoryForm(false);
        } else {
          alert(res.message || "Failed to add category");
        }
      } catch (err) {
        alert(err.response?.data?.message || "Failed to add category");
      } finally {
        setCategorySubmitting(false);
      }
    });

  const handleEditCategory = async () =>
    runIfAllowed(async () => {
      if (!editCategoryName.trim()) {
        alert("Category name is required");
        return;
      }
      setEditCategorySubmitting(true);
      try {
        const { accountService } = await import("../../services/api");
        const res = await accountService.updateCategory(
          currentAccount._id,
          editingCategory._id,
          { name: editCategoryName.trim() },
        );
        if (res.success) {
          // Update the categories list
          const updatedCategories = categories.map((cat) =>
            cat._id === editingCategory._id
              ? { ...cat, name: editCategoryName.trim() }
              : cat,
          );
          // This assumes categories is passed as prop or available in state
          // If using addCategory callback, we might need to refresh the page or pass a setter
          setEditingCategory(null);
          setEditCategoryName("");
          // Force reload to show updated name
          window.location.reload();
        } else {
          alert(res.message || "Failed to update category");
        }
      } catch (err) {
        alert(err.response?.data?.message || "Failed to update category");
      } finally {
        setEditCategorySubmitting(false);
      }
    });

  return (
    <>
      <div className="fixed inset-0 bg-slate-950 z-[100] flex flex-col animate-fadeIn">
        {/* Animated background elements */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full animate-float pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full animate-float pointer-events-none" style={{ animationDelay: '-2s' }} />

        {/* Header */}
        <div className="bg-slate-900/50 backdrop-blur-xl border-b border-white/5 px-6 sm:px-12 py-6 flex items-center justify-between flex-shrink-0 relative z-10">
          <div className="flex items-center gap-4 min-w-0">
            {settingsSection && (
              <button
                onClick={() => setSettingsSection(null)}
                className="p-3 hover:bg-white/5 text-slate-400 hover:text-white transition-all mr-2 rounded-2xl group"
              >
                <ChevronDown className="w-6 h-6 rotate-90 group-active:scale-95 transition-transform" />
              </button>
            )}
            <div className="bg-indigo-600 p-3 rounded-2xl shadow-[0_0_20px_rgba(79,70,229,0.3)]">
              <Settings className="w-5 h-5 text-white animate-spin-slow" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-widest uppercase truncate">
                {settingsSection === "users" && "Neural Network"}
                {settingsSection === "categories" && "Logic Classes"}
                {settingsSection === "bankAccounts" && "Liquidity Nodes"}
                {settingsSection === "topUpBank" && "Node Infusion"}
                {settingsSection === "topUpCash" && "Reserve Injection"}
                {settingsSection === "activityLog" && "Audit Protocol"}
                {settingsSection === "notifications" && "Comm Link"}
                {!settingsSection && "Control Center"}
              </h1>
              <p className="text-[10px] font-black uppercase text-indigo-400 tracking-[0.4em] mt-1 opacity-70">
                System Profile // {settingsSection ? settingsSection.toUpperCase() : "ROOT"}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setShowSettings(false);
              setSettingsSection(null);
            }}
            className="group flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all font-black text-[10px] uppercase tracking-widest active:scale-95"
          >
            <X className="w-5 h-5 transition-transform group-hover:rotate-90" />
            <span>Abort Session</span>
          </button>
        </div>

        {/* Currency Display Banner */}
        {currentAccount?.currency && (
          <div className="bg-indigo-600 border-b border-white/10 px-6 sm:px-12 py-4 relative group overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            <div className="flex items-center gap-4 relative z-10">
              <DollarSign className="w-5 h-5 text-indigo-300" />
              <div className="flex items-center gap-3 flex-wrap min-w-0">
                <span className="text-[10px] font-black uppercase text-indigo-300 tracking-widest">
                  Base Currency Context:
                </span>
                <span className="text-2xl font-black text-white tracking-widest">
                  {CURRENCIES.find((c) => c.code === currentAccount.currency)
                    ?.symbol || ""} {currentAccount.currency}
                </span>
                <span className="text-[10px] font-black text-indigo-300/60 uppercase tracking-widest">
                  // {CURRENCIES.find((c) => c.code === currentAccount.currency)
                    ?.name || currentAccount.currency}
                </span>
              </div>
            </div>
          </div>
        )}

        {!currentAccount?.currency && (
          <div className="bg-amber-500/10 border-b border-amber-500/20 px-6 sm:px-12 py-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-amber-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase text-amber-400 tracking-widest">
                Currency Nullify // Interface bank account instantiation required for context initialization.
              </span>
            </div>
          </div>
        )}

        {/* Account Unique ID & Parent Link Section */}
        {currentAccount && !settingsSection && (
          <div className="border-b border-white/5 px-6 sm:px-12 py-8 space-y-6 relative z-10">
            {/* Unique ID Display */}
            <div className="glass-panel p-6 rounded-[2rem] border border-white/5 shadow-inner">
               <UniqueIdDisplay uniqueId={currentAccount.uniqueId} />
            </div>

            {/* Parent Account Info or Link Button */}
            {currentAccount.parentAccountId && parentAccount ? (
              <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-[2.5rem] p-8 group relative overflow-hidden">
                <div className="absolute top-0 right-0 p-16 bg-white/5 blur-[40px] rounded-full" />
                <div className="flex items-center justify-between relative z-10">
                  <div>
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] mb-3">
                      Ascending Node Connection
                    </p>
                    <p className="text-xl font-black text-white tracking-widest uppercase">
                      {parentAccount.accountName}
                    </p>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2 flex items-center gap-2">
                       <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500" /> Linked Logic State // {parentAccount.uniqueId}
                    </p>
                  </div>
                  {currentMember?.role === "owner" && (
                    <button
                      onClick={async () => {
                        if (
                          window.confirm(
                            "Are you sure you want to unlink from the parent account?",
                          )
                        ) {
                          try {
                            const { accountService } =
                              await import("../../services/api");
                            await accountService.linkToParent(
                              currentAccount._id,
                              null,
                            );
                            setParentAccount(null);
                            window.location.reload();
                          } catch (err) {
                            alert(
                              err?.response?.data?.message ||
                                "Failed to unlink parent account",
                            );
                          }
                        }
                      }}
                      className="px-6 py-3 bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500 hover:text-white rounded-2xl transition-all text-[10px] font-black uppercase tracking-widest active:scale-95"
                    >
                      Sever Link
                    </button>
                  )}
                </div>
              </div>
            ) : (
              currentMember?.role === "owner" && (
                <button
                  onClick={() => setShowLinkParentModal(true)}
                  className="w-full px-8 py-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-3xl hover:shadow-[0_20px_40px_rgba(79,70,229,0.3)] transition-all flex items-center justify-center gap-4 text-[11px] font-black uppercase tracking-[0.3em] active:scale-[0.98]"
                >
                  <Building2 className="w-5 h-5 animate-pulse" />
                  Establish Parent Link Protocol
                </button>
              )
            )}
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {/* Landing: 4 buttons */}
          {!settingsSection && (
            <div className="max-w-4xl mx-auto px-6 py-12 space-y-8 relative z-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[
                  {
                    key: "users",
                    icon: <UserPlus className="w-7 h-7" />,
                    label: "Neural Network",
                    desc: "Personnel Dispatch & Authorization",
                    color: "bg-indigo-600",
                  },
                  {
                    key: "categories",
                    icon: <BarChart3 className="w-7 h-7" />,
                    label: "Logic Classes",
                    desc: "Categorical Taxonomy Management",
                    color: "bg-purple-600",
                  },
                  {
                    key: "bankAccounts",
                    icon: <Building2 className="w-7 h-7" />,
                    label: "Liquidity Nodes",
                    desc: "Asset Repository Orchestration",
                    color: "bg-blue-600",
                  },
                  {
                    key: "topUpBank",
                    icon: <Zap className="w-7 h-7" />,
                    label: "Node Infusion",
                    desc: "Electronic Reserve Supplement",
                    color: "bg-slate-900",
                  },
                  {
                    key: "topUpCash",
                    icon: <Wallet className="w-7 h-7" />,
                    label: "Reserve Injection",
                    desc: "Physical Asset Reconciliation",
                    color: "bg-emerald-600",
                  },
                  {
                    key: "activityLog",
                    icon: <History className="w-7 h-7" />,
                    label: "Audit Protocol",
                    desc: "Sequential Log Transcription",
                    color: "bg-gray-700",
                  },
                  {
                    key: "notifications",
                    icon: <Mail className="w-7 h-7" />,
                    label: "Comm Link",
                    desc: "Signal Transmission Preferences",
                    color: "bg-orange-600",
                  },
                  {
                    key: "subscription",
                    icon: <Crown className="w-7 h-7" />,
                    label: "Power Tier",
                    desc: "System Capability & Escalation",
                    color: "from-amber-500 to-orange-600 bg-gradient-to-br",
                  },
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => {
                      if (
                        item.key === "notifications" &&
                        onOpenNotificationSettings
                      ) {
                        onOpenNotificationSettings();
                      } else {
                        setSettingsSection(item.key);
                      }
                    }}
                    className="group glass-panel p-8 rounded-[2.5rem] border border-white/5 hover:border-white/20 transition-all duration-500 text-left flex items-center gap-8 relative overflow-hidden active:scale-[0.97]"
                  >
                    <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div
                      className={`${item.color} w-16 h-16 rounded-3xl text-white flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-500`}
                    >
                      {item.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-lg font-black text-white tracking-widest uppercase truncate mb-1">
                        {item.label}
                      </div>
                      <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        {item.desc}
                      </div>
                    </div>
                    <ChevronDown className="w-6 h-6 text-slate-600 -rotate-90 group-hover:text-white group-hover:translate-x-2 transition-all" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Users Screen */}
          {settingsSection === "users" && (
            <div className="max-w-4xl mx-auto px-6 py-12 relative z-10">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-10 gap-6">
                <div>
                  <h2 className="text-3xl font-black text-white tracking-widest uppercase">
                    Neural Network
                  </h2>
                  <p className="text-[10px] font-black uppercase text-indigo-400 mt-2 tracking-[0.4em] flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
                    {members.length} Active Nodes Detected
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                  {hasPermission("addUser") && (
                    <button
                      onClick={() => {
                        setInitialInviteTab("team");
                        setShowInviteModal(true);
                      }}
                      className="group flex-1 sm:flex-none flex items-center justify-center gap-3 px-6 py-4 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500 transition-all rounded-2xl shadow-[0_20px_40px_rgba(79,70,229,0.3)] active:scale-95"
                    >
                      <UserPlus className="w-4 h-4 group-hover:scale-110 transition-transform" /> 
                      Dispatch Invite
                    </button>
                  )}
                  {currentMember?.role === "owner" && (
                    <button
                      onClick={() => {
                        setInitialInviteTab("owner");
                        setShowInviteModal(true);
                      }}
                      className="group flex-1 sm:flex-none flex items-center justify-center gap-3 px-6 py-4 bg-white/5 border border-white/10 text-amber-500 text-[10px] font-black uppercase tracking-widest hover:bg-amber-500/10 transition-all rounded-2xl active:scale-95"
                    >
                      <Crown className="w-4 h-4 group-hover:rotate-12 transition-transform" /> 
                      Transfer Authority
                    </button>
                  )}
                </div>
              </div>

              {membersError && (
                <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm">
                  {membersError}
                </div>
              )}

              {/* Members list */}
              {membersLoading ? (
                <div className="py-24 text-center">
                  <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
                  <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.4em]">Synchronizing Nodes...</p>
                </div>
              ) : members.length === 0 ? (
                <div className="py-24 text-center glass-panel rounded-[3rem] border border-white/5 border-dashed">
                  <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.4em]">Zero Active Nodes Detected</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {members.map((member) => {
                    const isEditing = editingMember?._id === member._id;
                    const isSelf =
                      member.userId?._id === user?._id ||
                      member.userId === user?._id;
                    const isOwner = member.role === "owner";
                    return (
                      <div key={member._id} className={`glass-panel p-6 rounded-[2.5rem] border transition-all duration-500 relative overflow-hidden group ${isEditing ? 'border-indigo-500/50 bg-indigo-500/5' : 'border-white/5 hover:border-white/20'}`}>
                        <div className="flex items-center justify-between gap-6 relative z-10">
                          <div className="flex items-center gap-5 min-w-0">
                            <div
                              className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 duration-500 ${isOwner ? "bg-amber-500/20 text-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.2)]" : "bg-slate-800 text-slate-400 group-hover:bg-slate-700 group-hover:text-white"}`}
                            >
                              {isOwner ? (
                                <Crown className="w-6 h-6" />
                              ) : (
                                <User className="w-6 h-6" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-3 mb-1">
                                <span className="font-black text-white text-base tracking-widest uppercase truncate">
                                  {member.displayName ||
                                    member.userId?.email ||
                                    "—"}
                                </span>
                                {isOwner && (
                                  <span className="text-[9px] px-2 py-0.5 bg-amber-500/20 text-amber-500 font-black uppercase tracking-widest rounded-lg border border-amber-500/10">
                                    Prime
                                  </span>
                                )}
                                {isSelf && (
                                  <span className="text-[9px] px-2 py-0.5 bg-indigo-500/20 text-indigo-400 font-black uppercase tracking-widest rounded-lg border border-indigo-500/10">
                                    Subject
                                  </span>
                                )}
                                {member.viewOnly && (
                                  <span className="text-[9px] px-2 py-0.5 bg-slate-800 text-slate-500 font-black uppercase tracking-widest rounded-lg border border-white/5">
                                    Observer
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] font-black text-slate-500 flex items-center gap-2 tracking-widest">
                                <Mail className="w-3.5 h-3.5 text-slate-600" />{" "}
                                {member.userId?.email?.toUpperCase() || "NO DATA LINK"}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {!isEditing &&
                              !isOwner &&
                              hasPermission("addUser") && (
                                <>
                                  <button
                                    onClick={() => {
                                      setEditingMember(member);
                                      setEditPerms(member.permissions || {});
                                      setEditDisplayName(
                                        member.displayName || "",
                                      );
                                      setEditError("");
                                    }}
                                    className="p-3 bg-white/5 hover:bg-indigo-600/20 text-slate-400 hover:text-indigo-400 rounded-xl transition-all font-black text-[9px] uppercase tracking-widest border border-white/5"
                                  >
                                    Reconfig
                                  </button>
                                  {!isSelf && (
                                    <button
                                      onClick={() =>
                                        handleRemoveMember(member._id)
                                      }
                                      className="p-3 bg-white/5 hover:bg-rose-600/20 text-slate-400 hover:text-rose-400 rounded-xl transition-all border border-white/5 active:scale-90"
                                    >
                                      <UserMinus className="w-4 h-4" />
                                    </button>
                                  )}
                                </>
                              )}
                            {isOwner && member.userId?._id === user?._id && (
                              <button
                                onClick={() => {
                                  setInitialInviteTab("owner");
                                  setShowInviteModal(true);
                                }}
                                className="px-5 py-2.5 text-[9px] font-black text-amber-500 bg-amber-500/10 hover:bg-amber-500 hover:text-white rounded-xl transition-all uppercase tracking-widest border border-amber-500/20 shadow-inner active:scale-95"
                              >
                                Abdicate Authority
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Edit panel */}
                        {isEditing && (
                          <div className="mt-8 p-8 bg-slate-900 border border-white/5 rounded-[2rem] shadow-inner animate-zoomIn">
                            <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-6">
                              Logic Permission Matrix
                            </h4>
                            <div className="mb-8 group">
                              <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-2">
                                Persona Designation
                              </label>
                              <input
                                type="text"
                                value={editDisplayName}
                                onChange={(e) =>
                                  setEditDisplayName(e.target.value)
                                }
                                className="w-full bg-slate-950 border border-white/5 rounded-2xl px-6 py-4 text-sm font-black text-white focus:border-indigo-500 outline-none transition-all shadow-inner uppercase tracking-widest"
                              />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 mb-8">
                              {[
                                { key: "makeExpense", label: "Financial Injection" },
                                {
                                  key: "calculateCash",
                                  label: "Reserve Calculation",
                                },
                                { key: "addUser", label: "Network Orchestration" },
                                {
                                  key: "addCategories",
                                  label: "Logic Taxonomy",
                                },
                                {
                                  key: "addBankAccount",
                                  label: "Node Initialization",
                                },
                                {
                                  key: "updateBankBalance",
                                  label: "Liquidity Sync",
                                },
                                {
                                  key: "createAccountDownward",
                                  label: "Descending Nodes",
                                },
                                {
                                  key: "createAccountUpward",
                                  label: "Ascending Protocol",
                                },
                              ].map(({ key, label }) => (
                                <label
                                  key={key}
                                  className={`flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer group/label ${!hasPermission(key) ? 'opacity-30 cursor-not-allowed grayscale' : 'hover:bg-white/5'} ${editPerms[key] ? 'border-indigo-500/30 bg-indigo-500/10' : 'border-white/5'}`}
                                >
                                  <div className="relative flex items-center">
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
                                            next.addBankAccount ||
                                            next.updateBankBalance
                                          );
                                          return next;
                                        });
                                      }}
                                      className="sr-only"
                                    />
                                    <div className={`w-10 h-6 rounded-full transition-colors relative flex items-center px-1 ${editPerms[key] ? 'bg-indigo-600' : 'bg-slate-800'}`}>
                                       <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-300 ${editPerms[key] ? 'translate-x-4' : 'translate-x-0'}`} />
                                    </div>
                                  </div>
                                  <span
                                    className={`text-[10px] font-black uppercase tracking-widest ${
                                      !hasPermission(key)
                                        ? "text-slate-600"
                                        : editPerms[key] ? "text-white" : "text-slate-500"
                                    }`}
                                  >
                                    {label}
                                  </span>
                                </label>
                              ))}
                            </div>
                            {editError && (
                              <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-[9px] font-black uppercase tracking-widest mb-6 animate-pulse">
                                {editError}
                              </div>
                            )}
                            <div className="flex gap-4">
                              <button
                                onClick={handleUpdateMember}
                                disabled={editSubmitting}
                                className="flex-[2] py-4 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-indigo-500 transition-all rounded-2xl active:scale-95 disabled:opacity-50"
                              >
                                {editSubmitting ? "Processing..." : "Commit Changes"}
                              </button>
                              <button
                                onClick={() => {
                                  setEditingMember(null);
                                  setEditError("");
                                }}
                                className="flex-1 py-4 bg-white/5 text-slate-400 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 rounded-2xl transition-all active:scale-95"
                              >
                                Abort
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Pending Invitations */}
              {pendingInvitations.length > 0 && (
                <div className="mt-16">
                  <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.4em] mb-8 flex items-center gap-4">
                    <Mail className="w-5 h-5 text-indigo-500" /> Awaiting Link Authorization
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    {pendingInvitations.map((inv) => (
                      <div
                        key={inv._id}
                        className="glass-panel p-6 rounded-[2rem] border border-white/5 flex items-center justify-between gap-6 group hover:border-white/10 transition-all"
                      >
                        <div className="min-w-0">
                          <div className="text-sm font-black text-white tracking-widest uppercase truncate">
                            {inv.email}
                          </div>
                          <div className="text-[10px] font-black text-slate-500 mt-2 uppercase tracking-widest">
                            Signal Transmitted // {new Date(inv.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => {
                              const link = `${window.location.origin}/invite/${inv.token}`;
                              navigator.clipboard
                                .writeText(link)
                                .then(() => alert("Invite link copied!"));
                            }}
                            className="text-[9px] font-black text-indigo-400 hover:text-white transition-all uppercase tracking-widest border border-indigo-400/20 hover:border-indigo-400/60 px-4 py-2 rounded-xl bg-indigo-400/5"
                          >
                            Copy Link
                          </button>
                          <button
                            onClick={() => handleCancelInvitation(inv._id)}
                            className="p-3 bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white rounded-xl transition-all border border-rose-500/10 active:scale-90"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Transfer banner */}
              {transferStatus && (
                <div className="mt-16 glass-panel p-8 rounded-[3rem] border border-indigo-500/30 bg-indigo-500/10 overflow-hidden relative group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 blur-[60px] rounded-full animate-pulse" />
                  <h3 className="text-sm font-black text-white mb-3 flex items-center gap-3 uppercase tracking-widest relative z-10">
                    <ArrowRightLeft className="w-5 h-5 text-indigo-400" /> Administrative Handover Protocol
                  </h3>
                  <p className="text-[10px] font-black text-slate-400 mb-6 uppercase tracking-widest relative z-10">
                    Authority transfer to <span className="text-white">{transferStatus.targetUserEmail}</span> is in progress.
                  </p>
                  <div className="flex flex-wrap gap-4 relative z-10">
                    <button
                      onClick={() => setShowInviteModal(true)}
                      className="px-6 py-3 bg-indigo-600 text-white text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-indigo-500 transition-all shadow-lg active:scale-95"
                    >
                      Audit Protocol Status
                    </button>
                    <button
                      onClick={() => setShowCorrectionModal(true)}
                      className="px-6 py-3 bg-white/5 border border-white/10 text-slate-300 text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-white/10 transition-all active:scale-95"
                    >
                      Correct Datastream Info
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Categories Screen */}
          {settingsSection === "categories" && (
            <div className="max-w-4xl mx-auto px-6 py-12 relative z-10">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-10 gap-6">
                <div>
                  <h2 className="text-3xl font-black text-white tracking-widest uppercase">
                    Logic Classes
                  </h2>
                  <p className="text-[10px] font-black uppercase text-purple-400 mt-2 tracking-[0.4em] flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse" />
                    Categorical Taxonomy Management
                  </p>
                </div>
                {hasPermission("addCategories") && !showAddCategoryForm && (
                  <button
                    onClick={() => setShowAddCategoryForm(true)}
                    className="group flex items-center justify-center gap-3 px-8 py-4 bg-purple-600 text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-purple-500 transition-all rounded-2xl shadow-[0_20px_40px_rgba(147,51,234,0.3)] active:scale-95"
                  >
                    <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" /> 
                    Append Class
                  </button>
                )}
              </div>

              {showAddCategoryForm && (
                <div className="mb-10 p-8 glass-panel border border-purple-500/30 bg-purple-500/5 rounded-[2.5rem] animate-zoomIn">
                  <label className="block text-[10px] font-black text-purple-400 uppercase tracking-widest mb-4 ml-2">
                    Class Designation
                  </label>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <input
                      type="text"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="E.G. INFRASTRUCTURE, LOGISTICS..."
                      className="flex-1 bg-slate-900 border border-white/5 rounded-2xl px-6 py-4 text-sm font-black text-white focus:border-purple-500 outline-none transition-all shadow-inner uppercase tracking-widest"
                    />
                    <button
                      onClick={handleAddCategoryLocal}
                      disabled={categorySubmitting}
                      className="px-8 py-4 bg-purple-600 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-purple-500 disabled:opacity-50 active:scale-95 transition-all shadow-lg"
                    >
                      {categorySubmitting ? "Linking..." : "Commit"}
                    </button>
                    <button
                      onClick={() => setShowAddCategoryForm(false)}
                      className="px-6 py-4 bg-white/5 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-white/10 transition-all"
                    >
                      Abort
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {categories.map((cat, i) => {
                  const isEditing = editingCategory?._id === cat._id;
                  return (
                    <div
                      key={cat._id || i}
                      className={`glass-panel p-6 rounded-[2rem] border transition-all duration-500 group flex items-center justify-between gap-6 ${isEditing ? 'border-purple-500/50 bg-purple-500/5 shadow-[0_0_30px_rgba(168,85,247,0.1)]' : 'border-white/5 hover:border-white/20'}`}
                    >
                      {isEditing ? (
                        <div className="flex-1 flex items-center gap-3">
                          <input
                            type="text"
                            value={editCategoryName}
                            onChange={(e) =>
                              setEditCategoryName(e.target.value)
                            }
                            className="flex-1 bg-slate-950 border border-purple-500/50 rounded-xl px-4 py-2 text-[10px] font-black text-white focus:outline-none uppercase tracking-widest shadow-inner"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleEditCategory();
                              if (e.key === "Escape") {
                                setEditingCategory(null);
                                setEditCategoryName("");
                              }
                            }}
                          />
                          <button
                            onClick={handleEditCategory}
                            disabled={editCategorySubmitting}
                            className="p-2.5 bg-emerald-500 text-white rounded-xl hover:bg-emerald-400 disabled:opacity-50 transition-all shadow-lg active:scale-90"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingCategory(null);
                              setEditCategoryName("");
                            }}
                            className="p-2.5 bg-white/5 text-slate-400 hover:text-white rounded-xl transition-all"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-5 min-w-0">
                            <div className="w-4 h-4 rounded-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)] group-hover:scale-110 transition-transform" />
                            <div className="min-w-0">
                              <span className="font-black text-white tracking-widest uppercase truncate block">
                                {cat.name}
                              </span>
                              {cat.isDefault && (
                                <span className="text-[8px] font-black text-purple-400 uppercase tracking-widest mt-1 block">
                                  Default Root Class
                                </span>
                              )}
                            </div>
                          </div>
                          {hasPermission("addCategories") && (
                            <button
                              onClick={() => {
                                setEditingCategory(cat);
                                setEditCategoryName(cat.name);
                              }}
                              className="p-3 bg-white/5 text-slate-400 hover:text-purple-400 rounded-xl border border-white/5 opacity-0 group-hover:opacity-100 transition-all active:scale-95"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Bank Accounts Screen */}
          {settingsSection === "bankAccounts" && (
            <div className="max-w-4xl mx-auto px-6 py-12 relative z-10">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-10 gap-6">
                <div>
                  <h2 className="text-3xl font-black text-white tracking-widest uppercase">
                    Liquidity Nodes
                  </h2>
                  <p className="text-[10px] font-black uppercase text-blue-400 mt-2 tracking-[0.4em] flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                    Asset Repository Orchestration
                  </p>
                </div>
                {hasPermission("addBankAccount") && (
                  <button
                    onClick={() => setActiveModal("addBankAccount")}
                    className="group flex items-center justify-center gap-3 px-8 py-4 bg-blue-600 text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-blue-500 transition-all rounded-2xl shadow-[0_20px_40px_rgba(37,99,235,0.3)] active:scale-95"
                  >
                    <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" /> 
                    Initialize Node
                  </button>
                )}
              </div>

              <div className="space-y-6">
                {bankAccounts.length === 0 ? (
                  <div className="py-24 text-center glass-panel rounded-[3rem] border border-white/5 border-dashed">
                    <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.4em]">Zero Liquidity Nodes Detected</p>
                  </div>
                ) : (
                  bankAccounts.map((ba) => (
                    <div
                      key={ba._id}
                      className="glass-panel p-8 rounded-[2.5rem] border border-white/5 hover:border-white/20 transition-all duration-500 group flex items-center justify-between gap-6 relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="flex items-center gap-6 min-w-0 relative z-10">
                        <div className="bg-blue-500/10 p-5 rounded-3xl text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all transform group-hover:scale-110 duration-500">
                          <Building2 className="w-8 h-8" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xl font-black text-white tracking-widest uppercase truncate mb-1">
                            {ba.name}
                          </h4>
                          <div className="flex items-center gap-3 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                            {ba.bankName && <span>{ba.bankName}</span>}
                            {ba.lastFourDigits && (
                              <span className="text-blue-500/60">•• {ba.lastFourDigits}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right relative z-10">
                        <div className="text-2xl font-black text-white tracking-tighter mb-1">
                          {formatAmount(ba.balance, currentAccount?.currency)}
                        </div>
                        <div className="text-[8px] font-black text-blue-400 bg-blue-400/10 border border-blue-400/20 px-3 py-1 rounded-lg uppercase tracking-widest">
                          {ba.accountType}
                        </div>
                      </div>
                    </div>
                  ))
                )}
                {bankAccounts.length > 0 && (
                  <div className="mt-12 p-10 bg-indigo-600 rounded-[3rem] text-white shadow-[0_30px_60px_rgba(79,70,229,0.3)] flex items-center justify-between overflow-hidden relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                    <Building2 className="absolute -left-8 -bottom-8 w-48 h-48 opacity-10 rotate-12 group-hover:scale-110 transition-transform duration-1000" />
                    <div className="relative z-10">
                      <p className="text-indigo-200 text-[10px] font-black uppercase tracking-[0.4em] mb-3">
                        Total Combined Liquidity
                      </p>
                      <h3 className="text-5xl font-black tracking-tighter group-hover:scale-105 transition-transform origin-left">
                        {formatAmount(
                          getExpectedBankAmount(),
                          currentAccount?.currency,
                        )}
                      </h3>
                    </div>
                    <div className="relative z-10 bg-white/10 p-5 rounded-[2rem] border border-white/20 backdrop-blur-xl group-hover:rotate-12 transition-transform duration-500">
                      <CreditCard className="w-10 h-10" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Top Up Bank Section */}
          {settingsSection === "topUpBank" && (
            <div className="max-w-4xl mx-auto px-6 py-12 relative z-10">
              <div className="mb-12">
                <div className="flex items-center gap-4 mb-3">
                  <div className="bg-indigo-600 p-4 rounded-3xl shadow-[0_0_20px_rgba(79,70,229,0.3)]">
                    <Building2 className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-3xl font-black text-white tracking-widest uppercase">
                    Node Infusion
                  </h2>
                </div>
                <p className="text-[10px] font-black uppercase text-indigo-400 tracking-[0.4em] ml-2">
                  Electronic Reserve Supplement Protocol
                </p>
              </div>

              {hasPermission("updateBankBalance") ? (
                <button
                  onClick={() => setActiveModal("topUpBankBalance")}
                  className="w-full glass-panel group p-10 rounded-[3rem] border border-white/5 hover:border-indigo-500/30 transition-all duration-500 text-left flex items-center justify-between gap-8 relative overflow-hidden active:scale-[0.98]"
                >
                  <div className="absolute inset-0 bg-indigo-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="flex items-center gap-8 relative z-10">
                    <div className="bg-white/5 p-6 rounded-[2rem] group-hover:bg-indigo-600 group-hover:text-white transition-all transform group-hover:scale-110 duration-500">
                      <Building2 className="w-10 h-10" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-white tracking-widest uppercase mb-2">Supplement Funds</h3>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-loose">
                        Target node selection and electronic asset injection <br/>
                        Required for liquidity balance reconciliation.
                      </p>
                    </div>
                  </div>
                  <ChevronDown className="w-8 h-8 text-slate-700 -rotate-90 group-hover:text-indigo-500 group-hover:translate-x-2 transition-all" />
                </button>
              ) : (
                <div className="glass-panel p-12 rounded-[3rem] border border-rose-500/20 text-center relative overflow-hidden">
                   <div className="absolute inset-0 bg-rose-500/5" />
                  <AlertCircle className="w-16 h-16 text-rose-500/50 mx-auto mb-6 animate-pulse" />
                  <p className="text-[10px] font-black text-rose-400 uppercase tracking-[0.4em]">
                    Authorization Failure // Insufficient permissions for liquidity sync.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Top Up Cash Section */}
          {settingsSection === "topUpCash" && (
            <div className="max-w-4xl mx-auto px-6 py-12 relative z-10">
              <div className="mb-12">
                <div className="flex items-center gap-4 mb-3">
                  <div className="bg-emerald-600 p-4 rounded-3xl shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                    <Wallet className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-3xl font-black text-white tracking-widest uppercase">
                    Reserve Injection
                  </h2>
                </div>
                <p className="text-[10px] font-black uppercase text-emerald-400 tracking-[0.4em] ml-2">
                  Physical Asset Reconciliation Protocol
                </p>
              </div>

              {hasPermission("calculateCash") ? (
                <button
                  onClick={() => setActiveModal("addCash")}
                  className="w-full glass-panel group p-10 rounded-[3rem] border border-white/5 hover:border-emerald-500/30 transition-all duration-500 text-left flex items-center justify-between gap-8 relative overflow-hidden active:scale-[0.98]"
                >
                  <div className="absolute inset-0 bg-emerald-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="flex items-center gap-8 relative z-10">
                    <div className="bg-white/5 p-6 rounded-[2rem] group-hover:bg-emerald-600 group-hover:text-white transition-all transform group-hover:scale-110 duration-500">
                      <Wallet className="w-10 h-10" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-white tracking-widest uppercase mb-2">Supplement Reserve</h3>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-loose">
                        Manual cash repository enhancement <br/>
                        Required for sub-neural physical asset tracking.
                      </p>
                    </div>
                  </div>
                  <ChevronDown className="w-8 h-8 text-slate-700 -rotate-90 group-hover:text-emerald-500 group-hover:translate-x-2 transition-all" />
                </button>
              ) : (
                <div className="glass-panel p-12 rounded-[3rem] border border-rose-500/20 text-center relative overflow-hidden">
                   <div className="absolute inset-0 bg-rose-500/5" />
                  <AlertCircle className="w-16 h-16 text-rose-500/50 mx-auto mb-6 animate-pulse" />
                  <p className="text-[10px] font-black text-rose-400 uppercase tracking-[0.4em]">
                    Authorization Failure // Insufficient clearance for asset reconciliation.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Activity Log Screen */}
          {settingsSection === "activityLog" && (
            <div className="max-w-5xl mx-auto px-6 py-12 relative z-10">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-10 gap-6">
                <div>
                  <h2 className="text-3xl font-black text-white tracking-widest uppercase">
                    Audit Protocol
                  </h2>
                  <p className="text-[10px] font-black uppercase text-indigo-400 mt-2 tracking-[0.4em] flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
                    Sequential Log Transcription
                  </p>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <select
                    value={activityFilter}
                    onChange={(e) => {
                      setActivityFilter(e.target.value);
                      loadActivityLog(e.target.value);
                    }}
                    className="w-full sm:w-64 bg-slate-900 border border-white/10 rounded-2xl px-6 py-4 text-[10px] font-black text-white uppercase tracking-widest focus:border-indigo-500 outline-none transition-all shadow-inner"
                  >
                    <option value="">All Log Sequences</option>
                    <option value="expense_created">Financial Injections</option>
                    <option value="expense_updated">Logic Modifications</option>
                    <option value="expense_deleted">Asset Erasures</option>
                    <option value="week_created">Temporal Blocks</option>
                    <option value="week_locked">Temporal Seals</option>
                    <option value="bank_account_added">Node Initialization</option>
                    <option value="bank_account_removed">Node Decommissions</option>
                    <option value="account_settings_changed">Protocol Reconfig</option>
                    <option value="member_invited">Node Dispatch</option>
                    <option value="member_removed">Node Erasure</option>
                    <option value="permission_granted">Auth Escalation</option>
                    <option value="shift_created">Temporal Dispatch</option>
                  </select>
                </div>
              </div>

              {activityLoading ? (
                <div className="py-24 text-center">
                  <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
                  <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.4em]">Decoding Log Streams...</p>
                </div>
              ) : activityLogs.length === 0 ? (
                <div className="py-24 text-center glass-panel rounded-[3rem] border border-white/5 border-dashed">
                    <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.4em]">Zero Log Sequences Recorded</p>
                </div>
              ) : (
                <div className="glass-panel border border-white/5 rounded-[3rem] overflow-hidden shadow-2xl">
                  <div className="divide-y divide-white/5">
                    {activityLogs.map((log) => (
                      <div
                        key={log._id}
                        className="p-8 hover:bg-white/5 transition-all duration-300 group"
                      >
                        <div className="flex items-start gap-8">
                          <div
                            className={`mt-1 p-5 rounded-2xl shadow-lg transition-transform group-hover:scale-110 ${log.action.includes("deleted") ? "bg-rose-500/10 text-rose-500 border border-rose-500/20" : log.action.includes("created") ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : "bg-indigo-500/10 text-indigo-500 border border-indigo-500/20"}`}
                          >
                            {log.action.includes("expense") ? (
                              <Receipt className="w-6 h-6" />
                            ) : log.action.includes("bank") ? (
                              <Building2 className="w-6 h-6" />
                            ) : (
                              <History className="w-6 h-6" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-base font-black text-white tracking-widest uppercase mb-2">
                              {log.targetDescription}
                            </p>
                            <div className="flex items-center gap-6">
                              <span className="flex items-center gap-2 text-[10px] font-black text-indigo-400/80 uppercase tracking-widest">
                                <User className="w-3.5 h-3.5" />{" "}
                                {log.actorDisplayName?.toUpperCase() || "SYSTEM CORE"}
                              </span>
                              <span className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                <History className="w-3.5 h-3.5" />
                                {new Date(log.createdAt).toLocaleString()}
                              </span>
                            </div>
                            {log.metadata &&
                              Object.keys(log.metadata).length > 0 && (
                                <div className="mt-6 text-[9px] font-mono bg-slate-950/50 p-6 rounded-2xl border border-white/5 text-slate-500 overflow-x-auto shadow-inner group-hover:border-indigo-500/20 transition-all">
                                  {JSON.stringify(log.metadata, null, 2)}
                                </div>
                              )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Subscription & Plan Section - NEW */}
          {settingsSection === "subscription" && (
            <div className="max-w-3xl mx-auto px-3 sm:px-6 py-5 sm:py-8">
              <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500" />
                Subscription & Plan
              </h2>

              {subscriptionLoading ? (
                <div className="text-center py-12 text-gray-500">
                  <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  Loading subscription...
                </div>
              ) : (
                <>
                  {/* Current Plan Card */}
                  <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-4 sm:p-6 mb-6 text-white shadow-xl">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
                      <div className="flex items-center gap-3">
                        <div className="bg-amber-500 p-2.5 rounded-xl">
                          <Crown className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="text-slate-300 text-xs font-bold uppercase tracking-wider">
                            Current Plan
                          </p>
                          <p className="text-2xl font-black text-white capitalize">
                            {currentSubscription?.currentPlan || "Free"} Plan
                          </p>
                        </div>
                      </div>
                      <div className="bg-emerald-500/20 border border-emerald-500/40 px-3 py-1 rounded-full">
                        <span className="text-emerald-400 text-xs font-bold uppercase">
                          {currentSubscription?.status || "Active"}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mt-4">
                      <div className="bg-white/10 rounded-xl p-3 text-center">
                        <p className="text-2xl font-black">
                          {currentSubscription?.usage?.teamMembersCount ?? 1}
                        </p>
                        <p className="text-xs text-slate-300 mt-1">
                          Team Members
                        </p>
                      </div>
                      <div className="bg-white/10 rounded-xl p-3 text-center">
                        <p className="text-2xl font-black">
                          {currentSubscription?.usage?.expensesThisMonth ?? 0}
                        </p>
                        <p className="text-xs text-slate-300 mt-1">
                          Expenses This Month
                        </p>
                      </div>
                      <div className="bg-white/10 rounded-xl p-3 text-center">
                        <p className="text-2xl font-black">
                          {currentSubscription?.usage?.accountsCount ?? 1}
                        </p>
                        <p className="text-xs text-slate-300 mt-1">Accounts</p>
                      </div>
                    </div>
                  </div>

                  {/* Success / Error messages */}
                  {upgradeSuccess && (
                    <div className="bg-emerald-50 border-2 border-emerald-500 text-emerald-700 px-4 py-3 rounded-xl font-bold mb-4">
                      {upgradeSuccess}
                    </div>
                  )}
                  {upgradeError && (
                    <div className="bg-red-50 border-2 border-red-500 text-red-700 px-4 py-3 rounded-xl font-bold mb-4">
                      {upgradeError}
                    </div>
                  )}

                  {/* Plan Selection */}
                  <div className="mb-6">
                    <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wider mb-3">
                      Choose a Plan
                    </h3>
                    <div className="space-y-3">
                      {[
                        {
                          id: "free",
                          name: "Starter",
                          price: { monthly: 0, yearly: 0 },
                          desc: "1 account • 50 expenses/month",
                          color: "border-slate-400",
                        },
                        {
                          id: "professional",
                          name: "Professional",
                          price: { monthly: 12, yearly: 120 },
                          desc: "5 accounts • Unlimited expenses • 3 members",
                          color: "border-blue-500",
                          popular: true,
                        },
                        {
                          id: "business",
                          name: "Business",
                          price: { monthly: 29, yearly: 290 },
                          desc: "20 accounts • Unlimited everything • Unlimited members",
                          color: "border-emerald-500",
                        },
                        {
                          id: "enterprise",
                          name: "Enterprise",
                          price: { monthly: 79, yearly: 790 },
                          desc: "Unlimited everything • White-label • Dedicated support",
                          color: "border-amber-500",
                        },
                      ].map((plan) => (
                        <button
                          key={plan.id}
                          onClick={() => setSelectedUpgradePlan(plan.id)}
                          className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all text-left ${
                            selectedUpgradePlan === plan.id
                              ? `${plan.color} bg-blue-50 shadow-md`
                              : "border-gray-200 bg-white hover:border-gray-300"
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                selectedUpgradePlan === plan.id
                                  ? "border-blue-600 bg-blue-600"
                                  : "border-gray-300"
                              }`}
                            >
                              {selectedUpgradePlan === plan.id && (
                                <div className="w-2.5 h-2.5 bg-white rounded-full" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-gray-900">
                                  {plan.name}
                                </span>
                                {plan.popular && (
                                  <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full font-bold">
                                    Popular
                                  </span>
                                )}
                                {plan.id ===
                                  currentSubscription?.currentPlan && (
                                  <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">
                                    Current
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-500 mt-0.5 break-words">
                                {plan.desc}
                              </p>
                            </div>
                          </div>
                          <div className="text-right shrink-0 ml-3 sm:ml-4">
                            <p className="font-black text-gray-900 text-lg">
                              {plan.price[selectedBillingCycle] === 0
                                ? "Free"
                                : `$${plan.price[selectedBillingCycle]}`}
                            </p>
                            {plan.price[selectedBillingCycle] > 0 && (
                              <p className="text-xs text-gray-400">
                                /
                                {selectedBillingCycle === "yearly"
                                  ? "yr"
                                  : "mo"}
                              </p>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Billing Cycle Toggle */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <span className="text-sm font-bold text-gray-700">
                      Billing:
                    </span>
                    <div className="flex bg-white rounded-lg border border-gray-200 overflow-hidden">
                      {["monthly", "yearly"].map((cycle) => (
                        <button
                          key={cycle}
                          onClick={() => setSelectedBillingCycle(cycle)}
                          className={`px-4 py-2 text-sm font-bold transition-all capitalize ${
                            selectedBillingCycle === cycle
                              ? "bg-blue-600 text-white"
                              : "text-gray-600 hover:bg-gray-50"
                          }`}
                        >
                          {cycle}
                        </button>
                      ))}
                    </div>
                    {selectedBillingCycle === "yearly" && (
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                        Save ~17%!
                      </span>
                    )}
                  </div>

                  {/* Upgrade Button */}
                  <button
                    onClick={handleUpgradePlan}
                    disabled={
                      upgrading ||
                      selectedUpgradePlan === currentSubscription?.currentPlan
                    }
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-black py-4 rounded-xl transition-all shadow-lg hover:shadow-xl text-base disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99]"
                  >
                    {upgrading ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Updating Plan...
                      </span>
                    ) : selectedUpgradePlan ===
                      currentSubscription?.currentPlan ? (
                      "✓ This is Your Current Plan"
                    ) : (
                      `🚀 Switch to ${selectedUpgradePlan?.charAt(0).toUpperCase() + selectedUpgradePlan?.slice(1)} Plan`
                    )}
                  </button>

                  {/* Plan Features Summary */}
                  <div className="mt-6 space-y-2">
                    <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wider">
                      All Plans Include
                    </h3>
                    {[
                      {
                        icon: <Shield className="w-4 h-4 text-emerald-600" />,
                        text: "Secure encrypted data storage",
                      },
                      {
                        icon: <Zap className="w-4 h-4 text-blue-600" />,
                        text: "Real-time expense tracking",
                      },
                      {
                        icon: (
                          <TrendingUp className="w-4 h-4 text-purple-600" />
                        ),
                        text: "Analytics & reports",
                      },
                      {
                        icon: <Building2 className="w-4 h-4 text-amber-600" />,
                        text: "Bank account management",
                      },
                    ].map((feature, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100"
                      >
                        {feature.icon}
                        <span className="text-gray-700 text-sm font-medium">
                          {feature.text}
                        </span>
                        <Check className="w-4 h-4 text-emerald-600 ml-auto" />
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Embedded Modals triggered from settings */}
      {showTransferModal && (
        <TransferOwnershipModal
          currentAccount={currentAccount}
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
          initialTab={initialInviteTab}
          onClose={() => {
            setShowInviteModal(false);
            loadMembers();
            loadPendingInvitations();
          }}
        />
      )}
      {showCorrectionModal && transferStatus && (
        <OwnershipCorrectionModal
          transferStatus={transferStatus}
          currentAccount={currentAccount}
          onClose={() => setShowCorrectionModal(false)}
          onSuccess={() => {
            setShowCorrectionModal(false);
            loadTransferStatus();
          }}
        />
      )}
      {showLinkParentModal && (
        <LinkParentModal
          accountId={currentAccount?._id}
          currentAccountName={currentAccount?.accountName}
          onClose={() => setShowLinkParentModal(false)}
          onSuccess={async (data) => {
            setShowLinkParentModal(false);
            // Reload to show updated parent account info
            window.location.reload();
          }}
        />
      )}
    </>
  );
};

export default SettingsScreen;
