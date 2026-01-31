import React from 'react'

const MFA = ({ formData, handleInputChange }) => {
  return (
    <div>
      {/* Multi-Factor Authentication */}
      <div className=" rounded-lg p-3 border-[0.5px] border-[#B8B8B8]">
        <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-1">
          Multi-Factor Authentication (MFA) 
          <div className='rounded-full bg-red-500 w-1 h-1'></div>
        </h3>
        <p className="text-xs text-gray-600 mb-4">
          For enhanced security, we require setting up MFA for all admin accounts
        </p>
        
        <div className="space-y-3">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              name="emailVerification"
              checked={true}
              disabled
              className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Email Verification</span>
          </label>
          
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              name="smsVerification"
              checked={true}
              disabled
              className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">SMS Verification</span>
          </label>
        </div>
      </div>
    </div>
  )
}
 
export default MFA
