import React, { useRef, useState } from "react";
import Button from "../Button";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  loginPassword,
  loginOtpStart,
  loginOtpVerify,
  getDoctorMe,
} from "../../services/authService";
import useAuthStore from "../../store/useAuthStore";
import useHospitalAuthStore from "../../store/useHospitalAuthStore";
import useDoctorAuthStore from "../../store/useDoctorAuthStore";
import { useNavigate } from "react-router-dom";

const Tab = ({ label, active, onClick }) => (
  <label
    className={
      "inline-flex items-center gap-2 text-xs cursor-pointer " +
      (active ? "text-[#2F66F6]" : "text-[#6B7280]")
    }
    onClick={onClick}
  >
    <input
      type="radio"
      checked={active}
      readOnly
      className="accent-[#2F66F6]"
    />{" "}
    {label}
  </label>
);

const variantCopy = {
  neutral: {
    badge: null,
    heading: "Welcome Back!",
    subtitle: "Sign in to continue",
  },
  doctor: {
    badge: null,
    heading: "Welcome Back!",
    subtitle: "Sign in to continue",
  },
  hospital: {
    badge: null,
    heading: "Welcome Back!",
    subtitle: "Sign in to continue",
  },
  fd: {
    badge: null,
    heading: "Welcome Back!",
    subtitle: "Sign in to continue",
  },
  hfd: {
    badge: null,
    heading: "Welcome Back!",
    subtitle: "Sign in to continue",
  },
};

export default function SignIn({ variant = "neutral" }) {
  const navigate = useNavigate();
  const { setToken, setUser, fetchDoctorDetails } = useAuthStore();
  const copy = variantCopy[variant] || variantCopy.neutral;
  const [mode, setMode] = useState("password"); // 'password' | 'mpin' | 'otp'
  const [remember, setRemember] = useState(true);
  const [whatsapp, setWhatsapp] = useState(false);
  const [identifier, setIdentifier] = useState(""); // phone or email
  const [password, setPassword] = useState("");
  const [mpin, setMpin] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(Array(6).fill(""));
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [otpRequesting, setOtpRequesting] = useState(false);
  const [challengeId, setChallengeId] = useState(null);
  const [resendTimer, setResendTimer] = useState(0);
  const [resending, setResending] = useState(false);
  const otpRefs = useRef([...Array(6)].map(() => React.createRef()));

  const allOtpFilled = otp.every(Boolean);
  const resetOtp = () => {
    setOtp(Array(6).fill(""));
    otpRefs.current[0]?.current?.focus();
  };
  const handleOtpChange = (idx) => (e) => {
    const v = e.target.value.replace(/\D/g, "").slice(0, 1);
    setOtp((prev) => {
      const next = [...prev];
      next[idx] = v;
      return next;
    });
    if (v && otpRefs.current[idx + 1])
      otpRefs.current[idx + 1].current?.focus();
  };
  const handleOtpKeyDown = (idx) => (e) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      setOtp((prev) => {
        const next = [...prev];
        if (next[idx]) {
          next[idx] = "";
        } else if (otpRefs.current[idx - 1]) {
          otpRefs.current[idx - 1].current?.focus();
          next[idx - 1] = "";
        }
        return next;
      });
    } else if (e.key === "ArrowLeft" && otpRefs.current[idx - 1]) {
      otpRefs.current[idx - 1].current?.focus();
    } else if (e.key === "ArrowRight" && otpRefs.current[idx + 1]) {
      otpRefs.current[idx + 1].current?.focus();
    }
  };
  const handleSendOtp = () => {
    setOtpSent(true);
    resetOtp();
    startResendTimer();
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
  const requestOtp = async (isResend = false) => {
    if (!identifier.trim()) return;
    setErrorMsg("");
    if (isResend) {
      setResending(true);
    } else {
      setOtpRequesting(true);
    }
    try {
      const resp = await loginOtpStart({ userName: identifier.trim() });
      // Expected nested shape: { data: { data: { challengeId } } }
      const cid =
        resp?.data?.data?.challengeId ||
        resp?.data?.challengeId ||
        resp?.challengeId;
      setChallengeId(cid || null);
      if (isResend) {
        addToast({ message: "OTP Resent successfully", type: "success" });
      }
      setOtpSent(true);
      resetOtp();
    } catch (e) {
      const apiMsg =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        e?.message ||
        "Failed to send OTP";
      setErrorMsg(String(apiMsg));
    } finally {
      setOtpRequesting(false);
      setResending(false);
    }
  };

  const verifyOtp = async () => {
    if (!challengeId || !allOtpFilled) return;
    setSubmitting(true);
    setErrorMsg("");
    try {
      const data = await loginOtpVerify({
        challengeId,
        userName: identifier.trim(),
        otp: otp.join(""),
      });
      // Support nested response shapes: { data: { token, user } } or { data: { data: { token } } }
      const token =
        data?.token ||
        data?.accessToken ||
        data?.data?.token ||
        data?.data?.data?.token;
      const user = data?.user || data?.data?.user || data?.data?.data?.user || null;
      if (token) setToken(token);
      if (user) setUser(user);

      const roles = user?.roleNames || [];
      if (roles.includes("HOSPITAL_ADMIN")) {
        useHospitalAuthStore.getState().clearAuth();
      }
      if (roles.includes("DOCTOR") && variant !== "doctor") {
        useDoctorAuthStore.getState().clearAuth();
      }

      // Only fetch doctor details if we are in doctor/neutral context
      if (variant !== "hfd" && variant !== "fd" && variant !== "hospital") {
        await fetchDoctorDetails(getDoctorMe);
      }

      // Role-based redirection logic
      if (variant === "hfd") {
        navigate("/hfd/queue", { replace: true });
      } else if (variant === "fd") {
        navigate("/fd/queue", { replace: true });
      } else if (variant === "hospital") {
        navigate("/hospital", { replace: true });
      } else {
        navigate("/doc", { replace: true });
      }
    } catch (e) {
      const apiMsg =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        e?.message ||
        "OTP verification failed";
      setErrorMsg(String(apiMsg));
    } finally {
      setSubmitting(false);
    }
  };

  const canPasswordLogin =
    identifier.trim().length > 0 && password.trim().length > 0;
  const canMPinLogin = identifier.trim().length > 0 && mpin.trim().length === 4;
  const canLogin =
    mode === "password"
      ? canPasswordLogin
      : mode === "mpin"
        ? canMPinLogin
        : false;

  const handlePasswordLogin = async () => {
    if (!canPasswordLogin) return;
    setSubmitting(true);
    setErrorMsg("");
    try {
      const data = await loginPassword({
        userName: identifier.trim(),
        password: password,
      });
      // Expecting token and optional user in response; adapt if different
      const token = data?.token || data?.accessToken || data?.data?.token;
      const user = data?.user || data?.data?.user || null;
      if (token) setToken(token);
      if (user) setUser(user);

      const roles = user?.roleNames || [];
      if (roles.includes("HOSPITAL_ADMIN")) {
        useHospitalAuthStore.getState().clearAuth();
      }
      if (roles.includes("DOCTOR") && variant !== "doctor") {
        useDoctorAuthStore.getState().clearAuth();
      }

      // Only fetch doctor details if we are in doctor/neutral context
      if (variant !== "hfd" && variant !== "fd" && variant !== "hospital") {
        await fetchDoctorDetails(getDoctorMe);
      }

      // Role-based redirection logic
      if (variant === "hfd") {
        navigate("/hfd/queue", { replace: true });
      } else if (variant === "fd") {
        navigate("/fd/queue", { replace: true });
      } else if (variant === "hospital") {
        navigate("/hospital", { replace: true });
      } else {
        navigate("/doc", { replace: true });
      }
    } catch (e) {
      const apiMsg =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        e?.message ||
        "Login failed";
      setErrorMsg(String(apiMsg));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left panel - fixed 600px */}
      <div className="hidden md:flex flex-1 relative p-6">
        <div
          className="absolute inset-0 rounded-[12px]"
          style={{
            background: "linear-gradient(180deg, #2372EC 22.83%, #E184FD 100%)",
            margin: "24px",
          }}
        />
        {/* Decorative circles */}
        <img
          src="/Group-1898.svg"
          alt=""
          className="absolute top-0 left-0 pointer-events-none"
          style={{ margin: "24px" }}
        />
        <img
          src="/Group-1899.svg"
          alt=""
          className="absolute bottom-0 right-0 pointer-events-none"
          style={{ margin: "24px" }}
        />
        <div
          className="relative h-full w-full flex items-center justify-center"
          style={{ paddingTop: "40px", paddingBottom: "12px" }}
        >
          <div className="text-white text-center max-w-sm select-none">
            <img
              src="/sign-in-object.svg"
              alt="welcome"
              className="w-[599px] md:w-[599px] mx-auto"
            />
            <h2 className="text-xl font-semibold mt-4">Welcome To Upchar-Q</h2>
            <p className="text-sm opacity-90">
              Your Turn, Your Time
              <br />
              Track Appointments in Real-Time!
            </p>

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
      <div className="relative flex-1 flex items-center justify-center px-6 pb-10 md:px-10 md:pb-10">
        <div className="absolute left-8 md:left-12 top-8 md:top-8">
          <img src="/logo.svg" alt="eClinic-Q" className="h-6" />
          {copy.badge && (
            <div className="text-[11px] text-[#F59E0B] mt-0.5">
              {copy.badge}
            </div>
          )}
        </div>
        <div className="w-full max-w-[520px] relative -top-2 md:-top-4 pb-16">
          <h1 className="text-2xl font-semibold text-gray-800">
            {copy.heading}
          </h1>
          <p className="text-sm text-gray-500 mb-3">{copy.subtitle}</p>

          <RadioGroup value={mode} onValueChange={setMode} className="flex items-center gap-6 mb-3">
            <div className="flex items-center gap-2">
              <RadioGroupItem value="password" id="password" />
              <label htmlFor="password" className="text-sm text-gray-700 cursor-pointer">
                Via Password
              </label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="mpin" id="mpin" />
              <label htmlFor="mpin" className="text-sm text-gray-700 cursor-pointer">
                Via M-Pin
              </label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="otp" id="otp" />
              <label htmlFor="otp" className="text-sm text-gray-700 cursor-pointer">
                Via OTP
              </label>
            </div>
          </RadioGroup>

          <div className="space-y-3 mt-4">
            {errorMsg && (
              <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
                {errorMsg}
              </div>
            )}

            {mode === "password" && (
              <div>
                <div>
                  <label className="text-sm text-gray-700">
                    Enter Mobile/Email ID{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    className="mt-1 h-9 w-full border border-gray-300 rounded px-2 text-sm"
                    placeholder="Enter Mobile/Email ID"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                  />
                </div>
                <label className="text-sm text-gray-700">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 relative">
                  <input
                    className="h-9 w-full border border-gray-300 rounded px-2 text-sm pr-8"
                    placeholder="Enter Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && canPasswordLogin)
                        handlePasswordLogin();
                    }}
                  />
                  <select className="absolute right-1 top-1/2 -translate-y-1/2 h-7 border border-gray-300 rounded text-xs px-1 bg-white">
                    <option>—</option>
                  </select>
                </div>
                <div className="text-right mt-1 text-xs text-[#2F66F6] cursor-pointer">
                  Forgot Password?
                </div>
              </div>
            )}

            {mode === "mpin" && (
              <div>
                <div>
                  <label className="text-sm text-gray-700">
                    Enter Mobile/Email ID{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    className="mt-1 h-9 w-full border border-gray-300 rounded px-2 text-sm"
                    placeholder="Enter Mobile/Email ID"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                  />
                </div>
                <label className="text-sm text-gray-700">
                  Enter M-Pin <span className="text-red-500">*</span>
                </label>
                <input
                  className="mt-1 h-9 w-full border border-gray-300 rounded px-2 text-sm"
                  placeholder="••••"
                  inputMode="numeric"
                  maxLength={4}
                  value={mpin}
                  onChange={(e) =>
                    setMpin(e.target.value.replace(/\D/g, "").slice(0, 4))
                  }
                />
              </div>
            )}

            {mode === "otp" && (
              <div>
                {!otpSent ? (
                  <div className="space-y-2">
                    <div>
                      <label className="text-sm text-gray-700">
                        Enter Mobile/Email ID{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        className="mt-1 h-9 w-full border border-gray-300 rounded px-2 text-sm"
                        placeholder="Enter Mobile/Email ID"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && identifier) {
                            handleSendOtp();
                          }
                        }}
                      />
                    </div>
                    <button
                      disabled={!identifier || otpRequesting}
                      onClick={() => requestOtp(false)}
                      className={`w-full h-9 rounded text-sm flex items-center justify-center border ${identifier && !otpRequesting
                        ? "bg-[#2F66F6] text-white border-[#2F66F6]"
                        : "bg-[#F3F4F6] text-[#9AA1A9] border-[#E5E7EB] cursor-not-allowed"
                        }`}
                    >
                      {otpRequesting ? (
                        "Sending..."
                      ) : (
                        <>
                          <span className="mr-1">💬</span> Send OTP
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-[13px] text-gray-600">
                      We have sent a 6 digit OTP on{" "}
                      <span className="font-semibold">
                        {identifier || "your mobile"}
                      </span>{" "}
                      and registered email Id, please sign up if you are a new
                      user
                    </div>
                    <div className="text-center">
                      <div className="text-[13px] font-medium text-gray-700">
                        Enter Mobile Verification Code
                      </div>
                      <div className="text-[11px] text-gray-500">
                        It may take a minute or two to receive your code.
                      </div>
                    </div>
                    <div className="flex items-center justify-start md:justify-center gap-4">
                      {otp.map((d, i) => (
                        <input
                          key={i}
                          ref={otpRefs.current[i]}
                          type="password"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={1}
                          value={d}
                          onChange={handleOtpChange(i)}
                          onKeyDown={handleOtpKeyDown(i)}
                          className="w-[32px] h-[40px] border border-gray-300 rounded-md text-center text-lg outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="–"
                        />
                      ))}
                    </div>
                    <div className="text-center text-xs text-gray-500">
                      Haven't Received Your Code yet?{" "}
                      {resending ? (
                        <span className="text-[#6B7280]">Resending...</span>
                      ) : resendTimer > 0 ? (
                        <span className="text-[#6B7280]">Resend after {resendTimer}s</span>
                      ) : (
                        <button
                          onClick={() => {
                            requestOtp(true);
                            startResendTimer();
                          }}
                          className="text-[#2F66F6]"
                        >
                          Resend
                        </button>
                      )}
                    </div>
                    <hr className="border-gray-200 my-2" />
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="whatsapp-otp"
                        checked={whatsapp}
                        onCheckedChange={setWhatsapp}
                      />
                      <label
                        htmlFor="whatsapp-otp"
                        className="text-xs text-gray-700 cursor-pointer"
                      >
                        Allow us to send messages on your WhatsApp account
                      </label>
                    </div>
                    <button
                      disabled={!allOtpFilled || submitting}
                      onClick={verifyOtp}
                      className={`w-full h-9 rounded text-sm flex items-center justify-center gap-2 ${allOtpFilled && !submitting
                        ? "bg-[#2F66F6] text-white"
                        : "bg-[#F3F4F6] text-[#9AA1A9]"
                        }`}
                    >
                      {submitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        "Verify OTP"
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}

            {mode !== "otp" && (
              <div className="flex items-center gap-2">
                <Checkbox
                  id="remember"
                  checked={remember}
                  onCheckedChange={setRemember}
                />
                <label
                  htmlFor="remember"
                  className="text-xs text-gray-700 cursor-pointer"
                >
                  Remember Me
                </label>
              </div>
            )}
            {mode !== "otp" && (
              <div className="flex items-center gap-2">
                <Checkbox
                  id="whatsapp"
                  checked={whatsapp}
                  onCheckedChange={setWhatsapp}
                />
                <label
                  htmlFor="whatsapp"
                  className="text-xs text-gray-700 cursor-pointer"
                >
                  Allow us to send messages on your WhatsApp account
                </label>
              </div>
            )}
            {mode !== "otp" && (
              <Button
                className="w-full"
                disabled={!canLogin || submitting}
                onClick={() => {
                  if (mode === "password") return handlePasswordLogin();
                  // TODO: implement mpin/otp when backend ready
                }}
              >
                {submitting ? "Logging in..." : "Login"}
              </Button>
            )}
            <div className="text-[11px] text-gray-500 flex items-start gap-2">
              <span className="mt-[2px] inline-flex items-center justify-center w-[14px] h-[14px] border border-gray-400 rounded-full text-[9px] text-gray-600">
                i
              </span>
              <span>
                By clicking the button above, you agree to our{" "}
                <a className="text-[#2F66F6]" href="#">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a className="text-[#2F66F6]" href="#">
                  Privacy Policy
                </a>
                .
                <br />
                For any queries, feel free to{" "}
                <a className="text-[#2F66F6]" href="#">
                  Call Us
                </a>
              </span>
            </div>
          </div>
          {/* Help & Support button */}
          <a
            className="absolute left-8 md:left-12 bottom-6 bg-white text-gray-600 text-sm rounded-full border border-gray-200 shadow-sm px-4 py-2 inline-flex items-center gap-2 hover:bg-gray-50 w-fit"
            href="#"
          >
            <img src="/Help.svg" alt="help" className="w-4 h-4" />
            Help & Support
            <span className="ml-2 text-gray-400">›</span>
          </a>
        </div>
      </div>
    </div>
  );
}
