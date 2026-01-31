import React, { useMemo, useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import AvatarCircle from '../../../components/AvatarCircle'
import { hospital as coverImg } from '../../../../public/index.js'

// Import Tab Components
import HAccount from './HAccount'
import HTiming from './HTiming'
import HSurgeries from './HSurgeries'
import HStaffPermissions from './HStaffPermissions'
import HSecurity from './HSecurity'

export default function HSettings() {
    const location = useLocation()
    const navigate = useNavigate()

    const tabs = [
        { key: 'account', label: 'Account Details', path: '/hospital/settings/account' },
        { key: 'timing', label: 'Timing and Schedule', path: '/hospital/settings/timing' },
        { key: 'surgeries', label: 'Surgeries', path: '/hospital/settings/surgeries' },
        { key: 'staff', label: 'Staff Permissions', path: '/hospital/settings/staff-permissions' },
        { key: 'security', label: 'Security Settings', path: '/hospital/settings/security' },
    ]

    const activeKey = useMemo(() => {
        const p = location.pathname
        if (p.endsWith('/settings/account')) return 'account'
        if (p.endsWith('/settings/timing')) return 'timing'
        if (p.endsWith('/settings/surgeries')) return 'surgeries'
        if (p.endsWith('/settings/staff-permissions')) return 'staff'
        if (p.endsWith('/settings/security')) return 'security'
        return 'account'
    }, [location.pathname])

    const [activeTab, setActiveTab] = useState(activeKey)
    const [visitedTabs, setVisitedTabs] = useState(new Set([activeKey]))

    useEffect(() => {
        setActiveTab(activeKey)
        setVisitedTabs(prev => new Set(prev).add(activeKey))
    }, [activeKey])

    const profile = useMemo(() => ({
        name: 'Manipal Hospital - Baner',
        status: 'Active',
        phone: '91753 67487',
        email: 'milindchahun@gmail.com',
        gender: 'Male',
        city: 'Akola, Maharashtra',
        designation: 'Business Owner',
        role: 'Super Admin',
        specialties: ['Anaesthesiology', 'Cardiology', 'Dermatology', 'Orthopedics', 'Physiotherapy', 'ENT', 'Pulmonology', 'Haematology', 'Oncology'],
        services: ['MRI Scan', 'CT Scan', 'Blood Bank', 'Parking', 'Path Lab', 'X Ray', 'Pharmacy', 'Radiology', 'Private Room', 'General Ward'],
        gst: { number: '27AAECA1234F1Z5', proof: 'GST Proof.pdf' },
        cin: {
            number: '27AAECA1234F1Z5', company: 'Manipal Hospital Pvt. Ltd.', type: 'Private Limited',
            incorporation: '02/05/2015', address: '101, FC Road, Pune', stateCode: 'PN (Maharashtra)', director: 'Dr. R. Mehta', code: '012345'
        },
        about: `Dr. Milind Chauhan practices Gynaecologist and Obstetrician in Andheri East, Mumbai and has 13 years of experience in this field. He has completed his DNB - Obstetric and Gynecology and MBBS. Dr. Milind Chauhan has gained the confidence of patients and is a popular Gynaecologist and Obstetrician expert in Mumbai who performs treatment and procedures for various health issues related to Gynaecologist and Obstetrician.`,
        photos: [
            'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=400',
            'https://images.unsplash.com/photo-1584985592394-8c40a30e2531?w=400',
            'https://images.unsplash.com/photo-1504439904031-93ded9f93b28?w=400',
            'https://images.unsplash.com/photo-1579154206451-2bdb0fd2d375?w=400',
        ],
    }), [])

    const renderTabContent = (key) => {
        if (!visitedTabs.has(key)) return null;

        return (
            <div key={key} className={activeTab === key ? "block" : "hidden"}>
                {key === 'account' && <HAccount profile={profile} />}
                {key === 'timing' && <HTiming />}
                {key === 'surgeries' && <HSurgeries />}
                {key === 'staff' && <HStaffPermissions />}
                {key === 'security' && <HSecurity />}
            </div>
        );
    };

    return (

        <div className="px-4 pb-10 bg-secondary-grey50 ">
            {/* Top banner + centered avatar + tabs */}
            <div className="-mx-4">
                <div className="relative">
                    <img src={coverImg} alt="cover" className="w-full h-40 object-cover" />
                    <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
                        <div className="rounded-full ring-4 ring-white shadow-md">
                            <AvatarCircle name={profile.name} size="l" color="blue" className="w-24 h-24 text-3xl" />
                        </div>
                    </div>
                </div>
                <div className="border-b border-secondary-grey100">
                    <div className="px-4 pt-10">
                        <div className="flex items-center justify-between">
                            <div className="text-center mx-auto">
                                <div className="text-lg font-medium text-gray-900">{profile.name}</div>
                                <div className="text-green-600 text-sm">{profile.status}</div>
                            </div>

                        </div>
                        <nav className=" flex items-center gap-6 overflow-x-auto text-sm">
                            {tabs.map((t) => (
                                <button key={t.key} onClick={() => navigate(t.path)} className={`whitespace-nowrap pb-2 border-b-2 transition-colors ${activeTab === t.key ? 'text-blue-primary250 border-blue-primary250' : 'border-transparent text-secondary-grey300 hover:text-secondary-grey400'}`}>
                                    {t.label}
                                </button>
                            ))}
                        </nav>
                    </div>
                </div>
            </div>

            {/* Content Area - Persist mounted tabs once visited */}
            <div className="mt-5">
                {tabs.map(t => renderTabContent(t.key))}
            </div>
        </div>
    )
}
