import { useLocation, useNavigate } from "react-router-dom";
import { useRegistration } from "../../SuperAdmin/context/RegistrationContext";
import SidebarSteps from "../../SuperAdmin/components/RegistrationSidebar/SidebarSteps";
import RegistrationFooter from "../RegistrationFooter";
import RegistrationFlow from "../RegistrationFlow";
import React, { useState } from "react";
import Navbar from '../Navbar';

const Layout_registration_preview = () => {
    const { currentStep, nextStep, prevStep, registrationType, setRegistrationType, setCurrentStep, formData, updateFormData } = useRegistration();
    const [footerLoading, setFooterLoading] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    // Force registration type and step for preview
    React.useEffect(() => {
        setRegistrationType('doctor');
        // We don't necessarily want to force step 1 every time if the user is navigating
        // but for a clean start it's fine.
        if (currentStep === 0) setCurrentStep(1);
    }, [setRegistrationType]);

    const handleNext = async () => {
        if (registrationType === 'doctor') {
            if (currentStep === 4) {
                const currentSubStep = formData.step4SubStep || 1;
                if (currentSubStep === 1) {
                    updateFormData({ step4SubStep: 2 });
                    return;
                } else {
                    nextStep();
                    return;
                }
            }

            if (currentStep === 6) {
                navigate('/doctor');
            } else {
                nextStep();
            }
        }
    };

    const handlePrev = () => {
        if (registrationType === 'doctor') {
            if (currentStep === 4) {
                const currentSubStep = formData.step4SubStep || 1;
                if (currentSubStep === 2) {
                    updateFormData({ step4SubStep: 1 });
                    return;
                }
            }
        }

        if (currentStep > 1) {
            prevStep();
        }
    };

    const handleCancel = () => {
        navigate('/');
    };

    const maxSteps = 6;

    return (
        <div className="flex flex-col h-screen overflow-hidden">
            <div className="flex-none z-[110] bg-white">
                <Navbar />
            </div>
            <div className="flex-1 flex bg-gray-100 p-3 gap-3 overflow-hidden">
                {/* Sidebar - Fixed */}
                <div className="flex-shrink-0">
                    <SidebarSteps currentStep={currentStep} />
                </div>

                {/* Main + Footer - Fixed height container */}
                <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                    <main className="flex-1 overflow-y-auto ">
                        <div className="h-full">
                            <RegistrationFlow type="doctor" />
                        </div>
                    </main>

                    <RegistrationFooter
                        currentStep={currentStep}
                        maxSteps={maxSteps}
                        onNext={handleNext}
                        onPrev={handlePrev}
                        onCancel={handleCancel}
                        nextLabel={currentStep === 6 ? "Go to Profile" : "Save & Next →"}
                        loading={footerLoading}
                        isPreview={true}
                    />
                </div>
            </div>
        </div>
    );
};

export default Layout_registration_preview;
