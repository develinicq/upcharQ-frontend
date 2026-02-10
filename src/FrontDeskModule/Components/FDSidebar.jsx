import React, { useEffect, useState, useRef } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  HelpCircle,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  BookOpen,
  LifeBuoy,
  MessageSquarePlus,
  ExternalLink
} from "lucide-react";
import {
  logo,
  dashboardSelected,
  dashboardUnselect,
  doctorSelect,
  doctorUnselect,
  hospitalSelected,
  hospitalUnselect,
  patientUnselect,
  settingUnselect,
} from "../../../public/index.js";
import AvatarCircle from "../../components/AvatarCircle";
import HelpSupportDrawer from "../../SuperAdmin/components/HelpSupport/HelpSupportDrawer";
import RaiseQueryDrawer from "../../SuperAdmin/components/HelpSupport/RaiseQueryDrawer";
import FAQDrawer from "../../SuperAdmin/components/HelpSupport/FAQDrawer";

const FDSidebar = () => {
  const location = useLocation();
  const isSettingsRoute = location.pathname.startsWith("/fd/settings");
  const [openSettings, setOpenSettings] = useState(isSettingsRoute);

  useEffect(() => {
    if (isSettingsRoute) setOpenSettings(true);
  }, [isSettingsRoute]);

  // Drawer states
  const [helpOpen, setHelpOpen] = useState(false);
  const [queryOpen, setQueryOpen] = useState(false);
  const [faqOpen, setFaqOpen] = useState(false);

  // Help Menu Popover state
  const [showHelpMenu, setShowHelpMenu] = useState(false);
  const helpTriggerRef = useRef(null);
  const helpPopoverRef = useRef(null);

  // Close help menu on outside click
  useEffect(() => {
    const onClick = (e) => {
      if (
        showHelpMenu &&
        helpTriggerRef.current &&
        !helpTriggerRef.current.contains(e.target) &&
        helpPopoverRef.current &&
        !helpPopoverRef.current.contains(e.target)
      ) {
        setShowHelpMenu(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [showHelpMenu]);


  const menuItems = [
    { name: "Queue Management", iconSelected: patientUnselect, iconUnselected: patientUnselect, path: "/fd/queue", alt: "Queue" },
    { name: "Patients", iconSelected: doctorSelect, iconUnselected: doctorUnselect, path: "/fd/patients", alt: "Patients" },
    { name: "Calendar", iconSelected: hospitalSelected, iconUnselected: hospitalUnselect, path: "/fd/calendar", alt: "Calendar" },
    { name: "Settings", iconSelected: settingUnselect, iconUnselected: settingUnselect, path: "/fd/settings", alt: "Settings" },
  ];

  const settingsSubItems = [
    { label: "Clinic Details", to: "/fd/settings/clinics" },
    { label: "Consultation Details", to: "/fd/settings/consultation" },
    { label: "Staff Permissions", to: "/fd/settings/staff-permissions" },
  ];

  return (
    <div className="sidebar flex flex-col justify-between min-h-screen w-[210px] bg-white border-r border-[#D6D6D6]">
      <div>
        <div className="px-4 py-3">
          <img src={logo} alt="logo" className="w-[128px] h-auto" />
        </div>
        {/* Removed hospital selector card to match minimal sidebar design */}
        <nav>
          {menuItems.map((item) => {
            if (item.name !== "Settings") {
              return (
                <NavLink key={item.name} to={item.path} end={false} className={({ isActive }) =>
                  `flex items-center gap-[6px] py-3 px-4 h-[44px] w-full text-left transition-colors ${isActive ? "bg-[#2372EC] text-white border-l-[3px] border-[#96BFFF] " : "text-gray-800 hover:bg-gray-100"}`}>
                  {({ isActive }) => (<>
                    <img src={isActive ? item.iconSelected : item.iconUnselected} alt={item.alt} className="w-5 h-5" />
                    <span className="font-normal text-sm">{item.name}</span>
                  </>)}
                </NavLink>
              );
            }
            return (
              <div key="Settings" className="">
                <button type="button" onClick={() => setOpenSettings((v) => !v)} className={`w-full flex items-center justify-between py-3 px-4 h-[44px] transition-colors ${isSettingsRoute ? "bg-[#2372EC] text-white border-l-[3px] border-[#96BFFF]" : "text-gray-800 hover:bg-gray-100"}`}>
                  <span className="inline-flex items-center gap-[6px]">
                    <img src={settingUnselect} alt="Settings" className="w-5 h-5" />
                    <span className="font-normal text-sm">Settings</span>
                  </span>
                  {openSettings ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                {openSettings && (
                  <div className="ml-5 pl-3 border-l border-gray-200">
                    {settingsSubItems.map((s) => (
                      <NavLink key={s.to} to={s.to} className={({ isActive }) => `block text-sm px-3 py-2 my-[2px] rounded-sm ${isActive ? "bg-blue-50 text-gray-900" : "text-gray-700 hover:bg-gray-50"}`}>
                        {s.label}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      <div className="relative z-50">
        {showHelpMenu && (
          <div
            ref={helpPopoverRef}
            className="absolute left-full bottom-4 ml-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50"
          >
            <div
              className="px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-center gap-3 text-sm text-gray-700"
              onClick={() => {
                window.open("https://upchar-q-guide.com", "_blank");
                setShowHelpMenu(false);
              }}
            >
              <BookOpen size={16} className="text-gray-500" />
              <span>Upchar-Q Guide</span>
              <ExternalLink size={14} className="ml-auto text-gray-400" />
            </div>
            <div
              className="px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-center gap-3 text-sm text-gray-700"
              onClick={() => {
                setHelpOpen(true);
                setShowHelpMenu(false);
              }}
            >
              <LifeBuoy size={16} className="text-gray-500" />
              <span>Help & Support</span>
            </div>
            <div
              className="px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-center gap-3 text-sm text-gray-700"
              onClick={() => {
                setQueryOpen(true);
                setShowHelpMenu(false);
              }}
            >
              <MessageSquarePlus size={16} className="text-gray-500" />
              <span>Raise Queries</span>
            </div>
            <div
              className="px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-center gap-3 text-sm text-gray-700"
              onClick={() => {
                setFaqOpen(true);
                setShowHelpMenu(false);
              }}
            >
              <HelpCircle size={16} className="text-gray-500" />
              <span>FAQ's</span>
            </div>
          </div>
        )}

        <div
          ref={helpTriggerRef}
          className="px-4 py-3 border-t border-[#D6D6D6] flex justify-between items-center text-[#626060] cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => setShowHelpMenu(!showHelpMenu)}
        >
          <div className={`flex items-center gap-[6px] w-full text-left `}>
            <HelpCircle size={18} /> Help & Support
          </div>
          <div>
            {showHelpMenu ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          </div>
        </div>
      </div>

      <HelpSupportDrawer
        isOpen={helpOpen}
        onClose={() => setHelpOpen(false)}
      />
      <RaiseQueryDrawer
        isOpen={queryOpen}
        onClose={() => setQueryOpen(false)}
      />
      <FAQDrawer
        isOpen={faqOpen}
        onClose={() => setFaqOpen(false)}
      />
    </div>
  );
};

export default FDSidebar;
