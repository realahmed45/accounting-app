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
}) => {
  const [settingsSection, setSettingsSection] = useState(null); // "users" | "categories" | "bankAccounts" | "topUpBank" | "topUpCash" | "activityLog"

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

  return (
    <>
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
              {settingsSection === "topUpBank" && "Top Up Bank"}
              {settingsSection === "topUpCash" && "Top Up Cash"}
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

        {/* Currency Display Banner */}
        {currentAccount?.currency && (
          <div className="bg-gradient-to-r from-emerald-50 to-blue-50 border-b border-emerald-200 px-6 xl:px-12 py-3">
            <div className="flex items-center gap-3">
              <DollarSign className="w-5 h-5 text-emerald-700" />
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">
                  Account Currency:
                </span>
                <span className="text-2xl font-bold text-gray-900">
                  {CURRENCIES.find((c) => c.code === currentAccount.currency)
                    ?.symbol || ""}
                </span>
                <span className="text-lg font-bold text-gray-900">
                  {currentAccount.currency}
                </span>
                <span className="text-sm text-gray-600">
                  (
                  {CURRENCIES.find((c) => c.code === currentAccount.currency)
                    ?.name || currentAccount.currency}
                  )
                </span>
              </div>
            </div>
          </div>
        )}

        {!currentAccount?.currency && (
          <div className="bg-yellow-50 border-b border-yellow-200 px-6 xl:px-12 py-3">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-700" />
              <span className="text-sm font-medium text-yellow-800">
                No currency set. Add your first bank account to set the account
                currency.
              </span>
            </div>
          </div>
        )}

        {/* Account Unique ID & Parent Link Section */}
        {currentAccount && !settingsSection && (
          <div className="border-b border-gray-200 px-6 xl:px-12 py-4 space-y-4">
            {/* Unique ID Display */}
            <UniqueIdDisplay uniqueId={currentAccount.uniqueId} />

            {/* Parent Account Info or Link Button */}
            {currentAccount.parentAccountId && parentAccount ? (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium text-blue-900 mb-1">
                      Parent Account
                    </p>
                    <p className="text-sm font-semibold text-blue-800">
                      {parentAccount.accountName}
                    </p>
                    <p className="text-xs text-blue-600 font-mono mt-1">
                      {parentAccount.uniqueId}
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
                      className="text-xs px-3 py-1 bg-red-100 text-red-700 hover:bg-red-200 rounded transition-colors"
                    >
                      Unlink
                    </button>
                  )}
                </div>
              </div>
            ) : (
              currentMember?.role === "owner" && (
                <button
                  onClick={() => setShowLinkParentModal(true)}
                  className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-sm flex items-center justify-center gap-2 text-sm font-medium"
                >
                  <Building2 className="w-4 h-4" />
                  Link to Parent Account
                </button>
              )
            )}
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {/* Landing: 4 buttons */}
          {!settingsSection && (
            <div className="max-w-lg mx-auto px-6 py-12 space-y-6">
              <div className="space-y-3">
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
                    key: "topUpBank",
                    icon: <Building2 className="w-6 h-6" />,
                    label: "Top Up Bank",
                    desc: "Add funds to bank account",
                    color: "bg-slate-900",
                  },
                  {
                    key: "topUpCash",
                    icon: <Wallet className="w-6 h-6" />,
                    label: "Top Up Cash",
                    desc: "Add funds to cash balance",
                    color: "bg-emerald-600",
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
            </div>
          )}

          {/* Users Screen */}
          {settingsSection === "users" && (
            <div className="max-w-2xl mx-auto px-6 py-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Account Members
                  </h2>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {members.length} member{members.length !== 1 ? "s" : ""} in
                    this account
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {hasPermission("addUser") && (
                    <button
                      onClick={() => {
                        setInitialInviteTab("team");
                        setShowInviteModal(true);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors rounded-lg shadow-sm"
                    >
                      <UserPlus className="w-4 h-4" /> Invite Team Member
                    </button>
                  )}
                  {currentMember?.role === "owner" && (
                    <button
                      onClick={() => {
                        setInitialInviteTab("owner");
                        setShowInviteModal(true);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white text-sm font-medium hover:bg-amber-700 transition-colors rounded-lg shadow-sm"
                    >
                      <Crown className="w-4 h-4" /> Transfer Ownership
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
                                <Mail className="w-3 h-3" />{" "}
                                {member.userId?.email || "No email"}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
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
                                    className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                                  >
                                    Edit
                                  </button>
                                  {!isSelf && (
                                    <button
                                      onClick={() =>
                                        handleRemoveMember(member._id)
                                      }
                                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
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
                                className="px-3 py-1.5 text-xs font-semibold text-amber-600 bg-amber-50 hover:bg-amber-100 rounded transition-colors"
                              >
                                Transfer Ownership
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Edit panel */}
                        {isEditing && (
                          <div className="mt-4 p-4 bg-gray-50 border-t border-gray-100">
                            <h4 className="text-xs font-bold text-gray-700 uppercase mb-3">
                              Edit Member Permissions
                            </h4>
                            <div className="mb-4">
                              <label className="block text-xs font-medium text-gray-600 mb-1">
                                Display Name
                              </label>
                              <input
                                type="text"
                                value={editDisplayName}
                                onChange={(e) =>
                                  setEditDisplayName(e.target.value)
                                }
                                className="w-full px-3 py-1.5 text-sm border border-gray-300 focus:ring-1 focus:ring-indigo-500"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-y-2 gap-x-4 mb-4">
                              {[
                                { key: "makeExpense", label: "Make Expenses" },
                                {
                                  key: "calculateCash",
                                  label: "Calculate Cash",
                                },
                                { key: "addUser", label: "Manage Users" },
                                {
                                  key: "addCategories",
                                  label: "Manage Categories",
                                },
                                {
                                  key: "addBankAccount",
                                  label: "Manage Bank Accounts",
                                },
                                {
                                  key: "updateBankBalance",
                                  label: "Update Bank Balances",
                                },
                                {
                                  key: "createAccountDownward",
                                  label: "Sub-Accounts",
                                },
                                {
                                  key: "createAccountUpward",
                                  label: "Link Parent",
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
                                          next.addBankAccount ||
                                          next.updateBankBalance
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
                            {editError && (
                              <p className="text-red-600 text-xs mb-3">
                                {editError}
                              </p>
                            )}
                            <div className="flex gap-2">
                              <button
                                onClick={handleUpdateMember}
                                disabled={editSubmitting}
                                className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-700 disabled:opacity-50"
                              >
                                Save Changes
                              </button>
                              <button
                                onClick={() => {
                                  setEditingMember(null);
                                  setEditError("");
                                }}
                                className="px-3 py-1.5 border border-gray-300 text-gray-600 text-xs hover:bg-gray-100"
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

              {/* Pending Invitations */}
              {pendingInvitations.length > 0 && (
                <div className="mt-10">
                  <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" /> Pending
                    Invitations
                  </h3>
                  <div className="divide-y divide-gray-100 border border-gray-200">
                    {pendingInvitations.map((inv) => (
                      <div
                        key={inv._id}
                        className="p-4 flex items-center justify-between gap-4"
                      >
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {inv.email}
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            Invited on{" "}
                            {new Date(inv.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              const link = `${window.location.origin}/invite/${inv.token}`;
                              navigator.clipboard
                                .writeText(link)
                                .then(() => alert("Invite link copied!"));
                            }}
                            className="text-xs font-medium text-indigo-600 hover:underline"
                          >
                            Copy Link
                          </button>
                          <button
                            onClick={() => handleCancelInvitation(inv._id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
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
                <div className="mt-8 border-2 border-indigo-200 bg-indigo-50 p-6">
                  <h3 className="text-lg font-bold text-indigo-900 mb-2 flex items-center gap-2">
                    <ArrowRightLeft className="w-5 h-5" /> Account Ownership
                    Transfer
                  </h3>
                  <p className="text-sm text-indigo-800 mb-4">
                    A transfer of this account to{" "}
                    <span className="font-bold">
                      {transferStatus.targetUserEmail}
                    </span>{" "}
                    is currently in progress.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => setShowInviteModal(true)}
                      className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold shadow-md hover:bg-indigo-700 transition-colors"
                    >
                      View Invitation Status
                    </button>
                    <button
                      onClick={() => setShowCorrectionModal(true)}
                      className="px-4 py-2 bg-white text-indigo-600 border border-indigo-200 text-sm font-semibold hover:bg-indigo-100 transition-colors"
                    >
                      Correct Contact Info
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Categories Screen */}
          {settingsSection === "categories" && (
            <div className="max-w-xl mx-auto px-6 py-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Expense Categories
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Manage categories for better tracking
                  </p>
                </div>
                {hasPermission("addCategories") && !showAddCategoryForm && (
                  <button
                    onClick={() => setShowAddCategoryForm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 transition-colors shadow-sm"
                  >
                    <Plus className="w-4 h-4" /> Add Category
                  </button>
                )}
              </div>

              {showAddCategoryForm && (
                <div className="mb-6 p-4 bg-purple-50 border border-purple-100 rounded-xl">
                  <label className="block text-xs font-bold text-purple-700 uppercase mb-2">
                    Category Name
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="e.g. Marketing, Travel..."
                      className="flex-1 px-3 py-2 border border-purple-200 focus:outline-none focus:ring-1 focus:ring-purple-500 rounded-lg text-sm"
                    />
                    <button
                      onClick={handleAddCategoryLocal}
                      disabled={categorySubmitting}
                      className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 disabled:opacity-50"
                    >
                      {categorySubmitting ? "Saving..." : "Save"}
                    </button>
                    <button
                      onClick={() => setShowAddCategoryForm(false)}
                      className="px-4 py-2 text-gray-500 text-sm hover:bg-white rounded-lg"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-3">
                {categories.map((cat, i) => (
                  <div
                    key={cat._id || i}
                    className="flex items-center justify-between p-4 bg-white border border-gray-100 hover:border-purple-200 transition-all shadow-sm rounded-xl group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-purple-400 group-hover:scale-125 transition-transform" />
                      <span className="font-semibold text-gray-800">
                        {cat.name}
                      </span>
                      {cat.isDefault && (
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">
                          Default
                        </span>
                      )}
                    </div>
                    {/* Potential delete category button here in future */}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bank Accounts Screen */}
          {settingsSection === "bankAccounts" && (
            <div className="max-w-xl mx-auto px-6 py-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Linked Accounts
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Bank balances used for transfers
                  </p>
                </div>
                {hasPermission("addBankAccount") && (
                  <button
                    onClick={() => setActiveModal("addBankAccount")}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
                  >
                    <Plus className="w-4 h-4" /> Add Bank
                  </button>
                )}
              </div>

              <div className="space-y-4">
                {bankAccounts.length === 0 ? (
                  <div className="py-12 text-center text-gray-400">
                    No bank accounts linked yet
                  </div>
                ) : (
                  bankAccounts.map((ba) => (
                    <div
                      key={ba._id}
                      className="bg-white border-2 border-gray-100 p-5 shadow-sm hover:shadow-md transition-all rounded-2xl group flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <div className="bg-blue-50 p-3 rounded-xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                          <Building2 className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900">{ba.name}</h4>
                          <div className="flex items-center gap-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {ba.bankName && <span>{ba.bankName}</span>}
                            {ba.lastFourDigits && (
                              <span>•• {ba.lastFourDigits}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-black text-gray-900">
                          {formatAmount(ba.balance, currentAccount?.currency)}
                        </div>
                        <div className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded inline-block uppercase tracking-tight">
                          {ba.accountType}
                        </div>
                      </div>
                    </div>
                  ))
                )}
                {bankAccounts.length > 0 && (
                  <>
                    <div className="mt-8 p-6 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-3xl text-white shadow-xl flex items-center justify-between overflow-hidden relative">
                      <Building2 className="absolute -left-4 -bottom-4 w-32 h-32 opacity-10 rotate-12" />
                      <div className="relative z-10">
                        <p className="text-indigo-100 text-xs font-bold uppercase tracking-widest mb-1">
                          Total Bank Liquidity
                        </p>
                        <h3 className="text-3xl font-black tracking-tight">
                          {formatAmount(
                            getExpectedBankAmount(),
                            currentAccount?.currency,
                          )}
                        </h3>
                      </div>
                      <div className="relative z-10 bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
                        <CreditCard className="w-8 h-8" />
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Top Up Bank Section */}
          {settingsSection === "topUpBank" && (
            <div className="max-w-xl mx-auto px-6 py-8">
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-slate-900 p-3 rounded-xl">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    Top Up Bank Account
                  </h2>
                </div>
                <p className="text-sm text-slate-600">
                  Add funds to any of your linked bank accounts
                </p>
              </div>

              {hasPermission("updateBankBalance") ? (
                <button
                  onClick={() => setActiveModal("topUpBankBalance")}
                  className="w-full bg-gradient-to-br from-slate-900 to-slate-700 hover:from-slate-800 hover:to-slate-600 text-white p-8 rounded-2xl transition-all shadow-lg hover:shadow-xl flex items-center justify-between group"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-white/10 p-4 rounded-xl group-hover:bg-white/20 transition-all">
                      <Building2 className="w-8 h-8" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-bold text-xl mb-1">Add Bank Funds</h3>
                      <p className="text-sm text-slate-300">
                        Select account and enter amount to top up
                      </p>
                    </div>
                  </div>
                  <ChevronDown className="w-6 h-6 -rotate-90 group-hover:translate-x-1 transition-transform" />
                </button>
              ) : (
                <div className="bg-slate-50 border border-slate-200 p-6 rounded-xl text-center">
                  <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                  <p className="text-slate-600 font-medium">
                    You don't have permission to update bank balances
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Top Up Cash Section */}
          {settingsSection === "topUpCash" && (
            <div className="max-w-xl mx-auto px-6 py-8">
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-emerald-600 p-3 rounded-xl">
                    <Wallet className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    Top Up Cash Balance
                  </h2>
                </div>
                <p className="text-sm text-slate-600">
                  Add funds directly to your cash balance
                </p>
              </div>

              {hasPermission("calculateCash") ? (
                <button
                  onClick={() => setActiveModal("addCash")}
                  className="w-full bg-gradient-to-br from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white p-8 rounded-2xl transition-all shadow-lg hover:shadow-xl flex items-center justify-between group"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-white/10 p-4 rounded-xl group-hover:bg-white/20 transition-all">
                      <Wallet className="w-8 h-8" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-bold text-xl mb-1">Add Cash Funds</h3>
                      <p className="text-sm text-emerald-100">
                        Enter amount to add to cash balance
                      </p>
                    </div>
                  </div>
                  <ChevronDown className="w-6 h-6 -rotate-90 group-hover:translate-x-1 transition-transform" />
                </button>
              ) : (
                <div className="bg-slate-50 border border-slate-200 p-6 rounded-xl text-center">
                  <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                  <p className="text-slate-600 font-medium">
                    You don't have permission to add cash
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Activity Log Screen */}
          {settingsSection === "activityLog" && (
            <div className="max-w-3xl mx-auto px-6 py-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Activity Log
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Audit trail for this account
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={activityFilter}
                    onChange={(e) => {
                      setActivityFilter(e.target.value);
                      loadActivityLog(e.target.value);
                    }}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="">All Actions</option>
                    <option value="expense_created">Expenses Created</option>
                    <option value="expense_updated">Expenses Updated</option>
                    <option value="expense_deleted">Expenses Deleted</option>
                    <option value="week_created">Week Actions</option>
                    <option value="week_locked">Week Locked</option>
                    <option value="bank_account_added">
                      Bank Account Added
                    </option>
                    <option value="bank_account_removed">
                      Bank Account Removed
                    </option>
                    <option value="account_settings_changed">
                      Settings Changed
                    </option>
                    <option value="member_invited">Members Invited</option>
                    <option value="member_removed">Members Removed</option>
                    <option value="permission_granted">
                      Permissions Granted
                    </option>
                    <option value="shift_created">Shifts Created</option>
                  </select>
                </div>
              </div>

              {activityLoading ? (
                <div className="py-12 text-center text-gray-400">
                  Loading audit trail…
                </div>
              ) : activityLogs.length === 0 ? (
                <div className="py-12 text-center text-gray-400 border border-dashed border-gray-200">
                  No activity recorded for this filter
                </div>
              ) : (
                <div className="bg-white border border-gray-200 overflow-hidden shadow-sm">
                  <div className="divide-y divide-gray-100">
                    {activityLogs.map((log) => (
                      <div
                        key={log._id}
                        className="p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start gap-4">
                          <div
                            className={`mt-1 p-2 rounded-lg ${log.action.includes("deleted") ? "bg-red-50 text-red-600" : log.action.includes("created") ? "bg-green-50 text-green-600" : "bg-blue-50 text-blue-600"}`}
                          >
                            {log.action.includes("expense") ? (
                              <Receipt className="w-4 h-4" />
                            ) : log.action.includes("bank") ? (
                              <Building2 className="w-4 h-4" />
                            ) : (
                              <History className="w-4 h-4" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">
                              {log.targetDescription}
                            </p>
                            <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <User className="w-3 h-3" />{" "}
                                {log.actorDisplayName || "System"}
                              </span>
                              <span>
                                • {new Date(log.createdAt).toLocaleString()}
                              </span>
                            </div>
                            {log.metadata &&
                              Object.keys(log.metadata).length > 0 && (
                                <div className="mt-2 text-[10px] font-mono bg-gray-50 p-2 border border-gray-100 text-gray-400 overflow-x-auto">
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
