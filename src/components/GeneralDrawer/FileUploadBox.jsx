import React, { useRef, useState } from "react";
import { Upload } from "lucide-react";

/**
 * FileUploadBox — dropzone-style uploader for GeneralDrawer forms.
 * Props:
 * - label?: string
 * - value?: File | null
 * - onChange: (file: File | null) => void
 * - accept?: string (e.g. ".png,.jpg,.jpeg,.svg,.webp")
 * - maxSizeMB?: number (default 1)
 * - helperText?: string (default shows size + types)
 * - disabled?: boolean
 */
export default function FileUploadBox({
  label = "",
  value = null,
  onChange,
  accept = ".png,.jpg,.jpeg,.svg,.webp",
  maxSizeMB = 1,
  helperText,
  disabled = false,
}) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const maxBytes = maxSizeMB * 1024 * 1024;
  const defaultHelper = `Support size upto ${maxSizeMB}MB in ${accept}`;

  const validate = (file) => {
    if (!file) return false;
    if (file.size > maxBytes) return false;
    if (accept && accept.length) {
      const list = accept.split(",").map((s) => s.trim());
      const ok = list.some((ext) => file.name.toLowerCase().endsWith(ext.toLowerCase()));
      if (!ok) return false;
    }
    return true;
  };

  const handleFiles = (files) => {
    const file = files?.[0] || null;
    if (!file) return;
    if (!validate(file)) {
      // optional: surface an error via toast/prop later; for now ignore
      return;
    }
    onChange?.(file);
  };

  return (
    <div className="w-full flex flex-col gap-1">
      {label ? (
        <label className="text-sm text-secondary-grey300">{label}</label>
      ) : null}

      <div
        className={`w-full p-2 gap-2 rounded-[4px] border-[0.5px] border-dashed border-blue-primary150  bg-white min-h-[64px] flex flex-col items-center justify-center text-center relative`}
        onDragOver={(e) => {
          e.preventDefault();
          if (disabled) return;
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          if (disabled) return;
          setDragOver(false);
          const dt = e.dataTransfer;
          handleFiles(dt.files);
        }}
      >
        {!value ? (
          <>
            <img src="/Doctor_module/text_box/upload.png" alt="" className="w-6 " />
            <button
              type="button"
              className="text-blue-primary250 text-sm"
              onClick={() => inputRef.current?.click()}
              disabled={disabled}
            >
              Upload File
            </button>
          </>
        ) : (
          <div className="px-3 py-2 text-sm text-secondary-grey400">
            {value.name}
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          disabled={disabled}
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

  <div className="text-[12px] text-secondary-grey200">
        {helperText || defaultHelper}
      </div>
    </div>
  );
}
