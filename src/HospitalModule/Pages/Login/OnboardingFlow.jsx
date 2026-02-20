import React, { useState, useCallback, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import HVerification from './Verification'
import HOnboarding from './Onboarding'
import HConsent from './Consent'
import HActivated from './Activated'
import axios from '../../../lib/axios'
import UniversalLoader from '@/components/UniversalLoader'

export default function HOnboardingFlow() {
  const [searchParams] = useSearchParams()
  const code = searchParams.get('code')

  // Start with loading if code exists, otherwise verify (mock mode)
  const [step, setStep] = useState(code ? 'loading' : 'verify')
  const [error, setError] = useState(null)

  const [flowData, setFlowData] = useState({
    details: null,
    mobileOtp: '',
    emailOtp: '',
    password: '',
    confirmPassword: ''
  })

  // Fetch invitation
  useEffect(() => {
    if (!code) return

    const fetchInvitation = async () => {
      try {
        const res = await axios.get(`/invitations/checkInvitation`, { params: { code } })
        if (res.data.success) {
          setFlowData(prev => ({ ...prev, details: res.data.data }))
          setStep('verify')
        } else {
          setError(res.data.message || 'Invalid invitation')
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load invitation')
      }
    }
    fetchInvitation()
  }, [code])

  const handleVerified = useCallback((payload) => {
    // payload: { mobileOtp, emailOtp }
    if (payload) {
      setFlowData(prev => ({ ...prev, ...payload }))
    }
    setStep('password')
  }, [])

  const handlePasswordContinue = useCallback((payload) => {
    // payload: { password, confirmPassword }
    if (payload) {
      setFlowData(prev => ({ ...prev, ...payload }))
    }
    setStep('consent')
  }, [])

  const handleConsentContinue = useCallback(async () => {
    // If we have real invitation details, verify with backend
    if (flowData.details && flowData.details.invitation) {
      try {
        const { details, mobileOtp, emailOtp, password, confirmPassword } = flowData

        await axios.post('/invitations/verifyOtp', {
          invitationId: details.invitation.id,
          mobileOtp,
          emailOtp,
          password,
          confirmPassword,
          mobileChallengeId: details.challengeID?.mobile,
          emailChallengeId: details.challengeID?.email
        });

        setStep('activated')
      } catch (err) {
        console.error(err)
        setError(err.response?.data?.message || 'Activation failed')
      }
    } else {
      // Mock flow
      setStep('activated')
    }
  }, [flowData])

  if (step === 'loading') return <div className="h-screen flex items-center justify-center"><UniversalLoader /></div>

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <div className="bg-white p-6 rounded shadow-md max-w-sm w-full text-center">
          <div className="text-red-500 text-4xl mb-2">⚠️</div>
          <h2 className="text-lg font-bold text-gray-800 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <a href="/" className="text-blue-600 hover:underline">Go Home</a>
        </div>
      </div>
    )
  }

  if (step === 'activated') return <HActivated />
  if (step === 'consent') return <HConsent onContinue={handleConsentContinue} />
  if (step === 'password') return <HOnboarding onContinue={handlePasswordContinue} details={flowData.details} />

  return <HVerification onVerified={handleVerified} />
}
