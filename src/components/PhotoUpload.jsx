import React, { useState, useRef } from "react";
import { photoService } from "../services/api";
import { Camera, Upload, X, Image as ImageIcon, Loader } from "lucide-react";

const PhotoUpload = ({ expenseId, onUploadComplete }) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const handleFileSelect = async (file) => {
    if (!file) return;

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload to server
    setUploading(true);
    try {
      const response = await photoService.upload(expenseId, file);
      if (response.success) {
        if (onUploadComplete) {
          onUploadComplete(response.data);
        }
        setTimeout(() => {
          setPreview(null);
        }, 2000);
      }
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Failed to upload photo. Please try again.");
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex gap-2">
      {/* Camera Button */}
      <button
        onClick={() => cameraInputRef.current?.click()}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        disabled={uploading}
        title="Take photo with camera"
      >
        <Camera className="w-4 h-4" />
        Camera
      </button>
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={(e) => handleFileSelect(e.target.files[0])}
        className="hidden"
      />

      {/* Gallery Button */}
      <button
        onClick={() => fileInputRef.current?.click()}
        className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
        disabled={uploading}
        title="Upload from gallery"
      >
        <Upload className="w-4 h-4" />
        Gallery
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,application/pdf"
        onChange={(e) => handleFileSelect(e.target.files[0])}
        className="hidden"
      />

      {/* Preview/Status */}
      {preview && (
        <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
          {uploading ? (
            <>
              <Loader className="w-4 h-4 text-green-600 animate-spin" />
              <span className="text-sm text-green-700">Uploading...</span>
            </>
          ) : (
            <>
              <ImageIcon className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-700">Uploaded!</span>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default PhotoUpload;
