import { useState, useEffect } from "react";
import {
  Tag as TagIcon,
  Plus,
  Edit2,
  Trash2,
  X,
  Loader,
  TrendingUp,
} from "lucide-react";
import api from "../services/api";

const TagManager = ({ accountId }) => {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTag, setEditingTag] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    color: "#3B82F6",
    description: "",
  });

  const colors = [
    "#3B82F6", // Blue
    "#10B981", // Green
    "#F59E0B", // Yellow
    "#EF4444", // Red
    "#8B5CF6", // Purple
    "#EC4899", // Pink
    "#14B8A6", // Teal
    "#F97316", // Orange
  ];

  useEffect(() => {
    if (accountId) {
      fetchTags();
    }
  }, [accountId]);

  const fetchTags = async () => {
    try {
      const res = await api.get(`/accounts/${accountId}/tags`);
      setTags(res.data.data);
    } catch (error) {
      console.error("Failed to load tags:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingTag) {
        // Update tag
        await api.put(
          `/accounts/${accountId}/tags/${editingTag._id}`,
          formData,
        );
      } else {
        // Create tag
        await api.post(`/accounts/${accountId}/tags`, formData);
      }

      await fetchTags();
      resetForm();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to save tag");
    }
  };

  const handleDelete = async (tagId) => {
    if (!confirm("Delete this tag? It will be removed from all expenses.")) {
      return;
    }

    try {
      await api.delete(`/accounts/${accountId}/tags/${tagId}`);
      await fetchTags();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to delete tag");
    }
  };

  const resetForm = () => {
    setFormData({ name: "", color: "#3B82F6", description: "" });
    setEditingTag(null);
    setShowModal(false);
  };

  const openEditModal = (tag) => {
    setEditingTag(tag);
    setFormData({
      name: tag.name,
      color: tag.color,
      description: tag.description || "",
    });
    setShowModal(true);
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
          <TagIcon className="w-6 h-6 text-purple-600 mr-2" />
          <h2 className="text-2xl font-bold text-gray-900">Tags</h2>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Tag
        </button>
      </div>

      {/* Tags Grid */}
      {tags.length === 0 ? (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
          <TagIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No tags yet
          </h3>
          <p className="text-gray-600 mb-4">
            Create tags to organize your expenses better
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all"
          >
            Create First Tag
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {tags.map((tag) => (
            <div
              key={tag._id}
              className="bg-white border-2 rounded-lg p-4 hover:shadow-lg transition-all group"
              style={{ borderColor: tag.color }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center flex-1">
                  <div
                    className="w-3 h-3 rounded-full mr-2 flex-shrink-0"
                    style={{ backgroundColor: tag.color }}
                  ></div>
                  <h3 className="font-semibold text-gray-900 truncate">
                    {tag.name}
                  </h3>
                </div>
                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEditModal(tag)}
                    className="p-1 hover:bg-gray-100 rounded transition-all"
                  >
                    <Edit2 className="w-4 h-4 text-gray-600" />
                  </button>
                  <button
                    onClick={() => handleDelete(tag._id)}
                    className="p-1 hover:bg-red-50 rounded transition-all"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>

              {tag.description && (
                <p className="text-sm text-gray-600 mb-3">{tag.description}</p>
              )}

              <div className="flex items-center text-xs text-gray-500">
                <TrendingUp className="w-3 h-3 mr-1" />
                <span>Used {tag.usageCount} times</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-xl font-bold text-gray-900">
                {editingTag ? "Edit Tag" : "Create New Tag"}
              </h3>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tag Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., Groceries, Travel, Marketing"
                  required
                />
              </div>

              {/* Color */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color
                </label>
                <div className="flex space-x-2">
                  {colors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, color })}
                      className={`w-10 h-10 rounded-full transition-all ${
                        formData.color === color
                          ? "ring-4 ring-gray-300 scale-110"
                          : "hover:scale-105"
                      }`}
                      style={{ backgroundColor: color }}
                    ></button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows="3"
                  placeholder="Optional description..."
                ></textarea>
              </div>

              {/* Preview */}
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-600 mb-2">Preview:</p>
                <div className="flex items-center">
                  <div
                    className="w-4 h-4 rounded-full mr-2"
                    style={{ backgroundColor: formData.color }}
                  ></div>
                  <span className="font-semibold text-gray-900">
                    {formData.name || "Tag name"}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all"
                >
                  {editingTag ? "Update Tag" : "Create Tag"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TagManager;
