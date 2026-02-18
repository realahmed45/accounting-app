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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-xl font-bold text-gray-800">Bill Photos</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Upload Buttons */}
        <div className="p-6 border-b bg-gray-50">
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={() => cameraInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              disabled={uploading}
            >
              <Camera className="w-4 h-4" />
              Take Photo
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
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
              disabled={uploading}
            >
              <Upload className="w-4 h-4" />
              Upload from Gallery
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,application/pdf"
              onChange={(e) => handleFileSelect(e.target.files[0])}
              className="hidden"
            />

            {uploading && (
              <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                <Loader className="w-4 h-4 text-blue-600 animate-spin" />
                <span className="text-sm text-blue-700">Uploading...</span>
              </div>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Supported formats: JPG, PNG, GIF, PDF (max 10MB)
          </p>
        </div>

        {/* Photos Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader className="w-8 h-8 text-gray-400 animate-spin" />
            </div>
          ) : photos.length === 0 ? (
            <div className="text-center py-12">
              <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No photos uploaded yet</p>
              <p className="text-sm text-gray-400 mt-1">
                Use the buttons above to add photos
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {photos.map((photo) => (
                <div
                  key={photo._id}
                  className="relative group rounded-lg overflow-hidden border border-gray-200 hover:shadow-lg transition-all"
                >
                  {photo.mimeType?.startsWith("image/") ? (
                    <img
                      src={photo.fileUrl}
                      alt={photo.fileName}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                      <div className="text-center">
                        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">
                          {photo.fileName}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex gap-2">
                      <a
                        href={photo.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-white text-gray-800 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        View
                      </a>
                      <button
                        onClick={() => handleDeletePhoto(photo._id)}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </div>

                  <div className="p-2 bg-white">
                    <p className="text-xs text-gray-600 truncate">
                      {photo.fileName}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(photo.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PhotoUpload;
