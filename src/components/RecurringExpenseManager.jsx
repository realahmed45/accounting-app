import { useState, useEffect } from "react";
import {
  RefreshCw,
  Plus,
  Edit2,
  Trash2,
  X,
  Loader,
  Calendar,
  Play,
  Pause,
} from "lucide-react";
import api from "../services/api";

const RecurringExpenseManager = ({ accountId }) => {
  const [recurringExpenses, setRecurringExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [formData, setFormData] = useState({
    templateName: "",
    description: "",
    amount: "",
    isVariable: false,
    frequency: "monthly",
    interval: 1,
    dayOfMonth: 1,
    startDate: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    if (accountId) {
      fetchRecurringExpenses();
    }
  }, [accountId]);

  const fetchRecurringExpenses = async () => {
    try {
      const res = await api.get(`/accounts/${accountId}/recurring-expenses`);
      setRecurringExpenses(res.data.data);
    } catch (error) {
      console.error("Failed to load recurring expenses:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingExpense) {
        await api.put(
          `/accounts/${accountId}/recurring-expenses/${editingExpense._id}`,
          formData,
        );
      } else {
        await api.post(`/accounts/${accountId}/recurring-expenses`, formData);
      }

      await fetchRecurringExpenses();
      resetForm();
    } catch (error) {
      alert(
        error.response?.data?.message || "Failed to save recurring expense",
      );
    }
  };

  const handleToggle = async (expenseId) => {
    try {
      await api.patch(
        `/accounts/${accountId}/recurring-expenses/${expenseId}/toggle`,
      );
      await fetchRecurringExpenses();
    } catch (error) {
      alert(
        error.response?.data?.message || "Failed to toggle recurring expense",
      );
    }
  };

  const handleDelete = async (expenseId) => {
    if (!confirm("Delete this recurring expense?")) return;

    try {
      await api.delete(
        `/accounts/${accountId}/recurring-expenses/${expenseId}`,
      );
      await fetchRecurringExpenses();
    } catch (error) {
      alert(
        error.response?.data?.message || "Failed to delete recurring expense",
      );
    }
  };

  const resetForm = () => {
    setFormData({
      templateName: "",
      description: "",
      amount: "",
      isVariable: false,
      frequency: "monthly",
      interval: 1,
      dayOfMonth: 1,
      startDate: new Date().toISOString().split("T")[0],
    });
    setEditingExpense(null);
    setShowModal(false);
  };

  const openEditModal = (expense) => {
    setEditingExpense(expense);
    setFormData({
      templateName: expense.templateName,
      description: expense.description || "",
      amount: expense.amount,
      isVariable: expense.isVariable,
      frequency: expense.frequency,
      interval: expense.interval,
      dayOfMonth: expense.dayOfMonth || 1,
      startDate: new Date(expense.startDate).toISOString().split("T")[0],
    });
    setShowModal(true);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getFrequencyLabel = (frequency, interval) => {
    if (interval === 1) return frequency;
    return `Every ${interval} ${frequency}s`;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-6">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-2 border-indigo-500/20 rounded-2xl animate-spin-slow"></div>
          <div className="absolute inset-0 border-2 border-t-indigo-500 border-transparent rounded-2xl animate-spin"></div>
        </div>
        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] animate-pulse">
          Synchronizing Neural Cycles...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-fadeIn">
      {/* Background Ambience */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-[20%] right-[10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[20%] left-[10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Header */}
      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg shadow-indigo-500/20">
              <RefreshCw className="w-6 h-6 text-white italic" />
            </div>
            <h2 className="text-3xl font-black text-white tracking-tight uppercase italic">
              Neural Cycles
            </h2>
          </div>
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.4em] ml-16">
            Autonomous Financial Orchestration
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="group flex items-center gap-4 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] transition-all hover:scale-[1.05] active:scale-[0.95] shadow-2xl shadow-indigo-500/20"
        >
          <div className="p-1.5 bg-white/20 rounded-lg group-hover:rotate-90 transition-transform">
            <Plus className="w-4 h-4" />
          </div>
          Initialize Cycle
        </button>
      </div>

      {/* List */}
      {recurringExpenses.length === 0 ? (
        <div className="relative z-10 glass-modal-content border-dashed border-white/10 p-20 text-center space-y-8">
          <div className="relative inline-block">
            <RefreshCw className="w-16 h-16 text-slate-800 mx-auto" />
            <div className="absolute inset-0 bg-indigo-500/20 blur-2xl animate-pulse"></div>
          </div>
          <div>
            <h3 className="text-xl font-black text-white uppercase tracking-widest mb-4">
              Void Cycle Detect
            </h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto font-medium uppercase tracking-widest leading-relaxed">
              No active recurring transmission patterns identified in the current sector.
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="px-10 py-5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[10px] font-black text-white uppercase tracking-[0.3em] transition-all"
          >
            Deploy Alpha Cycle
          </button>
        </div>
      ) : (
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
          {recurringExpenses.map((expense, idx) => (
            <div
              key={expense._id}
              className={`glass-modal-content p-8 transition-all duration-500 group relative overflow-hidden ${
                expense.isActive
                  ? "border-indigo-500/30 bg-indigo-500/5 shadow-[0_30px_60px_rgba(79,70,229,0.1)] hover:border-indigo-500/50"
                  : "border-white/5 opacity-50 grayscale hover:grayscale-0 hover:opacity-100"
              }`}
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              {/* Dynamic Status Bar */}
              {expense.isActive && (
                <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-indigo-500 to-purple-600"></div>
              )}

              <div className="flex items-start justify-between mb-8">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-4 mb-3">
                    <h3 className="text-xl font-black text-white uppercase tracking-tight truncate italic">
                      {expense.templateName}
                    </h3>
                    {!expense.isActive && (
                      <span className="px-3 py-1 bg-white/5 border border-white/10 text-slate-400 text-[8px] font-black rounded-full uppercase tracking-widest">
                        Stasis
                      </span>
                    )}
                  </div>
                  {expense.description && (
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-4 line-clamp-2 leading-relaxed">
                      {expense.description}
                    </p>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                      <p className="text-[8px] font-black text-indigo-400 uppercase tracking-widest mb-1">Magnitude</p>
                      <p className="text-lg font-black text-white tracking-tighter italic">
                        {formatCurrency(expense.amount)}
                        {expense.isVariable && <span className="text-[10px] text-indigo-400 ml-1">VAR</span>}
                      </p>
                    </div>
                    <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                      <p className="text-[8px] font-black text-purple-400 uppercase tracking-widest mb-1">Frequency</p>
                      <p className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                        <Calendar className="w-3 h-3 text-purple-400" />
                        {getFrequencyLabel(expense.frequency, expense.interval)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => handleToggle(expense._id)}
                    className={`p-3 rounded-xl transition-all duration-300 border ${
                      expense.isActive
                        ? "bg-amber-500/10 border-amber-500/20 text-amber-500 hover:bg-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]"
                        : "bg-emerald-500/10 border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                    }`}
                    title={expense.isActive ? "Enter Stasis" : "Resume Stream"}
                  >
                    {expense.isActive ? (
                      <Pause className="w-5 h-5" />
                    ) : (
                      <Play className="w-5 h-5" />
                    )}
                  </button>
                  <button
                    onClick={() => openEditModal(expense)}
                    className="p-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-slate-400 hover:text-white transition-all shadow-lg"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(expense._id)}
                    className="p-3 bg-white/5 hover:bg-rose-500/20 border border-white/5 hover:border-rose-500/30 text-slate-500 hover:text-rose-400 rounded-xl transition-all shadow-lg"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Progress Footer */}
              <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse border border-indigo-500 shadow-[0_0_5px_#6366f1]" />
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">
                    Total Flux: {expense.totalCreated || 0} Packets
                  </span>
                </div>
                {expense.isActive && expense.nextScheduled && (
                  <div className="flex items-center gap-3 px-4 py-2 bg-white/2 rounded-full border border-white/5">
                    <Clock className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">
                      Horizon: {new Date(expense.nextScheduled).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-fadeIn">
          <div className="absolute inset-0 bg-[#020617]/90 backdrop-blur-2xl" onClick={resetForm}></div>
          <div className="glass-modal-content w-full max-w-lg border-white/10 shadow-[0_50px_100px_rgba(0,0,0,0.8)] z-10 animate-zoomIn max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="sticky top-0 z-10 p-8 border-b border-white/5 bg-white/2 backdrop-blur-3xl flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-black text-white uppercase tracking-tight italic">
                  {editingExpense ? "Reconfigure" : "Initialize"} Cycle
                </h3>
                <p className="text-[9px] text-indigo-400 font-black uppercase tracking-[0.3em] mt-1">Matrix Parameter Config</p>
              </div>
              <button
                onClick={resetForm}
                className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/5 group"
              >
                <X className="w-6 h-6 text-slate-500 group-hover:text-white" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-10 space-y-8">
              <div className="input-group-premium">
                <label className="input-label-premium">Template Identifier *</label>
                <input
                  type="text"
                  value={formData.templateName}
                  onChange={(e) =>
                    setFormData({ ...formData, templateName: e.target.value })
                  }
                  className="input-premium"
                  placeholder="e.g. NEURAL_RENT_ALPHA"
                  required
                />
              </div>

              <div className="input-group-premium">
                <label className="input-label-premium">Cycle Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="input-premium min-h-[100px] py-4"
                  placeholder="Cycle objectives and parameters..."
                ></textarea>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="input-group-premium">
                  <label className="input-label-premium">Magnitude (USD) *</label>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                    className="input-premium"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    required
                  />
                  <div className="flex items-center gap-3 mt-4">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, isVariable: !formData.isVariable })}
                      className={`w-10 h-5 rounded-full transition-all relative ${
                        formData.isVariable ? 'bg-indigo-500' : 'bg-white/10'
                      }`}
                    >
                      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${
                        formData.isVariable ? 'left-5.5' : 'left-0.5'
                      }`} />
                    </button>
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Variable Magnitude</span>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="input-group-premium">
                    <label className="input-label-premium">Transmission Start *</label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) =>
                        setFormData({ ...formData, startDate: e.target.value })
                      }
                      className="input-premium [color-scheme:dark]"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="input-group-premium">
                  <label className="input-label-premium">Interval Protocol *</label>
                  <select
                    value={formData.frequency}
                    onChange={(e) =>
                      setFormData({ ...formData, frequency: e.target.value })
                    }
                    className="input-premium"
                  >
                    <option value="daily">Diurnal (Daily)</option>
                    <option value="weekly">Septimal (Weekly)</option>
                    <option value="monthly">Lunar (Monthly)</option>
                    <option value="yearly">Solar (Yearly)</option>
                  </select>
                </div>

                <div className="input-group-premium">
                  <label className="input-label-premium">Flux Multiplier</label>
                  <input
                    type="number"
                    value={formData.interval}
                    onChange={(e) =>
                      setFormData({ ...formData, interval: e.target.value })
                    }
                    className="input-premium"
                    min="1"
                    placeholder="1"
                  />
                </div>
              </div>

              {formData.frequency === "monthly" && (
                <div className="input-group-premium">
                  <label className="input-label-premium">Cycle Phase Day (1-31)</label>
                  <input
                    type="number"
                    value={formData.dayOfMonth}
                    onChange={(e) =>
                      setFormData({ ...formData, dayOfMonth: e.target.value })
                    }
                    className="input-premium"
                    min="1"
                    max="31"
                  />
                </div>
              )}

              <div className="flex gap-6 pt-6">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 py-5 rounded-2xl border border-white/5 bg-white/2 hover:bg-white/5 text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-[0.3em] transition-all"
                >
                  Abort
                </button>
                <button
                  type="submit"
                  className="flex-3 py-5 px-10 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] transition-all hover:scale-[1.02] active:scale-[0.98] shadow-2xl shadow-indigo-500/20"
                >
                  {editingExpense ? "Sync Parameters" : "Engage Cycle"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecurringExpenseManager;
