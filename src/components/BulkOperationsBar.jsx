import React, { useState } from "react";
import {
  CheckSquare,
  Square,
  Trash2,
  Download,
  Tag,
  X,
  AlertTriangle,
} from "lucide-react";

const BulkOperationsBar = ({
  expenses = [],
  selectedExpenses = [],
  onSelectExpense,
  onSelectAll,
  onDeleteBulk,
  onExportBulk,
  onUpdateCategoryBulk,
  categories = [],
}) => {
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [newCategory, setNewCategory] = useState("");

  const allSelected =
    expenses.length > 0 && selectedExpenses.length === expenses.length;
  const someSelected = selectedExpenses.length > 0;

  const handleDeleteBulk = () => {
    if (
      window.confirm(
        `Are you sure you want to delete ${selectedExpenses.length} expense(s)?`,
      )
    ) {
      onDeleteBulk?.(selectedExpenses);
    }
  };

  const handleExportBulk = () => {
    const selectedData = expenses.filter((e) =>
      selectedExpenses.includes(e._id),
    );
    const headers = [
      "Date",
      "Description",
      "Amount",
      "Category",
      "Person",
      "Source",
    ];
    const rows = selectedData.map((e) => [
      new Date(e.date).toLocaleDateString(),
      e.note || "",
      e.amount,
      e.category || "Uncategorized",
      e.personName || "Unknown",
      e.source || "Unknown",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `bulk-expenses-${selectedExpenses.length}-items-${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCategoryChange = () => {
    if (!newCategory) {
      alert("Please select a category");
      return;
    }
    onUpdateCategoryBulk?.(selectedExpenses, newCategory);
    setShowCategoryPicker(false);
    setNewCategory("");
  };

  if (expenses.length === 0) return null;

  return (
    <>
      {/* Selection Checkbox Column (to be placed in expense list) */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-4 mb-4 shadow-xl border-2 border-blue-500">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            {/* Select All Checkbox */}
            <button
              onClick={() => onSelectAll?.(!allSelected)}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-bold rounded-xl transition-all"
            >
              {allSelected ? (
                <>
                  <CheckSquare className="w-5 h-5" />
                  Deselect All
                </>
              ) : (
                <>
                  <Square className="w-5 h-5" />
                  Select All
                </>
              )}
            </button>

            {/* Selection Count */}
            {someSelected && (
              <div className="text-white font-bold flex items-center gap-2">
                <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                  {selectedExpenses.length} selected
                </div>
              </div>
            )}
          </div>

          {/* Bulk Actions */}
          {someSelected && (
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleExportBulk}
                className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-bold rounded-xl transition-all shadow-lg"
              >
                <Download className="w-4 h-4" />
                Export ({selectedExpenses.length})
              </button>

              <button
                onClick={() => setShowCategoryPicker(!showCategoryPicker)}
                className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-bold rounded-xl transition-all shadow-lg"
              >
                <Tag className="w-4 h-4" />
                Change Category
              </button>

              <button
                onClick={handleDeleteBulk}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all shadow-lg"
              >
                <Trash2 className="w-4 h-4" />
                Delete ({selectedExpenses.length})
              </button>

              <button
                onClick={() => onSelectAll?.(false)}
                className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-xl transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Category Picker Dropdown */}
        {showCategoryPicker && (
          <div className="mt-4 bg-white/10 backdrop-blur-sm p-4 rounded-xl">
            <div className="flex items-center gap-3 flex-wrap">
              <label className="text-white font-bold text-sm">
                New Category:
              </label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="bg-white/20 backdrop-blur-sm border-2 border-white/30 text-white px-4 py-2 rounded-xl font-semibold focus:outline-none focus:border-white/50"
              >
                <option value="">Select...</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <button
                onClick={handleCategoryChange}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-lg"
              >
                Apply to {selectedExpenses.length} item
                {selectedExpenses.length !== 1 ? "s" : ""}
              </button>
              <button
                onClick={() => setShowCategoryPicker(false)}
                className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Warning Banner */}
      {someSelected && (
        <div className="bg-amber-500/10 border-2 border-amber-500 rounded-xl p-4 mb-4 flex items-center gap-3">
          <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0" />
          <p className="text-amber-700 dark:text-amber-300 font-semibold text-sm">
            <strong>Bulk mode active:</strong> You have{" "}
            {selectedExpenses.length} expense(s) selected. Use the actions above
            to manage them.
          </p>
        </div>
      )}
    </>
  );
};

// Individual Expense Checkbox Component
export const ExpenseCheckbox = ({ expenseId, isSelected, onToggle }) => {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onToggle?.(expenseId);
      }}
      className="p-2 hover:bg-slate-100 rounded-lg transition-all"
    >
      {isSelected ? (
        <CheckSquare className="w-5 h-5 text-blue-600" />
      ) : (
        <Square className="w-5 h-5 text-slate-400 hover:text-slate-600" />
      )}
    </button>
  );
};

export default BulkOperationsBar;
