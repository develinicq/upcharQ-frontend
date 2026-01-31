import React, { useEffect, useState, useRef } from 'react'
import AvatarCircle from '../../AvatarCircle'
import { getPublicUrl } from '../../../services/uploadsService'
import UniversalLoader from "@/components/UniversalLoader";

const horizontal = '/superAdmin/Doctors/Threedots.svg'
const star = '/star.png'
const down = '/angel-down.svg'
const hospital2 = '/superAdmin/Doctors/Hospital.svg'
const clinic = '/superAdmin/Doctors/Medical Kit.svg'

const locIcon = '/superAdmin/hospital_banner/location.svg'
const specIcon = '/superAdmin/hospital_banner/speciality.svg'
const estIcon = '/superAdmin/hospital_banner/establish.svg'
const webIcon = '/superAdmin/hospital_banner/website.svg'

const calendarReschedule = '/superAdmin/doctor_list_dropdown/Calendar Reschedule.svg';
const bin = '/superAdmin/doctor_list_dropdown/bin.svg';
const inactiveIcon = '/superAdmin/doctor_list_dropdown/inactive.svg';
const linkIconLocal = '/superAdmin/doctor_list_dropdown/link.svg';

// Reusable Stat Card Component (Matched to InfoBox style)
const StatCard = ({ label, value, valueClass = "text-[#2372EC]" }) => (
  <div className="w-[116px] h-[90px] border-dashed border border-secondary-grey100/50 rounded-sm text-left p-[10px]">
    <div className='flex flex-col h-full justify-between items-start'>
      <span className="text-[#626060] text-sm text-left" style={{ lineHeight: '14px' }}>{label}</span>
      <span className={`font-semibold text-sm text-left ${valueClass} break-words w-full`} style={{ lineHeight: '16px', wordBreak: 'break-word' }}>{value}</span>
    </div>
  </div>
)

const HospitalBanner = ({
  hospitalData = {
    name: "Manipal Hospital",
    status: "Active",
    address: "-",
    type: "-",
    established: "-",
    website: "-",
    bannerImage: "",

    logoImage: "",
    stats: {}
  },
  isLoading = false
}) => {
  const { name, status, address, type, established, website, logoImage, experience, stats } = hospitalData
  const [resolvedLogo, setResolvedLogo] = useState('')
  const [imageLoading, setImageLoading] = useState(false)
  const [showActionMenu, setShowActionMenu] = useState(false)
  const actionMenuRef = useRef(null)
  const buttonRef = useRef(null)

  useEffect(() => {
    let ignore = false
    const run = async () => {
      if (!logoImage) {
        setResolvedLogo('')
        return
      }
      // If it's already a URL, use it
      if (typeof logoImage === 'string' && (logoImage.startsWith('http') || logoImage.startsWith('data:') || logoImage.startsWith('/'))) {
        setResolvedLogo(logoImage)
        return
      }

      setImageLoading(true)
      try {
        const l = await getPublicUrl(logoImage)
        if (!ignore) setResolvedLogo(l || '')
      } catch (error) {
        if (!ignore) setResolvedLogo('')
      } finally {
        if (!ignore) setImageLoading(false)
      }
    }
    run()
    return () => { ignore = true }
  }, [logoImage])

  // Click outside and scroll handlers for dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        actionMenuRef.current &&
        !actionMenuRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setShowActionMenu(false)
      }
    }

    const handleScroll = () => {
      if (showActionMenu) setShowActionMenu(false)
    }

    document.addEventListener('mousedown', handleClickOutside)
    window.addEventListener('scroll', handleScroll, true)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      window.removeEventListener('scroll', handleScroll, true)
    }
  }, [showActionMenu])

  // Determine active status for styling
  const isActive = (status || '').toLowerCase() === 'active'

  const statCards = [
    { label: "No. of Patient Manages", value: stats?.patientsManaged || '-' },
    { label: "No. of Appt. Booked", value: stats?.appointmentsBooked || '-' }, // Shortened label
    { label: "Active Package", value: stats?.activePackage || 'Premium', valueClass: "text-[#90BE6D] font-semibold text-sm" },
    { label: "UpChar-Q ID", value: stats?.upCharQId || '—' },
  ]

  return (
    <div className="w-full p-4 flex items-center gap-4 bg-white relative">
      {/* Profile Circle with tick */}
      <div className="relative">
        <div className="w-[90px] h-[90px] rounded-full overflow-hidden border border-gray-100 flex items-center justify-center bg-gray-50">
          {imageLoading ? (
            <UniversalLoader size={20} />
          ) : resolvedLogo ? (
            <img
              src={resolvedLogo}
              alt={name}
              className="w-full h-full object-cover"
              onError={(e) => { e.currentTarget.src = '/images/hospital_logo.png' }}
            />
          ) : (
            <AvatarCircle name={name || 'Hospital'} color="blue" className="w-full h-full text-[2rem] border-none" style={{ borderWidth: 0 }} />
          )}
        </div>
        <img src="/tick.png" alt="Verified" className="absolute -bottom-0 left-16 w-6 h-6" />
      </div>

      {/* Hospital Info */}
      <div className="flex flex-col gap-1 flex-1">
        <div className="flex flex-wrap gap-3 items-center">
          <span className="text-secondary-grey400 font-semibold text-[20px]">
            {name}
          </span>
          <div className={`min-w-[22px] px-[6px] py-[2px] rounded-sm ${isActive ? 'bg-success-100' : 'bg-[#FFF8F2]'}`}>
            <span className={` text-sm ${isActive ? 'text-success-300' : 'text-[#F59E0B]'}`}>
              {status}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-1 text-sm text-secondary-grey400">
          <div className="flex gap-2 items-center">
            <img src={locIcon} className="w-4 h-4" alt="" />
            <span className="line-clamp-1">{address}</span>
          </div>
          <div className="flex gap-2 items-center">
            <img src={specIcon} className="w-4 h-4" alt="" />
            <span>{type}</span>
            <span className="text-secondary-grey150">|</span>
            <img src={estIcon} className="w-4 h-4" alt="" />
            <span>Establish in {established} ({experience} Years of Experience)</span>
            <span className="text-secondary-grey150">|</span>
            <img src={webIcon} className="w-4 h-4" alt="" />
            <a href={website} target="_blank" rel="noreferrer" className="hover:underline hover:text-blue-600 text-inherit">
              {website}
            </a>
          </div>

        </div>
      </div>

      {/* Info Boxes */}
      <div className="flex items-start gap-4 flex-wrap justify-end max-w-[60%]">
        {statCards.map((card, index) => (
          <StatCard
            key={index}
            label={card.label}
            value={card.value}
            valueClass={card.valueClass}
          />
        ))}
        <div className="relative">
          <button
            ref={buttonRef}
            onClick={() => setShowActionMenu(!showActionMenu)}
            className="p-2 text-gray-500 hover:text-gray-700 mr-2 ml-1 mt-2  hover:bg-secondary-grey50 transition-colors"
            aria-label="More options"
          >
            <img src={horizontal} alt="" />
          </button>
          {showActionMenu && (
            <div
              ref={actionMenuRef}
              className="absolute right-0 top-full mt-1 w-[245px] bg-white shadow-[0px_4px_20px_rgba(0,0,0,0.1)] rounded-[10px] border border-gray-100 z-50 py-2 animate-in fade-in zoom-in-95 duration-100"
            >
              <button className="w-full text-left px-[18px] py-2 text-secondary-grey400 font-normal text-sm hover:bg-gray-50 flex items-center gap-2">
                <img src={calendarReschedule} alt="" className="w-5 h-5" />
                Update Availability Timing
              </button>
              <button className="w-full text-left px-[18px] py-2 text-secondary-grey400 font-normal text-sm hover:bg-gray-50 flex items-center gap-2">
                <img src={linkIconLocal} alt="" className="w-5 h-5" />
                Send Magic Link
              </button>
              <button className="w-full text-left px-[18px] py-2 text-secondary-grey400 font-normal text-sm hover:bg-gray-50 flex items-center gap-2">
                <img src={inactiveIcon} alt="" className="w-5 h-5" />
                Mark as Inactive
              </button>
              <div className="mx-2 h-[0.5px] bg-[#E0E7FF] my-1.5"></div>
              <button className="w-full text-left px-[18px] py-2 text-[#F04438] font-normal text-sm hover:bg-red-50 flex items-center gap-2">
                <img src={bin} alt="" className="w-5 h-5" />
                Delete Profile
              </button>
            </div>
          )}
        </div>

      </div>
      {isLoading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/50 backdrop-blur-[1px]">
          <UniversalLoader size={30} className="bg-white" />
        </div>
      )}
    </div>
  )
}

export default HospitalBanner
