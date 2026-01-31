import React, { useState, useCallback } from 'react'
import HFDVerification from './Verification'
import HFDOnboarding from './Onboarding'
import HFDConsent from './Consent'
import HFDActivated from './Activated'

export default function HFDOnboardingFlow(){
  const [step, setStep] = useState('verify')
  const handleVerified = useCallback(()=> setStep('password'), [])
  const handlePasswordContinue = useCallback(()=> setStep('consent'), [])
  const handleConsentContinue = useCallback(()=> setStep('activated'), [])

  if(step==='activated') return <HFDActivated />
  if(step==='consent') return <HFDConsent onContinue={handleConsentContinue} />
  if(step==='password') return <HFDOnboarding onContinue={handlePasswordContinue} />
  return <HFDVerification onVerified={handleVerified} />
}
