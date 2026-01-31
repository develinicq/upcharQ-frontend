import React, { useState, useEffect } from 'react';
import { CheckCircle, Circle } from 'lucide-react';
import { useRegistration } from '../../../context/RegistrationContext';
import { ProgressBar, ReviewBanner, ReviewCard, AgreementBox, ActionButton, RegistrationHeader } from '../../../../components/FormItems';
import useDoctorStep1Store from '../../../../store/useDoctorStep1Store';
import useDoctorRegistrationStore from '../../../../store/useDoctorRegistrationStore';
import { getDoctorReviewDetails } from '../../../../services/doctorService';
import UniversalLoader from '../../../../components/UniversalLoader';
const review = '/review.png'
const verified2 = '/verified-tick.svg'
const right = '/angel_right_blue.png'

const Step4 = () => {
  const { currentStep, nextStep, prevStep, updateFormData, formData } = useRegistration();
  // Pull latest values from stores
  const step1 = useDoctorStep1Store();
  const reg = useDoctorRegistrationStore();

  const [loading, setLoading] = useState(true);
  const [reviewData, setReviewData] = useState(null);

  const currentSubStep = formData.step4SubStep || 1;

  useEffect(() => {
    let ignore = false;
    const fetchReviewData = async () => {
      const docId = reg.userId || step1.userId;
      if (!docId) {
        // Keep loader ON until doctorId becomes available (Step3 finishes)
        setLoading(true);
        return;
      }
      try {
        setLoading(true);
        const res = await getDoctorReviewDetails(docId);
        if (ignore) return;
        if (res.success && res.data) {
          setReviewData(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch doctor review details", err);
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    fetchReviewData();
    return () => { ignore = true; };
  }, [reg.userId, step1.userId]);

  const [termsAccepted, setTermsAccepted] = useState(formData.termsAccepted || false);
  const [privacyAccepted, setPrivacyAccepted] = useState(formData.privacyAccepted || false);
  const [formError, setFormError] = useState("");
  // Helpers to build display strings safely
  const orDash = (v) => (v === 0 ? '0' : (v ? v : '—'));
  const joinNonEmpty = (arr, sep = ', ') => arr.filter(Boolean).join(sep);
  const formatCompleted = (label, year) => {
    if (!label && !year) return '—';
    if (label && year) return `${label} (Completed : ${year})`;
    return label || `Completed : ${year}`;
  };

  const buildAddress = () => {
    const c = reg?.clinicData || {};
    const line1 = joinNonEmpty([c.blockNo, c.areaStreet, c.landmark], ', ');
    const line2 = joinNonEmpty([c.city, c.state, c.pincode], ', ');
    return orDash(joinNonEmpty([line1, line2], ' '));
  };

  // Mappers using API response if available, else falling back to store
  const dDetails = reviewData?.doctorDetails || {};
  const profDetails = reviewData?.professionalDetails || {};
  const clinDetails = reviewData?.clinicalInformation || {};

  const realDoctorName = dDetails.name || joinNonEmpty([step1?.firstName, step1?.lastName], ' ');
  const realAddress = clinDetails.address || buildAddress();

  // Helper to format education arrays
  const formatEducation = (eduArray, fallbackDegree, fallbackYear) => {
    if (Array.isArray(eduArray) && eduArray.length > 0) {
      return eduArray.map(e => `${e.degree} (Completed : ${e.completionYear})`).join(' | ');
    }
    if (fallbackDegree || fallbackYear) {
      return formatCompleted(fallbackDegree, fallbackYear);
    }
    return '—';
  };

  const doctorData = {
    doctorName: orDash(realDoctorName),
    gender: orDash(dDetails.gender || step1?.gender),
    // Handle userRole: default to 'Doctor' if not found, but avoid hardcoded 'Super Admin/Doctor' as primary if empty
    userRole: orDash(Array.isArray(dDetails.roles) ? dDetails.roles.join(', ') : (step1?.role ? (step1.role === 'doctor' ? 'Doctor' : step1.role) : '—')),
    personalEmail: orDash(dDetails.personalEmail || step1?.emailId),
    personalContact: orDash(dDetails.personalContact || step1?.phone),
    profilePhoto: dDetails.profilePhoto, // Add this if available from API

    mrnNumber: orDash(profDetails.mrnNumber || reg?.medicalCouncilRegNo),
    mrnProofUrl: profDetails.mrnProofUrl,
    registrationCouncil: orDash(profDetails.registrationCouncil || reg?.medicalCouncilName),
    registrationYear: orDash(profDetails.registrationYear || reg?.medicalCouncilRegYear),

    graduationDegree: formatEducation(profDetails.graduation, reg?.medicalDegreeType, reg?.medicalDegreeYearOfCompletion),
    medicalInstitute: orDash(profDetails.graduation?.[0]?.instituteName || reg?.medicalDegreeUniversityName),
    gradProofUrl: profDetails.graduation?.[0]?.proofUrl,

    postGraduation: formatEducation(profDetails.postGraduation, reg?.pgMedicalDegreeType, reg?.pgMedicalDegreeYearOfCompletion),
    pgMedicalInstitute: orDash(profDetails.postGraduation?.[0]?.instituteName || reg?.pgMedicalDegreeUniversityName),
    pgProofUrl: profDetails.postGraduation?.[0]?.proofUrl,

    specialization: (() => {
      if (profDetails.primarySpecialization?.name) {
        const { name, expYears } = profDetails.primarySpecialization;
        return `${name}${expYears ? ` (Exp : ${expYears} years)` : ''}`;
      }
      const specVal = reg?.specialization;
      const specName = typeof specVal === 'object' ? (specVal?.name || specVal?.value) : specVal;
      const exp = reg?.experienceYears;
      if (!specName && !exp) return '—';
      return `${specName || ''}${exp ? ` (Exp : ${exp} years)` : ''}`.trim();
    })(),

    clinicName: orDash(clinDetails.clinicName || reg?.clinicData?.name),
    hospitalType: orDash(clinDetails.hospitalType || reg?.clinicData?.type),
    clinicEmail: orDash(clinDetails.clinicEmail || clinDetails.emailId || reg?.clinicData?.email),
    clinicContact: orDash(clinDetails.clinicContact || clinDetails.phone || reg?.clinicData?.phone),
    eClinicId: orDash(clinDetails.eClinicId || reg?.eClinicId),
    address: orDash(realAddress)
  };

  const getDoc = (no) => {
    const doc = reg?.documents?.find(d => d.no === no);
    return doc ? doc.url || doc.tempKey : null;
  };

  useEffect(() => {
    if (formData.termsAccepted !== termsAccepted || formData.privacyAccepted !== privacyAccepted) {
      updateFormData({
        termsAccepted,
        privacyAccepted
      });
    }
  }, [termsAccepted, privacyAccepted]);

  const handleTermsChange = () => {
    const newValue = !termsAccepted;
    setTermsAccepted(newValue);
    updateFormData({ termsAccepted: newValue });
    if (formError) setFormError("");
  };

  const handlePrivacyChange = () => {
    const newValue = !privacyAccepted;
    setPrivacyAccepted(newValue);
    updateFormData({ privacyAccepted: newValue });
    if (formError) setFormError("");
  };

  // Validation before proceeding (call this before nextStep)
  const validateAgreements = () => {
    if (!termsAccepted || !privacyAccepted) {
      setFormError("You must accept both Terms & Conditions and Data Privacy Agreement to proceed.");
      return false;
    }
    setFormError("");
    return true;
  };

  const StatusBadge = ({ type }) => {
    if (type === 'verified_text') return <span className="text-success-300 text-xs ">Verified</span>;
    if (type === 'done') return <img src={verified2} alt="" className="w-3 h-3" />;
    if (type === 'review') return <span className="text-orange-500 text-xs  bg-orange-50 px-2 py-0.5 rounded-full">Under Verification</span>;
    return null;
  };

  const DetailRow = ({ label, value, type, file, isLink, verified, className, fileName, alignItems = "items-center" }) => (
    <div className={`flex gap-3 text-xs py-1 min-h-4 ${alignItems} ${className || 'w-full'}`}>
      <div className="w-[120px] text-secondary-grey400 font-medium flex-shrink-0">{label}</div>
      <div className="w-1 font-medium text-secondary-grey400">:</div>
      <div className={`flex-1 flex justify-between ${alignItems}`}>
        <div className={`flex gap-2 ${alignItems}`}>
          {isLink ? (
            file ? (
              <a href={file} target="_blank" rel="noopener noreferrer" className="text-blue-primary250 hover:underline flex items-center gap-1">
                {value || fileName || 'View Document'}
              </a>
            ) : (
              <span className="text-blue-primary250">{value}</span>
            )
          ) : (
            <span className="text-secondary-grey400">{value}</span>
          )}

          {file && !isLink && (
            <>
              <span className="text-secondary-grey100">|</span>
              <a href={file} target="_blank" rel="noopener noreferrer" className="text-blue-primary250 hover:underline flex items-center gap-1">
                {fileName || 'View Document'} <img src={right} alt="" className="w-1 h-2 ml-1" />
              </a>
            </>
          )}

          {file && isLink && null}

        </div>
        {(verified || type) && <StatusBadge type={verified ? 'verified_text' : type} />}
      </div>
    </div>
  );

  const SectionBox = ({ title, children }) => (
    <div className="border border-secondary-grey150/50 rounded-lg p-3">
      <h3 className="text-sm font-semibold text-secondary-grey400 mb-2">{title}</h3>
      {children}
    </div>
  );

  const renderPage1 = () => {
    if (loading) {
      return <div className="flex items-center justify-center h-[24px]
       "><UniversalLoader size={32}  /></div>;
    }
    return (
      <div className="max-w-[700px] mx-auto flex flex-col gap-4">

        <ReviewBanner
          icon={<img src={review} alt="" className="w-3 h-3" />}
          title="Ready to Activate"
          className="border-green-200 bg-green-50 text-green-800"
        />

        {/* Doctor Details */}
        <SectionBox title="Doctor Details">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
            <div className='flex flex-col '>
              <DetailRow label="Doctor Name" value={doctorData.doctorName} />
              <DetailRow label="Gender" value={doctorData.gender} />
              <DetailRow label="User Role" value={doctorData.userRole} />
            </div>
            <div className='flex flex-col '>
              <DetailRow label="Personal Email" value={doctorData.personalEmail} />
              <DetailRow label="Personal Contact" value={doctorData.personalContact} />
              <DetailRow
                label="Profile Photo"
                value={doctorData.profilePhoto ? 'Profile Photo' : (step1?.profilePhotoKey ? 'Doctorphoto.jpeg' : '—')}
                isLink={!!(doctorData.profilePhoto || step1?.profilePhotoKey)}
                file={doctorData.profilePhoto || step1?.profilePhotoKey}
                fileName="View Photo"
              />
            </div>
          </div>
        </SectionBox>

        {/* Professional Details */}
        <SectionBox title="Professional Details">
          <div className="space-y">
            <DetailRow
              label="MRN Number"
              value={doctorData.mrnNumber}
              verified={true}
              file={doctorData.mrnProofUrl || reg?.medicalCouncilProof}
              fileName="MRN Proof"
            />
            <DetailRow label="Registration Council" value={doctorData.registrationCouncil} />
            <DetailRow label="Registration Year" value={doctorData.registrationYear} />

            <div className="border-t border-secondary-grey100/50 my-2"></div>

            <DetailRow
              label="Graduation Degree"
              value={doctorData.graduationDegree}
              verified={true}
              file={doctorData.gradProofUrl || reg?.medicalDegreeProof}
              fileName="Grad Degree"
            />
            <DetailRow label="Medical Institute" value={doctorData.medicalInstitute} />

            <div className="border-t border-secondary-grey100/50 my-2"></div>

            <DetailRow
              label="Post Graduation"
              value={doctorData.postGraduation}
              verified={true}
              file={doctorData.pgProofUrl || reg?.pgMedicalDegreeProof}
              fileName="PG Degree"
            />
            <DetailRow label="Medical Institute" value={doctorData.pgMedicalInstitute} />

            <div className="border-t border-secondary-grey100/50 my-2"></div>

            <DetailRow label="Primary Specialization" value={doctorData.specialization} />

            <DetailRow
              label="Other Specialization"
              value={(() => {
                // Check API response for otherSpecializations
                if (Array.isArray(profDetails.otherSpecializations) && profDetails.otherSpecializations.length > 0) {
                  return profDetails.otherSpecializations.map(p => `${p.name} (Exp : ${p.expYears} years)`).join(' | ');
                }
                const practices = Array.isArray(reg?.additionalPractices) && reg.additionalPractices.length > 0
                  ? reg.additionalPractices
                  : [];
                const formatted = practices.map(p => {
                  const name = typeof p?.specialization === 'object' ? (p.specialization?.name || p.specialization?.value) : p?.specialization;
                  const exp = p?.experienceYears;
                  return name ? `${name} ${exp ? `(Exp : ${exp} years)` : ''}` : null;
                }).filter(Boolean).join(' | ');

                return formatted || "—";
              })()}
            />
          </div>
        </SectionBox>

        {/* Clinical Information */}
        <SectionBox title="Clinical Information">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 ">
            <div className="flex flex-col ">
              <DetailRow label="Clinic Name" value={doctorData.clinicName} />
              <DetailRow label="Hospital Type" value={doctorData.hospitalType} />
              <DetailRow label="Address" value={doctorData.address} alignItems="items-start" className="h-auto" />
            </div>
            <div className="flex flex-col ">
              <DetailRow label="Clinic Email" value={doctorData.clinicEmail} type="done" />
              <DetailRow label="Clinic Contact" value={doctorData.clinicContact} type="done" />
              <DetailRow label="e-clinic ID" value={doctorData.eClinicId} />
            </div>
          </div>
        </SectionBox>
      </div>
    );
  };

  const renderPage2 = () => (
    <div className="max-w-[700px] mx-auto flex flex-col gap-4">


      <ReviewBanner
        icon={<img src={review} alt="" className="w-3 h-3" />}
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
          <div className="flex  flex-col">
            <div className='flex gap-1 items-center'>
              <h3 className="text-sm font-semibold text-secondary-grey400">Digital Signature</h3>
              <div className='w-1 h-1 bg-error-400 rounded-full'></div>
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
        <div className=" mt-3">
          <ProgressBar step={currentSubStep} total={2} />
        </div>
      </RegistrationHeader>

      <div className="flex-1 overflow-y-auto p-6">
        {formError && (
          <div className="max-w-2xl mx-auto p-2">
            <span className="text-red-500 text-sm font-semibold">{formError}</span>
          </div>
        )}
        {currentSubStep === 1 ? renderPage1() : renderPage2()}
      </div>

    </div>
  );
};

export default Step4;