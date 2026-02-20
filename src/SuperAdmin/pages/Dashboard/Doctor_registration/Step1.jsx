import React, { useEffect, forwardRef, useImperativeHandle, useRef, useState } from 'react'
import useDoctorStep1Store from "../../../../store/useDoctorStep1Store";
import useImageUploadStore from "../../../../store/useImageUploadStore";
import {
  Upload,
  FormFieldRow,
  RegistrationHeader
} from '../../../../components/FormItems';
import InputWithMeta from '../../../../components/GeneralDrawer/InputWithMeta';
import CustomUpload from '../../../../components/CustomUpload';
const upload = '/upload_blue.png'


import { ChevronDown } from 'lucide-react';
import { registerDoctor } from '../../../../services/doctorService';
import useToastStore from '../../../../store/useToastStore';
import useDoctorRegistrationStore from '../../../../store/useDoctorRegistrationStore';
import { indianCities } from '../../../../utils/indianCities';
import useSuperAdminListStore from '../../../../store/useSuperAdminListStore';


const Step1 = forwardRef((props, ref) => {
  const {
    firstName,
    lastName,
    emailId,
    phone,
    gender,
    city,
    profilePhotoKey,
    loading,
    error,
    setField,
    setMfaField,
    submit,
  } = useDoctorStep1Store();

  const { doctorsRaw, fetchDoctors, doctorsFetched } = useSuperAdminListStore();

  useEffect(() => {
    if (!doctorsFetched) {
      fetchDoctors();
    }
  }, [doctorsFetched, fetchDoctors]);


  const [formErrors, setFormErrors] = React.useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [genderOpen, setGenderOpen] = useState(false);
  const [cityOpen, setCityOpen] = useState(false);

  // const uploadUrlData = useImageUploadStore((state) => state.uploadUrl);
  // useEffect(() => { ... } removed as CustomUpload handles it via onUpload

  // Ensure MFA flags are always true in state
  useEffect(() => {
    setMfaField('emailId', true);
    setMfaField('phone', true);
  }, [setMfaField]);


  // Validation functions
  const validateField = (name, value) => {
    switch (name) {
      case "firstName":
      case "lastName":
        if (!value || value.trim().length === 0) return "Required";
        return "";
      case "emailId":
        if (!value) return "Required";
        // Simple email regex
        if (!/^\S+@\S+\.\S+$/.test(value)) return "Invalid email format";
        return "";
      case "phone":
        if (!value) return "Required";
        if (!/^\d{10}$/.test(value)) return "Phone must be 10 digits";
        return "";
      case "gender":
      case "city":
        if (!value) return "Required";
        return "";
      default:
        return "";
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "emailVerification" || name === "smsVerification") {
      setMfaField(name === "emailVerification" ? "emailId" : "phone", checked);
    } else {
      setField(name, type === "checkbox" ? checked : value);
      // Validate on change
      setFormErrors((prev) => ({
        ...prev,
        [name]: validateField(name, type === "checkbox" ? checked : value)
      }));
    }
  };


  const addToast = useToastStore((state) => state.addToast);
  const setDocRegField = useDoctorRegistrationStore((state) => state.setField);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    const fieldsToValidate = { firstName, lastName, emailId, phone, gender, city };
    const newErrors = {};
    Object.entries(fieldsToValidate).forEach(([key, val]) => {
      const err = validateField(key, val);
      if (err) newErrors[key] = err;
    });

    if (!profilePhotoKey) {
      newErrors['profilePhotoKey'] = "Profile Photo is required";
      addToast({ title: 'Error', message: 'Profile Photo is required', type: 'error' });
    }

    setFormErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      return false;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        firstName,
        lastName,
        emailId,
        phone,
        gender: gender?.toUpperCase(), // Ensure uppercase as per request example 'MALE'
        city,
        profilePhotoKey
      };

      // MOCK: Bypass backend for design/UI work
      const res = await registerDoctor(payload);
      // const res = { success: true, data: { doctorId: "mock-doctor-123" } };

      if (res && (res.success || res.doctorId)) {
        addToast({ title: 'Success', message: 'Doctor Registered Successfully', type: 'success' });
        // Store the userId and a sequential display ID for subsequent steps
        const userId = res.data?.doctorId || res.doctorId || res.userId;
        const displayId = res.data?.docId || res.docId || (doctorsRaw.length + 1);

        if (userId) {
          setDocRegField('userId', userId);
          setDocRegField('displayId', displayId);
          // Refresh list to keep count accurate for next registration
          fetchDoctors(true);
        } else {

          console.error("No userId found in response data", res.data);
        }

        setIsSubmitting(false);
        return true;
      }
      // Unreachable with mock, but kept structure if we revert
      /* else {
        addToast({ title: 'Error', message: res.message || 'Registration failed', type: 'error' });
        setIsSubmitting(false);
        return false;
      } */
    } catch (err) {
      console.error("Doctor registration error:", err);
      const msg = err.response?.data?.message || err.message || "Registration failed";
      addToast({ title: 'Error', message: msg, type: 'error' });
      setIsSubmitting(false);
      return false;
    }
  };

  useImperativeHandle(ref, () => ({
    submit: handleSubmit
  }));

  const genderOptions = [
    { value: "Male", label: "Male" },
    { value: "Female", label: "Female" },
    { value: "Other", label: "Other" },
    { value: "Prefer not to say", label: "Prefer not to say" },
  ];

  const [filteredCities, setFilteredCities] = useState([]);

  useEffect(() => {
    if (city) {
      const filtered = indianCities
        .filter(c => c.toLowerCase().includes(city.toLowerCase()))
        .slice(0, 50) // Limit to 50 for performance
        .map(c => ({ value: c, label: c }));
      setFilteredCities(filtered);
    } else {
      setFilteredCities(indianCities.slice(0, 20).map(c => ({ value: c, label: c })));
    }
  }, [city]);

  return (
    <div className="flex flex-col h-full bg-white rounded-md shadow-sm overflow-hidden">
      {/* 1. Title Section (Header) */}
      <RegistrationHeader
        title="Account Creation"
        subtitle="Please provide your personal information"
      />

      {/* 2. Form Section (Body) - Scrollable */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-[700px] mx-auto space-y-6">
          {/* Name Row */}
          <FormFieldRow>
            <div className="w-full">
              <InputWithMeta
                label="First Name"
                requiredDot={true}
                value={firstName}
                onChange={(val) => handleInputChange({ target: { name: 'firstName', value: val } })}
                placeholder="Enter First Name"
              />
              {formErrors.firstName && <span className="text-red-500 text-xs">{formErrors.firstName}</span>}
            </div>
            <div className="w-full">
              <InputWithMeta
                label="Last Name"
                requiredDot={true}
                value={lastName}
                onChange={(val) => handleInputChange({ target: { name: 'lastName', value: val } })}
                placeholder="Enter Last Name"
              />
              {formErrors.lastName && <span className="text-red-500 text-xs">{formErrors.lastName}</span>}
            </div>
          </FormFieldRow>

          {/* Email and Phone Row */}
          <FormFieldRow>
            <div className="w-full">
              <InputWithMeta
                label="Work Email"
                requiredDot={true}
                value={emailId}
                onChange={(val) => handleInputChange({ target: { name: 'emailId', value: val } })}
                placeholder="Enter Work Email"
              />
              {formErrors.emailId && <span className="text-red-500 text-xs">{formErrors.emailId}</span>}
            </div>
            <div className="w-full">
              <InputWithMeta
                label="Contact Number"
                requiredDot={true}
                value={phone}
                onChange={(val) => handleInputChange({ target: { name: 'phone', value: val } })}
                placeholder="Enter Contact Number"
              />
              {formErrors.phone && <span className="text-red-500 text-xs">{formErrors.phone}</span>}
            </div>
          </FormFieldRow>

          {/* Gender and City Row */}
          <FormFieldRow>
            <div className="w-full">
              <InputWithMeta
                label="Gender"
                value={gender}
                requiredDot
                placeholder="Select Gender"
                RightIcon={ChevronDown}
                readonlyWhenIcon={true}
                onIconClick={() => setGenderOpen(!genderOpen)}
                dropdownOpen={genderOpen}
                onRequestClose={() => setGenderOpen(false)}
                dropdownItems={genderOptions}
                onSelectItem={(item) => {
                  handleInputChange({ target: { name: 'gender', value: item.value } });
                  setGenderOpen(false);
                }}
                compulsory
              />
              {formErrors.gender && <span className="text-red-500 text-xs">{formErrors.gender}</span>}
            </div>
            <div className="w-full">
              <InputWithMeta
                label="City"
                value={city}
                requiredDot
                placeholder="Search or enter city"
                onChange={(val) => {
                  handleInputChange({ target: { name: 'city', value: val } });
                  if (!cityOpen) setCityOpen(true);
                }}
                RightIcon={ChevronDown}
                readonlyWhenIcon={false} // Allow manual entry
                onIconClick={() => setCityOpen(!cityOpen)}
                dropdownOpen={cityOpen}
                onRequestClose={() => setCityOpen(false)}
                dropdownItems={filteredCities}
                onSelectItem={(item) => {
                  handleInputChange({ target: { name: 'city', value: item.value } });
                  setCityOpen(false);
                }}
                compulsory
              />
              {formErrors.city && <span className="text-red-500 text-xs">{formErrors.city}</span>}
            </div>
          </FormFieldRow>

          <div className="w-full">
            <CustomUpload
              label="Upload Profile Picture"
              variant="box"
              compulsory={true}
              uploadContent="Upload Image"
              onUpload={(key) => {
                setField('profilePhotoKey', key);
                setFormErrors(prev => ({ ...prev, profilePhotoKey: "" }));
              }}
              uploadedKey={profilePhotoKey}
              meta="Support Size upto 1MB in .png, .jpg, .jpeg, .webp"
            />
            {formErrors.profilePhotoKey && <span className="text-red-500 text-xs">{formErrors.profilePhotoKey}</span>}
          </div>

          <div className="pb-4"></div>
        </div>
      </div>

    </div>
  );
});

export default Step1;
