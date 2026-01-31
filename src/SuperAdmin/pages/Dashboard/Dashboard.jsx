import React, { useState, useRef, useEffect } from 'react'
import Overview_cards from '../../../components/Dashboard/Overview_cards'
import { PatientsServedChart } from '../../../components/ui/Graphs/PatientsServedChart'
import { AppointmentBookingChart } from '../../../components/ui/Graphs/AppointmentBookingChart'
import { AppointmentBookingStatusChart } from '../../../components/ui/Graphs/AppointmentBookingStatusChart'
import { SpecialityAppointmentChart } from '../../../components/ui/Graphs/SpecialityAppointmentChart'
import Button from '../../../components/Button'
import { angelDown, calenderArrowLeft, calenderArrowRight } from '../../../../public/index.js'
import { getPlatformOverview } from '../../../services/superAdminService'
import UniversalLoader from '../../../components/UniversalLoader'
import DropdownMenu from '../../../components/GeneralDrawer/DropdownMenu'

const Dashboard = () => {
  const [activeRange, setActiveRange] = useState('Yearly')
  const ranges = ['Daily', 'Weekly', 'Monthly', 'Yearly']
  const [loading, setLoading] = useState(true)
  const [overviewData, setOverviewData] = useState(null)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedMonth, setSelectedMonth] = useState("All Months")
  const [isMonthOpen, setIsMonthOpen] = useState(false)
  const monthRef = useRef(null)

  useEffect(() => {
    const onClick = (e) => {
      if (isMonthOpen && monthRef.current && !monthRef.current.contains(e.target)) {
        setIsMonthOpen(false)
      }
    }
    document.addEventListener("mousedown", onClick)
    return () => document.removeEventListener("mousedown", onClick)
  }, [isMonthOpen])

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const res = await getPlatformOverview()
        if (res.success) {
          setOverviewData(res.data)
        }
      } catch (error) {
        console.error("Failed to fetch platform overview:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchOverview()
  }, [])

  const handlePrevYear = () => setSelectedYear(prev => prev - 1);
  const handleNextYear = () => setSelectedYear(prev => prev + 1);

  return (
    <>
      <div className='p-5 flex flex-col gap-6 bg-white'>
        {/* Heading and search live in navbar per mock; no extra top tabs here */}

        {/* Platform Overview using Overview_cards */}
        <div>
          <div className='text-[20px] font-medium text-secondary-grey400 mb-3'>Platform Overview</div>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
            <Overview_cards
              title='Total Active Doctors'
              value={loading ? '00' : (overviewData?.totalActiveDoctors || 0)}
              percent={loading ? 0 : (overviewData?.deltas?.doctors || 0)}
              periodText='from last year'
              variant={loading ? 'neutral' : (overviewData?.deltas?.doctors || 0) >= 0 ? 'profit' : 'loss'}
            />
            <Overview_cards
              title='Total Clinics'
              value={loading ? '00' : (overviewData?.totalClinics || 0)}
              percent={loading ? 0 : (overviewData?.deltas?.clinics || 0)}
              periodText='from last year'
              variant={loading ? 'neutral' : (overviewData?.deltas?.clinics || 0) >= 0 ? 'profit' : 'loss'}
            />
            <Overview_cards
              title='Total Active Hospitals'
              value={loading ? '00' : (overviewData?.totalActiveHospitals || 0)}
              percent={loading ? 0 : (overviewData?.deltas?.hospitals || 0)}
              periodText='from last year'
              variant={loading ? 'neutral' : (overviewData?.deltas?.hospitals || 0) >= 0 ? 'profit' : 'loss'}
            />
            <Overview_cards
              title='Total Enrolled Patients'
              value={loading ? '00' : (overviewData?.totalEnrolledPatients || 0)}
              percent={loading ? 0 : (overviewData?.deltas?.patients || 0)}
              periodText='from last year'
              variant={loading ? 'neutral' : (overviewData?.deltas?.patients || 0) >= 0 ? 'profit' : 'loss'}
            />
          </div>
          {/* Controls row: tabs on the left, month/year dropdowns on the right */}
          <div className='mt-6 flex items-center justify-between'>
            <div className='flex items-center gap-2 p-[2px] rounded-sm bg-blue-primary50  h-8 overflow-hidden w-fit'>
              {ranges.map((range, idx) => {
                const isActive = activeRange === range

                return (
                  <React.Fragment key={range}>
                    <button
                      onClick={() => setActiveRange(range)}
                      className={`
                        px-[6px] h-7 py-1 text-sm rounded-sm transition
                        ${isActive
                          ? 'bg-blue-primary250 text-white'
                          : 'text-[#6B7280] hover:bg-gray-100'}
                      `}
                    >
                      {range}
                    </button>


                  </React.Fragment>
                )
              })}
            </div>


            <div className="flex items-center gap-3" ref={monthRef}>
              <div className="relative ">
                <button
                  type="button"
                  onClick={() => setIsMonthOpen(!isMonthOpen)}
                  className={`w-full flex items-center gap-4 px-2 h-8 rounded-lg bg-white text-sm transition-colors border ${isMonthOpen ? "border-[#2372EC]/30 ring-1 ring-[#2372EC]/30" : "border-secondary-grey100"
                    }`}
                >
                  <span className="text-secondary-grey400 font-medium">
                    {selectedMonth}
                  </span>
                  <img
                    src={angelDown}
                    alt="Dropdown"
                    className={`w-3 h-3 transition-transform ${isMonthOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {isMonthOpen && (
                  <DropdownMenu
                    items={[
                      "All Months", "January", "February", "March", "April", "May", "June",
                      "July", "August", "September", "October", "November", "December"
                    ]}
                    selectedItem={selectedMonth}
                    onSelect={(it) => {
                      setSelectedMonth(typeof it === 'object' ? (it.value ?? it.label) : it)
                      setIsMonthOpen(false)
                    }}
                    width="w-[170px]"

                  />
                )}
              </div>

              <div className="inline-flex items-center gap-1 px-2 h-8 rounded-lg border border-secondary-grey100 bg-white text-sm text-[#424242]">
                <button
                  type="button"
                  onClick={handlePrevYear}
                  className="p-1 hover:bg-gray-100 rounded-sm transition-colors"
                >
                  <img src={calenderArrowLeft} alt="Previous" className="w-3 h-3" />
                </button>
                <span className="text-secondary-grey400 font-medium px-1">
                  {selectedYear}
                </span>
                <button
                  type="button"
                  onClick={handleNextYear}
                  className="p-1 hover:bg-gray-100 rounded-sm transition-colors"
                >
                  <img src={calenderArrowRight} alt="Next" className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Appointment Overview metrics — full grid per mock */}
        <div className='flex flex-col gap-3'>
          <div className='text-md font-medium text-secondary-grey400'>Appointment Overview</div>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            <Overview_cards title='Avg. Appointment Booked' value={103} percent={12} periodText='from last Year' variant='profit' />
            <Overview_cards title='Avg. Engage Patient' value={80} percent={8} periodText='from last Year' variant='loss' />
            <Overview_cards title='Avg. Patient Serve' value={'100 /Doctor'} percent={12} periodText='from last Year' variant='profit' />
            <Overview_cards title='Avg. time Spent/Doctor' value={'06:05 min/Patient'} percent={5} periodText='from last Year' variant='profit' />
            <Overview_cards title='Avg. Waiting Time' value={'12:30 min / Patient'} percent={12} periodText='from last Year' variant='profit' />
            <Overview_cards title='Avg. Appt Cancelled by Patient' value={5} percent={12} periodText='from last Year' variant='loss' />
            <Overview_cards title='Avg. Appt Cancelled by Doctor' value={5} percent={12} periodText='from last Year' variant='loss' />
          </div>
        </div>

        {/* Analytics Overview */}
        <div className='flex flex-col gap-3'>
          <div className='text-sm font-medium text-[#424242]'>Analytics Overview</div>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
            <PatientsServedChart
            subtitle="Appointment metrics by patient" />
            <AppointmentBookingChart subtitle="Appointment metrics by type" />
            <AppointmentBookingStatusChart
              height='340px'
              subtitle="Appointment metrics by status"
            />
            <SpecialityAppointmentChart />
          </div>
        </div>

      </div>
    </>
  )
}

export default Dashboard
