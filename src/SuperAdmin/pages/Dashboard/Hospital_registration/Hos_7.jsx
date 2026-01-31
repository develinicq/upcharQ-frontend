import React, { useEffect } from "react";
import RegistrationSuccess from "../../../../components/RegistrationSuccess";
import useHospitalRegistrationStore from "../../../../store/useHospitalRegistrationStore";

const Hos_7 = () => {
  const { name: hospitalName } = useHospitalRegistrationStore();

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

  return (
    <div className="h-full bg-white">
      <RegistrationSuccess name={hospitalName || 'Hospital'} />
    </div>
  );
};

export default Hos_7;
