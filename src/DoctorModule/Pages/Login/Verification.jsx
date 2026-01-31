import React, { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/Button';
import axios from '../../../lib/axios';

const Box = ({
  value,
  onChange,
  onKeyDown,
  onPaste,
  inputRef,
  placeholder = '–',
}) => (
  <input
    ref={inputRef}
    type="password"
    inputMode="numeric"
    pattern="[0-9]*"
    maxLength={1}
    value={value}
    onChange={onChange}
    onKeyDown={onKeyDown}
    onPaste={onPaste}
    placeholder={placeholder}
  className="w-[30px] h-[40px] box-border flex-none border border-gray-300 bg-white rounded-md text-center text-lg placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500 caret-transparent disabled:opacity-50"
  />
);

export default function Verification({ onVerified, invitationId, mobileChallengeId, emailChallengeId, password, confirmPassword, userId, hospitalId }) {
  const [mobile, setMobile] = useState(Array(6).fill(''));
  const [email, setEmail] = useState(Array(6).fill(''));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const mobileRefs = useRef([...Array(6)].map(() => React.createRef()));
  const emailRefs = useRef([...Array(6)].map(() => React.createRef()));

  const handleChange = (which, idx) => (e) => {
    const v = e.target.value.replace(/\D/g, '').slice(0, 1);
    const set = which === 'mobile' ? setMobile : setEmail;
    const refs = which === 'mobile' ? mobileRefs.current : emailRefs.current;
    set((prev) => {
      const next = [...prev];
      next[idx] = v;
      return next;
    });
    if (v && refs[idx + 1]) refs[idx + 1].current?.focus();
  };

  const handleKeyDown = (which, idx) => (e) => {
    const refs = which === 'mobile' ? mobileRefs.current : emailRefs.current;
    const set = which === 'mobile' ? setMobile : setEmail;
    if (e.key === 'Backspace') {
      e.preventDefault();
      set((prev) => {
        const next = [...prev];
        if (next[idx]) {
          next[idx] = '';
        } else if (refs[idx - 1]) {
          refs[idx - 1].current?.focus();
          next[idx - 1] = '';
        }
        return next;
      });
    } else if (e.key === 'ArrowLeft' && refs[idx - 1]) {
      refs[idx - 1].current?.focus();
    } else if (e.key === 'ArrowRight' && refs[idx + 1]) {
      refs[idx + 1].current?.focus();
    }
  };

  const handlePaste = (which) => (e) => {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!text) return;
    e.preventDefault();
    const set = which === 'mobile' ? setMobile : setEmail;
    const refs = which === 'mobile' ? mobileRefs.current : emailRefs.current;
    set(Array(6).fill('').map((_, i) => text[i] || ''));
    // focus last filled or next empty
    const focusIdx = Math.min(text.length, 5);
    refs[focusIdx]?.current?.focus();
  };

  const isComplete = useMemo(() => mobile.every(Boolean) && email.every(Boolean), [mobile, email]);

  const handleVerify = async () => {
    setError(null);
    if (!isComplete) return;
    if (!invitationId || !mobileChallengeId || !emailChallengeId) {
      setError('Missing verification identifiers. Please restart onboarding.');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        invitationId,
        mobileOtp: mobile.join(''),
        emailOtp: email.join(''),
        password,
        confirmPassword,
        mobileChallengeId,
        emailChallengeId,
      };
          if (import.meta.env.MODE !== 'production') {
            // Dev-only: confirm payload values
            // eslint-disable-next-line no-console
            console.debug('verifyOtp payload', payload);
          }
      // If backend expects these for internal queries, include them; harmless if ignored
      if (userId) payload.userId = userId;
      if (hospitalId) payload.hospitalId = hospitalId;
      const res = await axios.post('/invitations/verifyOtp', payload, {
        headers: {
          'Cache-Control': 'no-cache',
        }
      });
      const data = res?.data;
      if (data?.success) {
        onVerified ? onVerified() : navigate('/activated');
      } else {
        setError(data?.message || 'Verification failed');
      }
    } catch (e) {
      const status = e?.response?.status;
      const msg = e?.response?.data?.message || (status ? `Verification failed (${status})` : 'Verification failed');
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-[474px] border-2 border-blue-200 overflow-hidden">
        {/* Content padded section */}
        <div className="p-6 sm:p-8">
          <div className="text-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Let’s authenticate Your Account</h2>
            <p className="text-gray-500 text-sm">Enter 6-digit OTP sent on your email and mobile number</p>
          </div>

          {/* Mobile OTP */}
          <div className="space-y-2 mb-6">
            <p className="text-center text-sm font-medium text-gray-700">Enter Mobile Verification Code</p>
            <div className="flex items-center justify-center gap-6 ">
              {mobile.map((d, i) => (
                <Box
                  key={i}
                  value={d}
                  inputRef={mobileRefs.current[i]}
                  onChange={handleChange('mobile', i)}
                  onKeyDown={handleKeyDown('mobile', i)}
                  onPaste={i === 0 ? handlePaste('mobile') : undefined}
                />
              ))}
            </div>
            <div className="text-center text-xs text-gray-500">
              Haven't Received Your Code yet? <button className="text-blue-600 hover:underline">Resend</button>
            </div>
          </div>

          {/* Email OTP */}
          <div className="space-y-2 mb-6">
            <p className="text-center text-sm font-medium text-gray-700">Enter Email Verification Code</p>
            <div className="flex items-center justify-center gap-6 flex-nowrap">
              {email.map((d, i) => (
                <Box
                  key={i}
                  value={d}
                  inputRef={emailRefs.current[i]}
                  onChange={handleChange('email', i)}
                  onKeyDown={handleKeyDown('email', i)}
                  onPaste={i === 0 ? handlePaste('email') : undefined}
                />
              ))}
            </div>
            <div className="text-center text-xs text-gray-500">
              Haven't Received Your Code yet? <button className="text-blue-600 hover:underline">Resend</button>
            </div>
          </div>

          {/* Verify button */}
          {error ? (
            <div className="text-red-600 text-sm mb-2 text-center">{error}</div>
          ) : null}
          <Button className="w-full" variant="primary" disabled={!isComplete || submitting} onClick={handleVerify}>
            {submitting ? 'Verifying…' : 'Verify'}
          </Button>
        </div>

        {/* Bottom info bar */}
        <div className="px-4 py-3 border-t border-gray-200 rounded-b-2xl text-xs text-gray-600 flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-4 h-4 rounded-full border border-gray-300 text-gray-500">i</span>
          It may take a minute or two to receive your code.
        </div>
      </div>
    </div>
  );
}
