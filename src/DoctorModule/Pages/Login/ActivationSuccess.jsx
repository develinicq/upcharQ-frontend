import React, { useState } from 'react';
import Button from '../../../components/Button';
import { useNavigate } from 'react-router-dom';
import HelpSupportDrawer from '@/SuperAdmin/components/HelpSupport/HelpSupportDrawer';
import { activateDoctor } from '@/services/doctorService';

export default function ActivationSuccess({ onCompleteProfile, doctorId }) {
  const navigate = useNavigate();
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const handleDashboard = async () => {
    if (doctorId) {
      try {
        await activateDoctor(doctorId);
      } catch (err) {
        console.error("Activation failed", err);
        // Continue anyway as they might already be active
      }
    }
    navigate('/doc');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col relative overflow-hidden font-sans">
      {/* Background Blurs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100/50 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-pink-100/50 rounded-full blur-[80px] pointer-events-none" />

      {/* Header / Logo */}
      <div className="w-full flex justify-center pt-8 z-10">
        <img src="superAdmin/main_sidebar/logo.svg" alt="Upchar-Q" className="h-10" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 z-10">
        <div className="w-full max-w-2xl flex flex-col items-center">
          {/* Illustration */}
          <div className="mb-8 relative">
            <img src="/hospital-sample.png" alt="Hospital" className="h-48 w-auto object-contain" />
          </div>

          <div className="text-center mb-8">
            <h1 className="text-xl font-bold text-gray-700 mb-1">
              Your Profile Activated Successfully
            </h1>
            <p className="text-xs text-gray-700 max-w-2xl mx-auto">
              Your credentials and professional contacts are now secured. You're ready to access patient data.
            </p>
          </div>

          <div className="w-full border-t border-gray-200 mb-8" />

          <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-4 px-4 sm:px-12">
            <Button
              variant="secondary"
              className="w-full sm:w-auto px-4 py-1.5 rounded-sm border-gray-300 text-gray-700 font-medium hover:bg-gray-50 text-[11px]"
              onClick={() => {
                if (onCompleteProfile) return onCompleteProfile();
                navigate('/onboarding');
              }}
            >
              Complete Your Profile
            </Button>

            <Button
              variant="primary"
              className="w-full sm:w-auto px-4 py-1.5 rounded-sm bg-blue-600 hover:bg-blue-700 text-white font-normal flex items-center justify-center gap-2 text-[11px]"
              onClick={handleDashboard}
            >
              Go to Dashboard
              <span className="text-lg leading-none">→</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-8 py-6 flex justify-between items-center w-full border-t border-transparent sm:border-gray-50 z-10">
        <button className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
          onClick={() => setIsHelpOpen(true)}
        >
          <span className="w-5 h-5 flex items-center justify-center">
            <img src="/Help.svg" alt="Help" className="w-full h-full opacity-60" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'block'; }} />
            <span className="hidden w-3 h-3 rounded-full border border-current items-center justify-center text-[10px]" style={{ display: 'none' }}>?</span>
          </span>
          <span className="text-[11px] font-normal">Help & Support</span>
          <svg className="w-3 h-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </button>
        <span className="text-[8px] text-gray-400">© 2025, Bloomevera Solutions LLP. All Rights Reserved.</span>
      </div>

      <HelpSupportDrawer isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </div>
  );
}
