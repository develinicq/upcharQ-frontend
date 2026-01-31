import React, { useState } from 'react'
import InputWithMeta from '../../../components/GeneralDrawer/InputWithMeta'
import PasswordRequirements from '../../../components/FormItems/PasswordRequirements'

export default function HSecurity() {
  const [currentPass, setCurrentPass] = useState('')
  const [newPass, setNewPass] = useState('')
  const [confirmPass, setConfirmPass] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Verify OTP");
  }

  return (
    <div className=" max-w-[382px]">
      <div className="space-y-4">
        <InputWithMeta
          label="Enter Current Password"
          requiredDot={true}
          type="password"
          placeholder=""
          value={currentPass}
          onChange={setCurrentPass}
          className=""
        />

        <InputWithMeta
          label="New Password"
          requiredDot={true}
          type="password"
          placeholder="Enter Password"
          value={newPass}
          onChange={setNewPass}
          className=""
        />

        <InputWithMeta
          label="Confirm Password"
          requiredDot={true}
          type="password"
          placeholder="Enter Password"
          value={confirmPass}
          onChange={setConfirmPass}
          className=""
        />

        <div className="">
          <button
            onClick={handleSubmit}
            className="bg-blue-primary250 text-white text-[14px] font-medium h-8 px-2 rounded-sm hover:bg-blue-600 transition-colors shadow-sm"
          >
            Send OTP and Verify
          </button>
        </div>

        <div className="">
          <PasswordRequirements password={newPass} />
        </div>
      </div>
    </div>
  )
}
