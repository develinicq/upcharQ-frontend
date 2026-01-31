import React, { useState, useRef } from "react";
import InputWithMeta from '../../../../components/GeneralDrawer/InputWithMeta';
import useImageUploadStore from '../../../../store/useImageUploadStore';

const upload = '/upload_blue.png';

const CustomUpload = ({ label, onUpload, meta, compulsory, uploadedKey, fileName, isMulti, uploadedKeys, onRemove, uploadContent = "Upload Image", noView = true }) => {
    const fileInputRef = useRef(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);
    const getUploadUrl = useImageUploadStore((state) => state.getUploadUrl);

    const handleFileChange = async (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        setError(null);
        setUploading(true);

        try {
            for (const file of files) {
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
        } finally {
            setUploading(false);
            // Reset input so same file can be selected again if needed
            if (fileInputRef.current) fileInputRef.current.value = '';
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
                            <img src={upload} alt="Upload" className="w-4 h-4" />
                            <span>{uploading ? 'Uploading...' : 'Upload File'}</span>
                        </div>
                    </label>
                </div>
                {meta && <span className="text-secondary-grey200 text-xs font-normal mt-1">{meta}</span>}
            </div>
        );
    }

    if (uploadedKey) {
        return (
            <InputWithMeta
                label={label}
                on
                infoIcon
                imageUpload={true}
                showDivider
                
                fileName={fileName || uploadedKey}
                showReupload={true}
                onFileSelect={(file) => {
                    handleFileChange({ target: { files: [file] } });
                }}
                onFileView={true} //noView ? undefined : () => window.open(uploadedKey, '_blank')
                requiredDot={compulsory}
            />
        );
    }

    return (
        <div className='flex flex-col '>
            <InputWithMeta
                label={label}
                showInput={false}
                infoIcon = {noView}
                requiredDot={compulsory}
            />
            <div
                onClick={() => !uploading && fileInputRef.current.click()}
                className='cursor-pointer p-1 px-2 rounded-sm border-[0.5px] border-dashed border-blue-primary150 h-8 hover:bg-gray-50 transition-colors text-blue-primary250 text-sm mb-1'
            >
                {uploading ? 'Uploading...' : uploadContent}
            </div>

            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*,.pdf,.doc,.docx"
            />
            {meta && <span className="text-xs text-secondary-grey200 ">{meta}</span>}

        </div>
    );
};
export default CustomUpload;
