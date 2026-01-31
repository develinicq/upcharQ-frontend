import { ChevronDown, Hospital, MoreHorizontal, Building2, Stethoscope, MoreVertical, Plus, MinusCircle, Trash2, Calendar, CalendarOff, Link, UserX } from 'lucide-react';
import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import AvatarCircle from '../../AvatarCircle';
import { docIcon, blueBag, whiteBag } from '../../../../public/index.js';
import InfoBox from './InfoBox';
import RadioButton from '../../GeneralDrawer/RadioButton';
import Badge from '@/components/Badge';
import { getDoctorDetailsByIdBySuperAdmin } from '@/services/doctorService';
import UniversalLoader from "@/components/UniversalLoader";
import { getPublicUrl } from '@/services/uploadsService';

const star = '/star.png'
const down = '/angel-down.svg'
const horizontal = '/superAdmin/Doctors/Threedots.svg'
const hospital2 = '/superAdmin/Doctors/Hospital.svg'
const clinic = '/superAdmin/Doctors/Medical Kit.svg'


const hospital = '/icons/Sidebar/MainSidebar/hospital_unselect.png'
const calendarReschedule = '/superAdmin/doctor_list_dropdown/Calendar Reschedule.svg';
const bin = '/superAdmin/doctor_list_dropdown/bin.svg';
const inactiveIcon = '/superAdmin/doctor_list_dropdown/inactive.svg';
const linkIconLocal = '/superAdmin/doctor_list_dropdown/link.svg';
const outOfOffice = '/superAdmin/doctor_list_dropdown/out_of_office.svg';

const DoctorBanner = ({ doctor: initialDoctor, onClinicChange }) => {
  const { id } = useParams();
  const [doctor, setDoctor] = useState(initialDoctor);
  const [loading, setLoading] = useState(true);
  const [profileImageUrl, setProfileImageUrl] = useState('');
  const [imageLoading, setImageLoading] = useState(false);

  useEffect(() => {
    // If we have initial doctor data passed, we might show it, but user wants loader until API loads. 
    // So we can stick to loading=true initially. State update below handles it.
    if (initialDoctor) setDoctor(initialDoctor);
  }, [initialDoctor]);

  useEffect(() => {
    const fetchDetails = async () => {
      const userId = id || initialDoctor?.userId || initialDoctor?.id;
      if (!userId) {
        setLoading(false);
        return;
      }

      console.log("DoctorBanner: Fetching latest details for:", userId);
      setLoading(true);
      try {
        const resp = await getDoctorDetailsByIdBySuperAdmin(userId);
        console.log("DoctorBanner: Fetched Data:", resp);
        if (resp?.data) {
          const d = resp.data;
          const workplace = d?.workplace || { clinics: [], hospitals: [] };
          const clinicHospitalName = d?.clinicHospitalName || initialDoctor?.clinicHospitalName;

          let foundId = null;
          // Try to find the ID that match the name
          const allFacilities = [...(workplace.clinics || []), ...(workplace.hospitals || [])];
          const match = allFacilities.find(f => f.name === clinicHospitalName);
          if (match) {
            foundId = String(match.id || match._id);
          }

          const mapped = {
            ...initialDoctor,
            ...d,
            id: d?.doctorCode || userId,
            userId: userId,
            name: d?.doctorName || initialDoctor?.name,
            workplace,
            designation: d?.qualification || initialDoctor?.designation,
            specialization: d?.specialization || initialDoctor?.specialization,
            medicalPracticeType: d?.medicalPracticeType,
            exp: d?.experienceOverall != null ? `${d.experienceOverall} yrs exp` : initialDoctor?.exp,
            status: d?.status || initialDoctor?.status,
            rating: d?.rating || initialDoctor?.rating,
            activePackage: d?.activePackage || initialDoctor?.activePackage,
            clinicHospitalName,
            noOfPatientsManaged: d?.noOfPatientsManaged,
            noOfAppointmentsBooked: d?.noOfAppointmentsBooked,
          };

          setDoctor(mapped);
          if (foundId) {
            setSelectedId(foundId);
            if (typeof onClinicChange === 'function') {
              onClinicChange(foundId);
            }
          }
        }
      } catch (error) {
        console.error("DoctorBanner: API Error", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id, initialDoctor?.userId]);

  useEffect(() => {
    const fetchProfileImage = async () => {
      if (doctor?.profilePhoto) {
        setImageLoading(true);
        try {
          const url = await getPublicUrl(doctor.profilePhoto);
          setProfileImageUrl(url);
        } catch (error) {
          console.error("Failed to fetch profile image URL:", error);
        } finally {
          setImageLoading(false);
        }
      } else {
        setProfileImageUrl('');
      }
    };
    fetchProfileImage();
  }, [doctor?.profilePhoto]);


  const isActive = (doctor?.status || '').toLowerCase() === 'active'

  const [isClinicOpen, setIsClinicOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [openMenu, setOpenMenu] = useState(null); // Track which menu is open by name or id
  const [showActionMenu, setShowActionMenu] = useState(false);
  const clinicRef = useRef(null);
  const actionMenuRef = useRef(null);

  // Auto-selection logic: Prioritize Clinic over Hospital if both are present
  useEffect(() => {
    if (!doctor?.workplace || selectedId !== null) return;

    const clinics = doctor.workplace.clinics || [];
    const hospitals = doctor.workplace.hospitals || [];

    let priorityFacility = null;
    if (clinics.length > 0) {
      priorityFacility = clinics[0];
    } else if (hospitals.length > 0) {
      priorityFacility = hospitals[0];
    }

    if (priorityFacility) {
      const pid = String(priorityFacility.id || priorityFacility._id);
      setSelectedId(pid);
      setDoctor(prev => ({
        ...prev,
        clinicHospitalName: priorityFacility.name
      }));
      if (typeof onClinicChange === 'function') {
        onClinicChange(pid);
      }
    }
  }, [doctor?.workplace, selectedId, onClinicChange]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (clinicRef.current && !clinicRef.current.contains(event.target)) {
        setIsClinicOpen(false);
      }
      if (actionMenuRef.current && !actionMenuRef.current.contains(event.target)) {
        setShowActionMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!isClinicOpen) {
      setOpenMenu(null)
    }
  }, [isClinicOpen])

  if (loading) {
    return (
      <div className="w-full h-[125px] flex items-center justify-center bg-white border rounded-lg">
        <UniversalLoader size={30}  />
      </div>
    );
  }


  const ICONS = {
    clinic: clinic,
    hospital: hospital2,
  };

  function FacilityCard({
    name,
    location,
    variant = "clinic", // "clinic" | "hospital"
    selected = false,
    onClick,
  }) {
    const Icon = ICONS[variant];

    return (
      <div
        onClick={(e) => {
          e.stopPropagation();
          onClick && onClick(e);
        }}
        className={`flex items-center justify-between hover:bg-secondary-grey50 rounded-md  border p-2 w-[310px] cursor-pointer transition
        ${selected
            ? "border-blue-primary150 bg-blue-primary50"
            : "border-transparent"
          }
      `}
      >
        {/* LEFT */}
        <div className="flex items-center gap-2">
          {/* Radio */}
          <RadioButton
            checked={selected}
            onChange={() => { }} // Controlled by parent div click
            name="account-select"
            className="pointer-events-none" // clicking the card handles selection
          />

          {/* Icon */}
          <div
            className={` w-[32px] h-[32px] rounded-full flex items-center justify-center border
            border-warning-400 bg-warning-50
          `}
          >
            <img src={Icon} alt={variant} className="w-[20px] h-[20px]" />
          </div>

          {/* Text */}
          <div>
            <p className=" text-secondary-grey400 text-sm leading-tight">{name}</p>
            <p className="text-xs text-secondary-grey200">{location}</p>
          </div>
        </div>

        {/* Right menu */}
        <div className="relative" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setOpenMenu(openMenu === name ? null : name);
            }}
            className="p-1 hover:bg-gray-100 rounded-full facility-card-menu-button"
          >
            <img src={horizontal} alt="" className="" />
          </button>

          {openMenu === name && (
            <div className="absolute right-0 top-6 w-40 bg-white shadow-lg rounded-md border border-gray-100 z-50 py-1 facility-card-menu">
              <button className="w-full text-left px-3 py-2 text-[12px] text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                <MinusCircle size={14} className="text-gray-400" />
                Mark as Inactive
              </button>
              <button className="w-full text-left px-3 py-2 text-[12px] text-red-500 hover:bg-red-50 flex items-center gap-2">
                <Trash2 size={14} />
                Delete
              </button>
            </div>
          )}
        </div>
      </div >
    );
  }

  // Helper to format display value: 0 stays 0, null/undefined becomes '-'
  const displayVal = (val) => (val === 0 || val === '0') ? val : (val || '-');

  return (
    <div className="w-full p-4 flex  items-center gap-4 bg-white">
      {/* Profile Circle with tick using reusable AvatarCircle */}
      <div className="relative">
        <div
          className="w-[90px] h-[90px] rounded-full flex items-center justify-center overflow-hidden"
          style={{
            backgroundColor: '#F8FAFF',
            borderColor: '#96BFFF',
            borderStyle: 'solid',
            borderWidth: '0.5px',
          }}
        >
          {imageLoading ? (
            <UniversalLoader size={20} />
          ) : profileImageUrl ? (
            <img
              src={profileImageUrl}
              alt={doctor?.name || 'Doctor'}
              className="w-full h-full object-cover"
              onLoad={() => setImageLoading(false)}
            />
          ) : (
            <AvatarCircle name={doctor?.name || 'Doctor'} color="blue" className="w-full h-full text-[2rem] border-none" style={{ borderWidth: 0 }} />
          )}
        </div>
        <img src="/tick.png" alt="Verified" className="absolute -bottom-0 left-16 w-6 h-6" />
      </div>

      {/* Doctor Info */}
      <div className="flex flex-col gap-1 flex-1">
        <div className="flex flex-wrap gap-3 items-center">
          <span className="text-secondary-grey400 font-semibold text-[20px]">
            {doctor?.name || '-'}
          </span>
          <div className={`min-w-[22px] px-[6px] py-[2px] rounded-sm ${isActive ? 'bg-success-100' : 'bg-[#FFF8F2]'}`}>
            <span className={` text-sm ${isActive ? 'text-success-300' : 'text-[#F59E0B]'}`}>{isActive ? 'Active' : 'Inactive'}</span>
          </div>
          <div
            ref={clinicRef}
            onClick={() => setIsClinicOpen(!isClinicOpen)}
            className={`bg-secondary-grey50 flex items-center px-[6px] py-[2px] gap-1 border hover:border-blue-primary150 rounded-sm  transition-colors hover:text-blue-primary250 relative cursor-pointer select-none ${isClinicOpen ? ' border-blue-primary150 text-blue-primary250' : 'border-transparent text-secondary-grey400'}`}
          >
            <img src={selectedId && doctor?.workplace?.hospitals?.find(h => String(h.id || h._id) === String(selectedId)) ? hospital2 : clinic} alt="" className='h-4 w-4' />
            <span className=" text-sm font-normal">
              {doctor?.clinicHospitalName || '-'}
            </span>
            <div className='flex items-center pl-2 pr-1 border-l ml-1 '>
              <img
                src={down}
                alt=""
                className={`w-3 h-3 transition-transform duration-200 ${isClinicOpen ? 'rotate-180' : ''}`}
              />
            </div>

            {isClinicOpen && (
              <div className="absolute top-full  left-0 mt-1 p-2 min-w-[300px] bg-white shadow-lg rounded-lg border border-gray-100 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className='flex flex-col gap-1'>
                  <span className='text-secondary-grey300 px-2 font-medium text-[12px]'>SWITCH ACCOUNT</span>

                  {/* render clinics */}
                  {(doctor?.workplace?.clinics || []).map((clinic, idx) => (
                    <FacilityCard
                      key={clinic.id || clinic._id || `clinic-${idx}`}
                      name={clinic.name || "-"}
                      location={clinic.city || clinic.location || ""}
                      variant="clinic"
                      selected={String(selectedId) === String(clinic.id || clinic._id)}
                      onClick={() => {
                        const cId = String(clinic.id || clinic._id);
                        setSelectedId(cId);
                        setDoctor(prev => ({ ...prev, clinicHospitalName: clinic.name }));
                        if (typeof onClinicChange === 'function') onClinicChange(cId);
                        setIsClinicOpen(false);
                      }}
                    />
                  ))}
                  {/* fallback if no clinics just to show something? or user wants exact api data. Assume exact api data. */}
                  {(!doctor?.workplace?.clinics?.length && !doctor?.workplace?.hospitals?.length) && (
                    <div className="px-3 py-2 text-xs text-gray-500">No clinics or hospitals found.</div>
                  )}



                  <div className='h-[32px] px-2 flex gap-1 items-center hover:bg-secondary-grey50'>
                    <Plus className='w-3.5 h-3.5' />
                    <span className='text-blue-primary250 text-[14px]'>Add Branch</span>
                  </div>


                </div>

                <div className='bg-secondary-grey100/50 h-[1px] mt-1 mb-2'></div>
                <div className='flex flex-col gap-1'>
                  {/* render hospitals */}
                  {(doctor?.workplace?.hospitals || []).map((hosp, idx) => (
                    <FacilityCard
                      key={hosp.id || hosp._id || `hosp-${idx}`}
                      name={hosp.name || "-"}
                      location={hosp.city || hosp.location || ""}
                      variant="hospital"
                      selected={String(selectedId) === String(hosp.id || hosp._id)}
                      onClick={() => {
                        const hId = String(hosp.id || hosp._id);
                        setSelectedId(hId);
                        setDoctor(prev => ({ ...prev, clinicHospitalName: hosp.name }));
                        if (typeof onClinicChange === 'function') onClinicChange(hId);
                        setIsClinicOpen(false);
                      }}
                    />
                  ))}
                </div>

              </div>
            )}

          </div>
          <div>
            <Badge
              size="xs"
              color="warning"
              leadingIcon={<img src={star} alt="" className='w-2.5' />}
            >
              {doctor?.rating ? doctor.rating : '-'}
            </Badge>
          </div>
        </div>

        <div className="flex flex-col gap-1 text-sm text-secondary-grey400">
          <div className="flex gap-1 items-center">
            <img src={docIcon} alt="Doctor icon" className="w-4 h-4" />
            <span className="">
              {doctor?.designation || '-'}
            </span>
          </div>
          <div className="flex gap-1 items-center">
            <img src={blueBag} alt="Blue bag icon" className="w-4 h-4" />
            <span className="">{doctor?.medicalPracticeType || '-'}</span>
          </div>
          <div className="flex  items-center gap-1">
            <img src={whiteBag} alt="White bag icon" className="w-4 h-4" />
            <span className="">{doctor?.exp || '-'}</span>
          </div>
        </div>
      </div>



      {/* Info Boxes + menu */}
      <div className="flex items-start gap-4">
        <InfoBox label="No. of Patient Managed" value={displayVal(doctor?.noOfPatientsManaged)} valueClass="text-[#2372EC]" />
        <InfoBox label="No. of Appointments Booked" value={displayVal(doctor?.noOfAppointmentsBooked)} valueClass="text-[#2372EC]" />
        <InfoBox label="Active Package" value={doctor?.activePackage || '-'} valueClass="text-green-600" />
        <InfoBox label="eClinic-Q ID" value={doctor?.id || '-'} valueClass="text-[#2372EC] break-all" />
        <div className="relative" ref={actionMenuRef}>
          <button
            onClick={() => setShowActionMenu(!showActionMenu)}
            className="p-2 text-gray-500 hover:text-gray-700 mr-2 ml-1 mt-2  hover:bg-gray-100 transition-colors"
            aria-label="More options"
          >
            <img src={horizontal} alt="" />
          </button>
          {showActionMenu && (
            <div className="absolute right-0 top-full mt-1 w-[245px] bg-white shadow-[0px_4px_20px_rgba(0,0,0,0.1)] rounded-[10px] border border-gray-100 z-50 py-2 animate-in fade-in zoom-in-95 duration-100">
              <button className="w-full text-left px-[18px] py-2 text-secondary-grey400 font-normal text-sm hover:bg-gray-50 flex items-center gap-2">
                <img src={calendarReschedule} alt="" className="w-5 h-5" />
                Update Availability Timing
              </button>
              <button className="w-full text-left px-[18px] py-2 text-secondary-grey400 font-normal text-sm hover:bg-gray-50 flex items-center gap-2">
                <img src={outOfOffice} alt="" className="w-5 h-5" />
                Set Out of Office
              </button>
              <button className="w-full text-left px-[18px] py-2 text-secondary-grey400 font-normal text-sm hover:bg-gray-50 flex items-center gap-2">
                <img src={linkIconLocal} alt="" className="w-5 h-5" />
                Send Magic Link
              </button>
              <button className="w-full text-left px-[18px] py-2 text-secondary-grey400 font-normal text-sm hover:bg-gray-50 flex items-center gap-2">
                <img src={inactiveIcon} alt="" className="w-5 h-5" />
                Mark as Inactive
              </button>
              <div className="mx-2 h-[0.5px] bg-[#E0E7FF] my-1.5" />
              <button className="w-full text-left px-[18px] py-2 text-[#F04438] font-normal text-sm hover:bg-red-50 flex items-center gap-2">
                <img src={bin} alt="" className="w-5 h-5" />
                Delete Profile
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorBanner;
