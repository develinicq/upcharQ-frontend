import React, { useState } from 'react'
import HelpSupportDrawer from '@/SuperAdmin/components/HelpSupport/HelpSupportDrawer'
import Button from '../../../components/Button'
import { useNavigate } from 'react-router-dom'

export default function HActivated() {
  const [isHelpOpen, setIsHelpOpen] = useState(false)
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="py-8 text-center">
        <img src="/logo.png" alt="eClinic-Q" className="h-8 inline-block" />
      </div>
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-3xl px-6 text-center">
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-1">Hospital Profile Activated Successfully</h1>
          <p className="text-sm text-gray-500 mb-6">Security and staff access are configured. You're ready to manage hospital operations.</p>
          <hr className="border-gray-200 mb-6" />
          <div className="flex items-center justify-center gap-3">
            <Button variant="secondary" onClick={() => navigate('/hospital')}>Manage Hospital</Button>
            <Button variant="primary" onClick={() => navigate('/hospital')}>Go to Dashboard ↗</Button>
          </div>
        </div>
      </div>
      <div className="px-8 py-6 flex justify-between items-center w-full z-10 text-gray-500">
        <button
          className="flex items-center gap-2 hover:text-gray-900 transition-colors"
          onClick={() => setIsHelpOpen(true)}
        >
          <span className="w-5 h-5 flex items-center justify-center">
            <img src="/Help.svg" alt="Help" className="w-full h-full opacity-60" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'block'; }} />
            <span className="hidden w-3 h-3 rounded-full border border-current items-center justify-center text-[10px]" style={{ display: 'none' }}>?</span>
          </span>
          <span className="text-[11px] font-normal">Help & Support</span>
          <svg className="w-3 h-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </button>
        <span className="text-[11px]">© 2025, Bloomevera Solutions LLP. All Rights Reserved.</span>
      </div>
      <HelpSupportDrawer isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </div>
  )
}
