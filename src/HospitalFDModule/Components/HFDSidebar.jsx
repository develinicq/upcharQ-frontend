import React, { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { HelpCircle, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react'
import { logo, doctorSelect, doctorUnselect, hospitalSelected, hospitalUnselect, patientUnselect, settingUnselect } from '../../../public/index.js'

export default function HFDSidebar() {
  const location = useLocation()
  const isSettingsRoute = location.pathname.startsWith('/hfd/settings')
  const [openSettings, setOpenSettings] = useState(isSettingsRoute)
  useEffect(() => { if (isSettingsRoute) setOpenSettings(true) }, [isSettingsRoute])

  const menuItems = [
    { name: 'Queue Management', iconSelected: patientUnselect, iconUnselected: patientUnselect, path: '/hfd/queue', alt: 'Queue' },
    { name: 'Patients', iconSelected: doctorSelect, iconUnselected: doctorUnselect, path: '/hfd/patients', alt: 'Patients' },
    { name: 'Calendar', iconSelected: hospitalSelected, iconUnselected: hospitalUnselect, path: '/hfd/calendar', alt: 'Calendar' },
    // { name: 'Settings', iconSelected: settingUnselect, iconUnselected: settingUnselect, path: '/hfd/settings', alt: 'Settings' },
  ]
  const settingsSubItems = [
    // { label: 'Clinic Details', to: '/hfd/settings/clinics' },
    // { label: 'Consultation Details', to: '/hfd/settings/consultation' },
    // { label: 'Staff Permissions', to: '/hfd/settings/staff-permissions' },
  ]

  return (
    <div className="sidebar flex flex-col justify-between min-h-screen w-[210px] bg-white border-r border-[#D6D6D6]">
      <div>
        <div className="px-4 py-3"><img src={logo} alt="logo" className="w-[128px] h-auto" /></div>
        <nav>
          {menuItems.map((item) => {
            if (item.name !== 'Settings') {
              return (
                <NavLink key={item.name} to={item.path} end={false} className={({ isActive }) => `flex items-center gap-[6px] py-3 px-4 h-[44px] w-full text-left transition-colors ${isActive ? 'bg-[#2372EC] text-white border-l-[3px] border-[#96BFFF] ' : 'text-gray-800 hover:bg-gray-100'}`}>
                  {({ isActive }) => (<>
                    <img src={isActive ? item.iconSelected : item.iconUnselected} alt={item.alt} className="w-5 h-5" />
                    <span className="font-normal text-sm">{item.name}</span>
                  </>)}
                </NavLink>
              )
            }
            /*
            return (
              <div key="Settings" className="">
                <button type="button" onClick={() => setOpenSettings((v) => !v)} className={`w-full flex items-center justify-between py-3 px-4 h-[44px] transition-colors ${isSettingsRoute ? 'bg-[#2372EC] text-white border-l-[3px] border-[#96BFFF]' : 'text-gray-800 hover:bg-gray-100'}`}>
                  <span className="inline-flex items-center gap-[6px]">
                    <img src={settingUnselect} alt="Settings" className="w-5 h-5" />
                    <span className="font-normal text-sm">Settings</span>
                  </span>
                  {openSettings ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
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
            )
            */
            return null;
          })}
        </nav>
      </div>

      <div className="px-4 py-3 border-t border-[#D6D6D6] flex justify-between items-center text-[#626060]">
        <div className={`flex items-center gap-[6px] w-full text-left `}>
          <HelpCircle size={18} /> Help & Support
        </div>
        <div>
          <ArrowRight size={18} />
        </div>
      </div>
    </div>
  )
}
