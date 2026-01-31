
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DocNavbar from '../../DoctorModule/Components/DocNavbar'
import BookWalkinAppointment2 from '../../components/Appointment/BookWalkinAppointment2'
import { hospital_selected_module, hospital_unselected_module, user_selected_module, user_unselected_module } from '../../../public/index.js'
import useHospitalAuthStore from '@/store/useHospitalAuthStore'
import { getPublicUrl } from '@/services/uploadsService'

// Wrap the Doctor navbar and add a hospital/doctor module switcher to match the requested UI.
export default function HNavbar() {
  const navigate = useNavigate();
  const [activeModule, setActiveModule] = useState('hospital');

  const { user, fetchMe } = useHospitalAuthStore();
  const [profilePhotoUrl, setProfilePhotoUrl] = useState('');

  useEffect(() => {
    const path = window.location.pathname.toLowerCase();
    if (path.includes('doctor')) setActiveModule('doctor');
    else setActiveModule('hospital');

    // Always fetch fresh hospital admin profile data
    fetchMe();
  }, [fetchMe]);

  useEffect(() => {
    const fetchImage = async () => {
      if (user?.profilePhoto) {
        const url = await getPublicUrl(user.profilePhoto);
        setProfilePhotoUrl(url);
      }
    };
    fetchImage();
  }, [user?.profilePhoto]);

  const switchToHospital = () => { setActiveModule('hospital'); navigate('/hospital'); };
  const switchToDoctor = () => { setActiveModule('doctor'); navigate('/doc'); };

  const switcherEl = user?.isDoctor || user?.roleNames?.includes("DOCTOR") ? (
    <div className="flex items-center gap-[2px] p-[2px] rounded-sm bg-blue-primary50">
      <button
        type="button"
        onClick={switchToHospital}
        className={`flex items-center justify-center py-1 px-[6px] h-7 w-7 rounded-[4px]  ${activeModule === 'hospital' ? 'border bg-blue-primary250 border-blue-primary150/50' : 'bg-white hover:bg-secondary-grey100'}  transition-colors`}
        aria-label="Hospital Module"
        title="Hospital"
      >
        <img
          src={activeModule === 'hospital' ? hospital_selected_module : hospital_unselected_module}
          alt="Hospital"
          className="w-4 h-4"
        />
      </button>
      <button
        type="button"
        onClick={switchToDoctor}
        className={`flex items-center justify-center h-7 w-7 rounded-[4px]  ${activeModule === 'doctor' ? 'bg-blue-primary250 border border-blue-primary150/50' : 'bg-white hover:bg-secondary-grey100/50'}  transition-colors`}
        aria-label="Doctor Module"
        title="Doctor"
      >
        <img
          src={activeModule === 'doctor' ? user_selected_module : user_unselected_module}
          alt="Doctor"
          className="w-4 h-4"
        />
      </button>
    </div>
  ) : null;

  return (
    <DocNavbar
      moduleSwitcher={switcherEl}
      hospitalAdminData={user}
      hospitalAdminPhoto={profilePhotoUrl}
      BookDrawer={BookWalkinAppointment2}
    />
  )
}
