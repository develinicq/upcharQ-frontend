import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

/**
 * Dropdown — floating menu component.
 * Props:
 * - open: boolean (controls visibility)
 * - onClose: () => void (called when clicking outside or pressing ESC)
 * - items: Array<{ label: string, value: any }>
 * - onSelect: (item) => void
 * - anchorClassName: string (optional class for the container that hosts the dropdown)
 * - className: string (extra classes for panel)
 * - itemClassName: string (extra classes for items)
 */
export default function Dropdown({
  open,
  onClose,
  items = [],
  onSelect,
  anchorClassName = "",
  className = "",
  itemClassName = "",
  // value of currently selected item for highlighting
  selectedValue,
  direction = "down",
  align = "left",
  useAnchorWidth = true,
}) {
  const panelRef = useRef(null);
  const anchorRef = useRef(null);
  const [position, setPosition] = React.useState({ top: 0, left: 0, right: 0, width: 0 });

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Calculate position based on anchor element
  useEffect(() => {
    if (open && anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      const GAP = 8;

      const pos = {
        width: rect.width,
      };

      if (align === "right") {
        pos.right = window.innerWidth - rect.right;
      } else {
        pos.left = rect.left;
      }

      if (direction === "up") {
        pos.bottom = window.innerHeight - rect.top + GAP;
      } else {
        pos.top = rect.bottom + GAP;
      }

      setPosition(pos);
    }
  }, [open, direction, align]);


  if (!open) return <div ref={anchorRef} className={anchorClassName} />;

  const dropdownStyle = {
    ...(useAnchorWidth && position.width ? { width: `${position.width}px` } : {}),
  };

  if (align === "right") {
    dropdownStyle.right = `${position.right}px`;
  } else {
    dropdownStyle.left = `${position.left}px`;
  }

  if (direction === "up") {
    dropdownStyle.bottom = `${position.bottom}px`;
  } else {
    dropdownStyle.top = `${position.top}px`;
  }

  const dropdown = (
    <>
      {/* global backdrop to catch clicks anywhere */}
      <div className="fixed inset-0 z-[9998]" onClick={onClose} />
      <div
        ref={panelRef}
        className={`fixed z-[9999] rounded-md border border-gray-200 bg-white shadow-lg ${className}`}
        style={dropdownStyle}
        onClick={(e) => e.stopPropagation()}
      >
        <ul className="max-h-[240px] overflow-auto py-2 px-2 flex flex-col gap-1 scrollbar-hide">
          {items.map((it) => {
            const isSel =
              selectedValue !== undefined && it.value === selectedValue;
            return (
              <li key={String(it.value)}>
                <button
                  type="button"
                  className={`w-full text-left px-3 py-2 text-sm text-secondary-grey400 rounded-md ${isSel
                    ? "bg-blue-50 text-blue-600"
                    : "hover:bg-secondary-grey50"
                    } ${itemClassName}`}
                  onClick={() => {
                    onSelect?.(it);
                    onClose?.();
                  }}
                >
                  {it.label}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );

  return (
    <>
      <div ref={anchorRef} className={anchorClassName} />
      {createPortal(dropdown, document.body)}
    </>
  );
}
