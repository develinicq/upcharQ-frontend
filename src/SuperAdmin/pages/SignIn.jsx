import React, { useState, useRef } from "react";
import UniversalLoader from "@/components/UniversalLoader";

import { Checkbox } from "@/components/ui/checkbox";
import axios from "../../lib/axios";
import useSuperAdminAuthStore from "../../store/useSuperAdminAuthStore";
import { useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import InputWithMeta from "@/components/GeneralDrawer/InputWithMeta";
import useUIStore from "../../store/useUIStore";

import useToastStore from "../../store/useToastStore";

export default function SuperAdminSignIn() {
    const navigate = useNavigate();
    const { setToken, setUser } = useSuperAdminAuthStore();
    const { addToast } = useToastStore();

    const [remember, setRemember] = useState(true);
    const [identifier, setIdentifier] = useState(""); // email
    const [password, setPassword] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [identifierMeta, setIdentifierMeta] = useState("");
    const [passwordMeta, setPasswordMeta] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [maskedEmail, setMaskedEmail] = useState("");
    const [maskedPhone, setMaskedPhone] = useState("");

    // OTP State
    const [loginStep, setLoginStep] = useState('credentials'); // 'credentials' | 'otp' | 'forgot-password' | 'forgot-password-otp'
    const [otp, setOtp] = useState(new Array(6).fill(""));
    const [challengeId, setChallengeId] = useState(null);
    const [resendTimer, setResendTimer] = useState(0);
    const [resending, setResending] = useState(false);
    const otpInputRefs = useRef([]);

    // Forgot Password State
    const [forgotEmail, setForgotEmail] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [forgotEmailMeta, setForgotEmailMeta] = useState("");
    const [newPasswordMeta, setNewPasswordMeta] = useState("");
    const [confirmPasswordMeta, setConfirmPasswordMeta] = useState("");

    const location = useLocation();
    const hasToasted = useRef(false);

    // Show toast if redirected from a protected route
    React.useEffect(() => {
        // Reset the explicit logout flag so future unauthorized accesses (e.g. manual URL navigation) 
        // will correctly show the toast.
        useUIStore.getState().setIsLoggingOut(false);

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

    const canLogin = identifier.trim().length > 0 && password.trim().length > 0;
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
            if (!password.trim()) setPasswordMeta("Please enter password.");
            return;
        }

        if (isResend) {
            setResending(true);
        } else {
            setSubmitting(true);
        }
        setErrorMsg("");

        try {
            const res = await axios.post('/superAdmin/login', {
                userName: identifier,
                password: password
            });

            if (res.data.success) {
                const challengeId = res.data.data?.data?.challengeId;
                if (challengeId) {
                    setChallengeId(challengeId);

                    const responseData = res.data.data?.data;
                    setMaskedEmail(responseData?.maskedEmail || "");
                    setMaskedPhone(responseData?.maskedPhone || "");

                    addToast({
                        title: "OTP Sent",
                        message: "OTP sent successfully to your registered mobile/email.",
                        type: "success",
                        duration: 3000
                    });
                    setLoginStep('otp');
                } else {
                    throw new Error("Invalid response from server: Missing challengeId");
                }
            } else {
                throw new Error(res.data.message || "Login failed");
            }
        } catch (error) {
            console.error(error);
            const msg = error.response?.data?.message || error.message || "Something went wrong";
            setErrorMsg(msg);

            // If it's an invalid email/role/password, show it under the identifier field
            if (msg === "Invalid Email") {
                setIdentifierMeta(msg);
            }

            addToast({
                title: "Login Failed",
                message: msg,
                type: "error",
                duration: 4000
            });
        } finally {
            setSubmitting(false);
            setResending(false);
        }
    };

    const handleStepChange = (step) => {
        setLoginStep(step);
        // Pre-fill email if identifier looks like an email
        if (step === 'forgot-password' && identifier.includes('@')) {
            setForgotEmail(identifier);
        }
        // Clear all error/meta states
        setErrorMsg("");
        setIdentifierMeta("");
        setPasswordMeta("");
        setForgotEmailMeta("");
        setNewPasswordMeta("");
        setConfirmPasswordMeta("");
        setOtp(new Array(6).fill(""));
    };

    const handleVerify = async () => {
        if (!isOtpFilled) return;
        setSubmitting(true);
        setErrorMsg("");

        try {
            const otpValue = otp.join("");

            // Logic for regular login OTP vs Forgot Password OTP
            const endpoint = loginStep === 'forgot-password-otp'
                ? '/superAdmin/forgot-password/verify'
                : '/superAdmin/verify-otp';

            const res = await axios.post(endpoint, {
                challengeId: challengeId,
                otp: otpValue
            });

            if (res.data.success) {
                if (loginStep === 'forgot-password-otp') {
                    addToast({
                        title: "Success",
                        message: "Password reset successful. Please login with your new password.",
                        type: "success",
                        duration: 4000
                    });
                    setLoginStep('credentials');
                    setOtp(new Array(6).fill(""));
                } else {
                    const token = res.data.data?.token;

                    if (token) {
                        setToken(token);
                        if (remember) {
                            try {
                                localStorage.setItem('superAdminToken', token);
                            } catch { }
                        }

                        addToast({
                            title: "Login Successful",
                            message: "Redirecting to dashboard...",
                            type: "success",
                            duration: 2000
                        });

                        navigate("/dashboard", { replace: true });
                    } else {
                        throw new Error("Invalid response: Missing token");
                    }
                }
            } else {
                throw new Error(res.data.message || "OTP Verification failed");
            }

        } catch (e) {
            const raw = e?.response?.data?.message ?? e?.message ?? 'Verification failed';
            const msg = typeof raw === 'string' ? raw : (raw?.message || raw?.error || JSON.stringify(raw));
            setErrorMsg(msg);
            addToast({
                title: "Verification Failed",
                message: msg,
                type: "error",
                duration: 4000
            });
        } finally {
            setSubmitting(false);
        }
    };

    const handleForgotPasswordRequest = async () => {
        setForgotEmailMeta("");
        setNewPasswordMeta("");
        setConfirmPasswordMeta("");

        if (!forgotEmail) return setForgotEmailMeta("Email is required");
        if (!newPassword) return setNewPasswordMeta("New password is required");
        if (newPassword.length < 8) return setNewPasswordMeta("Password must be at least 8 characters");
        if (newPassword !== confirmPassword) return setConfirmPasswordMeta("Passwords do not match");

        setSubmitting(true);
        try {
            const res = await axios.post('/superAdmin/forgot-password/request', {
                email: forgotEmail,
                newPassword,
                confirmPassword
            });

            if (res.data.success) {
                setChallengeId(res.data.data?.challengeId);
                addToast({
                    title: "OTP Sent",
                    message: "OTP sent to your registered email.",
                    type: "success",
                    duration: 3000
                });
                setLoginStep('forgot-password-otp');
                setOtp(new Array(6).fill(""));
            }
        } catch (error) {
            const msg = error.response?.data?.message || "Failed to process request";
            if (msg === "Invalid Email") setForgotEmailMeta(msg);
            addToast({
                title: "Request Failed",
                message: msg,
                type: "error"
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
            <div className="flex flex-col gap-16 bg-white px-3 p-3 w-full md:w-1/2">
                <div className=" flex flex-col items-start gap-1 px-3">
                    <img src="/logo.svg" alt="eClinic-Q" className="h-7" />
                    <div className="bg-warning-50 px-1 w-fit py-[2px] min-w-[18px] text-warning-400 text-[12px]">Super Admin</div>
                </div>

                <div className="flex items-center justify-center">
                    <div className="w-full max-w-[500px] flex flex-col gap-6">
                        <div className="flex flex-col gap-1">
                            <h1 className="text-[24px] font-bold text-secondary-grey400 leading-tight">
                                {loginStep === 'credentials' || loginStep === 'otp' ? 'Welcome Back!' : 'Reset Password'}
                            </h1>
                            <p className="text-[14px] text-secondary-grey300 leading-tight">
                                {loginStep === 'credentials' || loginStep === 'otp'
                                    ? 'Login in to access super admin.'
                                    : 'Provide your email to receive a reset OTP.'}
                            </p>
                        </div>


                        {loginStep === 'credentials' ? (
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

                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            handleStepChange('forgot-password');
                                        }}
                                        className="text-right text-[14px] text-blue-primary250 cursor-pointer hover:underline bg-transparent border-none p-0 outline-none block"
                                    >
                                        Forgot Password?
                                    </button>
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
                                        Logging In...
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
                                        <div className="w-4 h-4 rounded-full border border-current flex items-center justify-center">
                                            <svg width="8" height="6" viewBox="0 0 8 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M1 3L3 5L7 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </div>
                                        Login
                                    </button>
                                )}
                            </div>
                        ) : loginStep === 'forgot-password' ? (
                            <div className="space-y-3 animate-in fade-in slide-in-from-right-4 duration-300">
                                <InputWithMeta
                                    label="Enter Registered Email ID"
                                    placeholder="Enter Email"
                                    value={forgotEmail}
                                    requiredDot
                                    onChange={(value) => setForgotEmail(value)}
                                    meta={forgotEmailMeta}
                                    metaClassName="text-red-500"
                                    isInvalid={!!forgotEmailMeta}
                                />

                                <InputWithMeta
                                    label="New Password"
                                    placeholder="Enter New Password"
                                    value={newPassword}
                                    requiredDot
                                    onChange={(value) => setNewPassword(value)}
                                    type={showPassword ? "text" : "password"}
                                    RightIcon={showPassword ? Eye : EyeOff}
                                    onIconClick={() => setShowPassword(!showPassword)}
                                    readonlyWhenIcon={false}
                                    meta={newPasswordMeta}
                                    metaClassName="text-red-500"
                                    isInvalid={!!newPasswordMeta}
                                />

                                <InputWithMeta
                                    label="Confirm Password"
                                    placeholder="Confirm Password"
                                    value={confirmPassword}
                                    requiredDot
                                    onChange={(value) => setConfirmPassword(value)}
                                    type={showPassword ? "text" : "password"}
                                    meta={confirmPasswordMeta}
                                    metaClassName="text-red-500"
                                    isInvalid={!!confirmPasswordMeta}
                                />

                                <div className="flex flex-col gap-2 pt-2">
                                    <button
                                        onClick={handleForgotPasswordRequest}
                                        disabled={submitting}
                                        className={`w-full h-[32px] rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2 bg-blue-primary250 hover:bg-blue-700 text-white shadow-sm ${submitting ? 'opacity-70 cursor-wait' : ''}`}
                                    >
                                        {submitting ? 'Processing...' : 'Confirm'}
                                    </button>
                                    <button
                                        onClick={() => handleStepChange('credentials')}
                                        disabled={submitting}
                                        className="w-full h-[32px] text-sm text-secondary-grey300 hover:text-secondary-grey400"
                                    >
                                        Back to Login
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center  gap-4 w-full animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="text-[14px] text-secondary-grey300 ">
                                    {loginStep === 'forgot-password-otp'
                                        ? `We have sent a 6 digit OTP to your email ${forgotEmail}. Please enter it to reset your password.`
                                        : `We have sent a 6 digit OTP on ${maskedPhone} and registered email Id ${maskedEmail}.`}
                                </div>

                                <div className="flex flex-col items-center gap-3 w-full">
                                    <div className="flex flex-col gap-1 items-center">
                                        <label className="text-[14px] font-medium text-secondary-grey400">
                                            Enter Verification Code
                                        </label>
                                        <div className="text-[12px] text-secondary-grey200">It may take a minute or two to receive your code.</div>
                                    </div>

                                    <div className="flex gap-4 justify-center w-full">
                                        {otp.map((data, index) => (
                                            <input
                                                className="w-[32px] h-[32px] border border-secondary-grey150 rounded-md text-center text-[14px] text-secondary-grey400 focus:border-blue-primary150 outline-none transition-all"
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
                                                    if (loginStep === 'forgot-password-otp') {
                                                        handleForgotPasswordRequest();
                                                    } else {
                                                        handleLogin(true);
                                                    }
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
                                {loginStep === 'forgot-password-otp' && (
                                    <button
                                        onClick={() => setLoginStep('forgot-password')}
                                        className="text-sm text-secondary-grey300 hover:text-secondary-grey400"
                                    >
                                        Change Email/Password
                                    </button>
                                )}
                            </div>
                        )}

                    </div>
                </div>

            </div>
        </div>
    );
}
