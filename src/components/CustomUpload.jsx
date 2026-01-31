import React, { useState, useRef, useEffect } from "react";
import InputWithMeta from './GeneralDrawer/InputWithMeta';
import useImageUploadStore from '../store/useImageUploadStore';
import { getDownloadUrl } from '../services/uploadsService';

const uploadIcon = '/upload_blue.png';

const CustomUpload = ({
    label,
    onUpload,
    meta,
    compulsory,
    uploadedKey,
    fileName,
    isMulti,
    uploadedKeys,
    onRemove,
    uploadContent = "Upload Image",
    noView = true,
    variant = "default", // 'default' | 'box'
    fullWidth = false
}) => {
    const fileInputRef = useRef(null);
    const [uploading, setUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState('');
    const [localPreview, setLocalPreview] = useState(null); // Instant local preview
    const [error, setError] = useState(null);
    const getUploadUrl = useImageUploadStore((state) => state.getUploadUrl);

    useEffect(() => {
        let active = true;
        const resolve = async () => {
            // Priority: Local preview. If set, ignore remote resolution to avoid flicker/API call
            if (localPreview) return;

            if (!uploadedKey) {
                if (active) setPreviewUrl('');
                return;
            }
            // Check if already a URL (e.g. data URI or public URL)
            if (/^(https?:)?\/\//i.test(uploadedKey) || /^data:/i.test(uploadedKey)) {
                if (active) setPreviewUrl(uploadedKey);
                return;
            }
            try {
                // Determine if we should call API. 
                // User requested "do not call any api". But we need it for persisting sessions.
                // We'll execute this only if we don't have a local preview.
                const url = await getDownloadUrl(uploadedKey);
                if (active) setPreviewUrl(url);
            } catch (e) {
                console.error("Failed to resolve preview", e);
                if (active) setPreviewUrl('');
            }
        };
        resolve();
        return () => { active = false; };
    }, [uploadedKey, localPreview]);


    const handleFileChange = async (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        setError(null);
        setUploading(true);

        try {
            for (const file of files) {
                // 1. Show local preview immediately (No API needed)
                const objectUrl = URL.createObjectURL(file);
                setLocalPreview(objectUrl);

                // 2. Perform upload
                const uploadData = await getUploadUrl(file.type, file);
                if (!uploadData || !uploadData.uploadUrl || !uploadData.key) {
                    throw new Error('Failed to get upload URL');
                }

                const res = await fetch(uploadData.uploadUrl, {
                    method: 'PUT',
                    headers: { 'Content-Type': file.type },
                    body: file,
                });

                if (!res.ok) throw new Error("Upload failed");

                if (onUpload) onUpload(uploadData.key, file.name);
            }
        } catch (err) {
            console.error(err);
            setError("Upload failed");
            setLocalPreview(null); // Revert preview on error
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const triggerUpload = (e) => {
        e?.preventDefault();
        e?.stopPropagation();
        if (!uploading && fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    if (isMulti) {
        return (
            <div className="flex flex-col">
                <InputWithMeta label={label} showInput={false} infoIcon requiredDot={compulsory} />
                <div className="flex flex-wrap gap-4 mt-1 items-center">
                    {Array.isArray(uploadedKeys) && uploadedKeys.map((key) => (
                        <div key={key} className="relative w-[120px] h-[120px] bg-gray-100 rounded-md border border-gray-200 overflow-hidden group">
                            <img src={key} alt="Upload" className="w-full h-full object-cover" />
                            {onRemove && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); onRemove(key); }}
                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                    title="Remove"
                                >
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                </button>
                            )}
                        </div>
                    ))}
                    <label className="w-[120px] h-[120px] border-dashed bg-blue-primary50 border-blue-primary150 border-[0.5px] rounded-md grid place-items-center text-blue-primary250 text-sm cursor-pointer hover:bg-blue-50 transition-colors">
                        <input
                            type="file"
                            className="hidden"
                            multiple
                            accept="image/*"
                            onChange={handleFileChange}
                            ref={fileInputRef}
                        />
                        <div className="flex flex-col items-center gap-1">
                            <img src={uploadIcon} alt="Upload" className="w-4 h-4" />
                            <span>{uploading ? 'Uploading...' : 'Upload File'}</span>
                        </div>
                    </label>
                </div>
                {meta && <span className="text-secondary-grey200 text-xs font-normal mt-1">{meta}</span>}
            </div>
        );
    }

    // Handle Box Variant
    if (variant === 'box') {
        const displayUrl = localPreview || previewUrl;

        return (
            <div className="flex flex-col">
                <InputWithMeta
                    label={label}
                    showInput={false}
                    infoIcon={noView}
                    requiredDot={compulsory}
                />

                {meta && <span className="text-xs text-secondary-grey200 mb-1">{meta}</span>}

                <div
                    onClick={triggerUpload}
                    className={`cursor-pointer rounded-sm border-[0.5px] border-dashed border-blue-primary150 transition-colors text-blue-primary250 text-sm mb-1 flex flex-col items-center justify-center gap-1 ${fullWidth ? 'w-full h-32' : 'w-[130px] h-[130px]'} overflow-hidden bg-white relative hover:bg-gray-50 group`}
                >
                    {uploading ? (
                        <span className="text-blue-primary250 text-xs">Uploading...</span>
                    ) : displayUrl ? (
                        <div className="w-full h-full relative">
                            <img src={displayUrl} alt="Preview" className="w-full h-full object-cover" />
                            {/* Hover overlay to indicate re-upload capability */}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                <span className="text-white text-xs font-medium">Change</span>
                            </div>
                        </div>
                    ) : (
                        <>
                            <img src={uploadIcon} alt="" className='w-4 h-4' />
                            <span className="text-blue-primary250 text-sm">{uploadContent}</span>
                        </>
                    )}
                </div>

                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                    accept="image/*,.pdf,.doc,.docx"
                />
            </div>
        );
    }

    // Default Variant: Switch to InputWithMeta row if uploaded
    if (uploadedKey) {
        return (
            <div className="flex flex-col">
                <InputWithMeta
                    label={label}
                    infoIcon
                    imageUpload={true}
                    showDivider
                    fileName={fileName || uploadedKey}
                    showReupload={true}
                    onFileSelect={(file) => {
                        handleFileChange({ target: { files: [file] } });
                    }}
                    onFileView={true}
                    requiredDot={compulsory}
                />
            </div>
        );
    }

    return (
        <div className='flex flex-col '>
            <InputWithMeta
                label={label}
                showInput={false}
                infoIcon={noView}
                requiredDot={compulsory}
            />
            

            <div
                onClick={triggerUpload}
                className="cursor-pointer rounded-sm border-[0.5px] border-dashed border-blue-primary150 transition-colors text-blue-primary250 text-sm mb-1 flex items-center p-1 px-2 h-8 hover:bg-gray-50"
            >
                <span>{uploading ? 'Uploading...' : uploadContent}</span>
            </div>
            {meta && <span className="text-xs text-secondary-grey200 mb-1">{meta}</span>}

            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                style={{ display: 'none' }}
                accept="image/*,.pdf,.doc,.docx"
            />
        </div>
    );
};

export default CustomUpload;
