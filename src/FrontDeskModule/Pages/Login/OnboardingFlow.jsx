import React, { useState, useCallback } from 'react'
import FDVerification from './Verification'
import FDOnboarding from './Onboarding'
import FDConsent from './Consent'
import FDActivated from './Activated'

// Minimal flow wrapper for FrontDesk onboarding (step 1 only for now)
export default function FDOnboardingFlow(){
  const [step, setStep] = useState('verify')

  const handleVerified = useCallback(()=> setStep('password'), [])
  const handlePasswordContinue = useCallback(()=> setStep('consent'), [])
  const handleConsentContinue = useCallback(()=> setStep('activated'), [])

  if(step==='activated') return <FDActivated />
  if(step==='consent') return <FDConsent onContinue={handleConsentContinue} />
  if(step==='password') return <FDOnboarding onContinue={handlePasswordContinue} />
  return <FDVerification onVerified={handleVerified} />
}
