import React, { useState } from 'react';
import HelpSupportDrawer from '@/SuperAdmin/components/HelpSupport/HelpSupportDrawer';
import Button from '../../../components/Button';
import PasswordRequirements from '../../../components/FormItems/PasswordRequirements';
import PasswordStrengthBar from '../../../components/FormItems/PasswordStrengthBar';
import ReceptionistInfoCard from '../../Components/Login/ReceptionistInfoCard';

const FDOnboarding = ({ onContinue, userDetails }) => {
  const [formData, setFormData] = useState({ password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // Use passed userDetails or fallback to empty object to prevent crashes
  const user = userDetails || {};

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const reqs = [
    (pw) => pw.length >= 8 && pw.length <= 15,
    (pw) => /[A-Z]/.test(pw),
    (pw) => /[a-z]/.test(pw),
    (pw) => /[0-9]/.test(pw),
    (pw) => /[!@#$%^&*]/.test(pw),
  ];
  const isPasswordValid = reqs.every((fn) => fn(formData.password));
  const isPasswordsMatch = formData.password && formData.confirmPassword && formData.password === formData.confirmPassword;

  const togglePassword = () => setShowPassword(!showPassword);
  const toggleConfirmPassword = () => setShowConfirmPassword(!showConfirmPassword);

  const EyeIcon = ({ visible, onClick }) => (
    <button
      type="button"
      onClick={onClick}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-700 hover:text-gray-600 focus:outline-none"
    >
      {visible ? (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.657.336-3.234.938-4.675m1.662-2.337A9.956 9.956 0 0112 3c5.523 0 10 4.477 10 10 0 1.657-.336-3.234-.938-4.675m-1.662 2.337A9.956 9.956 0 0112 21c-5.523 0-10-4.477-10-10 0-1.657.336-3.234.938-4.675" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.271 4.271l15.458 15.458" />
        </svg>
      )}
    </button>
  );

  return (
    <div className="min-h-screen flex w-full bg-white font-sans overflow-hidden">
      {/* Left Panel */}
      <div className="hidden lg:flex w-1/2 relative flex-col items-center justify-center overflow-hidden">
        {/* Gradient Background */}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(180deg, #2372EC 22.83%, #E184FD 100%)",
          }}
        />

        {/* Decorative Elements */}
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

        {/* Top Logo Text */}
        <div className="absolute top-8 left-0 w-full text-center z-20">
          <img src="/logo.svg" alt="eClinic-Q" className="h-10 mx-auto brightness-0 invert" style={{ filter: 'brightness(0) invert(1)' }} />
        </div>

        {/* Main Content */}
        <div className="relative z-10 flex flex-col items-center text-center p-8 mt-10">
          <img
            src="/sign-in-object.svg"
            alt="Welcome Illustration"
            className="max-w-[400px] w-[80%] h-auto mb-10 drop-shadow-2xl"
          />

          <div className="flex flex-col gap-2 text-white">
            <h2 className="text-3xl font-semibold tracking-wide">Welcome To eClinic-Q</h2>
            <p className="text-lg opacity-90 font-light leading-relaxed">
              Your Turn, Your Time<br />
              Track Appointments in Real-Time!
            </p>
          </div>

          {/* Bottom dots */}
          <img
            src="/signin-dots.svg"
            alt=""
            className="mt-6 opacity-80"
          />
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between h-screen overflow-y-auto">
        <div className="flex-1 flex flex-col justify-center p-8 max-w-[420px] mx-auto w-full items-center">
          <div className="mb-6 text-center">
            <h2 className="text-xl font-bold text-gray-700 ">
              Welcome, {user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Front Desk User'}
            </h2>
            <p className="text-gray-600 text-[12px] font-light">
              Let's Set your Account Security Password for your account.
            </p>
          </div>

          <div className="mb-6 w-full flex justify-center">
            <ReceptionistInfoCard
              name={`${user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Front Desk User'}`}
              designation={user?.title || 'Receptionist'}
              email={user?.emailId}
              phone={user?.phone}
              code={user?.id?.slice(0, 8) || '—'}
              avatarUrl={user?.profilePhoto}
              className="bg-white border-2 border-blue-100 rounded-xl p-4 w-full"
            />
          </div>

          <form className="space-y-4 w-full text-left">
            <div>
              <label className="block text-xs font-normal text-gray-600 mb-1">
                Create Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Minimum 8 Character"
                  className="w-full px-2 py-1 bg-white border border-gray-400 rounded-sm text-[11px] focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder-gray-300 text-gray-700"
                />
                <EyeIcon visible={showPassword} onClick={togglePassword} />
              </div>
              <div className="mt-2">
                <PasswordStrengthBar password={formData.password} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-normal text-gray-600 mb-1">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Minimum 8 Character"
                  className="w-full px-2 py-1 bg-white border border-gray-400 rounded-sm text-[11px] focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder-gray-300 text-gray-700"
                />
                <EyeIcon visible={showConfirmPassword} onClick={toggleConfirmPassword} />
              </div>
              {!isPasswordsMatch && formData.confirmPassword && (
                <div className="text-red-500 text-[10px] mt-1">Passwords do not match</div>
              )}
            </div>

            <PasswordRequirements password={formData.password} />

            <Button
              variant="primary"
              disabled={!(isPasswordsMatch && isPasswordValid)}
              className={`w-full py-1 rounded-sm !text-[11px] !font-normal shadow-none hover:shadow-md transition-all mt-3 ${isPasswordsMatch && isPasswordValid
                ? '!bg-blue-600 !text-white hover:!bg-blue-700'
                : '!bg-fuchsia-100 !border-fuchsia-200 !text-gray-300'
                }`}
              onClick={() => {
                if (onContinue) {
                  onContinue({
                    password: formData.password,
                    confirmPassword: formData.confirmPassword,
                  });
                }
              }}
            >
              Continue to Verification
            </Button>

            <div className="text-center text-[10px] text-gray-600 ">
              By clicking the button above, you agree to our<br />
              <a href="#" className="text-gray-600 font-normal underline hover:text-blue-600 mx-1">Terms of Service</a>
              and
              <a href="#" className="text-gray-600 font-normal underline hover:text-blue-600 mx-1">Privacy Policy</a>.
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 flex justify-between items-center w-full border-t border-transparent sm:border-gray-50">
          <button
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
            onClick={() => setIsHelpOpen(true)}
          >
            <span className="w-5 h-5 flex items-center justify-center">
              <img src="/Help.svg" alt="Help" className="w-full h-full opacity-60" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'block'; }} />
              <span className="hidden w-3 h-3 rounded-full border border-current items-center justify-center text-[10px]" style={{ display: 'none' }}>?</span>
            </span>
            <span className="text-[11px] font-normal">Help & Support</span>
            <svg className="w-3 h-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
          <span className="text-[8px] text-gray-400">© 2025, Bloomevera Solutions LLP. All Rights Reserved.</span>
        </div>
      </div>
      <HelpSupportDrawer isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </div>
  );
};

export default FDOnboarding;
