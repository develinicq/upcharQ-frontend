import React, { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  MapPin,
  Mail,
  Phone,
  Star,
  MoreHorizontal,
  Building2,
  CalendarClock,
  Link,
  UserX,
  Trash2
} from "lucide-react";
import { getPublicUrl } from "../../services/uploadsService";
import { deleteHospitalProfile } from "../../services/hospitalService";
import useSuperAdminListStore from "../../store/useSuperAdminListStore";
import AvatarCircle from "../AvatarCircle";
import Badge from "../Badge";

const calendarReschedule = '/superAdmin/doctor_list_dropdown/Calendar Reschedule.svg';
const bin = '/superAdmin/doctor_list_dropdown/bin.svg';
const inactiveIcon = '/superAdmin/doctor_list_dropdown/inactive.svg';
const linkIconLocal = '/superAdmin/doctor_list_dropdown/link.svg';

const action = '/action-icon.svg'
const location = '/location.png'
const mail = '/mail.png'
const phone = '/phone.png'
const user = '/user.png'

const Cards = ({ hospital }) => {
  const navigate = useNavigate();
  const [resolvedBanner, setResolvedBanner] = useState("");
  const [resolvedLogo, setResolvedLogo] = useState("");

  // Dropdown states
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ bottom: 0, left: 0 });
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const fetchHospitals = useSuperAdminListStore((state) => state.fetchHospitals);

  useEffect(() => {
    let ignore = false;
    const run = async () => {
      try {
        const [b, l] = await Promise.all([
          getPublicUrl(hospital?.image),
          getPublicUrl(hospital?.logo)
        ]);
        if (!ignore) {
          setResolvedBanner(b || "");
          setResolvedLogo(l || "");
        }
      } catch (error) {
        if (!ignore) {
          setResolvedBanner("");
          setResolvedLogo("");
        }
      }
    };
    run();
    return () => { ignore = true; };
  }, [hospital?.image, hospital?.logo]);

  // Click outside and scroll handlers for dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    const handleScroll = () => {
      if (isOpen) setIsOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleScroll);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleScroll);
    };
  }, [isOpen]);

  const toggleMenu = (e) => {
    e.stopPropagation();
    if (!isOpen) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({
        bottom: window.innerHeight - rect.top + 8, // Position above the button
        left: rect.right - 225 // Matching user's latest correction for doctor list (from 225)
      });
    }
    setIsOpen(!isOpen);
  };

  const handleAction = async (actionName, e) => {
    e.stopPropagation();
    setIsOpen(false);

    if (actionName === 'Delete Profile') {
      const confirmDelete = window.confirm(
        `Are you sure you want to permanently delete the profile for ${hospital.name}? This action cannot be undone.`
      );
      if (!confirmDelete) return;

      try {
        // Use hospital.temp (which is the actual ID from HospitalList mapping)
        // or hospital.id if temp is missing. In HospitalList, temp is h.id.
        const hospitalId = hospital.temp || hospital.id;

        await deleteHospitalProfile(hospitalId);
        alert('Hospital profile deleted successfully.');
        // Refresh the list
        if (fetchHospitals) {
          fetchHospitals();
        } else {
          window.location.reload();
        }
      } catch (error) {
        console.error("Delete failed:", error);
        alert(`Failed to delete profile: ${error.message || 'Unknown error'}`);
      }
    } else {
    }
  };

  const openHospital = () => {
    // Use backend UUID (temp) for routing so details page can fetch by correct ID
    const urlId = hospital?.temp || hospital?.id || 'HO-PREVIEW';
    navigate(`/hospital/${encodeURIComponent(urlId)}`, { state: { hospital } });
  };

  const isActive = (hospital?.status || '').toLowerCase() === 'active';

  return (
    <div
      onClick={openHospital}
      className="group relative pb-[12px] flex flex-col w-[359.5px] h-[366px] min-w-[300px] bg-white rounded-[8px] border-[0.5px] border-secondary-grey100 transition-all duration-300 hover:shadow-[0_0_11.4px_4px_rgba(35,114,236,0.15)] overflow-hidden cursor-pointer"
    >
      {/* Header / Banner Section */}
      <div className="relative h-[120px] w-full">
        <img
          src={resolvedBanner || hospital.image || "/hospital-sample.png"}
          alt="Hospital Banner"
          className={`w-full h-full object-cover ${!isActive ? 'grayscale' : ''}`}
          onError={(e) => { e.currentTarget.src = '/hospital-sample.png'; }}
        />
        {/* Status Badge */}
        <div className={`absolute top-3 right-3 h-7 min-w-[22px] px-1.5 py-[3px] rounded-sm text-sm z-10 ${isActive
          ? 'bg-success-100 text-success-300'
          : 'bg-white text-secondary-grey400 border border-secondary-grey100/50'
          }`}>
          {isActive ? 'Active' : 'Inactive'}
        </div>
      </div>

      {/* Logo & Rating Section */}
      <div className="relative px-3 flex justify-between items-start -mt-8 ">
        {/* Logo */}
        <div className="relative -mt-2   rounded-full shadow-sm">
          {resolvedLogo || hospital.logo ? (
            <img src={resolvedLogo || hospital.logo} alt="Logo" className="w-16 h-16 rounded-full object-cover " onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/hospital-sample.png'; }} />
          ) : (
            <AvatarCircle name={hospital.name} size="f4" color={isActive ? "orange" : "grey"} />
          )}
          {/* Verified Tick */}
          <div className="absolute -top-1 -right-0">
            <img src="/tick.png" alt="Verified" className="w-6 h-6" />
          </div>
        </div>

        {/* Rating */}
        <div className="mt-9">
          <Badge color="warning" size="xs" leadingIcon={<Star className="w-3 h-3 fill-current" />}>
            4.0
          </Badge>
        </div>
      </div>

      {/* Content Section */}
      {/* Content Section */}
      <div className="px-3 flex flex-col gap-1 flex-1">
        {/* Name & Type */}

        <span className="text-[15px] font-semibold text-secondary-grey400 leading-tight">{hospital.name || "Hospital Name"}</span>
        <p className="text-[11px] text-secondary-grey400 leading-tight">
          {hospital.type || "Multi-speciality"} | {hospital.doctors || "10+"} Doctors | {hospital.beds || "250"}
        </p>
        <div className="flex items-center gap-2 text-[11px] text-secondary-grey400">
          <span>Est in {hospital.estYear || "2010"}</span>
          <span className="w-[3px] h-[3px] rounded-full bg-secondary-grey200"></span>
          <span>{hospital.validity || "15/01/2025"}</span>
        </div>

        <div className="flex items-center gap-2">
          <img src={user} alt="" className="h-3 ml-0.5" />
          <span className="text-[11px] text-secondary-grey400 truncate">{hospital.id || "HO-0268790"}</span>
        </div>
        <div className="flex items-center gap-2">
          <img src={location} alt="" className="h-3.5" />
          <span className="text-[11px] text-secondary-grey400 leading-tight line-clamp-1">
            {hospital.address || "Jawahar Nagar, Akola(MH) - 444001"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <img src={mail} alt="" className="h-3" />
          <span className="text-[11px] text-secondary-grey400 truncate">{hospital.email || "manipal@gmail.com"}</span>
        </div>
        <div className="flex items-center gap-2">
          <img src={phone} alt="" className="h-3" />
          <span className="text-[11px] text-secondary-grey400 truncate">{hospital.phone || "+91 9175367487"}</span>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-secondary-grey400">
          <span>Start Date: {hospital.startDate || "15/01/2025"}</span>
          <span className="w-[3px] h-[3px] rounded-full bg-secondary-grey200"></span>
          <span>Plan: </span><span className="text-blue-500 bg-blue-50 px-1 rounded text-[10px]">{hospital.plan || "Basic"}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex mt-auto gap-2 items-center ">
          <button
            className="flex-1 h-8 bg-blue-primary250 hover:bg-blue-600 rounded-md flex items-center justify-center gap-2 text-white text-[11px] font-medium transition-colors shadow-[2px_2px_10px_0px_rgba(35,114,236,0.3)]"
          >
            View Details
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <div className='h-5 border-l border-secondary-grey100/50 ml-1 p-1 '></div>

          <button
            ref={buttonRef}
            onClick={toggleMenu}
            className={`hover:bg-secondary-grey50 rounded-sm h-8 w-8 flex items-center justify-center mr-0.5 transition-all ${isOpen ? 'bg-secondary-grey50' : ''}`}
          >
            <img src={action} alt="" className="h-[4px] w-auto" />
          </button>

          {isOpen && createPortal(
            <div
              ref={menuRef}
              style={{
                position: 'fixed',
                bottom: position.bottom,
                left: position.left,
                zIndex: 99999,
                width: '245px'
              }}
              className="bg-white rounded-[10px] shadow-[0px_4px_20px_rgba(0,0,0,0.1)] border border-gray-100 py-2 animate-in fade-in zoom-in-95 duration-100"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={(e) => handleAction('Update Availability Timing', e)}
                className="w-full text-left px-[18px] py-2 text-secondary-grey400 font-normal text-sm hover:bg-gray-50 flex items-center gap-2"
              >
                <img src={calendarReschedule} alt="" className="w-5 h-5" />
                Update Availability Timing
              </button>
              <button
                onClick={(e) => handleAction('Send Magic Link', e)}
                className="w-full text-left px-[18px] py-2 text-secondary-grey400 font-normal text-sm hover:bg-gray-50 flex items-center gap-2"
              >
                <img src={linkIconLocal} alt="" className="w-5 h-5" />
                Send Magic Link
              </button>
              <button
                onClick={(e) => handleAction('Mark as Inactive', e)}
                className="w-full text-left px-[18px] py-2 text-secondary-grey400 font-normal text-sm hover:bg-gray-50 flex items-center gap-2"
              >
                <img src={inactiveIcon} alt="" className="w-5 h-5" />
                Mark as Inactive
              </button>
              <div className="border-t my-1 mx-2"></div>
              <button
                onClick={(e) => handleAction('Delete Profile', e)}
                className="w-full text-left px-[18px]  py-2 text-[#F04438] font-normal text-sm hover:bg-red-50 flex items-center gap-2"
              >
                <img src={bin} alt="" className="w-5 h-5" />
                Delete Profile
              </button>
            </div>,
            document.body
          )}
        </div>
      </div>
    </div>
  );
};
export default Cards;
