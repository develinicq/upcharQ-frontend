import React, { useRef, useState } from 'react';
import useImageUploadStore from '../../store/useImageUploadStore';


const Upload = ({ label = "Upload File", className = "", compulsory = false, onUpload, meta }) => {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const getUploadUrl = useImageUploadStore((state) => state.getUploadUrl);
  const storeError = useImageUploadStore((state) => state.error);
  const storeLoading = useImageUploadStore((state) => state.isLoading);

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setError(null);
    setUploading(true);
    setPreviewUrl(URL.createObjectURL(file));
    try {

      const uploadData = await getUploadUrl(file.type, file);
      if (!uploadData || !uploadData.uploadUrl || !uploadData.key) {
        const msg = storeError ? (typeof storeError === 'string' ? storeError : JSON.stringify(storeError)) : 'Failed to get upload URL';
        console.error('Upload URL acquisition failed:', msg);
        setError(msg);
        setUploading(false);
        return;
      }

      const res = await fetch(uploadData.uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type,
        },
        body: file,
      });
      if (!res.ok) {
        setError("Upload failed");
        setUploading(false);
        return;
      }
      setUploading(false);
      if (onUpload) onUpload(uploadData.key);
    } catch (err) {
      setError("Upload error: " + (err.message || err));
      setUploading(false);
    }
  };

  return (
    <div className={`${className} flex flex-col gap-1`}>
      <div className="flex gap-1 items-center">
        <label className="text-sm font-normal text-gray-700">{label}</label>
        <img src="/i-icon.png" alt="" className="w-3 h-3" />
        {compulsory && <div className="bg-red-500 w-1 h-1 rounded-full"></div>}
      </div>


      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />


      <button
        type="button"
        onClick={handleButtonClick}
        className="w-full h-[32px] text-left text-blue-600 text-sm font-medium border border-dashed border-blue-400 rounded-lg px-4 hover:bg-blue-50"
        disabled={uploading || storeLoading}
      >
        {uploading || storeLoading ? 'Uploading...' : 'Upload File'}
      </button>

      {previewUrl && (
        <img src={previewUrl} alt="Preview" className="mt-2 w-20 h-20 object-cover rounded" />
      )}
      {error && <div className="text-red-500 text-xs mt-1">{error}</div>}
      {meta && <p className="text-[10px] text-gray-400 leading-tight mt-1">{meta}</p>}
    </div>
  );
};

export default Upload;
