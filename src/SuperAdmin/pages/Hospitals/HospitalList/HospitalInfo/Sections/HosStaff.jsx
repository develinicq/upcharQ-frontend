import React, { useMemo, useState } from 'react'
import { Eye, MoreVertical, X, ChevronDown } from 'lucide-react'
import AvatarCircle from '../../../../components/AvatarCircle'

const initialStaff = [
  {
    id: 'U-0001',
    name: 'Sunil Pawar',
    role: 'Front Desk',
    email: 'SunilPawar@gmail.com',
    phone: '91753 67487'
  },
  {
    id: 'U-0002',
    name: 'Nita Bhalerao',
    role: 'Nurse',
    email: 'Nitabhaherao@gmail.com',
    phone: '91753 67487'
  }
]

const roles = [
  'Business Owner/Doctor',
  'Nurses',
  'Receptionist/Front Desk',
]

const TextInput = ({ label, value, onChange, type = 'text', placeholder, required }) => (
  <label className="flex flex-col gap-1 text-sm text-gray-700">
    <span className="text-[12px] text-gray-600">{label}{required ? ' *' : ''}</span>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="h-9 px-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-200"
    />
  </label>
)

const Select = ({ label, value, onChange, options, required }) => (
  <label className="flex flex-col gap-1 text-sm text-gray-700">
    <span className="text-[12px] text-gray-600">{label}{required ? ' *' : ''}</span>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-9 px-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-200"
    >
      <option value="">Select</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  </label>
)

const InviteDrawer = ({ open, onClose, onSubmit }) => {
  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')

  const emailOk = useMemo(() => /.+@.+\..+/.test(email), [email])
  const phoneOk = useMemo(() => phone.trim().length >= 8, [phone])
  const canSend = name.trim() && role && emailOk && phoneOk

  const handleSend = () => {
    if (!canSend) return
    onSubmit({
      id: `U-${Math.floor(1000 + Math.random()*9000)}`,
      name: name.trim(),
      role,
      email: email.trim(),
      phone: phone.trim(),
    })
    onClose()
  }

  return (
    <div className={`fixed inset-0 z-40 ${open ? '' : 'pointer-events-none'}`} aria-hidden={!open}>
      {/* Backdrop */}
      <div className={`absolute inset-0 bg-black/20 transition-opacity ${open ? 'opacity-100' : 'opacity-0'}`} onClick={onClose} />
      {/* Panel */}
      <div className={`absolute right-0 top-0 h-full w-[420px] bg-white shadow-xl border-l border-gray-200 transform transition-transform ${open ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="text-base font-semibold text-gray-900">Invite Staff</h3>
          <button onClick={onClose} className="p-1.5 rounded hover:bg-gray-100" aria-label="Close">
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>
        <div className="p-4 space-y-3">
          <TextInput label="Full Name" value={name} onChange={setName} placeholder="Enter name" required />
          <Select label="User Role" value={role} onChange={setRole} options={roles} required />
          <TextInput label="Email" type="email" value={email} onChange={setEmail} placeholder="name@example.com" required />
          {!emailOk && email && (
            <div className="text-xs text-red-600">Enter a valid email.</div>
          )}
          <TextInput label="Contact Number" value={phone} onChange={setPhone} placeholder="e.g. 91753 67487" required />
          {!phoneOk && phone && (
            <div className="text-xs text-red-600">Enter a valid contact number.</div>
          )}
        </div>
        <div className="px-4 py-3 border-t flex items-center justify-end gap-2">
          <button className="px-3 h-9 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50" onClick={onClose}>Cancel</button>
          <button
            className={`px-3 h-9 rounded-md ${canSend ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
            onClick={handleSend}
            disabled={!canSend}
          >
            Send Invite
          </button>
        </div>
      </div>
    </div>
  )
}

const RightPanel = () => {
  const Pill = ({ label }) => (
    <button className="w-full flex items-center justify-between h-10 px-3 border border-gray-200 rounded-md hover:bg-gray-50 text-sm">
      <span>{label}</span>
      <ChevronDown className="h-4 w-4 text-gray-500" />
    </button>
  )

  return (
    <div className="space-y-3">
      <div className="border border-gray-200 rounded-lg p-3">
        <div className="text-sm font-medium text-gray-900 mb-1">Role-Based Access Control</div>
        <div className="text-xs text-gray-500 mb-3">Configure user roles and permissions for your hospital staff</div>
        <div className="space-y-2">
          <Pill label="Business Owner/Doctor" />
          <Pill label="Nurses" />
          <Pill label="Receptionist/Front Desk" />
        </div>
      </div>
      <div className="border border-gray-200 rounded-lg p-3">
        <div className="text-sm font-medium text-gray-900 mb-1">Security Settings</div>
        <div className="text-xs text-gray-500 mb-2">For enhanced security, we require setting up MFA for all admin accounts</div>
        <label className="flex items-center gap-2 text-sm py-1">
          <input type="checkbox" defaultChecked className="accent-blue-600" />
          <span>Multi-Factor Authentication (MFA)</span>
        </label>
        <label className="flex items-center gap-2 text-sm py-1">
          <input type="checkbox" defaultChecked className="accent-blue-600" />
          <span>Password Policy</span>
        </label>
        <label className="flex items-center gap-2 text-sm py-1">
          <input type="checkbox" defaultChecked className="accent-blue-600" />
          <span>Session Timeout</span>
        </label>
      </div>
    </div>
  )
}

const HosStaff = () => {
  const [staff, setStaff] = useState(initialStaff)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const addStaff = (entry) => {
    setStaff((prev) => [entry, ...prev])
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between bg-white px-3 py-2">
        <div className="text-sm font-medium text-gray-900">Staff Access</div>
        <button
          className="h-9 px-3 rounded-md border border-blue-200 text-blue-600 bg-blue-50 hover:bg-blue-100 text-sm"
          onClick={() => setDrawerOpen(true)}
        >
          + Invite Staff
        </button>
      </div>

      {/* Body grid */}
      <div className="grid grid-cols-12 gap-4 mt-2">
        {/* Table */}
        <div className="col-span-9">
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full table-fixed text-sm text-left text-gray-700">
                <colgroup>
                  <col className="w-[40px]" />
                  <col className="w-[260px]" />
                  <col className="w-[160px]" />
                  <col className="w-[260px]" />
                  <col className="w-[160px]" />
                  <col className="w-[84px]" />
                </colgroup>
                <thead className="bg-white text-[12px] uppercase font-medium text-gray-500 border-b">
                  <tr className="h-9">
                    <th className="pl-4 pr-2 py-0 h-9"><input type="checkbox" className="accent-blue-600" /></th>
                    <th className="px-2 py-0 h-9 whitespace-nowrap">User Name</th>
                    <th className="px-2 py-0 h-9 whitespace-nowrap">User Role</th>
                    <th className="px-2 py-0 h-9 whitespace-nowrap">Email</th>
                    <th className="px-2 py-0 h-9 whitespace-nowrap">Contact Number</th>
                    <th className="px-6 py-0 h-9 whitespace-nowrap text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {staff.map((u) => (
                    <tr key={u.id} className="border-b border-gray-200 hover:bg-gray-50 text-sm">
                      <td className="pl-4 pr-2 py-2"><input type="checkbox" className="accent-blue-600" /></td>
                      <td className="px-2 py-2">
                        <div className="flex items-center gap-2">
                          <AvatarCircle name={u.name} size="s" color="orange" />
                          <span className="text-gray-900">{u.name}</span>
                        </div>
                      </td>
                      <td className="px-2 py-2 text-gray-700">{u.role}</td>
                      <td className="px-2 py-2 text-gray-700">{u.email}</td>
                      <td className="px-2 py-2 text-gray-700">{u.phone}</td>
                      <td className="px-2 py-2">
                        <div className="flex items-center justify-end gap-1 text-gray-600">
                          <button className="p-1.5 rounded hover:bg-gray-100" aria-label="View">
                            <Eye className="h-4 w-4" />
                          </button>
                          <span className="mx-2 h-4 w-px bg-gray-200" aria-hidden="true" />
                          <button className="p-1.5 rounded hover:bg-gray-100" aria-label="More">
                            <MoreVertical className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="col-span-3">
          <RightPanel />
        </div>
      </div>

      <InviteDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} onSubmit={addStaff} />
    </div>
  )
}

export default HosStaff
