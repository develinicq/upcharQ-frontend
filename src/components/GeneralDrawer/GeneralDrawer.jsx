import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { drawerCross } from "../../../public/index.js";

export default function GeneralDrawer({
  isOpen,
  onClose,
  children,
  width = 600,
  title,
  headerRight,
  primaryActionLabel = "Save",
  onPrimaryAction,
  primaryActionDisabled = false,
  className: Class,
  // New: control visibility of the primary action button in header
  showPrimaryAction = true,
  zIndex = 5000,
  fullHeight = false,
}) {
  const panelRef = useRef(null);
  const [mounted, setMounted] = useState(false);
  const [closing, setClosing] = useState(false);

  // Close with animation, then notify parent
  const requestClose = () => {
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      setMounted(false);
      onClose?.();
    }, 220);
  };

  // Mount when opened; on close, play exit animation then unmount
  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      setClosing(false);
      return;
    }
    if (mounted) {
      setClosing(true);
      const t = setTimeout(() => {
        setClosing(false);
        setMounted(false);
      }, 220);
      return () => clearTimeout(t);
    }
  }, [isOpen, mounted]);

  // Close on ESC
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") requestClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen]);

  // Prevent body scroll while open
  useEffect(() => {
    if (!mounted) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mounted]);

  // requestClose defined above; avoid duplicate

  if (!mounted && !closing) return null;

  const drawerContent = (
    <div className="fixed inset-0 " style={{ zIndex }}>
      <style>{`
        @keyframes drawerIn { from { transform: translateX(100%); opacity: 0.6; } to { transform: translateX(0%); opacity: 1; } }
        @keyframes drawerOut { from { transform: translateX(0%); opacity: 1; } to { transform: translateX(100%); opacity: 0.6; } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: .3; } }
        @keyframes fadeOut { from { opacity: .3; } to { opacity: 0; } }
      `}</style>

      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/90 ${closing
          ? "animate-[fadeOut_.2s_ease-in_forwards]"
          : "animate-[fadeIn_.25s_ease-out_forwards]"
          }`}
        onClick={requestClose}
        style={{ zIndex: 5001 }}
      />

      {/* Drawer panel */}
      <aside
        aria-hidden={!isOpen}
        className={` absolute bg-white shadow-2xl border border-gray-200 overflow-hidden ${fullHeight ? "top-0 right-0 bottom-0" : "top-2 right-2 bottom-2 rounded-xl"} ${closing
          ? "animate-[drawerOut_.22s_ease-in_forwards]"
          : "animate-[drawerIn_.25s_ease-out_forwards]"
          }`}
        ref={panelRef}
        style={{ zIndex: 5002, width: `${width}px` }}
      >
        <div className={`${Class} flex h-full w-full flex-col bg-white min-h-0`} >
          {/* Header */}
          <div className="sticky top-0 z-10 bg-white border-b p-4 pb-3">
            <div className="flex items-center justify-between">
              <h2 className="text-[18px] font-medium text-secondary-grey400">
                {title}
              </h2>

              <div className="flex items-center gap-2">
                {headerRight}

                {showPrimaryAction && (
                  <button
                    onClick={() =>
                      onPrimaryAction ? onPrimaryAction() : onClose?.()
                    }
                    disabled={primaryActionDisabled}
                    className={`text-sm min-w-8 font-medium rounded-[4px] py-1.5 px-2 border ${primaryActionDisabled
                      ? "text-secondary-grey100 bg-secondary-grey50 border-transparent cursor-not-allowed"
                      : "bg-blue-primary250 text-white border-transparent hover:bg-blue-primary300"
                      }`}
                  >
                    {primaryActionLabel || "Save"}
                  </button>
                )}
                {/* <div className="w-[0.7px] h-6 opacity-50 ml-1 bg-secondary-grey300"></div> */}
                <button
                  className="text-gray-500 w-7 h-7 hover:bg-gray-100 flex items-center justify-center"
                  onClick={requestClose}
                  aria-label="Close drawer"
                >
                  <img src={drawerCross} alt="Close" className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          {/* Scrollable content (hide scrollbar visuals) */}
          <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar p-4">{children}</div>
        </div>
      </aside>
    </div>
  );

  return createPortal(drawerContent, document.body);
}
