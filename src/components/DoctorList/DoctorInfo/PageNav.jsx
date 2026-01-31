import React, { useRef, useState } from "react";
import Info from "../../../SuperAdmin/pages/Doctors/DoctorList/DoctorInfo/Sections/Info";
import Clinical from "../../../SuperAdmin/pages/Doctors/DoctorList/DoctorInfo/Sections/Clinical";
import Consultation from "../../../SuperAdmin/pages/Doctors/DoctorList/DoctorInfo/Sections/Consultation";
import Staff from "../../../SuperAdmin/pages/Doctors/DoctorList/DoctorInfo/Sections/Staff";
import UniversalLoader from "@/components/UniversalLoader";

const PageNav = ({ doctor, selectedClinicId }) => {
  const [activeTab, setActiveTab] = useState("personal");
  const [pageLoading, setPageLoading] = useState(false);
  // Simple per-doctor cache to prevent repeat API calls on tab switches
  const cacheRef = useRef({
    info: {},
    clinical: {},
    consultationByClinic: {}, // { [clinicId]: consultationDetails }
  });

  const tabs = [
    { key: "personal", label: "Personal Info" },
    { key: "consultation", label: "Consultation Details" },
    { key: "clinical", label: "Clinical Details" },
    { key: "staff", label: "Staff Permissions" },
    { key: "billing", label: "Billing & Subscription" },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "personal":
        return (
          <Info
            doctor={doctor}
            onLoadingChange={setPageLoading}
            cache={cacheRef.current.info}
            updateCache={(upd) => { cacheRef.current.info = { ...cacheRef.current.info, ...upd }; }}
          />
        );
      case "clinical":
        return (
          <Clinical
            doctor={doctor}
            onLoadingChange={setPageLoading}
            cache={cacheRef.current.clinical}
            updateCache={(upd) => { cacheRef.current.clinical = { ...cacheRef.current.clinical, ...upd }; }}
          />
        );
      case "consultation":
        console.log('[PageNav] Consultation tab active. Rendering Consultation component.');
        return (
          <Consultation
            doctor={doctor}
            onLoadingChange={setPageLoading}
            clinicId={selectedClinicId}
            cache={cacheRef.current.consultationByClinic[selectedClinicId]}
            updateCache={(details) => {
              const cid = selectedClinicId;
              if (!cid) return;
              cacheRef.current.consultationByClinic[cid] = details;
            }}
          />
        );
      case "staff":
        // No universal loader for staff for now
        return <Staff doctor={doctor} />;
      case "billing":
        // No universal loader for billing for now
        return <div className="p-4 text-gray-500">Billing & Subscription (Coming Soon)</div>;
      default:
        return null;
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
                onClick={() => {
                  console.log('[PageNav] Tab clicked:', t.key);
                  setActiveTab(t.key);
                  // show loader only for tabs that fetch and report loading
                  if (t.key === 'personal') {
                    setPageLoading(true);
                  } else if (t.key === 'consultation') {
                    const cid = selectedClinicId;
                    const hasCached = cid && !!cacheRef.current.consultationByClinic[cid];
                    setPageLoading(!hasCached);
                  } else {
                    setPageLoading(false);
                  }
                }}
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
      <div className=" bg-secondary-grey50 relative min-h-[200px]">
        {pageLoading && (activeTab === 'personal' || activeTab === 'consultation' || activeTab === 'clinical') && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-10">
            <UniversalLoader size={28} />
          </div>
        )}
        {renderContent()}
      </div>
    </div>
  );
};

export default PageNav;
