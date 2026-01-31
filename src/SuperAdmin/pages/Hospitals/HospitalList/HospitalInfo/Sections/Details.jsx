import React, { useState, useEffect, useCallback } from 'react'
import {
  pencil,
  add,
  verifiedTick,
  award,
  publication
} from '../../../../../../../public/index.js'
import MapLocation from '../../../../../../components/FormItems/MapLocation'
import InputWithMeta from '../../../../../../components/GeneralDrawer/InputWithMeta'
import { getDownloadUrl, getPublicUrl } from '../../../../../../services/uploadsService'
import { ChevronDown } from 'lucide-react'
import HospitalInfoDrawer from '../Drawers/HospitalInfoDrawer.jsx'
import AddAwardDrawer from '../Drawers/AddAwardDrawer.jsx'
import AddAccreditationDrawer from '../Drawers/AddAccreditationDrawer.jsx'
import MedicalSpecialtiesDrawer from '../Drawers/MedicalSpecialtiesDrawer.jsx'
import HospitalServicesDrawer from '../Drawers/HospitalServicesDrawer.jsx'
import { getHospitalAdminDetailsForSuperAdmin, getHospitalInfoAndAddressForSuperAdmin, getHospitalDocumentsForSuperAdmin, getHospitalAwardsAndAccreditationsForSuperAdmin } from '../../../../../../services/hospitalService'
import useSuperAdminAuthStore from '../../../../../../store/useSuperAdminAuthStore'
import UniversalLoader from '@/components/UniversalLoader'

// --- Components adapted from HAccount.jsx ---

const InfoField = ({ label, value, right, className: Class }) => (
  <div
    className={`${Class} flex flex-col gap-1 text-[14px] border-b-[0.5px] pb-[6px] border-secondary-grey100`}
  >
    <div className="col-span-4  text-secondary-grey200">{label}</div>
    <div className="col-span-8 text-secondary-grey400 flex items-center justify-between">
      <span className="truncate">{value || "-"}</span>
      {right}
    </div>
  </div>
);

const SectionCard = ({
  title,
  subtitle,
  subo,
  Icon,
  onIconClick,
  headerRight,
  children,
}) => (
  <div className="px-4 py-3 flex flex-col gap-3 bg-white rounded-lg ">
    <div className="flex items-center justify-between">
      {/* LEFT */}
      <div className='flex items-center justify-between w-full'>
        <div className="flex items-center gap-1 text-sm">
          <div className="font-medium text-[14px] text-gray-900">{title}</div>
          {subtitle && (
            <div className="px-1 border border-secondary-grey50 bg-secondary-grey50 rounded-[2px] text-[12px] text-gray-500 hover:border hover:border-blue-primary150 hover:text-blue-primary250 cursor-pointer">
              {subtitle}
            </div>
          )}
        </div>
        {subo && (
          <div className="flex gap-1 text-[12px] text-secondary-grey200">
            <span>{subo}</span>
            <span className="text-blue-primary250 cursor-pointer">Edit</span>
          </div>
        )}
      </div>
      {/* RIGHT */}
      <div className="flex items-center gap-3 shrink-0">
        {headerRight}
        {Icon && (
          <button
            onClick={onIconClick}
            className="p-1 text-gray-500 hover:bg-gray-50"
          >
            {typeof Icon === "string" ? (
              <img src={Icon} alt="icon" className="w-6 h-6" />
            ) : (
              <Icon className="w-6 h-6" />
            )}
          </button>
        )}
      </div>
    </div>
    <div>{children}</div>
  </div>
);

const ProfileItemCard = ({
  icon,
  title,
  badge,
  subtitle,
  date,
  location,
  linkLabel,
  linkUrl,
  description,
  initiallyExpanded = false,
  rightActions,
  // Optional inline edit control
  showEditEducation = false,
  editEducationIcon,
  onEditEducationClick,
  editEducationAriaLabel = "Edit",
}) => {
  const [expanded, setExpanded] = useState(!!initiallyExpanded);
  const MAX_CHARS = 220;
  const showSeeMore = !linkUrl && typeof description === 'string' && description.length > MAX_CHARS;
  const visibleText =
    !linkUrl && typeof description === 'string'
      ? expanded
        ? description
        : description.length > MAX_CHARS
          ? description.slice(0, MAX_CHARS).trimEnd() + '…'
          : description
      : '';
  return (
    <div className="flex  py-2.5 pt-1.5 border-b rounded-md bg-white">
      {/* Icon */}
      <div className="w-[64px] mr-4 h-[64px] rounded-full border border-secondary-grey50 bg-gray-100 flex items-center justify-center text-gray-600 shrink-0">
        {typeof icon === "string" ? (
          <img src={icon} alt="" className="w-8 h-8 object-contain" />
        ) : (
          icon
        )}
      </div>

      {/* Content */}
      <div className="flex  flex-col gap-[2px] w-full">
        <div className="flex items-center justify-between">
          <div className="flex flex-shrink-0  items-center gap-1 text-sm text-secondary-grey400">
            <span className="font-semibold">{title}</span>
            {badge && (
              <span className="text-[12px]   min-w-[18px]  text-secondary-grey400 bg-secondary-grey50 rounded px-1 ">
                {badge}
              </span>
            )}
          </div>

          {showEditEducation && (
            <button
              type="button"
              onClick={onEditEducationClick}
              aria-label={editEducationAriaLabel}
              title={editEducationAriaLabel}
              className="inline-flex items-center justify-center rounded hover:bg-secondary-grey50 text-secondary-grey300 mr-2"
            >
              {typeof editEducationIcon === "string" && editEducationIcon ? (
                <img src={editEducationIcon} alt="edit" className="w-6" />
              ) : editEducationIcon ? (
                React.createElement(editEducationIcon, { className: "w-6" })
              ) : (
                <img src={pencil} alt="edit" className="w-6" />
              )}
            </button>
          )}
        </div>

        {subtitle && <div className="text-sm text-secondary-grey400 w-4/5">{subtitle}</div>}
        {date && <div className="text-sm text-secondary-grey200">{date}</div>}
        {location && <div className="text-sm text-secondary-grey200">{location}</div>}

        {linkUrl ? (
          <div className="flex items-center gap-1">
            <a
              href={linkUrl}
              className="inline-flex items-center gap-1 text-sm text-blue-primary250"
              target="_blank"
              rel="noreferrer"
            >
              {linkLabel}
            </a>
          </div>
        ) : (
          description ? (
            <div className="mt-2">
              <div className="text-[13px] text-secondary-grey400">{visibleText}</div>
              {showSeeMore && (
                <button
                  type="button"
                  className="mt-1 text-[13px] text-secondary-grey200 inline-flex items-center gap-1 hover:text-secondary-grey300"
                  onClick={() => setExpanded((v) => !v)}
                >
                  {expanded ? 'See Less' : 'See More'}
                  <ChevronDown className={`w-3 h-3 transition-transform ${expanded ? 'rotate-180' : ''}`} />
                </button>
              )}
            </div>
          ) : null
        )}
      </div>

      {/* Right actions – render ONLY if provided */}
      {rightActions && (
        <div className="flex items-center gap-2">{rightActions}</div>
      )}
    </div>
  );
};

const VerifiedBadge = () => (
  <span className="inline-flex items-center text-success-300 border bg-success-100 border-success-300 py-0.5 px-1 rounded-md text-[12px]">
    <img src={verifiedTick} alt="Verified" className="w-3.5 h-3.5 mr-1" />
    Verified
  </span>
)

// --- End Components ---

const Details = ({ hospital }) => {
  const isAuthed = useSuperAdminAuthStore((s) => Boolean(s.token))
  const [openInfoDrawer, setOpenInfoDrawer] = useState(false)
  const [openSpecialtiesDrawer, setOpenSpecialtiesDrawer] = useState(false)
  const [openServicesDrawer, setOpenServicesDrawer] = useState(false)
  const [openAwardDrawer, setOpenAwardDrawer] = useState(false)
  const [openAccreditationDrawer, setOpenAccreditationDrawer] = useState(false)
  const [selectedAward, setSelectedAward] = useState(null)
  const [selectedAccreditation, setSelectedAccreditation] = useState(null)
  const [showAddMenu, setShowAddMenu] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [activeDrawerSection, setActiveDrawerSection] = useState(null)

  const refreshData = (options = {}) => {
    if (options.silent || options.sections) {
      loadDetails(options);
    } else {
      setRefreshTrigger(prev => prev + 1);
    }
  }

  // Local state from Super Admin APIs
  // Section-specific loading and error states
  const [loadingInfo, setLoadingInfo] = useState(true)
  const [loadingAdmin, setLoadingAdmin] = useState(true)
  const [errorInfo, setErrorInfo] = useState(null)
  const [errorAdmin, setErrorAdmin] = useState(null)
  const [profile, setProfile] = useState(() => ({
    hospitalName: hospital?.name || '-',
    type: hospital?.type || '-',
    phone: hospital?.phone || '-',
    email: hospital?.emailId || hospital?.email || '-',
    estDate: hospital?.establishmentYear || '-',
    website: hospital?.url || hospital?.website || '-',
    emergencyPhone: hospital?.emergencyContactNumber || '-',
    beds: hospital?.noOfBeds,
    icuBeds: hospital?.noOfICUBeds,
    ambulances: hospital?.noOfAmbulances,
    ambulancePhone: hospital?.ambulanceNumber,
    bloodBank: hospital?.isBloodBankAvailable,
    bloodBankPhone: hospital?.bloodBankContactNumber,
    address: hospital?.address || {},
    city: hospital?.city,
    state: hospital?.state,
    about: hospital?.about,
    photos: hospital?.photos || hospital?.images || [],
    specialties: (hospital?.specialties || []).map(s => s?.specialty?.name || s?.name || s),
    services: (hospital?.hospitalServices || []).map(s => s?.name || s),
    admin: (hospital?.adminDetails || [])[0] || {},
    gst: {
      number: hospital?.gstNumber,
      doc: hospital?.documents?.find(d => d.docType?.toLowerCase().includes('gst'))
    },
    cin: { number: hospital?.cinNumber },
    documents: hospital?.documents || [],
    mapLocation: null,
    hospitalId: hospital?.temp || hospital?.id,
  }))

  const [awards, setAwards] = useState(hospital?.awards || [])
  const [accreditations, setAccreditations] = useState([])
  const [publications, setPublications] = useState(hospital?.publications || [])

  // Resolve photo keys to URLs
  const [resolvedPhotos, setResolvedPhotos] = useState([])
  useEffect(() => {
    let ignore = false
    const run = async () => {
      try {
        const keys = profile?.photos || []
        const urls = await Promise.all(keys.map((k) => getPublicUrl(k)))
        if (!ignore) setResolvedPhotos(urls.filter(Boolean))
      } catch {
        if (!ignore) setResolvedPhotos([])
      }
    }
    run()
    return () => { ignore = true }
  }, [JSON.stringify(profile.photos)])

  // Fetch details from Super Admin endpoints
  const loadDetails = useCallback(async (options = {}) => {
    const { silent = false, sections = ['info', 'admin', 'awards'] } = options;
    const isInfo = sections.includes('info');
    const isAdmin = sections.includes('admin');
    const isAwards = sections.includes('awards');

    if (!silent) {
      if (isInfo) setLoadingInfo(true);
      if (isAdmin) setLoadingAdmin(true);
      if (isAwards) setLoadingAwards(true);
    }
    if (isInfo) setErrorInfo(null);
    if (isAdmin) setErrorAdmin(null);
    if (isAwards) setLoadingAwards(true); // Should be reset error if any, but let's keep it simple for now as per previous pattern

    let ignore = false;
    try {
      const hospitalId = hospital?.temp || hospital?.id;
      if (!hospitalId) {
        setLoadingInfo(false);
        setLoadingAdmin(false);
        return;
      }

      const promises = [];
      if (isInfo) promises.push(getHospitalInfoAndAddressForSuperAdmin(hospitalId));
      else promises.push(Promise.resolve({ skip: true }));

      if (isAdmin) promises.push(getHospitalAdminDetailsForSuperAdmin(hospitalId));
      else promises.push(Promise.resolve({ skip: true }));

      if (isAwards) promises.push(getHospitalAwardsAndAccreditationsForSuperAdmin(hospitalId));
      else promises.push(Promise.resolve({ skip: true }));

      const [infoRes, adminRes, awardsRes] = await Promise.allSettled(promises);
      if (ignore) return;

      // Process Hospital Info & Address
      if (isInfo && infoRes.status === 'fulfilled' && !infoRes.value.skip) {
        const infoAdr = infoRes.value;
        const hInfo = infoAdr?.data?.hospitalInfo || {};
        const hAddr = infoAdr?.data?.hospitalAddress || {};
        const mapLoc = hAddr?.mapLocation;
        setProfile(prev => ({
          ...prev,
          hospitalName: hInfo.hospitalName || prev.hospitalName,
          type: hInfo.hospitalType || prev.type,
          phone: hInfo.mobileNumber || prev.phone,
          email: hInfo.email || prev.email,
          estDate: hInfo.establishmentDate || prev.estDate,
          website: hInfo.website || prev.website,
          emergencyPhone: hInfo.emergencyContactNumber || prev.emergencyPhone,
          beds: hInfo.numberOfBeds ?? prev.beds,
          icuBeds: hInfo.numberOfIcuBeds ?? prev.icuBeds,
          ambulances: hInfo.numberOfAmbulances ?? prev.ambulances,
          ambulancePhone: hInfo.ambulanceContactNumber ?? prev.ambulancePhone,
          bloodBank: hInfo.hasBloodBank ?? prev.bloodBank,
          bloodBankPhone: hInfo.bloodBankContactNumber ?? prev.bloodBankPhone,
          about: hInfo.about ?? prev.about,
          photos: Array.isArray(hInfo.hospitalPhotos) ? hInfo.hospitalPhotos : (prev.photos || []),
          address: {
            ...prev.address,
            blockNo: hAddr.blockBuildingName,
            street: hAddr.roadAreaStreet,
            landmark: hAddr.landmark,
            pincode: hAddr.pincode,
          },
          city: hAddr.city ?? prev.city,
          state: hAddr.state ?? prev.state,
          mapLocation: mapLoc && typeof mapLoc.latitude === 'number' && typeof mapLoc.longitude === 'number'
            ? { lat: mapLoc.latitude, lng: mapLoc.longitude }
            : null,
        }));
      } else if (isInfo && infoRes.status === 'rejected') {
        const e = infoRes.reason;
        setErrorInfo(e?.response?.data?.message || e?.message || 'Failed to load hospital info & address');
      }

      // Process Admin Details
      if (isAdmin && adminRes.status === 'fulfilled' && !adminRes.value.skip) {
        const adminDet = adminRes.value;
        const admin = adminDet?.data || {};
        setProfile(prev => ({
          ...prev,
          admin: {
            ...prev.admin,
            firstName: admin.firstName,
            lastName: admin.lastName,
            phone: admin.mobileNumber,
            emailId: admin.email,
            gender: admin.gender,
            city: admin.city,
            designation: admin.designation,
            role: admin.role,
          }
        }));
      } else if (isAdmin && adminRes.status === 'rejected') {
        const e = adminRes.reason;
        setErrorAdmin(e?.response?.data?.message || e?.message || 'Failed to load admin details');
      }

      // Process Awards & Accreditations (and optionally Publications if they come from the same endpoint)
      if (isAwards && awardsRes.status === 'fulfilled' && !awardsRes.value.skip) {
        const awData = awardsRes.value?.data || {};
        setAwards(awData.awards || []);
        setAccreditations(awData.accreditations || []);
        if (awData.publications) setPublications(awData.publications);
      }
    } finally {
      if (!ignore) {
        setLoadingInfo(false);
        setLoadingAdmin(false);
        setLoadingAwards(false);
      }
    }
    return () => { ignore = true; };
  }, [isAuthed, hospital?.temp, hospital?.id]);

  useEffect(() => {
    if (isAuthed) loadDetails();
    else {
      setLoadingInfo(false);
      setLoadingAdmin(false);
    }
  }, [loadDetails, refreshTrigger]);

  // Documents section: own loading/error and resolved URLs
  const [loadingDocs, setLoadingDocs] = useState(true)
  const [errorDocs, setErrorDocs] = useState(null)
  const [docs, setDocs] = useState([])
  const [resolvedDocUrls, setResolvedDocUrls] = useState({})

  useEffect(() => {
    let ignore = false
    const loadDocs = async () => {
      setLoadingDocs(true)
      setErrorDocs(null)
      try {
        const hospitalId = hospital?.temp || hospital?.id
        if (!hospitalId) { setLoadingDocs(false); return }
        const resp = await getHospitalDocumentsForSuperAdmin(hospitalId)
        if (ignore) return
        const list = Array.isArray(resp?.data) ? resp.data : []
        setDocs(list)
        // Resolve URLs
        const entries = await Promise.all(list.map(async (d) => [d.id, await getDownloadUrl(d.docUrl)]))
        if (!ignore) setResolvedDocUrls(Object.fromEntries(entries))
      } catch (e) {
        if (!ignore) setErrorDocs(e?.response?.data?.message || e?.message || 'Failed to load documents')
      } finally {
        if (!ignore) setLoadingDocs(false)
      }
    }
    if (isAuthed) loadDocs(); else setLoadingDocs(false)
    return () => { ignore = true }
  }, [isAuthed, hospital?.temp, hospital?.id, refreshTrigger])

  // Fetch Awards & Accreditations
  const [loadingAwards, setLoadingAwards] = useState(true)
  useEffect(() => {
    let ignore = false
    const loadAwards = async () => {
      setLoadingAwards(true)
      try {
        const hospitalId = hospital?.temp || hospital?.id
        if (!hospitalId) { setLoadingAwards(false); return }
        const resp = await getHospitalAwardsAndAccreditationsForSuperAdmin(hospitalId)
        if (ignore) return
        if (resp?.success) {
          setAwards(resp.data?.awards || [])
          setAccreditations(resp.data?.accreditations || [])
          if (resp.data?.publications) setPublications(resp.data.publications)
        }
      } catch (e) {
        console.error("Failed to load awards/accreditations:", e)
      } finally {
        if (!ignore) setLoadingAwards(false)
      }
    }
    if (isAuthed) loadAwards(); else setLoadingAwards(false)
    return () => { ignore = true }
  }, [isAuthed, hospital?.temp, hospital?.id, refreshTrigger])

  const formatMonthYear = (dateStr) => {
    if (!dateStr) return '-'
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return dateStr
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  }

  const loading = loadingInfo || loadingAdmin
  // Documents mapping for Verification Documents section
  const gstDoc = docs.find(d => d.docType === 'GST_PROOF')
  const shrDoc = docs.find(d => d.docType === 'STATE_HEALTH_REG_PROOF')
  const panDoc = docs.find(d => d.docType === 'PAN_CARD')
  const cinDoc = docs.find(d => d.docType === 'CIN_PROOF' || (d.docType || '').includes('CIN'))
  const otherDocs = docs.filter(d => !['GST_PROOF', 'STATE_HEALTH_REG_PROOF', 'PAN_CARD'].includes(d.docType) && !((d.docType || '').includes('CIN')))
  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center py-10">
        <UniversalLoader size={28} />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-12 gap-6 bg-secondary-grey50 p-4">
      {/* Left Column (7/12) */}
      <div className="col-span-12 xl:col-span-6 space-y-6">

        {/* Hospital Info */}
        <SectionCard
          title="Hospital Info"
          Icon={pencil}
          subtitle="Visible to Patient"
          onIconClick={() => {
            setActiveDrawerSection('info');
            setOpenInfoDrawer(true);
          }}
        >
          {errorInfo ? (
            <div className="text-red-600 bg-red-50 border border-red-200 p-3 rounded">{String(errorInfo)}</div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                <InfoField label="Hospital Name" value={profile.hospitalName} />
                <InfoField label="Hospital Type" value={profile.type} />
                <InfoField label="Mobile Number" value={profile.phone} right={<VerifiedBadge />} />
                <InfoField label="Email" value={profile.email} right={<VerifiedBadge />} />
                <InfoField label="Establishment Date" value={profile.estDate} />

                {/* Establishment Proof */}
                <div>
                  <div className="text-[14px] text-secondary-grey200 mb-1">Establishment Proof</div>
                  <InputWithMeta
                    imageUpload={true}
                    fileName={"Establishment.pdf"}
                    onFileView={(f) => console.log('view', f)}
                    showInput={false}
                  />
                </div>

                <InfoField label="Website" value={profile.website} />
                <InfoField label="Emergency Contact Number" value={profile.emergencyPhone} />
                <InfoField label="Number of Beds" value={profile.beds} />
                <InfoField label="Number of ICU Beds" value={profile.icuBeds} />
                <InfoField label="Number of Ambulances" value={profile.ambulances} />
                <InfoField label="Ambulance Contact Number" value={profile.ambulancePhone} />
                <InfoField label="Do you have Blood Bank" value={profile.bloodBank ? "Yes" : "No"} />
                <InfoField label="Blood Bank Contact Number" value={profile.bloodBankPhone} />
              </div>
              <div className="pt-4 pb-4">
                <div className="text-sm text-secondary-grey200 mb-1">About</div>
                <p className="text-sm leading-relaxed text-secondary-grey400">{profile.about}</p>
              </div>

              <InputWithMeta
                label="Hospital Photos"
                showInput={false}
              >
              </InputWithMeta>
              <div className="flex gap-4 overflow-x-auto pb-1">
                {resolvedPhotos && resolvedPhotos.length > 0 ? (
                  resolvedPhotos.map((src, i) => (
                    <img key={i} src={src} alt="hospital" className="w-[120px] h-[120px] rounded-md object-cover border border-gray-100" />
                  ))
                ) : (
                  <div className="text-sm text-secondary-grey200 ">No Photos</div>
                )}
              </div>
            </>
          )}
        </SectionCard>

        {/* --- Drawers --- */}

        {/* Hospital Info */}
        <HospitalInfoDrawer
          open={openInfoDrawer}
          onClose={() => {
            setOpenInfoDrawer(false);
            setActiveDrawerSection(null);
          }}
          onSave={refreshData}
          initial={{ ...profile, hospitalId: hospital?.temp || hospital?.id }}
          initialSection={activeDrawerSection}
        />

        <AddAwardDrawer
          open={openAwardDrawer}
          onClose={() => { setOpenAwardDrawer(false); setSelectedAward(null); }}
          onSuccess={() => refreshData({ silent: true, sections: ['awards'] })}
          hospitalId={hospital?.temp || hospital?.id}
          mode={selectedAward ? "edit" : "add"}
          initial={selectedAward || {}}
        />

        {/* Add/Edit Accreditation */}
        <AddAccreditationDrawer
          open={openAccreditationDrawer}
          onClose={() => { setOpenAccreditationDrawer(false); setSelectedAccreditation(null); }}
          onSuccess={() => refreshData({ silent: true, sections: ['awards'] })}
          hospitalId={hospital?.temp || hospital?.id}
          mode={selectedAccreditation ? "edit" : "add"}
          initial={selectedAccreditation || {}}
        />

        {/* Medical Specialties */}
        <SectionCard title="Medical Specialties" Icon={pencil} onIconClick={() => setOpenSpecialtiesDrawer(true)}>
          <div className="flex flex-wrap gap-3">
            {(profile.specialties && profile.specialties.length > 0 ? profile.specialties : ['-']).map((s, i) => (
              <span key={i} className="px-1 rounded-[2px] border border-gray-100 bg-gray-50 text-sm text-secondary-grey400 hover:border-blue-primary150 hover:text-blue-primary250 cursor-pointer">{s}</span>
            ))}
          </div>
        </SectionCard>

        {/* Services & Facilities */}
        <SectionCard title="Hospital Services & Facilities" subtitle="Visible to Patient" Icon={pencil} onIconClick={() => setOpenServicesDrawer(true)}>
          <div className="flex flex-wrap gap-3">
            {(profile.services && profile.services.length > 0 ? profile.services : ['-']).map((s, i) => (
              <span key={i} className="px-1 rounded-[2px] border border-gray-100 bg-gray-50 text-sm text-secondary-grey400 hover:border-blue-primary150 hover:text-blue-primary250 cursor-pointer">{s}</span>
            ))}
          </div>
        </SectionCard>

        {/* Awards & Publications */}
        <SectionCard
          title="Awards, Accreditations & Publications"
          Icon={add}
          subtitle="Visible to Patient"
          onIconClick={() => setShowAddMenu((v) => !v)}
        >
          <div className="relative">
            {showAddMenu && (
              <div className="absolute right-0 bottom-11 mt-0.5 bg-white border border-gray-200 rounded-md p-1 text-[13px] z-20">
                <button
                  className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 w-full text-left"
                  onClick={() => { setShowAddMenu(false); setOpenAwardDrawer(true); }}
                >
                  <img src={award} alt="" className="w-4 h-4" /> Add Awards
                </button>
                <button
                  className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 w-full text-left"
                  onClick={() => { setShowAddMenu(false); setOpenAccreditationDrawer(true); }}
                >
                  <img src={award} alt="" className="w-4 h-4" /> Add Accreditations
                </button>
              </div>
            )}
          </div>
          <div className="space-y-2">
            {loadingAwards && (
              <div className="w-full flex items-center justify-center p-4">
                <UniversalLoader size={20} />
              </div>
            )}
            {!loadingAwards && awards.length === 0 && accreditations.length === 0 && publications.length === 0 && (
              <div className="text-sm text-gray-400">No awards, accreditations or publications listed.</div>
            )}

            {!loadingAwards && accreditations.map((acc) => (
              <ProfileItemCard
                key={acc.id}
                icon={award}
                title={acc.accreditationName}
                subtitle={`${acc.accreditingBody} | No: ${acc.certificateNumber || '-'}`}
                date={`${formatMonthYear(acc.issueDate)} - ${acc.expiryDate ? formatMonthYear(acc.expiryDate) : 'Present'}`}
                linkLabel="Certificate ↗"
                linkUrl={acc.certificateUrl}
                description={acc.description}
                showEditEducation={true}
                editEducationIcon={pencil}
                onEditEducationClick={() => {
                  setSelectedAccreditation(acc);
                  setOpenAccreditationDrawer(true);
                }}
              />
            ))}

            {!loadingAwards && awards.map((aw) => (
              <ProfileItemCard
                key={aw.id}
                icon={award}
                title={aw.awardName}
                subtitle={aw.issuerName}
                date={formatMonthYear(aw.issueDate)}
                linkLabel="Certificate ↗"
                linkUrl={aw.awardUrl}
                showEditEducation={true}
                editEducationIcon={pencil}
                onEditEducationClick={() => {
                  setSelectedAward(aw);
                  setOpenAwardDrawer(true);
                }}
              />
            ))}

            {publications.map((pub) => (
              <ProfileItemCard
                key={pub.id}
                icon={publication}
                title={pub.publicationName || pub.title}
                subtitle={pub.publisher || pub.associatedWith}
                date={pub.publicationDate ? formatMonthYear(pub.publicationDate) : undefined}
                linkLabel="Publication ↗"
                linkUrl={pub.publicationUrl}
                description={pub.description}
              />
            ))}
          </div>
        </SectionCard>

        {/* Mounted drawers for left column sections */}
        <MedicalSpecialtiesDrawer
          open={openSpecialtiesDrawer}
          onClose={() => setOpenSpecialtiesDrawer(false)}
          selectedItems={profile.specialties}
          onSave={(list) => {/* integrate save */ }}
        />
        <HospitalServicesDrawer
          open={openServicesDrawer}
          onClose={() => setOpenServicesDrawer(false)}
          selectedItems={profile.services}
          onSave={(list) => {/* integrate save */ }}
        />


      </div >

      {/* Right Column (5/12) */}
      < div className="col-span-12 xl:col-span-6 space-y-6" >

        {/* Address */}
        < SectionCard title="Hospital Address" subtitle="Visible to Patient" Icon={pencil} onIconClick={() => {
          setActiveDrawerSection('address');
          setOpenInfoDrawer(true);
        }}>
          {
            errorInfo ? (
              <div className="text-red-600 bg-red-50 border border-red-200 p-3 rounded" > {String(errorInfo)}</div>
            ) : (
              <>
                <InputWithMeta label="Map Location" showInput={false} infoIcon />
                <div className="h-[100px] bg-gray-100 rounded-lg border border-gray-200 mb-3 overflow-hidden relative">
                  <MapLocation initialPosition={profile?.mapLocation ? [profile.mapLocation.lat, profile.mapLocation.lng] : null} heightClass="h-[100px]" />
                </div>
                <div className="grid grid-cols-1 gap-3">
                  <div className="grid grid-cols-2 gap-8">
                    <InfoField label="Block no./Shop no./House no." value={profile.address?.blockNo || profile.address?.block} />
                    <InfoField label="Road/Area/Street" value={profile.address?.street || profile.address?.road} />
                  </div>
                  <div className="grid grid-cols-2 gap-8">
                    <InfoField label="Landmark" value={profile.address?.landmark} />
                    <InfoField label="Pincode" value={profile.address?.pincode} />
                  </div>
                  <div className="grid grid-cols-2 gap-8">
                    <InfoField label="City" value={profile.city} />
                    <InfoField label="State" value={profile.state} />
                  </div>
                </div>
              </>
            )}
        </SectionCard >

        {/* Primary Admin */}
        < SectionCard title="Primary Admin Account Details" Icon={pencil} onIconClick={() => {
          setActiveDrawerSection('admin');
          setOpenInfoDrawer(true);
        }} >
          {
            errorAdmin ? (
              <div className="text-error-400 text-sm" > {String(errorAdmin)}</div>
            ) : (
              <div className="grid grid-cols-2 gap-x-7 gap-y-3">
                <InfoField label="First Name" value={profile.admin?.firstName || (profile.admin?.name || '').split(' ')[0]} />
                <InfoField label="Last Name" value={profile.admin?.lastName || (profile.admin?.name || '').split(' ').slice(1).join(' ')} />
                <InfoField label="Mobile Number" value={profile.admin?.phone} right={<VerifiedBadge />} />
                <InfoField label="Email" value={profile.admin?.emailId || profile.admin?.email} right={<VerifiedBadge />} />
                <InfoField label="Gender" value={profile.admin?.gender} />
                <InfoField label="City" value={profile.admin?.city} />
                <InfoField label="Designation" value={profile.admin?.designation || "Super Admin"} />
                <InfoField label="Role" value={profile.admin?.role || "Admin"} />
              </div>
            )}
        </SectionCard >

        {/* Verification Documents */}
        < SectionCard title="Verification Documents" subtitle="Visible to Patient" subo="To change your Medical proof please" >
          {loadingDocs && (
            <div className="w-full flex items-center justify-center h-28"><UniversalLoader size={24} /></div>
          )}
          {
            !loadingDocs && errorDocs && (
              <div className="text-red-600 bg-red-50 border border-red-200 p-3 rounded">{String(errorDocs)}</div>
            )
          }
          {
            !loadingDocs && !errorDocs && (
              docs.length === 0 ? (
                <div className="text-sm text-secondary-grey400">No documents found.</div>
              ) : (
                <div className="space-y-3">
                  {gstDoc && (
                    <div className='flex flex-col gap-2'>
                      <h4 className="text-sm font-medium text-secondary-grey400">
                        <span className="relative inline-block pb-2">
                          GST Details
                          <span className="absolute left-1/2 bottom-0 h-[2px] w-full -translate-x-3/4 scale-x-50 bg-blue-primary150/50"></span>
                        </span>
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
                        <div><InfoField label="GST Number" value={gstDoc.docNo || '-'} /></div>
                        <div>
                          <div className="text-[14px] text-secondary-grey200 mb-1">Proof of GST Registration</div>
                          <InputWithMeta imageUpload={true} fileName={'GST Document'} onFileView={() => { const url = resolvedDocUrls[gstDoc.id]; if (url) window.open(url, '_blank'); }} showInput={false} />
                        </div>
                      </div>
                    </div>
                  )}

                  {cinDoc && (
                    <div className='flex flex-col gap-2'>
                      <h4 className="text-sm font-medium text-secondary-grey400">
                        <span className="relative inline-block pb-2">
                          CIN Details
                          <span className="absolute left-1/2 bottom-0 h-[2px] w-full -translate-x-3/4 scale-x-50 bg-blue-primary150/50"></span>
                        </span>
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
                        <div><InfoField label="CIN Number" value={cinDoc.docNo || '-'} /></div>
                        <div>
                          <div className="text-[14px] text-secondary-grey200 mb-1">Proof of CIN Registration</div>
                          <InputWithMeta imageUpload={true} fileName={'CIN Document'} onFileView={() => { const url = resolvedDocUrls[cinDoc.id]; if (url) window.open(url, '_blank'); }} showInput={false} />
                        </div>
                      </div>
                    </div>
                  )}

                  {shrDoc && (
                    <div className='flex flex-col gap-2'>
                      <h4 className="text-sm font-medium text-secondary-grey400">
                        <span className="relative inline-block pb-2">
                          State Health Registration
                          <span className="absolute left-1/2 bottom-0 h-[2px] w-full -translate-x-3/4 scale-x-50 bg-blue-primary150/50"></span>
                        </span>
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
                        <div><InfoField label="Registration Number" value={shrDoc.docNo || '-'} /></div>
                        <div>
                          <div className="text-[14px] text-secondary-grey200 mb-1">Proof Document</div>
                          <InputWithMeta imageUpload={true} fileName={'State Health Reg Proof'} onFileView={() => { const url = resolvedDocUrls[shrDoc.id]; if (url) window.open(url, '_blank'); }} showInput={false} />
                        </div>
                      </div>
                    </div>
                  )}

                  {panDoc && (
                    <div className='flex flex-col gap-2'>
                      <h4 className="text-sm font-medium text-secondary-grey400">
                        <span className="relative inline-block pb-2">
                          PAN Card
                          <span className="absolute left-1/2 bottom-0 h-[2px] w-full -translate-x-3/4 scale-x-50 bg-blue-primary150/50"></span>
                        </span>
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
                        <div><InfoField label="PAN Number" value={panDoc.docNo || '-'} /></div>
                        <div>
                          <div className="text-[14px] text-secondary-grey200 mb-1">PAN Document</div>
                          <InputWithMeta imageUpload={true} fileName={'PAN Card'} onFileView={() => { const url = resolvedDocUrls[panDoc.id]; if (url) window.open(url, '_blank'); }} showInput={false} />
                        </div>
                      </div>
                    </div>
                  )}

                  {otherDocs.length > 0 && (
                    <div className="pt-2">
                      <h5 className="text-sm font-medium text-secondary-grey400 mb-2">Other Documents</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {otherDocs.map(d => (
                          <div key={d.id} className="border border-secondary-grey100 rounded-md p-3 bg-white">
                            <div className="text-sm text-secondary-grey400"><span className="font-medium">Type:</span> {d.docType.replaceAll('_', ' ')}</div>
                            <div className="text-sm text-secondary-grey400"><span className="font-medium">Number:</span> {d.docNo || '-'}
                            </div>
                            <div className="mt-2">
                              <button type="button" className="text-sm text-blue-600 hover:underline" onClick={() => { const url = resolvedDocUrls[d.id]; if (url) window.open(url, '_blank'); }}>
                                View Document
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            )
          }
        </SectionCard >

      </div >
    </div >
  )
}

export default Details
