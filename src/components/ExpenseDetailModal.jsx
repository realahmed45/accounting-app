import React, { useEffect, useState } from "react";
import {
  X,
  Download,
  Image as ImageIcon,
  ArrowLeft,
  ChevronDown,
  HelpCircle,
} from "lucide-react";
import { photoService } from "../services/api";

// Status color map
const STATUS_COLORS = {
  Expense: "text-red-500",
  "Deposit Received": "text-green-600",
  "Expense from acc": "text-orange-500",
  "CASH box increased F acc": "text-emerald-700",
  "CASH box increased W cash": "text-green-500",
  "Transfer from acc to acc": "text-orange-400",
};

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const generateExpenseId = (expense, index) => {
  if (!expense) return "—";
  const num = String(index + 1).padStart(3, "0");
  return `Ex-${num}`;
};

/**
 * Web version: modal overlay
 * Mobile version: full-screen page mimicking the design
 */
const ExpenseDetailModal = ({
  expense,
  expenseIndex = 0,
  onClose,
  isMobile = false,
  currentAccountName = "Bakery Accounting",
  totalExpense = 0,
}) => {
  const [photos, setPhotos] = useState([]);
  const [loadingPhotos, setLoadingPhotos] = useState(false);

  useEffect(() => {
    if (expense?._id) {
      setLoadingPhotos(true);
      photoService
        .getByExpense(expense._id)
        .then((res) => {
          if (res.success) setPhotos(res.data || []);
        })
        .catch(() => {})
        .finally(() => setLoadingPhotos(false));
    }
    return () => setPhotos([]);
  }, [expense?._id]);

  if (!expense) return null;

  const status = expense.paymentStatus || "Expense";
  const statusClass = STATUS_COLORS[status] || "text-gray-600";
  const expenseId = generateExpenseId(expense, expenseIndex);

  const photo = photos[0];
  const photoSrc = photo?.imageData || null; // base64 data URL from backend
  const attachmentSize = photo
    ? `${((photo.fileSize || 0) / 1024).toFixed(2)} KB`
    : null;

  const handleDownloadAll = () => {
    const expId = generateExpenseId(expense, expenseIndex);
    const statusColor =
      status === "Deposit Received"
        ? "#16a34a"
        : status === "Expense"
          ? "#ef4444"
          : status === "Expense from acc"
            ? "#f97316"
            : status === "CASH box increased F acc"
              ? "#065f46"
              : status === "CASH box increased W cash"
                ? "#22c55e"
                : status === "Transfer from acc to acc"
                  ? "#fb923c"
                  : "#374151";

    const imageSection = photoSrc
      ? `<div style="margin-top:24px">
          <p style="font-size:11px;color:#9ca3af;letter-spacing:0.05em;text-transform:uppercase;margin-bottom:8px">Attached Proof</p>
          <img src="${photoSrc}" alt="Receipt" style="max-width:100%;max-height:400px;object-fit:contain;border-radius:8px;border:1px solid #e5e7eb" />
          <p style="font-size:12px;color:#6b7280;margin-top:6px">${photo?.fileName || "attachment"} &middot; ${attachmentSize || ""}</p>
        </div>`
      : '<p style="color:#9ca3af;font-size:13px">No photo attached.</p>';

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Expense Receipt ${expId}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; background: #f9fafb; padding: 40px 20px; }
    .card { background: #fff; max-width: 540px; margin: 0 auto; border-radius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.08); overflow: hidden; }
    .header { background: #1d4ed8; padding: 24px 28px; }
    .header h1 { color: #fff; font-size: 20px; font-weight: 700; }
    .header p { color: #bfdbfe; font-size: 13px; margin-top: 4px; }
    .body { padding: 28px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
    .field label { font-size: 11px; color: #9ca3af; letter-spacing: 0.05em; text-transform: uppercase; display: block; margin-bottom: 4px; }
    .field p { font-size: 15px; font-weight: 600; color: #111827; }
    .status { color: ${statusColor} !important; }
    hr { border: none; border-top: 1px solid #f3f4f6; margin: 24px 0; }
    .footer { font-size: 11px; color: #9ca3af; text-align: center; padding: 12px 28px 20px; }
    @media print { body { background: #fff; padding: 0; } .card { box-shadow: none; } }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1>Expense Information</h1>
      <p>Generated on ${new Date().toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })}</p>
    </div>
    <div class="body">
      <div class="grid">
        <div class="field"><label>Expense ID</label><p>${expId}</p></div>
        <div class="field"><label>Reference Number</label><p>${expense.referenceNumber || "—"}</p></div>
      </div>
      <div class="grid">
        <div class="field"><label>Expense Date</label><p>${formatDate(expense.date)}</p></div>
        <div class="field"><label>Amount</label><p>$${Number(expense.amount || 0).toFixed(2)}</p></div>
      </div>
      <div class="grid">
        <div class="field"><label>Payment Mode</label><p>${expense.paymentMode || (expense.paymentSource === "bank" ? "Bank" : "Cash")}</p></div>
        <div class="field"><label>Status</label><p class="status">${status}</p></div>
      </div>
      <div class="field" style="margin-bottom:20px"><label>Description</label><p>${expense.note || expense.category || "—"}</p></div>
      <hr />
      ${imageSection}
    </div>
    <div class="footer">This is an automatically generated expense receipt.</div>
  </div>
</body>
</html>`;

    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `expense-${expId}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ============ Mobile Layout ============
  if (isMobile) {
    return (
      <div className="fixed inset-0 bg-white z-[70] overflow-y-auto">
        {/* Mini home header at top */}
        <div className="bg-white px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold text-gray-800">
              {currentAccountName}
            </span>
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100"
          >
            <HelpCircle className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Faint total expense card (home preview) */}
        <div className="px-4 pt-4 pb-2 opacity-60 pointer-events-none">
          <div className="bg-white rounded-2xl p-3 flex items-center gap-3 shadow-sm">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 font-bold text-xs">T</span>
            </div>
            <div>
              <p className="text-xs text-gray-500">Total Expense</p>
              <p className="text-sm font-bold text-gray-800">
                $
                {Number(totalExpense).toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Expense Detail Card */}
        <div className="bg-white rounded-2xl mx-4 mb-6 shadow-sm overflow-hidden">
          <div className="px-5 py-5">
            <div className="flex items-center gap-2 mb-4">
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-500"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h2 className="text-base font-bold text-gray-900">
                Expense Information
              </h2>
            </div>

            <div className="space-y-3">
              <Field label="Expense ID" value={expenseId} />
              <Field
                label="Reference Number"
                value={expense.referenceNumber || "—"}
              />
              <Field
                label="Amount"
                value={`$${Number(expense.amount || 0).toFixed(2)}`}
              />
              <Field label="Expense Date" value={formatDate(expense.date)} />
              <Field
                label="Payment Mode"
                value={
                  expense.paymentMode ||
                  (expense.paymentSource === "bank" ? "Bank" : "Cash")
                }
              />
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Status</p>
                <p className={`text-sm font-semibold ${statusClass}`}>
                  {status}
                </p>
              </div>
              <Field
                label="Description"
                value={expense.note || expense.category || "—"}
              />

              {/* Photo */}
              <div>
                <p className="text-xs text-gray-400 mb-1">Photo</p>
                {photo ? (
                  <p className="text-sm text-gray-700">
                    {photo.fileName || "receipt.png"}
                  </p>
                ) : (
                  <p className="text-sm text-gray-400">—</p>
                )}
              </div>

              {/* Image preview */}
              {photo && (
                <div className="border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
                  {photoSrc ? (
                    <img
                      src={photoSrc}
                      alt="Attached"
                      className="w-full h-40 object-cover"
                    />
                  ) : (
                    <div className="w-full h-40 flex flex-col items-center justify-center gap-2 text-gray-400">
                      <ImageIcon className="w-8 h-8" />
                      <p className="text-xs">Attached Photo</p>
                    </div>
                  )}
                  <p className="text-center text-xs text-gray-500 py-1.5 border-t border-gray-100">
                    Attached Photo
                  </p>
                </div>
              )}

              {/* Document */}
              {attachmentSize && (
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Document</p>
                  <p className="text-sm text-gray-700">
                    {attachmentSize} Attachment
                  </p>
                </div>
              )}

              {/* Download button - always visible */}
              <button
                onClick={handleDownloadAll}
                className="w-full flex items-center justify-center gap-2 border border-gray-200 rounded-xl py-2.5 text-sm text-blue-600 font-medium hover:bg-blue-50 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download Receipt
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============ Web Modal Layout ============
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-7 pt-7 pb-0">
          <h2 className="text-xl font-bold text-gray-900">
            Expense Information
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-7 py-6 space-y-5">
          {/* Row 1 */}
          <div className="grid grid-cols-2 gap-6">
            <ModalField label="Expense ID" value={expenseId} />
            <ModalField
              label="Reference Number"
              value={expense.referenceNumber || "—"}
            />
          </div>
          {/* Row 2 */}
          <div className="grid grid-cols-2 gap-6">
            <ModalField label="Expense Date" value={formatDate(expense.date)} />
            <ModalField
              label="Amount"
              value={`$${Number(expense.amount || 0).toFixed(2)}`}
            />
          </div>
          {/* Row 3 */}
          <div className="grid grid-cols-2 gap-6">
            <ModalField
              label="Payment Mode"
              value={
                expense.paymentMode ||
                (expense.paymentSource === "bank" ? "Bank" : "Cash")
              }
            />
            <div>
              <p className="text-xs text-gray-400 font-medium mb-1">Status</p>
              <p className={`text-sm font-semibold ${statusClass}`}>{status}</p>
            </div>
          </div>
          {/* Description */}
          <ModalField
            label="Description"
            value={expense.note || expense.category || "—"}
          />

          {/* Photo */}
          <div>
            <p className="text-xs text-gray-400 font-medium mb-2">Photo</p>
            {loadingPhotos ? (
              <div className="w-32 h-24 bg-gray-100 rounded-xl animate-pulse" />
            ) : photoSrc ? (
              <img
                src={photoSrc}
                alt="Receipt"
                className="w-32 h-24 object-cover rounded-xl border border-gray-200"
              />
            ) : (
              <div className="w-32 h-24 bg-gray-100 rounded-xl flex items-center justify-center border border-gray-200">
                <ImageIcon className="w-8 h-8 text-gray-400" />
              </div>
            )}
          </div>

          {/* Attachment */}
          {attachmentSize && (
            <div>
              <p className="text-xs text-gray-400 font-medium mb-1">
                Attachment
              </p>
              <p className="text-sm text-gray-700">{attachmentSize}</p>
            </div>
          )}

          {/* Download button - always visible */}
          <button
            onClick={handleDownloadAll}
            className="flex items-center gap-2 px-5 py-2.5 border-2 border-blue-200 text-blue-600 rounded-xl text-sm font-medium hover:bg-blue-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            Download Receipt
          </button>
        </div>
      </div>
      {/* Click outside to close */}
      <div className="absolute inset-0 -z-10" onClick={onClose} />
    </div>
  );
};

const Field = ({ label, value }) => (
  <div>
    <p className="text-xs text-gray-400 mb-0.5">{label}</p>
    <p className="text-sm text-gray-800 font-medium">{value || "—"}</p>
  </div>
);

const ModalField = ({ label, value }) => (
  <div>
    <p className="text-xs text-gray-400 font-medium mb-1">{label}</p>
    <p className="text-sm text-gray-900 font-medium">{value || "—"}</p>
  </div>
);

export default ExpenseDetailModal;
