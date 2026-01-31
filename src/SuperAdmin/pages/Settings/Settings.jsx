import React, { useState, useRef, useEffect } from 'react'
import InputWithMeta from '../../../components/GeneralDrawer/InputWithMeta'
import PasswordRequirements from '../../../components/FormItems/PasswordRequirements'
import PopupSmall from '../../../components/PopupSmall'
import DetailPopup from '../../../components/DetailPopup'
import UniversalLoader from '../../../components/UniversalLoader'
import { ChevronDown, Phone, RefreshCw } from 'lucide-react'
import useSuperAdminAuthStore from '../../../store/useSuperAdminAuthStore'
import useToastStore from '../../../store/useToastStore'
const phone = '/phone2.png'
const mail = '/mail.png'


const Settings = () => {
  const { user, requestVerificationOtp, verifyExistingOtp, sendNewOtp, verifyNewContact, requestPasswordChange, confirmPasswordChange } = useSuperAdminAuthStore();
  const { addToast } = useToastStore();
  const [mobile, setMobile] = useState(user?.phone ? `+91${user.phone}` : '+919175367487')
  const [email, setEmail] = useState(user?.emailId || 'ketanpatni02@gmail.com')

  // Update effect if user data arrives after mount
  useEffect(() => {
    if (user?.phone) setMobile(`+91${user.phone}`);
    if (user?.emailId) setEmail(user.emailId);
  }, [user]);

  const [currentPwd, setCurrentPwd] = useState('')
  const [newPwd, setNewPwd] = useState('')
  const [confirmPwd, setConfirmPwd] = useState('')
  const [showMobilePopup, setShowMobilePopup] = useState(false)
  const [showVerifyPopup, setShowVerifyPopup] = useState(false)
  const [showAddMobilePopup, setShowAddMobilePopup] = useState(false)
  const [showNewMobileVerifyPopup, setShowNewMobileVerifyPopup] = useState(false)
  const [newMobileNumber, setNewMobileNumber] = useState('')

  // Loading States
  const [isRequestingMobileOtp, setIsRequestingMobileOtp] = useState(false)
  const [isRequestingEmailOtp, setIsRequestingEmailOtp] = useState(false)
  const [isRequestingPasswordChange, setIsRequestingPasswordChange] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [verificationData, setVerificationData] = useState(null)

  // OTP State
  const [otp, setOtp] = useState(new Array(6).fill(""))
  const [newOtp, setNewOtp] = useState(new Array(6).fill("")) // For new mobile verification
  const otpInputRefs = useRef([])
  const otpNewInputRefs = useRef([])

  const handleOtpChange = (element, index) => {
    if (isNaN(element.value)) return false;
    setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);
    if (element.nextSibling && element.value) {
      element.nextSibling.focus();
    }
  };

  const handleNewOtpChange = (element, index) => {
    if (isNaN(element.value)) return false;
    setNewOtp([...newOtp.map((d, idx) => (idx === index ? element.value : d))]);
    if (element.nextSibling && element.value) {
      element.nextSibling.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1].focus();
    }
  };

  const handleNewKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !newOtp[index] && index > 0) {
      otpNewInputRefs.current[index - 1].focus();
    }
  };

  const verifyOtp = async () => {
    setIsVerifying(true);
    try {
      const payload = { otp: otp.join('') };
      const res = await verifyExistingOtp(payload);
      if (res?.success) {
        addToast({ message: res.message || 'Verification successful', type: 'success' });
        setShowVerifyPopup(false);
        setOtp(new Array(6).fill(""));
        setShowAddMobilePopup(true);
      } else {
        addToast({ message: res.message || 'Invalid OTP', type: 'error' });
      }
    } catch (error) {
      addToast({ message: error.message || 'Verification failed', type: 'error' });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleMobileRequestOtp = async (isResend = false) => {
    if (isResend) {
      setResending(prev => ({ ...prev, mobileResend: true }));
    } else {
      setIsRequestingMobileOtp(true);
    }
    try {
      const res = await requestVerificationOtp('mobile');
      if (res?.success) {
        if (isResend) {
          addToast({ message: "OTP Resent successfully", type: "success" });
        }
        setVerificationData(res.data);
        setShowMobilePopup(false);
        setShowVerifyPopup(true);
      }
    } catch (error) {
      addToast({ message: error.message || 'Failed to send OTP', type: 'error' });
    } finally {
      setIsRequestingMobileOtp(false);
      setResending(prev => ({ ...prev, mobileResend: false }));
    }
  };

  const handleAddMobileVerify = async (isResend = false) => {
    if (isResend) {
      setResending(prev => ({ ...prev, newMobileResend: true }));
    } else {
      setIsVerifying(true);
    }
    try {
      const payload = { type: 'mobile', newContact: newMobileNumber };
      const res = await sendNewOtp(payload);
      if (res?.success) {
        if (isResend) {
          addToast({ message: "OTP Resent successfully", type: "success" });
        } else {
          addToast({ message: res.message || 'OTP sent to new mobile number', type: 'success' });
        }
        setVerificationData(res.data);
        setShowAddMobilePopup(false);
        setShowNewMobileVerifyPopup(true);
        setNewOtp(new Array(6).fill(""));
      }
    } catch (error) {
      addToast({ message: error.message || 'Failed to send OTP', type: 'error' });
    } finally {
      setIsVerifying(false);
      setResending(prev => ({ ...prev, newMobileResend: false }));
    }
  }

  const handleFinalVerify = async () => {
    setIsVerifying(true);
    try {
      const payload = { otp: newOtp.join('') };
      const res = await verifyNewContact(payload);
      if (res?.success) {
        addToast({ message: res.message || 'Mobile number updated successfully!', type: 'success' });
        setShowNewMobileVerifyPopup(false);
        setNewMobileNumber('');
      } else {
        addToast({ message: res.message || 'Invalid OTP', type: 'error' });
      }
    } catch (error) {
      addToast({ message: error.message || 'Verification failed', type: 'error' });
    } finally {
      setIsVerifying(false);
    }
  }

  const isOtpFilled = otp.every(val => val !== "");
  const isNewOtpFilled = newOtp.every(val => val !== "");

  // Email Flow Logic
  const [showEmailPopup, setShowEmailPopup] = useState(false)
  const [showEmailAuthPopup, setShowEmailAuthPopup] = useState(false)
  const [showAddEmailPopup, setShowAddEmailPopup] = useState(false)
  const [showNewEmailVerifyPopup, setShowNewEmailVerifyPopup] = useState(false)
  const [showPasswordAuthPopup, setShowPasswordAuthPopup] = useState(false)
  const [newEmailAddress, setNewEmailAddress] = useState('')

  const [otpAuthMobile, setOtpAuthMobile] = useState(new Array(6).fill(""))
  const [otpAuthEmail, setOtpAuthEmail] = useState(new Array(6).fill(""))
  const [otpVerifyNewEmail, setOtpVerifyNewEmail] = useState(new Array(6).fill(""))


  // Refs
  const otpAuthMobileRefs = useRef([])
  const otpAuthEmailRefs = useRef([])
  const otpVerifyNewEmailRefs = useRef([])

  // Handlers
  const createOtpHandler = (setFunc, curOtp, refs) => (element, index) => {
    if (isNaN(element.value)) return false;
    setFunc([...curOtp.map((d, idx) => (idx === index ? element.value : d))]);
    if (element.nextSibling && element.value) {
      element.nextSibling.focus();
    }
  };
  const maskPhone = (num) => {
    if (!num) return "*******487";
    const s = String(num);
    if (s.length <= 4) return s;
    return "*".repeat(s.length - 4) + s.slice(-4);
  };

  const maskEmail = (email) => {
    if (!email) return "******@*****";
    const [name, domain] = email.split("@");
    const visible = name.slice(0, 6);
    return visible + "*".repeat(Math.max(0, name.length - 6)) + "@" + "*".repeat(domain.length);
  };

  // Timer States for Resend OTP
  const [resendTimers, setResendTimers] = useState({
    mobileResend: 0,
    emailResend: 0,
    newMobileResend: 0,
    newEmailResend: 0,
    authMobileResend: 0, // For dual OTP popups
    authEmailResend: 0,  // For dual OTP popups
  });

  const [resending, setResending] = useState({
    mobileResend: false,
    emailResend: false,
    newMobileResend: false,
    newEmailResend: false,
    authMobileResend: false,
    authEmailResend: false,
  });

  const startTimer = (timerKey) => {
    setResendTimers(prev => ({ ...prev, [timerKey]: 60 }));
    const interval = setInterval(() => {
      setResendTimers(prev => {
        if (prev[timerKey] <= 1) {
          clearInterval(interval);
          return { ...prev, [timerKey]: 0 };
        }
        return { ...prev, [timerKey]: prev[timerKey] - 1 };
      });
    }, 1000);
  };


  const createKeyDownHandler = (curOtp, refs) => (e, index) => {
    if (e.key === 'Backspace' && !curOtp[index] && index > 0) {
      refs.current[index - 1].focus();
    }
  };

  const verifyEmailAuth = async () => {
    setIsVerifying(true);
    try {
      const payload = {
        mobileOtp: otpAuthMobile.join(''),
        emailOtp: otpAuthEmail.join('')
      };
      const res = await verifyExistingOtp(payload);
      if (res?.success) {
        addToast({ message: res.message || 'Verification successful', type: 'success' });
        setShowEmailAuthPopup(false);
        setOtpAuthMobile(new Array(6).fill(""));
        setOtpAuthEmail(new Array(6).fill(""));
        setShowAddEmailPopup(true);
      } else {
        addToast({ message: res.message || 'Invalid OTP', type: 'error' });
      }
    } catch (error) {
      addToast({ message: error.message || 'Verification failed', type: 'error' });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleEmailRequestOtp = async (isResend = false, resendKey = 'authMobileResend') => {
    if (isResend) {
      setResending(prev => ({ ...prev, [resendKey]: true }));
    } else {
      setIsRequestingEmailOtp(true);
    }
    try {
      const res = await requestVerificationOtp('email');
      if (res?.success) {
        if (isResend) {
          addToast({ message: "OTP Resent successfully", type: "success" });
        } else {
          addToast({ message: res.message || 'OTP sent successfully', type: 'success' });
        }
        setVerificationData(res.data);
        setShowEmailPopup(false);
        setShowEmailAuthPopup(true);
      }
    } catch (error) {
      addToast({ message: error.message || 'Failed to send OTP', type: 'error' });
    } finally {
      setIsRequestingEmailOtp(false);
      if (isResend) {
        setResending(prev => ({ ...prev, [resendKey]: false }));
      }
    }
  };

  const handleAddEmailVerify = async (isResend = false) => {
    if (isResend) {
      setResending(prev => ({ ...prev, newEmailResend: true }));
    } else {
      setIsVerifying(true);
    }
    try {
      const payload = { type: 'email', newContact: newEmailAddress };
      const res = await sendNewOtp(payload);
      if (res?.success) {
        if (isResend) {
          addToast({ message: "OTP Resent successfully", type: "success" });
        } else {
          addToast({ message: res.message || 'OTP sent to new email address', type: 'success' });
        }
        setVerificationData(res.data);
        setShowAddEmailPopup(false);
        setShowNewEmailVerifyPopup(true);
        setOtpVerifyNewEmail(new Array(6).fill(""));
      }
    } catch (error) {
      addToast({ message: error.message || 'Failed to send OTP', type: 'error' });
    } finally {
      setIsVerifying(false);
      setResending(prev => ({ ...prev, newEmailResend: false }));
    }
  }

  const handleFinalEmailVerify = async () => {
    setIsVerifying(true);
    try {
      const payload = { otp: otpVerifyNewEmail.join('') };
      const res = await verifyNewContact(payload);
      if (res?.success) {
        addToast({ message: res.message || 'Email ID updated successfully!', type: 'success' });
        setShowNewEmailVerifyPopup(false);
        setNewEmailAddress('');
      } else {
        addToast({ message: res.message || 'Invalid OTP', type: 'error' });
      }
    } catch (error) {
      addToast({ message: error.message || 'Verification failed', type: 'error' });
    } finally {
      setIsVerifying(false);
    }
  }

  const handlePasswordVerifyClick = async (isResend = false, resendKey = 'authMobileResend') => {
    if (isResend) {
      setResending(prev => ({ ...prev, [resendKey]: true }));
    } else {
      setIsRequestingPasswordChange(true);
    }
    try {
      const res = await requestPasswordChange(currentPwd);
      if (res?.success) {
        if (isResend) {
          addToast({ message: "OTP Resent successfully", type: "success" });
        } else {
          setVerificationData(res.data);
          setOtpAuthMobile(new Array(6).fill(""));
          setOtpAuthEmail(new Array(6).fill(""));
          setShowPasswordAuthPopup(true);
        }
      }
    } catch (error) {
      addToast({ message: error.message || 'Failed to request password change', type: 'error' });
    } finally {
      setIsRequestingPasswordChange(false);
      if (isResend) {
        setResending(prev => ({ ...prev, [resendKey]: false }));
      }
    }
  }

  const handlePasswordAuthVerify = async () => {
    setIsVerifying(true);
    try {
      const payload = {
        mobileOtp: otpAuthMobile.join(''),
        emailOtp: otpAuthEmail.join(''),
        newPassword: newPwd,
        confirmPassword: confirmPwd
      };
      const res = await confirmPasswordChange(payload);
      if (res?.success) {
        addToast({ message: res.message || 'Password updated successfully!', type: 'success' });
        setShowPasswordAuthPopup(false);
        setCurrentPwd('');
        setNewPwd('');
        setConfirmPwd('');
        setOtpAuthMobile(new Array(6).fill(""));
        setOtpAuthEmail(new Array(6).fill(""));
      } else {
        addToast({ message: res.message || 'Failed to update password', type: 'error' });
      }
    } catch (error) {
      addToast({ message: error.message || 'Verification failed', type: 'error' });
    } finally {
      setIsVerifying(false);
    }
  }

  const isAuthMobileFilled = otpAuthMobile.every(v => v !== "");
  const isAuthEmailFilled = otpAuthEmail.every(v => v !== "");
  const isEmailAuthValid = isAuthMobileFilled && isAuthEmailFilled;
  const isNewEmailFilled = otpVerifyNewEmail.every(v => v !== "");

  // Basic Validation for inputs
  const isNewMobileValid = /^\d{10}$/.test(newMobileNumber);
  const isNewEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmailAddress);

  // Password Validation
  const pwdRequirements = [
    newPwd.length >= 8 && newPwd.length <= 15,
    /[A-Z]/.test(newPwd),
    /[a-z]/.test(newPwd),
    /[0-9]/.test(newPwd),
    /[!@#$%^&*]/.test(newPwd)
  ];
  const allPwdRequirementsMet = pwdRequirements.every(Boolean);
  const passwordsMatch = newPwd === confirmPwd;
  const isPasswordChangeValid = currentPwd && allPwdRequirementsMet && passwordsMatch;

  return (
    <div className="p-4 bg-secondary-grey50">
      <div className="max-w-[382px] flex flex-col gap-3.5">
        {/* Mobile number */}
        <div className='flex flex-col gap-1'>
          <label className={`text-sm text-secondary-grey150 flex items-center gap-1`}>
            Mobile Number
            <div className="bg-red-500 w-1 h-1 rounded-full"></div>
          </label>
          <div className="flex bg-secondary-grey50 items-center gap-2 border border-secondary-grey150/60 rounded-sm pr-1">
            <input
              value={mobile}
              disabled
              onChange={(e) => setMobile(e.target.value)}
              className="flex-1 h-8 px-2 text-sm outline-none text-secondary-grey300 bg-secondary-grey50"
            />
            <button
              type="button"
              onClick={() => setShowMobilePopup(true)}
              className="h-6 px-[6px] rounded-sm border border-blue-primary150 bg-blue-primary100 hover:bg-blue-primary250 hover:border-blue-primary250 hover:text-white text-blue-primary250 text-[12px] font-medium transition-colors"
            >
              Change
            </button>
          </div>
        </div>

        {/* Mobile Change Confirmation Popup */}
        <PopupSmall
          isOpen={showMobilePopup}
          icon={phone}
          text="Are you sure you want to change super admin mobile number?"
          buttons={[
            {
              label: "Cancel",
              variant: "grey",
              onClick: () => setShowMobilePopup(false)
            },
            {
              label: "Yes",
              variant: "blue",
              loading: isRequestingMobileOtp,
              onClick: () => handleMobileRequestOtp(false)
            }
          ]}
        />

        {/* OTP Verification Popup */}
        <DetailPopup
          isOpen={showVerifyPopup}
          heading="Let’s authenticate Your Account"
          subHeading={
            <>
              For your security, please verify your existing account information. <br />
              <span className="text-secondary-grey400">OTP sent to <span className="font-medium">+91 {verificationData?.contact || mobile}</span></span>
            </>
          }
          onCancel={() => setShowVerifyPopup(false)}
          onVerify={verifyOtp}
          isVerifying={isVerifying}
          isVerifyDisabled={!isOtpFilled}
        >
          <div className="flex flex-col items-center gap-2">
            <label className="text-sm font-medium text-gray-700">
              Enter Mobile Verification Code
            </label>
            <div className="flex gap-3 justify-center">
              {otp.map((data, index) => (
                <input
                  className=" h-[40px] p-2 w-[40px] border border-secondary-grey150 rounded-md text-center text-base focus:border-blue-primary150 focus:ring-1 focus:ring-blue-primary150 outline-none transition-all"
                  type="password"
                  name="otp"
                  maxLength="1"
                  key={index}
                  value={data}
                  ref={el => otpInputRefs.current[index] = el}
                  onChange={e => handleOtpChange(e.target, index)}
                  onKeyDown={e => handleKeyDown(e, index)}
                  onFocus={e => e.target.select()}
                />
              ))}
            </div>
            <div className="text-xs text-secondary-grey200">
              Haven’t Received Your Code yet?{" "}
              {resending.mobileResend ? (
                <span className="text-sm text-secondary-grey300">Resending...</span>
              ) : resendTimers.mobileResend > 0 ? (
                <span className="text-sm text-secondary-grey300">Resend after {resendTimers.mobileResend}s</span>
              ) : (
                <button
                  onClick={() => { handleMobileRequestOtp(true); startTimer('mobileResend'); }}
                  className="text-sm text-blue-primary250 hover:underline"
                >
                  Resend
                </button>
              )}
            </div>
          </div>
        </DetailPopup>

        {/* Add Mobile Number Popup */}
        <DetailPopup
          isOpen={showAddMobilePopup}
          heading="Add Mobile Number"
          subHeading="Enter a new mobile number, and we will send an OTP for verification."
          onCancel={() => setShowAddMobilePopup(false)}
          onVerify={handleAddMobileVerify}
          isVerifying={isVerifying}
          isVerifyDisabled={!isNewMobileValid}
          verifyBtnText="Confirm & Verify"
        >
          <div className="flex items-center border border-secondary-grey300/50 rounded-md h-12 w-full max-w-[400px] mx-auto overflow-hidden">
            <div className="flex items-center gap-1 px-3 border-r border-secondary-grey100/50 h-full text-secondary-grey400 text-[18px]">
              +91 <ChevronDown size={18} className='ml-1' />
            </div>
            <input
              type="text"
              placeholder="Mobile Number"
              className="flex-1 px-3 outline-none text-gray-700 h-full bg-white"
              value={newMobileNumber}
              onChange={(e) => setNewMobileNumber(e.target.value)}
            />
          </div>
        </DetailPopup>

        {/* Verify New Account Popup */}
        <DetailPopup
          isOpen={showNewMobileVerifyPopup}
          heading="Verify New Account"
          subHeading={
            <>
              Please Verify your new  account information. <br />
              <span className="text-secondary-grey400">OTP sent to</span>
              <span className="font-medium">+91 {verificationData?.contact || newMobileNumber}</span>
            </>
          }
          onCancel={() => setShowNewMobileVerifyPopup(false)}
          onVerify={handleFinalVerify}
          isVerifying={isVerifying}
          isVerifyDisabled={!isNewOtpFilled}
        >
          <div className="flex flex-col items-center gap-2">
            <label className="text-sm font-medium text-secondary-grey400">
              Enter Mobile Verification Code
            </label>
            <div className="flex gap-3 justify-center">
              {newOtp.map((data, index) => (
                <input
                  className=" h-[40px] p-2 w-[40px] border border-secondary-grey150 rounded-md text-center text-base focus:border-blue-primary150 focus:ring-1 focus:ring-blue-primary150 outline-none transition-all"
                  type="password"
                  name="newOtp"
                  maxLength="1"
                  key={index}
                  value={data}
                  ref={el => otpNewInputRefs.current[index] = el}
                  onChange={e => handleNewOtpChange(e.target, index)}
                  onKeyDown={e => handleNewKeyDown(e, index)}
                  onFocus={e => e.target.select()}
                />
              ))}
            </div>
            <div className="text-xs text-secondary-grey200">
              Haven’t Received Your Code yet?{" "}
              {resending.newMobileResend ? (
                <span className="text-sm text-secondary-grey300">Resending...</span>
              ) : resendTimers.newMobileResend > 0 ? (
                <span className="text-sm text-secondary-grey300">Resend after {resendTimers.newMobileResend}s</span>
              ) : (
                <button
                  onClick={() => { handleAddMobileVerify(true); startTimer('newMobileResend'); }}
                  className="text-sm text-blue-primary250 hover:underline"
                >
                  Resend
                </button>
              )}
            </div>
          </div>
        </DetailPopup>

        {/* Email Change Flow Popups */}
        <PopupSmall
          isOpen={showEmailPopup}
          icon={mail}
          text="Are you sure you want to change super admin Email ID?"
          buttons={[
            { label: "Cancel", variant: "grey", onClick: () => setShowEmailPopup(false) },
            {
              label: "Yes",
              variant: "blue",
              loading: isRequestingEmailOtp,
              onClick: () => handleEmailRequestOtp(false)
            }
          ]}
        />

        <DetailPopup
          isOpen={showEmailAuthPopup}
          heading="Let’s authenticate Your Account"
          subHeading={
            <>
              For your security, please verify your existing account information. <br />
              <span className="text-secondary-grey300">
                Enter 6-digit OTP sent on your mobile number
              </span>
              <span>({maskPhone(verificationData?.mobile)})</span>
              <span> and email </span>
              <span>({maskEmail(verificationData?.email)})</span>
            </>
          }
          onCancel={() => setShowEmailAuthPopup(false)}
          onVerify={verifyEmailAuth}
          isVerifying={isVerifying}
          isVerifyDisabled={!isEmailAuthValid}
        >
          <div className="flex flex-col items-center gap-4">
            {/* Mobile OTP */}
            <div className="flex flex-col items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Enter Mobile Verification Code</label>
              <div className="flex gap-3 justify-center">
                {otpAuthMobile.map((data, index) => (
                  <input
                    className="h-[40px] p-2 w-[40px] border border-secondary-grey150 rounded-md text-center text-base focus:border-blue-primary150 focus:ring-1 focus:ring-blue-primary150 outline-none transition-all"
                    type="password" maxLength="1" key={index} value={data}
                    ref={el => otpAuthMobileRefs.current[index] = el}
                    onChange={e => createOtpHandler(setOtpAuthMobile, otpAuthMobile, otpAuthMobileRefs)(e.target, index)}
                    onKeyDown={e => createKeyDownHandler(otpAuthMobile, otpAuthMobileRefs)(e, index)}
                    onFocus={e => e.target.select()}
                  />
                ))}
              </div>
              <div className="text-xs text-secondary-grey200">
                Haven’t Received Your Code yet?{" "}
                {resending.authMobileResend ? (
                  <span className="text-sm text-secondary-grey300">Resending...</span>
                ) : resendTimers.authMobileResend > 0 ? (
                  <span className="text-sm text-secondary-grey300">Resend after {resendTimers.authMobileResend}s</span>
                ) : (
                  <button
                    onClick={() => { handleEmailRequestOtp(true, 'authMobileResend'); startTimer('authMobileResend'); }}
                    className="text-sm text-blue-primary250 hover:underline"
                  >
                    Resend
                  </button>
                )}
              </div>
            </div>
            {/* Email OTP */}
            <div className="flex flex-col items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Enter Email Verification Code</label>
              <div className="flex gap-3 justify-center">
                {otpAuthEmail.map((data, index) => (
                  <input
                    className="h-[40px] p-2 w-[40px] border border-secondary-grey150 rounded-md text-center text-base focus:border-blue-primary150 focus:ring-1 focus:ring-blue-primary150 outline-none transition-all"
                    type="password" maxLength="1" key={index} value={data}
                    ref={el => otpAuthEmailRefs.current[index] = el}
                    onChange={e => createOtpHandler(setOtpAuthEmail, otpAuthEmail, otpAuthEmailRefs)(e.target, index)}
                    onKeyDown={e => createKeyDownHandler(otpAuthEmail, otpAuthEmailRefs)(e, index)}
                    onFocus={e => e.target.select()}
                  />
                ))}
              </div>
              <div className="text-xs text-secondary-grey200">
                Haven’t Received Your Code yet?{" "}
                {resending.authEmailResend ? (
                  <span className="text-sm text-secondary-grey300">Resending...</span>
                ) : resendTimers.authEmailResend > 0 ? (
                  <span className="text-sm text-secondary-grey300">Resend after {resendTimers.authEmailResend}s</span>
                ) : (
                  <button
                    onClick={() => { handleEmailRequestOtp(true, 'authEmailResend'); startTimer('authEmailResend'); }}
                    className="text-sm text-blue-primary250 hover:underline"
                  >
                    Resend
                  </button>
                )}
              </div>
            </div>
          </div>
        </DetailPopup>

        <DetailPopup
          isOpen={showAddEmailPopup}
          heading="Add New Email"
          subHeading="Enter a new email, and we will send an OTP for verification."
          onCancel={() => setShowAddEmailPopup(false)}
          onVerify={() => handleAddEmailVerify(false)}
          isVerifying={isVerifying}
          isVerifyDisabled={!isNewEmailValid}
          verifyBtnText="Confirm & Verify"
        >
          <div className="flex items-center border border-secondary-grey300/50 rounded-md h-12 w-full max-w-[400px] mx-auto overflow-hidden px-3 bg-white">
            <input
              type="email"
              placeholder="Enter Email"
              className="flex-1 outline-none text-gray-700 h-full"
              value={newEmailAddress}
              onChange={(e) => setNewEmailAddress(e.target.value)}
            />
          </div>
        </DetailPopup>

        <DetailPopup
          isOpen={showNewEmailVerifyPopup}
          heading="Verify New Account"
          subHeading={
            <>
              Please Verify your new account information. <br />
              <span className="text-secondary-grey400">OTP sent to</span>
              <span className="font-medium">{verificationData?.contact || newEmailAddress}</span>
            </>
          }
          onCancel={() => setShowNewEmailVerifyPopup(false)}
          onVerify={handleFinalEmailVerify}
          isVerifying={isVerifying}
          isVerifyDisabled={!isNewEmailFilled}
        >
          <div className="flex flex-col items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Enter Email Verification Code</label>
            <div className="flex gap-3 justify-center">
              {otpVerifyNewEmail.map((data, index) => (
                <input
                  className="h-[40px] p-2 w-[40px] border border-secondary-grey150 rounded-md text-center text-base focus:border-blue-primary150 focus:ring-1 focus:ring-blue-primary150 outline-none transition-all"
                  type="password" maxLength="1" key={index} value={data}
                  ref={el => otpVerifyNewEmailRefs.current[index] = el}
                  onChange={e => createOtpHandler(setOtpVerifyNewEmail, otpVerifyNewEmail, otpVerifyNewEmailRefs)(e.target, index)}
                  onKeyDown={e => createKeyDownHandler(otpVerifyNewEmail, otpVerifyNewEmailRefs)(e, index)}
                  onFocus={e => e.target.select()}
                />
              ))}
            </div>
            <div className="text-xs text-secondary-grey200 mt-2">
              Haven’t Received Your Code yet?{" "}
              {resending.newEmailResend ? (
                <span className="text-sm text-secondary-grey300">Resending...</span>
              ) : resendTimers.newEmailResend > 0 ? (
                <span className="text-sm text-secondary-grey300">Resend after {resendTimers.newEmailResend}s</span>
              ) : (
                <button
                  onClick={() => { handleAddEmailVerify(true); startTimer('newEmailResend'); }}
                  className="text-sm text-blue-primary250 hover:underline"
                >
                  Resend
                </button>
              )}
            </div>
          </div>
        </DetailPopup>

        {/* Email ID */}
        <div className='flex flex-col gap-1'>
          <label className={`text-sm text-secondary-grey150 flex items-center gap-1`}>
            Email ID
            <div className="bg-red-500 w-1 h-1 rounded-full"></div>
          </label>
          <div className="flex bg-secondary-grey50 items-center gap-2 border border-secondary-grey150/60 rounded-sm pr-1">
            <input
              type="email"
              value={email}
              disabled
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 h-8 px-2 text-sm outline-none bg-secondary-grey50 text-secondary-grey300"
            />
            <button
              type="button"
              onClick={() => setShowEmailPopup(true)}
              className="h-6 px-[6px] rounded-sm border border-blue-primary150 bg-blue-primary100 hover:bg-blue-primary250 hover:border-blue-primary250 hover:text-white text-blue-primary250 text-[12px] font-medium transition-colors"
            >
              Change
            </button>
          </div>
        </div>

        {/* Passwords */}
        <InputWithMeta
          label="Enter Current Password"
          requiredDot
          type="password"
          placeholder="Enter Password"
          value={currentPwd}
          onChange={setCurrentPwd}
        />

        <InputWithMeta
          label="New Password"
          requiredDot
          type="password"
          placeholder="Enter Password"
          value={newPwd}
          onChange={setNewPwd}
        />

        <InputWithMeta
          label="Confirm Password"
          requiredDot
          type="password"
          placeholder="Enter Password"
          value={confirmPwd}
          onChange={setConfirmPwd}
        />
        {confirmPwd && !passwordsMatch && (
          <p className="text-xs text-red-500 mt-[-8px]">Passwords don't match</p>
        )}

        {/* Actions */}
        <div className="flex items-center">
          <button
            onClick={() => handlePasswordVerifyClick(false)}
            disabled={!isPasswordChangeValid || isRequestingPasswordChange}
            className={`h-8 px-4 rounded-sm text-sm font-medium bg-blue-primary250 text-white hover:bg-blue-600 transition-colors shadow-sm flex items-center justify-center gap-2 ${(!isPasswordChangeValid || isRequestingPasswordChange) ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isRequestingPasswordChange && (
              <UniversalLoader
                size={16}
                style={{
                  background: 'transparent',
                  width: 'auto',
                  height: 'auto',
                  minHeight: 0,
                  minWidth: 0
                }}
              />
            )}
            {isRequestingPasswordChange ? 'Verifying...' : 'Send OTP and Verify'}
          </button>
        </div>

        {/* Password Change Auth Popup */}
        <DetailPopup
          isOpen={showPasswordAuthPopup}
          heading="Let’s authenticate Your Account"
          subHeading={
            <>
              For your security, please verify your existing account information. <br />
              <span className="text-secondary-grey300">
                Enter 6-digit OTP sent on your mobile number
              </span>
              <span>({maskPhone(verificationData?.mobile)})</span>
              <span> and email </span>
              <span>({maskEmail(verificationData?.email)})</span>
            </>
          }
          onCancel={() => setShowPasswordAuthPopup(false)}
          onVerify={handlePasswordAuthVerify}
          isVerifying={isVerifying}
          isVerifyDisabled={!isEmailAuthValid}
        >
          <div className="flex flex-col items-center gap-4">
            {/* Mobile OTP */}
            <div className="flex flex-col items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Enter Mobile Verification Code</label>
              <div className="flex gap-3 justify-center">
                {otpAuthMobile.map((data, index) => (
                  <input
                    className="h-[40px] p-2 w-[40px] border border-secondary-grey150 rounded-md text-center text-base focus:border-blue-primary150 focus:ring-1 focus:ring-blue-primary150 outline-none transition-all"
                    type="password" maxLength="1" key={index} value={data}
                    ref={el => otpAuthMobileRefs.current[index] = el}
                    onChange={e => createOtpHandler(setOtpAuthMobile, otpAuthMobile, otpAuthMobileRefs)(e.target, index)}
                    onKeyDown={e => createKeyDownHandler(otpAuthMobile, otpAuthMobileRefs)(e, index)}
                    onFocus={e => e.target.select()}
                  />
                ))}
              </div>
              <div className="text-xs text-secondary-grey200">
                Haven’t Received Your Code yet?{" "}
                {resending.authMobileResend ? (
                  <span className="text-sm text-secondary-grey300">Resending...</span>
                ) : resendTimers.authMobileResend > 0 ? (
                  <span className="text-sm text-secondary-grey300">Resend after {resendTimers.authMobileResend}s</span>
                ) : (
                  <button
                    onClick={() => { handlePasswordVerifyClick(true, 'authMobileResend'); startTimer('authMobileResend'); }}
                    className="text-sm text-blue-primary250 hover:underline"
                  >
                    Resend
                  </button>
                )}
              </div>
            </div>
            {/* Email OTP */}
            <div className="flex flex-col items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Enter Email Verification Code</label>
              <div className="flex gap-3 justify-center">
                {otpAuthEmail.map((data, index) => (
                  <input
                    className="h-[40px] p-2 w-[40px] border border-secondary-grey150 rounded-md text-center text-base focus:border-blue-primary150 focus:ring-1 focus:ring-blue-primary150 outline-none transition-all"
                    type="password" maxLength="1" key={index} value={data}
                    ref={el => otpAuthEmailRefs.current[index] = el}
                    onChange={e => createOtpHandler(setOtpAuthEmail, otpAuthEmail, otpAuthEmailRefs)(e.target, index)}
                    onKeyDown={e => createKeyDownHandler(otpAuthEmail, otpAuthEmailRefs)(e, index)}
                    onFocus={e => e.target.select()}
                  />
                ))}
              </div>
              <div className="text-xs text-secondary-grey200">
                Haven’t Received Your Code yet?{" "}
                {resending.authEmailResend ? (
                  <span className="text-sm text-secondary-grey300">Resending...</span>
                ) : resendTimers.authEmailResend > 0 ? (
                  <span className="text-sm text-secondary-grey300">Resend after {resendTimers.authEmailResend}s</span>
                ) : (
                  <button
                    onClick={() => { handlePasswordVerifyClick(true, 'authEmailResend'); startTimer('authEmailResend'); }}
                    className="text-sm text-blue-primary250 hover:underline"
                  >
                    Resend
                  </button>
                )}
              </div>
            </div>
          </div>
        </DetailPopup>
        <a
          href="#"
          onClick={(e) => e.preventDefault()}
          className="text-sm text-blue-primary250 hover:bg-blue-primary50  w-fit inline-flex items-center"
        >
          Forgot Password <span className="ml-[10px] text-[20px]">›</span>
        </a>

        {/* Requirements */}
        <div className="">
          <PasswordRequirements password={newPwd} />
        </div>
      </div>
    </div>
  )
}

export default Settings
