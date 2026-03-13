import React, { useState, useRef, useEffect } from "react";
import { photoService } from "../services/api";
import {
  Camera,
  Upload,
  X,
  Image as ImageIcon,
  Loader,
  Trash2,
  FileText,
} from "lucide-react";

const PhotoUpload = ({ expenseId, onClose }) => {
  const [uploading, setUploading] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  useEffect(() => {
    loadPhotos();
  }, [expenseId]);

  const loadPhotos = async () => {
    setLoading(true);
    try {
      const response = await photoService.getByExpense(expenseId);
      if (response.success) {
        setPhotos(response.data);
      }
    } catch (error) {
      console.error("Failed to load photos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (file) => {
    if (!file) return;

    setUploading(true);
    try {
      const response = await photoService.upload(expenseId, file);
      if (response.success) {
        setPhotos([...photos, response.data]);
      }
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Failed to upload photo. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePhoto = async (photoId) => {
    if (!window.confirm("Are you sure you want to delete this photo?")) {
      return;
    }

    try {
      const response = await photoService.delete(photoId);
      if (response.success) {
        setPhotos(photos.filter((p) => p._id !== photoId));
      }
    } catch (error) {
      console.error("Failed to delete photo:", error);
      alert("Failed to delete photo. Please try again.");
    }
  };

  return (
    <div className="glass-modal-backdrop z-[100] animate-fadeIn">
      <div className="glass-modal-content max-w-4xl animate-zoomIn flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="glass-modal-header">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-500/20 rounded-2xl">
              <ImageIcon className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-widest uppercase">
                Visual Evidence
              </h2>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mt-0.5">
                Multi-Spectral Capture Hub
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-xl transition-colors text-slate-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Upload Interface */}
        <div className="p-6 border-b border-white/5 bg-white/2">
          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={() => cameraInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-3 px-6 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl transition-all font-black text-[10px] tracking-widest uppercase shadow-[0_10px_30px_rgba(79,70,229,0.3)] disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Camera className="w-4 h-4" />
              Capture Insight
            </button>
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(e) => handleFileSelect(e.target.files[0])}
              className="hidden"
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-3 px-6 py-4 bg-white/5 hover:bg-white/10 text-slate-300 rounded-2xl border border-white/5 transition-all font-black text-[10px] tracking-widest uppercase disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Upload className="w-4 h-4" />
              Import Data
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,application/pdf"
              onChange={(e) => handleFileSelect(e.target.files[0])}
              className="hidden"
            />

            {uploading && (
              <div className="flex items-center gap-3 px-6 py-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl animate-pulse">
                <Loader className="w-4 h-4 text-indigo-400 animate-spin" />
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Processing Packet...</span>
              </div>
            )}
          </div>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-4 ml-1">
            Permitted Artifacts: <span className="text-slate-400">JPG, PNG, GIF, PDF</span> (Limit: 10MB)
          </p>
        </div>

        {/* Evidence Grid */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 space-y-6">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 border-2 border-indigo-500/20 rounded-2xl animate-spin-slow"></div>
                <div className="absolute inset-0 border-2 border-t-indigo-500 border-transparent rounded-2xl animate-spin"></div>
              </div>
              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] animate-pulse">
                Retrieving Visual Data...
              </p>
            </div>
          ) : photos.length === 0 ? (
            <div className="text-center py-24 space-y-6">
              <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/10 w-24 h-24 mx-auto flex items-center justify-center">
                <ImageIcon className="w-10 h-10 text-slate-600" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white uppercase tracking-widest">
                  Null Evidence
                </h3>
                <p className="text-sm text-slate-500 mt-2 max-w-xs mx-auto font-medium">
                  Workspace currently lacks visual verification artifacts for this entry.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {photos.map((photo) => (
                <div
                  key={photo._id}
                  className="glass-card group relative aspect-[4/3] overflow-hidden border-white/5 hover:border-indigo-500/30 transition-all duration-500"
                >
                  {photo.mimeType?.startsWith("image/") ? (
                    <img
                      src={photo.imageData}
                      alt={photo.fileName}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full bg-white/5 flex flex-col items-center justify-center space-y-4">
                      <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                        <FileText className="w-8 h-8 text-indigo-400" />
                      </div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center px-4">
                        {photo.fileName}
                      </p>
                    </div>
                  )}

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-[#020617]/80 backdrop-blur-sm flex flex-col items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-all duration-500">
                    <a
                      href={photo.imageData}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-32 py-3 bg-white text-[#020617] rounded-xl font-black text-[10px] tracking-widest uppercase text-center hover:scale-105 active:scale-95 transition-transform"
                    >
                      Analyze
                    </a>
                    <button
                      onClick={() => handleDeletePhoto(photo._id)}
                      className="w-32 py-3 bg-rose-500/20 hover:bg-rose-500 text-rose-500 hover:text-white border border-rose-500/30 rounded-xl font-black text-[10px] tracking-widest uppercase flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Purge
                    </button>
                  </div>

                  {/* Info Bar */}
                  <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/80 to-transparent flex items-end justify-between transition-opacity group-hover:opacity-0">
                    <div className="min-w-0">
                      <p className="text-[10px] font-black text-white uppercase tracking-widest truncate">
                        {photo.fileName}
                      </p>
                      <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">
                        {new Date(photo.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/5 bg-white/2">
          <button
            onClick={onClose}
            className="w-full btn-secondary py-4 font-black text-xs tracking-[0.3em] uppercase"
          >
            Exit Workspace
          </button>
        </div>
      </div>
    </div>
  );
};

export default PhotoUpload;
