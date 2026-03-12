import { useState } from "react";
import { Download, FileText, Table, Database, Loader } from "lucide-react";
import api from "../services/api";

const DataExportPanel = ({ accountId }) => {
  const [exporting, setExporting] = useState(null);
  const [filters, setFilters] = useState({
    dateFrom: "",
    dateTo: "",
  });

  const handleExport = async (type, format) => {
    try {
      setExporting(`${type}-${format}`);

      const params = new URLSearchParams();
      if (filters.dateFrom) params.append("dateFrom", filters.dateFrom);
      if (filters.dateTo) params.append("dateTo", filters.dateTo);

      const response = await api.get(
        `/accounts/${accountId}/export/${type}/${format}?${params.toString()}`,
        { responseType: "blob" },
      );

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `${type}_${format}_${Date.now()}.${format === "json" ? "json" : "csv"}`,
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert(error.response?.data?.message || "Export failed");
    } finally {
      setExporting(null);
    }
  };

  const exportOptions = [
    {
      id: "expenses",
      title: "Expenses",
      description: "Export all expense records",
      icon: FileText,
      formats: ["csv", "json"],
    },
    {
      id: "schedule",
      title: "Schedule",
      description: "Export shift schedule data",
      icon: Table,
      formats: ["csv"],
    },
    {
      id: "summary",
      title: "Full Summary",
      description: "Complete account data export",
      icon: Database,
      formats: ["json"],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center">
        <Download className="w-6 h-6 text-indigo-600 mr-2" />
        <h2 className="text-2xl font-bold text-gray-900">Data Export</h2>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Export Filters</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              From Date
            </label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) =>
                setFilters({ ...filters, dateFrom: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              To Date
            </label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) =>
                setFilters({ ...filters, dateTo: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div className="grid md:grid-cols-3 gap-6">
        {exportOptions.map((option) => {
          const Icon = option.icon;

          return (
            <div
              key={option.id}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all"
            >
              <div className="flex items-center mb-4">
                <div className="p-3 bg-indigo-100 rounded-lg">
                  <Icon className="w-6 h-6 text-indigo-600" />
                </div>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {option.title}
              </h3>
              <p className="text-sm text-gray-600 mb-4">{option.description}</p>

              <div className="space-y-2">
                {option.formats.map((format) => (
                  <button
                    key={format}
                    onClick={() => handleExport(option.id, format)}
                    disabled={exporting !== null}
                    className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center uppercase text-sm font-semibold"
                  >
                    {exporting === `${option.id}-${format}` ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin mr-2" />
                        Exporting...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 mr-2" />
                        Export {format}
                      </>
                    )}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">About Exports</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• CSV format is ideal for Excel and spreadsheet applications</li>
          <li>• JSON format contains complete data with relationships</li>
          <li>• Exports are limited to 10,000 records per file</li>
          <li>• All dates and times are exported in your local timezone</li>
        </ul>
      </div>
    </div>
  );
};

export default DataExportPanel;
