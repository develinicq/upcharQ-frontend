import React, { useState, useRef, useEffect, useMemo } from "react";
import useDoctorAuthStore from "../../../store/useDoctorAuthStore";
import useHospitalAuthStore from "../../../store/useHospitalAuthStore";
import {
  getDoctorDashboardAnalytics,
  getOutOfOfficeStatus
} from "../../../services/doctorService";
import useOOOStore from "../../../store/useOOOStore";
import useFrontDeskAuthStore from "../../../store/useFrontDeskAuthStore";
import useSlotStore from "../../../store/useSlotStore";
import useDoctorAnalyticsStore from "../../../store/useDoctorAnalyticsStore";
import Overview_cards from "../../../components/Dashboard/Overview_cards";
import { PatientsServedChart } from "../../../components/ui/Graphs/PatientsServedChart";
import { AppointmentBookingChart } from "../../../components/ui/Graphs/AppointmentBookingChart";
import { AppointmentBookingStatusChart } from "../../../components/ui/Graphs/AppointmentBookingStatusChart";
import BookAppointmentDrawer from "../../../components/Appointment/BookAppointmentDrawer.jsx";
import OutOfOfficeDrawer from "../../Components/OutOfOfficeDrawer";
import DropdownMenu from "../../../components/GeneralDrawer/DropdownMenu";
import {
  walkInBlue,
  appointementWhite,
  engageWhite,
  admitWhite,
  avgTimeWhite,
  tokenWhite,
  waitingWhite,
  newPatientWhite,
  angelDown,
  calenderArrowLeft,
  calenderArrowRight,
  downloadIcon,
} from "../../../../public/index.js";
const power = '/Doctor_module/dashboard/rename.svg'
const arrow = '/Doctor_module/dashboard/fullarrow.svg'

const PeriodTabs = ({ value, onChange }) => {
  const tabs = ["Daily", "Weekly", "Monthly", "Yearly"];
  return (
    <div className="flex rounded-md items-center gap-2 bg-blue-primary50 p-[2px] text-sm ">
      {tabs.map((t) => (
        <button
          key={t}
          onClick={() => onChange(t)}
          className={`px-[6px]  py-1 rounded-[4px] transition-colors ${value === t
            ? "bg-[#2372EC] text-white"
            : "bg-transparent text-[#626060] hover:bg-gray-50"
            }`}
        >
          {t}
        </button>
      ))}
    </div>
  );
};

const SectionCard = ({ title, children, right }) => (
  <div className="bg-white border border-gray-200 rounded-[12px]">
    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
      <h3 className="text-[#424242] text-sm sm:text-base font-medium">
        {title}
      </h3>
      <div className="flex items-center gap-2">
        {right}
        <button className="p-1.5 rounded  hover:bg-gray-50">
          <img src={downloadIcon} alt="Download" className="w-5 h-5" />
        </button>
      </div>
    </div>
    <div className="p-4">{children}</div>
  </div>
);

const DocDashboard = () => {
  const { user: doctorDetails, loading: doctorLoading, fetchMe: fetchDoctorDetails } = useDoctorAuthStore();
  const { user: fdUser } = useFrontDeskAuthStore();
  const selectedSlotId = useSlotStore((s) => s.selectedSlotId);
  const loadAppointmentsForSelectedSlot = useSlotStore(
    (s) => s.loadAppointmentsForSelectedSlot
  );
  const [period, setPeriod] = useState("Yearly");
  const { analytics, loading: loadingAnalytics, fetchAnalytics } = useDoctorAnalyticsStore();
  const { oooData, fetchOOOStatus } = useOOOStore();
  const [isOOODrawerOpen, setIsOOODrawerOpen] = useState(false);

  // Month dropdown state
  const months = [
    "All Months",
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const [selectedMonth, setSelectedMonth] = useState("All Months");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isMonthOpen, setMonthOpen] = useState(false);
  const monthBtnRef = useRef(null);
  const monthDropRef = useRef(null);
  const monthRef = useRef(null); // Added for consistency with SuperAdmin
  const [bookOpen, setBookOpen] = useState(false);

  useEffect(() => {
    if (!doctorDetails && !doctorLoading && !fdUser) {
      try {
        fetchDoctorDetails?.();
      } catch { }
    }
  }, [doctorDetails, doctorLoading, fetchDoctorDetails, fdUser]);

  const { hospitalId: hHospitalId, user: hospitalUser } = useHospitalAuthStore();

  const clinicId = doctorDetails?.clinicId || doctorDetails?.associatedWorkplaces?.clinic?.id || fdUser?.clinicId || fdUser?.clinic?.id || hHospitalId || hospitalUser?.clinicId || hospitalUser?.clinic?.id;
  const doctorId = doctorDetails?.id || doctorDetails?.userId || fdUser?.doctorId || hHospitalId && (hospitalUser?.doctorId || hospitalUser?.id);

  useEffect(() => {
    if (clinicId) {
      const monthIndex = selectedMonth === "All Months"
        ? 13
        : months.indexOf(selectedMonth);

      fetchAnalytics({
        clinicId,
        aggregationType: period.toLowerCase(),
        month: monthIndex,
        year: selectedYear
      });
      fetchOOOStatus();
    }
  }, [clinicId, period, selectedMonth, selectedYear, fetchAnalytics, fetchOOOStatus]);

  const handleOOOSave = (newData) => {
    // Note: The drawer now handles the store update internally via useOOOStore.updateOOOStatus.
  };

  const handlePrevYear = () => setSelectedYear(prev => prev - 1);
  const handleNextYear = () => setSelectedYear(prev => prev + 1);

  useEffect(() => {
    const onClick = (e) => {
      if (isMonthOpen && monthRef.current && !monthRef.current.contains(e.target)) {
        setMonthOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [isMonthOpen]);

  const summary = analytics?.summary || {};
  const metrics = analytics?.metrics || {};

  const getMetricData = (key, unit = "") => {
    const m = metrics[key] || {};
    return {
      value: loadingAnalytics ? "00" : `${m.current || 0}${unit}`,
      percent: m.percentageChange || 0,
      variant: loadingAnalytics ? "neutral" : (m.trend === "increase" ? "profit" : "loss")
    };
  };

  return (
    <div>
      {/* Out of Office Banner */}
      {oooData?.isOutOfOffice && (
        <div className="flex items-center justify-center gap-2 h-[40px] bg-error-50 ">
          <span className="text-[20px]  text-error-400">
            You are currently Out of Office.
          </span>
          <span className="text-secondary-grey100/50">|</span>
          <img src={power} alt="" />
          <button
            onClick={() => setIsOOODrawerOpen(true)}
            className="text-[14px] font-medium  text-secondary-grey400 flex items-center gap-1 hover:underline decoration-secondary-grey400"
          >
            Resume Work
          </button>
          <img src={arrow} alt="" />
        </div>
      )}
      <div className="p-4 flex flex-col gap-4 no-scrollbar bg-white">


        {/* Welcome + Walk-In */}
        <div className="flex items-center justify-between gap-3">
          <p className="text-md text-secondary-grey300">
            Welcome, {doctorDetails?.name || "Dr. Millin Chavan"}. Here's an overview of your practice.
          </p>
          <div className="flex items-center  ">
            <button
              onClick={() => setBookOpen(true)}
              className=" group inline-flex items-center gap-2 h-[32px] min-w-[32px] p-2 rounded-md border text-sm border-[#BFD6FF] bg-[#F3F8FF] text-[#2372EC] hover:bg-[#2372EC] hover:text-white transition-colors"
            >
              <img
                src={walkInBlue}
                alt=""
                className="h-4  group-hover:invert group-hover:brightness-0"
              />
              <span>Walk-In Appointment</span>
            </button>
          </div>
        </div>

        {/* Top metrics: Total Patients + Total Appointments Booked */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ">
          <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
            <div className="flex flex-col gap-1">
              <div className="text-[16px] font-medium text-secondary-grey400">
                Total Patients
              </div>
              <span className="text-[26px] font-bold text-secondary-grey400">
                {loadingAnalytics ? "00" : summary.totalPatients || 0}
              </span>
            </div>
            <div className="w-12 h-12 rounded-full bg-white shadow-sm border border-gray-200 flex items-center justify-center">
              <img src={appointementWhite} alt="" className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
            <div className="flex flex-col gap-1">
              <div className="text-[16px] font-medium text-secondary-grey400">
                Total Appointments Booked
              </div>
              <span className="text-[26px] font-bold text-secondary-grey400">
                {loadingAnalytics ? "00" : summary.totalAppointments || 0}
              </span>
            </div>
            <div className="w-12 h-12 rounded-full bg-white shadow-sm border border-gray-200 flex items-center justify-center">
              <img src={appointementWhite} alt="" className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Period tabs and selectors */}
        <div className="flex items-center justify-between">
          <PeriodTabs value={period} onChange={setPeriod} />

          <div className="flex items-center gap-3" ref={monthRef}>
            <div className="relative">
              <button
                type="button"
                onClick={() => setMonthOpen(!isMonthOpen)}
                className={`flex items-center gap-4 px-2 h-8 rounded-lg bg-white text-sm transition-colors border ${isMonthOpen ? "border-[#2372EC]/30 ring-1 ring-[#2372EC]/30" : "border-secondary-grey100"
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
                  items={months}
                  selectedItem={selectedMonth}
                  onSelect={(it) => {
                    setSelectedMonth(typeof it === 'object' ? (it.value ?? it.label) : it);
                    setMonthOpen(false);
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

        {/* Overview cards */}
        <div className="font-semibold text-gray-600">Appointment Overview</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 mb-6">
          <Overview_cards
            title="Avg. Appointment Booked"
            {...getMetricData("avgAppointmentsBooked")}
            periodText={`from last ${period.toLowerCase()}`}
          />
          <Overview_cards
            title="Avg. Engage Patient"
            {...getMetricData("avgEngagedPatients")}
            periodText={`from last ${period.toLowerCase()}`}
          />
          <Overview_cards
            title="Avg. Patient Admitted"
            {...getMetricData("avgPatientAdmitted")}
            periodText={`from last ${period.toLowerCase()}`}
          />
          <Overview_cards
            title="Avg. No-Show Patients"
            {...getMetricData("avgNoShowPatients")}
            periodText={`from last ${period.toLowerCase()}`}
          />
          <Overview_cards
            title="Avg. time Spent/ Patient"
            {...getMetricData("avgTimeSpentPerPatient", "s")}
            periodText={`from last ${period.toLowerCase()}`}
          />
          <Overview_cards
            title="Avg. Token Utilization"
            {...getMetricData("avgTokenUtilization", "%")}
            periodText={`from last ${period.toLowerCase()}`}
          />
          <Overview_cards
            title="Avg. Waiting Time"
            {...getMetricData("avgWaitingTime", "s")}
            periodText={`from last ${period.toLowerCase()}`}
          />
          <Overview_cards
            title="Avg. New Patient Visit"
            {...getMetricData("avgNewPatientVisit")}
            periodText={`from last ${period.toLowerCase()}`}
          />
        </div>

        {/* Analytics Overview section */}
        <div className="">
          <span className="text-sm sm:text-base font-medium text-[#424242]">
            Analytics Overview
          </span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <PatientsServedChart />
          <AppointmentBookingChart />
        </div>

        {/* Bottom section */}
        <AppointmentBookingStatusChart height="320px" />

        {/* Appointment booking drawer */}
        <BookAppointmentDrawer
          open={bookOpen}
          onClose={() => setBookOpen(false)}
          doctorId={doctorId}
          clinicId={clinicId}
          hospitalId={
            (Array.isArray(doctorDetails?.associatedWorkplaces?.hospitals) &&
              doctorDetails?.associatedWorkplaces?.hospitals[0]?.id) ||
            undefined
          }
          onBookedRefresh={() => {
            if (selectedSlotId) {
              try {
                loadAppointmentsForSelectedSlot();
              } catch { }
            }
          }}
        />
        {/* Out of office drawer */}
        <OutOfOfficeDrawer
          isOpen={isOOODrawerOpen}
          onClose={() => setIsOOODrawerOpen(false)}
          onSave={handleOOOSave}
          initialData={oooData}
        />
      </div>
    </div>
  );
};

export default DocDashboard;
