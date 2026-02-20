import React, { useState, useCallback, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import axios from '../../../lib/axios'
import FDVerification from './Verification'
import FDOnboarding from './Onboarding'
import FDConsent from './Consent'
import FDActivated from './Activated'

// Minimal flow wrapper for FrontDesk onboarding
export default function FDOnboardingFlow() {
  const [searchParams] = useSearchParams()
  const code = searchParams.get('code')
  const [step, setStep] = useState(code ? 'verify' : 'restricted') // 'verify' -> 'password' -> 'consent' -> 'activated'
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // State to hold the fetched invitation details or default mock
  const [details, setDetails] = useState({
    user: {
      firstName: 'Alok',
      lastName: 'Verma',
      emailId: 'Milindchauhan@gmail.com',
      phone: '+91 91753 67487',
      degree: '',
      profilePhoto: undefined,
      id: 'FD123456',
    },
    invitation: { type: 'STAFF' },
    challengeID: { mobile: null, email: null }
  })

  // Fetch invitation details on mount if code exists
  const didFetchRef = useRef(false)

  useEffect(() => {
    if (didFetchRef.current) return
    const code = searchParams.get('code')

    if (!code) {
      // No code, stick with mock data for now
      setLoading(false)
      return
    }

    didFetchRef.current = true

    const fetchInvitation = async () => {
      try {
        // Add cache busting params
        const params = { code, _ts: Date.now() };
        const headers = {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        };

        const response = await axios.get('/invitations/checkInvitation', {
          params,
          headers
        });

        if (response.data?.success) {
          setDetails({
            user: response.data.data.user,
            invitation: response.data.data.invitation,
            challengeID: response.data.data.challengeID || {}
          })
        } else {
          console.error("Invitation check failed:", response.data.message)
          setError(response.data.message || "Invalid invitation")
        }
      } catch (err) {
        console.error("Error fetching invitation:", err)
        setError("Failed to load invitation details.")
      } finally {
        setLoading(false)
      }
    }

    fetchInvitation()
  }, [searchParams])

  const handleVerified = useCallback(() => setStep('password'), [])
  const handlePasswordContinue = useCallback(() => setStep('consent'), [])
  const handleConsentContinue = useCallback(() => setStep('activated'), [])

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>

  if (step === 'restricted') {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 font-sans">
        <div className="w-full max-w-md bg-white border border-gray-100 rounded-2xl p-10 text-center shadow-sm">
          <div className="text-amber-500 text-5xl mb-6">🔐</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Access Restricted</h2>
          <p className="text-gray-500 mb-8 text-sm leading-relaxed">
            Please use the registration link sent to your email to complete your onboarding process.
          </p>
          <button
            onClick={() => window.location.href = '/signin'}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition shadow-md shadow-blue-100"
          >
            Go to Sign In
          </button>
        </div>
      </div>
    );
  }

  if (step === 'activated') return <FDActivated />
  if (step === 'consent') return <FDConsent onContinue={handleConsentContinue} />
  if (step === 'password') return <FDOnboarding onContinue={handlePasswordContinue} userDetails={details.user} />

  return (
    <FDVerification
      onVerified={handleVerified}
      userDetails={details.user}
      invitationId={details.invitation?.id}
      mobileChallengeId={details.challengeID?.mobile}
      emailChallengeId={details.challengeID?.email}
    />
  )
}
