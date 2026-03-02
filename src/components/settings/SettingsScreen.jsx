import React, { useState, useEffect } from "react";
import { 
  Settings, X, ChevronDown, User, BarChart3, Building2, History, 
  UserPlus, Crown, UserMinus, Mail, Plus, CheckCircle2, 
  Search, CreditCard, AlertCircle, Receipt, Trash2
} from "lucide-react";
import { memberService, invitationService, activityService } from "../../services/api";
import { sendInvitationEmail } from "../../services/emailService";
import TransferOwnershipModal from "../TransferOwnershipModal";
import InviteModal from "../InviteModal";
import OwnershipCorrectionModal from "../OwnershipCorrectionModal";

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
  runIfAllowed
}) => {
  const [settingsSection, setSettingsSection] = useState(null); // "users" | "categories" | "bankAccounts" | "activityLog"
  
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
    const filterToUse = filterOverride !== undefined ? filterOverride : activityFilter;
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

  const handleAddMember = async () => runIfAllowed(async () => {
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
        const inviterName = `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || user?.email;
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
          makeExpense: true,
          createAccountDownward: false,
          createAccountUpward: false,
        });
        await loadPendingInvitations();
      } else {
        setNewMemberError(res.message || "Failed to send invitation");
      }
    } catch (err) {
      setNewMemberError(err.response?.data?.message || "Failed to send invitation");
    } finally {
      setNewMemberSubmitting(false);
    }
  });

  const handleUpdateMember = async () => runIfAllowed(async () => {
    if (!editingMember) return;
    setEditSubmitting(true);
    setEditError("");
    try {
      const res = await memberService.update(currentAccount._id, editingMember._id, {
        displayName: editDisplayName,
        permissions: editPerms,
      });
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

  const handleCancelInvitation = async (invId) => {
    if (!window.confirm("Cancel this invitation?")) return;
    try {
      const res = await memberService.cancelInvitation(currentAccount._id, invId);
      if (res.success) await loadPendingInvitations();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to cancel invitation");
    }
  };

  const handleAddCategoryLocal = async () => runIfAllowed(async () => {
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
          {/* Landing: 4 buttons */}
          {!settingsSection && (
            <div className="max-w-lg mx-auto px-6 py-12 space-y-3">
              {[
                { key: "users", icon: <User className="w-6 h-6" />, label: "Users", desc: "Manage access & team members", color: "bg-indigo-600" },
                { key: "categories", icon: <BarChart3 className="w-6 h-6" />, label: "Categories", desc: "View & manage expense categories", color: "bg-purple-600" },
                { key: "bankAccounts", icon: <Building2 className="w-6 h-6" />, label: "Add Bank Account", desc: "Link and manage bank accounts", color: "bg-blue-600" },
                { key: "activityLog", icon: <History className="w-6 h-6" />, label: "Activity Log", desc: "View account audit trail", color: "bg-gray-700" },
              ].map((item) => (
                <button
                  key={item.key}
                  onClick={() => setSettingsSection(item.key)}
                  className="w-full flex items-center gap-5 px-6 py-5 bg-white border border-gray-200 hover:border-gray-400 hover:shadow-md transition-all text-left group"
                >
                  <div className={`${item.color} p-3 text-white flex-shrink-0`}>{item.icon}</div>
                  <div className="flex-1">
                    <div className="text-lg font-bold text-gray-900">{item.label}</div>
                    <div className="text-sm text-gray-500">{item.desc}</div>
                  </div>
                  <ChevronDown className="w-5 h-5 text-gray-400 -rotate-90 group-hover:text-gray-700 transition-colors" />
                </button>
              ))}
            </div>
          )}

          {/* Users Screen */}
          {settingsSection === "users" && (
            <div className="max-w-2xl mx-auto px-6 py-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Account Members</h2>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {members.length} member{members.length !== 1 ? "s" : ""} in this account
                  </p>
                </div>
                {hasPermission("addUser") && !showAddMemberForm && (
                  <button
                    onClick={() => { setShowAddMemberForm(true); setNewMemberError(""); }}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
                  >
                    <UserPlus className="w-4 h-4" /> Invite Member
                  </button>
                )}
              </div>

              {membersError && (
                <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm">{membersError}</div>
              )}

              {inviteSentLink && (
                <div className="mb-5 border border-green-200 bg-green-50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-green-800 mb-1">✓ Invitation created! Email not configured — share this link:</p>
                      <input readOnly value={inviteSentLink} className="w-full px-2 py-1.5 text-xs border border-green-300 bg-white text-gray-700 font-mono" onClick={(e) => e.target.select()} />
                    </div>
                    <button onClick={() => navigator.clipboard.writeText(inviteSentLink).then(() => alert("Link copied!"))} className="flex-shrink-0 px-3 py-1.5 bg-green-600 text-white text-xs font-medium hover:bg-green-700">Copy</button>
                  </div>
                  <button onClick={() => setInviteSentLink("")} className="mt-2 text-xs text-green-600 hover:underline">Dismiss</button>
                </div>
              )}

              {showAddMemberForm && (
                <div className="mb-6 border border-indigo-200 bg-indigo-50 p-5">
                  <h3 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
                    <UserPlus className="w-4 h-4 text-indigo-600" /> Invite New Member
                  </h3>
                  <p className="text-xs text-gray-500 mb-4">They'll receive an email with a link to set up their password and join this account.</p>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Email *</label>
                      <input type="email" value={newMemberEmail} onChange={(e) => setNewMemberEmail(e.target.value)} placeholder="user@example.com" className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Display Name</label>
                      <input type="text" value={newMemberDisplayName} onChange={(e) => setNewMemberDisplayName(e.target.value)} placeholder="Optional" className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-xs font-medium text-gray-600 mb-3">Permissions</label>
                    <div className="space-y-6">
                      <div>
                        <p className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3">Expenses &amp; Cash</p>
                        <div className="grid grid-cols-2 gap-2">
                          {[{ key: "makeExpense", label: "Make Expenses" }, { key: "calculateCash", label: "Calculate Cash" }].map(({ key, label }) => (
                            <label key={key} className="flex items-center gap-2 text-sm cursor-pointer">
                              <input type="checkbox" checked={!!newMemberPerms[key]} disabled={!hasPermission(key)} onChange={(e) => setNewMemberPerms((prev) => ({ ...prev, [key]: e.target.checked }))} className="w-4 h-4 accent-indigo-600" />
                              <span className={!hasPermission(key) ? "text-gray-400" : "text-gray-700"}>{label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3">Access Settings</p>
                        <div className="grid grid-cols-1 gap-2">
                          {[
                            { key: "addUser", label: "Manage / Create Users" },
                            { key: "addCategories", label: "Manage / Create Categories" },
                            { key: "addBankAccount", label: "Manage / Create Bank Accounts" }
                          ].map(({ key, label }) => (
                            <label key={key} className="flex items-center gap-2 text-sm cursor-pointer">
                              <input type="checkbox" checked={!!newMemberPerms[key]} disabled={!hasPermission(key)} onChange={(e) => {
                                const checked = e.target.checked;
                                setNewMemberPerms(prev => {
                                  const next = { ...prev, [key]: checked };
                                  next.accessSettings = !!(next.addUser || next.addCategories || next.addBankAccount);
                                  return next;
                                });
                              }} className="w-4 h-4 accent-indigo-600" />
                              <span className={!hasPermission(key) ? "text-gray-400" : "text-gray-700"}>{label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3">Account Structure</p>
                        <div className="grid grid-cols-2 gap-2">
                          {[{ key: "createAccountDownward", label: "Create Sub-Accounts" }, { key: "createAccountUpward", label: "Link To Parent" }].map(({ key, label }) => (
                            <label key={key} className="flex items-center gap-2 text-sm cursor-pointer">
                              <input type="checkbox" checked={!!newMemberPerms[key]} disabled={!hasPermission(key)} onChange={(e) => setNewMemberPerms((prev) => ({ ...prev, [key]: e.target.checked }))} className="w-4 h-4 accent-indigo-600" />
                              <span className={!hasPermission(key) ? "text-gray-400" : "text-gray-700"}>{label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  {newMemberError && <p className="text-red-600 text-sm mb-3">{newMemberError}</p>}
                  <div className="flex gap-3">
                    <button onClick={handleAddMember} disabled={newMemberSubmitting} className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors">
                      {newMemberSubmitting ? "Sending…" : "Send Invitation"}
                    </button>
                    <button onClick={() => { setShowAddMemberForm(false); setNewMemberError(""); }} className="px-4 py-2 border border-gray-300 text-gray-600 text-sm hover:bg-gray-100 transition-colors">Cancel</button>
                  </div>
                </div>
              )}

              {/* Members list */}
              {membersLoading ? (
                <div className="py-12 text-center text-gray-400 text-sm">Loading members…</div>
              ) : members.length === 0 ? (
                <div className="py-12 text-center text-gray-400 text-sm border border-gray-200">No members yet</div>
              ) : (
                <div className="divide-y divide-gray-100 border border-gray-200">
                  {members.map((member) => {
                    const isEditing = editingMember?._id === member._id;
                    const isSelf = member.userId?._id === user?._id || member.userId === user?._id;
                    const isOwner = member.role === "owner";
                    return (
                      <div key={member._id} className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${isOwner ? "bg-yellow-100" : "bg-gray-100"}`}>
                              {isOwner ? <Crown className="w-4 h-4 text-yellow-600" /> : <User className="w-4 h-4 text-gray-500" />}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-900 text-sm">{member.displayName || member.userId?.email || "—"}</span>
                                {isOwner && <span className="text-xs px-1.5 py-0.5 bg-yellow-100 text-yellow-700 font-medium">Owner</span>}
                                {isSelf && <span className="text-xs px-1.5 py-0.5 bg-indigo-100 text-indigo-700 font-medium">You</span>}
                                {member.viewOnly && <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-500 font-medium">View Only</span>}
                              </div>
                              <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                <Mail className="w-3 h-3" /> {member.userId?.email || "No email"}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            {!isEditing && !isOwner && hasPermission("addUser") && (
                              <>
                                <button onClick={() => { setEditingMember(member); setEditPerms(member.permissions || {}); setEditDisplayName(member.displayName || ""); setEditError(""); }} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors">Edit</button>
                                {!isSelf && <button onClick={() => handleRemoveMember(member._id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"><UserMinus className="w-4 h-4" /></button>}
                              </>
                            )}
                            {isOwner && member.userId?._id === user?._id && (
                              <button onClick={() => setShowTransferModal(true)} className="px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100">Transfer Ownership</button>
                            )}
                          </div>
                        </div>

                        {/* Edit panel */}
                        {isEditing && (
                          <div className="mt-4 p-4 bg-gray-50 border-t border-gray-100">
                            <h4 className="text-xs font-bold text-gray-700 uppercase mb-3">Edit Member Permissions</h4>
                            <div className="mb-4">
                              <label className="block text-xs font-medium text-gray-600 mb-1">Display Name</label>
                              <input type="text" value={editDisplayName} onChange={(e) => setEditDisplayName(e.target.value)} className="w-full px-3 py-1.5 text-sm border border-gray-300 focus:ring-1 focus:ring-indigo-500" />
                            </div>
                            <div className="grid grid-cols-2 gap-y-2 gap-x-4 mb-4">
                              {[
                                { key: "makeExpense", label: "Make Expenses" },
                                { key: "calculateCash", label: "Calculate Cash" },
                                { key: "addUser", label: "Manage Users" },
                                { key: "addCategories", label: "Manage Categories" },
                                { key: "addBankAccount", label: "Manage Bank Accounts" },
                                { key: "createAccountDownward", label: "Sub-Accounts" },
                                { key: "createAccountUpward", label: "Link Parent" },
                              ].map(({ key, label }) => (
                                <label key={key} className="flex items-center gap-2 text-sm cursor-pointer">
                                  <input type="checkbox" checked={!!editPerms[key]} disabled={!hasPermission(key)} onChange={(e) => {
                                    const checked = e.target.checked;
                                    setEditPerms(prev => {
                                      const next = { ...prev, [key]: checked };
                                      next.accessSettings = !!(next.addUser || next.addCategories || next.addBankAccount);
                                      return next;
                                    });
                                  }} className="w-4 h-4 accent-indigo-600" />
                                  <span className={!hasPermission(key) ? "text-gray-400" : "text-gray-700"}>{label}</span>
                                </label>
                              ))}
                            </div>
                            {editError && <p className="text-red-600 text-xs mb-3">{editError}</p>}
                            <div className="flex gap-2">
                              <button onClick={handleUpdateMember} disabled={editSubmitting} className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-700 disabled:opacity-50">Save Changes</button>
                              <button onClick={() => { setEditingMember(null); setEditError(""); }} className="px-3 py-1.5 border border-gray-300 text-gray-600 text-xs hover:bg-gray-100">Cancel</button>
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
                  <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2"><Mail className="w-4 h-4 text-gray-400" /> Pending Invitations</h3>
                  <div className="divide-y divide-gray-100 border border-gray-200">
                    {pendingInvitations.map((inv) => (
                      <div key={inv._id} className="p-4 flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">{inv.email}</div>
                          <div className="text-xs text-gray-500 mt-0.5">Invited on {new Date(inv.createdAt).toLocaleDateString()}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => {
                            const link = `${window.location.origin}/invite/${inv.token}`;
                            navigator.clipboard.writeText(link).then(() => alert("Invite link copied!"));
                          }} className="text-xs font-medium text-indigo-600 hover:underline">Copy Link</button>
                          <button onClick={() => handleCancelInvitation(inv._id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"><X className="w-4 h-4" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Transfer banner */}
              {transferStatus && (
                <div className="mt-8 border-2 border-indigo-200 bg-indigo-50 p-6">
                  <h3 className="text-lg font-bold text-indigo-900 mb-2 flex items-center gap-2"><ArrowRightLeft className="w-5 h-5" /> Account Ownership Transfer</h3>
                  <p className="text-sm text-indigo-800 mb-4">A transfer of this account to <span className="font-bold">{transferStatus.targetUserEmail}</span> is currently in progress.</p>
                  <div className="flex flex-wrap gap-3">
                    <button onClick={() => setShowInviteModal(true)} className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold shadow-md hover:bg-indigo-700 transition-colors">View Invitation Status</button>
                    <button onClick={() => setShowCorrectionModal(true)} className="px-4 py-2 bg-white text-indigo-600 border border-indigo-200 text-sm font-semibold hover:bg-indigo-100 transition-colors">Correct Contact Info</button>
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
                  <h2 className="text-xl font-bold text-gray-900">Expense Categories</h2>
                  <p className="text-sm text-gray-500 mt-1">Manage categories for better tracking</p>
                </div>
                {hasPermission("addCategories") && !showAddCategoryForm && (
                  <button onClick={() => setShowAddCategoryForm(true)} className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 transition-colors shadow-sm">
                    <Plus className="w-4 h-4" /> Add Category
                  </button>
                )}
              </div>

              {showAddCategoryForm && (
                <div className="mb-6 p-4 bg-purple-50 border border-purple-100 rounded-xl">
                  <label className="block text-xs font-bold text-purple-700 uppercase mb-2">Category Name</label>
                  <div className="flex gap-2">
                    <input type="text" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} placeholder="e.g. Marketing, Travel..." className="flex-1 px-3 py-2 border border-purple-200 focus:outline-none focus:ring-1 focus:ring-purple-500 rounded-lg text-sm" />
                    <button onClick={handleAddCategoryLocal} disabled={categorySubmitting} className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 disabled:opacity-50">{categorySubmitting ? "Saving..." : "Save"}</button>
                    <button onClick={() => setShowAddCategoryForm(false)} className="px-4 py-2 text-gray-500 text-sm hover:bg-white rounded-lg">Cancel</button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-3">
                {categories.map((cat, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-white border border-gray-100 hover:border-purple-200 transition-all shadow-sm rounded-xl group">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-purple-400 group-hover:scale-125 transition-transform" />
                      <span className="font-semibold text-gray-800">{cat}</span>
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
                  <h2 className="text-xl font-bold text-gray-900">Linked Accounts</h2>
                  <p className="text-sm text-gray-500 mt-1">Bank balances used for transfers</p>
                </div>
                {hasPermission("addBankAccount") && (
                  <button onClick={() => setActiveModal("addBankAccount")} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm">
                    <Plus className="w-4 h-4" /> Add Bank
                  </button>
                )}
              </div>

              <div className="space-y-4">
                {bankAccounts.length === 0 ? (
                  <div className="py-12 text-center text-gray-400">No bank accounts linked yet</div>
                ) : (
                  bankAccounts.map((ba) => (
                    <div key={ba._id} className="bg-white border-2 border-gray-100 p-5 shadow-sm hover:shadow-md transition-all rounded-2xl group flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="bg-blue-50 p-3 rounded-xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                          <Building2 className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900">{ba.name}</h4>
                          <div className="flex items-center gap-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {ba.bankName && <span>{ba.bankName}</span>}
                            {ba.lastFourDigits && <span>•• {ba.lastFourDigits}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-black text-gray-900">${ba.balance.toFixed(2)}</div>
                        <div className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded inline-block uppercase tracking-tight">{ba.accountType}</div>
                      </div>
                    </div>
                  ))
                )}
                {bankAccounts.length > 0 && (
                  <div className="mt-8 p-6 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-3xl text-white shadow-xl flex items-center justify-between overflow-hidden relative">
                    <Building2 className="absolute -left-4 -bottom-4 w-32 h-32 opacity-10 rotate-12" />
                    <div className="relative z-10">
                      <p className="text-indigo-100 text-xs font-bold uppercase tracking-widest mb-1">Total Bank Liquidity</p>
                      <h3 className="text-3xl font-black tracking-tight">${getExpectedBankAmount().toFixed(2)}</h3>
                    </div>
                    <div className="relative z-10 bg-white/20 p-3 rounded-2xl backdrop-blur-sm"><CreditCard className="w-8 h-8" /></div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Activity Log Screen */}
          {settingsSection === "activityLog" && (
            <div className="max-w-3xl mx-auto px-6 py-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Activity Log</h2>
                  <p className="text-sm text-gray-500 mt-1">Audit trail for this account</p>
                </div>
                <div className="flex items-center gap-2">
                  <select value={activityFilter} onChange={(e) => { setActivityFilter(e.target.value); loadActivityLog(e.target.value); }} className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
                    <option value="">All Actions</option>
                    <option value="expense_created">Expenses Created</option>
                    <option value="expense_updated">Expenses Updated</option>
                    <option value="expense_deleted">Expenses Deleted</option>
                    <option value="cash_added">Cash Added</option>
                    <option value="bank_transfer">Bank Transfers</option>
                    <option value="member_invited">Members Invited</option>
                  </select>
                </div>
              </div>

              {activityLoading ? (
                <div className="py-12 text-center text-gray-400">Loading audit trail…</div>
              ) : activityLogs.length === 0 ? (
                <div className="py-12 text-center text-gray-400 border border-dashed border-gray-200">No activity recorded for this filter</div>
              ) : (
                <div className="bg-white border border-gray-200 overflow-hidden shadow-sm">
                  <div className="divide-y divide-gray-100">
                    {activityLogs.map((log) => (
                      <div key={log._id} className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start gap-4">
                          <div className={`mt-1 p-2 rounded-lg ${log.action.includes("deleted") ? "bg-red-50 text-red-600" : log.action.includes("created") ? "bg-green-50 text-green-600" : "bg-blue-50 text-blue-600"}`}>
                            {log.action.includes("expense") ? <Receipt className="w-4 h-4" /> : log.action.includes("bank") ? <Building2 className="w-4 h-4" /> : <HistoryIcon className="w-4 h-4" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">{log.description}</p>
                            <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
                              <span className="flex items-center gap-1"><User className="w-3 h-3" /> {log.userId?.displayName || log.userId?.email || "System"}</span>
                              <span>• {new Date(log.createdAt).toLocaleString()}</span>
                            </div>
                            {log.metadata && Object.keys(log.metadata).length > 0 && (
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
          onSuccess={() => { setShowTransferModal(false); loadTransferStatus(); }}
        />
      )}
      {showInviteModal && transferStatus && (
        <InviteModal 
          inviteData={transferStatus} 
          currentAccount={currentAccount}
          onClose={() => setShowInviteModal(false)}
        />
      )}
      {showCorrectionModal && transferStatus && (
        <OwnershipCorrectionModal 
          transferStatus={transferStatus} 
          currentAccount={currentAccount}
          onClose={() => setShowCorrectionModal(false)}
          onSuccess={() => { setShowCorrectionModal(false); loadTransferStatus(); }}
        />
      )}
    </>
  );
};

export default SettingsScreen;
