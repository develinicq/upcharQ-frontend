import React, { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { logo, doctorSelect, doctorUnselect, patientUnselect, settingUnselect, hospitalSelected, hospitalUnselect } from '../../../public/index.js'

export default function HSidebar() {
  const location = useLocation()
  const isSettingsRoute = location.pathname.startsWith('/hospital/settings')
  const [openSettings, setOpenSettings] = useState(isSettingsRoute)
  useEffect(() => { if (isSettingsRoute) setOpenSettings(true) }, [isSettingsRoute])

  const topItems = [
    { name: 'Dashboard', to: '/hospital', icon: doctorUnselect, iconActive: doctorSelect },
    { name: 'Patients', to: '/hospital/patients', icon: doctorUnselect, iconActive: doctorSelect },
    { name: 'Doctors', to: '/hospital/doctors', icon: patientUnselect, iconActive: patientUnselect },
    { name: 'Calendar', to: '/hospital/calendar', icon: hospitalUnselect, iconActive: hospitalSelected },
  ]

  const settingsSubItems = [
    { label: 'Hospital Account', to: '/hospital/settings/account' },
    { label: 'Timing and Schedule', to: '/hospital/settings/timing' },
    { label: 'Surgeries', to: '/hospital/settings/surgeries' },
    { label: 'Staff Permissions', to: '/hospital/settings/staff-permissions' },
    { label: 'Security Settings', to: '/hospital/settings/security' },
  ]
  return (
    <aside className="min-h-screen w-[210px] bg-white border-r border-secondary-grey100/50">
      <div className="px-4 py-3"><img src={logo} alt="logo" className="w-[128px]" /></div>
      <nav>
        {topItems.map((it) => (
          <NavLink
            key={it.to}
            to={it.to}
            end={it.to === '/hospital'}
            className={({ isActive }) => {
              // Special case for Doctors: match '/hospital/doctor/' (detail) as well as '/hospital/doctors' (list)
              const isDoctorsDetail = it.to === '/hospital/doctors' && location.pathname.startsWith('/hospital/doctor/');
              const active = isActive || isDoctorsDetail;
              return `flex items-center gap-2 py-3 px-4 h-[44px] w-full ${active ? 'bg-[#2372EC] text-white border-l-[3px] border-[#96BFFF]' : 'text-gray-800 hover:bg-gray-100'}`;
            }}
          >
            {({ isActive }) => {
              const isDoctorsDetail = it.to === '/hospital/doctors' && location.pathname.startsWith('/hospital/doctor/');
              const active = isActive || isDoctorsDetail;
              return (
                <>
                  <img src={active ? it.iconActive : it.icon} alt={it.name} className="w-5 h-5" />
                  <span className="text-sm">{it.name}</span>
                </>
              );
            }}
          </NavLink>
        ))}

        {/* Settings collapsible */}
        <div className="">
          <button type="button" onClick={() => setOpenSettings(v => !v)} className={`w-full flex items-center justify-between py-3 px-4 h-[44px] transition-colors ${isSettingsRoute ? 'bg-[#2372EC] text-white border-l-[3px] border-[#96BFFF]' : 'text-gray-800 hover:bg-gray-100'}`}>
            <span className="inline-flex items-center gap-[6px]">
              <img src={settingUnselect} alt="Settings" className="w-5 h-5" />
              <span className="font-normal text-sm">Settings</span>
            </span>
            <span className="text-xs">{openSettings ? '▴' : '▾'}</span>
          </button>
          {openSettings && (
            <div className="ml-5 pl-3 border-l border-gray-200">
              {settingsSubItems.map((s) => (
                <NavLink key={s.to} to={s.to} className={({ isActive }) => `block text-sm px-3 py-2 my-[2px] rounded-sm ${isActive ? 'bg-blue-50 text-gray-900' : 'text-gray-700 hover:bg-gray-50'}`}>
                  {s.label}
                </NavLink>
              ))}
            </div>
          )}
        </div>
      </nav>
    </aside>
  )
}
