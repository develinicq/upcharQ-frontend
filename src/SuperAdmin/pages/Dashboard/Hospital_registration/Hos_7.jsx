import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import RegistrationSuccess from "../../../../components/RegistrationSuccess";
import useHospitalRegistrationStore from "../../../../store/useHospitalRegistrationStore";
import useHospitalStep1Store from "../../../../store/useHospitalStep1Store";
import { useRegistration } from "../../../context/RegistrationContext";

const Hos_7 = () => {
  const navigate = useNavigate();
  const { name: hospitalName, hospitalId } = useHospitalRegistrationStore();
  const { resetRegistration } = useRegistration();

  useEffect(() => {
    // Prevent scrolling on body and html
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    // Disable back navigation
    window.history.pushState(null, '', window.location.href);
    const handlePopState = () => {
      window.history.pushState(null, '', window.location.href);
    };
    window.addEventListener('popstate', handlePopState);
    // Cleanup function to restore scrolling and popstate
    return () => {
      document.body.style.overflow = 'unset';
      document.documentElement.style.overflow = 'unset';
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const handleClose = () => {
    // Reset all stores
    resetRegistration();
    useHospitalStep1Store.getState().reset();
    useHospitalRegistrationStore.getState().reset();
    // Navigate to hospitals list
    navigate('/hospitals');
  };

  const handleGoToProfile = () => {
    // Capture ID before reset
    const hid = hospitalId || useHospitalStep1Store.getState().hospitalId;

    // Reset all stores
    resetRegistration();
    useHospitalStep1Store.getState().reset();
    useHospitalRegistrationStore.getState().reset();

    // Navigate to hospital profile
    if (hid) {
      navigate(`/hospital/${hid}`);
    } else {
      navigate('/hospitals');
    }
  };

  return (
    <div className="h-full bg-white flex flex-col">
      <div className="flex-1 overflow-y-auto">
        <RegistrationSuccess name={hospitalName || 'Hospital'} />
      </div>

      {/* Footer with buttons - Only one instance */}
      <div className="border-t border-gray-200 bg-white px-6 py-4 sticky bottom-0 z-10">
        <div className="max-w-[700px] mx-auto flex justify-between gap-3">
          <button
            onClick={handleClose}
            className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 text-sm"
          >
            Close
          </button>
          <button
            onClick={handleGoToProfile}
            className="px-6 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 text-sm shadow-sm"
          >
            Go to Profile →
          </button>
        </div>
      </div>
    </div>
  );
};

export default Hos_7;
