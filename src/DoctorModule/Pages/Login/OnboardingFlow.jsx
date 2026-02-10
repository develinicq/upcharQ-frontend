import React, { useState, useCallback } from 'react';
import Onboarding from './Onboarding';
import Verification from './Verification';
import ActivationSuccess from './ActivationSuccess';

// Simple local-state flow controller that keeps URL stable at /onboarding
export default function OnboardingFlow() {
  // steps: 'verify' -> 'create-password' -> 'activated'
  const [step, setStep] = useState('verify');
  const [flowData, setFlowData] = useState({
    details: {
      user: {
        firstName: 'Milind',
        lastName: 'Chauhan',
        degree: 'MBBS, MD - General Medicine',
        emailId: 'Milindchauhan@gmail.com',
        phone: '+91 91753 67487',
        id: 'DO00123',
        profilePhoto: 'https://randomuser.me/api/portraits/men/32.jpg'
      },
      invitation: {
        type: 'DOCTOR',
        id: 'mock-invitation-id',
        userId: 'mock-user-id',
        hospitalId: 'mock-hospital-id'
      },
      challengeID: {
        mobile: 'mock-mobile-id',
        email: 'mock-email-id'
      }
    },
    password: 'password123',
    confirmPassword: 'password123',
  });

  const handleVerified = useCallback(() => {
    setStep('create-password');
  }, []);

  const handleContinueFromOnboarding = useCallback((payload) => {
    if (payload) setFlowData(prev => ({ ...prev, ...payload }));
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
        userDetails={flowData?.details?.user}
      />
    );
  }

  if (step === 'activated') {
    return <ActivationSuccess onCompleteProfile={handleCompleteProfile} />;
  }

  return <Onboarding onContinue={handleContinueFromOnboarding} />;
}
