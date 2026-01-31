import React from "react";


export default function RichTextBox({ label, value, onChange, placeholder = "", className = "", showCounter = false, maxLength }) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label ? (
        <label className="text-sm text-secondary-grey300">{label}</label>
      ) : null}
      <div className="w-full rounded-md border-[0.5px] border-secondary-grey200 overflow-hidden">

        <div className="flex h-8 items-center gap-2 p-1 border-b  border-secondary-grey200 text-secondary-grey300 text-sm">
            <div className="flex items-center gap-5 pl-2 bg-transparent"> {/* Reduced gap from 7 to 4 for better fit */}
                <button type="button" className="hover:opacity-80" aria-label="attach">
                    <img src="/Doctor_module/text_box/attach.png" alt="attach" className="h-3.5 w-3 flex-shrink-0" />
                </button>
                
                {/* First Vertical Bar */}
                <img src="/Doctor_module/text_box/vertical.png" alt="vertical" className="h-5 w-auto flex-shrink-0" />
                <div className="flex gap-6 items-center">
                    <button type="button" className="hover:opacity-80" aria-label="bold">
                    <img src="/Doctor_module/text_box/bold.png" alt="bold" className="h-3.5  flex-shrink-0" />
                    </button>
                    <button type="button" className="hover:opacity-80" aria-label="italic">
                        <img src="/Doctor_module/text_box/italic.png" alt="italic" className="h-3.5  flex-shrink-0" />
                    </button>
                    <button type="button" className="hover:opacity-80" aria-label="underline">
                        <img src="/Doctor_module/text_box/underline.png" alt="underline" className="h-3.5  flex-shrink-0" />
                    </button>
                    <button type="button" className="hover:opacity-80" aria-label="strikethrough">
                        <img src="/Doctor_module/text_box/strikethrough.png" alt="strikethrough" className="h-3.5  flex-shrink-0" />
                    </button>

                </div>
                
                {/* Second Vertical Bar - Added flex-shrink-0 */}
                <img src="/Doctor_module/text_box/vertical.png" alt="vertical" className="h-5 w-auto " />
                
                <button type="button" className="hover:opacity-80" aria-label="list">
                    <img src="/Doctor_module/text_box/list.png" alt="list" className="h-3  flex-shrink-0" />
                </button>
            </div>
        </div>

        <textarea
          className="w-full p-2 h-28 text-sm text-secondary-grey400 placeholder:text-secondary-grey100 focus:ring-0 focus:outline-none focus:border-blue-300 resize-none"
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
        />
        {showCounter && (
          <div className="text-[11px] text-secondary-grey200 pr-2 pb-1 text-right">
            {(value?.length ?? 0)}{maxLength ? `/${maxLength}` : ""}
          </div>
        )}
      </div>
    </div>
  );
}
