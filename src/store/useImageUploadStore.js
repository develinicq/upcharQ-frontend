import { create } from "zustand";
import axiosInstance from "../lib/axios";

const useImageUploadStore = create((set) => ({
  uploadUrl: null,
  isLoading: false,
  error: null,

  getUploadUrl: async (contentType, file) => {
  const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/svg+xml", "image/webp"];
  const maxSize = 2 * 1024 * 1024; 
    if (!file || typeof file !== 'object') {
      set({ error: "No file provided", isLoading: false });
      throw new Error("No file provided");
    }
    if (!allowedTypes.includes(file.type)) {
      set({ error: "Unsupported file type. Supported: .png, .jpg, .svg, .webp", isLoading: false });
      throw new Error("Unsupported file type. Supported: .png, .jpg, .svg, .webp");
    }
    if (file.size > maxSize) {
      set({ error: "File size exceeds 2MB limit", isLoading: false });
      throw new Error("File size exceeds 2MB limit");
    }
    set({ isLoading: true, error: null });
    try {
      // Use new upload URL endpoint
      const response = await axiosInstance.post("/storage/upload-url", {
        contentType,
      });
      const payload = response?.data?.data || response?.data || {};
      const uploadUrl = payload?.uploadUrl || payload?.url || payload?.signedUrl;
      const key = payload?.key || payload?.fileKey || payload?.path;
      if (uploadUrl && key) {
        const data = { uploadUrl, key };
        set({ uploadUrl: data, isLoading: false });
        return data;
      }
      set({ error: "Invalid upload URL response", isLoading: false });
      return null;
    } catch (error) {
      const resp = error?.response;
      const msg = resp?.data?.message || resp?.data?.error || resp?.statusText || error.message || 'Upload URL request failed';
      console.error('getUploadUrl error:', {
        status: resp?.status,
        data: resp?.data,
        message: msg,
      });
      set({ error: msg, isLoading: false });
      return null;
    }
  },

  reset: () => set({ uploadUrl: null, isLoading: false, error: null }),
}));

export default useImageUploadStore;
