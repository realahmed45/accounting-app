import { useState, useEffect } from "react";
import {
  DollarSign,
  Plus,
  Edit2,
  Trash2,
  X,
  Loader,
  AlertTriangle,
  TrendingUp,
  Calendar,
} from "lucide-react";
import api from "../services/api";

const BudgetTracker = ({ accountId }) => {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    type: "total",
    amount: "",
    period: "monthly",
    rollover: false,
  });

  useEffect(() => {
    if (accountId) {
      fetchBudgets();
    }
  }, [accountId]);

  const fetchBudgets = async () => {
    try {
      const res = await api.get(`/accounts/${accountId}/budgets`);
      setBudgets(res.data.data);
    } catch (error) {
      console.error("Failed to load budgets:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingBudget) {
        await api.put(
          `/accounts/${accountId}/budgets/${editingBudget._id}`,
          formData,
        );
      } else {
        await api.post(`/accounts/${accountId}/budgets`, formData);
      }

      await fetchBudgets();
      resetForm();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to save budget");
    }
  };

  const handleDelete = async (budgetId) => {
    if (!confirm("Delete this budget?")) return;

    try {
      await api.delete(`/accounts/${accountId}/budgets/${budgetId}`);
      await fetchBudgets();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to delete budget");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      type: "total",
      amount: "",
      period: "monthly",
      rollover: false,
    });
    setEditingBudget(null);
    setShowModal(false);
  };

  const openEditModal = (budget) => {
    setEditingBudget(budget);
    setFormData({
      name: budget.name,
      type: budget.type,
      amount: budget.amount,
      period: budget.period,
      rollover: budget.rollover,
    });
    setShowModal(true);
  };

  const getBudgetStatus = (budget) => {
    const percentage = budget.percentageSpent;

    if (percentage >= 100)
      return { color: "red", text: "Exceeded", icon: AlertTriangle };
    if (percentage >= 90)
      return { color: "red", text: "Critical", icon: AlertTriangle };
    if (percentage >= 75)
      return { color: "yellow", text: "Warning", icon: TrendingUp };
    return { color: "green", text: "On Track", icon: TrendingUp };
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-24 space-y-6">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 border-2 border-emerald-500/20 rounded-xl animate-spin-slow"></div>
          <div className="absolute inset-0 border-2 border-t-emerald-500 border-transparent rounded-xl animate-spin"></div>
        </div>
        <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em] animate-pulse">
          Syncing Fiscal Nodes...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-5">
          <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.1)]">
            <DollarSign className="w-6 h-6 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white tracking-widest uppercase italic">
              Liquidity Protocol
            </h2>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mt-1">
              Deterministic Budgeting Engine
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary group relative overflow-hidden px-8 py-4 rounded-2xl font-black text-[10px] tracking-widest uppercase flex items-center gap-3 active:scale-95 transition-all shadow-[0_10px_40px_rgba(79,70,229,0.2)]"
        >
          <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-500" />
          Initialize Budget
        </button>
      </div>

      {/* Budgets List */}
      {budgets.length === 0 ? (
        <div className="glass-card flex flex-col items-center justify-center py-24 border-white/5 bg-white/2">
          <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/10 mb-8">
            <DollarSign className="w-12 h-12 text-slate-600" />
          </div>
          <h3 className="text-xl font-black text-white uppercase tracking-widest">
            Fiscal Void Detected
          </h3>
          <p className="text-slate-500 mt-3 mb-8 max-w-xs text-center font-medium">
            System currently lacks deterministic spending limits. Initialize a protocol to monitor throughput.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-2xl font-black text-[10px] tracking-widest uppercase transition-all hover:scale-105 active:scale-95"
          >
            Deploy First Budget
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {budgets.map((budget) => {
            const status = getBudgetStatus(budget);
            const StatusIcon = status.icon;

            return (
              <div
                key={budget._id}
                className="glass-card group p-8 border-white/5 hover:border-white/20 bg-white/2 transition-all duration-500 relative overflow-hidden"
              >
                {/* Status Indicator */}
                <div className={`absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 bg-${status.color}-500/10 rounded-full blur-3xl transition-opacity group-hover:opacity-100 opacity-50`}></div>

                <div className="flex items-start justify-between mb-8 relative z-10">
                  <div>
                    <h3 className="text-lg font-black text-white uppercase tracking-widest italic group-hover:text-indigo-400 transition-colors">
                      {budget.name}
                    </h3>
                    <div className="flex items-center gap-4 mt-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3 h-3 text-indigo-400" />
                        {budget.period} Phase
                      </span>
                      <span className="px-2 py-0.5 bg-white/5 rounded-md border border-white/5">
                        {budget.type} Protocol
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div
                      className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] border flex items-center gap-2 ${
                        status.color === 'emerald' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        status.color === 'yellow' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                        'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      }`}
                    >
                      <StatusIcon className="w-3 h-3" />
                      {status.text}
                    </div>
                    <button
                      onClick={() => openEditModal(budget)}
                      className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/5 text-slate-400 hover:text-white"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(budget._id)}
                      className="p-2.5 bg-rose-500/10 hover:bg-rose-500/20 rounded-xl transition-all border border-rose-500/20 text-rose-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Progress */}
                <div className="space-y-6 relative z-10">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Impacted Liquidity</p>
                      <span className="text-3xl font-black text-white tracking-tighter">
                        {formatCurrency(budget.spent)}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Max Clearance</p>
                      <span className="text-sm font-black text-slate-400 tracking-widest">
                        {formatCurrency(budget.amount)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="w-full bg-white/5 rounded-full h-4 overflow-hidden p-1 shadow-inner border border-white/5">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_20px_var(--glow)] ${
                        status.color === 'emerald' ? 'bg-emerald-500' :
                        status.color === 'yellow' ? 'bg-amber-500' :
                        'bg-rose-500'
                      }`}
                      style={{
                        width: `${Math.min(budget.percentageSpent, 100)}%`,
                        '--glow': status.color === 'emerald' ? 'rgba(16,185,129,0.4)' :
                                 status.color === 'yellow' ? 'rgba(245,158,11,0.4)' :
                                 'rgba(244,63,94,0.4)'
                      }}
                    ></div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em]">
                    <span className="text-slate-400">
                      Throughput: <span className="text-white">{budget.percentageSpent.toFixed(1)}%</span>
                    </span>
                    <span className={budget.remaining >= 0 ? "text-emerald-400" : "text-rose-400"}>
                      Residual: {formatCurrency(budget.remaining)}
                    </span>
                  </div>
                </div>

                {/* Footnotes */}
                <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between text-[9px] font-black text-slate-500 uppercase tracking-widest relative z-10">
                  <span className="flex items-center gap-2">
                    <TrendingUp className="w-3 h-3 text-indigo-400" />
                    Cycle: {new Date(budget.currentPeriodStart).toLocaleDateString()} - {new Date(budget.currentPeriodEnd).toLocaleDateString()}
                  </span>
                  {budget.rollover && (
                    <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 rounded-md border border-indigo-500/20">
                      Rollover Active
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="glass-modal-backdrop z-[110] animate-fadeIn">
          <div className="glass-modal-content max-w-md animate-zoomIn">
            <div className="glass-modal-header shadow-[0_1px_0_rgba(255,255,255,0.05)]">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-500/20 rounded-2xl shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                  <DollarSign className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white uppercase tracking-widest italic">
                    {editingBudget ? "Recalibrate Protocol" : "Initialize Protocol"}
                  </h3>
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-0.5">
                    Fiscal Constraint Specification
                  </p>
                </div>
              </div>
              <button
                onClick={resetForm}
                className="p-2 hover:bg-white/5 rounded-xl transition-all text-slate-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-8">
              {/* Name */}
              <div className="input-group-premium">
                <label className="input-label-premium">Protocol Designation</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="input-premium"
                  placeholder="e.g., Q3_MARKETING_SATURATION"
                  required
                />
              </div>

              {/* Grid 2x2 */}
              <div className="grid grid-cols-2 gap-6">
                <div className="input-group-premium">
                  <label className="input-label-premium">Constraint Tier</label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value })
                    }
                    className="input-premium appearance-none py-4"
                  >
                    <option value="total" className="bg-[#020617]">Gross Matrix</option>
                    <option value="category" className="bg-[#020617]">Segment Basis</option>
                    <option value="person" className="bg-[#020617]">Unit Basis</option>
                    <option value="custom" className="bg-[#020617]">Hybrid Protocol</option>
                  </select>
                </div>

                <div className="input-group-premium">
                  <label className="input-label-premium">Temporal Cycle</label>
                  <select
                    value={formData.period}
                    onChange={(e) =>
                      setFormData({ ...formData, period: e.target.value })
                    }
                    className="input-premium appearance-none py-4"
                  >
                    <option value="daily" className="bg-[#020617]">Diurnal</option>
                    <option value="weekly" className="bg-[#020617]">Septenary</option>
                    <option value="monthly" className="bg-[#020617]">Lunation</option>
                    <option value="yearly" className="bg-[#020617]">Annual</option>
                  </select>
                </div>
              </div>

              {/* Amount */}
              <div className="input-group-premium">
                <label className="input-label-premium">Max Clearance Amount (USD)</label>
                <div className="relative">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-400/50 font-black">$</div>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                    className="input-premium pl-12"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
              </div>

              {/* Rollover */}
              <button
                type="button"
                onClick={() => setFormData({ ...formData, rollover: !formData.rollover })}
                className={`w-full p-6 rounded-[2rem] border transition-all flex items-center justify-between group ${
                  formData.rollover ? "bg-indigo-500/10 border-indigo-500/30" : "bg-white/2 border-white/5 hover:border-white/10"
                }`}
              >
                <div className="flex items-center gap-4 text-left">
                  <div className={`p-3 rounded-xl transition-all ${
                    formData.rollover ? "bg-indigo-500 text-white shadow-[0_0_20px_rgba(79,70,229,0.5)]" : "bg-white/5 text-slate-500"
                  }`}>
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-white uppercase tracking-widest">Rollover Protocol</p>
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mt-1">Carry residual data to next cycle</p>
                  </div>
                </div>
                <div className={`w-12 h-6 rounded-full transition-all relative ${
                  formData.rollover ? 'bg-indigo-500' : 'bg-white/10'
                }`}>
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                    formData.rollover ? 'left-7' : 'left-1'
                  }`} />
                </div>
              </button>

              {/* Actions */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/5 rounded-2xl font-black text-[10px] tracking-widest uppercase transition-all"
                >
                  Terminate
                </button>
                <button
                  type="submit"
                  className="flex-[2] py-4 btn-primary rounded-2xl font-black text-[10px] tracking-[0.3em] uppercase hover:scale-[1.02] active:scale-[0.98] shadow-2xl"
                >
                  {editingBudget ? "Recalibrate" : "Deploy"} Protocol
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetTracker;
