import React, { useMemo, useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import AvatarCircle from '../../../components/AvatarCircle'
import { hospital as coverImg } from '../../../../public/index.js'

const SectionCard = ({ title, children }) => (
  <div className="bg-white rounded-lg border border-gray-200">
    <div className="px-4 py-3 border-b border-gray-200">
      <div className="text-sm font-medium text-gray-900">{title}</div>
    </div>
    <div className="p-4">{children}</div>
  </div>
)

export default function HRxTemplate(){
  const location = useLocation()
  const navigate = useNavigate()

  const tabs = [
    { key: 'account', label: 'Account Details', path: '/hospital/settings/account' },
    { key: 'timing', label: 'Timing and Schedule', path: '/hospital/settings/timing' },
    { key: 'surgeries', label: 'Surgeries', path: '/hospital/settings/surgeries' },
    { key: 'branches', label: 'Branches', path: '/hospital/settings/branches' },
    { key: 'staff', label: 'Staff Permissions', path: '/hospital/settings/staff-permissions' },
    { key: 'security', label: 'Security Settings', path: '/hospital/settings/security' },
  ]

  const activeKey = useMemo(() => {
    const p = location.pathname
    if (p.endsWith('/settings/account')) return 'account'
    if (p.endsWith('/settings/timing')) return 'timing'
    if (p.endsWith('/settings/surgeries')) return 'surgeries'
    if (p.endsWith('/settings/branches')) return 'branches'
    if (p.endsWith('/settings/staff-permissions')) return 'staff'
    if (p.endsWith('/settings/security')) return 'security'
    return 'rx'
  }, [location.pathname])

  const [activeTab, setActiveTab] = useState(activeKey)
  useEffect(() => setActiveTab(activeKey), [activeKey])

  const profile = useMemo(() => ({ name: 'Manipal Hospital - Baner', status: 'Active', location: 'Baner, Pune' }), [])

  return (
    <div className="px-6 pb-10">
      <div className="-mx-6">
        <div className="relative">
          <img src={coverImg} alt="cover" className="w-full h-40 object-cover" />
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
            <div className="rounded-full ring-4 ring-white shadow-md">
              <AvatarCircle name={profile.name} size="l" color="blue" className="w-24 h-24 text-3xl" />
            </div>
          </div>
        </div>
        <div className="bg-white border-b border-gray-200">
          <div className="px-6 pt-10">
            <div className="flex items-center justify-between">
              <div className="text-center mx-auto">
                <div className="text-lg font-medium text-gray-900">{profile.name}</div>
                <div className="text-green-600 text-sm">{profile.status}</div>
              </div>
              <div className="text-sm text-gray-600">{profile.location}</div>
            </div>
            <nav className="mt-3 flex items-center gap-6 overflow-x-auto text-sm">
              {tabs.map((t) => (
                <button key={t.key} onClick={() => navigate(t.path)} className={`whitespace-nowrap pb-3 border-b-2 transition-colors ${activeTab===t.key? 'border-blue-600 text-gray-900' : 'border-transparent text-gray-600 hover:text-gray-900'}`}>
                  {t.label}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <SectionCard title="My Rx Template">
          <div className="text-sm text-gray-600">Available soon.</div>
        </SectionCard>
      </div>
    </div>
  )
}
