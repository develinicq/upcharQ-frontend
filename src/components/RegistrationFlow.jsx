import React from 'react';
import { useRegistration } from '../SuperAdmin/context/RegistrationContext';

// Doctor Registration Steps
import Step1 from '../SuperAdmin/pages/Dashboard/Doctor_registration/Step1';
import Step2 from '../SuperAdmin/pages/Dashboard/Doctor_registration/Step2';
import Step3 from '../SuperAdmin/pages/Dashboard/Doctor_registration/Step3';
import Step4 from '../SuperAdmin/pages/Dashboard/Doctor_registration/Step4';
import Step5 from '../SuperAdmin/pages/Dashboard/Doctor_registration/Step5';
import Step6 from '../SuperAdmin/pages/Dashboard/Doctor_registration/Step6';
import Step7 from '../SuperAdmin/pages/Dashboard/Doctor_registration/Step7';

// Hospital Registration Steps
import Hos_1 from '../SuperAdmin/pages/Dashboard/Hospital_registration/Hos_1';
import Hos_2 from '../SuperAdmin/pages/Dashboard/Hospital_registration/Hos_2';
import Hos_3 from '../SuperAdmin/pages/Dashboard/Hospital_registration/Hos_3';
import Hos_4 from '../SuperAdmin/pages/Dashboard/Hospital_registration/Hos_4';
import Hos_5 from '../SuperAdmin/pages/Dashboard/Hospital_registration/Hos_5';
import Hos_6 from '../SuperAdmin/pages/Dashboard/Hospital_registration/Hos_6';
import Hos_7 from '../SuperAdmin/pages/Dashboard/Hospital_registration/Hos_7';


const RegistrationFlow = React.forwardRef(({ type }, ref) => {
  const { currentStep, formData } = useRegistration();

  // Render the appropriate step component based on registration type and current step
  const renderStepComponent = () => {
    console.log("RegistrationFlow: Rendering for type", type, "step", currentStep);
    if (type === 'doctor') {
      switch (currentStep) {
        case 1:
          return <Step1 ref={ref} />;
        case 2:
          return <Step2 ref={ref} />;
        case 3:
          return <Step3 ref={ref} />;
        case 4:
          return <Step4 />;
        case 5:
          return <Step5 />;
        case 6:
          return <Step6 />;
        case 7:
          return <Step7 />;
        default:
          return <Step1 />;
      }
    } else if (type === 'hospital') {
      // Handle conditional step rendering based on isDoctor selection
      if (formData.isDoctor === 'no') {
        switch (currentStep) {
          case 1:
            return <Hos_1 ref={ref} />;
          case 2:
            return <Hos_3 ref={ref} />; // Hospital Details
          case 3:
            return <Hos_4 ref={ref} />; // Documents Verification
          case 4:
            return <Hos_5 />; // Review & Create
          case 5:
            return <Hos_6 />; // Package & Payment
          case 6:
            return <Hos_7 />; // Registration Complete
          default:
            return <Hos_1 ref={ref} />;
        }
      } else {
        switch (currentStep) {
          case 1:
            return <Hos_1 ref={ref} />;
          case 2:
            return <Hos_2 ref={ref} />;
          case 3:
            return <Hos_3 ref={ref} />;
          case 4:
            return <Hos_4 ref={ref} />;
          case 5:
            return <Hos_5 />;
          case 6:
            return <Hos_6 />;
          case 7:
            return <Hos_7 />;
          default:
            return <Hos_1 ref={ref} />;
        }
      }
    }

    return null;
  };

  return renderStepComponent();
});

export default RegistrationFlow;
