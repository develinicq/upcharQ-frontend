import React, { useState } from "react";
import Details from "../../../SuperAdmin/pages/Hospitals/HospitalList/HospitalInfo/Sections/Details";
import Doctor from "../../../SuperAdmin/pages/Hospitals/HospitalList/HospitalInfo/Sections/Doctor";
import Timing from "../../../SuperAdmin/pages/Hospitals/HospitalList/HospitalInfo/Sections/Timing";
import Surgery from "../../../SuperAdmin/pages/Hospitals/HospitalList/HospitalInfo/Sections/Surgery";
import HosStaff from "../../../SuperAdmin/pages/Hospitals/HospitalList/HospitalInfo/Sections/HosStaff";
import BillingSubscription from "../../../SuperAdmin/pages/Hospitals/HospitalList/HospitalInfo/Sections/BillingSubscription";

const HospitalNav = ({ hospital }) => {
  const [activeTab, setActiveTab] = useState("details");

  const tabs = [
    { key: "details", label: "Account Details" },
    { key: "doctor", label: "Doctors" },
    { key: "timing", label: "Timing and Schedule" },
    { key: "surgery", label: "Surgeries" },
    { key: "staff", label: "Staff Permissions" },
    { key: "billing", label: "Billing & Subscription" },
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
        return <HosStaff hospital={hospital} />;
      case "billing":
        return <BillingSubscription hospital={hospital} />;
      default:
        return <div className="p-4 text-gray-500">{tabs.find(t => t.key === activeTab)?.label} (Coming Soon)</div>;
    }
  };

  return (
    <div className="w-full bg-white">
      {/* Tabs */}
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
    </div>
  );
};

export default HospitalNav;
