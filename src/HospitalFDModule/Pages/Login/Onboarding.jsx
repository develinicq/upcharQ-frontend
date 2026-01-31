import React, { useState } from 'react'
import Input from '../../../components/FormItems/Input'
import Button from '../../../components/Button'
import PasswordRequirements from '../../../components/FormItems/PasswordRequirements'
import PasswordStrengthBar from '../../../components/FormItems/PasswordStrengthBar'
import DoctorInfoCard from '../../../DoctorModule/Components/Login/DoctorInfoCard'

const HFDOnboarding = ({ onContinue }) => {
  const [formData, setFormData] = useState({ password: '', confirmPassword: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const details = {
    user: {
      firstName: 'FrontDesk',
      lastName: 'Hospital',
      emailId: 'fd.hospital@example.com',
      phone: '+91 96666 00000',
      degree: '',
      profilePhoto: undefined,
      id: 'HFD1234',
    },
    invitation: { type: 'HFD' },
  }

  const handleChange = (e) => setFormData((p)=>({ ...p, [e.target.name]: e.target.value }))

  const reqs = [ (pw)=>pw.length>=8 && pw.length<=15, (pw)=>/[A-Z]/.test(pw), (pw)=>/[a-z]/.test(pw), (pw)=>/[0-9]/.test(pw), (pw)=>/[!@#$%^&*]/.test(pw) ]
  const valid = reqs.every(fn=>fn(formData.password))
  const match = formData.password && formData.confirmPassword && formData.password===formData.confirmPassword

  const Eye = ({ on }) => (
    <span className="text-gray-500 hover:text-gray-700 inline-flex items-center" onClick={() => on === 'pw' ? setShowPassword(v=>!v) : setShowConfirmPassword(v=>!v)} role="button" tabIndex={0}>
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></svg>
    </span>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-2">
      <div>
        <div className="bg-white rounded-2xl flex flex-col shadow-lg w-full max-w-xl border-2 border-blue-200">
          <div className="p-6 sm:p-8 flex flex-col gap-6">
            <div className="text-center gap-1 flex flex-col">
              <h2 className="text-2xl font-bold text-gray-800">Welcome, {details.user.firstName} {details.user.lastName}</h2>
              <p className="text-sm text-gray-500">Let’s set your account security password for your account.</p>
            </div>
            <DoctorInfoCard
              name={`${details.user.firstName} ${details.user.lastName}`}
              title={'Hospital FrontDesk'}
              degree={details.user.degree || ''}
              email={details.user.emailId}
              phone={details.user.phone}
              code={details.user.id}
              avatarUrl={details.user.profilePhoto || undefined}
            />
            <form className="flex flex-col gap-6">
              <div className="relative flex flex-col gap-2">
                <Input type={showPassword ? 'text':'password'} id="password" name="password" value={formData.password} onChange={handleChange} placeholder="Minimum 8 character" autoComplete="new-password" label="Create Password" compulsory icon={<Eye on='pw'/>} />
                <PasswordStrengthBar password={formData.password} />
              </div>
              <div>
                <Input type={showConfirmPassword ? 'text':'password'} id="confirmPassword" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Minimum 8 character" autoComplete="new-password" label="Confirm Password" compulsory icon={<Eye on='cpw'/>} />
                {formData.confirmPassword && match && (<p className="text-xs text-green-600 mt-1">Passwords Matched</p>)}
                {formData.confirmPassword && !match && (<p className="text-xs text-red-500 mt-1">Passwords do not match</p>)}
              </div>
              <PasswordRequirements password={formData.password} />
              <div className="pt-2">
                <Button variant="primary" disabled={!(match && valid)} className="w-full text-center" onClick={() => onContinue?.({ details, password: formData.password, confirmPassword: formData.confirmPassword })}>
                  Continue to Verification
                </Button>
              </div>
            </form>
          </div>
          <div className="px-4 py-3 border-t border-gray-200 rounded-b-2xl">
            <div className="text-xs text-gray-600 flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-4 h-4 rounded-full border border-gray-300 text-gray-500">i</span>
              <span>
                By clicking the button above, you agree to our <a href="#" className="text-blue-600 underline hover:underline">Terms of Service</a> and <a href="#" className="text-blue-600 underline hover:underline">Privacy Policy</a>.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HFDOnboarding
