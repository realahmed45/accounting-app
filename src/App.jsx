import React, { useState } from 'react';
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
  Search
} from 'lucide-react';

// ==================== UTILITY FUNCTIONS ====================

// Get Monday of the week for any given date
const getMonday = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.getFullYear(), d.getMonth(), diff);
};

// Get array of 7 dates (Monday to Sunday) for a given week
const getWeekDates = (monday) => {
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(monday);
    date.setDate(date.getDate() + i);
    return date;
  });
};

// Format date as YYYY-MM-DD
const formatDate = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Format date as readable string
const formatDateReadable = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
};

// Format time as HH:MM AM/PM
const formatTime = (date) => {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

// ==================== INITIAL DATA ====================

const createNewWeek = (startDate, initialBank = 0, initialCash = 0) => {
  const monday = getMonday(startDate);
  return {
    startDate: formatDate(monday),
    endDate: formatDate(new Date(monday.getTime() + 6 * 24 * 60 * 60 * 1000)),
    isLocked: false,
    bankBalance: initialBank,
    cashBoxBalance: initialCash,
    dailyData: getWeekDates(monday).reduce((acc, date) => {
      acc[formatDate(date)] = {
        expenses: [],
        cashFlowChecks: []
      };
      return acc;
    }, {})
  };
};

// Create initial data - start with zero
const createInitialData = () => {
  const today = new Date();
  const currentMonday = getMonday(today);
  const currentWeek = createNewWeek(currentMonday, 0, 0);
  return [currentWeek];
};

// ==================== MAIN APP COMPONENT ====================

function App() {
  // State Management
  const [weeks, setWeeks] = useState(createInitialData());
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0);
  const [expandedDays, setExpandedDays] = useState([formatDate(new Date())]);
  const [unlockCode, setUnlockCode] = useState('123456');
  
  // People and Categories
  const [people, setPeople] = useState([
    { name: 'John', isCashFlowManager: true, pinCode: '111111' },
    { name: 'Mary', isCashFlowManager: false, pinCode: '222222' },
    { name: 'Mike', isCashFlowManager: true, pinCode: '333333' }
  ]);
  
  const [categories, setCategories] = useState([
    'Electrica', 'Gas/Water', 'Laundry', 'Garden', 'House Stuff',
    'Mix Bills', 'Other Expenses', 'Construction', 'Maintenance',
    'Food', 'Staff Food', 'Outside House', 'Sam',
    'Refund Guest', 'Refund Guest Donation'
  ]);

  // Modal States
  const [activeModal, setActiveModal] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedHistoryWeek, setSelectedHistoryWeek] = useState(null);

  // Form States
  const [addCashAmount, setAddCashAmount] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [expenseForm, setExpenseForm] = useState({
    date: formatDate(new Date()),
    amount: '',
    note: '',
    category: categories[0],
    person: people[0].name,
    fromBank: false
  });
  const [cashCheckForm, setCashCheckForm] = useState({
    person: '',
    pin: '',
    actualAmount: ''
  });
  const [settingsCode, setSettingsCode] = useState('');
  const [unlockWeekIndex, setUnlockWeekIndex] = useState(null);
  const [unlockWeekCode, setUnlockWeekCode] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newPerson, setNewPerson] = useState({ name: '', isCashFlowManager: false, pinCode: '' });
  const [newUnlockCode, setNewUnlockCode] = useState('');
  const [showPinInputs, setShowPinInputs] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Current week data
  const currentWeek = weeks[currentWeekIndex];

  // ==================== CALCULATIONS ====================

  // Calculate total expenses up to current date
  const getTotalExpenses = () => {
    let total = 0;
    Object.keys(currentWeek.dailyData).forEach(date => {
      currentWeek.dailyData[date].expenses.forEach(exp => {
        total += exp.amount;
      });
    });
    return total;
  };

  // Calculate expected cash box amount
  const getExpectedCashAmount = () => {
    let cash = currentWeek.cashBoxBalance;
    Object.keys(currentWeek.dailyData).forEach(date => {
      currentWeek.dailyData[date].expenses.forEach(exp => {
        if (!exp.fromBank) {
          cash -= exp.amount;
        }
      });
    });
    return cash;
  };

  // ==================== ACTION HANDLERS ====================

  const handleAddCash = () => {
    const amount = parseFloat(addCashAmount);
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    const updatedWeeks = [...weeks];
    updatedWeeks[currentWeekIndex].bankBalance += amount;
    setWeeks(updatedWeeks);
    setAddCashAmount('');
    setActiveModal(null);
    setSuccess(`$${amount.toFixed(2)} added to bank account`);
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleTransfer = () => {
    const amount = parseFloat(transferAmount);
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (amount > currentWeek.bankBalance) {
      setError('Insufficient bank balance');
      return;
    }

    const updatedWeeks = [...weeks];
    updatedWeeks[currentWeekIndex].bankBalance -= amount;
    updatedWeeks[currentWeekIndex].cashBoxBalance += amount;
    setWeeks(updatedWeeks);
    setTransferAmount('');
    setActiveModal(null);
    setSuccess(`$${amount.toFixed(2)} transferred to cash box`);
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleAddExpense = () => {
    const amount = parseFloat(expenseForm.amount);
    
    // Validation
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    if (!expenseForm.note.trim()) {
      setError('Please enter a note');
      return;
    }

    // Check if enough balance
    if (expenseForm.fromBank && amount > currentWeek.bankBalance) {
      setError('Insufficient bank balance');
      return;
    }
    if (!expenseForm.fromBank && amount > getExpectedCashAmount()) {
      setError('Insufficient cash balance');
      return;
    }

    const expense = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      amount,
      note: expenseForm.note,
      category: expenseForm.category,
      person: expenseForm.person,
      fromBank: expenseForm.fromBank
    };

    const updatedWeeks = [...weeks];
    const dateData = updatedWeeks[currentWeekIndex].dailyData[expenseForm.date];
    if (dateData) {
      dateData.expenses.push(expense);
      setWeeks(updatedWeeks);
      
      // Reset form
      setExpenseForm({
        date: formatDate(new Date()),
        amount: '',
        note: '',
        category: categories[0],
        person: people[0].name,
        fromBank: false
      });
      setActiveModal(null);
      setSuccess('Expense added successfully');
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const handleCashFlowCheck = () => {
    const selectedPerson = people.find(p => p.name === cashCheckForm.person);
    const actualAmount = parseFloat(cashCheckForm.actualAmount);

    // Validation
    if (!selectedPerson) {
      setError('Please select a person');
      return;
    }
    if (!selectedPerson.isCashFlowManager) {
      setError('Selected person is not a cash flow manager');
      return;
    }
    if (cashCheckForm.pin !== selectedPerson.pinCode) {
      setError('Incorrect PIN');
      return;
    }
    if (isNaN(actualAmount) || actualAmount < 0) {
      setError('Please enter a valid amount');
      return;
    }

    const expectedAmount = getExpectedCashAmount();
    const difference = actualAmount - expectedAmount;
    const isMatch = Math.abs(difference) < 0.01;

    const check = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      person: cashCheckForm.person,
      expectedAmount,
      actualAmount,
      difference,
      isMatch
    };

    const updatedWeeks = [...weeks];
    const today = formatDate(new Date());
    const dateData = updatedWeeks[currentWeekIndex].dailyData[today];
    if (dateData) {
      dateData.cashFlowChecks.push(check);
      setWeeks(updatedWeeks);
      
      // Reset form
      setCashCheckForm({ person: '', pin: '', actualAmount: '' });
      setActiveModal(null);
      setSuccess(isMatch ? 'Cash flow matches!' : 'Cash flow mismatch recorded');
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const handleSaveWeek = () => {
    const updatedWeeks = [...weeks];
    updatedWeeks[currentWeekIndex].isLocked = true;
    
    // Create new week
    const lastWeek = updatedWeeks[currentWeekIndex];
    const newMonday = new Date(lastWeek.endDate);
    newMonday.setDate(newMonday.getDate() + 1);
    
    const newWeek = createNewWeek(
      newMonday,
      lastWeek.bankBalance,
      getExpectedCashAmount()
    );
    
    updatedWeeks.push(newWeek);
    setWeeks(updatedWeeks);
    setCurrentWeekIndex(updatedWeeks.length - 1);
    setSuccess('Week saved and locked. New week started!');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleUnlockWeek = (index) => {
    if (unlockWeekCode !== unlockCode) {
      setError('Incorrect unlock code');
      return;
    }

    const updatedWeeks = [...weeks];
    updatedWeeks[index].isLocked = false;
    setWeeks(updatedWeeks);
    setUnlockWeekIndex(null);
    setUnlockWeekCode('');
    setSuccess('Week unlocked successfully');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleSettingsAccess = () => {
    if (settingsCode !== unlockCode) {
      setError('Incorrect code');
      return;
    }
    setSettingsCode('');
    setShowSettings(true);
    setError('');
  };

  const handleAddCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      setCategories([...categories, newCategory.trim()]);
      setNewCategory('');
      setSuccess('Category added');
      setTimeout(() => setSuccess(''), 2000);
    }
  };

  const handleRemoveCategory = (category) => {
    setCategories(categories.filter(c => c !== category));
    setSuccess('Category removed');
    setTimeout(() => setSuccess(''), 2000);
  };

  const handleAddPerson = () => {
    if (newPerson.name.trim() && !people.find(p => p.name === newPerson.name)) {
      if (newPerson.isCashFlowManager && newPerson.pinCode.length !== 6) {
        setError('PIN must be 6 digits');
        return;
      }
      setPeople([...people, { ...newPerson, name: newPerson.name.trim() }]);
      setNewPerson({ name: '', isCashFlowManager: false, pinCode: '' });
      setSuccess('Person added');
      setTimeout(() => setSuccess(''), 2000);
    }
  };

  const handleRemovePerson = (name) => {
    setPeople(people.filter(p => p.name !== name));
    setSuccess('Person removed');
    setTimeout(() => setSuccess(''), 2000);
  };

  const handleUpdatePerson = (index, field, value) => {
    const updatedPeople = [...people];
    updatedPeople[index] = { ...updatedPeople[index], [field]: value };
    setPeople(updatedPeople);
  };

  const handleChangeUnlockCode = () => {
    if (newUnlockCode.length !== 6 || !/^\d{6}$/.test(newUnlockCode)) {
      setError('Unlock code must be exactly 6 digits');
      return;
    }
    setUnlockCode(newUnlockCode);
    setNewUnlockCode('');
    setSuccess('Unlock code changed successfully');
    setTimeout(() => setSuccess(''), 3000);
  };

  const toggleDayExpansion = (date) => {
    setExpandedDays(prev =>
      prev.includes(date) ? prev.filter(d => d !== date) : [...prev, date]
    );
  };

  // ==================== RENDER FUNCTIONS ====================

  const renderBalanceCard = (title, amount, Icon, color, iconBg) => (
    <div className={`${color} rounded-2xl p-6 shadow-xl card-shadow-hover animate-scaleIn relative overflow-hidden`}>
      {/* Shine effect */}
      <div className="absolute inset-0 shimmer opacity-30"></div>
      <div className="flex items-center justify-between relative z-10">
        <div>
          <p className="text-sm text-white/90 mb-2 font-medium tracking-wide">{title}</p>
          <p className="text-4xl font-bold text-white mb-1">${amount.toFixed(2)}</p>
          <div className="h-1 w-20 bg-white/30 rounded-full mt-2"></div>
        </div>
        <div className={`${iconBg} p-5 rounded-2xl shadow-lg transform hover:scale-110 transition-transform duration-300`}>
          <Icon className="w-10 h-10 text-white" />
        </div>
      </div>
    </div>
  );

  const renderActionButton = (label, Icon, color, onClick) => (
    <button
      onClick={onClick}
      disabled={currentWeek.isLocked && label !== 'Summary' && label !== 'Settings' && label !== 'History'}
      className={`${color} ${currentWeek.isLocked && label !== 'Summary' && label !== 'Settings' && label !== 'History' ? 'opacity-50 cursor-not-allowed' : 'btn-hover-scale'} 
        text-white font-bold py-5 px-6 rounded-2xl shadow-xl transition-all duration-300 
        flex items-center gap-3 justify-center relative overflow-hidden group`}
    >
      <Icon className="w-6 h-6 relative z-10 transform group-hover:scale-110 transition-transform duration-300" />
      <span className="relative z-10">{label}</span>
    </button>
  );

  const renderDailyBreakdown = () => {
    const today = formatDate(new Date());
    const weekDates = getWeekDates(new Date(currentWeek.startDate));

    return (
      <div className="space-y-3">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Daily Breakdown</h3>
        {weekDates.map((date) => {
          const dateStr = formatDate(date);
          const dayData = currentWeek.dailyData[dateStr];
          const isToday = dateStr === today;
          const isExpanded = expandedDays.includes(dateStr) || isToday;
          const expenseCount = dayData.expenses.length;
          const checkCount = dayData.cashFlowChecks.length;
          const totalAmount = dayData.expenses.reduce((sum, exp) => sum + exp.amount, 0);

          return (
            <div key={dateStr} className="bg-white rounded-lg shadow overflow-hidden">
              {/* Day Header */}
              <button
                onClick={() => toggleDayExpansion(dateStr)}
                className={`w-full px-6 py-4 flex items-center justify-between ${
                  isToday ? 'bg-blue-50 border-l-4 border-blue-500' : 'bg-gray-50'
                } hover:bg-gray-100 transition-colors`}
              >
                <div className="flex items-center gap-4">
                  <div>
                    <p className="font-semibold text-gray-800">
                      {formatDateReadable(date)}
                      {isToday && <span className="ml-2 text-blue-600 text-sm">(Today)</span>}
                    </p>
                    <p className="text-sm text-gray-600">
                      {expenseCount} expense{expenseCount !== 1 ? 's' : ''} • 
                      {checkCount} check{checkCount !== 1 ? 's' : ''} • 
                      ${totalAmount.toFixed(2)}
                    </p>
                  </div>
                </div>
                {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>

              {/* Day Content */}
              {isExpanded && (
                <div className="p-6 space-y-3">
                  {dayData.expenses.length === 0 && dayData.cashFlowChecks.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No activity for this day</p>
                  ) : (
                    <div className="space-y-3">
                      {/* Expenses */}
                      {dayData.expenses.map(expense => (
                        <div key={expense.id} className="border-l-4 border-red-400 bg-red-50 p-4 rounded">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Receipt className="w-4 h-4 text-red-600" />
                                <span className="font-semibold text-gray-800">{expense.note}</span>
                              </div>
                              <p className="text-sm text-gray-600">
                                {expense.category} • {expense.person} • 
                                {expense.fromBank ? ' Bank' : ' Cash'}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">{formatTime(expense.timestamp)}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-red-600">-${expense.amount.toFixed(2)}</p>
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Cash Flow Checks */}
                      {dayData.cashFlowChecks.map(check => (
                        <div key={check.id} className={`border-l-4 ${check.isMatch ? 'border-green-400 bg-green-50' : 'border-yellow-400 bg-yellow-50'} p-4 rounded`}>
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <CheckCircle2 className={`w-4 h-4 ${check.isMatch ? 'text-green-600' : 'text-yellow-600'}`} />
                                <span className="font-semibold text-gray-800">Cash Flow Check by {check.person}</span>
                              </div>
                              <p className="text-sm text-gray-600">
                                Expected: ${check.expectedAmount.toFixed(2)} • 
                                Actual: ${check.actualAmount.toFixed(2)}
                              </p>
                              {!check.isMatch && (
                                <p className="text-sm font-semibold text-red-600 mt-1">
                                  Difference: ${Math.abs(check.difference).toFixed(2)} {check.difference > 0 ? 'over' : 'under'}
                                </p>
                              )}
                              <p className="text-xs text-gray-500 mt-1">{formatTime(check.timestamp)}</p>
                            </div>
                            <div className="text-right">
                              <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                                check.isMatch ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                              }`}>
                                {check.isMatch ? '✓ Match' : '✗ Mismatch'}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderModal = (title, children, onClose) => (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 modal-overlay">
      <div className="bg-white rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-scaleIn">
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white p-6 flex justify-between items-center rounded-t-3xl shadow-lg z-10">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            {title}
          </h2>
          <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-full transition-all hover:rotate-90 duration-300">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );

  // ==================== MAIN RENDER ====================

  return (
    <div className="min-h-screen w-full max-w-7xl mx-auto p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl p-8 glass card-shadow relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-200 to-blue-200 rounded-full opacity-20 blur-3xl -translate-y-32 translate-x-32 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-green-200 to-blue-200 rounded-full opacity-20 blur-3xl translate-y-32 -translate-x-32 pointer-events-none"></div>
        
        {/* Header */}
        <div className="mb-8 text-center relative z-10">
          <div className="flex items-center justify-center mb-3">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-3 rounded-2xl shadow-lg">
              <DollarSign className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold mb-2 gradient-text">Weekly Accounting Pro</h1>
          <p className="text-gray-600 text-lg mb-2">
            Week of {formatDateReadable(currentWeek.startDate)} - {formatDateReadable(currentWeek.endDate)}
          </p>
          {currentWeek.isLocked && (
            <div className="mt-3 inline-flex items-center gap-2 bg-yellow-100 text-yellow-800 px-5 py-2.5 rounded-full shadow-md animate-pulse">
              <Lock className="w-5 h-5" />
              <span className="font-semibold">This week is locked</span>
            </div>
          )}
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-400 text-green-800 px-6 py-4 rounded-2xl flex items-center gap-3 shadow-lg animate-slideInRight">
            <div className="bg-green-500 p-2 rounded-full">
              <CheckCircle2 className="w-6 h-6 text-white" />
            </div>
            <span className="font-semibold flex-1">{success}</span>
          </div>
        )}
        {error && (
          <div className="mb-6 bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-400 text-red-800 px-6 py-4 rounded-2xl flex items-center gap-3 shadow-lg animate-slideInRight">
            <div className="bg-red-500 p-2 rounded-full">
              <AlertCircle className="w-6 h-6 text-white" />
            </div>
            <span className="font-semibold flex-1">{error}</span>
            <button onClick={() => setError('')} className="hover:bg-red-200 p-2 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 relative z-10">
          {renderBalanceCard('Cash Box', getExpectedCashAmount(), Wallet, 'bg-gradient-to-br from-emerald-500 via-green-500 to-teal-600', 'bg-emerald-600')}
          {renderBalanceCard('Bank Account', currentWeek.bankBalance, Building2, 'bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600', 'bg-blue-600')}
          {renderBalanceCard('Total Balance', currentWeek.bankBalance + getExpectedCashAmount(), DollarSign, 'bg-gradient-to-br from-purple-500 via-pink-500 to-rose-600', 'bg-purple-600')}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 relative z-10">
          {renderActionButton('Add Cash', Plus, 'bg-gradient-to-r from-emerald-500 to-teal-600', () => setActiveModal('addCash'))}
          {renderActionButton('Transfer', ArrowRightLeft, 'bg-gradient-to-r from-blue-500 to-indigo-600', () => setActiveModal('transfer'))}
          {renderActionButton('Expense', Receipt, 'bg-gradient-to-r from-red-500 to-rose-600', () => setActiveModal('expense'))}
          {renderActionButton('Check Cash', CheckCircle2, 'bg-gradient-to-r from-yellow-500 to-amber-600', () => setActiveModal('cashCheck'))}
          {renderActionButton('History', History, 'bg-gradient-to-r from-purple-500 to-violet-600', () => setShowHistory(true))}
          {renderActionButton('Summary', BarChart3, 'bg-gradient-to-r from-indigo-500 to-blue-600', () => setShowSummary(true))}
          {renderActionButton('Settings', Settings, 'bg-gradient-to-r from-gray-500 to-slate-600', () => setActiveModal('settingsAuth'))}
          {renderActionButton('Save Week', Save, 'bg-gradient-to-r from-orange-500 to-amber-600', handleSaveWeek)}
        </div>

        {/* Daily Breakdown */}
        {renderDailyBreakdown()}

        {/* Modals */}
        {activeModal === 'addCash' && renderModal(
          'Add Cash to Bank',
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Amount ($)</label>
              <input
                type="number"
                step="0.01"
                value={addCashAmount}
                onChange={(e) => setAddCashAmount(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>
            <button
              onClick={handleAddCash}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all"
            >
              Add to Bank
            </button>
          </div>,
          () => { setActiveModal(null); setError(''); }
        )}

        {activeModal === 'transfer' && renderModal(
          'Transfer Bank → Cash',
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Amount ($)</label>
              <input
                type="number"
                step="0.01"
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>
            <p className="text-sm text-gray-600">Available in bank: ${currentWeek.bankBalance.toFixed(2)}</p>
            <button
              onClick={handleTransfer}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all"
            >
              Transfer to Cash Box
            </button>
          </div>,
          () => { setActiveModal(null); setError(''); }
        )}

        {activeModal === 'expense' && renderModal(
          'Add Expense',
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
              <input
                type="date"
                value={expenseForm.date}
                onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Amount ($)</label>
              <input
                type="number"
                step="0.01"
                value={expenseForm.amount}
                onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Note</label>
              <input
                type="text"
                value={expenseForm.note}
                onChange={(e) => setExpenseForm({ ...expenseForm, note: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Description..."
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
              <select
                value={expenseForm.category}
                onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Person</label>
              <select
                value={expenseForm.person}
                onChange={(e) => setExpenseForm({ ...expenseForm, person: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                {people.map(person => (
                  <option key={person.name} value={person.name}>{person.name}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="fromBank"
                checked={expenseForm.fromBank}
                onChange={(e) => setExpenseForm({ ...expenseForm, fromBank: e.target.checked })}
                className="w-5 h-5 text-red-600 rounded focus:ring-red-500"
              />
              <label htmlFor="fromBank" className="text-sm font-semibold text-gray-700">Pay from Bank Account</label>
            </div>
            <button
              onClick={handleAddExpense}
              className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-3 rounded-lg font-semibold hover:from-red-600 hover:to-red-700 transition-all"
            >
              Add Expense
            </button>
          </div>,
          () => { setActiveModal(null); setError(''); }
        )}

        {activeModal === 'cashCheck' && renderModal(
          'Cash Flow Check',
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Select Manager</label>
              <select
                value={cashCheckForm.person}
                onChange={(e) => setCashCheckForm({ ...cashCheckForm, person: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              >
                <option value="">Select...</option>
                {people.filter(p => p.isCashFlowManager).map(person => (
                  <option key={person.name} value={person.name}>{person.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">PIN Code</label>
              <input
                type="password"
                maxLength={6}
                value={cashCheckForm.pin}
                onChange={(e) => setCashCheckForm({ ...cashCheckForm, pin: e.target.value.replace(/\D/g, '') })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                placeholder="6-digit PIN"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Actual Cash Amount ($)</label>
              <input
                type="number"
                step="0.01"
                value={cashCheckForm.actualAmount}
                onChange={(e) => setCashCheckForm({ ...cashCheckForm, actualAmount: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Expected Amount:</span> ${getExpectedCashAmount().toFixed(2)}
              </p>
            </div>
            <button
              onClick={handleCashFlowCheck}
              className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-white py-3 rounded-lg font-semibold hover:from-yellow-600 hover:to-yellow-700 transition-all"
            >
              Confirm Check
            </button>
          </div>,
          () => { setActiveModal(null); setError(''); }
        )}

        {activeModal === 'settingsAuth' && renderModal(
          'Enter Settings Code',
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">6-Digit Code</label>
              <input
                type="password"
                maxLength={6}
                value={settingsCode}
                onChange={(e) => setSettingsCode(e.target.value.replace(/\D/g, ''))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-center text-2xl tracking-widest"
                placeholder="••••••"
              />
            </div>
            <button
              onClick={handleSettingsAccess}
              className="w-full bg-gradient-to-r from-gray-500 to-gray-600 text-white py-3 rounded-lg font-semibold hover:from-gray-600 hover:to-gray-700 transition-all"
            >
              Access Settings
            </button>
          </div>,
          () => { setActiveModal(null); setError(''); setSettingsCode(''); }
        )}

        {/* Settings Modal */}
        {showSettings && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="sticky top-0 bg-gradient-to-r from-gray-600 to-gray-700 text-white p-6 flex justify-between items-center rounded-t-2xl">
                <h2 className="text-2xl font-bold">Settings</h2>
                <button onClick={() => setShowSettings(false)} className="hover:bg-white/20 p-2 rounded-full transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6 space-y-8">
                {/* Categories Section */}
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Expense Categories</h3>
                  <div className="space-y-2 mb-4">
                    {categories.map(category => (
                      <div key={category} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                        <span className="font-medium text-gray-700">{category}</span>
                        <button
                          onClick={() => handleRemoveCategory(category)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      placeholder="New category name..."
                    />
                    <button
                      onClick={handleAddCategory}
                      className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* People Section */}
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4">People</h3>
                  <div className="space-y-2 mb-4">
                    {people.map((person, index) => (
                      <div key={person.name} className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <p className="font-semibold text-gray-800 text-lg">{person.name}</p>
                          </div>
                          <button
                            onClick={() => handleRemovePerson(person.name)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id={`manager-${index}`}
                              checked={person.isCashFlowManager}
                              onChange={(e) => handleUpdatePerson(index, 'isCashFlowManager', e.target.checked)}
                              className="w-4 h-4 text-gray-600 rounded focus:ring-gray-500"
                            />
                            <label htmlFor={`manager-${index}`} className="text-sm font-medium text-gray-700">
                              Cash Flow Manager
                            </label>
                          </div>
                          {person.isCashFlowManager && (
                            <div className="relative">
                              <input
                                type={showPinInputs[index] ? 'text' : 'password'}
                                maxLength={6}
                                value={person.pinCode}
                                onChange={(e) => handleUpdatePerson(index, 'pinCode', e.target.value.replace(/\D/g, ''))}
                                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                                placeholder="6-digit PIN"
                              />
                              <button
                                onClick={() => setShowPinInputs({ ...showPinInputs, [index]: !showPinInputs[index] })}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                              >
                                {showPinInputs[index] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={newPerson.name}
                      onChange={(e) => setNewPerson({ ...newPerson, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      placeholder="New person name..."
                    />
                    <div className="flex items-center gap-2 mb-2">
                      <input
                        type="checkbox"
                        id="newPersonManager"
                        checked={newPerson.isCashFlowManager}
                        onChange={(e) => setNewPerson({ ...newPerson, isCashFlowManager: e.target.checked })}
                        className="w-4 h-4 text-gray-600 rounded focus:ring-gray-500"
                      />
                      <label htmlFor="newPersonManager" className="text-sm font-medium text-gray-700">
                        Cash Flow Manager
                      </label>
                    </div>
                    {newPerson.isCashFlowManager && (
                      <input
                        type="password"
                        maxLength={6}
                        value={newPerson.pinCode}
                        onChange={(e) => setNewPerson({ ...newPerson, pinCode: e.target.value.replace(/\D/g, '') })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                        placeholder="6-digit PIN"
                      />
                    )}
                    <button
                      onClick={handleAddPerson}
                      className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <Plus className="w-5 h-5" />
                      Add Person
                    </button>
                  </div>
                </div>

                {/* Unlock Code Section */}
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Change Unlock Code</h3>
                  <div className="flex gap-2">
                    <input
                      type="password"
                      maxLength={6}
                      value={newUnlockCode}
                      onChange={(e) => setNewUnlockCode(e.target.value.replace(/\D/g, ''))}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      placeholder="New 6-digit code..."
                    />
                    <button
                      onClick={handleChangeUnlockCode}
                      className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors font-semibold"
                    >
                      Update
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">This code is required to unlock weeks and access settings</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Summary Modal */}
        {showSummary && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white p-6 flex justify-between items-center rounded-t-2xl">
                <h2 className="text-2xl font-bold">Weekly Summary</h2>
                <button onClick={() => setShowSummary(false)} className="hover:bg-white/20 p-2 rounded-full transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                {weeks.map((week, index) => {
                  const totalExpenses = Object.values(week.dailyData).reduce((sum, day) => {
                    return sum + day.expenses.reduce((expSum, exp) => expSum + exp.amount, 0);
                  }, 0);

                  return (
                    <div key={week.startDate} className="bg-gray-50 rounded-xl p-6 shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-bold text-gray-800">
                            {formatDateReadable(week.startDate)} - {formatDateReadable(week.endDate)}
                          </h3>
                          {index === currentWeekIndex && (
                            <span className="inline-block mt-1 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-semibold">
                              Current Week
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {week.isLocked ? (
                            <>
                              <span className="flex items-center gap-1 text-yellow-700 bg-yellow-100 px-3 py-1 rounded-full text-sm font-semibold">
                                <Lock className="w-4 h-4" />
                                Locked
                              </span>
                              {unlockWeekIndex === index ? (
                                <div className="flex gap-2">
                                  <input
                                    type="password"
                                    maxLength={6}
                                    value={unlockWeekCode}
                                    onChange={(e) => setUnlockWeekCode(e.target.value.replace(/\D/g, ''))}
                                    className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                                    placeholder="Code"
                                  />
                                  <button
                                    onClick={() => handleUnlockWeek(index)}
                                    className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                                  >
                                    Unlock
                                  </button>
                                  <button
                                    onClick={() => { setUnlockWeekIndex(null); setUnlockWeekCode(''); setError(''); }}
                                    className="bg-gray-400 text-white px-3 py-1 rounded text-sm hover:bg-gray-500"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setUnlockWeekIndex(index)}
                                  className="text-gray-600 hover:text-gray-800 p-1"
                                >
                                  <Unlock className="w-5 h-5" />
                                </button>
                              )}
                            </>
                          ) : (
                            <span className="flex items-center gap-1 text-green-700 bg-green-100 px-3 py-1 rounded-full text-sm font-semibold">
                              <Unlock className="w-4 h-4" />
                              Unlocked
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white p-4 rounded-lg">
                          <p className="text-xs text-gray-600 mb-1">Total Expenses</p>
                          <p className="text-xl font-bold text-red-600">${totalExpenses.toFixed(2)}</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg">
                          <p className="text-xs text-gray-600 mb-1">Cash Box</p>
                          <p className="text-xl font-bold text-green-600">${week.cashBoxBalance.toFixed(2)}</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg">
                          <p className="text-xs text-gray-600 mb-1">Bank Account</p>
                          <p className="text-xl font-bold text-blue-600">${week.bankBalance.toFixed(2)}</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg">
                          <p className="text-xs text-gray-600 mb-1">Total Balance</p>
                          <p className="text-xl font-bold text-purple-600">${(week.bankBalance + week.cashBoxBalance).toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Comprehensive History Modal */}
        {showHistory && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 modal-overlay">
            <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-scaleIn">
              <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6 flex justify-between items-center rounded-t-2xl z-10">
                <div className="flex items-center gap-3">
                  <History className="w-8 h-8" />
                  <div>
                    <h2 className="text-2xl font-bold">Weekly History</h2>
                    <p className="text-purple-100 text-sm">Complete financial records for all weeks</p>
                  </div>
                </div>
                <button onClick={() => { setShowHistory(false); setSelectedHistoryWeek(null); }} className="hover:bg-white/20 p-2 rounded-full transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6">
                {weeks.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No weeks recorded yet</p>
                    <p className="text-gray-400 text-sm mt-2">Start by adding transactions to create your first week</p>
                  </div>
                ) : selectedHistoryWeek !== null ? (
                  // Detailed week view
                  <div className="space-y-6 animate-slideInRight">
                    <button
                      onClick={() => setSelectedHistoryWeek(null)}
                      className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-semibold mb-4 transition-colors"
                    >
                      <ChevronDown className="w-5 h-5 rotate-90" />
                      Back to all weeks
                    </button>
                    
                    {(() => {
                      const week = weeks[selectedHistoryWeek];
                      const weekDates = getWeekDates(new Date(week.startDate));
                      const totalExpenses = Object.values(week.dailyData).reduce((sum, day) => {
                        return sum + day.expenses.reduce((expSum, exp) => expSum + exp.amount, 0);
                      }, 0);
                      
                      return (
                        <>
                          {/* Week Header Card */}
                          <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6 border-2 border-purple-200">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h3 className="text-2xl font-bold text-gray-800 mb-1">
                                  {formatDateReadable(week.startDate)} - {formatDateReadable(week.endDate)}
                                </h3>
                                {selectedHistoryWeek === currentWeekIndex && (
                                  <span className="inline-block bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                                    Current Week
                                  </span>
                                )}
                              </div>
                              <div className="text-right">
                                {week.isLocked ? (
                                  <span className="inline-flex items-center gap-1 text-yellow-700 bg-yellow-100 px-3 py-1.5 rounded-full text-sm font-semibold">
                                    <Lock className="w-4 h-4" />
                                    Locked
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-green-700 bg-green-100 px-3 py-1.5 rounded-full text-sm font-semibold">
                                    <Unlock className="w-4 h-4" />
                                    Active
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            {/* Summary Stats */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div className="bg-white rounded-lg p-4 shadow">
                                <div className="flex items-center gap-2 mb-1">
                                  <Receipt className="w-4 h-4 text-red-500" />
                                  <p className="text-xs text-gray-600 font-medium">Total Expenses</p>
                                </div>
                                <p className="text-2xl font-bold text-red-600">${totalExpenses.toFixed(2)}</p>
                              </div>
                              <div className="bg-white rounded-lg p-4 shadow">
                                <div className="flex items-center gap-2 mb-1">
                                  <Wallet className="w-4 h-4 text-green-500" />
                                  <p className="text-xs text-gray-600 font-medium">Cash Box</p>
                                </div>
                                <p className="text-2xl font-bold text-green-600">${week.cashBoxBalance.toFixed(2)}</p>
                              </div>
                              <div className="bg-white rounded-lg p-4 shadow">
                                <div className="flex items-center gap-2 mb-1">
                                  <Building2 className="w-4 h-4 text-blue-500" />
                                  <p className="text-xs text-gray-600 font-medium">Bank Account</p>
                                </div>
                                <p className="text-2xl font-bold text-blue-600">${week.bankBalance.toFixed(2)}</p>
                              </div>
                              <div className="bg-white rounded-lg p-4 shadow">
                                <div className="flex items-center gap-2 mb-1">
                                  <TrendingUp className="w-4 h-4 text-purple-500" />
                                  <p className="text-xs text-gray-600 font-medium">Total Balance</p>
                                </div>
                                <p className="text-2xl font-bold text-purple-600">${(week.bankBalance + week.cashBoxBalance).toFixed(2)}</p>
                              </div>
                            </div>
                          </div>

                          {/* Daily Breakdown */}
                          <div className="space-y-3">
                            <h4 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                              <Calendar className="w-5 h-5 text-purple-600" />
                              Daily Breakdown
                            </h4>
                            {weekDates.map((date) => {
                              const dateStr = formatDate(date);
                              const dayData = week.dailyData[dateStr];
                              const expenseCount = dayData.expenses.length;
                              const checkCount = dayData.cashFlowChecks.length;
                              const totalAmount = dayData.expenses.reduce((sum, exp) => sum + exp.amount, 0);
                              const hasActivity = expenseCount > 0 || checkCount > 0;

                              return (
                                <div key={dateStr} className={`rounded-lg overflow-hidden border-2 ${hasActivity ? 'border-purple-200 bg-white' : 'border-gray-100 bg-gray-50'}`}>
                                  {/* Day Header */}
                                  <div className={`px-5 py-3 ${hasActivity ? 'bg-purple-50' : 'bg-gray-50'}`}>
                                    <div className="flex justify-between items-center">
                                      <div>
                                        <p className="font-bold text-gray-800">{formatDateReadable(date)}</p>
                                        {hasActivity && (
                                          <p className="text-sm text-gray-600 mt-0.5">
                                            {expenseCount} expense{expenseCount !== 1 ? 's' : ''} • 
                                            {checkCount} check{checkCount !== 1 ? 's' : ''} • 
                                            <span className="font-semibold text-red-600">${totalAmount.toFixed(2)}</span>
                                          </p>
                                        )}
                                      </div>
                                      {!hasActivity && (
                                        <span className="text-sm text-gray-400 italic">No activity</span>
                                      )}
                                    </div>
                                  </div>

                                  {/* Day Content */}
                                  {hasActivity && (
                                    <div className="p-5 space-y-3">
                                      {/* Expenses */}
                                      {dayData.expenses.map(expense => (
                                        <div key={expense.id} className="border-l-4 border-red-400 bg-red-50 p-4 rounded-r-lg hover:shadow-md transition-shadow">
                                          <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                              <div className="flex items-center gap-2 mb-2">
                                                <Receipt className="w-5 h-5 text-red-600" />
                                                <span className="font-bold text-gray-800 text-lg">{expense.note}</span>
                                              </div>
                                              <div className="flex flex-wrap gap-2 mb-2">
                                                <span className="bg-red-100 text-red-700 px-2.5 py-1 rounded-full text-xs font-semibold">
                                                  {expense.category}
                                                </span>
                                                <span className="bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full text-xs font-semibold">
                                                  {expense.person}
                                                </span>
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${expense.fromBank ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                                                  {expense.fromBank ? 'Bank Payment' : 'Cash Payment'}
                                                </span>
                                              </div>
                                              <p className="text-xs text-gray-500 flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {formatTime(expense.timestamp)}
                                              </p>
                                            </div>
                                            <div className="text-right ml-4">
                                              <p className="text-2xl font-bold text-red-600">-${expense.amount.toFixed(2)}</p>
                                            </div>
                                          </div>
                                        </div>
                                      ))}

                                      {/* Cash Flow Checks */}
                                      {dayData.cashFlowChecks.map(check => (
                                        <div key={check.id} className={`border-l-4 ${check.isMatch ? 'border-green-400 bg-green-50' : 'border-yellow-400 bg-yellow-50'} p-4 rounded-r-lg hover:shadow-md transition-shadow`}>
                                          <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                              <div className="flex items-center gap-2 mb-2">
                                                <CheckCircle2 className={`w-5 h-5 ${check.isMatch ? 'text-green-600' : 'text-yellow-600'}`} />
                                                <span className="font-bold text-gray-800 text-lg">Cash Flow Check</span>
                                              </div>
                                              <div className="flex flex-wrap gap-2 mb-2">
                                                <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full text-xs font-semibold">
                                                  Checked by {check.person}
                                                </span>
                                              </div>
                                              <div className="grid grid-cols-2 gap-3 mb-2 text-sm">
                                                <div>
                                                  <p className="text-gray-600 text-xs">Expected</p>
                                                  <p className="font-semibold text-gray-800">${check.expectedAmount.toFixed(2)}</p>
                                                </div>
                                                <div>
                                                  <p className="text-gray-600 text-xs">Actual</p>
                                                  <p className="font-semibold text-gray-800">${check.actualAmount.toFixed(2)}</p>
                                                </div>
                                              </div>
                                              {!check.isMatch && (
                                                <p className="text-sm font-bold text-red-600 mb-1">
                                                  Difference: ${Math.abs(check.difference).toFixed(2)} {check.difference > 0 ? 'over' : 'under'}
                                                </p>
                                              )}
                                              <p className="text-xs text-gray-500 flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {formatTime(check.timestamp)}
                                              </p>
                                            </div>
                                            <div className="text-right ml-4">
                                              <span className={`inline-flex items-center gap-1 px-4 py-2 rounded-full text-sm font-bold ${
                                                check.isMatch ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                                              }`}>
                                                {check.isMatch ? '✓ Match' : '✗ Mismatch'}
                                              </span>
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </>
                      );
                    })()}
                  </div>
                ) : (
                  // Week list view
                  <div className="space-y-4 animate-slideInLeft">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-gray-600">
                        Total: <span className="font-bold text-purple-600">{weeks.length}</span> week{weeks.length !== 1 ? 's' : ''} recorded
                      </p>
                    </div>
                    {weeks.map((week, index) => {
                      const totalExpenses = Object.values(week.dailyData).reduce((sum, day) => {
                        return sum + day.expenses.reduce((expSum, exp) => expSum + exp.amount, 0);
                      }, 0);
                      const totalTransactions = Object.values(week.dailyData).reduce((sum, day) => {
                        return sum + day.expenses.length + day.cashFlowChecks.length;
                      }, 0);

                      return (
                        <div 
                          key={week.startDate} 
                          onClick={() => setSelectedHistoryWeek(index)}
                          className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-6 shadow-md hover:shadow-xl transition-all cursor-pointer border-2 border-transparent hover:border-purple-300 card-shadow-hover"
                        >
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="text-xl font-bold text-gray-800 mb-1 flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-purple-600" />
                                {formatDateReadable(week.startDate)} - {formatDateReadable(week.endDate)}
                              </h3>
                              <div className="flex gap-2 mt-2">
                                {index === currentWeekIndex && (
                                  <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                                    Current
                                  </span>
                                )}
                                {week.isLocked ? (
                                  <span className="inline-flex items-center gap-1 text-yellow-700 bg-yellow-100 px-3 py-1 rounded-full text-xs font-semibold">
                                    <Lock className="w-3 h-3" />
                                    Locked
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-green-700 bg-green-100 px-3 py-1 rounded-full text-xs font-semibold">
                                    <Unlock className="w-3 h-3" />
                                    Active
                                  </span>
                                )}
                                <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-semibold">
                                  {totalTransactions} transaction{totalTransactions !== 1 ? 's' : ''}
                                </span>
                              </div>
                            </div>
                            <ChevronDown className="w-6 h-6 text-purple-600 -rotate-90" />
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div className="bg-red-50 p-3 rounded-lg border border-red-100">
                              <p className="text-xs text-red-600 font-medium mb-1">Expenses</p>
                              <p className="text-lg font-bold text-red-700">${totalExpenses.toFixed(2)}</p>
                            </div>
                            <div className="bg-green-50 p-3 rounded-lg border border-green-100">
                              <p className="text-xs text-green-600 font-medium mb-1">Cash Box</p>
                              <p className="text-lg font-bold text-green-700">${week.cashBoxBalance.toFixed(2)}</p>
                            </div>
                            <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                              <p className="text-xs text-blue-600 font-medium mb-1">Bank</p>
                              <p className="text-lg font-bold text-blue-700">${week.bankBalance.toFixed(2)}</p>
                            </div>
                            <div className="bg-purple-50 p-3 rounded-lg border border-purple-100">
                              <p className="text-xs text-purple-600 font-medium mb-1">Total</p>
                              <p className="text-lg font-bold text-purple-700">${(week.bankBalance + week.cashBoxBalance).toFixed(2)}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Add Clock icon import at the top if not already present
const Clock = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10"></circle>
    <polyline points="12 6 12 12 16 14"></polyline>
  </svg>
);

export default App;
