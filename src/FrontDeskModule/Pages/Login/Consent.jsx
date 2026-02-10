import React, { useState } from 'react'
import HelpSupportDrawer from '@/SuperAdmin/components/HelpSupport/HelpSupportDrawer'
import Button from '../../../components/Button'

export default function FDConsent({ onContinue }) {
  const [accepted, setAccepted] = useState(false)
  const [isHelpOpen, setIsHelpOpen] = useState(false)

  return (
    <div className="min-h-screen bg-white flex flex-col relative overflow-hidden font-sans">
      {/* Header gradient background */}
      <div
        className="absolute top-0 left-0 w-full h-[300px]"
        style={{
          background: "linear-gradient(180deg, #E0EBFF 0%, #FFFFFF 100%)",
          opacity: 0.8
        }}
      />

      {/* Logo */}
      <div className="relative z-10 w-full flex justify-center py-5 mt-7">
        <img src="/logo.svg" alt="eClinic-Q" className="h-10" />
      </div>

      <div className="flex-1 flex items-center justify-center p-4 relative z-10 -mt-4">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-[450px] overflow-hidden">
          <div className="p-4 pb-6">
            <div className="text-center mb-4">
              <h2 className="text-md font-bold text-gray-700 ">Consent & Confidentiality</h2>
              <p className="text-gray-700 text-[10px] font-light">Please review and acknowledge our data handling and confidentiality policies.</p>
            </div>

            {/* Policy Card Container */}
            <div className="border border-gray-300 rounded-md bg-white  shadow-sm h-[270px] flex flex-col mb-4">

              {/* Scrollable Content */}
              <div className="p-4 overflow-y-auto flex-1 custom-scrollbar">
                {/* Policy Header with Icon */}
                <div className="flex items-start gap-2 mb-1 pb-2 border-b border-gray-100">
                  <div className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center bg-gray-50 flex-shrink-0">
                    <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-700 text-xs">Confidentiality & Data Use Policy v1.2</h3>
                    <p className="text-gray-700 text-[10px] mt-0.5">Summary of key policies for healthcare staff data handling</p>
                  </div>
                </div>

                <div className="text-xs text-gray-600 ">
                  <div>
                    <div className="font-normal text-green-600 mb-1 text-[10px]">What you can do:</div>
                    <ul className="list-disc pl-5 marker:text-gray-800 text-[9px] text-gray-800">
                      <li>Access patient records assigned to your care</li>
                      <li>Update treatment notes and observations</li>
                      <li>Communicate with authorized team members about patient care</li>
                    </ul>
                  </div>

                  <div>
                    <div className="font-normal text-red-500 mb-1 text-[10px]">What you cannot do:</div>
                    <ul className="list-disc pl-5 marker:text-gray-800 text-[9px] text-gray-800">
                      <li>Access records of patients not under your care</li>
                      <li>Share patient information on social media or personal devices</li>
                      <li>Take photos or screenshots of patient data</li>
                      <li>Discuss patient cases outside the clinic premises</li>
                    </ul>
                  </div>

                  <div>
                    <div className="font-normal text-blue-600 mb-1 text-[10px]">Key Rules:</div>
                    <ul className="list-disc pl-5 marker:text-gray-800 text-[9px] text-gray-800">
                      <li>Patient Information is strictly confidential and must never be shared outside the clinic</li>
                      <li>Access systems only for legitimate work purposes</li>
                      <li>Report any suspected data breaches immediately to administration</li>
                      <li>Use strong passwords and never share login credentials</li>
                      <li>Log out of all systems when stepping away from workstations</li>
                    </ul>
                  </div>

                  <div className="border-t border-gray-100 ml-2 pt-2">
                    <p className="text-gray-700 text-[9px]">Policy Version: 1.2 | Last Updated: September 2025</p>
                    <p className="text-gray-600 text-[9px] font-light">By accepting, you acknowledge that you have read and understood this policy.</p>
                  </div>
                </div>
              </div>

              {/* Fixed Checkbox Section */}
              <div className="py-0.5 px-2 bg-white border-t border-gray-50 rounded-b-md">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative flex items-center ">
                    <input
                      type="checkbox"
                      className="peer h-4 w-4 cursor-pointer appearance-none rounded border border-gray-300 shadow-sm checked:border-blue-600 checked:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      checked={accepted}
                      onChange={(e) => setAccepted(e.target.checked)}
                    />
                    <svg className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-[10px] text-gray-600 leading-relaxed select-none group-hover:text-gray-800 transition-colors">
                    I will handle patient data responsibly. I agree to the Clinic's Confidentiality & Data Use Policy (v1.2).
                  </span>
                </label>
              </div>
            </div>


            <Button
              className={`w-full rounded-sm text-xs font-medium transition-all ${accepted ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg' : 'bg-blue-200 text-white cursor-not-allowed'}`}
              disabled={!accepted}
              onClick={() => onContinue?.()}
            >
              Save & Continue →
            </Button>
          </div>

          <div className=" bg-gray-50/50 text-[8px] text-gray-400 text-center border-t border-gray-100 mb-3">
            Your acceptance is recorded with timestamp, IP address, and policy version for compliance purposes.
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-8 py-4 flex justify-between items-center w-full z-10 border-t border-gray-50 bg-white">
        <button
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
          onClick={() => setIsHelpOpen(true)}
        >
          <span className="w-5 h-5 flex items-center justify-center">
            <img src="/Help.svg" alt="Help" className="w-full h-full opacity-60" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'block'; }} />
            <span className="hidden w-3 h-3 rounded-full border border-current items-center justify-center text-[10px]" style={{ display: 'none' }}>?</span>
          </span>
          <span className="text-[11px] font-normal">Help & Support</span>
          <svg className="w-3 h-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </button>
        <span className="text-[10px] text-gray-400">© 2025, Bloomevera Solutions LLP. All Rights Reserved.</span>
      </div>

      <HelpSupportDrawer isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
      `}</style>
    </div>
  )
}
