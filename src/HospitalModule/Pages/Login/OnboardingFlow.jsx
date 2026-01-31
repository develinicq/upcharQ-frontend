import React, { useState, useCallback } from 'react'
import HVerification from './Verification'
import HOnboarding from './Onboarding'
import HConsent from './Consent'
import HActivated from './Activated'

export default function HOnboardingFlow(){
  const [step, setStep] = useState('verify')
  const handleVerified = useCallback(()=> setStep('password'), [])
  const handlePasswordContinue = useCallback(()=> setStep('consent'), [])
  const handleConsentContinue = useCallback(()=> setStep('activated'), [])

  if(step==='activated') return <HActivated />
  if(step==='consent') return <HConsent onContinue={handleConsentContinue} />
  if(step==='password') return <HOnboarding onContinue={handlePasswordContinue} />
  return <HVerification onVerified={handleVerified} />
}
