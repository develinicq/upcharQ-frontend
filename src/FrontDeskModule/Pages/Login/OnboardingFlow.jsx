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
  const [step, setStep] = useState('verify') // 'verify' -> 'password' -> 'consent' -> 'activated'
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
