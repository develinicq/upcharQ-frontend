import React, { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/Button';
import axios from '../../../lib/axios';
import DoctorInfoCard from '../../Components/Login/DoctorInfoCard';
import HelpSupportDrawer from '@/SuperAdmin/components/HelpSupport/HelpSupportDrawer';

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
    className="w-[25px] h-[25px] box-border flex-none border border-gray-300 bg-white rounded-sm text-center text-xs text-gray-600 placeholder-gray-100  outline-none focus:ring-2 focus:ring-blue-500 caret-transparent disabled:opacity-50"
  />
);

export default function Verification({ onVerified, invitationId, mobileChallengeId, emailChallengeId, password, confirmPassword, userId, hospitalId, userDetails }) {
  const [mobile, setMobile] = useState(Array(6).fill(''));
  const [email, setEmail] = useState(Array(6).fill(''));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [isHelpOpen, setIsHelpOpen] = useState(false);

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

    // START: Simulation for frontend-only verification
    setSubmitting(true);

    // Simulate API delay
    setTimeout(() => {
      setSubmitting(false);
      // Proceed to next step
      if (onVerified) {
        onVerified();
      } else {
        navigate('/activated');
      }
    }, 1500);
  };

  const user = userDetails || {};

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-600 to-pink-300 flex flex-col relative overflow-hidden">
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="mb-5 text-center flex flex-col items-center">
          <h1 className="text-xl text-white font-extralight opacity-90 mb-1">Welcome to</h1>
          <div className="flex items-center justify-center gap-1">
            <img
              src="/superAdmin/main_sidebar/logo.svg"
              alt="Upchar-Q"
              className="h-10 brightness-0 invert"
              style={{ filter: 'brightness(0) invert(1)' }}
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg w-full max-w-[350px] border-2 border-blue-200 overflow-hidden">
          {/* Content padded section */}
          <div className="p-3 sm:p-4">
            <div className="mb-3">
              <DoctorInfoCard
                name={user.firstName ? `Dr. ${user.firstName} ${user.lastName || ''}`.trim() : 'Dr. Milind Chauhan'}
                title={user.title || 'General Physician'}
                degree={user.degree || 'MBBS, MD - General Medicine'}
              />
            </div>
            <div className="text-center mb-2">
              <h2 className="text-lg font-bold text-gray-700">Let’s authenticate Your Account</h2>
              <p className="text-gray-500 text-[10.5px]">Enter 6-digit OTP sent on your email and mobile number</p>
            </div>

            {/* Mobile OTP */}
            <div className="space-y-1 mb-3">
              <p className="text-center text-[12px] font-medium text-gray-700">Enter Mobile Verification Code</p>
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
              <div className="text-center text-[10px] text-gray-500 mt-2 font-normal">
                Haven't Received Your Code yet? <button className="text-blue-600 hover:underline">Resend</button>
              </div>
            </div>

            {/* Email OTP */}
            <div className="space-y-1 mb-3">
              <p className="text-center text-[12px] font-medium text-gray-700">Enter Email Verification Code</p>
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
              <div className="text-center text-[10px] text-gray-500 mt-2 font-normal">
                Haven't Received Your Code yet? <button className="text-blue-600 hover:underline">Resend</button>
              </div>
            </div>

            {/* Verify button */}
            {error ? (
              <div className="text-red-600 text-sm mb-1 text-center">{error}</div>
            ) : null}
            <Button
              className={`w-full !h-[25px] !p-0 text-[10px] !font-normal flex items-center justify-center !gap-1 transition-colors ${isComplete
                ? '!bg-blue-600 !text-white hover:!bg-blue-700'
                : 'bg-fuchsia-100 !text-gray-300'
                }`}
              variant="primary"
              disabled={!isComplete || submitting}
              onClick={handleVerify}
            >
              <img
                src="/tick.svg"
                alt=""
                className={`w-3.5 h-4 ${isComplete ? 'brightness-0 invert' : 'opacity-40'}`}
              />
              {submitting ? 'Verifying…' : 'Verify'}
            </Button>
          </div>

          {/* Bottom info bar */}
          <div className="px-3 py-1 border-t border-gray-300 rounded-b-2xl text-[9px] text-gray-600 flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-3 h-3 rounded-full border border-gray-800 text-gray-500">i</span>
            It may take a minute or two to receive your code.
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-8 py-6 flex justify-between items-center w-full z-10 text-white/80">
        <button
          className="flex items-center gap-2 hover:text-white transition-colors"
          onClick={() => setIsHelpOpen(true)}
        >
          <span className="w-5 h-5 flex items-center justify-center">
            <img src="/Help.svg" alt="Help" className="w-full h-full opacity-80 brightness-0 invert" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'block'; }} />
            <span className="hidden w-3 h-3 rounded-full border border-current items-center justify-center text-[10px]" style={{ display: 'none' }}>?</span>
          </span>
          <span className="text-[11px] font-normal">Help & Support</span>
          <svg className="w-3 h-3 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </button>
        <span className="text-[8px] opacity-80">© 2025, Bloomevera Solutions LLP. All Rights Reserved.</span>
      </div>

      <HelpSupportDrawer isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </div>
  );
}
