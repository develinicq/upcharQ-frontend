import React from 'react';
import UniversalLoader from './UniversalLoader';
import { infoCircle } from '../../public/index';

const DetailPopup = ({
    isOpen,
    heading,
    subHeading,
    children,
    onCancel,
    onVerify,
    isVerifying = false,
    isVerifyDisabled = false,
    verifyBtnText = "Verify",
    cancelBtnText = "Cancel"
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 ">
            <div className='w-[510px]  bg-white rounded-xl'>
                <div className="p-6 flex flex-col items-center animate-in fade-in zoom-in duration-200">

                    {/* Heading */}
                    <h2 className="text-[24px] font-bold text-secondary-grey400 mb-1 text-center">
                        {heading}
                    </h2>

                    {/* Subheading */}
                    <div className="text-center w-[97%] text-secondary-grey300 text-sm mb-5">
                        {subHeading}
                    </div>

                    {/* Content (Inputs) */}
                    <div className="w-full mb-6">
                        {children}
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-4 w-full ">
                        {isVerifying ? (
                            <button
                                disabled
                                className="w-full h-11 flex items-center justify-center gap-2 bg-blue-600 text-white rounded-md text-sm font-medium transition-colors"
                            >
                                <UniversalLoader
                                    size={20}
                                    style={{
                                        background: 'transparent',
                                        width: 'auto',
                                        height: 'auto',
                                        minHeight: 0,
                                        minWidth: 0
                                    }}
                                />
                                Verifying...
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={onCancel}
                                    className="flex-1 h-11 bg-white border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors"
                                >
                                    {cancelBtnText}
                                </button>
                                <button
                                    onClick={onVerify}
                                    disabled={isVerifyDisabled}
                                    className={`flex-1 h-11 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2
                  ${isVerifyDisabled
                                            ? 'bg-secondary-grey50  cursor-not-allowed text-secondary-grey100'
                                            : 'bg-blue-primary250 hover:bg-blue-primary300 text-white'
                                        }`}
                                >
                                    <div className={`w-4 h-4 rounded-full flex items-center justify-center border ${isVerifyDisabled ? "border-secondary-grey150" : "border-white"
                                        }`}>
                                        <svg width="8" height="6" viewBox="0 0 8 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M1 3L3 5L7 1" stroke={isVerifyDisabled ? "#B8B8B8" : "white"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </div>
                                    {verifyBtnText}
                                </button>
                            </>
                        )}
                    </div>



                </div>
                {/* Footer Info */}
                <div className="flex items-center gap-2 py-2 px-3 bg-secondary-grey50 text-secondary-grey200 text-xs w-full rounded-xl">
                    <img src={infoCircle} alt="info" className="w-4 h-4 " />
                    <span>It may take a minute or two to receive your code.</span>
                </div>
            </div>

        </div>
    );
};

export default DetailPopup;
