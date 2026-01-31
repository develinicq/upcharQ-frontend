import React, { useState } from "react";
import Details from "../../../SuperAdmin/pages/Hospitals/HospitalList/HospitalInfo/Sections/Details";
import Doctor from "../../../SuperAdmin/pages/Hospitals/HospitalList/HospitalInfo/Sections/Doctor";
import Timing from "../../../SuperAdmin/pages/Hospitals/HospitalList/HospitalInfo/Sections/Timing";
import Surgery from "../../../SuperAdmin/pages/Hospitals/HospitalList/HospitalInfo/Sections/Surgery";
// Use the exact Staff Access UI from Doctor Details
import DocStaff from "../../../SuperAdmin/pages/Doctors/DoctorList/DoctorInfo/Sections/Staff";

const HospitalNav = ({ hospital }) => {
  const [activeTab, setActiveTab] = useState("details");

  const tabs = [
    { key: "details", label: "Hospital Details" },
    { key: "doctor", label: "Doctors" },
    { key: "timing", label: "Timing & Schedule" },
    { key: "surgery", label: "Surgeries Details" },
    { key: "staff", label: "Staff Access" },
    { key: "settings", label: "Settings" },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "details":
        return <Details hospital={hospital} />;
      case "doctor":
        return <Doctor hospital={hospital} />;
      case "timing":
        return <Timing hospital={hospital} />;
      case "surgery":
        return <Surgery hospital={hospital} />;
      case "staff":
        return <DocStaff />;
      default:
        // Placeholder for tabs without components yet
        return <div className="p-4 text-gray-500">{tabs.find(t => t.key === activeTab)?.label} (Coming Soon)</div>;
    }
  };

  return (
  <div className="w-full bg-white">
      {/* Tabs - Matched to PageNav styling */}
      <div className="px-2 border-b border-secondary-grey100">
        <nav className="px-2 flex items-center gap-2 overflow-x-auto text-sm">
          {tabs.map((t) => {
            const active = activeTab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`whitespace-nowrap px-[6px] py-1 pb-2 border-b-2 transition-colors ${active
                  ? "border-blue-600 text-blue-primary250"
                  : "border-transparent text-secondary-grey300 hover:text-gray-900"
                  }`}
              >
                {t.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      <div className="bg-secondary-grey50 min-h-[500px]">{renderContent()}</div>

  {/* Drawers are triggered from section card icons; none mounted here. */}
    </div>
  );
};

export default HospitalNav;
