import React, { useState, useCallback } from 'react';
import Onboarding from './Onboarding';
import Verification from './Verification';
import ActivationSuccess from './ActivationSuccess';

// Simple local-state flow controller that keeps URL stable at /onboarding
export default function OnboardingFlow() {
  // steps: 'create-password' -> 'verify' -> 'activated'
  const [step, setStep] = useState('create-password');
  const [flowData, setFlowData] = useState({
    details: null,
    password: '',
    confirmPassword: '',
  });

  const handleContinueFromOnboarding = useCallback((payload) => {
    if (payload) setFlowData(payload);
    setStep('verify');
  }, []);

  const handleVerified = useCallback(() => {
    setStep('activated');
  }, []);

  const handleCompleteProfile = useCallback(() => {
    // optional: loop back to first step or keep at activated
    setStep('create-password');
  }, []);

  if (step === 'verify') {
    const inv = flowData?.details?.invitation;
    const ch = flowData?.details?.challengeID;
    return ( 
      <Verification
        onVerified={handleVerified}
        invitationId={inv?.id}
        mobileChallengeId={ch?.mobile}
        emailChallengeId={ch?.email}
        password={flowData?.password}
        confirmPassword={flowData?.confirmPassword}
      userId={inv?.userId}
      hospitalId={inv?.hospitalId}
      />
    );
  }

  if (step === 'activated') {
    return <ActivationSuccess onCompleteProfile={handleCompleteProfile} />;
  }

  return <Onboarding onContinue={handleContinueFromOnboarding} />;
}
