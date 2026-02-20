import React, { createContext, useContext, useState } from 'react';

const RegistrationContext = createContext();

export const useRegistration = () => {
  return useContext(RegistrationContext);
};

export const RegistrationProvider = ({ children }) => {
  const [currentStep, setCurrentStep] = useState(() => {
    try {
      const saved = localStorage.getItem('reg_currentStep');
      return saved ? Number(saved) : 1;
    } catch { return 1; }
  });

  const [registrationType, setRegistrationType] = useState(() => {
    try {
      return localStorage.getItem('reg_registrationType') || '';
    } catch { return ''; }
  });

  const [formData, setFormData] = useState(() => {
    try {
      const saved = localStorage.getItem('reg_formData');
      return saved ? JSON.parse(saved) : {
        hosStep3SubStep: 1,
        hosStep5SubStep: 1,
        hosTermsAccepted: false,
        hosPrivacyAccepted: false,
        hosSelectedPlan: 'Basic Hospital',
        isDoctor: 'no'
      };
    } catch {
      return {
        hosStep3SubStep: 1,
        hosStep5SubStep: 1,
        hosTermsAccepted: false,
        hosPrivacyAccepted: false,
        hosSelectedPlan: 'Basic Hospital',
        isDoctor: 'no'
      };
    }
  });

  // Persistence Effects
  React.useEffect(() => {
    localStorage.setItem('reg_currentStep', currentStep);
  }, [currentStep]);

  React.useEffect(() => {
    localStorage.setItem('reg_registrationType', registrationType);
  }, [registrationType]);

  React.useEffect(() => {
    localStorage.setItem('reg_formData', JSON.stringify(formData));
  }, [formData]);

  const nextStep = () => {
    setCurrentStep(prev => {
      return prev + 1;
    });
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(1, prev - 1));
  };

  const goToStep = (step) => {
    setCurrentStep(step);
  };

  const resetRegistration = () => {
    setCurrentStep(1);
    setFormData({
      hosStep3SubStep: 1,
      hosStep5SubStep: 1,
      step4SubStep: 1,
      step5SubStep: 1,
      hosTermsAccepted: false,
      hosPrivacyAccepted: false,
      termsAccepted: false,
      privacyAccepted: false,
      hosSelectedPlan: 'Basic Hospital',
      isDoctor: 'no',
      specialization: '',
      experience: '',
      councilName: '',
      regYear: '',
      councilNumber: '',
      graduation: '',
      graduationCollege: '',
      graduationYear: '',
      pgDegree: '',
      pgCollege: '',
      pgYear: '',
      clinicName: '',
      clinicContactEmail: '',
      clinicContactNumber: '',
    });
    // Clear storage
    localStorage.removeItem('reg_currentStep');
    localStorage.removeItem('reg_registrationType');
    localStorage.removeItem('reg_formData');
  };


  const updateFormData = (data) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const value = {
    currentStep,
    registrationType,
    formData,
    setRegistrationType,
    setCurrentStep,
    nextStep,
    prevStep,
    goToStep,
    resetRegistration,
    updateFormData
  };

  return (
    <RegistrationContext.Provider value={value}>
      {children}
    </RegistrationContext.Provider>
  );
};
