import React from 'react';

/**
 * RegistrationSuccess Component
 * Displays a premium success message with blurred brand circles background.
 * @param {string} name - The name of the doctor or hospital to display.
 */
const RegistrationSuccess = ({ name }) => {
    return (
        <div className="relative w-full h-full flex flex-col items-center justify-center bg-white overflow-hidden min-h-[500px]">
            {/* Background Blurred Circles - 4 circles aligned at top with specific brand colors */}
            <div className="absolute top-0 left-0 w-full h-[60%] pointer-events-none flex justify-between px-[5%] overflow-visible">
                {/* Yellow Circle */}
                <div className="w-[250px] h-[250px] rounded-full bg-[#FFC527] blur-[70px] opacity-[0.35] translate-y-[-125px]"></div>
                {/* Pink/Purple Circle */}
                <div className="w-[250px] h-[250px] rounded-full bg-[#F761FF] blur-[70px] opacity-[0.35] translate-y-[-125px]"></div>
                {/* Deep Purple Circle */}
                <div className="w-[250px] h-[250px] rounded-full bg-[#7723EC] blur-[70px] opacity-[0.35] translate-y-[-125px]"></div>
                {/* Blue Circle */}
                <div className="w-[250px] h-[250px] rounded-full bg-[#2372EC] blur-[70px] opacity-[0.35] translate-y-[-125px]"></div>
            </div>

            {/* Content Container */}
            <div className="relative z-10 flex flex-col items-center max-w-lg mx-auto text-center px-6 -mt-10">
                {/* GIF illustration */}
                <div className="mb-6 scale-110">
                    <img
                        src="/completed.gif"
                        alt="Success Animation"
                        className="w-[220px] h-auto"
                    />
                </div>

                {/* Success Message */}
                <h1 className="text-[24px] font-bold text-secondary-grey400">
                    <span className="">{name}  Profile Activated Successfully</span>
                    
                </h1>

                
            </div>
        </div>
    );
};

export default RegistrationSuccess;
