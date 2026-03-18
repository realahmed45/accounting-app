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
      <div className="flex items-center justify-center p-8">
        <Loader className="w-6 h-6 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <DollarSign className="w-6 h-6 text-green-600 mr-2" />
          <h2 className="text-2xl font-bold text-gray-900">Budgets</h2>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Budget
        </button>
      </div>

      {/* Budgets List */}
      {budgets.length === 0 ? (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
          <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No budgets set
          </h3>
          <p className="text-gray-600 mb-4">
            Create budgets to track and control your spending
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
          >
            Create First Budget
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {budgets.map((budget) => {
            const status = getBudgetStatus(budget);
            const StatusIcon = status.icon;

            return (
              <div
                key={budget._id}
                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {budget.name}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {budget.period}
                      </span>
                      <span className="capitalize">{budget.type} budget</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div
                      className={`px-3 py-1 rounded-full text-xs font-semibold bg-${status.color}-100 text-${status.color}-800 flex items-center`}
                    >
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {status.text}
                    </div>
                    <button
                      onClick={() => openEditModal(budget)}
                      className="p-2 hover:bg-gray-100 rounded transition-all"
                    >
                      <Edit2 className="w-4 h-4 text-gray-600" />
                    </button>
                    <button
                      onClick={() => handleDelete(budget._id)}
                      className="p-2 hover:bg-red-50 rounded transition-all"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>

                {/* Progress */}
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl font-bold text-gray-900">
                      {formatCurrency(budget.spent)}
                    </span>
                    <span className="text-gray-600">
                      of {formatCurrency(budget.amount)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all bg-${
                        status.color
                      }-500`}
                      style={{
                        width: `${Math.min(budget.percentageSpent, 100)}%`,
                      }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between mt-2 text-sm">
                    <span className="text-gray-600">
                      {budget.percentageSpent.toFixed(1)}% used
                    </span>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(budget.remaining)} remaining
                    </span>
                  </div>
                </div>

                {/* Period Info */}
                <div className="text-xs text-gray-500 border-t pt-3">
                  Period:{" "}
                  {new Date(budget.currentPeriodStart).toLocaleDateString()} -{" "}
                  {new Date(budget.currentPeriodEnd).toLocaleDateString()}
                  {budget.rollover && " • Rollover enabled"}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-xl font-bold text-gray-900">
                {editingBudget ? "Edit Budget" : "Create New Budget"}
              </h3>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Budget Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., Monthly Expenses"
                  required
                />
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="total">Total Spending</option>
                  <option value="category">By Category</option>
                  <option value="person">By Person</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount *
                </label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  required
                />
              </div>

              {/* Period */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Period
                </label>
                <select
                  value={formData.period}
                  onChange={(e) =>
                    setFormData({ ...formData, period: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>

              {/* Rollover */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="rollover"
                  checked={formData.rollover}
                  onChange={(e) =>
                    setFormData({ ...formData, rollover: e.target.checked })
                  }
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <label
                  htmlFor="rollover"
                  className="ml-2 text-sm text-gray-700"
                >
                  Rollover unused budget to next period
                </label>
              </div>

              {/* Actions */}
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  {editingBudget ? "Update" : "Create"} Budget
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
