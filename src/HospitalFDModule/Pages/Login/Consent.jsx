import React, { useState } from 'react'
import Button from '../../../components/Button'

export default function HFDConsent({ onContinue }){
  const [accepted, setAccepted] = useState(true)
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-[560px] border-2 border-blue-200 overflow-hidden">
        <div className="p-6 sm:p-8">
          <div className="text-center mb-2">
            <h2 className="text-xl font-semibold text-gray-800">Consent & Confidentiality</h2>
            <p className="text-gray-500 text-sm">Please review and acknowledge our data handling and confidentiality policies.</p>
          </div>
          <div className="mt-3 border rounded-lg p-3 bg-gray-50 border-gray-200">
            <div className="text-sm font-medium text-gray-800 mb-2">Hospital FrontDesk Policy v1.2</div>
            <div className="text-xs text-gray-700">
              <div className="font-semibold mb-1">What you can do:</div>
              <ul className="list-disc pl-5 space-y-1">
                <li>Access reception schedules and assigned patient queues</li>
                <li>Update check-in statuses and appointment notes</li>
                <li>Coordinate with doctors and hospital staff</li>
              </ul>
              <div className="font-semibold mt-3 mb-1">What you cannot do:</div>
              <ul className="list-disc pl-5 space-y-1">
                <li>Access clinical records not authorized for you</li>
                <li>Share patient data outside authorized channels</li>
                <li>Export data without permission</li>
              </ul>
              <div className="font-semibold mt-3 mb-1">Key Rules:</div>
              <label className="flex items-start gap-2 text-gray-700">
                <input type="checkbox" className="mt-0.5" checked={accepted} onChange={(e)=>setAccepted(e.target.checked)} />
                <span>I agree to the Hospital FrontDesk Confidentiality & Data Use Policy (v1.2).</span>
              </label>
            </div>
          </div>
          <div className="mt-4"><Button className="w-full" variant="primary" disabled={!accepted} onClick={()=>onContinue?.()}>Save & Continue</Button></div>
        </div>
        <div className="px-4 py-3 border-t border-gray-200 rounded-b-2xl text-[11px] text-gray-500">Your acceptance is recorded with timestamp, IP address, and policy version for compliance.</div>
      </div>
    </div>
  )
}
