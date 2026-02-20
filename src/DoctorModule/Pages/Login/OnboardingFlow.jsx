import React, { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Onboarding from './Onboarding';
import Verification from './Verification';
import ActivationSuccess from './ActivationSuccess';
import axios from '../../../lib/axios';

// Professional flow controller that handles real invitation IDs
export default function OnboardingFlow() {
  const [searchParams] = useSearchParams();
  const code = searchParams.get('code');

  // steps: 'loading' -> 'verify' -> 'create-password' -> 'activated'
  const [step, setStep] = useState(code ? 'loading' : 'restricted');
  const [loading, setLoading] = useState(!!code);
  const [error, setError] = useState(null);

  const [flowData, setFlowData] = useState({
    details: {
      user: null,
      invitation: null,
      challengeID: null
    },
    password: '',
    confirmPassword: '',
    mobileOtp: '',
    emailOtp: '',
  });

  // Trace rendering

  // Fetch invitation details if code is present
  useEffect(() => {
    if (!code) return;

    const fetchInvitation = async () => {
      try {
        setLoading(true);
        setError(null);
        // Correct endpoint without double /api prefix (axios base URL handles /api)
        const response = await axios.get(`/invitations/checkInvitation`, {
          params: { code }
        });

        const { user, invitation, challengeID } = response.data.data;

        if (!user || !invitation || !challengeID) {
          throw new Error('Incomplete invitation data received.');
        }

        // Redirect if it is ANY HOSPITAL invitation
        const type = (invitation.type || '').toUpperCase();
        if (type.includes('HOSPITAL')) {
          window.location.href = `/hospital/onboarding?code=${code}`;
          return;
        }

        setFlowData(prev => ({
          ...prev,
          details: {
            user: {
              ...user,
              degree: user.doctor?.education?.[0]?.degree || '',
              title: user.doctor?.specialties?.[0]?.specialty?.name || 'General Physician'
            },
            invitation,
            challengeID
          }
        }));
        setStep('verify');
      } catch (err) {
        console.error('Failed to check invitation:', err);
        const errMsg = err.response?.data?.message || err.message || 'Invalid or expired invitation link';
        setError(`${errMsg} (Code: ${code})`);
      } finally {
        setLoading(false);
      }
    };

    fetchInvitation();
  }, [code]);

  const handleVerified = useCallback((payload) => {
    // payload should contain { mobileOtp, emailOtp }
    if (payload) {
      setFlowData(prev => ({
        ...prev,
        ...payload
      }));
    }
    setStep('create-password');
  }, []);

  const handleContinueFromOnboarding = useCallback(async (payload) => {
    // payload from Onboarding contains { password, confirmPassword }
    if (payload) {
      // First update state
      setFlowData(prev => ({ ...prev, ...payload }));

      // Perform final verification with backend
      try {
        setLoading(true);
        

        await axios.post('/invitations/verifyOtp', {
          invitationId: flowData.details.invitation.id,
          mobileOtp: flowData.mobileOtp, // from previous step
          emailOtp: flowData.emailOtp,   // from previous step
          password: payload.password,
          confirmPassword: payload.confirmPassword,
          mobileChallengeId: flowData.details.challengeID.mobile,
          emailChallengeId: flowData.details.challengeID.email
        });

        // Verification successful
        setStep('activated');
      } catch (err) {
        console.error('Verification failed:', err);
        const backendMsg = err.response?.data?.message;
        const fallbackMsg = 'Verification failed. Please try again.';
        setError(backendMsg || fallbackMsg);
        // If failed, user might want to retry password or OTP? 
        // Currently we show error page, but ideally allow retry.
        // For simplicity, we error out, as invalid OTP means restarting flow typically or fixing OTP.
        // But here we are at Password step. 
        // If password mismatch (handled by frontend mostly) or OTP mismatch.
      } finally {
        setLoading(false);
      }
    }
  }, [flowData]);

  const handleCompleteProfile = useCallback(() => {
    setStep('create-password');
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-600 to-pink-300 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading invitation details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-600 to-pink-300 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Oops!</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.href = '/'}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  if (step === 'restricted') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-600 to-pink-300 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full text-center">
          <div className="text-amber-500 text-5xl mb-4">🔐</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Restricted</h2>
          <p className="text-gray-600 mb-6">
            Please use the registration link sent to your email to complete your onboarding process.
          </p>
          <button
            onClick={() => window.location.href = '/signin'}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Go to Sign In
          </button>
        </div>
      </div>
    );
  }

  if (step === 'verify') {
    const inv = flowData?.details?.invitation;
    const ch = flowData?.details?.challengeID;
    return (
      <Verification
        onVerified={handleVerified}
        invitationId={inv?.id || code}
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
    return <ActivationSuccess onCompleteProfile={handleCompleteProfile} doctorId={flowData?.details?.user?.id} />;
  }

  return <Onboarding
    onContinue={handleContinueFromOnboarding}
    details={flowData.details} // Pass pre-fetched details to avoid re-fetch
  />;
}
