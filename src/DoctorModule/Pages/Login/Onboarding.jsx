import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useAuthStore from '../../../store/useAuthStore';
import axios from '../../../lib/axios';
import Button from '../../../components/Button';
import PasswordRequirements from '../../../components/FormItems/PasswordRequirements';
import PasswordStrengthBar from '../../../components/FormItems/PasswordStrengthBar';
import DoctorInfoCard from '../../Components/Login/DoctorInfoCard';
import Input from '../../../components/FormItems/Input';

const Onboarding = ({ onContinue }) => {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [searchParams] = useSearchParams();
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const token = useAuthStore((s) => s.token);
  const didFetchRef = useRef(false);
  useEffect(() => {
    if (didFetchRef.current) return;
    didFetchRef.current = true;
    const code = searchParams.get('code');
    if (!code) {
      setError('No invitation code found in URL.');
      setLoading(false);
      return;
    }
    const params = { code, _ts: Date.now() };
    const headers = {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Pragma: 'no-cache',
      Expires: '0',
    };
    axios
      .get('/invitations/checkInvitation', {
        params,
        headers,
        validateStatus: (s) => (s >= 200 && s < 300) || s === 304,
      })
      .then(async (res) => {
        if (res.status === 304) {
          // If we don't have details yet, force a one-time retry with a stronger cache buster
          if (!details) {
            const retryParams = { code, _ts: Date.now(), _nocache: Math.random() };
            const retry = await axios.get('/invitations/checkInvitation', {
              params: retryParams,
              headers,
            });
            const result = retry.data;
            if (result?.success) {
              setDetails(result.data);
            } else {
              setError(result?.message || 'Invalid invitation.');
            }
          }
          setLoading(false);
          return;
        }
        const result = res.data;
        if (result?.success) {
          setDetails(result.data);
        } else {
          setError(result?.message || 'Invalid invitation.');
        }
        setLoading(false);
      })
      .catch((err) => {
        const status = err?.response?.status;
        const serverMsg = err?.response?.data?.message;
        const msg = serverMsg || (status ? `Request failed with status ${status}` : 'Failed to fetch invitation details.');
        // Add hint if token absent
        if (!token) {
          setError(`${msg} (No auth token found. Please login as Super Admin.)`);
        } else {
          setError(msg);
        }
        setLoading(false);
      });
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const requirements = [
    (pw) => pw.length >= 8 && pw.length <= 15,
    (pw) => /[A-Z]/.test(pw),
    (pw) => /[a-z]/.test(pw),
    (pw) => /[0-9]/.test(pw),
    (pw) => /[!@#$%^&*]/.test(pw),
  ];

  const passwordEyeIcon = (
    <span
      className="text-gray-500 hover:text-gray-700"
      style={{ display: 'inline-flex', alignItems: 'center' }}
      onClick={() => setShowPassword((v) => !v)}
      aria-label={showPassword ? 'Hide password' : 'Show password'}
      role="button"
      tabIndex={0}
    >
      {showPassword ? (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.657.336-3.234.938-4.675m1.662-2.337A9.956 9.956 0 0112 3c5.523 0 10 4.477 10 10 0 1.657-.336-3.234-.938-4.675m-1.662 2.337A9.956 9.956 0 0112 21c-5.523 0-10-4.477-10-10 0-1.657.336-3.234.938-4.675" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.657-.336-3.234-.938-4.675m1.662-2.337A9.956 9.956 0 0112 3c5.523 0 10 4.477 10 10 0 1.657-.336-3.234-.938 4.675m-1.662 2.337A9.956 9.956 0 0112 21c-5.523 0-10-4.477-10-10 0-1.657.336-3.234.938-4.675" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.271 4.271l15.458 15.458" /></svg>
      )}
    </span>
  );
  const confirmPasswordEyeIcon = (
    <span
      className="text-gray-500 hover:text-gray-700"
      style={{ display: 'inline-flex', alignItems: 'center' }}
      onClick={() => setShowConfirmPassword((v) => !v)}
      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
      role="button"
      tabIndex={0}
    >
      {showConfirmPassword ? (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.657-.336-3.234-.938-4.675m1.662-2.337A9.956 9.956 0 0112 3c5.523 0 10 4.477 10 10 0 1.657-.336-3.234-.938-4.675m-1.662 2.337A9.956 9.956 0 0112 21c-5.523 0-10-4.477-10-10 0-1.657.336-3.234.938-4.675" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.657-.336-3.234-.938-4.675m1.662-2.337A9.956 9.956 0 0112 3c5.523 0 10 4.477 10 10 0 1.657-.336-3.234-.938 4.675m-1.662 2.337A9.956 9.956 0 0112 21c-5.523 0-10-4.477-10-10 0-1.657.336-3.234.938-4.675" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.271 4.271l15.458 15.458" /></svg>
      )}
    </span>
  );
  // Password validation logic
  const isPasswordValid = requirements.every((fn) => fn(formData.password));
  const isPasswordsMatch = formData.password && formData.confirmPassword && formData.password === formData.confirmPassword;

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-600">{error}</div>;
  }
  const user = details?.user;
  const invitation = details?.invitation;
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-2">
      <div>
        <div className="bg-white rounded-2xl flex flex-col shadow-lg w-full max-w-xl border-2 border-blue-200">
          {/* Upper section with padding */}
          <div className="p-6 sm:p-8 flex flex-col gap-6">
            <div className="text-center gap-1 flex flex-col">
              <h2 className="text-2xl font-bold text-gray-800">
                Welcome, {user?.firstName} {user?.lastName}
              </h2>
              <p className="text-sm text-gray-500">
                Let’s set your account security password for your account.<br/>
              </p>
            </div>
            {/* Center info box restored with dynamic details */}
            <DoctorInfoCard
              name={`${user?.firstName ? `Dr. ${user.firstName} ${user?.lastName || ''}`.trim() : 'Doctor'}`}
              title={invitation?.type === 'STAFF' ? 'Hospital Staff' : 'General Physician'}
              degree={user?.degree || 'MBBS, MD - General Medicine'}
              email={user?.emailId}
              phone={user?.phone}
              code={user?.id?.slice(0, 8) || '—'}
              avatarUrl={user?.profilePhoto || undefined}
            />
            <form className="flex flex-col gap-6">
              <div className=''>
                <div className="relative flex flex-col gap-2">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Minimum 8 character"
                    autoComplete="new-password"
                    label={"Create Password"}
                    compulsory={true}
                    icon={passwordEyeIcon}
                  />
                  <PasswordStrengthBar password={formData.password} />
                </div>
              </div>
              <div>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Minimum 8 character"
                    autoComplete="new-password"
                    label={"Confirm Password"}
                    compulsory={true}
                    icon={confirmPasswordEyeIcon}
                  />
                </div>
                {formData.confirmPassword && isPasswordsMatch && (
                  <p className="text-xs text-green-600 mt-1">Passwords Matched</p>
                )}
                {formData.confirmPassword && !isPasswordsMatch && (
                  <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                )}
              </div>
              <PasswordRequirements password={formData.password} />
              <div className="pt-2">
                <Button
                  variant="primary"
                  disabled={!(isPasswordsMatch && isPasswordValid)}
                  className="w-full text-center"
                  onClick={() => {
                    if (onContinue) {
                      return onContinue({
                        details,
                        password: formData.password,
                        confirmPassword: formData.confirmPassword,
                      });
                    }
                    navigate('/verification');
                  }}
                >
                  Continue to Verification
                </Button>
              </div>
            </form>
          </div>{/* end upper padded section */}
          {/* Bottom info bar (no outer padding) */}
          <div className="px-4 py-3 border-t border-gray-200 rounded-b-2xl">
            <div className="text-xs text-gray-600 flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-4 h-4 rounded-full border border-gray-300 text-gray-500">i</span>
              <span>
                By clicking the button above, you agree to our{' '}
                <a href="#" className="text-blue-600 underline hover:underline">Terms of Service</a>
                {' '}and{' '}
                <a href="#" className="text-blue-600 underline hover:underline">Privacy Policy</a>.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
