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
      <div className="flex flex-col items-center justify-center p-24 space-y-6">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 border-2 border-purple-500/20 rounded-xl animate-spin-slow"></div>
          <div className="absolute inset-0 border-2 border-t-purple-500 border-transparent rounded-xl animate-spin"></div>
        </div>
        <p className="text-[10px] font-black text-purple-400 uppercase tracking-[0.3em] animate-pulse">
          Indexing Neural Labels...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-5">
          <div className="p-4 bg-purple-500/10 rounded-2xl border border-purple-500/20 shadow-[0_0_30px_rgba(139,92,246,0.1)]">
            <TagIcon className="w-6 h-6 text-purple-400 shadow-[0_0_10px_rgba(139,92,246,0.5)]" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white tracking-widest uppercase italic">
              Metadata Architect
            </h2>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mt-1">
              Neural Tag Infrastructure
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary group relative overflow-hidden px-8 py-4 rounded-2xl font-black text-[10px] tracking-widest uppercase flex items-center gap-3 active:scale-95 transition-all shadow-[0_10px_40px_rgba(79,70,229,0.2)]"
        >
          <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-500" />
          Initialize Label
        </button>
      </div>

      {/* Tags Grid */}
      {tags.length === 0 ? (
        <div className="glass-card flex flex-col items-center justify-center py-24 border-white/5 bg-white/2">
          <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/10 mb-8">
            <TagIcon className="w-12 h-12 text-slate-600" />
          </div>
          <h3 className="text-xl font-black text-white uppercase tracking-widest">
            Label Nexus Empty
          </h3>
          <p className="text-slate-500 mt-3 mb-8 max-w-xs text-center font-medium">
            System currently lacks organizational metadata. Initialize labels to architect your workspace.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-2xl font-black text-[10px] tracking-widest uppercase transition-all hover:scale-105 active:scale-95"
          >
            Deploy First Label
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {tags.map((tag) => (
            <div
              key={tag._id}
              className="glass-card group p-6 border-white/5 hover:border-white/20 bg-white/2 transition-all duration-500 hover:translate-y-[-4px]"
              style={{ borderLeft: `4px solid ${tag.color}` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div
                    className="w-2.5 h-2.5 rounded-full shrink-0 shadow-[0_0_10px_var(--tag-glow)]"
                    style={{ backgroundColor: tag.color, '--tag-glow': tag.color } }
                  ></div>
                  <h3 className="text-xs font-black text-white uppercase tracking-widest truncate">
                    {tag.name}
                  </h3>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <button
                    onClick={() => openEditModal(tag)}
                    className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/5"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-slate-400 hover:text-white" />
                  </button>
                  <button
                    onClick={() => handleDelete(tag._id)}
                    className="p-2 bg-rose-500/10 hover:bg-rose-500/20 rounded-xl transition-all border border-rose-500/20"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                  </button>
                </div>
              </div>

              {tag.description && (
                <p className="text-[11px] text-slate-500 font-medium mb-4 line-clamp-2 uppercase tracking-wide">
                  {tag.description}
                </p>
              )}

              <div className="flex items-center text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] pt-4 border-t border-white/5">
                <TrendingUp className="w-3 h-3 mr-2 text-indigo-400" />
                <span>Impact: {tag.usageCount} Packets</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="glass-modal-backdrop z-[110] animate-fadeIn">
          <div className="glass-modal-content max-w-md animate-zoomIn">
            <div className="glass-modal-header shadow-[0_1px_0_rgba(255,255,255,0.05)]">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-500/20 rounded-2xl shadow-[0_0_20px_rgba(139,92,246,0.2)]">
                  <TagIcon className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white uppercase tracking-widest italic">
                    {editingTag ? "Recalibrate Label" : "Initialize Label"}
                  </h3>
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-0.5">
                    Metadata Specification Protocol
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
                <label className="input-label-premium">Designation (Name)</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="input-premium"
                  placeholder="e.g., QUANTUM_MARKETING"
                  required
                />
              </div>

              {/* Color */}
              <div>
                <label className="input-label-premium mb-4 block">Chromatic Identifier</label>
                <div className="grid grid-cols-4 gap-4 p-4 bg-[#020617] rounded-[2rem] border border-white/5 shadow-inner">
                  {colors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, color })}
                      className={`w-full aspect-square rounded-2xl transition-all duration-300 relative group ${
                        formData.color === color
                          ? "scale-110 shadow-[0_0_20px_var(--glow-color)] z-10"
                          : "hover:scale-105 opacity-40 hover:opacity-100"
                      }`}
                      style={{ 
                        backgroundColor: color,
                        '--glow-color': color
                      }}
                    >
                      {formData.color === color && (
                        <div className="absolute inset-0 border-2 border-white/50 rounded-2xl animate-pulse"></div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="input-group-premium">
                <label className="input-label-premium">Context (Description)</label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="input-premium h-24 py-4 resize-none"
                  placeholder="Specify neural context..."
                ></textarea>
              </div>

              {/* Preview */}
              <div className="p-6 rounded-[2rem] bg-indigo-500/5 border border-indigo-500/10">
                <p className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-4">Live Projection:</p>
                <div className="flex items-center gap-4">
                  <div
                    className="w-4 h-4 rounded-full shadow-[0_0_15px_var(--preview-glow)]"
                    style={{ backgroundColor: formData.color, '--preview-glow': formData.color }}
                  ></div>
                  <span className="text-xs font-black text-white uppercase tracking-[0.2em] italic">
                    {formData.name || "AWAITING_DESIGNATION"}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/5 rounded-2xl font-black text-[10px] tracking-widest uppercase transition-all"
                >
                  Abort
                </button>
                <button
                  type="submit"
                  className="flex-[2] py-4 btn-primary rounded-2xl font-black text-[10px] tracking-[0.3em] uppercase hover:scale-[1.02] active:scale-[0.98] shadow-2xl"
                >
                  {editingTag ? "Recalibrate" : "Deploy Label"}
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
