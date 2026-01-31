import React from 'react'
import Button from '../../../components/Button'
import { useNavigate } from 'react-router-dom'

export default function HFDActivated(){
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="py-8 text-center">
        <img src="/logo.png" alt="eClinic-Q" className="h-8 inline-block" />
      </div>
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-3xl px-6 text-center">
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-1">FrontDesk Profile Activated Successfully</h1>
          <p className="text-sm text-gray-500 mb-6">Your access to hospital reception has been enabled. You’re ready to manage queues.</p>
          <hr className="border-gray-200 mb-6" />
          <div className="flex items-center justify-center gap-3">
            <Button variant="secondary" onClick={()=>navigate('/hfd')}>Complete Your Profile</Button>
            <Button variant="primary" onClick={()=>navigate('/hfd')}>Go to Dashboard ↗</Button>
          </div>
        </div>
      </div>
      <div className="py-6 text-center text-[11px] text-gray-500">© 2025, Bloomvoraca Solutions LLP. All Rights Reserved.</div>
    </div>
  )
}
