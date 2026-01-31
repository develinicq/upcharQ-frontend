import React from "react";
import { useRegistration } from "../SuperAdmin/context/RegistrationContext";
import useDoctorRegistrationStore from '../store/useDoctorRegistrationStore';
import useDoctorStep1Store from '../store/useDoctorStep1Store';
import { ArrowLeft } from "lucide-react";

import UniversalLoader from "./UniversalLoader";

import useHospitalStep1Store from '../store/useHospitalStep1Store';
import useHospitalDoctorDetailsStore from '../store/useHospitalDoctorDetailsStore';
import useHospitalRegistrationStore from '../store/useHospitalRegistrationStore';

const RegistrationFooter = ({ onCancel, onNext, onPrev, currentStep, maxSteps, nextLabel = "Save & Next", disablePrev = false, loading = false, bypassValidation = false }) => {
  const { registrationType, formData, setCurrentStep } = useRegistration();
  const [localError, setLocalError] = React.useState(null);
  const [disablePrevLocal, setDisablePrevLocal] = React.useState(false);
  const isHospital = registrationType === 'hospital';
  const hospitalOwnerAlsoDoctor = isHospital && String(formData?.isDoctor || 'no') === 'yes';

  // State from stores for validation
  const step1State = useDoctorStep1Store();

  // Hospital Steps
  const hosStep1 = useHospitalStep1Store();
  const hosStep2 = useHospitalDoctorDetailsStore();
  const hosStep3 = useHospitalRegistrationStore();
  const regState = useDoctorRegistrationStore();
  const { submit, loading: storeLoading, error, success } = regState;

  const validateHosStep1 = () => {
    const { form } = hosStep1;
    if (!form.firstName?.trim() || !form.lastName?.trim() || !form.emailId?.trim() || !form.phone?.trim() || !form.gender || !form.city) return false;
    if (form.isAlsoDoctor && !form.profilePhotoKey) return false;

    // RegEx checks matching Hos_1.jsx
    if (!/^\S+@\S+\.\S+$/.test(form.emailId)) return false;
    if (!/^\d{10}$/.test(form.phone)) return false;

    return true;
  };

  const validateHosStep2 = () => {
    const {
      medicalCouncilRegNo,
      medicalCouncilName,
      medicalCouncilRegYear,
      medicalDegreeType,
      medicalDegreeUniversityName,
      medicalDegreeYearOfCompletion,
      specialization,
      experienceYears,
      documents,
      pgMedicalDegreeType,
      pgMedicalDegreeUniversityName,
      pgMedicalDegreeYearOfCompletion,
      additionalPractices
    } = hosStep2;

    // Required fields
    if (!medicalCouncilRegNo?.trim() || !medicalCouncilName || !medicalCouncilRegYear) return false;
    if (!medicalDegreeType || !medicalDegreeUniversityName || !medicalDegreeYearOfCompletion) return false;

    // Specialization
    const specName = typeof specialization === 'object' ? (specialization?.value || specialization?.name) : specialization;
    if (!specName || !experienceYears) return false;

    // Year formats
    if (!/^\d{4}$/.test(medicalCouncilRegYear)) return false;
    if (!/^\d{4}$/.test(medicalDegreeYearOfCompletion)) return false;

    // Experience
    if (!/^\d+$/.test(experienceYears)) return false;

    // Proofs
    const hasProof = (no) => documents?.find(d => d.no === no)?.url;
    if (!hasProof(1) || !hasProof(2)) return false;

    // PG validation if selected
    if (pgMedicalDegreeType) { // simplified check as hosStep2 handles conditional clearing
      if (!pgMedicalDegreeUniversityName || !pgMedicalDegreeYearOfCompletion) return false;
      if (!/^\d{4}$/.test(pgMedicalDegreeYearOfCompletion)) return false;
    }

    // Additional Practices validation
    const addPractices = additionalPractices || [];
    for (const p of addPractices) {
      const pSpec = typeof p.specialization === 'object' ? (p.specialization?.value || p.specialization?.name) : p.specialization;
      if (!pSpec || !p.experienceYears?.toString().trim()) return false;
      if (!/^\d+$/.test(p.experienceYears)) return false;
    }

    return true;
  };

  // Reason for disabling next button
  let disabledReason = "";
  const setReason = (msg) => { if (!disabledReason) disabledReason = msg; };

  const validateStep1 = () => {
    const { firstName, lastName, emailId, phone, gender, city, profilePhotoKey } = step1State;
    if (!firstName?.trim() || !lastName?.trim() || !emailId?.trim() || !phone?.trim() || !gender || !city) {
      setReason("Please fill all required fields");
      return false;
    }
    if (!/^\S+@\S+\.\S+$/.test(emailId)) { setReason("Invalid email"); return false; }
    if (!/^\d{10}$/.test(phone)) { setReason("Phone must be 10 digits"); return false; }
    if (!profilePhotoKey) {
      setReason("Please upload a profile picture");
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    const {
      medicalCouncilRegNo, medicalCouncilName, medicalCouncilRegYear,
      medicalDegreeType, medicalDegreeUniversityName, medicalDegreeYearOfCompletion,
      specialization, experienceYears, documents
    } = regState;

    if (!medicalCouncilRegNo?.trim() || !medicalCouncilName || !medicalCouncilRegYear) { setReason("Missing Council details"); return false; }
    if (!medicalDegreeType || !medicalDegreeUniversityName || !medicalDegreeYearOfCompletion) { setReason("Missing Education details"); return false; }

    const specName = typeof specialization === 'object' ? (specialization?.value || specialization?.name) : specialization;
    if (!specName || !experienceYears) { setReason("Missing Specialization"); return false; }

    // Check for required documents (MRN Proof = 1, Graduation Proof = 2)
    const hasDoc = (no) => documents?.some(d => d.no === no && (d.url || d.tempKey));
    if (!hasDoc(1)) { setReason("Missing MRN Proof"); return false; }
    if (!hasDoc(2)) { setReason("Missing Graduation Proof"); return false; }

    return true;
  };

  const validateStep3 = () => {
    if (!regState.hasClinic) return true;
    const { name, email, phone, blockNo, areaStreet, landmark, city, state, pincode, proof, latitude, longitude } = regState.clinicData;
    const { profilePhotoKey } = regState;

    if (!name?.trim() || !email?.trim() || !phone?.trim() || !blockNo?.trim() || !areaStreet?.trim() || !landmark?.trim() || !city?.trim() || !state?.trim() || !pincode?.trim()) {
      setReason("Missing Clinic details");
      return false;
    }

    if (!proof) {
      setReason("Missing Establishment Proof");
      return false;
    }

    if (!profilePhotoKey) {
      setReason("Missing Profile Picture");
      return false;
    }

    if (!latitude || !longitude) {
      setReason("Missing Map Location");
      return false;
    }

    return true;
  };

  const validateStep4 = () => {
    const currentSubStep = formData.step4SubStep || 1;

    // Substep 1: Basic doc validation
    if (currentSubStep === 1) {
      if (!regState.documents || regState.documents.length === 0) {
        setReason("Please upload required documents");
        return false;
      }
      return true;
    }

    // Substep 2: Terms and Agreements
    if (currentSubStep === 2) {
      if (!formData.termsAccepted || !formData.privacyAccepted) {
        setReason("Please accept Terms & Privacy Policy");
        return false;
      }
      return true;
    }

    return true;
  };

  const validateHosStep3 = () => {
    // Determine sub-step from global formData
    const subStep = Number(formData.hosStep3SubStep || 1);
    const {
      name, type, emailId, phone,
      city, state, pincode, address,
      image, url, website, noOfBeds, establishmentYear,
      medicalSpecialties, hospitalServices
    } = hosStep3;

    if (subStep === 1) {
      console.log('Hos_3 Debug: Validating Substep 1', {
        name, type, emailId, phone, city, state, pincode,
        addressBlock: address?.blockNo, addressStreet: address?.street,
        image, url
      });

      const val = (v) => String(v || '').trim();

      // Detailed checks
      if (!val(name)) { setReason('Missing Hospital Name'); return false; }
      if (!type) { setReason('Missing Hospital Type'); return false; }
      if (!establishmentYear) { setReason('Missing Established Year'); return false; }
      if (!val(emailId)) { setReason('Missing Email'); return false; }
      if (!val(phone)) { setReason('Missing Phone'); return false; }
      if (!val(city)) { setReason('Missing City'); return false; }
      if (!val(state)) { setReason('Missing State'); return false; }
      if (!val(pincode)) { setReason('Missing Pincode'); return false; }
      if (!val(address?.blockNo)) { setReason('Missing Block/Shop No'); return false; }
      if (!val(address?.street)) { setReason('Missing Street'); return false; }
      if (!image) { setReason('Missing Hospital Image'); return false; }
      if (!val(url)) { setReason('Missing Hospital URL'); return false; }

      // Strict Regex checks
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val(emailId))) { setReason('Invalid Email Format'); return false; }
      if (!/^\d{10}$/.test(val(phone))) { setReason('Phone must be 10 digits'); return false; }
      if (!/^\d{6}$/.test(val(pincode))) { setReason('Pincode must be 6 digits'); return false; }
      if (!/^(https?:\/\/)?[a-zA-Z0-9.-]+$/.test(val(url))) { setReason('Invalid URL Format'); return false; }

      if (noOfBeds && (isNaN(noOfBeds) || Number(noOfBeds) < 0)) { setReason('Invalid Beds Count'); return false; }

      return true;
    } else {
      // SubStep 2: Services
      if (!medicalSpecialties || medicalSpecialties.length === 0) { setReason('Select at least one Specialty'); return false; }
      if (!hospitalServices || hospitalServices.length === 0) { setReason('Select at least one Service'); return false; }
      return true;
    }
  };

  const validateHosStep4 = () => {
    const {
      gstin, stateHealthReg, panCard, hasCin, cinNumber, documents
    } = hosStep3; // Hos_4 uses same store as Hos_3 (useHospitalRegistrationStore)

    const getDoc = (type) => documents?.find(d => d.type === type)?.url;

    // Required Fields & Docs
    if (!gstin) { setReason('Missing GSTIN'); return false; }
    if (!getDoc('GST_PROOF')) { setReason('Missing GST Proof'); return false; }
    if (!stateHealthReg) { setReason('Missing State Registration'); return false; }
    if (!getDoc('STATE_HEALTH_REG_PROOF')) { setReason('Missing Reg Proof'); return false; }
    if (!panCard) { setReason('Missing PAN'); return false; }
    if (!getDoc('PAN_CARD')) { setReason('Missing PAN Proof'); return false; }

    // Conditional
    if (hasCin === 1 && !cinNumber) { setReason('Missing CIN'); return false; }

    return true;
  };

  const validateHosStep5 = () => {
    const subStep = formData.hosStep5SubStep || 1;
    if (subStep === 2) {
      // Must accept both Terms and Privacy
      if (!formData.hosTermsAccepted || !formData.hosPrivacyAccepted) { setReason('Accept Terms & Privacy'); return false; }
    }
    return true;
  };

  const validateHosStep6 = () => {
    // Check if plan is selected
    if (!formData.selectedPlan) { setReason('Select a Plan'); return false; }
    return true;
  };

  let isNextDisabled = false;
  if (registrationType === 'doctor') {
    if (currentStep === 1) isNextDisabled = !validateStep1();
    else if (currentStep === 2) isNextDisabled = !validateStep2();
    else if (currentStep === 3) isNextDisabled = !validateStep3();
    else if (currentStep === 4) isNextDisabled = !validateStep4();
  } else if (isHospital) {
    if (formData.isDoctor === 'no') {
      // Mapping for Non-Doctor Owner
      if (currentStep === 1) isNextDisabled = !validateHosStep1();
      else if (currentStep === 2) isNextDisabled = !validateHosStep3(); // Hos_3 (Hospital Details)
      else if (currentStep === 3) isNextDisabled = !validateHosStep4(); // Hos_4 (Documents)
      else if (currentStep === 4) isNextDisabled = !validateHosStep5(); // Hos_5 (Review)
      else if (currentStep === 5) isNextDisabled = !validateHosStep6(); // Hos_6 (Payment)
    } else {
      // Mapping for Doctor Owner
      if (currentStep === 1) isNextDisabled = !validateHosStep1();
      else if (currentStep === 2) isNextDisabled = !validateHosStep2(); // Hos_2 (Doctor Details)
      else if (currentStep === 3) isNextDisabled = !validateHosStep3(); // Hos_3 (Hospital Details)
      else if (currentStep === 4) isNextDisabled = !validateHosStep4(); // Hos_4 (Documents)
      else if (currentStep === 5) isNextDisabled = !validateHosStep5(); // Hos_5 (Review)
      else if (currentStep === 6) isNextDisabled = !validateHosStep6(); // Hos_6 (Payment)
    }
  }

  if (bypassValidation) isNextDisabled = false;

  const isLastStep = false; // Set to true if this is the final submission step

  const handleSubmit = async () => {
    setLocalError(null);
    if (isNextDisabled) return;

    const ok = await submit();
    // Bypass validation: Always proceed
    if (!ok) {
      console.warn('Final submission failed but ignored (Bypassed)');
    }
    setCurrentStep(6);
    setDisablePrevLocal(true);
  };

  return (
    <footer className="flex-shrink-0 px-6 py-6 border-t border-gray-200 flex justify-between bg-white text-sm">
      <button onClick={onCancel} className="ml-6 w-[200px] h-8 flex items-center justify-center rounded-sm border border-secondary-grey200 hover:bg-secondary-grey50 transition-colors text-secondary-grey400">
        Cancel
      </button>

      <div className="flex gap-5 items-center px-6">
        {currentStep > 1 && currentStep < maxSteps && (
          <button
            onClick={onPrev}
            className=" h-8 flex gap-1 items-center justify-center rounded-sm text-secondary-grey400 hover:text-gray-900 transition-colors disabled:opacity-50"
            disabled={disablePrev || disablePrevLocal}
          >
            <ArrowLeft size={14} />
            Previous
          </button>
        )}

        {isLastStep ? (
          <button
            onClick={handleSubmit}
            className="w-[200px] h-8 flex items-center justify-center rounded-sm bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-60"
            disabled={storeLoading || loading}
          >
            {(storeLoading || loading) ? (
              <div className="flex items-center gap-2">
                <UniversalLoader size={16} />
                <span>Submitting...</span>
              </div>
            ) : 'Preview Purchase ->'}
          </button>
        ) : (
          <div className="relative group">
            <button
              onClick={onNext}
              disabled={loading || isNextDisabled}
              className={`w-[200px] h-8 flex items-center justify-center rounded-sm bg-blue-600 text-white hover:bg-blue-700 transition-colors ${loading || isNextDisabled ? 'cursor-not-allowed opacity-50' : ''}`}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <UniversalLoader size={16} color="white" style={{ width: 'auto', height: 'auto' }} />
                  <span>Saving...</span>
                </div>
              ) : nextLabel}
            </button>
            {isNextDisabled && disabledReason && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded shadow-lg whitespace-nowrap z-50 hidden group-hover:block transition-opacity opacity-0 group-hover:opacity-100">
                {disabledReason}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
              </div>
            )}
          </div>
        )}
        {isLastStep && success && <span className="ml-4 text-green-600">Registration successful!</span>}
      </div>
    </footer>
  );
};

export default RegistrationFooter;
