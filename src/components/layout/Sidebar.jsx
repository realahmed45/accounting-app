import React, { useState } from "react";
import {
  LayoutDashboard,
  PlusCircle,
  History,
  Building2,
  BarChart3,
  Settings,
  HelpCircle,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Plus,
} from "lucide-react";

const Sidebar = ({
  isOpen,
  onClose,
  onAddExpense,
  onShowHistory,
  onShowBankAccounts,
  onShowReports,
  onShowSettings,
  onSwitchBusiness,
  onCreateAccount,
  currentAccount,
  accounts = [],
}) => {
  const [expensesOpen, setExpensesOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [switchOpen, setSwitchOpen] = useState(false);

  const NavItem = ({
    icon: Icon,
    label,
    onClick,
    children,
    isOpen: subOpen,
    onToggle,
    indent,
  }) => (
    <div>
      <button
        onClick={onToggle || onClick}
        className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors hover:bg-gray-100 text-gray-700 ${indent ? "pl-9" : ""}`}
      >
        {Icon && <Icon className="w-4 h-4 text-gray-500 flex-shrink-0" />}
        <span className="flex-1 text-left">{label}</span>
        {children &&
          (subOpen ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          ))}
      </button>
      {children && subOpen && <div className="mt-0.5">{children}</div>}
    </div>
  );

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-white border-r border-gray-200 z-40 flex flex-col transition-transform duration-300
          w-56
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:static lg:h-screen lg:z-auto`}
      >
        {/* Logo */}
        <div className="px-5 py-5 border-b border-gray-100">
          <span className="text-blue-600 font-black text-base tracking-wide uppercase">
            Weekly Accountings
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 mb-2">
            Menu
          </p>

          {/* Expenses */}
          <NavItem
            icon={LayoutDashboard}
            label="Expenses"
            isOpen={expensesOpen}
            onToggle={() => setExpensesOpen(!expensesOpen)}
          >
            <button
              onClick={() => {
                onAddExpense?.();
                onClose?.();
              }}
              className="w-full text-left pl-10 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Add new expense
            </button>
          </NavItem>

          <button
            onClick={() => {
              onShowHistory?.();
              onClose?.();
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <History className="w-4 h-4 text-gray-500" />
            History/Transactions
          </button>

          <button
            onClick={() => {
              onShowBankAccounts?.();
              onClose?.();
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <Building2 className="w-4 h-4 text-gray-500" />
            Add Bank Account
          </button>

          <button
            onClick={() => {
              onShowReports?.();
              onClose?.();
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <BarChart3 className="w-4 h-4 text-gray-500" />
            Reports
          </button>

          {/* Others */}
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 mt-4 mb-2">
            Others
          </p>

          <NavItem
            icon={Settings}
            label="Settings"
            isOpen={settingsOpen}
            onToggle={() => setSettingsOpen(!settingsOpen)}
          >
            <button
              onClick={() => {
                onShowSettings?.();
                onClose?.();
              }}
              className="w-full text-left pl-10 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Account Settings
            </button>
          </NavItem>

          <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors">
            <HelpCircle className="w-4 h-4 text-gray-500" />
            Help
          </button>

          <NavItem
            icon={RefreshCw}
            label="Switch Business"
            isOpen={switchOpen}
            onToggle={() => setSwitchOpen(!switchOpen)}
          >
            {accounts.map((acc) => (
              <button
                key={acc._id}
                onClick={() => {
                  onSwitchBusiness?.(acc);
                  onClose?.();
                  setSwitchOpen(false);
                }}
                className={`w-full text-left pl-10 py-2 text-sm rounded-lg transition-colors ${
                  acc._id === currentAccount?._id
                    ? "text-blue-600 font-semibold bg-blue-50"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                {acc.name || acc.category || "Account"}
              </button>
            ))}
          </NavItem>
        </nav>

        {/* Add New Business Card */}
        <div className="px-3 pb-4">
          <div className="bg-gray-50 rounded-xl p-4 text-center border border-gray-200">
            <p className="text-sm font-semibold text-gray-800 mb-1">
              Add new business
            </p>
            <p className="text-xs text-gray-500 mb-3">
              Add another business to manage its finances
            </p>
            <button
              onClick={onCreateAccount}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2 px-3 rounded-lg transition-colors"
            >
              Add new business +
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
