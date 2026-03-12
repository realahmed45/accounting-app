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
          <RefreshCw className="w-6 h-6 text-blue-600 mr-2" />
          <h2 className="text-2xl font-bold text-gray-900">
            Recurring Expenses
          </h2>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Recurring Expense
        </button>
      </div>

      {/* List */}
      {recurringExpenses.length === 0 ? (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
          <RefreshCw className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No recurring expenses
          </h3>
          <p className="text-gray-600 mb-4">
            Set up recurring expenses to automate your regular payments
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
          >
            Create First Recurring Expense
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {recurringExpenses.map((expense) => (
            <div
              key={expense._id}
              className={`bg-white border rounded-lg p-6 hover:shadow-lg transition-all ${
                expense.isActive
                  ? "border-blue-200"
                  : "border-gray-200 opacity-60"
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {expense.templateName}
                    </h3>
                    {!expense.isActive && (
                      <span className="ml-3 px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded-full">
                        Paused
                      </span>
                    )}
                  </div>
                  {expense.description && (
                    <p className="text-sm text-gray-600 mb-2">
                      {expense.description}
                    </p>
                  )}
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(expense.amount)}
                      {expense.isVariable && " (variable)"}
                    </span>
                    <span className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {getFrequencyLabel(expense.frequency, expense.interval)}
                    </span>
                    <span>Created {expense.totalCreated || 0} times</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleToggle(expense._id)}
                    className={`p-2 rounded transition-all ${
                      expense.isActive
                        ? "hover:bg-yellow-50 text-yellow-600"
                        : "hover:bg-green-50 text-green-600"
                    }`}
                    title={expense.isActive ? "Pause" : "Resume"}
                  >
                    {expense.isActive ? (
                      <Pause className="w-5 h-5" />
                    ) : (
                      <Play className="w-5 h-5" />
                    )}
                  </button>
                  <button
                    onClick={() => openEditModal(expense)}
                    className="p-2 hover:bg-gray-100 rounded transition-all"
                  >
                    <Edit2 className="w-5 h-5 text-gray-600" />
                  </button>
                  <button
                    onClick={() => handleDelete(expense._id)}
                    className="p-2 hover:bg-red-50 rounded transition-all"
                  >
                    <Trash2 className="w-5 h-5 text-red-600" />
                  </button>
                </div>
              </div>

              {/* Next Scheduled */}
              {expense.isActive && expense.nextScheduled && (
                <div className="bg-blue-50 rounded-lg p-3 text-sm">
                  <span className="text-gray-700">Next scheduled: </span>
                  <span className="font-semibold text-gray-900">
                    {new Date(expense.nextScheduled).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
              <h3 className="text-xl font-bold text-gray-900">
                {editingExpense ? "Edit" : "Create"} Recurring Expense
              </h3>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Template Name *
                </label>
                <input
                  type="text"
                  value={formData.templateName}
                  onChange={(e) =>
                    setFormData({ ...formData, templateName: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Monthly Rent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows="2"
                  placeholder="Optional description"
                ></textarea>
              </div>

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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  required
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isVariable"
                  checked={formData.isVariable}
                  onChange={(e) =>
                    setFormData({ ...formData, isVariable: e.target.checked })
                  }
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label
                  htmlFor="isVariable"
                  className="ml-2 text-sm text-gray-700"
                >
                  Amount may vary
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Frequency *
                  </label>
                  <select
                    value={formData.frequency}
                    onChange={(e) =>
                      setFormData({ ...formData, frequency: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Repeat Every
                  </label>
                  <input
                    type="number"
                    value={formData.interval}
                    onChange={(e) =>
                      setFormData({ ...formData, interval: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    min="1"
                  />
                </div>
              </div>

              {formData.frequency === "monthly" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Day of Month
                  </label>
                  <input
                    type="number"
                    value={formData.dayOfMonth}
                    onChange={(e) =>
                      setFormData({ ...formData, dayOfMonth: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    min="1"
                    max="31"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date *
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

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
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingExpense ? "Update" : "Create"}
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
