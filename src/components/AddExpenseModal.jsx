import React, { useState, useRef, useCallback } from "react";
import {
  X,
  Upload,
  ChevronDown,
  ArrowLeft,
  MoreHorizontal,
} from "lucide-react";

const PAYMENT_STATUSES = [
  { value: "Expense", color: "text-red-500", bg: "bg-red-50" },
  { value: "Deposit Received", color: "text-green-600", bg: "bg-green-50" },
  { value: "Expense from acc", color: "text-orange-500", bg: "bg-orange-50" },
  {
    value: "CASH box increased F acc",
    color: "text-emerald-700",
    bg: "bg-emerald-50",
  },
  {
    value: "CASH box increased W cash",
    color: "text-green-500",
    bg: "bg-green-50",
  },
  {
    value: "Transfer from acc to acc",
    color: "text-orange-400",
    bg: "bg-orange-50",
  },
];

const DropZone = ({ label, accept, hint, onFileSelect, file, isMobile }) => {
  const inputRef = useRef();
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setIsDragging(false);
      const f = e.dataTransfer.files[0];
      if (f) onFileSelect(f);
    },
    [onFileSelect],
  );

  const isPhoto = accept?.includes("image");

  return (
    <div
      className={`${isMobile ? "w-full" : ""}`}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      {isMobile && (
        <p className="text-sm font-semibold text-gray-800 mb-2">{label}</p>
      )}
      <div
        className={`border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-colors cursor-pointer
          ${isDragging ? "border-blue-400 bg-blue-50" : "border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-blue-50/30"}
          ${isMobile ? "py-8 px-4" : "py-8 px-4"}
        `}
        onClick={() => inputRef.current?.click()}
      >
        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mb-3">
          <Upload className="w-5 h-5 text-gray-500" />
        </div>
        {file ? (
          <p className="text-sm font-medium text-green-600 text-center">
            {file.name}
          </p>
        ) : (
          <>
            <p className="text-sm font-bold text-gray-800 mb-1">
              {isPhoto ? "Drop photo Here" : "Drop File Here"}
            </p>
            <p className="text-xs text-gray-500 text-center mb-2">{hint}</p>
            <span className="text-xs text-blue-600 font-medium hover:underline">
              Browse File
            </span>
          </>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFileSelect(f);
          e.target.value = "";
        }}
      />
    </div>
  );
};

const PaymentStatusDropdown = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const selected =
    PAYMENT_STATUSES.find((s) => s.value === value) || PAYMENT_STATUSES[0];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2.5 border border-gray-200 rounded-xl bg-white text-sm text-gray-600 hover:border-gray-300 transition-colors"
      >
        <span className={selected.color}>{value || "Select status"}</span>
        <ChevronDown className="w-4 h-4 text-gray-400" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute top-full mt-1 right-0 bg-white border border-gray-200 rounded-xl shadow-xl z-20 overflow-hidden min-w-full">
            <div className="px-4 py-2 border-b border-gray-100">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Payment Status
              </p>
            </div>
            {PAYMENT_STATUSES.map((s) => (
              <React.Fragment key={s.value}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(s.value);
                    setOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-sm font-medium hover:bg-gray-50 transition-colors ${s.color}`}
                >
                  {s.value}
                </button>
                <div className="border-t border-gray-50" />
              </React.Fragment>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

/**
 * Add Expense Modal
 * - Web: renders as a modal overlay
 * - Mobile: renders as a full page
 */
const AddExpenseModal = ({
  onSubmit,
  onClose,
  loading = false,
  expenseCount = 0,
  isMobile = false,
  currentAccount,
  currentAccountName,
  bankAccounts = [],
}) => {
  const today = new Date();
  const dateStr = `${String(today.getDate()).padStart(2, "0")}.${String(today.getMonth() + 1).padStart(2, "0")}.${today.getFullYear()}`;

  const [form, setForm] = useState({
    referenceNumber: "",
    amount: "",
    date: `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`,
    paymentSourceId: "cashbox",
    paymentStatus: "Expense",
    description: "",
  });
  const [attachmentFile, setAttachmentFile] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [paymentSourceOpen, setPaymentSourceOpen] = useState(false);
  const [error, setError] = useState("");

  const expenseId = `EX-${String(expenseCount + 1).padStart(3, "0")}`;

  const set = (key) => (val) =>
    setForm((prev) => ({
      ...prev,
      [key]: typeof val === "string" ? val : (val.target?.value ?? val),
    }));

  const handleSubmit = (e) => {
    e?.preventDefault();
    setError("");
    if (!form.amount || isNaN(parseFloat(form.amount))) {
      setError("Please enter a valid amount");
      return;
    }
    if (!form.date) {
      setError("Please enter a date");
      return;
    }
    onSubmit?.({
      amount: parseFloat(form.amount),
      date: form.date,
      note: form.description,
      category: form.paymentStatus,
      paymentMode:
        form.paymentSourceId === "cashbox"
          ? "Cash"
          : bankAccounts.find((b) => b._id === form.paymentSourceId)?.name ||
            "Bank",
      paymentStatus: form.paymentStatus,
      referenceNumber: form.referenceNumber,
      paymentSource: form.paymentSourceId === "cashbox" ? "cash" : "bank",
      bankAccountId:
        form.paymentSourceId === "cashbox" ? null : form.paymentSourceId,
      attachmentFile,
      photoFile,
    });
  };

  // Shared form body used in both web and mobile
  const formBody = (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Row 1: Expense ID + Reference Number */}
      <div
        className={`grid ${isMobile ? "grid-cols-1 gap-4" : "grid-cols-2 gap-4"}`}
      >
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">
            Expense ID {!isMobile && <span className="text-red-500">*</span>}
          </label>
          <input
            type="text"
            value={isMobile ? `Expense id #${expenseId}` : expenseId}
            readOnly
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-sm text-gray-500 cursor-not-allowed"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">
            Reference Number
          </label>
          <input
            type="text"
            value={form.referenceNumber}
            onChange={set("referenceNumber")}
            placeholder="55656"
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Row 2: Amount + Date */}
      <div
        className={`grid ${isMobile ? "grid-cols-1 gap-4" : "grid-cols-2 gap-4"}`}
      >
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">
            Amount
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={form.amount}
            onChange={set("amount")}
            placeholder="$100"
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">
            {isMobile ? "Date" : "Expense Date"}
          </label>
          <input
            type="date"
            value={form.date}
            onChange={set("date")}
            placeholder={isMobile ? "mm/dd/yyy" : dateStr}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
      </div>

      {/* Row 3: Payment Source + Payment Status */}
      <div
        className={`grid ${isMobile ? "grid-cols-1 gap-4" : "grid-cols-2 gap-4"}`}
      >
        {/* Payment Source: Cashbox or Bank */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">
            Payment Source{" "}
            {!isMobile && <span className="text-red-500">*</span>}
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setPaymentSourceOpen(!paymentSourceOpen)}
              className="w-full flex items-center justify-between gap-2 px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white hover:border-gray-300 transition-colors"
            >
              <div className="flex items-center gap-2 min-w-0">
                {form.paymentSourceId === "cashbox" ? (
                  <>
                    <span className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 font-bold text-xs flex-shrink-0">
                      $
                    </span>
                    <span className="text-gray-700 font-medium">Cashbox</span>
                  </>
                ) : (
                  (() => {
                    const b = bankAccounts.find(
                      (x) => x._id === form.paymentSourceId,
                    );
                    return b ? (
                      <>
                        <span className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs flex-shrink-0">
                          B
                        </span>
                        <span className="text-gray-700 font-medium truncate">
                          {b.bankName || b.name}
                          {b.lastFourDigits ? ` ****${b.lastFourDigits}` : ""}
                        </span>
                      </>
                    ) : (
                      <span className="text-gray-400">Select source...</span>
                    );
                  })()
                )}
              </div>
              <ChevronDown
                className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${
                  paymentSourceOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {paymentSourceOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setPaymentSourceOpen(false)}
                />
                <div className="absolute top-full mt-1 left-0 bg-white border border-gray-200 rounded-xl shadow-xl z-20 min-w-full overflow-hidden max-h-64 overflow-y-auto">
                  {/* Cashbox */}
                  <button
                    type="button"
                    onClick={() => {
                      set("paymentSourceId")("cashbox");
                      setPaymentSourceOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-gray-50 transition-colors text-left ${
                      form.paymentSourceId === "cashbox" ? "bg-amber-50" : ""
                    }`}
                  >
                    <span className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 font-bold flex-shrink-0">
                      $
                    </span>
                    <div>
                      <p className="font-semibold text-gray-800">Cashbox</p>
                      <p className="text-xs text-gray-400">
                        Physical cash on hand
                      </p>
                    </div>
                    {form.paymentSourceId === "cashbox" && (
                      <span className="ml-auto text-amber-500 font-bold">
                        ✓
                      </span>
                    )}
                  </button>

                  {/* Banks */}
                  {bankAccounts.length > 0 && (
                    <>
                      <div className="border-t border-gray-100" />
                      <div className="px-4 py-1.5 bg-gray-50">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                          Bank Accounts
                        </p>
                      </div>
                    </>
                  )}
                  {bankAccounts.map((bank) => (
                    <button
                      key={bank._id}
                      type="button"
                      onClick={() => {
                        set("paymentSourceId")(bank._id);
                        setPaymentSourceOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-gray-50 transition-colors text-left ${
                        form.paymentSourceId === bank._id ? "bg-blue-50" : ""
                      }`}
                    >
                      <span className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold flex-shrink-0">
                        B
                      </span>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-800 truncate">
                          {bank.bankName || bank.name}
                        </p>
                        <p className="text-xs text-gray-400 truncate">
                          {bank.bankName ? bank.name : "Bank account"}
                          {bank.lastFourDigits
                            ? ` · ****${bank.lastFourDigits}`
                            : ""}
                        </p>
                      </div>
                      {form.paymentSourceId === bank._id && (
                        <span className="ml-auto text-blue-500 font-bold">
                          ✓
                        </span>
                      )}
                    </button>
                  ))}

                  {bankAccounts.length === 0 && (
                    <div className="px-4 py-3 text-xs text-gray-400 text-center border-t border-gray-100">
                      No bank accounts added yet. Add them in Settings.
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">
            Payment Status{" "}
            {!isMobile && <span className="text-red-500">*</span>}
          </label>
          <PaymentStatusDropdown
            value={form.paymentStatus}
            onChange={set("paymentStatus")}
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1.5">
          Description
        </label>
        <textarea
          value={form.description}
          onChange={set("description")}
          placeholder="Enter a description..."
          rows={3}
          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* File uploads */}
      {isMobile ? (
        // Mobile: each in its own section card
        <>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <DropZone
              label="Attach Documents"
              accept=".pdf,.doc,.docx"
              hint="Drag and drop your Pdf, docx here or browse"
              onFileSelect={setAttachmentFile}
              file={attachmentFile}
              isMobile
            />
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <DropZone
              label="Attach Photo"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              hint="Drag and drop your PNG, JPG, WebP, SVG images here or browse"
              onFileSelect={setPhotoFile}
              file={photoFile}
              isMobile
            />
          </div>
        </>
      ) : (
        // Web: side-by-side
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-medium text-gray-600 mb-1.5">
              Attachment Document
            </p>
            <DropZone
              accept=".pdf,.doc,.docx"
              hint="Drag and drop your PDF"
              onFileSelect={setAttachmentFile}
              file={attachmentFile}
            />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-600 mb-1.5">Photo</p>
            <DropZone
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              hint="Drag and drop your PNG, JPG, WebP, SVG images here or browse"
              onFileSelect={setPhotoFile}
              file={photoFile}
            />
          </div>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
          {error}
        </p>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
      >
        {loading ? "Adding..." : "Add Expense"}
      </button>
    </form>
  );

  // ============ Mobile: Full page ============
  if (isMobile) {
    return (
      <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
        {/* Mobile Header */}
        <div className="bg-white px-4 py-4 flex items-center justify-between border-b border-gray-100 sticky top-0 z-10">
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div className="flex items-center gap-1">
            <span className="text-sm font-bold text-gray-800">
              {currentAccountName || "Bakery Accounting"}
            </span>
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </div>
          <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <MoreHorizontal className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Form */}
        <div className="px-4 py-5">
          <h2 className="text-lg font-bold text-gray-900 mb-5">
            Add New expense
          </h2>
          {formBody}
        </div>
      </div>
    );
  }

  // ============ Web: Modal Overlay ============
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4 overflow-y-auto">
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Add New Expense</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-7 py-6">{formBody}</div>
      </div>
      <div className="absolute inset-0 -z-10" onClick={onClose} />
    </div>
  );
};

export default AddExpenseModal;
