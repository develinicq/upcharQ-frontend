import React, { useState } from 'react'
import HelpSupportDrawer from '@/SuperAdmin/components/HelpSupport/HelpSupportDrawer'
import Button from '../../../components/Button'

export default function HConsent({ onContinue }) {
  const [accepted, setAccepted] = useState(true)
  const [isHelpOpen, setIsHelpOpen] = useState(false)
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex flex-col relative overflow-hidden">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg w-full max-w-[560px] border-2 border-blue-200 overflow-hidden">
          <div className="p-6 sm:p-8">
            <div className="text-center mb-2">
              <h2 className="text-xl font-semibold text-gray-800">Consent & Confidentiality</h2>
              <p className="text-gray-500 text-sm">Please review and acknowledge our data handling and confidentiality policies.</p>
            </div>
            <div className="mt-3 border rounded-lg p-3 bg-gray-50 border-gray-200">
              <div className="text-sm font-medium text-gray-800 mb-2">Hospital Confidentiality & Data Use Policy v1.2</div>
              <div className="text-xs text-gray-700">
                <div className="font-semibold mb-1">What you can do:</div>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Access authorized medical records and schedules</li>
                  <li>Update hospital operational notes and statuses</li>
                  <li>Communicate with hospital team members for care coordination</li>
                </ul>
                <div className="font-semibold mt-3 mb-1">What you cannot do:</div>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Access records not authorized for your role</li>
                  <li>Share patient information on social media or personal devices</li>
                  <li>Export or transmit data outside approved systems</li>
                  <li>Discuss confidential cases outside the hospital premises</li>
                </ul>
                <div className="font-semibold mt-3 mb-1">Key Rules:</div>
                <label className="flex items-start gap-2 text-gray-700">
                  <input type="checkbox" className="mt-0.5" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} />
                  <span>I agree to Hospital's Confidentiality & Data Use Policy (v1.2) and will handle all data responsibly.</span>
                </label>
              </div>
            </div>
            <div className="mt-4"><Button className="w-full" variant="primary" disabled={!accepted} onClick={() => onContinue?.()}>Save & Continue</Button></div>
          </div>
          <div className="px-4 py-3 border-t border-gray-200 rounded-b-2xl text-[11px] text-gray-500">Your acceptance is recorded with timestamp, IP address, and policy version for compliance purposes.</div>
        </div>
      </div>
      <div className="px-8 py-6 flex justify-between items-center w-full z-10 text-white/80">
        <button
          className="flex items-center gap-2 hover:text-white transition-colors"
          onClick={() => setIsHelpOpen(true)}
        >
          <span className="w-5 h-5 flex items-center justify-center">
            <img src="/Help.svg" alt="Help" className="w-full h-full opacity-80 brightness-0 invert" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'block'; }} />
            <span className="hidden w-3 h-3 rounded-full border border-current items-center justify-center text-[10px]" style={{ display: 'none' }}>?</span>
          </span>
          <span className="text-[11px] font-normal">Help & Support</span>
          <svg className="w-3 h-3 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </button>
        <span className="text-[8px] opacity-80">© 2025, Bloomevera Solutions LLP. All Rights Reserved.</span>
      </div>
      <HelpSupportDrawer isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </div>
  )
}
