import React, { useState, useRef } from "react";
import UniversalLoader from "@/components/UniversalLoader";

import { Checkbox } from "@/components/ui/checkbox";
import { useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import InputWithMeta from "@/components/GeneralDrawer/InputWithMeta";
import useUIStore from "@/store/useUIStore";
import useToastStore from "@/store/useToastStore";
import useDoctorAuthStore from "@/store/useDoctorAuthStore";
import useFrontDeskAuthStore from "@/store/useFrontDeskAuthStore";
import useHospitalFrontDeskAuthStore from "@/store/useHospitalFrontDeskAuthStore";

import RadioButton from "@/components/GeneralDrawer/RadioButton";

export default function DocSignIn() {
  const navigate = useNavigate();
  const { login, verifyOtp } = useDoctorAuthStore();
  const { addToast } = useToastStore();

  const [loginMode, setLoginMode] = useState("password"); // 'password' | 'otp_flow'
  const [remember, setRemember] = useState(true);
  const [identifier, setIdentifier] = useState(""); // email
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [identifierMeta, setIdentifierMeta] = useState("");
  const [passwordMeta, setPasswordMeta] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [maskedPhone, setMaskedPhone] = useState("");

  // OTP State
  const [loginStep, setLoginStep] = useState('credentials'); // 'credentials' | 'otp'
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [challengeId, setChallengeId] = useState(null);
  const [resendTimer, setResendTimer] = useState(0);
  const [resending, setResending] = useState(false);
  const otpInputRefs = useRef([]);

  const location = useLocation();
  const hasToasted = useRef(false);

  // Show toast if redirected from a protected route
  React.useEffect(() => {
    useUIStore?.getState?.().setIsLoggingOut?.(false);

    if (location.state?.fromGuard && !hasToasted.current) {
      addToast({
        title: "Access Denied",
        message: "Please login first to access this page.",
        type: "error",
      });
      hasToasted.current = true;
      // Clear state so toast doesn't re-appear on refresh/manual landing
      window.history.replaceState({}, document.title);
    }
  }, [location.state, addToast]);

  const canLogin = loginMode === 'password'
    ? (identifier.trim().length > 0 && password.trim().length > 0)
    : (identifier.trim().length > 0);

  const isOtpFilled = otp.every(val => val !== "");

  // OTP Handlers
  const handleOtpChange = (element, index) => {
    if (isNaN(element.value)) return false;
    setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);
    if (element.nextSibling && element.value) {
      element.nextSibling.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1].focus();
    }
  };

  const startResendTimer = () => {
    setResendTimer(60);
    const interval = setInterval(() => {
      setResendTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleLogin = async (isResend = false) => {
    // reset meta
    setIdentifierMeta("");
    setPasswordMeta("");

    if (!canLogin) {
      if (!identifier.trim()) setIdentifierMeta("Please enter mobile/email.");
      if (loginMode === 'password' && !password.trim()) setPasswordMeta("Please enter password.");
      return;
    }

    if (isResend) {
      setResending(true);
    } else {
      setSubmitting(true);
    }
    setErrorMsg("");

    try {
      const payload = {
        userName: identifier,
        method: loginMode === 'password' ? 'PASSWORD' : 'OTP',
        ...(loginMode === 'password' && { password })
      };

      const res = await login(payload);

      if (res.success) {
        if (loginMode === 'password') {
          // Check for required role - ONLY accept pure DOCTOR role
          const roles = res.data.roleNames || [];
          const excludedRoles = ['DOCTOR', 'HOSPITAL_ADMIN', 'SUPER_ADMIN', 'ADMIN'];

          // check if user has ANY of the excluded roles
          const hasExcludedRole = roles.some(r => excludedRoles.includes(r));

          // Handle Staff Roles
          if (roles.includes("HOSPITAL_STAFF")) {
            // Clear Doctor Auth Store
            useDoctorAuthStore.getState().clearAuth();

            const { setToken, setRoleNames, setUser } = useHospitalFrontDeskAuthStore.getState();
            setToken(res.data.token);
            setRoleNames(roles);
            setUser(res.data.user);

            addToast({
              title: "Login Successful",
              message: "Redirecting to hospital front desk dashboard...",
              type: "success",
              duration: 2000
            });

            window.location.href = "/hfd/queue";
            return;
          }

          if (roles.includes("CLINIC_STAFF") || (!hasExcludedRole && roles.length > 0)) {
            // Clear Doctor Auth Store
            useDoctorAuthStore.getState().clearAuth();

            const { setToken, setRoleNames, setUser } = useFrontDeskAuthStore.getState();
            setToken(res.data.token);
            setRoleNames(roles);
            setUser(res.data.user);

            addToast({
              title: "Login Successful",
              message: "Redirecting to front desk dashboard...",
              type: "success",
              duration: 2000
            });

            window.location.href = "/fd/queue";
            return;
          }

          // Reject if no DOCTOR role
          if (!roles.includes("DOCTOR")) {
            useDoctorAuthStore.getState().clearAuth();
            addToast({
              title: "Access Denied",
              message: "Wrong credentials",
              type: "error",
            });
            return;
          }

          // Reject dual-role users (HOSPITAL_ADMIN + DOCTOR)
          if (roles.includes("HOSPITAL_ADMIN")) {
            useDoctorAuthStore.getState().clearAuth();
            addToast({
              title: "Access Denied",
              message: "Please use Hospital Sign-In to access admin features.",
              type: "error",
            });
            return;
          }

          addToast({
            title: "Login Successful",
            message: "Redirecting to dashboard...",
            type: "success",
            duration: 2000
          });
          navigate("/doc", { replace: true });
        } else {
          setChallengeId(res.data.data.challengeId);
          setMaskedPhone(res.data.data.userName); // Using userName as masked phone/email for now
          addToast({
            title: "OTP Sent",
            message: "OTP sent successfully to your registered mobile/email.",
            type: "success",
            duration: 3000
          });
          setLoginStep('otp');
          startResendTimer();
        }
      }
    } catch (error) {
      const msg = error.response?.data?.message || error.message || "Login failed. Please try again.";
      setErrorMsg(msg);
      addToast({
        title: "Login Error",
        message: msg,
        type: "error",
      });
    } finally {
      setSubmitting(false);
      setResending(false);
    }
  };

  const handleVerify = async () => {
    if (!isOtpFilled) return;
    setSubmitting(true);
    setErrorMsg("");

    try {
      const payload = {
        challengeId: challengeId,
        userName: identifier,
        otp: otp.join("")
      };

      const res = await verifyOtp(payload);

      if (res.success) {
        // Check for required role - ONLY accept pure DOCTOR role
        const roles = res.data.roleNames || [];
        const excludedRoles = ['DOCTOR', 'HOSPITAL_ADMIN', 'SUPER_ADMIN', 'ADMIN'];

        // check if user has ANY of the excluded roles
        const hasExcludedRole = roles.some(r => excludedRoles.includes(r));

        // Handle Staff Roles
        if (roles.includes("HOSPITAL_STAFF")) {
          // Clear Doctor Auth Store
          useDoctorAuthStore.getState().clearAuth();

          const { setToken, setRoleNames, setUser } = useHospitalFrontDeskAuthStore.getState();
          setToken(res.data.token);
          setRoleNames(roles);
          setUser(res.data.user);

          addToast({
            title: "Login Successful",
            message: "Redirecting to hospital front desk dashboard...",
            type: "success",
            duration: 2000
          });

          window.location.href = "/hfd/queue";
          return;
        }

        if (roles.includes("CLINIC_STAFF") || (!hasExcludedRole && roles.length > 0)) {
          // Clear Doctor Auth Store
          useDoctorAuthStore.getState().clearAuth();

          const { setToken, setRoleNames, setUser } = useFrontDeskAuthStore.getState();
          setToken(res.data.token);
          setRoleNames(roles);
          setUser(res.data.user);

          addToast({
            title: "Login Successful",
            message: "Redirecting to front desk dashboard...",
            type: "success",
            duration: 2000
          });

          window.location.href = "/fd/queue";
          return;
        }

        // Reject if no DOCTOR role
        if (!roles.includes("DOCTOR")) {
          useDoctorAuthStore.getState().clearAuth();
          addToast({
            title: "Access Denied",
            message: "You do not have the required permissions to access the doctor module.",
            type: "error",
          });
          return;
        }

        // Reject dual-role users (HOSPITAL_ADMIN + DOCTOR)
        if (roles.includes("HOSPITAL_ADMIN")) {
          useDoctorAuthStore.getState().clearAuth();
          addToast({
            title: "Access Denied",
            message: "Please use Hospital Sign-In to access admin features.",
            type: "error",
          });
          return;
        }

        addToast({
          title: "Login Successful",
          message: "Redirecting to dashboard...",
          type: "success",
          duration: 2000
        });
        navigate("/doc", { replace: true });
      }
    } catch (error) {
      const msg = error.response?.data?.message || error.message || "Verification failed. Please try again.";
      setErrorMsg(msg);
      addToast({
        title: "Verification Error",
        message: msg,
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-1 bg-secondary-grey50 p-3 w-full">
      {/* Left panel - fixed 600px */}
      <div className="hidden md:flex flex-1 relative w-1/2">
        <div
          className="absolute inset-0 rounded-[12px]"
          style={{
            background: "linear-gradient(180deg, #2372EC 22.83%, #E184FD 100%)",

          }}
        />
        {/* Decorative circles */}
        <img
          src="/Group-1898.svg"
          alt=""
          className="absolute top-0 left-0 pointer-events-none"

        />
        <img
          src="/Group-1899.svg"
          alt=""
          className="absolute bottom-0 right-0 pointer-events-none"

        />
        <div
          className="relative h-full w-full flex items-center justify-center"

        >
          <div className="text-white text-center select-none">
            <img
              src="/sign-in-object.svg"
              alt="welcome"
              className="  mx-auto"
            />
            <div className="flex flex-col gap-3 mt-10">
              <h2 className="text-[28px] font-medium  leading-[24px]">Welcome To Upchar-Q</h2>
              <p className="text-[20px] opacity-90 leading-[20px]">
                <span className="block mb-1">Your Turn, Your Time</span>
                <span className="block">Track Appointments in Real-Time!</span>
              </p>


            </div>

            {/* Bottom dots decoration */}
            <img
              src="/signin-dots.svg"
              alt=""
              className="absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-none mb-2"
            />
          </div>
        </div>

      </div>

      {/* Right form */}
      <div className=" flex flex-col gap-16  bg-white px-3 p-3 w-1/2">
        <div className=" flex flex-col items-start gap-1 px-3">
          <img src="/logo.svg" alt="upchar-Q" className="h-7" />
          <div className="bg-warning-50 px-1 w-fit py-[2px] min-w-[18px] text-warning-400 text-[12px]">For Doctors / Clinics</div>
        </div>

        <div className="flex items-center justify-center">
          <div className="w-full max-w-[500px] flex flex-col gap-6">
            <div className="flex flex-col gap-1">
              <h1 className="text-[24px]  font-bold text-secondary-grey400 leading-tight">
                Welcome Back!
              </h1>
              <p className="text-[14px] text-secondary-grey300 leading-tight">Login to access doctor module.</p>
            </div>


            {/* Radio buttons - always visible */}
            <div className="flex items-center gap-6">
              <RadioButton
                name="loginMode"
                textheight="text-[12px]"
                value="password"
                buttonsize="w-4 h-4"
                smallbutton="w-[9px] h-[9px]"
                label="Via Password"
                checked={loginMode === "password"}
                onChange={(val) => {
                  setLoginMode(val);
                  // Reset to credentials step if switching modes
                  if (loginStep === 'otp') setLoginStep('credentials');
                }}
              />
              <RadioButton
                name="loginMode"
                buttonsize="w-4 h-4"
                smallbutton="w-[9px] h-[9px]"
                value="otp_flow"
                textheight="text-[12px]"
                label="Via OTP"
                checked={loginMode === "otp_flow"}
                onChange={(val) => {
                  setLoginMode(val);
                  // Reset to credentials step if switching modes
                  if (loginStep === 'otp') setLoginStep('credentials');
                }}
              />
            </div>

            {loginStep === 'credentials' ? (
              <div className="space-y-6">
                <div className="space-y-3">
                  <InputWithMeta
                    label="Enter Mobile/Email ID"
                    placeholder="Enter Mobile/Email ID"
                    value={identifier}
                    requiredDot
                    onChange={(value) => setIdentifier(value)}
                    meta={identifierMeta}
                    metaClassName="text-red-500"
                    isInvalid={!!identifierMeta}
                  />

                  {loginMode === 'password' && (
                    <InputWithMeta
                      label="Enter Password"
                      placeholder="Enter Password"
                      value={password}
                      requiredDot
                      onChange={(value) => setPassword(value)}
                      type={showPassword ? "text" : "password"}
                      RightIcon={showPassword ? Eye : EyeOff}
                      onIconClick={() => setShowPassword(!showPassword)}
                      readonlyWhenIcon={false}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && canLogin)
                          handleLogin(false);
                      }}
                      meta={passwordMeta}
                      metaClassName="text-red-500"
                      isInvalid={!!passwordMeta}
                    />
                  )}

                  <div className="flex items-center gap-2 justify-between">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="remember"
                        checked={remember}
                        onCheckedChange={setRemember}
                      />
                      <label
                        htmlFor="remember"
                        className="text-[14px] text-secondary-grey300 cursor-pointer"
                      >
                        Remember Me
                      </label>
                    </div>

                    <div className="text-right text-[14px] text-blue-primary250 cursor-pointer">
                      Forgot Password?
                    </div>
                  </div>

                  {submitting ? (
                    <button
                      disabled
                      className="w-full h-[32px] flex items-center justify-center gap-2 bg-blue-primary250 text-white rounded-md text-sm font-medium transition-colors cursor-wait"
                    >
                      <UniversalLoader
                        size={20}
                        style={{
                          background: 'transparent',
                          width: 'auto',
                          height: 'auto',
                          minHeight: 0,
                          minWidth: 0
                        }}
                      />
                      {loginMode === 'password' ? 'Logging In...' : 'Sending OTP...'}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleLogin(false)}
                      disabled={!canLogin}
                      className={`w-full h-[32px] rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2
                                            ${!canLogin
                          ? 'bg-secondary-grey50 cursor-not-allowed text-secondary-grey100'
                          : 'bg-blue-primary250 hover:bg-blue-700 text-white shadow-sm'
                        }`}
                    >
                      {loginMode === 'password' ? (
                        <>
                          <div className="w-4 h-4 rounded-full border border-current flex items-center justify-center">
                            <svg width="8" height="6" viewBox="0 0 8 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M1 3L3 5L7 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </div>
                          Login
                        </>
                      ) : (
                        <>
                          Get OTP
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 w-full animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="text-[14px] text-secondary-grey300 ">
                  We have sent a 6 digit OTP on <span className="font-semibold">{maskedPhone}</span> and registered email Id, please sign up if you are a new user
                </div>

                <div className="flex flex-col items-center gap-3 w-full">
                  <div className="flex flex-col gap-1 items-center">
                    <label className="text-[14px] font-medium text-secondary-grey400">
                      Enter Mobile Verification Code
                    </label>
                    <div className="text-[12px] text-secondary-grey200">It may take a minute or two to receive your code.</div>
                  </div>

                  <div className="flex gap-4 justify-center w-full">
                    {otp.map((data, index) => (
                      <input
                        className="w-[32px] h-[32px] border border-secondary-grey150 rounded-[6px] text-center text-[14px] text-secondary-grey400 focus:border-blue-primary150 outline-none transition-all"
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
                  <div className="text-[12px] text-secondary-grey200 flex items-center gap-2">
                    Haven’t Received Your Code yet? {resending ? (
                      <span className="text-secondary-grey300 text-[14px]">Resending...</span>
                    ) : resendTimer > 0 ? (
                      <span className="text-secondary-grey300 text-[14px]">Resend after {resendTimer}s</span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setOtp(new Array(6).fill(""));
                          handleLogin(true);
                          startResendTimer();
                        }}
                        className="text-blue-primary250 text-[14px] hover:underline"
                      >
                        Resend
                      </button>
                    )}
                  </div>
                </div>

                <div className="w-full">
                  {submitting ? (
                    <button
                      disabled
                      className="w-full h-[32px] flex items-center justify-center gap-2 bg-blue-600 text-white rounded-md text-sm font-medium transition-colors cursor-wait"
                    >
                      <UniversalLoader
                        size={20}
                        style={{
                          background: 'transparent',
                          width: 'auto',
                          height: 'auto',
                          minHeight: 0,
                          minWidth: 0
                        }}
                      />
                      Verifying...
                    </button>
                  ) : (
                    <button
                      onClick={handleVerify}
                      disabled={!isOtpFilled}
                      className={`w-full h-[32px] rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2
                                            ${!isOtpFilled
                          ? 'bg-secondary-grey50 cursor-not-allowed text-secondary-grey100'
                          : 'bg-blue-primary250 hover:bg-blue-700 text-white shadow-sm'
                        }`}
                    >
                      <div className="w-4 h-4 rounded-full border border-current flex items-center justify-center">
                        <svg width="8" height="6" viewBox="0 0 8 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M1 3L3 5L7 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      Verify OTP
                    </button>
                  )}
                </div>

              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
