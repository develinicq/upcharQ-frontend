import { useLocation, useNavigate } from "react-router-dom";
import { createHospital, activateHospital } from '../../services/hospitalService';
import useHospitalRegistrationStore from '../../store/useHospitalRegistrationStore';
import { useRegistration } from "../../SuperAdmin/context/RegistrationContext";
import SidebarSteps from "../../SuperAdmin/components/RegistrationSidebar/SidebarSteps";
import RegistrationFooter from "../RegistrationFooter";
import RegistrationFlow from "../RegistrationFlow";
import React, { useRef, useState } from "react";
import useToastStore from "../../store/useToastStore";
import useHospitalStep1Store from "../../store/useHospitalStep1Store";
import Step1 from '../../SuperAdmin/pages/Dashboard/Doctor_registration/Step1';
import Step2 from '../../SuperAdmin/pages/Dashboard/Doctor_registration/Step2';
import Step5 from '../../SuperAdmin/pages/Dashboard/Doctor_registration/Step5';
// Import stores directly to avoid runtime require (ESM only)
import useDoctorRegistrationStore from '../../store/useDoctorRegistrationStore';
import useDoctorStep1Store from '../../store/useDoctorStep1Store';
import useHospitalDoctorDetailsStore from '../../store/useHospitalDoctorDetailsStore';
import Navbar from '../Navbar';

const Layout_registration_test = () => {
  const { currentStep, nextStep, prevStep, registrationType, setRegistrationType, formData, updateFormData, setCurrentStep } = useRegistration();
  // const doctorRegisterStore = useDoctorRegisterStore();
  const [footerLoading, setFooterLoading] = useState(false);
  // Ref for Step1 form
  const step1Ref = useRef();
  const step2Ref = useRef();
  const step3Ref = useRef();
  const step5Ref = useRef(); // Added ref for Step 5
  const hos1Ref = useRef();
  const hos2Ref = useRef();
  const hos3Ref = useRef();
  const hos4Ref = useRef();
  const location = useLocation();
  const navigate = useNavigate();

  // State from stores to check for userId
  const { userId: regUserId, setField: setRegField } = useDoctorRegistrationStore();
  const { userId: step1UserId } = useDoctorStep1Store();

  // Determine registration type from current route
  React.useEffect(() => {
    if (location.pathname.includes('/doctor')) {
      setRegistrationType('doctor');
      setCurrentStep(1); // Always start at step 1
    } else if (location.pathname.includes('/hospital')) {
      setRegistrationType('hospital');
      setCurrentStep(1); // Always start at step 1
    } else {
      setRegistrationType('doctor');
      setCurrentStep(1);
    }
  }, [location.pathname, setRegistrationType, setCurrentStep]);

  // Inject mock userId for testing purposes if missing
  React.useEffect(() => {
    if (registrationType === 'doctor' && !regUserId && !step1UserId) {
      console.log("Layout_test: Injecting mock userId for testing");
      setRegField('userId', 'TEST_DOC_123');
    }
  }, [registrationType, regUserId, step1UserId, setRegField]);

  // Map formData to API schema for store
  const mapToApiSchema = () => {
    return {
      specialization: formData.specialization,
      experienceYears: formData.experience,
      medicalCouncilName: formData.councilName,
      medicalCouncilRegYear: formData.regYear,
      medicalCouncilRegNo: formData.councilNumber,
      medicalDegreeType: formData.graduation,
      medicalDegreeUniversityName: formData.graduationCollege,
      medicalDegreeYearOfCompletion: formData.graduationYear,
      pgMedicalDegreeType: formData.pgDegree,
      pgMedicalDegreeUniversityName: formData.pgCollege,
      pgMedicalDegreeYearOfCompletion: formData.pgYear,
      hasClinic: !!formData.clinicName,
      clinicData: {
        name: formData.clinicName,
        email: formData.clinicContactEmail,
        phone: formData.clinicContactNumber,
        proof: formData.uploadEstablishmentProof,
        latitude: formData.mapLocation?.lat || '',
        longitude: formData.mapLocation?.lng || '',
        blockNo: formData.blockNo,
        areaStreet: formData.roadAreaStreet,
        landmark: formData.landmark,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        image: formData.uploadHospitalImage,
        panCard: formData.panCard || ''
      },
      documents: formData.documents || [],
    };
  };

  // Build Hospital payload from context formData (prunes UI-only wizard fields)
  const buildHospitalPayloadFromFormData = () => {
    // Address
    const address = {
      blockNo: formData.blockNumber || '',
      landmark: formData.landmark || '',
      street: formData.roadAreaStreet || ''
    };

    // Documents
    const documents = [];
    if (formData.gstin) documents.push({ no: formData.gstin, type: 'GST', url: formData.gstinFile || '' });
    if (formData.stateHealthReg) documents.push({ no: formData.stateHealthReg, type: 'State Health Reg No', url: formData.stateHealthRegFile || '' });
    if (formData.panCard) documents.push({ no: formData.panCard, type: 'Pan Card', url: formData.panCardFile || '' });
    if (formData.cinNumber) documents.push({ no: formData.cinNumber, type: 'CIN', url: formData.cinFile || '' });
    if (formData.rohiniId) documents.push({ no: formData.rohiniId, type: 'Rohini ID', url: formData.rohiniFile || '' });
    if (formData.nabhAccreditation) documents.push({ no: formData.nabhAccreditation, type: 'NABH', url: formData.nabhFile || '' });

    // Operating Hours
    const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    const operatingHours = days.map(day => ({
      dayOfWeek: day,
      isAvailable: (formData.operatingHours || []).includes(day.charAt(0).toUpperCase() + day.slice(1)),
      is24Hours: formData[`${day}24Hours`] || false,
      timeRanges: [
        { startTime: formData[`${day}StartTime`] || "09:00", endTime: formData[`${day}EndTime`] || "18:00" }
      ]
    }));

    // Compose payload with exact API shape
    const payload = {
      name: formData.hospitalName,
      type: formData.hospitalType,
      emailId: formData.hospitalEmail,
      phone: formData.hospitalContact,
      address,
      city: formData.city,
      state: formData.state,
      pincode: formData.pincode,
      url: formData.website,
      logo: formData.logoKey || '',
      image: formData.hospitalImageKey || '',
      latitude: formData.latitude || 0,
      longitude: formData.longitude || 0,
      medicalSpecialties: formData.medicalSpecialties || [],
      hospitalServices: formData.hospitalServices || [],
      establishmentYear: formData.establishedYear,
      noOfBeds: formData.numberOfBeds,
      accreditation: formData.accreditations || [],
      adminId: formData.adminId || '',
      documents,
      operatingHours
    };

    // Prune empty values
    const prune = (obj) => {
      if (Array.isArray(obj)) {
        return obj
          .map((v) => (typeof v === 'object' && v !== null ? prune(v) : v))
          .filter((v) => v !== undefined && v !== null && v !== '');
      }
      if (typeof obj === 'object' && obj !== null) {
        const out = {};
        Object.entries(obj).forEach(([k, v]) => {
          if (v === undefined || v === null || v === '') return;
          const nv = typeof v === 'object' ? prune(v) : v;
          if (
            nv === undefined ||
            nv === null ||
            (Array.isArray(nv) && nv.length === 0) ||
            (typeof nv === 'object' && !Array.isArray(nv) && Object.keys(nv).length === 0)
          )
            return;
          out[k] = nv;
        });
        return out;
      }
      return obj;
    };

    return prune(payload);
  };

  const store = useHospitalRegistrationStore();
  const handleNext = async () => {
    if (registrationType === 'doctor' && currentStep === 5) {
      const success = await step5Ref.current?.submit();
      if (success) setCurrentStep(7); // Move directly to Step 7 (Success Page)
    } else {
      nextStep();
    }
  };

  const handlePrev = () => {
    if (registrationType === 'doctor') {
      // Handle Step 4 sub-steps
      if (currentStep === 4) {
        const currentSubStep = formData.step4SubStep || 1;
        if (currentSubStep === 2) {
          // Move back to sub-step 1
          updateFormData({ step4SubStep: 1 });
        } else if (currentSubStep === 1 && currentStep > 1) {
          // Move to previous main step
          prevStep();
        }
      } else if (currentStep === 5) {
        const currentSubStep = formData.step5SubStep || 1;
        if (currentSubStep === 2) {
          updateFormData({ step5SubStep: 1 });
        } else {
          prevStep();
        }
      } else if (currentStep === 7) {
        // Move back from success page to Step 5
        setCurrentStep(5);
        updateFormData({ step5SubStep: 2 });
      } else if (currentStep > 1) {
        prevStep();
      }
    } else if (registrationType === 'hospital') {
      // Handle Step 2 for hospital (Doctor Registration or Hospital Details)
      if (currentStep === 2) {
        // Check if user is a doctor to determine if this is Doctor Registration or Hospital Details
        if (formData.isDoctor === 'no') {
          // When user is not a doctor, Step 2 is Hospital Details (Hos_3) with sub-steps
          const currentSubStep = formData.hosStep3SubStep || 1;
          if (currentSubStep === 2) {
            // Move back to sub-step 1 (Hospital Details)
            updateFormData({ hosStep3SubStep: 1 });
          } else if (currentSubStep === 1 && currentStep > 1) {
            // Move to previous main step
            prevStep();
          }
        } else {
          // When user is a doctor, Step 2 is Doctor Registration (Hos_2) - no sub-steps, just move to previous step
          if (currentStep > 1) {
            prevStep();
          }
        }
      }
      // Handle Step 3 for hospital (Hospital Details or Documents Verification)
      else if (currentStep === 3) {
        // Check if user is a doctor to determine if this is Hospital Details or Documents Verification
        if (formData.isDoctor === 'no') {
          // When user is not a doctor, Step 3 is Documents Verification (Hos_4) - no sub-steps
          if (currentStep > 1) {
            prevStep();
          }
        } else {
          // When user is a doctor, Step 3 is Hospital Details (Hos_3) with sub-steps
          const currentSubStep = formData.hosStep3SubStep || 1;
          if (currentSubStep === 2) {
            // Move back to sub-step 1 (Hospital Details)
            updateFormData({ hosStep3SubStep: 1 });
          } else if (currentSubStep === 1 && currentStep > 1) {
            // Check if user is a doctor to determine previous step
            if (formData.isDoctor === 'yes') {
              // User is a doctor, go back to Step 2 (Doctor Registration)
              setCurrentStep(2);
            } else {
              // User is not a doctor, go back to Step 1 (Account Creation)
              setCurrentStep(1);
            }
          }
        }
      }
      // Handle Step 4 for hospital (Documents Verification - no sub-steps)
      else if (currentStep === 4) {
        // Check if user is a doctor to determine if this is Documents Verification or Review & Create
        if (formData.isDoctor === 'no') {
          // When user is not a doctor, Step 4 is Review & Create (Hos_5) with sub-steps
          const currentSubStep = formData.hosStep5SubStep || 1;
          if (currentSubStep === 2) {
            // Move back to sub-step 1 (Review)
            updateFormData({ hosStep5SubStep: 1 });
          } else if (currentSubStep === 1 && currentStep > 1) {
            // Move to previous main step
            prevStep();
          }
        } else {
          // When user is a doctor, Step 4 is Documents Verification - no sub-steps, just move to previous step
          if (currentStep > 1) {
            prevStep();
          }
        }
      }
      // Handle Step 5 for hospital (Package & Payment or Review & Create)
      else if (currentStep === 5) {
        // Check if user is a doctor to determine if this is Package & Payment or Review & Create
        if (formData.isDoctor === 'no') {
          // When user is not a doctor, Step 5 is Package & Payment (Hos_6) - no sub-steps
          if (currentStep > 1) {
            prevStep();
          }
        } else {
          // When user is a doctor, Step 5 is Review & Create (Hos_5) with sub-steps
          const currentSubStep = formData.hosStep5SubStep || 1;
          if (currentSubStep === 2) {
            // Move back to sub-step 1 (Review)
            updateFormData({ hosStep5SubStep: 1 });
          } else if (currentSubStep === 1 && currentStep > 1) {
            // Move to previous main step
            prevStep();
          }
        }
      } else if (currentStep === 7) {
        // Move back from success page to Step 6
        prevStep();
      } else if (currentStep === 6) {
        // Move back from Step 6 to Step 5
        prevStep();
      } else if (currentStep > 1) {
        prevStep();
      }
    }
  };

  const handleCancel = () => {
    navigate('/');
  };

  // Determine button labels for different steps
  const getNextButtonLabel = () => {
    if (registrationType === 'doctor') {
      if (currentStep === 4) {
        const currentSubStep = formData.step4SubStep || 1;
        if (currentSubStep === 1) {
          return "Save & Next →";
        }
      } else if (currentStep === 5) {
        const currentSubStep = formData.step5SubStep || 1;
        return currentSubStep === 1 ? "Preview Purchase" : "Confirm Purchase";
      } else if (currentStep === 6) {
        // Profile completion page
        return "Go to Profile";
      }
      return "Save & Next →";
    }

    else if (registrationType === 'hospital') {
      if (currentStep === 2) {
        // Check if user is a doctor to determine if this is Doctor Registration or Hospital Details
        if (formData.isDoctor === 'no') {
          // When user is not a doctor, Step 2 is Hospital Details (Hos_3) with sub-steps
          const currentSubStep = formData.hosStep3SubStep || 1;
          if (currentSubStep === 1) {
            return "Save & Next →";
          } else if (currentSubStep === 2) {
            return "Save & Next →";
          }
        } else {
          // When user is a doctor, Step 2 is Doctor Registration (Hos_2) - no sub-steps
          return "Save & Next →";
        }
      } else if (currentStep === 3) {
        // Check if user is a doctor to determine if this is Hospital Details or Documents Verification
        if (formData.isDoctor === 'no') {
          // When user is not a doctor, Step 3 is Documents Verification (Hos_4) - no sub-steps
          return "Save & Next →";
        } else {
          // When user is a doctor, Step 3 is Hospital Details (Hos_3) with sub-steps
          const currentSubStep = formData.hosStep3SubStep || 1;
          if (currentSubStep === 1) {
            return "Save & Next →";
          } else if (currentSubStep === 2) {
            return "Save & Next →";
          }
        }
      } else if (currentStep === 4) {
        // Check if user is a doctor to determine if this is Documents Verification or Review & Create
        if (formData.isDoctor === 'no') {
          // When user is not a doctor, Step 4 is Review & Create (Hos_5) with sub-steps
          const currentSubStep = formData.hosStep5SubStep || 1;
          if (currentSubStep === 1) {
            return "Save & Next →";
          } else if (currentSubStep === 2) {
            // Review & Agreement sub-step 2
            return formData.hosTermsAccepted && formData.hosPrivacyAccepted ? "Save & Activate" : "Accept Terms to Continue";
          }
        } else {
          // When user is a doctor, Step 4 is Documents Verification - no sub-steps
          return "Save & Next →";
        }
      } else if (currentStep === 5) {
        // Check if user is a doctor to determine if this is Package & Payment or Review & Create
        if (formData.isDoctor === 'no') {
          // When user is not a doctor, Step 5 is Package & Payment (Hos_6)
          return "Send Payment Link";
        } else {
          // When user is a doctor, Step 5 is Review & Create (Hos_5) with sub-steps
          const currentSubStep = formData.hosStep5SubStep || 1;
          if (currentSubStep === 1) {
            return "Save & Next →";
          } else if (currentSubStep === 2) {
            // Review & Agreement sub-step 2
            return formData.hosTermsAccepted && formData.hosPrivacyAccepted ? "Save & Activate" : "Accept Terms to Continue";
          }
        }
      } else if (currentStep === (formData.isDoctor === 'no' ? 6 : 7)) {
        // Profile completion page (Hos_7)
        return "Go to Profile";
      } else if (currentStep === 6 && formData.isDoctor === 'yes') {
        // Package & Payment step (Hos_6) - only when user is a doctor
        return "Send Payment Link";
      }
      return "Save & Next →";
    }

    return "Save & Next →";
  };

  const nextLabel = getNextButtonLabel();
  const maxSteps = registrationType === 'doctor' ? 7 : (formData.isDoctor === 'no' ? 6 : 7);

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <div className="flex-none z-[110] bg-white">
        <Navbar />
      </div>
      <div className="flex-1 flex bg-gray-100 p-3 gap-3 overflow-hidden">
        {/* Sidebar - Fixed */}
        <div className="flex-shrink-0">
          <SidebarSteps currentStep={currentStep} />
        </div>

        {/* Main + Footer - Fixed height container */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">

          <main className="flex-1 overflow-y-auto ">
            {/* Render Step1 with ref for doctor step 1, Hos_1 with ref for hospital step 1, else use RegistrationFlow */}
            {registrationType === 'doctor' && currentStep === 1 ? (
              <div className="h-full">
                <Step1 ref={step1Ref} onNext={nextStep/*Directly advance*/} onCancel={handleCancel} />
              </div>
            ) : registrationType === 'doctor' && currentStep === 2 ? (
              <div className="h-full">
                <Step2 ref={step2Ref} />
              </div>
            ) : registrationType === 'doctor' && currentStep === 5 ? (
              <div className="h-full">
                <Step5 ref={step5Ref} />
              </div>
            ) : registrationType === 'hospital' && currentStep === 1 ? (
              <RegistrationFlow type={registrationType} ref={hos1Ref} />
            ) : (
              <div
                className={`flex-1 transition-opacity duration-500 ease-in-out ${false ? "opacity-0" : "opacity-100"
                  } w-[100%] h-full`}
              >
                <div className="flex-1 h-full w-[100%]">
                  <RegistrationFlow ref={
                    registrationType === 'doctor' ? (
                      currentStep === 1 ? step1Ref :
                        currentStep === 2 ? step2Ref :
                          currentStep === 3 ? step3Ref :
                            null
                    ) : (
                      currentStep === 1 ? hos1Ref :
                        currentStep === 2 ? (formData.isDoctor === 'no' ? hos3Ref : hos2Ref) :
                          currentStep === 3 ? (formData.isDoctor === 'no' ? hos4Ref : hos3Ref) :
                            currentStep === 4 ? (formData.isDoctor === 'no' ? null : hos4Ref) :
                              null
                    )
                  } type={registrationType} />
                </div>
              </div>
            )}
          </main>

          {/* Footer - Fixed */}
          <RegistrationFooter
            onCancel={handleCancel}
            onNext={handleNext}
            onPrev={handlePrev}
            currentStep={currentStep}
            maxSteps={maxSteps}
            nextLabel={nextLabel}
            disablePrev={
              (registrationType === 'doctor' && (currentStep === 1 || currentStep === 2 || currentStep === 6)) ||
              (registrationType === 'hospital' && (
                currentStep === 1 ||
                (currentStep === 2 && (formData.hosStep3SubStep || 1) === 1) ||
                (currentStep === maxSteps)
              ))
            }
            loading={footerLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default Layout_registration_test;
