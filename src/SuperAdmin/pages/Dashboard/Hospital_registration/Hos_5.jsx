import React, { useState, useEffect } from 'react';
import { useRegistration } from '../../../context/RegistrationContext';
import { ProgressBar, ReviewBanner, AgreementBox, ActionButton, RegistrationHeader } from '../../../../components/FormItems';
import useHospitalRegistrationStore from '../../../../store/useHospitalRegistrationStore';
import useHospitalStep1Store from '../../../../store/useHospitalStep1Store';
import UniversalLoader from '../../../../components/UniversalLoader';
import { getPublicUrl } from '../../../../services/uploadsService';

const verified2 = '/verified-tick.svg';

const Hos_5 = () => {
  const { formData, updateFormData } = useRegistration();

  // Hospital Data Store
  const hospitalStore = useHospitalRegistrationStore();
  const {
    hospitalId,
    reviewData,
    reviewLoading,
    fetchReviewData
  } = hospitalStore;

  // Admin Data Store (Step 1)
  const adminStore = useHospitalStep1Store();
  const adminForm = adminStore.form;

  const currentSubStep = formData.hosStep5SubStep || 1;
  const [termsAccepted, setTermsAccepted] = useState(formData.hosTermsAccepted || false);
  const [privacyAccepted, setPrivacyAccepted] = useState(formData.hosPrivacyAccepted || false);
  const [formError, setFormError] = useState("");

  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [imagesLoading, setImagesLoading] = useState(false);

  // Fetch review data on mount or when hospitalId becomes available
  useEffect(() => {
    if (hospitalId) {
      fetchReviewData();
    }
  }, [hospitalId, fetchReviewData]);

  // Sync terms/privacy from reviewData metadata if available
  useEffect(() => {
    if (reviewData?.metadata) {
      if (reviewData.metadata.termsAccepted !== undefined) {
        setTermsAccepted(reviewData.metadata.termsAccepted);
      }
      if (reviewData.metadata.dataPrivacyAccepted !== undefined) {
        setPrivacyAccepted(reviewData.metadata.dataPrivacyAccepted);
      }
    }
  }, [reviewData]);

  // Update context when local state changes
  useEffect(() => {
    if (formData.hosTermsAccepted !== termsAccepted || formData.hosPrivacyAccepted !== privacyAccepted) {
      updateFormData({
        hosTermsAccepted: termsAccepted,
        hosPrivacyAccepted: privacyAccepted
      });
    }
  }, [termsAccepted, privacyAccepted, formData.hosTermsAccepted, formData.hosPrivacyAccepted, updateFormData]);

  // Fetch Public URLs for Images
  useEffect(() => {
    const fetchImages = async () => {
      const coverKey = reviewData?.hospitalInformation?.coverImage;
      const profileKey = reviewData?.hospitalInformation?.profileImage;

      if (!coverKey && !profileKey) return;

      setImagesLoading(true);
      try {
        const [coverUrl, profileUrl] = await Promise.all([
          coverKey ? getPublicUrl(coverKey) : Promise.resolve(""),
          profileKey ? getPublicUrl(profileKey) : Promise.resolve("")
        ]);
        setCoverImageUrl(coverUrl);
        setProfileImageUrl(profileUrl);
      } catch (error) {
        console.error("Hos_5: Failed to fetch image URLs", error);
      } finally {
        setImagesLoading(false);
      }
    };
    fetchImages();
  }, [reviewData?.hospitalInformation?.coverImage, reviewData?.hospitalInformation?.profileImage]);

  const handleTermsChange = () => {
    const newValue = !termsAccepted;
    setTermsAccepted(newValue);
    updateFormData({ hosTermsAccepted: newValue });
    if (formError) setFormError("");
  };

  const handlePrivacyChange = () => {
    const newValue = !privacyAccepted;
    setPrivacyAccepted(newValue);
    updateFormData({ hosPrivacyAccepted: newValue });
    if (formError) setFormError("");
  };

  // Helper to safely join strings or objects with name/label fields
  const join = (arr, sep = ', ') => {
    if (!Array.isArray(arr)) return '';
    return arr
      .map(item => {
        if (!item) return '';
        if (typeof item === 'string') return item;
        if (typeof item === 'object') return item.name || item.label || item.value || '';
        return String(item);
      })
      .filter(Boolean)
      .join(sep);
  };
  const orDash = (val) => (val ? val : '—');

  // Badge Component
  const StatusBadge = ({ type }) => {
    if (type === 'verified_text') return <span className="text-success-300 text-xs ">Verified</span>;
    if (type === 'done') return <img src={verified2} alt="Verified" className="w-3 h-3" />;
    if (type === 'review') return <span className="text-orange-500 text-xs  bg-orange-50 px-2 py-0.5 rounded-full">Under Verification</span>;
    // Special case for 'Not Attached' text style
    if (type === 'not_attached') return <span className="text-secondary-grey300 text-xs">Not Attached</span>;
    return null;
  };

  const right = '/angel_right_blue.png';

  // Reusable Row Component
  const DetailRow = ({ label, value, type, file, isLink, verified, className, fileName, alignItems = "items-center", valueClass = "" }) => (
    <div className={`flex gap-3 text-xs py-1 min-h-4 ${alignItems} ${className || 'w-full'}`}>
      <div className="w-[140px] text-secondary-grey400 font-medium flex-shrink-0">{label}</div>
      <div className="w-1 font-medium text-secondary-grey400">:</div>
      <div className={`flex-1 flex justify-between ${alignItems}`}>
        <div className={`flex gap-2 ${alignItems}`}>
          {isLink ? (
            file ? (
              <a href={file} target="_blank" rel="noopener noreferrer" className="text-blue-primary250 hover:underline flex items-center gap-1">
                {value || fileName || 'View Document'} <img src={right} alt="" className="w-1 h-2 ml-1" />
              </a>
            ) : (
              <span className="text-blue-primary250">{value}</span>
            )
          ) : (
            <span className={`text-secondary-grey400 ${valueClass}`}>{value || '—'}</span>
          )}

          {file && !isLink && (
            <>
              <span className="text-secondary-grey100">|</span>
              <a href={file} target="_blank" rel="noopener noreferrer" className="text-blue-primary250 hover:underline flex items-center gap-1">
                {fileName || 'View Document'} <img src={right} alt="" className="w-1 h-2 ml-1" />
              </a>
            </>
          )}
        </div>
        {(verified || type) && <StatusBadge type={verified ? 'verified_text' : type} />}
      </div>
    </div>
  );

  // Section Container
  const SectionBox = ({ title, children }) => (
    <div className="border border-secondary-grey150/60 rounded-lg p-4 bg-white">
      <h3 className="text-sm font-semibold text-secondary-grey400 mb-3">{title}</h3>
      {children}
    </div>
  );

  // --- Data Preparation from reviewData ---
  const hospitalInfo = reviewData?.hospitalInformation || {};
  const servicesInfo = reviewData?.servicesAndFacilities || {};
  const adminInfo = reviewData?.primaryAdminAccount || {};
  const documentsInfo = reviewData?.documentsAndStatus || [];

  const hospitalDisplay = {
    name: hospitalInfo.name || orDash(hospitalStore.name),
    type: hospitalInfo.type || orDash(hospitalStore.type),
    speciality: join(servicesInfo.medicalSpecialties, ', ') || '—',
    profileUrl: hospitalInfo.url || orDash(hospitalStore.url),
    address: hospitalInfo.address || (() => {
      const a = hospitalStore.address || {};
      return join([
        join([hospitalStore.name, a.blockNo, a.street], ', '),
        join([a.landmark, hospitalStore.city, hospitalStore.state, hospitalStore.pincode], ', ')
      ], ' ');
    })(),
    email: hospitalInfo.emailId || orDash(hospitalStore.emailId),
    contact: hospitalInfo.phone || orDash(hospitalStore.phone),
    rohiniId: documentsInfo.find(d => d.docType === 'ROHINI_ID')?.docNo || '—',
    website: hospitalInfo.url || orDash(hospitalStore.url),
    upcharId: hospitalInfo.hospitalCode || '—'
  };

  const hospitalFacilities = [
    hospitalInfo.noOfIcuBeds > 0 ? 'ICU' : null,
    hospitalInfo.hasBloodBank ? 'Blood Bank' : null,
    hospitalInfo.emergencyContactNo ? '24/7 Emergency care' : null,
    hospitalInfo.noOfAmbulances > 0 ? 'Ambulance' : null,
  ].filter(Boolean);

  const formatTime = (time) => {
    if (!time) return '';
    const [h, m] = time.split(':');
    const hour = parseInt(h);
    const ampm = hour >= 12 ? 'pm' : 'am';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${m}${ampm}`;
  };

  const servicesDisplay = {
    medicalSpecialties: join(servicesInfo.medicalSpecialties, ', ') || '—',
    hospitalServices: join(servicesInfo.hospitalServices, ', ') || '—',
    hospitalFacilities: join(hospitalFacilities, ', ') || '—',
    accreditations: join(servicesInfo.accreditations, ', ') || '—',
    operatingHours: (servicesInfo.operatingHours || []).map(h => {
      const day = h.dayOfWeek.charAt(0) + h.dayOfWeek.slice(1).toLowerCase();
      const slots = h.is24Hours ? '24 hrs' : h.timeRanges.map(r => `${formatTime(r.startTime)}-${formatTime(r.endTime)}`).join(', ');
      return `${day}(${slots})`;
    }).join(' | ') || '—'
  };

  const adminDisplay = {
    name: adminInfo.fullName || join([adminForm.firstName, adminForm.lastName], ' '),
    designation: 'Business Owner', // Mock as not in response
    role: join(adminInfo.roles, ', ') || 'Super Admin',
    email: adminInfo.emailId || adminForm.emailId,
    contact: adminInfo.phone || adminForm.phone,
    mfaStatus: adminInfo.mfaEnabled ? 'Done' : 'Pending'
  };

  // --- Render ---

  if (reviewLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <UniversalLoader size={48} />
      </div>
    );
  }

  const Page1 = () => (
    <div className="max-w-[700px] mx-auto flex flex-col gap-4 pb-10">

      <ReviewBanner
        icon={<img src="/review.png" alt="" className="w-3 h-3" />}
        title="Ready to Activate"
        className="border-green-200 bg-green-50 text-green-800"
      />

      {/* Image Banner */}
      <div className='relative' >
        <div className="h-[140px] w-full bg-secondary-grey50 rounded-xl overflow-hidden">
          {imagesLoading ? (
            <div className="w-full h-full flex items-center justify-center">
              <UniversalLoader size={24} />
            </div>
          ) : (
            <img
              className='h-full w-full object-cover'
              src={coverImageUrl || "/images/hospital.png"}
              alt="Hospital Cover"
            />
          )}
        </div>

        <div className='absolute w-12 h-12 right-1/2 -bottom-1 border-[1px] border-[#2372EC] rounded-md translate-x-1/2 bg-white overflow-hidden'>
          {imagesLoading ? (
            <div className="w-full h-full flex items-center justify-center">
              <UniversalLoader size={12} />
            </div>
          ) : (
            <img
              src={profileImageUrl || "/images/hospital_logo.png"}
              className='w-full h-full object-cover rounded-md'
              alt="Hospital Profile"
            />
          )}
        </div>
        <div className='bg-white h-5'></div>
      </div>

      {/* Hospital Information */}
      <SectionBox title="Hospital Information">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-1">
          <div className='flex flex-col'>
            <DetailRow label="Hospital Name" value={hospitalDisplay.name} />
            <DetailRow label="Hospital Type" value={hospitalDisplay.type} />
            <DetailRow label="Speciality" value={hospitalDisplay.speciality} />
            <DetailRow label="Profile URL" value={hospitalDisplay.profileUrl} />
            <DetailRow label="Address" value={hospitalDisplay.address} alignItems="items-start" />
          </div>
          <div className='flex flex-col'>
            <DetailRow label="Hospital Email" value={hospitalDisplay.email} type="done" />
            <DetailRow label="Hospital Contact" value={hospitalDisplay.contact} type="done" />
            <DetailRow label="Rohini ID" value={hospitalDisplay.rohiniId} />
            <DetailRow label="Website" value={hospitalDisplay.website} />
            <DetailRow label="Upchar ID" value={hospitalDisplay.upcharId} />
          </div>
        </div>
      </SectionBox>

      {/* Services & Facilities */}
      <SectionBox title="Services & Facilities">
        <div className='flex flex-col'>
          <DetailRow label="Medical Specialties" value={servicesDisplay.medicalSpecialties} />
          <DetailRow label="Hospital Services" value={servicesDisplay.hospitalServices} />
          <DetailRow label="Hospital Facilities" value={servicesDisplay.hospitalFacilities} />
          <DetailRow label="Accreditations" value={servicesDisplay.accreditations} />
          <DetailRow label="Operating Hours" value={
            <div className='flex flex-col gap-1'>
              {servicesDisplay.operatingHours}
            </div>
          } alignItems='items-start' />
        </div>
      </SectionBox>

      {/* Primary Admin Account Details */}
      <SectionBox title="Primary Admin Account Details">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-1">
          <div className='flex flex-col'>
            <DetailRow label="User Name" value={adminDisplay.name} />
            <DetailRow label="User Designation" value={adminDisplay.designation} />
            <DetailRow label="User Role" value={adminDisplay.role} />
          </div>
          <div className='flex flex-col'>
            <DetailRow label="User Email" value={adminDisplay.email} type="done" />
            <DetailRow label="User Contact" value={adminDisplay.contact} type="done" />
            <DetailRow label="MFA Status" value={<span className='text-green-600'>{adminDisplay.mfaStatus}</span>} type="" />
          </div>
        </div>
      </SectionBox>

      <SectionBox title="Verified Documents & Status">
        <div className='flex flex-col'>
          {[
            { label: 'GSTN', type: 'GST_PROOF', fileName: 'GSTIN.pdf' },
            { label: 'Registration Number', type: 'STATE_HEALTH_REG_PROOF', fileName: 'SHRN.pdf' },
            { label: 'Rohini ID', type: 'ROHINI_ID', fileName: 'Rohini.pdf' },
            { label: 'Pan Card Number', type: 'PAN_CARD', fileName: 'Pancard.pdf' },
            { label: 'NABH Accreditation', type: 'NABH_ACCREDIATION_PROOF', fileName: 'NABH.pdf' },
            { label: 'CIN', type: 'CIN_PROOF', fileName: 'CIN.pdf' },
          ].map((item, idx) => {
            const doc = documentsInfo.find(d => d.docType === item.type);
            return (
              <DetailRow
                key={idx}
                label={item.label}
                value={doc?.docNo || 'Not Attached'}
                valueClass={!doc?.docNo ? 'text-secondary-grey300' : ''}
                fileName={item.fileName}
                file={doc?.docUrl}
                verified={doc?.isVerified}
              />
            );
          })}
        </div>
      </SectionBox>

    </div>
  );

  const Page2 = () => (
    <div className="max-w-[700px] mx-auto flex flex-col gap-4">
      <ReviewBanner
        icon={<img src="/review.png" alt="" className="w-3 h-3" />}
        title="Ready to Activate"
        className="border-green-200 bg-green-50 text-green-800"
      />

      <div className="space-y-4">
        <AgreementBox
          title="Terms & Conditions"
          description="By using this Healthcare Management System, you agree to comply with and be bound by the following terms and conditions:"
          bullets={[
            { title: 'Data Privacy', text: 'You agree to handle all patient data in accordance with HIPAA, NDHM, and other applicable regulations.' },
            { title: 'Security Measures', text: 'You will implement appropriate security measures to protect patient data.' },
            { title: 'Accuracy of Information', text: 'You confirm that all information provided during registration is accurate and complete.' },
            { title: 'User Access', text: 'You will manage user access appropriately and ensure that only authorized personnel have access to sensitive information.' },
            { title: 'Compliance', text: 'You will comply with all applicable laws and regulations related to healthcare data management.' }
          ]}
          accepted={termsAccepted}
          onToggle={handleTermsChange}
          confirmText="I accept the Terms & Conditions and Data Privacy Agreement"
        />

        <AgreementBox
          title="Data Privacy Agreement"
          description="This Data Privacy Agreement outlines how patient data should be handled in compliance with HIPAA, NDHM, and other applicable regulations:"
          bullets={[
            { title: 'Data Collection', text: 'Only collect patient data that is necessary for providing healthcare services.' },
            { title: 'Data Storage', text: 'Store patient data securely with appropriate encryption and access controls.' },
            { title: 'Data Sharing', text: 'Only share patient data with authorized personnel and third parties as required for healthcare services.' },
            { title: 'Patient Rights', text: 'Respect patient rights regarding their data, including the right to access, correct, and delete their information.' },
            { title: 'Breach Notification', text: 'Promptly notify affected patients and authorities in case of a data breach.' }
          ]}
          accepted={privacyAccepted}
          onToggle={handlePrivacyChange}
          confirmText="I understand and will comply with the Data Privacy Agreement"
        />

        <div className="flex justify-between items-center">
          <div className="flex flex-col">
            <div className='flex gap-1 items-center'>
              <h3 className="text-sm font-semibold text-secondary-grey400">Digital Signature</h3>
              <div className='w-1 h-1 bg-red-500 rounded-full'></div>
            </div>
            <p className="text-secondary-grey300 text-xs mb-4">Sign digitally using Aadhar eSign and Upload Pan card</p>
          </div>

          <div className="flex gap-4 items-center">
            <ActionButton variant="pancard" className='h-8'>Use Aadhar eSign</ActionButton>
            <ActionButton variant="pancard" className='h-8'>Upload Pancard</ActionButton>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-white rounded-md shadow-sm overflow-hidden">
      <RegistrationHeader
        title="Review and Sign Agreement"
        subtitle="Review your & verification details and submit for Account Activation"
      >
        <div className="mt-3">
          <ProgressBar step={currentSubStep} total={2} />
        </div>
      </RegistrationHeader>

      <div className="flex-1 overflow-y-auto p-6">
        {formError && (
          <div className="max-w-2xl mx-auto p-2">
            <span className="text-red-500 text-sm font-semibold">{formError}</span>
          </div>
        )}
        {currentSubStep === 1 ? <Page1 /> : <Page2 />}
      </div>
    </div>
  );
};

export default Hos_5;