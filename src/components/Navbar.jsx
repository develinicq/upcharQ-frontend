
import { User, LogOut, ChevronRight } from 'lucide-react'

import React, { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { bell, stethoscopeBlue, hospitalicon, patientunselect, appointement, chevdown, logo } from '../../public/index.js'
import NotificationDrawer from './NotificationDrawer.jsx'
import AddPatientDrawer from './PatientList/AddPatientDrawer.jsx'
import BookAppointmentDrawer from './Appointment/BookAppointmentDrawer.jsx'
import InviteStaffDrawer from '../DoctorModule/Pages/Settings/Drawers/InviteStaffDrawer.jsx'
import AvatarCircle from './AvatarCircle.jsx'
import useAuthStore from '../store/useAuthStore'
import useSuperAdminAuthStore from '../store/useSuperAdminAuthStore';
import useUIStore from '../store/useUIStore';
import { logoutAll } from '../utils/authUtils';
import { getDoctorMe } from '../services/authService'
import { useRegistration } from '../SuperAdmin/context/RegistrationContext.jsx'

const Partition = () => {
  return (
    <div className='w-[8.5px] h-[20px] flex gap-[10px] items-center justify-center'>
      <div className='w-[0.5px] h-full bg-[#B8B8B8]'>
      </div>
    </div>
  )
}

const AddNewDropdown = ({ isOpen, onClose, onAddPatient, onBookAppointment, onInviteStaff }) => {
  const navigate = useNavigate();

  const handleAddDoctor = () => {
    navigate('/register/doctor');
    onClose();
  };

  const handleAddHospital = () => {
    navigate('/register/hospital');
    onClose();
  };

  const handleAddPatient = () => {
    // Open drawer instead of route navigation
    onAddPatient?.();
    onClose();
  };

  const handleBookAppointment = () => {
    onBookAppointment?.();
    onClose();
  };

  const handleInviteStaff = () => {
    onInviteStaff?.();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="absolute top-full right-0 mt-1 w-[190px] bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden p-2 z-[60]">
      <div className="flex flex-col gap-1  ">
        <button
          onClick={handleAddDoctor}
          className=" rounded-md flex items-center gap-2 hover:bg-gray-50 h-8 transition-colors"
        >
          <div className="w-4 h-4 ml-1 flex items-center justify-center">
            <img src={stethoscopeBlue} alt="Add Doctor" />
          </div>
          <span className="text-[#424242] font-normal text-sm">Add Doctor</span>
        </button>

        <button
          onClick={handleAddHospital}
          className="w-full rounded-md flex items-center gap-2 hover:bg-gray-50 h-8 transition-colors"
        >
          <div className="w-4 h-4 flex items-center justify-center ml-1">
            <img src={hospitalicon} alt="Add Hospital" />
          </div>
          <span className="text-[#424242] font-normal text-sm">Add Hospital</span>
        </button>

        <button
          onClick={handleAddPatient}
          className="w-full rounded-md flex items-center gap-2 hover:bg-gray-50 h-8 transition-colors"
        >
          <div className="w-4 h-4 flex items-center justify-center ml-1">
            <img src={patientunselect} alt="Add Patient" />
          </div>
          <span className="text-[#424242] font-normal text-sm">Add Patient</span>
        </button>

        <button
          onClick={handleBookAppointment}
          className="w-full rounded-md flex items-center gap-2 hover:bg-gray-50 h-8 transition-colors"
        >
          <div className="w-4 h-4 flex items-center justify-center ml-1">
            <img src={appointement} alt="Book Appointment" />
          </div>
          <span className="text-[#424242] font-normal text-sm">Book Appointment</span>
        </button>

        {/* <button
          onClick={handleInviteStaff}
          className="w-full rounded-md flex items-center gap-2 hover:bg-gray-50 h-8 transition-colors"
        >
          <div className="w-4 h-4 flex items-center justify-center ml-1">
            <img src={hospitalicon} alt="Invite Staff" />
          </div>
          <span className="text-[#424242] font-normal text-sm">Invite Staff</span>
        </button> */}
      </div>
    </div>
  );
};

// NotificationDrawer extracted to shared component

const Navbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [addPatientOpen, setAddPatientOpen] = useState(false);
  const [bookApptOpen, setBookApptOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const dropdownRef = useRef(null);
  const profileRef = useRef(null);
  const navigate = useNavigate();
  const { doctorDetails, doctorLoading, fetchDoctorDetails, clearAuth: clearDoctorAuth } = useAuthStore();
  const { user, fetchProfile, clearAuth: clearAdminAuth } = useSuperAdminAuthStore();
  const breadcrumbEntityName = useUIStore((s) => s.breadcrumbEntityName);
  const registration = useRegistration();

  const handleLogout = () => {
    logoutAll();
    navigate('/');
  };
  const location = useLocation();

  const saName = user ? `${user.firstName} ${user.lastName}` : 'Super Admin';
  const isRegistrationFlow = location.pathname.startsWith('/register');

  // module switcher state derived from pathname (hospital/doctor)
  const [activeModule, setActiveModule] = useState('hospital');
  useEffect(() => {
    const path = window.location.pathname.toLowerCase();
    if (path.includes('doctor')) setActiveModule('doctor');
    else setActiveModule('hospital');
  }, []);

  const switchToHospital = () => {
    setActiveModule('hospital');
    navigate('/hospital');
  };

  const switchToDoctor = () => {
    setActiveModule('doctor');
    navigate('/doctor');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfile(false);
      }
    };
    const onKey = (e) => { if (e.key === 'Escape') { setIsDropdownOpen(false); setShowProfile(false); } };
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', onKey);
    };
  }, []);



  const getBreadcrumbs = () => {
    const path = location.pathname;

    if (path.startsWith('/dashboard')) {
      return [{ label: 'Super Admin Dashboard' }];
    }
    if (path === '/doctor') {
      return [
        { label: 'Doctor Listing', path: '/doctor' },
        { label: 'All Doctors' }
      ];
    }
    if (path.startsWith('/doctor/')) {
      return [
        { label: 'Doctor Listing', path: '/doctor' },
        { label: breadcrumbEntityName ? `${breadcrumbEntityName} Profile` : 'Doctor Profile' }
      ];
    }
    if (path === '/hospitals') {
      return [
        { label: 'Hospital Listing', path: '/hospitals' },
        { label: 'All Hospital' }
      ];
    }
    if (path.startsWith('/hospital/')) {
      return [
        { label: 'Hospital Listing', path: '/hospitals' },
        { label: breadcrumbEntityName ? `${breadcrumbEntityName} Profile` : 'Hospital Profile' }
      ];
    }
    if (path === '/patients') {
      return [
        { label: 'Patient Listing', path: '/patients' },
        { label: 'All Patients' }
      ];
    }
    if (path.startsWith('/register/doctor')) {
      return [
        { label: 'Doctor Onboarding' },
        { label: registration?.currentStep ? `Step ${registration.currentStep}` : 'Step 1' }
      ];
    }
    if (path.startsWith('/register/hospital')) {
      return [
        { label: 'Hospital Onboarding' },
        { label: registration?.currentStep ? `Step ${registration.currentStep}` : 'Step 1' }
      ];
    }
    if (path.startsWith('/register/patient')) {
      return [{ label: 'Patient Registration' }];
    }
    if (path === '/settings') {
      return [{ label: 'Settings' }];
    }

    return [{ label: saName }];
  };

  const breadcrumbs = getBreadcrumbs();

  // Ensure doctor context is available so the drawer can load slots
  useEffect(() => {
    if (!doctorDetails && !doctorLoading) {
      try { fetchDoctorDetails?.(getDoctorMe); } catch { }
    }
  }, [doctorDetails, doctorLoading, fetchDoctorDetails]);

  useEffect(() => {
    if (!user) {
      fetchProfile();
    }
  }, [user, fetchProfile]);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const closeDropdown = () => {
    setIsDropdownOpen(false);
  };

  return (
    <>
      <div className={`w-full h-12 border-b-[0.5px] border-secondary-grey100/50 flex items-center px-4 justify-between ${isRegistrationFlow ? 'pl-2' : ''}`}>
        <div className="flex items-center gap-2">
          {isRegistrationFlow && (
            <>
              <div className="flex items-center px-1">
                <img src={logo} alt="logo" className="w-[110px]" />
              </div>
              <Partition />
            </>
          )}
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={idx}>
              <span className={`text-sm ${idx === breadcrumbs.length - 1 ? 'text-[#424242] font-medium' : 'text-secondary-grey200'}`}>
                {crumb.label}
              </span>
              {idx < breadcrumbs.length - 1 && (
                <ChevronRight className="w-4 h-4 text-secondary-grey200" strokeWidth={1.5} />
              )}
            </React.Fragment>
          ))}
        </div>
        <div className='flex gap-2 items-center'>
          {!isRegistrationFlow && (
            <>
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={toggleDropdown}
                  className='flex items-center bg-[#2372EC] p-2 h-8 min-w-8 rounded-[4px] gap-2 hover:bg-blue-600 transition-colors'
                >
                  <span className='text-white text-sm font-medium'>Add New</span>
                  <div className='flex border-l border-blue-400 pl-1'>
                    <img src={chevdown} alt="Dropdown" />
                  </div>
                </button>
                <AddNewDropdown isOpen={isDropdownOpen} onClose={closeDropdown} onAddPatient={() => setAddPatientOpen(true)} onBookAppointment={() => setBookApptOpen(true)} onInviteStaff={() => setInviteOpen(true)} />
              </div>
              <Partition />
            </>
          )}
          <div className="w-7 h-7 p-1 relative">
            <div className="absolute -top-1 -right-1 flex items-center justify-center rounded-full w-[14px] h-[14px] bg-[#F04248]">
              <span className="font-medium text-[10px] text-white">8</span>
            </div>
            <button onClick={() => setShowNotifications(true)} style={{ background: 'none', border: 'none', padding: 0 }}>
              <img src={bell} alt="Notifications" className="w-5 h-5" />
            </button>
          </div>
          <Partition />
          <div className='relative flex items-center gap-2' ref={profileRef}>
            <span className='font-semibold text-base text-[#424242]'>{saName}</span>
            <button type='button' onClick={() => setShowProfile(v => !v)} className='cursor-pointer'>
              <AvatarCircle name={saName} size='s' color='grey' />
            </button>
            {showProfile && (
              <div className='absolute top-12 right-0 w-[326px] bg-white border border-gray-100 rounded-lg shadow-xl overflow-hidden z-50'>
                <div className='p-4 flex items-center gap-3 border-b '>
                  <AvatarCircle
                    name={saName}
                    size='md'
                    color='grey'

                  ></AvatarCircle>
                  <span className='text-secondary-grey400 font-semibold text-[16px]'>{saName}</span>
                </div>



                <div className='p-2 flex flex-col gap-1'>
                  <button className='w-full flex items-center h-8 justify-between  hover:bg-gray-50 transition-colors group px-2'>
                    <div className='flex items-center gap-2'>
                      <User className='w-[18px] h-[18px] text-gray-500 stroke-[1.5px]' />
                      <span className='text-secondary-grey400 text-sm font-normal'>My Profile</span>
                    </div>
                    <ChevronRight className='w-4 h-4 text-gray-400' />
                  </button>

                  <button onClick={handleLogout} className='w-full flex items-center h-8 justify-between px-2  hover:bg-gray-50 transition-colors group'>
                    <div className='flex items-center gap-2'>
                      <LogOut className='w-[18px] h-[18px] text-gray-500 stroke-[1.5px]' />
                      <span className='text-secondary-grey400 text-sm font-normal'>Logout</span>
                    </div>
                    <ChevronRight className='w-4 h-4 text-gray-400' />
                  </button>
                </div>

              </div>
            )}
          </div>
        </div>
      </div>
      <NotificationDrawer show={showNotifications} onClose={() => setShowNotifications(false)} />
      <AddPatientDrawer open={addPatientOpen} onClose={() => setAddPatientOpen(false)} onSave={(data) => { /* TODO: API hook */ setAddPatientOpen(false) }} />
      <BookAppointmentDrawer
        open={bookApptOpen}
        onClose={() => setBookApptOpen(false)}
        doctorId={doctorDetails?.userId || doctorDetails?.id}
        clinicId={doctorDetails?.associatedWorkplaces?.clinic?.id || doctorDetails?.clinicId}
        hospitalId={(Array.isArray(doctorDetails?.associatedWorkplaces?.hospitals) && doctorDetails?.associatedWorkplaces?.hospitals[0]?.id) || undefined}
        onSave={() => setBookApptOpen(false)}
      />
      <InviteStaffDrawer open={inviteOpen} onClose={() => setInviteOpen(false)} />
    </>
  )
}

export default Navbar

