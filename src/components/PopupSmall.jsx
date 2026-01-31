import React from 'react';
import UniversalLoader from './UniversalLoader';

/**
 * PopupSmall Component
 * 
 * A reusable small popup/modal component.
 * 
 * Props:
 * @param {boolean} isOpen - Controls visibility (optional, can be controlled by parent conditionally rendering)
 * @param {React.ReactNode | string} icon - Icon element or image URL to display in the circle
 * @param {string} iconBg - Tailwind class for the icon background color (e.g. "bg-blue-50")
 * @param {string} text - (Optional) Main text content
 * @param {Array} buttons - Array of button objects { label, onClick, variant }
 * 
 * Button Variants: 'blue', 'red', 'grey'
 */

const BUTTON_VARIANTS = {
    blue: "bg-blue-primary250 text-white hover:bg-blue-primary400 ",
    red: "bg-red-600 text-white hover:bg-red-700 border-error-400",
    grey: "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 ",
};

const PopupSmall = ({
    icon,
    iconBg = "bg-secondary-grey50 border border-secondary-grey100",
    text,
    buttons = [],
    isOpen = true
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 ">
            <div className="w-[305px] bg-white rounded-xl  p-4 gap-3 flex flex-col items-center transform transition-all animate-in fade-in zoom-in duration-200">

                {/* Icon Circle */}
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${iconBg}`}>
                    {typeof icon === 'string' ? (
                        <img src={icon} alt="" className="w-8 h-8 object-contain" />
                    ) : (
                        icon
                    )}
                </div>

                {/* Optional Text */}
                {text && (
                    <div className="text-center text-secondary-grey400 text-sm font-medium leading-[18px]">
                        {text}
                    </div>
                )}

                {/* Buttons Row */}
                <div className="flex gap-3 w-full">
                    {buttons.map((btn, idx) => (
                        <button
                            key={idx}
                            onClick={btn.onClick}
                            disabled={btn.loading}
                            className={`flex-1 min-w-8 h-8 rounded-sm text-sm font-medium transition-colors outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-100 flex items-center justify-center gap-2 ${BUTTON_VARIANTS[btn.variant] || BUTTON_VARIANTS.grey
                                } ${btn.loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {btn.loading && (
                                <UniversalLoader
                                    size={16}
                                    style={{
                                        background: 'transparent',
                                        width: 'auto',
                                        height: 'auto',
                                        minHeight: 0,
                                        minWidth: 0
                                    }}
                                />
                            )}
                            {btn.label}
                        </button>
                    ))}
                </div>

            </div>
        </div>
    );
};

export default PopupSmall;
