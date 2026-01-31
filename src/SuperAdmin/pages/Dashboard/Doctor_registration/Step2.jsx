import React, { useState, useRef, useImperativeHandle, forwardRef } from "react";
import {
  FormFieldRow,
  RegistrationHeader
} from '../../../../components/FormItems';
import useDoctorRegistrationStore from '../../../../store/useDoctorRegistrationStore';
import InputWithMeta from '../../../../components/GeneralDrawer/InputWithMeta';
import { ChevronDown } from 'lucide-react';
import RadioButton from '../../../../components/GeneralDrawer/RadioButton';
import CustomUpload from '../../../../components/CustomUpload';
import useToastStore from '../../../../store/useToastStore';
import { completeDoctorProfile } from '../../../../services/doctorService';


const Step2 = forwardRef((props, ref) => {
  console.log("Step2 rendering");
  const {
    userId,
    specialization,
    experienceYears,
    medicalCouncilName,
    medicalCouncilRegYear,
    medicalCouncilRegNo,
    medicalDegreeType,
    medicalDegreeUniversityName,
    medicalDegreeYearOfCompletion,
    pgMedicalDegreeType,
    pgMedicalDegreeUniversityName,
    pgMedicalDegreeYearOfCompletion,
    setField,
    documents,
    setDocument,
    additionalPractices,
    addPractice,
    updatePractice,
  } = useDoctorRegistrationStore();
  const addToast = useToastStore((state) => state.addToast);

  const getDoc = (no) => documents?.find(d => d.no === no);

  const [formErrors, setFormErrors] = React.useState({});
  const [openDropdowns, setOpenDropdowns] = useState({});

  const toggleDropdown = (key) => {
    setOpenDropdowns(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const closeDropdown = (key) => {
    setOpenDropdowns(prev => ({ ...prev, [key]: false }));
  };

  // Validation functions
  const validateField = (name, value) => {
    switch (name) {
      case "medicalCouncilRegNo":
        if (!value) return "Required";
        if (!/^\w{4,}$/.test(value)) return "Invalid Reg. No.";
        return "";
      case "medicalCouncilName":
      case "medicalDegreeType":
      case "medicalDegreeUniversityName":
      case "pgMedicalDegreeType":
      case "pgMedicalDegreeUniversityName":
        if (!value) return "Required";
        return "";
      case "experienceYears":
        if (!value) return "Required";
        if (!/^\d+$/.test(value) || Number(value) < 0) return "Invalid years";
        return "";
      case "medicalCouncilRegYear":
      case "medicalDegreeYearOfCompletion":
      case "pgMedicalDegreeYearOfCompletion":
        if (!value) return "Required";
        if (!/^\d{4}$/.test(value)) return "Year must be 4 digits";
        const year = parseInt(value);
        const currentYear = new Date().getFullYear();
        if (year > currentYear) return "Future year not allowed";
        if (year < currentYear - 100) return "Year too old (max 100 years)";
        return "";
      case "specialization":
        const sName = typeof value === 'object' ? (value.value || value.name) : value;
        if (!sName || sName.trim().length === 0) return "Required";
        return "";
      default:
        return "";
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setField(name, value);
    setFormErrors((prev) => ({
      ...prev,
      [name]: validateField(name, value)
    }));
  };

  // Validate all fields before submit (if submit button is added)
  const validateAll = () => {
    const fieldsToValidate = {
      medicalCouncilRegNo,
      medicalCouncilName,
      medicalCouncilRegYear,
      medicalDegreeType,
      medicalDegreeUniversityName,
      medicalDegreeYearOfCompletion,
      specialization,
      experienceYears
    };

    // If PG is selected, add those fields
    if (pgMedicalDegreeType !== null) {
      fieldsToValidate.pgMedicalDegreeType = pgMedicalDegreeType;
      fieldsToValidate.pgMedicalDegreeUniversityName = pgMedicalDegreeUniversityName;
      fieldsToValidate.pgMedicalDegreeYearOfCompletion = pgMedicalDegreeYearOfCompletion;
    }

    const newErrors = {};
    Object.entries(fieldsToValidate).forEach(([key, val]) => {
      const err = validateField(key, val);
      if (err) newErrors[key] = err;
    });

    // Validate proofs
    if (!getDoc(1)?.url) newErrors.mrnProof = "Required";
    if (!getDoc(2)?.url) newErrors.degreeProof = "Required";

    // Validate additional practices
    (additionalPractices || []).forEach((p, idx) => {
      const pSpec = typeof p.specialization === 'object' ? (p.specialization?.value || p.specialization?.name) : p.specialization;
      if (!pSpec) newErrors[`additional_specialization_${idx}`] = "Required";
      if (!p.experienceYears?.toString().trim()) newErrors[`additional_experience_${idx}`] = "Required";
      else if (!/^\d+$/.test(p.experienceYears)) newErrors[`additional_experience_${idx}`] = "Invalid years";
    });

    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Common form field props
  const commonFieldProps = {
    compulsory: true,
    required: true
  };

  // Council options
  const councilOptions = [
    { value: "Maharashtra Medical Council", label: "Maharashtra Medical Council" },
    { value: "Andhra Pradesh Medical Council", label: "Andhra Pradesh Medical Council" },
    { value: "Arunachal Pradesh Medical Council", label: "Arunachal Pradesh Medical Council" },
    { value: "Assam Medical Council", label: "Assam Medical Council" },
    { value: "Bihar Medical Council", label: "Bihar Medical Council" },
    { value: "Chhattisgarh Medical Council", label: "Chhattisgarh Medical Council" },
    { value: "Delhi Medical Council", label: "Delhi Medical Council" },
    { value: "Goa Medical Council", label: "Goa Medical Council" },
    { value: "Gujarat Medical Council", label: "Gujarat Medical Council" },
    { value: "Haryana Medical Council", label: "Haryana Medical Council" }
  ];

  // Post graduate degree options
  const pgDegreeOptions = [
    { value: "MD (Internal Medicine)", label: "MD (Internal Medicine)" },
    { value: "MS (General Surgery)", label: "MS (General Surgery)" },
    { value: "MD (Pediatrics)", label: "MD (Pediatrics)" },
    { value: "MS (Orthopedics)", label: "MS (Orthopedics)" },
    { value: "MD (Radiology)", label: "MD (Radiology)" },
    { value: "MS (ENT)", label: "MS (ENT)" }
  ];

  // Graduation degree options
  const gradDegreeOptions = [
    { value: "MBBS", label: "MBBS" },
    { value: "BDS", label: "BDS" },
    { value: "BAMS", label: "BAMS" },
    { value: "BHMS", label: "BHMS" },
    { value: "BUMS", label: "BUMS" },
    { value: "BNYS", label: "BNYS" },
    { value: "BSMS", label: "BSMS" }
  ];

  // College/University options (sample, can be expanded)
  const collegeOptions = [
    { value: "AIIMS Delhi", label: "AIIMS Delhi" },
    { value: "Grant Medical College Mumbai", label: "Grant Medical College Mumbai" },
    { value: "KEM Hospital Mumbai", label: "KEM Hospital Mumbai" },
    { value: "Christian Medical College Vellore", label: "Christian Medical College Vellore" },
    { value: "Maulana Azad Medical College Delhi", label: "Maulana Azad Medical College Delhi" },
    { value: "Other", label: "Other" }
  ];

  // Specialization options (from requested list)
  const specializationOptions = [
    { value: "General Medicine (Internal Medicine)", label: "General Medicine (Internal Medicine)" },
    { value: "General Surgery", label: "General Surgery" },
    { value: "Pediatrics", label: "Pediatrics" },
    { value: "Orthopedics", label: "Orthopedics" },
    { value: "Obstetrics & Gynecology", label: "Obstetrics & Gynecology" },
    { value: "Dermatology", label: "Dermatology" },
  ];

  // Helper to filter specialization options to avoid duplicates
  const getFilteredOptions = (currentValue) => {
    const selectedSpecs = [
      (specialization?.value || specialization?.name || specialization),
      ...(additionalPractices || []).map(p => (p.specialization?.value || p.specialization?.name || p.specialization))
    ].filter(Boolean);

    return specializationOptions.filter(opt => {
      // If the option is the current one, show it
      if (opt.value === currentValue) return true;
      // Otherwise, show it only if it's not already selected
      return !selectedSpecs.includes(opt.value);
    });
  };

  const handleSubmit = async () => {
    // Validate
    if (!validateAll()) return false;

    // Check if userId is present (from Step 1)
    if (!userId) {
      addToast({ title: 'Error', message: 'User ID is missing. Please complete Step 1 first.', type: 'error' });
      return false;
    }

    // Documents validation
    if (!getDoc(1)?.url) { addToast({ title: 'Error', message: 'Medical Registration Proof is required', type: 'error' }); return false; }
    if (!getDoc(2)?.url) { addToast({ title: 'Error', message: 'Graduation Degree Proof is required', type: 'error' }); return false; }

    try {
      // Specialization
      const specs = [];
      const primarySpecName = typeof specialization === 'object' ? (specialization.value || specialization.name) : specialization;
      if (primarySpecName) specs.push({ name: primarySpecName, expYears: String(experienceYears) });

      if (Array.isArray(additionalPractices)) {
        additionalPractices.forEach(p => {
          const sName = typeof p.specialization === 'object' ? (p.specialization.value || p.specialization.name) : p.specialization;
          if (sName) specs.push({ name: sName, expYears: String(p.experienceYears) });
        });
      }

      // Education
      const edu = [];
      edu.push({
        instituteName: medicalDegreeUniversityName,
        graduationType: "GRADUATE",
        degree: medicalDegreeType,
        completionYear: Number(medicalDegreeYearOfCompletion),
        proofDocumentUrl: getDoc(2)?.url
      });

      if (pgMedicalDegreeType) {
        edu.push({
          instituteName: pgMedicalDegreeUniversityName,
          graduationType: "POST_GRADUATE",
          degree: pgMedicalDegreeType,
          completionYear: Number(pgMedicalDegreeYearOfCompletion),
          proofDocumentUrl: getDoc(3)?.url || ""
        });
      }

      const payload = {
        userId,
        specialization: specs,
        medicalCouncilName,
        medicalCouncilRegYear: String(medicalCouncilRegYear),
        medicalCouncilRegNo,
        medicalCouncilProof: getDoc(1)?.url,
        education: edu
      };

      const res = await completeDoctorProfile(payload);
      if (res.success) {
        console.log("Step2 submission successful, returning true");
        addToast({ title: 'Success', message: 'Professional Details Saved', type: 'success' });
        return true;
      } else {
        addToast({ title: 'Error', message: res.message || 'Saving failed', type: 'error' });
        return false;
      }
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || err.message || "Saving failed";
      addToast({ title: 'Error', message: msg, type: 'error' });
      return false;
    }
  };

  useImperativeHandle(ref, () => ({
    submit: handleSubmit
  }));

  return (
    <div className="flex flex-col h-full bg-white rounded-md shadow-sm overflow-hidden">
      <RegistrationHeader
        title="Professional Details"
        subtitle="Provide your Professional details and Document for verification"
      />

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-[700px] mx-auto space-y-6">
          {/* Medical Registration */}
          <div className="space-y-3 border-b pb-4">
            <h2 className="text-sm font-semibold text-secondary-grey400">
              Medical Registration
            </h2>
            <FormFieldRow>
              <div className="w-full">
                <InputWithMeta
                  requiredDot
                  placeholder="Hospital Name"
                  label="Medical Council Registration Number"
                  value={medicalCouncilRegNo}
                  onChange={(val) => handleInputChange({ target: { name: 'medicalCouncilRegNo', value: val } })}
                  {...commonFieldProps}
                />
                {formErrors.medicalCouncilRegNo && <span className="text-red-500 text-xs">{formErrors.medicalCouncilRegNo}</span>}
              </div>
              <div className="w-full">
                <InputWithMeta
                  label="Registration Council"
                  requiredDot
                  value={medicalCouncilName}
                  placeholder="Select Council"
                  RightIcon={ChevronDown}
                  readonlyWhenIcon={true}
                  onIconClick={() => toggleDropdown('council')}
                  dropdownOpen={openDropdowns['council']}
                  onRequestClose={() => closeDropdown('council')}
                  dropdownItems={councilOptions}
                  onSelectItem={(item) => {
                    handleInputChange({ target: { name: 'medicalCouncilName', value: item.value } });
                    closeDropdown('council');
                  }}
                  {...commonFieldProps}
                />
                {formErrors.medicalCouncilName && <span className="text-red-500 text-xs">{formErrors.medicalCouncilName}</span>}
              </div>
            </FormFieldRow>

            <FormFieldRow>
              <div className="w-full">
                <InputWithMeta
                  label="Registration Year"
                  value={medicalCouncilRegYear}
                  placeholder="Enter Year"
                  requiredDot
                  onChange={(val) => handleInputChange({ target: { name: 'medicalCouncilRegYear', value: val } })}
                  {...commonFieldProps}
                  meta="Visible to Patient"
                />
                {formErrors.medicalCouncilRegYear && <span className="text-red-500 text-xs">{formErrors.medicalCouncilRegYear}</span>}
              </div>
              <div className="w-full">
                <CustomUpload
                  label="Upload MRN Proof"
                  compulsory={true}
                  onUpload={(key, name) => {
                    setDocument({ no: 1, type: 'medical_license', url: key, fileName: name });
                    setFormErrors(prev => ({ ...prev, mrnProof: "" }));
                  }}
                  meta="Support Size upto 5MB in .pdf, .jpg, .doc"
                  uploadedKey={getDoc(1)?.url}
                  fileName={getDoc(1)?.fileName}
                />
                {formErrors.mrnProof && <span className="text-red-500 text-xs">{formErrors.mrnProof}</span>}
              </div>
            </FormFieldRow>
          </div>

          {/* Qualifications */}
          <div className="space-y-3 border-b pb-4">
            <h2 className="text-sm font-semibold text-secondary-grey400">Qualifications</h2>

            {/* Graduation */}
            <FormFieldRow>
              <div className="w-full">
                <InputWithMeta
                  label="Graduation Degree"
                  value={medicalDegreeType}
                  placeholder="Select Degree"
                  requiredDot
                  RightIcon={ChevronDown}
                  readonlyWhenIcon={true}
                  onIconClick={() => toggleDropdown('gradDegree')}
                  dropdownOpen={openDropdowns['gradDegree']}
                  onRequestClose={() => closeDropdown('gradDegree')}
                  dropdownItems={gradDegreeOptions}
                  onSelectItem={(item) => {
                    handleInputChange({ target: { name: 'medicalDegreeType', value: item.value } });
                    closeDropdown('gradDegree');
                  }}
                  {...commonFieldProps}
                />
                {formErrors.medicalDegreeType && <span className="text-red-500 text-xs">{formErrors.medicalDegreeType}</span>}
              </div>
              <div className="w-full">
                <InputWithMeta
                  label="College/ University"
                  value={medicalDegreeUniversityName}
                  placeholder="Select College/University"
                  requiredDot
                  infoIcon
                  RightIcon={ChevronDown}
                  readonlyWhenIcon={true}
                  onIconClick={() => toggleDropdown('gradCollege')}
                  dropdownOpen={openDropdowns['gradCollege']}
                  onRequestClose={() => closeDropdown('gradCollege')}
                  dropdownItems={collegeOptions}
                  onSelectItem={(item) => {
                    handleInputChange({ target: { name: 'medicalDegreeUniversityName', value: item.value } });
                    closeDropdown('gradCollege');
                  }}
                  {...commonFieldProps}
                />
                {formErrors.medicalDegreeUniversityName && <span className="text-red-500 text-xs">{formErrors.medicalDegreeUniversityName}</span>}
              </div>
            </FormFieldRow>

            <FormFieldRow>
              <div className="w-full">
                <InputWithMeta
                  label="Year of Completion"
                  placeholder="Enter Year"
                  value={medicalDegreeYearOfCompletion}
                  onChange={(val) => handleInputChange({ target: { name: 'medicalDegreeYearOfCompletion', value: val } })}
                  {...commonFieldProps}
                  requiredDot
                />
                {formErrors.medicalDegreeYearOfCompletion && <span className="text-red-500 text-xs">{formErrors.medicalDegreeYearOfCompletion}</span>}
              </div>
              <div className="w-full">
                <CustomUpload
                  label="Upload Degree Proof"
                  compulsory={true}
                  onUpload={(key, name) => {
                    setDocument({ no: 2, type: 'degree_certificate', url: key, fileName: name });
                    setFormErrors(prev => ({ ...prev, degreeProof: "" }));
                  }}
                  meta="Support Size upto 5MB in .pdf, .jpg, .doc"
                  uploadedKey={getDoc(2)?.url}
                  fileName={getDoc(2)?.fileName}
                />
                {formErrors.degreeProof && <span className="text-red-500 text-xs">{formErrors.degreeProof}</span>}
              </div>
            </FormFieldRow>

            {/* Post Graduation Radio */}
            <div className="space-y-4">
              <div className="flex gap-6 py-2">
                <label className="text-sm text-secondary-grey400">Do you have Post Graduation Degree?</label>
                <div className="flex gap-3">
                  <RadioButton
                    name="hasPG"
                    value="yes"
                    label="Yes"
                    checked={pgMedicalDegreeType !== null}
                    onChange={() => {
                      // Check if it was null (meaning swiching to yes)
                      if (pgMedicalDegreeType === null) setField('pgMedicalDegreeType', '');
                    }}
                  />
                  <RadioButton
                    name="hasPG"
                    value="no"
                    label="No"
                    checked={pgMedicalDegreeType === null}
                    onChange={() => {
                      setField('pgMedicalDegreeType', null);
                      setField('pgMedicalDegreeUniversityName', '');
                      setField('pgMedicalDegreeYearOfCompletion', '');
                    }}
                  />
                </div>
              </div>



              {/* Conditional Post Graduation Fields */}
              {pgMedicalDegreeType !== null && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <InputWithMeta
                      label="Post Graduate Degree"
                      value={pgMedicalDegreeType}
                      placeholder="Select Degree"
                      RightIcon={ChevronDown}
                      requiredDot
                      readonlyWhenIcon={true}
                      onIconClick={() => toggleDropdown('pgDegree')}
                      dropdownOpen={openDropdowns['pgDegree']}
                      onRequestClose={() => closeDropdown('pgDegree')}
                      dropdownItems={pgDegreeOptions}
                      onSelectItem={(item) => {
                        handleInputChange({ target: { name: 'pgMedicalDegreeType', value: item.value } });
                        closeDropdown('pgDegree');
                      }}
                    />
                    {formErrors.pgMedicalDegreeType && <span className="text-red-500 text-xs">{formErrors.pgMedicalDegreeType}</span>}
                    <InputWithMeta
                      label="Year of Completion"
                      placeholder="Enter Year"
                      requiredDot
                      value={pgMedicalDegreeYearOfCompletion}
                      onChange={(val) => handleInputChange({ target: { name: 'pgMedicalDegreeYearOfCompletion', value: val } })}
                    />
                    {formErrors.pgMedicalDegreeYearOfCompletion && <span className="text-red-500 text-xs">{formErrors.pgMedicalDegreeYearOfCompletion}</span>}
                  </div>
                  <div className="space-y-4">
                    <InputWithMeta
                      label="College/ University"
                      value={pgMedicalDegreeUniversityName}
                      placeholder="Select College/University"
                      RightIcon={ChevronDown}
                      requiredDot
                      infoIcon
                      readonlyWhenIcon={true}
                      onIconClick={() => toggleDropdown('pgCollege')}
                      dropdownOpen={openDropdowns['pgCollege']}
                      onRequestClose={() => closeDropdown('pgCollege')}
                      dropdownItems={collegeOptions}
                      onSelectItem={(item) => {
                        handleInputChange({ target: { name: 'pgMedicalDegreeUniversityName', value: item.value } });
                        closeDropdown('pgCollege');
                      }}
                    />
                    {formErrors.pgMedicalDegreeUniversityName && <span className="text-red-500 text-xs">{formErrors.pgMedicalDegreeUniversityName}</span>}
                    <CustomUpload
                      label="Upload Degree Proof"
                      compulsory={false}
                      onUpload={(key, name) => setDocument({ no: 3, type: 'specialization_certificate', url: key, fileName: name })}
                      meta="Support Size upto 5MB in .pdf, .jpg, .doc"
                      uploadedKey={getDoc(3)?.url}
                      fileName={getDoc(3)?.fileName}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>



          {/* Practice Details */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-secondary-grey400">Practice Details</h2>

            </div>
            <FormFieldRow>
              <div className="w-full">
                <InputWithMeta
                  label="Primary Specialization"
                  value={typeof specialization === 'object' ? (specialization?.value || specialization?.name || '') : specialization}
                  placeholder="Select Degree Type"
                  requiredDot
                  RightIcon={ChevronDown}
                  readonlyWhenIcon={true}
                  onIconClick={() => toggleDropdown('specialization')}
                  dropdownOpen={openDropdowns['specialization']}
                  onRequestClose={() => closeDropdown('specialization')}
                  dropdownItems={getFilteredOptions(typeof specialization === 'object' ? (specialization?.value || specialization?.name || '') : specialization)}
                  onSelectItem={(item) => {
                    handleInputChange({ target: { name: 'specialization', value: item } });
                    closeDropdown('specialization');
                  }}
                  {...commonFieldProps}
                  dropUp={true}
                />
                {formErrors.specialization && <span className="text-red-500 text-xs">{formErrors.specialization}</span>}
              </div>
              <div className="w-full">
                <InputWithMeta
                  label="Year of Experience"
                  requiredDot={true}
                  value={experienceYears}
                  onChange={(val) => handleInputChange({ target: { name: 'experienceYears', value: val } })}
                  placeholder="Enter Year"
                />
                {formErrors.experienceYears && <span className="text-red-500 text-xs">{formErrors.experienceYears}</span>}
              </div>
            </FormFieldRow>


            {Array.isArray(additionalPractices) && additionalPractices.length > 0 && (
              <div className="space-y-2">
                {additionalPractices.map((p, idx) => (
                  <FormFieldRow key={idx}>
                    <div className="w-full">
                      <InputWithMeta
                        label="Specialization"
                        requiredDot
                        value={typeof p.specialization === 'object' ? (p.specialization?.value || p.specialization?.name || '') : (p.specialization || '')}
                        placeholder="Select Specialization"
                        RightIcon={ChevronDown}
                        readonlyWhenIcon={true}
                        onIconClick={() => toggleDropdown(`add_spec_${idx}`)}
                        dropdownOpen={openDropdowns[`add_spec_${idx}`]}
                        onRequestClose={() => closeDropdown(`add_spec_${idx}`)}
                        dropdownItems={getFilteredOptions(typeof p.specialization === 'object' ? (p.specialization?.value || p.specialization?.name || '') : (p.specialization || ''))}
                        onSelectItem={(item) => {
                          updatePractice(idx, { specialization: { name: item.label, value: item.value } });
                          setFormErrors(prev => ({ ...prev, [`additional_specialization_${idx}`]: "" }));
                          closeDropdown(`add_spec_${idx}`);
                        }}
                        compulsory
                        required
                        dropUp={true}
                      />
                      {formErrors[`additional_specialization_${idx}`] && <span className="text-red-500 text-xs">{formErrors[`additional_specialization_${idx}`]}</span>}
                    </div>
                    <div className="w-full">
                      <InputWithMeta
                        label="Year of Experience"
                        requiredDot
                        value={p.experienceYears}
                        onChange={(val) => {
                          updatePractice(idx, { experienceYears: val });
                          let err = "";
                          if (!val.trim()) err = "Required";
                          else if (!/^\d+$/.test(val)) err = "Invalid years";
                          setFormErrors(prev => ({ ...prev, [`additional_experience_${idx}`]: err }));
                        }}
                        placeholder="Enter Year"
                        compulsory
                        required
                      />
                      {formErrors[`additional_experience_${idx}`] && <span className="text-red-500 text-xs">{formErrors[`additional_experience_${idx}`]}</span>}
                    </div>
                  </FormFieldRow>
                ))}
              </div>
            )}
            <div
              onClick={addPractice}
              className="text-blue-primary250 text-sm  cursor-pointer flex items-center gap-1 w-fit"
            >
              + Add More Speciality
            </div>

          </div>
        </div>
      </div>
    </div >
  );
});

export default Step2;
