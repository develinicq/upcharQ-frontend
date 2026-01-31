import React, { useEffect, useRef } from "react";
import DropdownMenu from "./DropdownMenu";

export default function InputWithMeta({
  label,
  requiredDot = false,
  // Show an info icon next to label; if true, it appears in the same spot as the required dot
  infoIcon = false,
  InfoIconComponent,
  onInfoClick,
  rightMeta,
  value,
  onChange,
  placeholder,
  RightIcon,
  LeftIcon,
  onIconClick,
  onFieldOpen,
  readonlyWhenIcon = true,
  dropdown,
  // Built-in dropdown support (optional)
  dropdownItems,
  onSelectItem,
  selectedValue,
  itemRenderer,
  closeOnReclick = true,
  disabled = false,
  className = "",
  // indicate dropdown is currently open for UX cursor
  dropdownOpen = false,
  // optional: request parent to close dropdown (outside click or toggle)
  onRequestClose,
  // optional: extra selectors considered as inside when detecting outside clicks
  outsideIgnoreSelectors = [
    ".shadcn-calendar-dropdown",
    ".input-meta-dropdown",
  ],
  // Optional: render custom content instead of the input element
  children,
  // Controls whether the input box should be shown. Defaults to true.
  showInput = true,
  // Immutable display mode: show a prefaded, non-editable UI with optional right badge icon
  immutable = false,
  ImmutableRightIcon,
  // Badges/chips display mode: pass an array to render inside a bordered container; optional removal handler
  badges = null,
  badgesRemovable = true,
  onBadgeRemove,
  badgesEmptyPlaceholder = "Select Language",
  badgesClassName = "",
  // Inline right meta rendered inside the input box (e.g., 'Beds')
  inputRightMeta,
  // File upload pill mode
  imageUpload = false,
  fileName,
  onFileSelect,
  onFileView,
  fileAccept = "image/png, image/jpeg, image/jpg, image/svg+xml, image/webp, application/pdf",
  fileNameMaxLength = 22,
  showReupload = false,
  showDivider = false,
  type = "text",
  meta,
  dropUp = false,
  dropdownClassName = "",
  suffix = "",
}) {
  const truncate = (str, max) => {
    if (!str) return str;
    if (str.length <= max) return str;
    // Keep beginning and end for readability
    const keep = Math.max(4, Math.floor((max - 3) / 2));
    const start = str.slice(0, keep);
    const end = str.slice(-keep);
    return `${start}...${end}`;
  };
  const rootRef = useRef(null);
  const isReadOnly = !!RightIcon && readonlyWhenIcon;

  const handleOpen = () => {
    if (disabled) return;
    // If already open and close-on-reclick is enabled, close instead
    if (dropdownOpen && closeOnReclick) {
      onRequestClose?.();
      return;
    }
    if (onFieldOpen) onFieldOpen();
    else if (onIconClick) onIconClick();
  };

  // Close when clicking outside input + provided dropdown
  useEffect(() => {
    if (!dropdownOpen) return;
    const onDocMouseDown = (e) => {
      const t = e.target;
      if (!rootRef.current) return;
      const insideRoot = rootRef.current.contains(t);
      const insideIgnored = outsideIgnoreSelectors?.some((sel) =>
        t.closest?.(sel)
      );
      if (!insideRoot && !insideIgnored) {
        onRequestClose?.();
      }
    };
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, [dropdownOpen, onRequestClose, outsideIgnoreSelectors]);

  return (
    <div
      ref={rootRef}
      className={`w-full flex flex-col gap-1 relative ${className}`}
    >
      <div className="flex items-center justify-between ">
        <label className={`text-sm ${immutable ? "text-secondary-grey200" : "text-secondary-grey300"} flex items-center gap-1`}>
          {label}
          {infoIcon && (
            <button
              type="button"
              className="text-secondary-grey200 w-3 h-3 hover:text-secondary-grey300 cursor-pointer mt-0.5"
              onClick={onInfoClick}
              aria-label="info"
            >
              {InfoIconComponent ? (
                <InfoIconComponent className="h-3 w-3 ml-0.2" />
              ) : (
                <img src="/Doctor_module/text_box/info.png" alt="" className="" />
              )}
            </button>
          )}
          {requiredDot && (
            <div className="bg-red-500 w-1 h-1 rounded-full"></div>
          )}
        </label>
        {rightMeta ? (
          <div className="text-xs text-green-600">{rightMeta}</div>
        ) : null}
      </div>

      <div className="relative">
        {/* Immutable display mode (non-editable, prefaded, with optional right badge) */}
        {immutable ? (
          <div
            className={`w-full rounded-md border-[0.5px] border-secondary-grey150 h-8 text-sm text-secondary-grey400 bg-secondary-grey50 flex items-center justify-between px-2 select-none`}
            aria-readonly="true"
          >
            <span className="truncate">{value || ""}</span>
            {ImmutableRightIcon ? (
              <span className="ml-2 inline-flex items-center justify-center h-6 w-6 rounded-md border border-green-400 text-green-500">
                <ImmutableRightIcon className="h-4 w-4" />
              </span>
            ) : null}
          </div>
        ) : imageUpload ? (
          // File upload pill UI
          <label className="block w-full">
            <input
              type="file"
              className="hidden"
              accept={fileAccept}
              onChange={(e) => {
                const f = e.target.files?.[0] || null;
                onFileSelect?.(f);
              }}
              disabled={disabled}
            />
            <div className="h-[32px] w-full border-[0.5px] border-dashed border-secondary-grey200 rounded-md flex items-center justify-between px-2 text-sm cursor-pointer overflow-x-hidden bg-secondary-grey50">
              <span className="flex items-center gap-2 text-secondary-grey300 flex-1 min-w-0">
                <img src="/Doctor_module/settings/pdf_black.png" alt="" className="h-6 w-6" />
                <span className="whitespace-normal break-words break-all overflow-hidden text-secondary-grey400">
                  {truncate(fileName || "Establishment.pdf", fileNameMaxLength)}
                </span>
              </span>
              <span className="flex items-center gap-3 text-secondary-grey300 flex-shrink-0 ">
                {/* Conditional Refresh */}
                {showReupload && (
                  <button
                    type="button"
                    title="Re-upload"
                    className="hover:text-secondary-grey400"
                    onClick={(e) => {
                      const input = e.currentTarget.closest("label")?.querySelector("input[type='file']");
                      input?.click();
                    }}
                  >
                    <img src="/Doctor_module/settings/reverse.png" alt="" className="w-3.5 h-3.5" />
                  </button>
                )}
                {/* Conditional Divider */}
                {showDivider && (
                  <div className=" border-l-[0.5px] border-secondary-grey150 h-5"></div>
                )}


                {/* View */}
                {onFileView && (
                  <button
                    type="button"
                    title="View"
                    className="hover:text-secondary-grey400 mr-0.5"
                    onClick={() => onFileView?.(fileName)}
                  >
                    {/* simple eye */}
                    <img src="/Doctor_module/settings/eye.png" alt="" className="w-[17px]" />
                  </button>
                )}
              </span>
            </div>
          </label>
        ) : Array.isArray(badges) ? (
          <div className={`w-full rounded-md border-[0.5px] border-secondary-grey200 p-1 min-h-8 text-sm text-secondary-grey400 flex items-center flex-wrap gap-2 ${badgesClassName}`}>
            {badges.length > 0 ? (
              badges.map((b, idx) => (
                <span
                  key={`${b}-${idx}`}
                  className="inline-flex items-center h-5 gap-2 px-2 rounded-[6px] bg-secondary-grey50 text-secondary-grey400"
                >
                  <span className="text-[15px] leading-[1] inline-flex items-center">{b}</span>
                  {badgesRemovable ? (
                    <button
                      type="button"
                      aria-label={`remove ${b}`}
                      className="text-secondary-grey300 hover:text-gray-700  mb-[0.5] inline-flex items-center justify-center"
                      onClick={() => onBadgeRemove?.(b)}
                    >
                      ×
                    </button>
                  ) : null}
                </span>
              ))
            ) : (
              <span className="text-secondary-grey100 px-1">{badgesEmptyPlaceholder}</span>
            )}
          </div>
        ) : showInput ? (
          <div className={`relative flex items-stretch ${suffix ? "h-8" : ""}`}>
            {LeftIcon && !suffix && (
              <div className="absolute left-2 top-1/2 -translate-y-1/2 text-secondary-grey200">
                {typeof LeftIcon === "string" ? (
                  <img src={LeftIcon} alt="icon" className="h-4 w-4" />
                ) : (
                  <LeftIcon className="h-4 w-4" />
                )}
              </div>
            )}
            <input
              type={type}
              className={`w-full rounded-sm border-[0.5px] border-secondary-grey200 p-2 h-8 text-sm text-secondary-grey400 focus:outline-none focus:ring-0 focus:border-blue-primary150 focus:border-[2px] placeholder:text-secondary-grey100 ${suffix ? "rounded-r-none border-r-0 pr-2" : "pr-16"
                } ${disabled ? "bg-gray-100 cursor-not-allowed" : ""} ${isReadOnly || dropdownOpen ? "cursor-pointer select-none" : ""
                } ${LeftIcon ? "pl-8" : ""}`}
              value={value || ""}
              onChange={(e) => {
                if (isReadOnly) return; // prevent typing when read-only
                onChange?.(e.target.value);
              }}
              placeholder={placeholder}
              disabled={disabled}
              readOnly={isReadOnly}
              onMouseDown={(e) => {
                // Ensure opening happens on first click
                if (isReadOnly) e.preventDefault();
                handleOpen();
              }}
              onKeyDown={(e) => {
                if (!isReadOnly) return;
                // Allow navigation keys; block typing
                const allow = [
                  "Tab",
                  "Shift",
                  "ArrowLeft",
                  "ArrowRight",
                  "ArrowUp",
                  "ArrowDown",
                  "Escape",
                  "Enter",
                ];
                if (!allow.includes(e.key)) {
                  e.preventDefault();
                }
              }}
              style={isReadOnly ? { caretColor: "transparent" } : undefined}
            />
            {suffix && (
              <div className="bg-secondary-grey50 border-[0.5px] border-secondary-grey200 rounded-r-sm px-2 flex items-center justify-center text-[14px] text-secondary-grey300 whitespace-nowrap border-l-0">
                {suffix}
              </div>
            )}
            {inputRightMeta && !suffix ? (
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-secondary-grey300">
                {inputRightMeta}
              </span>
            ) : null}
            {RightIcon && !suffix ? (
              <button
                type="button"
                className="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2 text-gray-500 hover:text-gray-700 cursor-pointer"
                onClick={handleOpen}
                disabled={disabled}
                aria-label="open options"
              >
                {typeof RightIcon === "string" ? (
                  <img src={RightIcon} alt="icon" className="h-3.5 w-3.5" />
                ) : (
                  <RightIcon className="h-3 w-3" />
                )}
              </button>
            ) : null}
          </div>
        ) : null}

        {/* Custom content slot replacing the input box when showInput=false */}
        {!showInput && children}
      </div>

      {/* External dropdown slot */}
      {dropdown}

      {/* Built-in dropdown menu using reusable DropdownMenu */}
      {dropdownOpen &&
        Array.isArray(dropdownItems) &&
        dropdownItems.length > 0 && (
          <DropdownMenu
            items={dropdownItems}
            selectedItem={selectedValue !== undefined ? selectedValue : value}
            onSelect={(it) => {
              onSelectItem?.(it);
              onRequestClose?.();
            }}
            width="w-full"

            itemRenderer={itemRenderer}
            className={`${dropUp ? 'bottom-full mb-1 !top-auto' : 'top-full mt-1'} ${dropdownClassName}`}
          />
        )}
      {meta && <p className="text-[12px] text-secondary-grey200 leading-tight ">{meta}</p>}
    </div>
  );
}
